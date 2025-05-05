import Attendance from '../models/Attendance.js';
import Staff from '../models/Staff.js';

// Get attendance records for a specific date
export const getAttendanceByDate = async (req, res) => {
  try {
    const { date } = req.query;
    
    if (!date) {
      return res.status(400).json({
        success: false,
        message: 'Date parameter is required'
      });
    }
    
    const attendanceRecords = await Attendance.find({ date }).sort('staffName');
    
    return res.status(200).json(attendanceRecords);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching attendance records',
      error: error.message
    });
  }
};

// Mark attendance for a single staff member
export const markAttendance = async (req, res) => {
  try {
    const { staffId, staffName, date, status, timeIn, timeOut, notes } = req.body;
    
    // Check if an attendance record already exists for this staff on this date
    const existingRecord = await Attendance.findOne({ staffId, date });
    
    if (existingRecord) {
      // Update existing record
      existingRecord.status = status;
      existingRecord.timeIn = status !== 'Absent' ? timeIn : null;
      existingRecord.timeOut = status !== 'Absent' ? timeOut : null;
      existingRecord.notes = notes;
      
      const updatedRecord = await existingRecord.save();
      return res.status(200).json({
        success: true,
        message: 'Attendance updated successfully',
        attendance: updatedRecord
      });
    }
    
    // Create new record
    const newAttendance = new Attendance({
      staffId,
      staffName,
      date,
      status,
      timeIn: status !== 'Absent' ? timeIn : null,
      timeOut: status !== 'Absent' ? timeOut : null,
      notes
    });
    
    const savedAttendance = await newAttendance.save();
    
    return res.status(201).json({
      success: true,
      message: 'Attendance marked successfully',
      attendance: savedAttendance
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error marking attendance',
      error: error.message
    });
  }
};

// Mark attendance for multiple staff members in batch
export const markBatchAttendance = async (req, res) => {
  try {
    const { attendance } = req.body;
    
    if (!attendance || !Array.isArray(attendance) || attendance.length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Valid attendance array is required'
      });
    }
    
    // Process each attendance record
    const results = [];
    
    for (const record of attendance) {
      const { staffId, staffName, date, status, timeIn, timeOut, notes } = record;
      
      // Check if staff exists
      const staffExists = await Staff.findById(staffId);
      
      if (!staffExists) {
        results.push({
          success: false,
          staffId,
          message: 'Staff member not found'
        });
        continue;
      }
      
      try {
        // Check if an attendance record already exists
        const existingRecord = await Attendance.findOne({ staffId, date });
        
        if (existingRecord) {
          // Update existing record
          existingRecord.status = status;
          existingRecord.timeIn = status !== 'Absent' ? timeIn : null;
          existingRecord.timeOut = status !== 'Absent' ? timeOut : null;
          existingRecord.notes = notes;
          
          const updatedRecord = await existingRecord.save();
          results.push(updatedRecord);
        } else {
          // Create new record
          const newAttendance = new Attendance({
            staffId,
            staffName,
            date,
            status,
            timeIn: status !== 'Absent' ? timeIn : null,
            timeOut: status !== 'Absent' ? timeOut : null,
            notes
          });
          
          const savedAttendance = await newAttendance.save();
          results.push(savedAttendance);
        }
      } catch (recordError) {
        results.push({
          success: false,
          staffId,
          message: `Error processing record: ${recordError.message}`
        });
      }
    }
    
    // Get all updated attendance records for the date
    const date = attendance[0]?.date;
    const updatedRecords = await Attendance.find({ date }).sort('staffName');
    
    return res.status(200).json(updatedRecords);
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error processing batch attendance',
      error: error.message
    });
  }
};

// Update a specific attendance record by ID
export const updateAttendance = async (req, res) => {
  try {
    const { id } = req.params;
    const { status, timeIn, timeOut, notes } = req.body;
    
    const attendanceRecord = await Attendance.findById(id);
    
    if (!attendanceRecord) {
      return res.status(404).json({
        success: false,
        message: 'Attendance record not found'
      });
    }
    
    // Update fields
    attendanceRecord.status = status || attendanceRecord.status;
    attendanceRecord.timeIn = status !== 'Absent' ? (timeIn || attendanceRecord.timeIn) : null;
    attendanceRecord.timeOut = status !== 'Absent' ? (timeOut || attendanceRecord.timeOut) : null;
    attendanceRecord.notes = notes !== undefined ? notes : attendanceRecord.notes;
    
    const updatedRecord = await attendanceRecord.save();
    
    return res.status(200).json({
      success: true,
      message: 'Attendance record updated successfully',
      attendance: updatedRecord
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error updating attendance record',
      error: error.message
    });
  }
};

// Get attendance statistics for a date range
export const getAttendanceStats = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate parameters are required'
      });
    }
    
    // Find all attendance records within the date range
    const records = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    // Calculate statistics
    const stats = {
      total: records.length,
      present: records.filter(record => record.status === 'Present').length,
      absent: records.filter(record => record.status === 'Absent').length,
      late: records.filter(record => record.status === 'Late').length,
      dateRange: {
        start: startDate,
        end: endDate
      }
    };
    
    return res.status(200).json({
      success: true,
      stats
    });
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching attendance statistics',
      error: error.message
    });
  }
};

// Get attendance summary for all staff members in a date range
export const getAttendanceSummary = async (req, res) => {
  try {
    const { startDate, endDate } = req.query;
    
    if (!startDate || !endDate) {
      return res.status(400).json({
        success: false,
        message: 'startDate and endDate parameters are required'
      });
    }
    
    // Get all staff members
    const allStaff = await Staff.find({}, 'name');
    
    // Find all attendance records within the date range
    const attendanceRecords = await Attendance.find({
      date: {
        $gte: startDate,
        $lte: endDate
      }
    });
    
    // Calculate total working days in the range
    const start = new Date(startDate);
    const end = new Date(endDate);
    const daysDiff = Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1;
    
    // Calculate working days (excluding weekends)
    let workingDays = 0;
    for (let i = 0; i < daysDiff; i++) {
      const currentDate = new Date(start);
      currentDate.setDate(start.getDate() + i);
      const dayOfWeek = currentDate.getDay();
      // Skip weekends (0 is Sunday, 6 is Saturday)
      if (dayOfWeek !== 0 && dayOfWeek !== 6) {
        workingDays++;
      }
    }
    
    // Prepare summary data
    const summaryData = allStaff.map(staff => {
      // Filter attendance records for this staff member
      const staffRecords = attendanceRecords.filter(record => 
        record.staffId.toString() === staff._id.toString()
      );
      
      // Count different attendance statuses
      const presentCount = staffRecords.filter(record => record.status === 'Present').length;
      const absentCount = staffRecords.filter(record => record.status === 'Absent').length;
      const lateCount = staffRecords.filter(record => record.status === 'Late').length;
      
      // Calculate attendance percentage
      const presentPercentage = workingDays > 0 
        ? Math.round(((presentCount + lateCount) / workingDays) * 100)
        : 0;
      
      return {
        staffId: staff._id,
        staffName: staff.name,
        totalDays: workingDays,
        present: presentCount,
        absent: absentCount,
        late: lateCount,
        presentPercentage
      };
    });
    
    return res.status(200).json(summaryData);
    
  } catch (error) {
    return res.status(500).json({
      success: false,
      message: 'Error fetching attendance summary',
      error: error.message
    });
  }
};
