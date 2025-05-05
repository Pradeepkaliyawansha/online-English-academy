import mongoose from 'mongoose';

const paymentSchema = new mongoose.Schema(
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
    role: {
      type: String,
      required: true
    },
    department: {
      type: String,
      required: true
    },
    amount: {
      type: Number,
      required: true
    },
    paymentDate: {
      type: String,
      required: true
    },
    paymentMethod: {
      type: String,
      required: true,
      enum: ['bank_transfer', 'check', 'cash']
    },
    bankName: {
      type: String,
      required: function() {
        return this.paymentMethod === 'bank_transfer';
      }
    },
    accountNumber: {
      type: String,
      required: function() {
        return this.paymentMethod === 'bank_transfer';
      }
    },
    reference: {
      type: String,
      required: true
    },
    notes: {
      type: String
    },
    processedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User'
    }
  },
  {
    timestamps: true
  }
);

const Payment = mongoose.model('Payment', paymentSchema);

export default Payment;
