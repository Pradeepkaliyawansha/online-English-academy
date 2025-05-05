import mongoose from 'mongoose';

const examSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true
    },
    course: {
      type: String,
      required: true,
      trim: true
    },
    description: {
      type: String,
      required: true,
      trim: true
    },
    examDate: {
      type: String,
      required: true
    },
    startTime: {
      type: String,
      required: true
    },
    endTime: {
      type: String,
      required: true
    },
    duration: {
      type: String,
      required: true
    },
    totalMarks: {
      type: String,
      required: true
    },
    passingMarks: {
      type: String,
      required: true
    },
    examUrl: {
      type: String,
      required: true,
      trim: true
    },
    status: {
      type: String,
      enum: ['Draft', 'Published'],
      default: 'Draft'
    },
    createdBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: false
    }
  },
  {
    timestamps: true
  }
);

const Exam = mongoose.model('Exam', examSchema);

export default Exam;
