import Payment from '../models/Payment.js';
import Staff from '../models/Staff.js';

// Create a new salary payment
export const createSalaryPayment = async (req, res) => {
  try {
    const { 
      staffId, 
      amount, 
      paymentMethod, 
      bankName, 
      accountNumber, 
      reference, 
      notes, 
      paymentDate 
    } = req.body;
    
    // Verify staff exists
    const staff = await Staff.findById(staffId);
    if (!staff) {
      return res.status(404).json({
        success: false,
        message: 'Staff member not found'
      });
    }
    
    // Create payment record
    const payment = new Payment({
      staffId,
      staffName: staff.name,
      role: staff.role,
      department: staff.department,
      amount,
      paymentDate,
      paymentMethod,
      bankName: paymentMethod === 'bank_transfer' ? bankName : undefined,
      accountNumber: paymentMethod === 'bank_transfer' ? accountNumber : undefined,
      reference,
      notes,
      processedBy: req.user.id
    });
    
    await payment.save();
    
    return res.status(201).json({
      success: true,
      message: 'Salary payment recorded successfully',
      payment
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error processing salary payment',
      error: error.message
    });
  }
};

// Get all salary payment history
export const getSalaryPaymentHistory = async (req, res) => {
  try {
    const payments = await Payment.find().sort({ paymentDate: -1 });
    
    return res.status(200).json(payments);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching salary payment history',
      error: error.message
    });
  }
};

// Get payment history for a specific staff member
export const getStaffPaymentHistory = async (req, res) => {
  try {
    const { staffId } = req.params;
    
    const payments = await Payment.find({ staffId }).sort({ paymentDate: -1 });
    
    return res.status(200).json(payments);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching staff payment history',
      error: error.message
    });
  }
};

// Update a salary payment
export const updateSalaryPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    const { 
      amount, 
      paymentMethod, 
      bankName, 
      accountNumber, 
      reference, 
      notes, 
      paymentDate 
    } = req.body;
    
    // Verify payment exists
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }
    
    // Update payment details
    payment.amount = amount || payment.amount;
    payment.paymentMethod = paymentMethod || payment.paymentMethod;
    payment.bankName = paymentMethod === 'bank_transfer' ? bankName : undefined;
    payment.accountNumber = paymentMethod === 'bank_transfer' ? accountNumber : undefined;
    payment.reference = reference || payment.reference;
    payment.notes = notes || payment.notes;
    payment.paymentDate = paymentDate || payment.paymentDate;
    payment.updatedBy = req.user.id;
    payment.updatedAt = new Date();
    
    await payment.save();
    
    return res.status(200).json({
      success: true,
      message: 'Salary payment updated successfully',
      payment
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating salary payment',
      error: error.message
    });
  }
};

// Delete a salary payment
export const deleteSalaryPayment = async (req, res) => {
  try {
    const { paymentId } = req.params;
    
    // Verify payment exists
    const payment = await Payment.findById(paymentId);
    if (!payment) {
      return res.status(404).json({
        success: false,
        message: 'Payment record not found'
      });
    }
    
    // Delete the payment
    await Payment.findByIdAndDelete(paymentId);
    
    return res.status(200).json({
      success: true,
      message: 'Salary payment deleted successfully'
    });
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error deleting salary payment',
      error: error.message
    });
  }
};
