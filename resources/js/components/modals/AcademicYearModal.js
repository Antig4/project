import React, { useState, useEffect } from 'react';
import axios from 'axios';

function AcademicYearModal({ academicYear, onClose }) {
    const [formData, setFormData] = useState({
        period: '',
        start_date: '',
        end_date: ''
    });
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (academicYear) {
            setFormData({
                period: academicYear.period,
                start_date: academicYear.start_date,
                end_date: academicYear.end_date
            });
        }
    }, [academicYear]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');
            if (academicYear) {
                await axios.put(`/api/academic-years/${academicYear.id}`, formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            } else {
                await axios.post('/api/academic-years', formData, {
                    headers: { Authorization: `Bearer ${token}` }
                });
            }
            onClose();
        } catch (error) {
            console.error('Error saving academic year:', error);
            alert('Failed to save academic year');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{academicYear ? 'Edit Academic Year' : 'Add Academic Year'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-group">
                            <label>Period</label>
                            <input
                                type="text"
                                placeholder="e.g., 2024 - 2025"
                                value={formData.period}
                                onChange={(e) => setFormData({...formData, period: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>Start Date</label>
                            <input
                                type="date"
                                value={formData.start_date}
                                onChange={(e) => setFormData({...formData, start_date: e.target.value})}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label>End Date</label>
                            <input
                                type="date"
                                value={formData.end_date}
                                onChange={(e) => setFormData({...formData, end_date: e.target.value})}
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

export default AcademicYearModal;
