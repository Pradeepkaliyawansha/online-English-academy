import Quiz from "../models/Quiz.js";
import Course from "../models/Course.js";

// Get all quizzes (for admin and exam manager)
export const getAllQuizzes = async (req, res) => {
  try {
    // Add filter support for student role (only show published quizzes)
    const filter = req.user?.role === "Student" ? { status: "Published" } : {};

    // Add course filter if provided
    if (req.query.courseId) {
      filter.courseId = req.query.courseId;
    }

    const quizzes = await Quiz.find(filter).sort({ createdAt: -1 });

    res.status(200).json(quizzes);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quizzes",
      error: error.message,
    });
  }
};

// Get a single quiz by ID
export const getQuizById = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Check if student is trying to access a draft quiz
    if (req.user?.role === "Student" && quiz.status !== "Published") {
      return res.status(403).json({
        success: false,
        message: "Access denied: This quiz is not published yet",
      });
    }

    res.status(200).json(quiz);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error fetching quiz",
      error: error.message,
    });
  }
};

// Create a new quiz
export const createQuiz = async (req, res) => {
  try {
    // Verify course exists
    const course = await Course.findById(req.body.courseId);
    if (!course) {
      return res.status(404).json({
        success: false,
        message: "Course not found",
      });
    }

    // Add the current user as creator if available
    const quizData = {
      ...req.body,
      createdBy: req.user?._id,
    };

    const newQuiz = new Quiz(quizData);
    const savedQuiz = await newQuiz.save();

    res.status(201).json({
      success: true,
      message: "Quiz created successfully",
      quiz: savedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error creating quiz",
      error: error.message,
    });
  }
};

// Update a quiz
export const updateQuiz = async (req, res) => {
  try {
    // Check if quiz exists
    const quizExists = await Quiz.findById(req.params.id);
    if (!quizExists) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // If courseId is being changed, verify new course exists
    if (
      req.body.courseId &&
      req.body.courseId !== quizExists.courseId.toString()
    ) {
      const course = await Course.findById(req.body.courseId);
      if (!course) {
        return res.status(404).json({
          success: false,
          message: "Course not found",
        });
      }
    }

    // Update the quiz
    const updatedQuiz = await Quiz.findByIdAndUpdate(req.params.id, req.body, {
      new: true,
      runValidators: true,
    });

    res.status(200).json({
      success: true,
      message: "Quiz updated successfully",
      quiz: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating quiz",
      error: error.message,
    });
  }
};

// Delete a quiz
export const deleteQuiz = async (req, res) => {
  try {
    const quizToDelete = await Quiz.findById(req.params.id);

    if (!quizToDelete) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    await Quiz.findByIdAndDelete(req.params.id);

    res.status(200).json({
      success: true,
      message: "Quiz deleted successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error deleting quiz",
      error: error.message,
    });
  }
};

// Toggle quiz status (publish/unpublish)
export const toggleQuizStatus = async (req, res) => {
  try {
    const quiz = await Quiz.findById(req.params.id);

    if (!quiz) {
      return res.status(404).json({
        success: false,
        message: "Quiz not found",
      });
    }

    // Toggle the status
    const newStatus = quiz.status === "Published" ? "Draft" : "Published";

    const updatedQuiz = await Quiz.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    );

    res.status(200).json({
      success: true,
      message: `Quiz ${
        newStatus === "Published" ? "published" : "unpublished"
      } successfully`,
      quiz: updatedQuiz,
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Error updating quiz status",
      error: error.message,
    });
  }
};
