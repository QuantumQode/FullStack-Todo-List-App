// In client/src/pages/Dashboard.js
import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { taskService, authService } from '../services/api';

function Dashboard() {
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [username, setUsername] = useState('');
  const [newTask, setNewTask] = useState({
    title: '',
    description: '',
    priority: 'medium',
    dueDate: ''
  });
  const [editingTask, setEditingTask] = useState(null);

  const [statusFilter, setStatusFilter] = useState('all');
  const [priorityFilter, setPriorityFilter] = useState('all');
  const [searchFilter, setSearchFilter] = useState('');
  
  const navigate = useNavigate();
  
  // Fetch tasks on component mount
  useEffect(() => {
    fetchTasks();
    // Get username from localStorage
    const storedUsername = localStorage.getItem('username');
    if (storedUsername) {
      setUsername(storedUsername);
    }
  }, []);
  
  // Fetch all tasks
  const fetchTasks = async () => {
    try {
      setLoading(true);
      const response = await taskService.getAllTasks();
      setTasks(response.data);
      setError('');
    } catch (err) {
      console.error('Error fetching tasks:', err);
      if (err.response && err.response.status === 401) {
        // Unauthorized, redirect to login
        localStorage.removeItem('token');
        navigate('/login');
      } else {
        setError('Failed to load tasks. Please try again.');
      }
    } finally {
      setLoading(false);
    }
  };
  
  // Handle input change for new task form
  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setNewTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Create new task
  const handleCreateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.createTask(newTask);
      // Clear form
      setNewTask({
        title: '',
        description: '',
        priority: 'medium',
        dueDate: ''
      });
      // Refresh task list
      fetchTasks();
    } catch (err) {
      console.error('Error creating task:', err);
      setError('Failed to create task. Please try again.');
    }
  };
  
  // Delete task
  const handleDeleteTask = async (id) => {
    if (window.confirm('Are you sure you want to delete this task?')) {
      try {
        await taskService.deleteTask(id);
        // Refresh task list
        fetchTasks();
      } catch (err) {
        console.error('Error deleting task:', err);
        setError('Failed to delete task. Please try again.');
      }
    }
  };
  
  // Set task for editing
  const handleEditClick = (task) => {
    setEditingTask(task);
  };
  
  // Update task
  const handleUpdateTask = async (e) => {
    e.preventDefault();
    try {
      await taskService.updateTask(editingTask.id, editingTask);
      setEditingTask(null);
      // Refresh task list
      fetchTasks();
    } catch (err) {
      console.error('Error updating task:', err);
      setError('Failed to update task. Please try again.');
    }
  };
  
  // Handle edit form input changes
  const handleEditInputChange = (e) => {
    const { name, value } = e.target;
    setEditingTask(prev => ({
      ...prev,
      [name]: value
    }));
  };
  
  // Toggle task completion status
  const handleToggleStatus = async (task) => {
    try {
      const updatedTask = {
        ...task,
        status: task.status === 'completed' ? 'pending' : 'completed'
      };
      await taskService.updateTask(task.id, updatedTask);
      // Refresh task list
      fetchTasks();
    } catch (err) {
      console.error('Error updating task status:', err);
      setError('Failed to update task status. Please try again.');
    }
  };
  
  // Handle logout
  const handleLogout = () => {
    authService.logout();
    localStorage.removeItem('username');
    navigate('/login');
  };

  const getFilteredTasks = () => {
    return tasks.filter(task => {
      // Status filter
      if (statusFilter !== 'all' && task.status !== statusFilter) {
        return false;
      }
      
      // Priority filter
      if (priorityFilter !== 'all' && task.priority !== priorityFilter) {
        return false;
      }
      
      // Search filter (case insensitive)
      if (searchFilter && !task.title.toLowerCase().includes(searchFilter.toLowerCase())) {
        return false;
      }
      
      return true;
    });
  };
  
  const resetFilters = () => {
    setStatusFilter('all');
    setPriorityFilter('all');
    setSearchFilter('');
  };
  
  return (
    <div className="dashboard-container">
      <header className="dashboard-header">
        <div>
          <h1>Task Dashboard</h1>
          {username && <p className="welcome-message">Welcome, {username}!</p>}
        </div>
        <button className="btn logout-btn" onClick={handleLogout}>Logout</button>
      </header>
      
      {error && <div className="errorMessage">{error}</div>}
      
      <section className="task-form-section">
        <h2>Add New Task</h2>
        <form onSubmit={handleCreateTask}>
          <div className="form-group">
            <label htmlFor="title">Title</label>
            <input
              type="text"
              id="title"
              name="title"
              value={newTask.title}
              onChange={handleInputChange}
              required
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="description">Description</label>
            <textarea
              id="description"
              name="description"
              value={newTask.description}
              onChange={handleInputChange}
            />
          </div>
          
          <div className="form-group">
            <label htmlFor="priority">Priority</label>
            <select
              id="priority"
              name="priority"
              value={newTask.priority}
              onChange={handleInputChange}
            >
              <option value="low">Low</option>
              <option value="medium">Medium</option>
              <option value="high">High</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="dueDate">Due Date</label>
            <input
              type="datetime-local"
              id="dueDate"
              name="dueDate"
              value={newTask.dueDate}
              onChange={handleInputChange}
            />
          </div>
          
          <button type="submit" className="btn">Add Task</button>
        </form>
      </section>
      

      <section className="filter-section">
        <h2>Filter Tasks</h2>
        <div className="filter-controls">
          <div className="form-group">
            <label htmlFor="statusFilter">Status</label>
            <select 
              id="statusFilter" 
              value={statusFilter} 
              onChange={(e) => setStatusFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="pending">Pending</option>
              <option value="completed">Completed</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="priorityFilter">Priority</label>
            <select 
              id="priorityFilter" 
              value={priorityFilter} 
              onChange={(e) => setPriorityFilter(e.target.value)}
            >
              <option value="all">All</option>
              <option value="high">High</option>
              <option value="medium">Medium</option>
              <option value="low">Low</option>
            </select>
          </div>
          
          <div className="form-group">
            <label htmlFor="searchFilter">Search</label>
            <input 
              type="text" 
              id="searchFilter" 
              placeholder="Search by title..." 
              value={searchFilter} 
              onChange={(e) => setSearchFilter(e.target.value)} 
            />
          </div>
          
          <button className="btn reset-btn" onClick={resetFilters}>
            Reset Filters
          </button>
        </div>
      </section>

      <section className="tasks-section">
        <h2>Your Tasks</h2>
        
        {loading ? (
          <p>Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p>No tasks yet. Add one above!</p>
        ) : (
          <>
            {/* Add active filters indicator */}
            {(statusFilter !== 'all' || priorityFilter !== 'all' || searchFilter !== '') && (
              <div className="active-filters">
                <p>
                  Active filters: 
                  {statusFilter !== 'all' && <span className="filter-tag">Status: {statusFilter}</span>}
                  {priorityFilter !== 'all' && <span className="filter-tag">Priority: {priorityFilter}</span>}
                  {searchFilter !== '' && <span className="filter-tag">Search: "{searchFilter}"</span>}
                </p>
              </div>
            )}
            
            <div className="task-list">
              {getFilteredTasks().length === 0 ? (
                <p>No tasks match your filters.</p>
              ) : (
                getFilteredTasks().map(task => (
                  <div 
                    key={task.id} 
                    className={`task-item ${task.status === 'completed' ? 'completed' : ''} priority-${task.priority}`}
                  >
                    <div className="task-header">
                      <h3>{task.title}</h3>
                      <div className="task-actions">
                        <button 
                          className="status-btn"
                          onClick={() => handleToggleStatus(task)}
                        >
                          {task.status === 'completed' ? 'Mark Incomplete' : 'Mark Complete'}
                        </button>
                        <button 
                          className="edit-btn"
                          onClick={() => handleEditClick(task)}
                        >
                          Edit
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={() => handleDeleteTask(task.id)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                    
                    <p className="task-description">{task.description}</p>
                    
                    <div className="task-meta">
                      <span className={`priority priority-${task.priority}`}>
                        {task.priority.charAt(0).toUpperCase() + task.priority.slice(1)}
                      </span>
                      
                      {task.dueDate && (
                        <span className="due-date">
                          Due: {new Date(task.dueDate).toLocaleString()}
                        </span>
                      )}
                    </div>
                  </div>
                ))
              )}
            </div>
          </>
        )}
      </section>
      
      {/* Edit Task Modal */}
      {editingTask && (
        <div className="modal-overlay">
          <div className="edit-modal">
            <h2>Edit Task</h2>
            <form onSubmit={handleUpdateTask}>
              <div className="form-group">
                <label htmlFor="edit-title">Title</label>
                <input
                  type="text"
                  id="edit-title"
                  name="title"
                  value={editingTask.title}
                  onChange={handleEditInputChange}
                  required
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-description">Description</label>
                <textarea
                  id="edit-description"
                  name="description"
                  value={editingTask.description}
                  onChange={handleEditInputChange}
                />
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-status">Status</label>
                <select
                  id="edit-status"
                  name="status"
                  value={editingTask.status}
                  onChange={handleEditInputChange}
                >
                  <option value="pending">Pending</option>
                  <option value="completed">Completed</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-priority">Priority</label>
                <select
                  id="edit-priority"
                  name="priority"
                  value={editingTask.priority}
                  onChange={handleEditInputChange}
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
              
              <div className="form-group">
                <label htmlFor="edit-dueDate">Due Date</label>
                <input
                  type="datetime-local"
                  id="edit-dueDate"
                  name="dueDate"
                  value={editingTask.dueDate}
                  onChange={handleEditInputChange}
                />
              </div>
              
              <div className="modal-actions">
                <button type="submit" className="btn">Save Changes</button>
                <button 
                  type="button" 
                  className="btn cancel-btn"
                  onClick={() => setEditingTask(null)}
                >
                  Cancel
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

export default Dashboard;