import Timetable from '../models/Timetable.js';

// Get all timetable entries
export const getAllTimetableEntries = async (req, res) => {
  try {
    const entries = await Timetable.find()
      .sort({ startTime: 1 });
    
    res.status(200).json(entries);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching timetable entries', 
      error: error.message 
    });
  }
};

// Get a single timetable entry by ID
export const getTimetableEntryById = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable entry not found' 
      });
    }
    
    res.status(200).json(entry);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching timetable entry', 
      error: error.message 
    });
  }
};

// Create a new timetable entry
export const createTimetableEntry = async (req, res) => {
  try {
    // Validate based on class type
    if (req.body.classType === 'physical' && !req.body.venue) {
      return res.status(400).json({
        success: false,
        message: 'Venue is required for physical classes'
      });
    }
    
    if (req.body.classType === 'online' && !req.body.onlineLink) {
      return res.status(400).json({
        success: false,
        message: 'Online link is required for online classes'
      });
    }

    // Create new entry
    const newEntry = new Timetable(req.body);
    const savedEntry = await newEntry.save();
    
    res.status(201).json({
      success: true,
      message: 'Timetable entry created successfully',
      timetableEntry: savedEntry
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating timetable entry', 
      error: error.message 
    });
  }
};

// Update a timetable entry
export const updateTimetableEntry = async (req, res) => {
  try {
    // Check if entry exists
    const entry = await Timetable.findById(req.params.id);
    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable entry not found' 
      });
    }
    
    // Validate based on class type
    if (req.body.classType === 'physical' && !req.body.venue) {
      return res.status(400).json({
        success: false,
        message: 'Venue is required for physical classes'
      });
    }
    
    if (req.body.classType === 'online' && !req.body.onlineLink) {
      return res.status(400).json({
        success: false,
        message: 'Online link is required for online classes'
      });
    }
    
    // Update entry
    const updatedEntry = await Timetable.findByIdAndUpdate(
      req.params.id,
      req.body,
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Timetable entry updated successfully',
      timetableEntry: updatedEntry
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating timetable entry', 
      error: error.message 
    });
  }
};

// Delete a timetable entry
export const deleteTimetableEntry = async (req, res) => {
  try {
    const entry = await Timetable.findById(req.params.id);
    
    if (!entry) {
      return res.status(404).json({ 
        success: false, 
        message: 'Timetable entry not found' 
      });
    }
    
    await Timetable.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Timetable entry deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting timetable entry', 
      error: error.message 
    });
  }
};
