import React, { useState, useEffect, useMemo } from 'react';
import axios from 'axios';
import FacultyModal from '../modals/FacultyModal';
import ConfirmModal from '../common/ConfirmModal';
import NotificationModal from '../common/NotificationModal';

function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [search, setSearch] = useState('');
    const [departmentFilter, setDepartmentFilter] = useState('All Departments');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState({});
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyPayload, setNotifyPayload] = useState({});

    // fetch faculty and departments once; apply client-side filtering for search & department
    useEffect(() => {
        fetchFaculty();
        fetchDepartments();
    }, []);

    const fetchFaculty = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/faculty', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setFaculty(response.data || []);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        } finally {
            setLoading(false);
        }
    };

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/settings', {
                headers: { Authorization: `Bearer ${token}` }
            });
            setDepartments(response.data.departments || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const handleArchive = (id, name) => {
        setConfirmPayload({ type: 'faculty-archive', id, name });
        setConfirmOpen(true);
    };

    const confirmArchive = async () => {
        const { id } = confirmPayload;
        setConfirmOpen(false);
        try {
            const token = localStorage.getItem('token');
            await axios.delete(`/api/faculty/${id}`, { headers: { Authorization: `Bearer ${token}` } });
            await fetchFaculty();
            window.dispatchEvent(new Event('dataChanged'));
            setNotifyPayload({ title: 'Archived', message: `${confirmPayload.name || 'Faculty member'} has been archived.` });
            setNotifyOpen(true);
        } catch (error) {
            console.error('Error archiving faculty:', error);
            setNotifyPayload({ title: 'Error', message: 'Failed to archive faculty member' });
            setNotifyOpen(true);
        }
    };

    const handleEdit = (member) => {
        setEditingFaculty(member);
        setShowModal(true);
    };

    const handleAdd = () => {
        setEditingFaculty(null);
        setShowModal(true);
    };

    const handleModalClose = () => {
    setShowModal(false);
    setEditingFaculty(null);
    fetchFaculty();
    window.dispatchEvent(new Event('dataChanged'));
    };

    return (
        <main className="main-content">
            <header className="page-header">
                <h1>Faculty Management</h1>
                <button className="btn btn-primary" onClick={handleAdd}>+ Add Faculty</button>
            </header>

            <div className="card">
                <div className="filters">
                    <div className="filter-group">
                        <label>Search Faculty</label>
                        <input
                            type="text"
                            placeholder="Search by name or faculty ID..."
                            value={search}
                            onChange={(e) => setSearch(e.target.value)}
                        />
                    </div>
                    <div className="filter-group">
                        <label>Filter by Department</label>
                        <select value={departmentFilter} onChange={(e) => setDepartmentFilter(e.target.value)}>
                            <option>All Departments</option>
                            {departments.map((d) => (
                                <option key={d.id} value={d.id}>{d.name}</option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="table-header">
                    <h3>Faculty ({(faculty || []).length})</h3>
                </div>

                {loading ? (
                    <div className="loading">Loading...</div>
                ) : (
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
                            {(useMemo ? (function(){}) : null) /* placeholder to keep patch engine happy */}
                            {(() => {
                                const q = (search || '').toString().toLowerCase().trim();
                                return (faculty || []).filter(m => {
                                    if (departmentFilter && departmentFilter !== 'All Departments') {
                                        if ((m.department?.id || m.department_id || '').toString() !== departmentFilter.toString()) return false;
                                    }
                                    if (q) {
                                        const name = (m.name || '').toString().toLowerCase();
                                        const fid = (m.faculty_id || '').toString().toLowerCase();
                                        return name.includes(q) || fid.includes(q);
                                    }
                                    return true;
                                }).map((member) => (
                                    <tr key={member.id}>
                                        <td>{member.faculty_id}</td>
                                        <td>{member.name}</td>
                                        <td>{member.department?.name}</td>
                                        <td>
                                            <button className="btn-icon" onClick={() => handleEdit(member)}>✏️</button>
                                            <button className="btn-icon" onClick={() => handleArchive(member.id, member.name)}>📦</button>
                                        </td>
                                    </tr>
                                ));
                            })()}
                        </tbody>
                    </table>
                )}
            </div>

            {showModal && (
                <FacultyModal
                    faculty={editingFaculty}
                    onClose={handleModalClose}
                />
            )}

            {confirmOpen && (
                <ConfirmModal
                    title={confirmPayload.name ? `Archive ${confirmPayload.name}` : 'Archive Faculty'}
                    message={`Are you sure you want to archive ${confirmPayload.name || 'this faculty member'}?`}
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

export default Faculty;
