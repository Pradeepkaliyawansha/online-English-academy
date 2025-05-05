import Student from '../models/Student.js';
import User from '../models/User.js';

// Get student profile
export const getStudentProfile = async (req, res) => {
  try {
    // Get the user ID from the authenticated user
    const userId = req.user.userId;

    // Find the student profile associated with this user ID
    const student = await Student.findOne({ userId });

    if (!student) {
      // Return default values if profile doesn't exist yet
      return res.status(200).json({
        firstName: '',
        lastName: '',
        phoneNumber: '',
        nic: '',
        birthday: '',
        gender: ''
      });
    }

    // Format birthday for frontend
    const formattedStudent = {
      firstName: student.firstName,
      lastName: student.lastName,
      phoneNumber: student.phoneNumber,
      nic: student.nic,
      birthday: student.birthday.toISOString().split('T')[0], // Format as YYYY-MM-DD
      gender: student.gender
    };

    res.status(200).json(formattedStudent);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student profile',
      error: error.message
    });
  }
};

// Create or update student profile
export const updateStudentProfile = async (req, res) => {
  try {
    const { firstName, lastName, phoneNumber, nic, birthday, gender } = req.body;
    const userId = req.user.userId;

    // Find the existing student profile
    let student = await Student.findOne({ userId });
    
    // Validate required fields
    if (!phoneNumber || !nic || !birthday || !gender) {
      return res.status(400).json({
        success: false,
        message: 'Phone number, NIC, birthday, and gender are required'
      });
    }

    // Check if NIC is already in use by another student
    const existingStudent = await Student.findOne({ 
      nic, 
      userId: { $ne: userId } // Exclude the current user
    });

    if (existingStudent) {
      return res.status(400).json({
        success: false,
        message: 'NIC is already registered to another student'
      });
    }
    
    // Get user info to ensure we have the name data
    const user = await User.findById(userId);
    if (!user) {
      return res.status(404).json({
        success: false,
        message: 'User not found'
      });
    }

    // Extract first and last name from user's full name for use as fallbacks
    const nameParts = user.name.split(' ');
    const userFirstName = nameParts[0] || 'Unknown';
    const userLastName = nameParts.length > 1 ? nameParts.slice(1).join(' ') : 'Unknown';

    if (student) {
      // Update existing profile with the fields sent in the request
      student.phoneNumber = phoneNumber;
      student.nic = nic;
      student.birthday = new Date(birthday);
      student.gender = gender;

      // Ensure firstName and lastName fields are always set
      // If not provided in the request, use existing values or fallback to user model values
      student.firstName = firstName || student.firstName || userFirstName;
      student.lastName = lastName || student.lastName || userLastName;

      await student.save();
    } else {
      // Create new profile using all available data
      student = new Student({
        userId,
        firstName: firstName || userFirstName,
        lastName: lastName || userLastName,
        phoneNumber,
        nic,
        birthday: new Date(birthday),
        gender
      });

      await student.save();
    }

    res.status(200).json({
      success: true,
      message: 'Student profile updated successfully',
      student: {
        firstName: student.firstName,
        lastName: student.lastName,
        phoneNumber: student.phoneNumber,
        nic: student.nic,
        birthday: student.birthday.toISOString().split('T')[0],
        gender: student.gender
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error updating student profile',
      error: error.message
    });
  }
};

// Get student statistics
export const getStudentStats = async (req, res) => {
  try {
    // This function already exists but adding here for completeness
    // In a real application, you would query the database for actual stats
    
    res.status(200).json({
      enrolledCourses: 0,
      pendingAssignments: 0,
      upcomingExams: 0,
      completedCourses: 0
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching student statistics',
      error: error.message
    });
  }
};
