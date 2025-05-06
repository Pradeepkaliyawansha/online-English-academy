import mongoose from "mongoose";

const questionSchema = new mongoose.Schema({
  question: {
    type: String,
    required: true,
    trim: true,
  },
  options: {
    type: [String],
    required: true,
    validate: {
      validator: function (v) {
        return v.length >= 2; // At least 2 options required
      },
      message: "At least 2 options are required for each question",
    },
  },
  correctAnswer: {
    type: Number, // Index of the correct option
    required: true,
    min: 0,
  },
  marks: {
    type: Number,
    required: true,
    min: 1,
    default: 1,
  },
});

const quizSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Course",
      required: true,
    },
    description: {
      type: String,
      required: true,
      trim: true,
    },
    timeLimit: {
      type: Number, // in minutes
      required: true,
      min: 1,
    },
    totalMarks: {
      type: Number,
      required: true,
    },
    passingMarks: {
      type: Number,
      required: true,
    },
    questions: [questionSchema],
    status: {
      type: String,
      enum: ["Draft", "Published"],
      default: "Draft",
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: false,
    },
  },
  {
    timestamps: true,
  }
);

// Calculate total marks before saving
quizSchema.pre("save", function (next) {
  this.totalMarks = this.questions.reduce(
    (sum, question) => sum + question.marks,
    0
  );
  next();
});

const Quiz = mongoose.model("Quiz", quizSchema);

export default Quiz;
