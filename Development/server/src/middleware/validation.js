// server/src/middleware/validation.js
const validateTask = (req, res, next) => {
    const { title, description, priority, dueDate } = req.body;
    
    // Validate title (required)
    if (!title || title.trim() === '') {
      return res.status(400).json({ message: 'Title is required' });
    }
    
    // Validate priority (if provided)
    if (priority && !['low', 'medium', 'high'].includes(priority)) {
      return res.status(400).json({ message: 'Priority must be low, medium, or high' });
    }
    
    // Validate dueDate (if provided)
    if (dueDate) {
      const dateObj = new Date(dueDate);
      if (dateObj.toString() === 'Invalid Date') {
        return res.status(400).json({ message: 'Due date is invalid' });
      }
    }
    
    next();
  };
  
  module.exports = { validateTask };