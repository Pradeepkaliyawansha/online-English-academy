import mongoose from 'mongoose';

const timetableSchema = new mongoose.Schema(
  {
    lectureName: {
      type: String,
      required: true,
    },
    startTime: {
      type: String,
      required: true,
    },
    endTime: {
      type: String,
      required: true,
    },
    classType: {
      type: String,
      enum: ['physical', 'online'],
      required: true,
    },
    venue: {
      type: String,
      required: function() {
        return this.classType === 'physical';
      },
    },
    onlineLink: {
      type: String,
      required: function() {
        return this.classType === 'online';
      },
    },
    courseId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Course',
    },
    lecturerId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
    }
  },
  { timestamps: true }
);

export default mongoose.model('Timetable', timetableSchema);
