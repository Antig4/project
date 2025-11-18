import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import StudentModal from '../modals/StudentModal';
import ConfirmModal from '../common/ConfirmModal';
import NotificationModal from '../common/NotificationModal';

function Students() {
    const [students, setStudents] = useState([]);
    const [search, setSearch] = useState('');
    const [statusFilter, setStatusFilter] = useState('All Status');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingStudent, setEditingStudent] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState({});
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyPayload, setNotifyPayload] = useState({});

    // Fetch all students once and apply client-side filtering/search for instant UI response
    useEffect(() => {
        fetchStudents();
    }, []);

    const fetchStudents = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/students', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setStudents(response.data || []);
        } catch (error) {
            console.error('Error fetching students:', error);
        } finally {
            setLoading(false);
        }
    };

    // ✅ Changed from delete → archive
    const handleArchive = (id, name) => {
        setConfirmPayload({ type: 'student-archive', id, name });
        setConfirmOpen(true);
    };

    const confirmArchive = async () => {
        const { id } = confirmPayload;
        setConfirmOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/students/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            // refresh from server
            await fetchStudents();
            window.dispatchEvent(new Event('dataChanged'));
            setNotifyPayload({ title: 'Archived', message: `${confirmPayload.name || 'Student'} has been archived.` });
            setNotifyOpen(true);
        } catch (error) {
            console.error('Error archiving student:', error);
            setNotifyPayload({ title: 'Error', message: 'Failed to archive student.' });
            setNotifyOpen(true);
        }
    };

    const handleEdit = (student) => {
        setEditingStudent(student);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingStudent(null);
        setShowModal(true);
    };

    const handleModalClose = () => {
    setShowModal(false);
    setEditingStudent(null);
    fetchStudents();
    window.dispatchEvent(new Event('dataChanged'));
    };

    // Derived filtered list based on search and status
    const visibleStudents = useMemo(() => {
        const q = (search || '').toString().toLowerCase().trim();
        return (students || []).filter(s => {
            // Filter by status
            if (statusFilter && statusFilter !== 'All Status') {
                if (((s.status || '').toString().toLowerCase()) !== statusFilter.toString().toLowerCase()) return false;
            }

            // Search by name or student id
            if (q) {
                const name = (s.name || '').toString().toLowerCase();
                const sid = (s.student_id || '').toString().toLowerCase();
                return name.includes(q) || sid.includes(q);
            }

            return true;
        });
    }, [students, search, statusFilter]);

    return (
        <main className="main-content">
            <header className="page-header">
                <h1>Student Management</h1>
                <button className="btn btn-primary" onClick={handleAdd}>+ Add Student</button>
            </header>

            <div className="card">
                <div className="filters">
                    <div className="filter-group">
                        <label>Search Students</label>
                        <input
                            type="text"
                            placeholder="Search by name or Student ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Filter by Status</label>
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value)}
                        >
                            <option>All Status</option>
                            <option>Active</option>
                            <option>Inactive</option>
                            <option>Graduated</option>
                        </select>
                    </div>
                </div>

                <div className="table-header">
                    <h3>Students ({visibleStudents.length})</h3>
                </div>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
                    <table className="table">
                        <thead>
                            <tr>
                                <th>Student ID</th>
                                <th>Name</th>
                                <th>Year Level</th>
                                <th>Course</th>
                                <th>Department</th>
                                <th>Status</th>
                                <th>Actions</th>
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
                                        <span className={`badge badge-${(student.status || '').toString().toLowerCase()}`}>
                                            {student.status}
                                        </span>
                                    </td>
                                    <td>
                                        <button className="btn-icon" onClick={() => handleEdit(student)}>✏️</button>
                                        <button className="btn-icon" onClick={() => handleArchive(student.id, student.name)}>📦</button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <StudentModal
                    student={editingStudent}
                    onClose={handleModalClose}
                />
            )}

            {confirmOpen && (
                <ConfirmModal
                    title={confirmPayload.name ? `Archive ${confirmPayload.name}` : 'Archive Student'}
                    message={`Are you sure you want to archive ${confirmPayload.name || 'this student'}?`}
                    onCancel={() => setConfirmOpen(false)}
                    onConfirm={confirmArchive}
                    confirmLabel="Archive"
                    cancelLabel="Cancel"
                />
            )}

            {notifyOpen && (
                <NotificationModal
                    title={notifyPayload.title}
                    message={notifyPayload.message}
                    onClose={() => setNotifyOpen(false)}
                />
            )}
        </main>
    );
}

export default Students;
