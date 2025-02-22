import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate, Link } from 'react-router-dom';
import e from 'cors';

function Dashboard() {

    return (
        <div className="taskContainer">
        <h1>Dashboard</h1>
        <p>Welcome to the dashboard</p>
        </div>
    );
}

export default Dashboard;