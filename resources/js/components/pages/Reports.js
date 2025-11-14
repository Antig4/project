import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';

function Reports() {
    const [reportType, setReportType] = useState('Student Report');
    const [students, setStudents] = useState([]);
    const [faculty, setFaculty] = useState([]);
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [stats, setStats] = useState({});
    const [courseFilter, setCourseFilter] = useState('All Courses');
    const [departmentFilter, setDepartmentFilter] = useState('All Departments');
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [reportType, courseFilter, departmentFilter]);

    // Client-side filtered lists: prefer backend-provided is_archived flag, fallback to status text
    const visibleStudents = useMemo(() => (students || []).filter(s => {
        if (typeof s.is_archived !== 'undefined') return !s.is_archived;
        const st = (s.status || '').toString().toLowerCase();
        return st !== 'archived' && st !== 'deleted';
    }), [students]);

    const visibleFaculty = useMemo(() => (faculty || []).filter(f => {
        if (typeof f.is_archived !== 'undefined') return !f.is_archived;
        const st = (f.status || '').toString().toLowerCase();
        return st !== 'archived' && st !== 'deleted';
    }), [faculty]);

    // Visible (non-archived) departments for dropdowns and counts
    const visibleDepartments = useMemo(() => (departments || []).filter(d => {
        if (typeof d.is_archived !== 'undefined') return !d.is_archived;
        const st = (d.status || '').toString().toLowerCase();
        return st !== 'archived' && st !== 'deleted';
    }), [departments]);

    // Derived stats computed from the visible (non-archived) lists to ensure counts reflect
    // what the user actually sees in the preview (fallback when backend stats include archived)
    const derivedStudentStats = useMemo(() => {
        const total = (visibleStudents || []).length;
        const active = (visibleStudents || []).filter(s => ((s.status || '').toString().toLowerCase()) === 'active').length;
        const graduated = (visibleStudents || []).filter(s => ((s.status || '').toString().toLowerCase()) === 'graduated').length;
        return { total, active, graduated };
    }, [visibleStudents]);

    const derivedFacultyStats = useMemo(() => {
        const total = (visibleFaculty || []).length;
        const departmentsCount = (visibleDepartments || []).length;
        const active = (visibleFaculty || []).filter(f => ((f.status || '').toString().toLowerCase()) === 'active').length;
        return { total, departments: departmentsCount, active };
    }, [visibleFaculty, visibleDepartments]);

    const fetchReports = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = { type: reportType };
            
            if (reportType === 'Student Report' && courseFilter !== 'All Courses') {
                params.course = courseFilter;
            }
            if (reportType === 'Faculty Report' && departmentFilter !== 'All Departments') {
                params.department = departmentFilter;
            }

            const response = await axios.get('/api/reports', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setStudents(response.data.students || []);
            setFaculty(response.data.faculty || []);
            setCourses(response.data.courses || []);
            setDepartments(response.data.departments || []);
            setStats(response.data.stats || {});
        } catch (error) {
            console.error('Error fetching reports:', error);
        } finally {
            setLoading(false);
        }
    };

    const handleExport = () => {
        (async () => {
            try {
                const token = localStorage.getItem('token');
                const params = {};
                if (reportType === 'Student Report') {
                    params.type = 'students';
                    if (courseFilter !== 'All Courses') params.course = courseFilter;
                } else {
                    params.type = 'faculty';
                    if (departmentFilter !== 'All Departments') params.department = departmentFilter;
                }
                // Ask backend (if supported) to exclude archived records from exports
                params.exclude_archived = 1;

                const response = await axios.get('/api/reports/export', {
                    headers: { Authorization: `Bearer ${token}` },
                    params,
                    responseType: 'blob'
                });

                // Get filename from content-disposition if present
                let filename = '';
                const disposition = response.headers['content-disposition'] || response.headers['Content-Disposition'];
                if (disposition) {
                    const match = disposition.match(/filename\*=UTF-8''(.+)|filename="?([^;\"]+)"?/);
                    if (match) filename = decodeURIComponent(match[1] || match[2]);
                }
                if (!filename) {
                    filename = reportType === 'Student Report' ? 'student_report.csv' : 'faculty_report.csv';
                }

                const url = window.URL.createObjectURL(new Blob([response.data]));
                const link = document.createElement('a');
                link.href = url;
                link.setAttribute('download', filename);
                document.body.appendChild(link);
                link.click();
                link.remove();
                window.URL.revokeObjectURL(url);
            } catch (error) {
                console.error('Error exporting report:', error);
                alert('Failed to export report');
            }
        })();
    };

    return (
        <main className="main-content">
            <header className="page-header">
                <h1>Reports</h1>
                <button className="btn btn-primary" onClick={handleExport}>📥 Export Report</button>
            </header>

            <div className="card">
                <div className="report-config">
                    <h3>Report Configuration</h3>
                    <div className="filters">
                        <div className="filter-group">
                            <label>Report Type</label>
                            <select
                                value={reportType}
                                onChange={(e) => setReportType(e.target.value)}
                            >
                                <option>Student Report</option>
                                <option>Faculty Report</option>
                            </select>
                        </div>
                        {reportType === 'Student Report' ? (
                            <div className="filter-group">
                                <label>Filter by Course</label>
                                <select
                                    value={courseFilter}
                                    onChange={(e) => setCourseFilter(e.target.value)}
                                >
                                    <option>All Courses</option>
                                    {courses.map((course) => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>
                        ) : (
                            <div className="filter-group">
                                <label>Filter by Department</label>
                                <select
                                    value={departmentFilter}
                                    onChange={(e) => setDepartmentFilter(e.target.value)}
                                >
                                    <option>All Departments</option>
                                    {visibleDepartments.map((dept) => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>
                        )}
                    </div>
                </div>

                <div className="report-preview">
                    <div className="report-badge">
                        {reportType === 'Student Report' ? (visibleStudents.length) : (visibleFaculty.length)} reports
                    </div>
                    <h3>{reportType}</h3>

                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : reportType === 'Student Report' ? (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Student ID</th>
                                    <th>Name</th>
                                    <th>Year Level</th>
                                    <th>Course</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleStudents.map((student) => (
                                    <tr key={student.id}>
                                        <td>{student.student_id}</td>
                                        <td>{student.name}</td>
                                        <td>{student.year_level}</td>
                                        <td>{student.course?.name}</td>
                                        <td>{student.department?.name}</td>
                                        <td>
                                            <span className={`badge badge-${student.status.toLowerCase()}`}>
                                                {student.status}
                                            </span>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Faculty ID</th>
                                    <th>Name</th>
                                    <th>Department</th>
                                </tr>
                            </thead>
                            <tbody>
                                {visibleFaculty.map((fac) => (
                                    <tr key={fac.id}>
                                        <td>{fac.faculty_id}</td>
                                        <td>{fac.name}</td>
                                        <td>{fac.department?.name}</td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                <div className="stats-summary">
                    {reportType === 'Student Report' ? (
                        <>
                            <div className="summary-card">
                                <div className="summary-value">{derivedStudentStats.total}</div>
                                <div className="summary-label">Total Students</div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-value" style={{color: '#28a745'}}>{derivedStudentStats.active}</div>
                                <div className="summary-label">Active Students</div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-value" style={{color: '#6c757d'}}>{derivedStudentStats.graduated}</div>
                                <div className="summary-label">Graduated Students</div>
                            </div>
                        </>
                    ) : (
                        <>
                            <div className="summary-card">
                                <div className="summary-value">{derivedFacultyStats.total}</div>
                                <div className="summary-label">Total Faculty</div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-value" style={{color: '#007bff'}}>{derivedFacultyStats.departments}</div>
                                <div className="summary-label">Departments</div>
                            </div>
                            <div className="summary-card">
                                <div className="summary-value" style={{color: '#28a745'}}>{derivedFacultyStats.active}</div>
                                <div className="summary-label">Active Faculty</div>
                            </div>
                        </>
                    )}
                </div>
            </div>
        </main>
    );
}

export default Reports;

