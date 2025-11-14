import React, { useState, useEffect } from 'react';
import axios from 'axios';

function Dashboard() {
    const [data, setData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [errorMessage, setErrorMessage] = useState('');

    useEffect(() => {
        fetchDashboardData();
        // Refresh when other parts of the app signal data changes
        const handler = () => fetchDashboardData();
        window.addEventListener('dataChanged', handler);
        return () => window.removeEventListener('dataChanged', handler);
    }, []);

    const fetchDashboardData = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/dashboard', {
                headers: { Authorization: `Bearer ${token}` },
            });
            setData(response.data);
        } catch (error) {
            console.error('Error fetching dashboard data:', error);
            // If unauthorized, clear local auth and redirect to login
            if (error.response && error.response.status === 401) {
                localStorage.removeItem('token');
                localStorage.removeItem('user');
                window.location.href = '/';
                return;
            }

            setErrorMessage('Failed to load dashboard data. Please try again later.');
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = async () => {
        try {
            const token = localStorage.getItem('token');
            await axios.post('/api/logout', {}, { headers: { Authorization: `Bearer ${token}` } });
        } catch (err) {
            console.error('Logout error:', err);
        } finally {
            localStorage.removeItem('token');
            localStorage.removeItem('user');
            window.location.href = '/';
        }
    };

    if (loading) {
        return (
            <div className="main-content">
                <div className="loading">Loading...</div>
            </div>
        );
    }

    if (errorMessage) {
        return (
            <div className="main-content">
                <div className="error-message">{errorMessage}</div>
            </div>
        );
    }

    return (
        <main className="main-content">
            {/* Header */}
            <header className="page-header">
                <div className="header-left">
                    <div className="header-logo">
                        <div className="logo-icon">
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path d="M12 2L2 7v10c0 5.55 3.84 10.74 9 12 5.16-1.26 9-6.45 9-12V7l-10-5z" />
                            </svg>
                        </div>
                        <div className="header-title">
                            <span className="system-name">
                                Student & Faculty Profile Management System
                            </span>
                        </div>
                    </div>
                </div>
                <button className="btn btn-secondary" onClick={handleLogout}>Logout</button>
            </header>

            {/* Greeting */}
            <div className="page-greeting">
                <h1>Good afternoon, admin!</h1>
                <p>
                    Welcome to the Student and Faculty Profile Management System — here's what's
                    happening today.
                </p>
            </div>

            {/* Academic Year */}
            {data?.currentAcademicYear && (
                <div className="academic-year-badge">
                    <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                        <path
                            fillRule="evenodd"
                            d="M6 2a1 1 0 00-1 1v1H4a2 2 0 00-2 2v10a2 2 0 002 2h12a2 2 0 002-2V6a2 2 0 00-2-2h-1V3a1 1 0 10-2 0v1H7V3a1 1 0 00-1-1zm0 5a1 1 0 000 2h8a1 1 0 100-2H6z"
                            clipRule="evenodd"
                        />
                    </svg>
                    Academic Year: {data.currentAcademicYear.period}
                </div>
            )}

            {/* Stats Grid */}
            <div className="stats-grid">
                {/* Active Students */}
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-label">Active Students</div>
                        <div className="stat-value">{data?.stats.activeStudents || 0}</div>
                        <div className="stat-meta">+17% from last semester</div>
                    </div>
                    <div className="stat-icon">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                        </svg>
                    </div>
                </div>

                {/* Faculty Members */}
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-label">Faculty Members</div>
                        <div className="stat-value">{data?.stats.facultyMembers || 0}</div>
                        <div className="stat-meta">2 new this month</div>
                    </div>
                    <div className="stat-icon">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M13 6a3 3 0 11-6 0 3 3 0 016 0zM18 8a2 2 0 11-4 0 2 2 0 014 0zM14 15a4 4 0 00-8 0v3h8v-3zM6 8a2 2 0 11-4 0 2 2 0 014 0zM16 18v-3a5.972 5.972 0 00-.75-2.906A3.005 3.005 0 0119 15v3h-3zM4.75 12.094A5.973 5.973 0 004 15v3H1v-3a3 3 0 013.75-2.906z" />
                        </svg>
                    </div>
                </div>

                {/* Active Courses */}
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-label">Active Courses</div>
                        <div className="stat-value">{data?.stats.activeCourses || 0}</div>
                        <div className="stat-meta">
                            Across {data?.stats.departments || 0} departments
                        </div>
                    </div>
                    <div className="stat-icon">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                        </svg>
                    </div>
                </div>

                {/* Departments */}
                <div className="stat-card">
                    <div className="stat-content">
                        <div className="stat-label">Departments</div>
                        <div className="stat-value">{data?.stats.departments || 0}</div>
                        <div className="stat-meta">All Active</div>
                    </div>
                    <div className="stat-icon">
                        <svg fill="currentColor" viewBox="0 0 20 20">
                            <path
                                fillRule="evenodd"
                                d="M4 4a2 2 0 012-2h8a2 2 0 012 2v12a1 1 0 110 2h-3a1 1 0 01-1-1v-2a1 1 0 00-1-1H9a1 1 0 00-1 1v2a1 1 0 01-1 1H4a1 1 0 110-2V4zm3 1h2v2H7V5zm2 4H7v2h2V9zm2-4h2v2h-2V5zm2 4h-2v2h2V9z"
                                clipRule="evenodd"
                            />
                        </svg>
                    </div>
                </div>
            </div>

            {/* Dashboard Grid */}
            <div className="dashboard-grid">
                {/* Recent Students */}
                <div className="card">
                    <div className="card-header">
                        <h3>
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            Recent Students
                        </h3>
                    </div>
                    <div className="list">
                        {data?.recentStudents?.map((student) => (
                            <div key={student.id} className="list-item">
                                <div className="list-item-content">
                                    <div className="list-item-title">{student.name}</div>
                                    <div className="list-item-subtitle">
                                        {student.student_id} - {student.year_level}
                                    </div>
                                    <div className="list-item-meta">{student.course?.name}</div>
                                </div>
                                <span className={`badge badge-${student.status.toLowerCase()}`}>
                                    {student.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>

                {/* Course Overview */}
                <div className="card">
                    <div className="card-header">
                        <h3>
                            <svg width="20" height="20" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M9 4.804A7.968 7.968 0 005.5 4c-1.255 0-2.443.29-3.5.804v10A7.969 7.969 0 015.5 14c1.669 0 3.218.51 4.5 1.385A7.962 7.962 0 0114.5 14c1.255 0 2.443.29 3.5.804v-10A7.968 7.968 0 0014.5 4c-1.255 0-2.443.29-3.5.804V12a1 1 0 11-2 0V4.804z" />
                            </svg>
                            Course Overview
                        </h3>
                    </div>
                    <div className="list">
                        {data?.courses?.map((course) => (
                            <div key={course.id} className="list-item">
                                <div className="list-item-content">
                                    <div className="list-item-title">{course.name}</div>
                                    <div className="list-item-subtitle">
                                        {course.department?.name}
                                    </div>
                                </div>
                                <span className={`badge badge-${course.status.toLowerCase()}`}>
                                    {course.status}
                                </span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default Dashboard;
