import QuizAttempt from "../models/QuizAttempt.js";
import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";

// Start a new quiz attempt
export const startQuizAttempt = async (req, res) => {
  try {
    const { quizId, courseId } = req.body;

    // Verify quiz exists and is published
    const quiz = await Quiz.findOne({ _id: quizId, status: "Published" });
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found or not published",
      });
    }

    // Verify course exists
    const course = await Course.findById(courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Check if the quiz belongs to the course
    if (quiz.courseId.toString() !== courseId) {
      return res.status(400).json({
        success: false,
        message: "Quiz does not belong to the specified course",
      });
    }

    // Check if there's an in-progress attempt already
    const existingAttempt = await QuizAttempt.findOne({
      quizId,
      studentId: req.user._id,
      status: "In Progress",
    });

    if (existingAttempt) {
      return res.status(200).json({
        success: true,
        message: "Quiz attempt already in progress",
        attempt: existingAttempt,
      });
    }

    // Create a new attempt
    const newAttempt = new QuizAttempt({
      quizId,
      courseId,
      studentId: req.user._id,
      totalMarks: quiz.totalMarks,
      startTime: new Date(),
    });

    const savedAttempt = await newAttempt.save();

    // Return a version of the quiz without answers for the student
    const quizForStudent = {
      ...quiz.toObject(),
      questions: quiz.questions.map((q) => ({
        question: q.question,
        options: q.options,
        marks: q.marks,
        _id: q._id,
      })),
    };

    res.status(201).json({
      success: true,
      message: "Quiz attempt started successfully",
      attempt: savedAttempt,
      quiz: quizForStudent,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error starting quiz attempt",
      error: error.message,
    });
  }
};

// Submit answers for a quiz attempt
export const submitQuizAttempt = async (req, res) => {
  try {
    const { attemptId, answers } = req.body;

    // Find the attempt
    const attempt = await QuizAttempt.findById(attemptId);
    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    // Check if this is the student's own attempt
    if (attempt.studentId.toString() !== req.user._id.toString()) {
      return res.status(403).json({
        success: false,
        message: "You are not authorized to submit this quiz attempt",
      });
    }

    // Check if the attempt is already completed
    if (attempt.status !== "In Progress") {
      return res.status(400).json({
        success: false,
        message: "This quiz attempt is already completed",
      });
    }

    // Get the quiz to check the answers
    const quiz = await Quiz.findById(attempt.quizId);
    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Process and grade the answers
    const gradedAnswers = [];
    let totalScore = 0;

    for (const answer of answers) {
      const question = quiz.questions[answer.questionIndex];

      if (!question) {
        return res.status(400).json({
          success: false,
          message: `Invalid question index: ${answer.questionIndex}`,
        });
      }

      const isCorrect = answer.selectedOption === question.correctAnswer;
      const marks = isCorrect ? question.marks : 0;
      totalScore += marks;

      gradedAnswers.push({
        questionIndex: answer.questionIndex,
        selectedOption: answer.selectedOption,
        isCorrect,
        marks,
      });
    }

    // Calculate if the student passed the quiz
    const isPassed = totalScore >= quiz.passingMarks;

    // Update the attempt
    attempt.answers = gradedAnswers;
    attempt.score = totalScore;
    attempt.status = "Completed";
    attempt.endTime = new Date();
    attempt.isPassed = isPassed;

    const updatedAttempt = await attempt.save();

    res.status(200).json({
      success: true,
      message: "Quiz attempt submitted successfully",
      attempt: updatedAttempt,
      isPassed,
      score: totalScore,
      totalMarks: quiz.totalMarks,
      passingMarks: quiz.passingMarks,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error submitting quiz attempt",
      error: error.message,
    });
  }
};

// Get quiz attempts for a student
export const getStudentQuizAttempts = async (req, res) => {
  try {
    const attempts = await QuizAttempt.find({
      studentId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quiz attempts",
      error: error.message,
    });
  }
};

// Get quiz attempts for a specific course
export const getCourseQuizAttempts = async (req, res) => {
  try {
    const { courseId } = req.params;

    const attempts = await QuizAttempt.find({
      courseId,
      studentId: req.user._id,
    }).sort({ createdAt: -1 });

    res.status(200).json(attempts);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching course quiz attempts",
      error: error.message,
    });
  }
};

// Get quiz attempt details by ID
export const getQuizAttemptById = async (req, res) => {
  try {
    const attempt = await QuizAttempt.findById(req.params.id);

    if (!attempt) {
      return res.status(404).json({
        success: false,
        message: "Quiz attempt not found",
      });
    }

    // Students can only view their own attempts
    if (
      req.user.role === "Student" &&
      attempt.studentId.toString() !== req.user._id.toString()
    ) {
      return res.status(403).json({
        success: false,
        message: "Access denied: You can only view your own quiz attempts",
      });
    }

    res.status(200).json(attempt);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quiz attempt",
      error: error.message,
    });
  }
};
