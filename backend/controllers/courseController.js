import Course from '../models/Course.js';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Get all courses
export const getAllCourses = async (req, res) => {
  try {
    const courses = await Course.find();
    res.status(200).json(courses);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching course data', 
      error: error.message
    });
  }
};

// Get a single course by ID
export const getCourseById = async (req, res) => {
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

// Create a new course
export const createCourse = async (req, res) => {
  try {
    // Check if course with the same name already exists
    const existingCourse = await Course.findOne({ name: req.body.name });
    if (existingCourse) {
      return res.status(400).json({ 
        success: false, 
        message: 'Course with this name already exists' 
      });
    }
    
    const courseData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : null
    };
    
    const newCourse = new Course(courseData);
    const savedCourse = await newCourse.save();
    
    res.status(201).json({
      success: true,
      message: 'Course created successfully',
      course: savedCourse
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating course', 
      error: error.message 
    });
  }
};

// Update a course
export const updateCourse = async (req, res) => {
  try {
    // Check if course exists
    const courseExists = await Course.findById(req.params.id);
    if (!courseExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
    
    // If name is being updated, check that it's not already in use
    if (req.body.name && req.body.name !== courseExists.name) {
      const nameInUse = await Course.findOne({ name: req.body.name });
      if (nameInUse) {
        return res.status(400).json({ 
          success: false, 
          message: 'Course name is already in use by another course' 
        });
      }
    }
    
    const courseData = {
      ...req.body,
      image: req.file ? `/uploads/${req.file.filename}` : courseExists.image
    };
    
    const updatedCourse = await Course.findByIdAndUpdate(
      req.params.id, 
      courseData, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Course updated successfully',
      course: updatedCourse
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating course', 
      error: error.message 
    });
  }
};

// Delete a course
export const deleteCourse = async (req, res) => {
  try {
    const courseToDelete = await Course.findById(req.params.id);
    
    if (!courseToDelete) {
      return res.status(404).json({ 
        success: false, 
        message: 'Course not found' 
      });
    }
    
    await Course.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Course deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting course', 
      error: error.message 
    });
  }
};
