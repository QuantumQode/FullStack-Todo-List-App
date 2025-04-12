// Create a new file: server/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');

// Utility function to query database (Promise wrapper)
const queryDB = (sql, params) => {
    return new Promise((resolve, reject) => {
        db.query(sql, params, (err, result) => {
            if (err) reject(err);
            resolve(result);
        });
    });
};

// Apply auth middleware to all task routes
router.use(authMiddleware);

// GET all tasks for logged in user
router.get('/', async (req, res) => {
    try {
        const userId = req.user.id;
        const tasks = await queryDB(
            'SELECT * FROM tasks WHERE userId = ? ORDER BY createdAt DESC', 
            [userId]
        );
        res.status(200).json(tasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Server error occurred');
    }
});

// POST create a new task
router.post('/', validateTask, async (req, res) => {
    try {
        const { title, description, priority, dueDate } = req.body;
        const userId = req.user.id;
        
        // Validate required fields
        if (!title) {
            return res.status(400).send('Title is required');
        }
        
        const result = await queryDB(
            'INSERT INTO tasks (title, description, priority, dueDate, userId) VALUES (?, ?, ?, ?, ?)',
            [title, description, priority, dueDate, userId]
        );
        
        const newTask = await queryDB('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        res.status(201).json(newTask[0]);
    } catch (error) {
        console.error('Error creating task:', error);
        res.status(500).send('Server error occurred');
    }
});

// GET a single task by ID
router.get('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        
        const tasks = await queryDB(
            'SELECT * FROM tasks WHERE id = ? AND userId = ?',
            [taskId, userId]
        );
        
        if (tasks.length === 0) {
            return res.status(404).send('Task not found or not authorized');
        }
        
        res.status(200).json(tasks[0]);
    } catch (error) {
        console.error('Error fetching task:', error);
        res.status(500).send('Server error occurred');
    }
});

// PUT update a task
router.put('/:id', validateTask, async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        const { title, description, status, priority, dueDate } = req.body;
        
        // Check if task exists and belongs to user
        const tasks = await queryDB(
            'SELECT * FROM tasks WHERE id = ? AND userId = ?',
            [taskId, userId]
        );
        
        if (tasks.length === 0) {
            return res.status(404).send('Task not found or not authorized');
        }
        
        // Update the task
        await queryDB(
            'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, dueDate = ? WHERE id = ?',
            [title, description, status, priority, dueDate, taskId]
        );
        
        const updatedTask = await queryDB('SELECT * FROM tasks WHERE id = ?', [taskId]);
        res.status(200).json(updatedTask[0]);
    } catch (error) {
        console.error('Error updating task:', error);
        res.status(500).send('Server error occurred');
    }
});

// DELETE a task
router.delete('/:id', async (req, res) => {
    try {
        const taskId = req.params.id;
        const userId = req.user.id;
        
        // Check if task exists and belongs to user
        const tasks = await queryDB(
            'SELECT * FROM tasks WHERE id = ? AND userId = ?',
            [taskId, userId]
        );
        
        if (tasks.length === 0) {
            return res.status(404).send('Task not found or not authorized');
        }
        
        // Delete the task
        await queryDB('DELETE FROM tasks WHERE id = ?', [taskId]);
        
        res.status(200).json({ message: 'Task deleted successfully' });
    } catch (error) {
        console.error('Error deleting task:', error);
        res.status(500).send('Server error occurred');
    }
});

module.exports = router;