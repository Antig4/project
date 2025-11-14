import React, { useState, useEffect } from 'react';
import axios from 'axios';

function FacultyModal({ faculty, onClose }) {
    const [formData, setFormData] = useState({
        faculty_id: '',
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        phone: '',
        department_id: '',
        position: '',
        hire_date: '',
        status: 'Active'
    });
    const [departments, setDepartments] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchDepartments();

        if (faculty) {
            // split name
            let first = '', middle = '', last = '';
            if (faculty.name) {
                const parts = faculty.name.split(' ');
                first = parts[0] || '';
                if (parts.length === 2) {
                    last = parts[1];
                } else if (parts.length > 2) {
                    middle = parts.slice(1, -1).join(' ');
                    last = parts[parts.length - 1];
                }
            }

            setFormData({
                faculty_id: faculty.faculty_id || '',
                email: faculty.email || '',
                first_name: first,
                middle_name: middle,
                last_name: last,
                phone: faculty.phone || '',
                department_id: faculty.department_id || '',
                position: faculty.position || '',
                hire_date: faculty.hire_date || '',
                status: faculty.status || 'Active'
            });
        } else {
            generateNextFacultyId();
        }
    }, [faculty]);

    const fetchDepartments = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/settings', { headers: { Authorization: `Bearer ${token}` } });
            setDepartments(response.data.departments || []);
        } catch (error) {
            console.error('Error fetching departments:', error);
        }
    };

    const generateNextFacultyId = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/faculty', { headers: { Authorization: `Bearer ${token}` } });
            const facultyList = response.data || [];
            
            let maxNumber = 0;
            facultyList.forEach(f => {
                const match = f.faculty_id && f.faculty_id.match(/FAC(\d+)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNumber) maxNumber = num;
                }
            });
            
            const nextNumber = maxNumber + 1;
            const nextId = 'FAC' + String(nextNumber).padStart(3, '0');
            setFormData(prev => ({ ...prev, faculty_id: nextId }));
        } catch (error) {
            console.error('Error generating faculty ID:', error);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            const parts = [formData.first_name.trim()];
            if (formData.middle_name && formData.middle_name.trim() !== '') parts.push(formData.middle_name.trim());
            if (formData.last_name && formData.last_name.trim() !== '') parts.push(formData.last_name.trim());
            const fullName = parts.filter(Boolean).join(' ');

            // Only send backend-supported fields
            const payload = {
                faculty_id: formData.faculty_id,
                name: fullName || formData.faculty_id,
                email: formData.email || null,
                phone: formData.phone || null,
                position: formData.position || null,
                hire_date: formData.hire_date || null,
                department_id: formData.department_id,
                status: formData.status
            };

            if (faculty) {
                await axios.put(`/api/faculty/${faculty.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post('/api/faculty', payload, { headers: { Authorization: `Bearer ${token}` } });
            }

            onClose();
        } catch (error) {
            console.error('Error saving faculty:', error);
            alert('Failed to save faculty member');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{faculty ? 'Edit Faculty' : 'Add New Faculty'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Faculty ID (Auto-generated)</label>
                                <input type="text" value={formData.faculty_id} readOnly={!faculty} onChange={(e) => setFormData({...formData, faculty_id: e.target.value})} style={!faculty ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}} required />
                            </div>

                            <div className="form-group">
                                <label>Email</label>
                                <input type="email" value={formData.email} onChange={(e) => setFormData({...formData, email: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>First Name *</label>
                                <input type="text" value={formData.first_name} onChange={(e) => setFormData({...formData, first_name: e.target.value})} required />
                            </div>

                            <div className="form-group">
                                <label>Middle Name</label>
                                <input type="text" value={formData.middle_name} onChange={(e) => setFormData({...formData, middle_name: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>Last Name *</label>
                                <input type="text" value={formData.last_name} onChange={(e) => setFormData({...formData, last_name: e.target.value})} required />
                            </div>

                            <div className="form-group">
                                <label>Phone</label>
                                <input type="text" value={formData.phone} onChange={(e) => setFormData({...formData, phone: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>Department *</label>
                                <select value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})} required>
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Position</label>
                                <input type="text" value={formData.position} onChange={(e) => setFormData({...formData, position: e.target.value})} placeholder="e.g., Dr., Prof." />
                            </div>

                            <div className="form-group">
                                <label>Hire Date</label>
                                <input type="date" value={formData.hire_date} onChange={(e) => setFormData({...formData, hire_date: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>Status *</label>
                                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (faculty ? 'Save Changes' : 'Add Faculty')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default FacultyModal;
