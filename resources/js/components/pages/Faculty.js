import React, { useState, useEffect } from 'react';
import axios from 'axios';
import FacultyModal from '../modals/FacultyModal';
import ConfirmModal from '../common/ConfirmModal';
import NotificationModal from '../common/NotificationModal';

function Faculty() {
    const [faculty, setFaculty] = useState([]);
    const [search, setSearch] = useState('');
    const [loading, setLoading] = useState(true);
    const [showModal, setShowModal] = useState(false);
    const [editingFaculty, setEditingFaculty] = useState(null);
    const [confirmOpen, setConfirmOpen] = useState(false);
    const [confirmPayload, setConfirmPayload] = useState({});
    const [notifyOpen, setNotifyOpen] = useState(false);
    const [notifyPayload, setNotifyPayload] = useState({});

    useEffect(() => {
        fetchFaculty();
    }, [search]);

    const fetchFaculty = async () => {
        try {
            const token = localStorage.getItem('token');
            const params = {};
            if (search) params.search = search;

            const response = await axios.get('/api/faculty', {
                headers: { Authorization: `Bearer ${token}` },
                params
            });
            setFaculty(response.data);
        } catch (error) {
            console.error('Error fetching faculty:', error);
        } finally {
            setLoading(false);
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
            fetchFaculty();
            window.dispatchEvent(new Event('dataChanged'));
            setNotifyPayload({ title: 'Archived', message: `${confirmPayload.name || 'Faculty member'} has been archived.` });
            setNotifyOpen(true);
        } catch (error) {
            console.error('Error archiving faculty:', error);
            alert('Failed to archive faculty member');
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
                </div>

                <div className="table-header">
                    <h3>Faculty ({faculty.length})</h3>
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
                            {faculty.map((member) => (
                                <tr key={member.id}>
                                    <td>{member.faculty_id}</td>
                                    <td>{member.name}</td>
                                    <td>{member.department?.name}</td>
                                    <td>
                                        <button className="btn-icon" onClick={() => handleEdit(member)}>✏️</button>
                                        <button className="btn-icon" onClick={() => handleArchive(member.id, member.name)}>📦</button>
                                    </td>
                                </tr>
                            ))}
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
