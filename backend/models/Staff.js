import mongoose from 'mongoose';

const staffSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: true,
    },
    department: {
      type: String,
      required: true,
      enum: ['Academic', 'Administration', 'Examination', 'Finance', 'HR'],
    },
    email: {
      type: String,
      required: true,
      unique: true,
    },
    phoneNumber: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    salary: {
      type: Number,
      required: true,
      min: 0,
    },
    status: {
      type: String,
      enum: ['Active', 'On Leave', 'Probation', 'Terminated'],
      default: 'Active',
    },
  },
  { timestamps: true }
);

export default mongoose.model('Staff', staffSchema);
