import mongoose from 'mongoose';

const studentSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true
    },
    firstName: {
      type: String,
      required: true,
      trim: true
    },
    lastName: {
      type: String,
      required: true,
      trim: true
    },
    phoneNumber: {
      type: String,
      required: true,
      trim: true
    },
    nic: {
      type: String, // National Identity Card number
      required: true,
      trim: true,
      unique: true
    },
    birthday: {
      type: Date,
      required: true
    },
    gender: {
      type: String,
      enum: ['Male', 'Female', 'Other'],
      required: true
    }
  },
  { timestamps: true }
);

export default mongoose.model('Student', studentSchema);
