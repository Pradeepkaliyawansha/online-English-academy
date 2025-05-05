import Staff from '../models/Staff.js';

// Get all staff members
export const getAllStaff = async (req, res) => {
  try {
    const staff = await Staff.find();
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching staff data', 
      error: error.message 
    });
  }
};

// Get a single staff member by ID
export const getStaffById = async (req, res) => {
  try {
    const staff = await Staff.findById(req.params.id);
    if (!staff) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }
    res.status(200).json(staff);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching staff member', 
      error: error.message 
    });
  }
};

// Create a new staff member
export const createStaff = async (req, res) => {
  try {
    // Check if staff with the same email already exists
    const existingStaff = await Staff.findOne({ email: req.body.email });
    if (existingStaff) {
      return res.status(400).json({ 
        success: false, 
        message: 'Staff member with this email already exists' 
      });
    }
    
    const newStaff = new Staff(req.body);
    const savedStaff = await newStaff.save();
    
    res.status(201).json({
      success: true,
      message: 'Staff member created successfully',
      staff: savedStaff
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating staff member', 
      error: error.message 
    });
  }
};

// Update a staff member
export const updateStaff = async (req, res) => {
  try {
    // Check if staff exists
    const staffExists = await Staff.findById(req.params.id);
    if (!staffExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }
    
    // If email is being updated, check that it's not already in use
    if (req.body.email && req.body.email !== staffExists.email) {
      const emailInUse = await Staff.findOne({ email: req.body.email });
      if (emailInUse) {
        return res.status(400).json({ 
          success: false, 
          message: 'Email is already in use by another staff member' 
        });
      }
    }
    
    const updatedStaff = await Staff.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Staff member updated successfully',
      staff: updatedStaff
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating staff member', 
      error: error.message 
    });
  }
};

// Delete a staff member
export const deleteStaff = async (req, res) => {
  try {
    const staffToDelete = await Staff.findById(req.params.id);
    
    if (!staffToDelete) {
      return res.status(404).json({ 
        success: false, 
        message: 'Staff member not found' 
      });
    }
    
    await Staff.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Staff member deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting staff member', 
      error: error.message 
    });
  }
};

// Get staff statistics
export const getStaffStats = async (req, res) => {
  try {
    const totalStaff = await Staff.countDocuments();
    const departmentStats = await Staff.aggregate([
      {
        $group: {
          _id: "$department",
          count: { $sum: 1 }
        }
      }
    ]);
    
    const statusStats = await Staff.aggregate([
      {
        $group: {
          _id: "$status",
          count: { $sum: 1 }
        }
      }
    ]);
    
    res.status(200).json({
      totalStaff,
      departmentStats,
      statusStats
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching staff statistics', 
      error: error.message 
    });
  }
};
