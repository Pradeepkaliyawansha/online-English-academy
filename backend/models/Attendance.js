import mongoose from 'mongoose';

const attendanceSchema = new mongoose.Schema(
  {
    staffId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Staff',
      required: true
    },
    staffName: {
      type: String,
      required: true
    },
    date: {
      type: String,
      required: true
    },
    status: {
      type: String,
      enum: ['Present', 'Absent', 'Late'],
      default: 'Present',
      required: true
    },
    timeIn: {
      type: String,
      required: function() {
        return this.status !== 'Absent';
      }
    },
    timeOut: {
      type: String,
      required: function() {
        return this.status !== 'Absent';
      }
    },
    notes: {
      type: String
    }
  },
  { timestamps: true }
);

// Compound index to ensure no duplicate attendance records for the same staff on same day
attendanceSchema.index({ staffId: 1, date: 1 }, { unique: true });

export default mongoose.model('Attendance', attendanceSchema);
