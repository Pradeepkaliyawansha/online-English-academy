import Exam from '../models/Exam.js';

// Get all exams
export const getAllExams = async (req, res) => {
  try {
    // Add filter support for student role (only show published exams)
    const filter = req.user?.role === 'Student' ? { status: 'Published' } : {};
    const exams = await Exam.find(filter).sort({ createdAt: -1 });
    
    res.status(200).json(exams);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching exams', 
      error: error.message 
    });
  }
};

// Get a single exam by ID
export const getExamById = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }
    
    // Check if student is trying to access a draft exam
    if (req.user?.role === 'Student' && exam.status !== 'Published') {
      return res.status(403).json({
        success: false,
        message: 'Access denied: This exam is not published yet'
      });
    }
    
    res.status(200).json(exam);
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error fetching exam', 
      error: error.message 
    });
  }
};

// Create a new exam
export const createExam = async (req, res) => {
  try {
    // Add the current user as creator if available
    const examData = {
      ...req.body,
      createdBy: req.user?._id
    };
    
    const newExam = new Exam(examData);
    const savedExam = await newExam.save();
    
    res.status(201).json({
      success: true,
      message: 'Exam created successfully',
      exam: savedExam
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error creating exam', 
      error: error.message 
    });
  }
};

// Update an exam
export const updateExam = async (req, res) => {
  try {
    // Check if exam exists
    const examExists = await Exam.findById(req.params.id);
    if (!examExists) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }
    
    // Update the exam
    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id, 
      req.body, 
      { new: true, runValidators: true }
    );
    
    res.status(200).json({
      success: true,
      message: 'Exam updated successfully',
      exam: updatedExam
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating exam', 
      error: error.message 
    });
  }
};

// Delete an exam
export const deleteExam = async (req, res) => {
  try {
    const examToDelete = await Exam.findById(req.params.id);
    
    if (!examToDelete) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }
    
    await Exam.findByIdAndDelete(req.params.id);
    
    res.status(200).json({
      success: true,
      message: 'Exam deleted successfully'
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error deleting exam', 
      error: error.message 
    });
  }
};

// Toggle exam status (publish/unpublish)
export const toggleExamStatus = async (req, res) => {
  try {
    const exam = await Exam.findById(req.params.id);
    
    if (!exam) {
      return res.status(404).json({ 
        success: false, 
        message: 'Exam not found' 
      });
    }
    
    // Toggle the status
    const newStatus = exam.status === 'Published' ? 'Draft' : 'Published';
    
    const updatedExam = await Exam.findByIdAndUpdate(
      req.params.id,
      { status: newStatus },
      { new: true }
    );
    
    res.status(200).json({
      success: true,
      message: `Exam ${newStatus === 'Published' ? 'published' : 'unpublished'} successfully`,
      exam: updatedExam
    });
  } catch (error) {
    res.status(500).json({ 
      success: false, 
      message: 'Error updating exam status', 
      error: error.message 
    });
  }
};
