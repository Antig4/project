import React, { useState, useEffect } from 'react';
import axios from 'axios';
import DepartmentModal from '../modals/DepartmentModal';
import AcademicYearModal from '../modals/AcademicYearModal';
import ConfirmModal from '../common/ConfirmModal';
import NotificationModal from '../common/NotificationModal';
import CourseModal from '../modals/CourseModal';

function Settings() {
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [archives, setArchives] = useState([]);
    const [activeTab, setActiveTab] = useState('courses');
    const [loading, setLoading] = useState(true);
    const [showDeptModal, setShowDeptModal] = useState(false);
    const [showYearModal, setShowYearModal] = useState(false);
    const [editingDept, setEditingDept] = useState(null);
    const [editingYear, setEditingYear] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState({});
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyPayload, setNotifyPayload] = useState({});

    useEffect(() => {
        if (activeTab === 'departments' || activeTab === 'academic-years') {
            fetchSettings();
        } else if (activeTab === 'archives') {
            fetchArchives();
        }
    }, [activeTab]);

    const fetchSettings = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data.departments);
            setAcademicYears(response.data.academicYears);
        } catch (error) {
            console.error('Error fetching settings:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchArchives = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/archive', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setArchives(response.data);
        } catch (error) {
            console.error('Error fetching archives:', error);
        } finally {
            setLoading(false);
        }
    };

    // Restore archived record
    const handleRestore = (type, id, name) => {
        setConfirmPayload({ action: 'restore', type, id, name });
        setConfirmOpen(true);
    };

    const confirmRestore = async () => {
        const { type, id } = confirmPayload;
        setConfirmOpen(false);
        try {
            const token = localStorage.getItem('token');
            const response = await axios.put(`/api/archive/restore/${type}/${id}`, null, {
                headers: { Authorization: `Bearer ${token}` }
            });
            // show friendly notification modal
            setNotifyPayload({ title: 'Restored', message: `${confirmPayload.name || 'Record'} has been restored.` });
            setNotifyOpen(true);
            fetchArchives(); // refresh list
            window.dispatchEvent(new Event('dataChanged'));
        } catch (error) {
            console.error('Error restoring record:', error.response || error);
            alert('Failed to restore record');
        }
    };


    // Delete archived record permanently
    const handleDeletePermanent = (type, id, name) => {
        setConfirmPayload({ action: 'delete', type, id, name });
        setConfirmOpen(true);
    };

    const confirmDeletePermanent = async () => {
        const { type, id } = confirmPayload;
        setConfirmOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/archive/delete/${type}/${id}`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setNotifyPayload({ title: 'Deleted', message: `${confirmPayload.name || 'Record'} has been deleted permanently.` });
            setNotifyOpen(true);
            fetchArchives();
            window.dispatchEvent(new Event('dataChanged'));
        } catch (error) {
            console.error('Error deleting record:', error);
            alert('Failed to delete record permanently');
        }
    };

    // Generic dispatcher for confirm modal
    const handleConfirmAction = () => {
        if (!confirmPayload || !confirmPayload.action) return;
        if (confirmPayload.action === 'restore') return confirmRestore();
        if (confirmPayload.action === 'delete') return confirmDeletePermanent();
        if (confirmPayload.action === 'archive') {
            // dispatch based on type
            if (confirmPayload.type === 'department') return confirmArchiveDept();
            if (confirmPayload.type === 'academic_year') return confirmArchiveYear();
            // unknown type - close modal
            setConfirmOpen(false);
        }
    };

    const handleEditDept = (dept) => {
        setEditingDept(dept);
        setShowDeptModal(true);
    };

    const handleEditYear = (year) => {
        setEditingYear(year);
        setShowYearModal(true);
    };

    // Archive department (ask confirm then archive with notification)
    const handleArchiveDept = (dept) => {
        setConfirmPayload({ action: 'archive', type: 'department', id: dept.id, name: dept.name });
        setConfirmOpen(true);
    };

    const confirmArchiveDept = async () => {
        const { id } = confirmPayload;
        setConfirmOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/departments/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setNotifyPayload({ title: 'Archived', message: `${confirmPayload.name || 'Department'} has been archived.` });
            setNotifyOpen(true);
            fetchSettings();
            window.dispatchEvent(new Event('dataChanged'));
        } catch (error) {
            console.error('Error archiving department:', error);
            setNotifyPayload({ title: 'Error', message: 'Failed to archive department.' });
            setNotifyOpen(true);
        }
    };

    // Archive academic year
    const handleArchiveYear = (year) => {
        setConfirmPayload({ action: 'archive', type: 'academic_year', id: year.id, name: year.period || year.name });
        setConfirmOpen(true);
    };

    const confirmArchiveYear = async () => {
        const { id } = confirmPayload;
        setConfirmOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/academic-years/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            setNotifyPayload({ title: 'Archived', message: `${confirmPayload.name || 'Academic Year'} has been archived.` });
            setNotifyOpen(true);
            fetchSettings();
            window.dispatchEvent(new Event('dataChanged'));
        } catch (error) {
            console.error('Error archiving academic year:', error);
            setNotifyPayload({ title: 'Error', message: 'Failed to archive academic year.' });
            setNotifyOpen(true);
        }
    };

    // --- Embedded CoursesPanel component ---
    function CoursesPanel() {
        const [courses, setCourses] = React.useState([]);
        const [departmentsLocal, setDepartmentsLocal] = React.useState([]);
        const [searchLocal, setSearchLocal] = React.useState('');
        const [departmentFilterLocal, setDepartmentFilterLocal] = React.useState('All Departments');
        const [statusFilterLocal, setStatusFilterLocal] = React.useState('All Status');
        const [loadingLocal, setLoadingLocal] = React.useState(true);
        const [showModalLocal, setShowModalLocal] = React.useState(false);
        const [editingCourseLocal, setEditingCourseLocal] = React.useState(null);
        const [confirmOpenLocal, setConfirmOpenLocal] = React.useState(false);
        const [confirmPayloadLocal, setConfirmPayloadLocal] = React.useState({});
        const [notifyOpenLocal, setNotifyOpenLocal] = React.useState(false);
        const [notifyPayloadLocal, setNotifyPayloadLocal] = React.useState({});

        React.useEffect(() => {
            fetchCoursesLocal();
        }, [searchLocal, departmentFilterLocal, statusFilterLocal]);

        const fetchCoursesLocal = async () => {
            try {
                const token = localStorage.getItem('token');
                const params = {};
                if (searchLocal) params.search = searchLocal;
                if (departmentFilterLocal !== 'All Departments') params.department = departmentFilterLocal;
                if (statusFilterLocal !== 'All Status') params.status = statusFilterLocal;

                const response = await axios.get('/api/courses', {
                    headers: { Authorization: `Bearer ${token}` },
                    params
                });
                setCourses(response.data.courses);
                setDepartmentsLocal(response.data.departments);
            } catch (error) {
                console.error('Error fetching courses:', error);
            } finally {
                setLoadingLocal(false);
            }
        };

        const handleArchiveLocal = (id, name) => {
            setConfirmPayloadLocal({ type: 'course-archive', id, name });
            setConfirmOpenLocal(true);
        };

        const confirmArchiveLocal = async () => {
            const { id } = confirmPayloadLocal;
            setConfirmOpenLocal(false);
            try {
                const token = localStorage.getItem('token');
                await axios.delete(`/api/courses/${id}`, { headers: { Authorization: `Bearer ${token}` } });
                fetchCoursesLocal();
                window.dispatchEvent(new Event('dataChanged'));
                setNotifyPayloadLocal({ title: 'Archived', message: `${confirmPayloadLocal.name || 'Course'} has been archived.` });
                setNotifyOpenLocal(true);
            } catch (error) {
                console.error('Error archiving course:', error);
                alert('Failed to archive course');
            }
        };

        const handleEditLocal = (course) => {
            setEditingCourseLocal(course);
            setShowModalLocal(true);
        };

        const handleAddLocal = () => {
            setEditingCourseLocal(null);
            setShowModalLocal(true);
        };

        const handleModalCloseLocal = () => {
            setShowModalLocal(false);
            setEditingCourseLocal(null);
            fetchCoursesLocal();
            window.dispatchEvent(new Event('dataChanged'));
        };

        return (
            <div>
                <header className="page-header">
                    <h1 className="panel-title">Course Management</h1>
                    <button className="btn btn-primary" onClick={handleAddLocal}>+ Add Course</button>
                </header>

                <div className="card">
                    <div className="filters">
                        <div className="filter-group">
                            <label>Search Courses</label>
                            <input type="text" placeholder="Search by course name..." value={searchLocal} onChange={(e) => setSearchLocal(e.target.value)} />
                        </div>
                        <div className="filter-group">
                            <label>Filter by Department</label>
                            <select value={departmentFilterLocal} onChange={(e) => setDepartmentFilterLocal(e.target.value)}>
                                <option>All Departments</option>
                                {departmentsLocal.map((dept) => (
                                    <option key={dept.id} value={dept.id}>{dept.name}</option>
                                ))}
                            </select>
                        </div>
                        <div className="filter-group">
                            <label>Filter by Status</label>
                            <select value={statusFilterLocal} onChange={(e) => setStatusFilterLocal(e.target.value)}>
                                <option>All Status</option>
                                <option>Active</option>
                                <option>Inactive</option>
                            </select>
                        </div>
                    </div>

                    <div className="table-header">
                        <h3>Courses ({courses.length})</h3>
                    </div>

                    {loadingLocal ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Course ID</th>
                                    <th>Course</th>
                                    <th>Department</th>
                                    <th>Status</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {courses.map((course) => (
                                    <tr key={course.id}>
                                        <td>{course.id}</td>
                                        <td>{course.name}</td>
                                        <td>{course.department?.name}</td>
                                        <td>
                                            <span className={`badge badge-${course.status.toLowerCase()}`}>
                                                {course.status}
                                            </span>
                                        </td>
                                        <td>
                                            <button className="btn-icon" onClick={() => handleEditLocal(course)}>✏️</button>
                                            <button className="btn-icon" onClick={() => handleArchiveLocal(course.id, course.name)}>📦</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>

                {showModalLocal && (
                    <CourseModal course={editingCourseLocal} departments={departmentsLocal} onClose={handleModalCloseLocal} />
                )}

                {confirmOpenLocal && (
                    <ConfirmModal
                        title={confirmPayloadLocal.name ? `Archive ${confirmPayloadLocal.name}` : 'Archive Course'}
                        message={`Are you sure you want to archive ${confirmPayloadLocal.name || 'this course'}?`}
                        onCancel={() => setConfirmOpenLocal(false)}
                        onConfirm={confirmArchiveLocal}
                        confirmLabel="Archive"
                        cancelLabel="Cancel"
                    />
                )}

                {notifyOpenLocal && (
                    <NotificationModal title={notifyPayloadLocal.title} message={notifyPayloadLocal.message} onClose={() => setNotifyOpenLocal(false)} />
                )}
            </div>
        );
    }

    return (
        <main className="main-content">
            <header className="page-header">
                <h1>Settings</h1>
            </header>

            <div className="tabs">
                <button
                    className={`tab ${activeTab === 'courses' ? 'active' : ''}`}
                    onClick={() => setActiveTab('courses')}
                >
                    Courses
                </button>
                <button
                    className={`tab ${activeTab === 'departments' ? 'active' : ''}`}
                    onClick={() => setActiveTab('departments')}
                >
                    Department
                </button>
                <button
                    className={`tab ${activeTab === 'academic-years' ? 'active' : ''}`}
                    onClick={() => setActiveTab('academic-years')}
                >
                    Academic Years
                </button>
                <button
                    className={`tab ${activeTab === 'archives' ? 'active' : ''}`}
                    onClick={() => setActiveTab('archives')}
                >
                    Archive
                </button>
            </div>

            {/* Departments Tab */}
            {activeTab === 'departments' && (
                <div className="card">
                    <div className="card-header">
                        <h3 className="panel-title">Department Management</h3>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setEditingDept(null);
                                setShowDeptModal(true);
                            }}
                        >
                            + Add Department
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>Department ID</th>
                                    <th>Department</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {departments.map((dept) => (
                                    <tr key={dept.id}>
                                        <td>{dept.id}</td>
                                        <td>{dept.name}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => handleEditDept(dept)}>✏️</button>
                                            <button className="btn-icon" onClick={() => handleArchiveDept(dept)}>📦</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Academic Years Tab */}
            {activeTab === 'academic-years' && (
                <div className="card">
                    <div className="card-header">
                        <h3>Academic Year Management</h3>
                        <button
                            className="btn btn-primary"
                            onClick={() => {
                                setEditingYear(null);
                                setShowYearModal(true);
                            }}
                        >
                            + Add Academic Year
                        </button>
                    </div>

                    {loading ? (
                        <div className="loading">Loading...</div>
                    ) : (
                        <table className="table">
                            <thead>
                                <tr>
                                    <th>ID</th>
                                    <th>Period</th>
                                    <th>Start Date</th>
                                    <th>End Date</th>
                                    <th>Actions</th>
                                </tr>
                            </thead>
                            <tbody>
                                {academicYears.map((year) => (
                                    <tr key={year.id}>
                                        <td>{year.id}</td>
                                        <td>{year.period}</td>
                                        <td>{new Date(year.start_date).toLocaleDateString()}</td>
                                        <td>{new Date(year.end_date).toLocaleDateString()}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => handleEditYear(year)}>✏️</button>
                                            <button className="btn-icon" onClick={() => handleArchiveYear(year)}>📦</button>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    )}
                </div>
            )}

            {/* Courses Tab (embedded Courses code copied from Courses.js) */}
            {activeTab === 'courses' && (
                <div className="card">
                    <CoursesPanel />
                </div>
            )}

            {/* Inline CoursesPanel component (copied from resources/js/components/pages/Courses.js) */}
            {/** The component below is intentionally defined inside Settings.js so the Courses UI appears under the Settings tabs. It keeps its own state and does not modify the original Courses.js file. **/}

            {/* Archive Tab */}
            {activeTab === 'archives' && (
                <div>
                    {loading ? (
                        <div className="loading">Loading archives...</div>
                    ) : (
                        <div>
                            {/* Archived Courses */}
                            <div className="card">
                                <div className="card-header"><h3>Archived Courses</h3></div>
                                <div className="card-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Course ID</th>
                                                <th>Course Name</th>
                                                <th>Department</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archives.filter(a => a.type === 'course').length === 0 ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No archived courses</td></tr>
                                            ) : (
                                                archives.filter(a => a.type === 'course').map(item => (
                                                    <tr key={`course-${item.id}`}>
                                                        <td>{item.id}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.department || ''}</td>
                                                        <td className="actions-cell">
                                                            <button className="btn btn-success" onClick={() => handleRestore('course', item.id, item.name)}>Restore</button>
                                                            <button className="btn btn-danger" onClick={() => handleDeletePermanent('course', item.id, item.name)}>Delete Permanently</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Archived Departments */}
                            <div className="card">
                                <div className="card-header"><h3>Archived Departments</h3></div>
                                <div className="card-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Department ID</th>
                                                <th>Department Name</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archives.filter(a => a.type === 'department').length === 0 ? (
                                                <tr><td colSpan="3" style={{ textAlign: 'center' }}>No archived departments</td></tr>
                                            ) : (
                                                archives.filter(a => a.type === 'department').map(item => (
                                                    <tr key={`dept-${item.id}`}>
                                                        <td>{item.id}</td>
                                                        <td>{item.name}</td>
                                                        <td className="actions-cell">
                                                            <button className="btn btn-success" onClick={() => handleRestore('department', item.id, item.name)}>Restore</button>
                                                            <button className="btn btn-danger" onClick={() => handleDeletePermanent('department', item.id, item.name)}>Delete Permanently</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Archived Academic Years */}
                            <div className="card">
                                <div className="card-header"><h3>Archived Academic Years</h3></div>
                                <div className="card-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Academic Year ID</th>
                                                <th>Period</th>
                                                <th>Start Date</th>
                                                <th>End Date</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archives.filter(a => a.type === 'academic_year').length === 0 ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No archived academic years</td></tr>
                                            ) : (
                                                archives.filter(a => a.type === 'academic_year').map(item => (
                                                    <tr key={`ay-${item.id}`}>
                                                        <td>{item.id}</td>
                                                        <td>{item.name || item.period}</td>
                                                        <td>{item.start_date ? new Date(item.start_date).toLocaleDateString() : ''}</td>
                                                        <td>{item.end_date ? new Date(item.end_date).toLocaleDateString() : ''}</td>
                                                        <td className="actions-cell">
                                                            <button className="btn btn-success" onClick={() => handleRestore('academic_year', item.id, item.name)}>Restore</button>
                                                            <button className="btn btn-danger" onClick={() => handleDeletePermanent('academic_year', item.id, item.name)}>Delete Permanently</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Archived Students */}
                            <div className="card">
                                <div className="card-header"><h3>Archived Students</h3></div>
                                <div className="card-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Student ID</th>
                                                <th>Name</th>
                                                <th>Course</th>
                                                <th>Year Level</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archives.filter(a => a.type === 'student').length === 0 ? (
                                                <tr><td colSpan="5" style={{ textAlign: 'center' }}>No archived students</td></tr>
                                            ) : (
                                                archives.filter(a => a.type === 'student').map(item => (
                                                    <tr key={`stu-${item.id}`}>
                                                        <td>{item.student_id || item.id}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.course || ''}</td>
                                                        <td>{item.year_level || ''}</td>
                                                        <td className="actions-cell">
                                                            <button className="btn btn-success" onClick={() => handleRestore('student', item.id, item.name)}>Restore</button>
                                                            <button className="btn btn-danger" onClick={() => handleDeletePermanent('student', item.id, item.name)}>Delete Permanently</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>

                            {/* Archived Faculty */}
                            <div className="card">
                                <div className="card-header"><h3>Archived Faculty</h3></div>
                                <div className="card-body">
                                    <table className="table">
                                        <thead>
                                            <tr>
                                                <th>Faculty ID</th>
                                                <th>Name</th>
                                                <th>Department</th>
                                                <th>Actions</th>
                                            </tr>
                                        </thead>
                                        <tbody>
                                            {archives.filter(a => a.type === 'faculty').length === 0 ? (
                                                <tr><td colSpan="4" style={{ textAlign: 'center' }}>No archived faculty</td></tr>
                                            ) : (
                                                archives.filter(a => a.type === 'faculty').map(item => (
                                                    <tr key={`fac-${item.id}`}>
                                                        <td>{item.faculty_id || item.id}</td>
                                                        <td>{item.name}</td>
                                                        <td>{item.department || ''}</td>
                                                        <td className="actions-cell">
                                                            <button className="btn btn-success" onClick={() => handleRestore('faculty', item.id, item.name)}>Restore</button>
                                                            <button className="btn btn-danger" onClick={() => handleDeletePermanent('faculty', item.id, item.name)}>Delete Permanently</button>
                                                        </td>
                                                    </tr>
                                                ))
                                            )}
                                        </tbody>
                                    </table>
                                </div>
                            </div>
                        </div>
                    )}
                </div>
            )}

            {showDeptModal && (
                <DepartmentModal
                    department={editingDept}
                    onClose={() => { setShowDeptModal(false); setEditingDept(null); fetchSettings(); window.dispatchEvent(new Event('dataChanged')); }}
                />
            )}

            {showYearModal && (
                <AcademicYearModal
                    academicYear={editingYear}
                    onClose={() => { setShowYearModal(false); setEditingYear(null); fetchSettings(); window.dispatchEvent(new Event('dataChanged')); }}
                />
            )}

            {notifyOpen && (
                <NotificationModal
                    title={notifyPayload.title}
                    message={notifyPayload.message}
                    onClose={() => setNotifyOpen(false)}
                />
            )}

            {confirmOpen && (
                <ConfirmModal
                    title={confirmPayload.action === 'restore' ? `Restore ${confirmPayload.name}` : (confirmPayload.action === 'archive' ? `Archive ${confirmPayload.name}` : `Delete ${confirmPayload.name}`)}
                    message={confirmPayload.action === 'restore' ? `Are you sure you want to restore ${confirmPayload.name || 'this record'}?` : (confirmPayload.action === 'archive' ? `Are you sure you want to archive ${confirmPayload.name || 'this record'}?` : `Are you sure you want to permanently delete ${confirmPayload.name || 'this record'}? This cannot be undone.`)}
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={handleConfirmAction}
                    confirmLabel={confirmPayload.action === 'restore' ? 'Restore' : (confirmPayload.action === 'archive' ? 'Archive' : 'Delete')}
                    cancelLabel="Cancel"
                />
            )}
        </main>
    );
}

export default Settings;
