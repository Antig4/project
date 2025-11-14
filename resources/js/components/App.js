import React, { useState, useEffect } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import Login from './pages/Login';
import Dashboard from './pages/Dashboard';
import Students from './pages/Students';
import Faculty from './pages/Faculty';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import MyProfile from './pages/MyProfile';
import Sidebar from './Sidebar';

function App() {
    const [isAuthenticated, setIsAuthenticated] = useState(false);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const token = localStorage.getItem('token');
        if (token) {
            setIsAuthenticated(true);
        }
        setLoading(false);
    }, []);

    const handleLogin = (token, user) => {
        localStorage.setItem('token', token);
        localStorage.setItem('user', JSON.stringify(user));
        setIsAuthenticated(true);
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        setIsAuthenticated(false);
    };

    if (loading) {
        return <div>Loading...</div>;
    }

    return (
        <Router>
            <Routes>
                <Route 
                    path="/" 
                    element={
                        isAuthenticated ? 
                        <Navigate to="/dashboard" /> : 
                        <Login onLogin={handleLogin} />
                    } 
                />
                <Route 
                    path="/dashboard" 
                    element={
                        isAuthenticated ? 
                        <div className="app-container">
                            <Sidebar onLogout={handleLogout} />
                            <Dashboard />
                        </div> : 
                        <Navigate to="/" />
                    } 
                />
                <Route 
                    path="/students" 
                    element={
                        isAuthenticated ? 
                        <div className="app-container">
                            <Sidebar onLogout={handleLogout} />
                            <Students />
                        </div> : 
                        <Navigate to="/" />
                    } 
                />
                <Route 
                    path="/faculty" 
                    element={
                        isAuthenticated ? 
                        <div className="app-container">
                            <Sidebar onLogout={handleLogout} />
                            <Faculty />
                        </div> : 
                        <Navigate to="/" />
                    } 
                />
                {/* Courses route removed - Courses UI moved into Settings tab */}
                <Route 
                    path="/reports" 
                    element={
                        isAuthenticated ? 
                        <div className="app-container">
                            <Sidebar onLogout={handleLogout} />
                            <Reports />
                        </div> : 
                        <Navigate to="/" />
                    } 
                />
                <Route 
                    path="/settings" 
                    element={
                        isAuthenticated ? 
                        <div className="app-container">
                            <Sidebar onLogout={handleLogout} />
                            <Settings />
                        </div> : 
                        <Navigate to="/" />
                    } 
                />
                <Route 
                    path="/profile" 
                    element={
                        isAuthenticated ? 
                        <div className="app-container">
                            <Sidebar onLogout={handleLogout} />
                            <MyProfile />
                        </div> : 
                        <Navigate to="/" />
                    } 
                />
            </Routes>
        </Router>
    );
}

export default App;
