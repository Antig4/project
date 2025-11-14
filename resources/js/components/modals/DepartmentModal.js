import React, { useState, useEffect } from 'react';
import axios from 'axios';

function DepartmentModal({ department, onClose }) {
    const [name, setName] = useState('');
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (department) {
            setName(department.name);
        }
    }, [department]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (department) {
                await axios.put(`/api/departments/${department.id}`, { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/departments', { name }, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving department:', error);
            alert('Failed to save department');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{department ? 'Edit Department' : 'Add Department'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Department Name</label>
                            <input
                                type="text"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                required
                            />
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>
                            {loading ? 'Saving...' : 'Save'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default DepartmentModal;
