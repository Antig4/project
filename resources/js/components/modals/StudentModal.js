import React, { useState, useEffect } from 'react';
import axios from 'axios';

function StudentModal({ student, onClose }) {
    const [formData, setFormData] = useState({
        student_id: '',
        email: '',
        first_name: '',
        middle_name: '',
        last_name: '',
        phone: '',
        dob: '',
        enrollment_date: '',
        address: '',
        course_id: '',
        department_id: '',
        academic_year_id: '',
        year_level: '1st Year',
        status: 'Active'
    });
    const [courses, setCourses] = useState([]);
    const [departments, setDepartments] = useState([]);
    const [academicYears, setAcademicYears] = useState([]);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        fetchData();

        if (student) {
            // Split backend name into parts
            let first = '', middle = '', last = '';
            if (student.name) {
                const parts = student.name.split(' ');
                first = parts[0] || '';
                if (parts.length === 2) {
                    last = parts[1];
                } else if (parts.length > 2) {
                    middle = parts.slice(1, -1).join(' ');
                    last = parts[parts.length - 1];
                }
            }

            setFormData({
                student_id: student.student_id || '',
                email: student.email || '',
                first_name: first,
                middle_name: middle,
                last_name: last,
                phone: student.phone || '',
                dob: student.dob || '',
                enrollment_date: student.enrollment_date || '',
                address: student.address || '',
                course_id: student.course_id || '',
                department_id: student.department_id || '',
                academic_year_id: student.academic_year_id || '',
                year_level: student.year_level || '1st Year',
                status: student.status || 'Active'
            });
        } else {
            generateNextStudentId();
        }
    }, [student]);

    const fetchData = async () => {
        try {
            const token = localStorage.getItem('token');
            const [coursesRes, settingsRes] = await Promise.all([
                axios.get('/api/courses', { headers: { Authorization: `Bearer ${token}` } }),
                axios.get('/api/settings', { headers: { Authorization: `Bearer ${token}` } })
            ]);
            setCourses(coursesRes.data.courses || coursesRes.data || []);
            if (settingsRes.data) {
                setDepartments(settingsRes.data.departments || []);
                setAcademicYears(settingsRes.data.academicYears || settingsRes.data.academic_years || []);
            }
        } catch (error) {
            console.error('Error fetching data:', error);
        }
    };

    const generateNextStudentId = async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await axios.get('/api/students', { headers: { Authorization: `Bearer ${token}` } });
            const students = response.data || [];

            let maxNumber = 0;
            students.forEach(s => {
                const match = s.student_id && s.student_id.match(/STU(\d+)/);
                if (match) {
                    const num = parseInt(match[1], 10);
                    if (num > maxNumber) maxNumber = num;
                }
            });

            const nextNumber = maxNumber + 1;
            const nextId = 'STU' + String(nextNumber).padStart(3, '0');
            setFormData(prev => ({ ...prev, student_id: nextId }));
        } catch (error) {
            console.error('Error generating student ID:', error);
        }
    };

    const handleCourseChange = (e) => {
        const courseId = e.target.value;
        setFormData(prev => ({ ...prev, course_id: courseId }));

        if (courseId) {
            const selectedCourse = courses.find(c => c.id == courseId);
            if (selectedCourse && selectedCourse.department_id) {
                setFormData(prev => ({ ...prev, department_id: selectedCourse.department_id }));
            }
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        try {
            const token = localStorage.getItem('token');

            // Compose full name
            const parts = [formData.first_name.trim()];
            if (formData.middle_name && formData.middle_name.trim() !== '') parts.push(formData.middle_name.trim());
            if (formData.last_name && formData.last_name.trim() !== '') parts.push(formData.last_name.trim());
            const fullName = parts.filter(Boolean).join(' ');

            // Only send fields that exist in the migration / fillable
            const payload = {
                student_id: formData.student_id,
                name: fullName || formData.student_id,
                email: formData.email || null,
                phone: formData.phone || null,
                dob: formData.dob || null,
                enrollment_date: formData.enrollment_date || null,
                address: formData.address || null,
                year_level: formData.year_level,
                course_id: formData.course_id,
                department_id: formData.department_id,
                academic_year_id: formData.academic_year_id || null,
                status: formData.status
            };

            if (student) {
                await axios.put(`/api/students/${student.id}`, payload, { headers: { Authorization: `Bearer ${token}` } });
            } else {
                await axios.post('/api/students', payload, { headers: { Authorization: `Bearer ${token}` } });
            }

            onClose();
        } catch (error) {
            console.error('Error saving student:', error);
            alert('Failed to save student');
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="modal-overlay" onClick={onClose}>
            <div className="modal" onClick={(e) => e.stopPropagation()}>
                <div className="modal-header">
                    <h2>{student ? 'Edit Student' : 'Add New Student'}</h2>
                    <button className="modal-close" onClick={onClose}>&times;</button>
                </div>
                <form onSubmit={handleSubmit}>
                    <div className="modal-body">
                        <div className="form-grid">
                            <div className="form-group">
                                <label>Student ID (Auto-generated)</label>
                                <input type="text" value={formData.student_id} readOnly={!student} onChange={(e) => setFormData({...formData, student_id: e.target.value})} style={!student ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}} required />
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
                                <label>Date of Birth</label>
                                <input type="date" value={formData.dob} onChange={(e) => setFormData({...formData, dob: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>Enrollment Date</label>
                                <input type="date" value={formData.enrollment_date} onChange={(e) => setFormData({...formData, enrollment_date: e.target.value})} />
                            </div>

                            <div className="form-group full-width">
                                <label>Address</label>
                                <textarea value={formData.address} onChange={(e) => setFormData({...formData, address: e.target.value})} />
                            </div>

                            <div className="form-group">
                                <label>Course *</label>
                                <select value={formData.course_id} onChange={handleCourseChange} required>
                                    <option value="">Select Course</option>
                                    {courses.map(course => (
                                        <option key={course.id} value={course.id}>{course.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Department * (Auto-filled)</label>
                                <select value={formData.department_id} onChange={(e) => setFormData({...formData, department_id: e.target.value})} disabled={formData.course_id !== ''} required style={formData.course_id !== '' ? { backgroundColor: '#f5f5f5', cursor: 'not-allowed' } : {}}>
                                    <option value="">Select Department</option>
                                    {departments.map(dept => (
                                        <option key={dept.id} value={dept.id}>{dept.name}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Academic Year</label>
                                <select value={formData.academic_year_id} onChange={(e) => setFormData({...formData, academic_year_id: e.target.value})}>
                                    <option value="">Select Academic Year</option>
                                    {academicYears.map(ay => (
                                        <option key={ay.id} value={ay.id}>{ay.period || ay.name || ay.year}</option>
                                    ))}
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Year Level *</label>
                                <select value={formData.year_level} onChange={(e) => setFormData({...formData, year_level: e.target.value})} required>
                                    <option value="1st Year">1st Year</option>
                                    <option value="2nd Year">2nd Year</option>
                                    <option value="3rd Year">3rd Year</option>
                                    <option value="4th Year">4th Year</option>
                                </select>
                            </div>

                            <div className="form-group">
                                <label>Status *</label>
                                <select value={formData.status} onChange={(e) => setFormData({...formData, status: e.target.value})} required>
                                    <option value="Active">Active</option>
                                    <option value="Inactive">Inactive</option>
                                    <option value="Graduated">Graduated</option>
                                </select>
                            </div>
                        </div>
                    </div>
                    <div className="modal-footer">
                        <button type="button" className="btn btn-secondary" onClick={onClose}>Cancel</button>
                        <button type="submit" className="btn btn-primary" disabled={loading}>{loading ? 'Saving...' : (student ? 'Save Changes' : 'Add Student')}</button>
                    </div>
                </form>
            </div>
        </div>
    );
}

export default StudentModal;
