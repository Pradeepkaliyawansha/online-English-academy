import mongoose from 'mongoose';

const courseSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    lecturer: {
      type: String,
      required: true,
    },
    duration: {
      type: String,
      required: true,
    },
    startDate: {
      type: String,
      required: true,
    },
    price: {
      type: String,
      required: true,
    },
    description: {
      type: String,
      required: true,
    },
    image: {
      type: String,
      default: null
    },
    status: {
      type: String,
      enum: ['Active', 'Completed', 'Canceled', 'Upcoming'],
      default: 'Upcoming',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Course', courseSchema);
