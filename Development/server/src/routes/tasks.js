// Create a new file: server/src/routes/tasks.js
const express = require('express');
const router = express.Router();
const db = require('../config/db');
const authMiddleware = require('../middleware/auth');
const { validateTask } = require('../middleware/validation');
const CryptoJS = require('crypto-js');

console.log('Tasks routes file loaded');

// Encryption/decryption functions
const encrypt = (text) => {
    if (!text) return text;
    return CryptoJS.AES.encrypt(text, process.env.ENCRYPTION_KEY).toString();
};

const decrypt = (ciphertext) => {
    if (!ciphertext) return ciphertext;
    const bytes = CryptoJS.AES.decrypt(ciphertext, process.env.ENCRYPTION_KEY);
    return bytes.toString(CryptoJS.enc.Utf8);
};

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
        
        // Decrypt task data before sending to client
        const decryptedTasks = tasks.map(task => ({
            ...task,
            title: decrypt(task.title),
            description: decrypt(task.description)
        }));
        
        res.status(200).json(decryptedTasks);
    } catch (error) {
        console.error('Error fetching tasks:', error);
        res.status(500).send('Server error occurred');
    }
});

// POST create a new task
router.post('/', validateTask, async (req, res) => {
    console.log('POST /tasks endpoint hit');
    try {
        const { title, description, priority, dueDate } = req.body;
        const userId = req.user.id;
        
        // Validate required fields
        if (!title) {
            return res.status(400).send('Title is required');
        }
        
        // Encrypt sensitive task data
        const encryptedTitle = encrypt(title);
        const encryptedDescription = encrypt(description);
        
        const result = await queryDB(
            'INSERT INTO tasks (title, description, priority, dueDate, userId) VALUES (?, ?, ?, ?, ?)',
            [encryptedTitle, encryptedDescription, priority, dueDate, userId]
        );
        
        const newTask = await queryDB('SELECT * FROM tasks WHERE id = ?', [result.insertId]);
        
        // Decrypt task data before sending the response
        const decryptedTask = {
            ...newTask[0],
            title: decrypt(newTask[0].title),
            description: decrypt(newTask[0].description)
        };
        
        res.status(201).json(decryptedTask);
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
        
        // Decrypt task data before sending to client
        const decryptedTask = {
            ...tasks[0],
            title: decrypt(tasks[0].title),
            description: decrypt(tasks[0].description)
        };
        
        res.status(200).json(decryptedTask);
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
        
        // Get current task data to fill in any missing fields
        const currentTask = tasks[0];
        
        // Decrypt current task data for comparison
        const decryptedCurrentTask = {
            ...currentTask,
            title: decrypt(currentTask.title),
            description: decrypt(currentTask.description)
        };
        
        // Format the date properly for MySQL
        let formattedDueDate = null;
        if (dueDate) {
            // Convert ISO string to MySQL datetime format
            const date = new Date(dueDate);
            formattedDueDate = date.toISOString().slice(0, 19).replace('T', ' ');
        } else if (currentTask.dueDate) {
            // Keep the existing date
            formattedDueDate = currentTask.dueDate;
        }
        
        // Encrypt the updated data
        const encryptedTitle = title ? encrypt(title) : currentTask.title;
        const encryptedDescription = description !== undefined ? encrypt(description) : currentTask.description;
        
        // Update the task with properly formatted date and encrypted data
        await queryDB(
            'UPDATE tasks SET title = ?, description = ?, status = ?, priority = ?, dueDate = ? WHERE id = ?',
            [
                encryptedTitle, 
                encryptedDescription, 
                status || decryptedCurrentTask.status,
                priority || decryptedCurrentTask.priority, 
                formattedDueDate,
                taskId
            ]
        );
        
        const updatedTask = await queryDB('SELECT * FROM tasks WHERE id = ?', [taskId]);
        
        // Decrypt updated task before sending to client
        const decryptedUpdatedTask = {
            ...updatedTask[0],
            title: decrypt(updatedTask[0].title),
            description: decrypt(updatedTask[0].description)
        };
        
        res.status(200).json(decryptedUpdatedTask);
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