import Course from '../models/Course.js';

// Get all public courses
export const getAllPublicCourses = async (req, res) => {
  try {
    // Only get active or upcoming courses
    const courses = await Course.find({
      status: { $in: ['Active', 'Upcoming'] }
    }).sort({ startDate: 1 });
    
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching course data', 
      error: error.message 
    });
  }
};

// Get featured courses
export const getFeaturedCourses = async (req, res) => {
  try {
    // Implement a simple feature system - return newest courses for now
    // In a real app, you'd have a "featured" flag in your schema
    const featuredCourses = await Course.find({
      status: { $in: ['Active', 'Upcoming'] }
    }).sort({ createdAt: -1 }).limit(3);
    
    res.status(200).json(featuredCourses);
  } catch (error) {
    res.status(500).json({
      success: false,
      message: 'Error fetching featured courses',
      error: error.message
    });
  }
};

// Get a single course by ID
export const getPublicCourseById = async (req, res) => {
  try {
    const course = await Course.findById(req.params.id);
    if (!course) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
    res.status(200).json(course);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching course', 
      error: error.message 
    });
  }
};
