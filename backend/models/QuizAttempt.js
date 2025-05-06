import mongoose from "mongoose";

const answerSchema = new mongoose.Schema({
  questionIndex: {
    type: Number,
    required: true,
  },
  selectedOption: {
    type: Number,
    required: true,
  },
  isCorrect: {
    type: Boolean,
    required: true,
  },
  marks: {
    type: Number,
    required: true,
  },
});

const quizAttemptSchema = new mongoose.Schema(
  {
    quizId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Quiz",
      required: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    studentId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },
    startTime: {
      type: Date,
      required: true,
      default: Date.now,
    },
    endTime: {
      type: Date,
    },
    answers: [answerSchema],
    score: {
      type: Number,
      default: 0,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    status: {
      type: String,
      enum: ["In Progress", "Completed", "Timed Out"],
      default: "In Progress",
    },
    isPassed: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

const QuizAttempt = mongoose.model("QuizAttempt", quizAttemptSchema);

export default QuizAttempt;
