import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';

function MyProfile() {
    const [user, setUser] = useState(null);
    const [editing, setEditing] = useState(false);
    const [formData, setFormData] = useState({
        first_name: '',
        middle_name: '',
        last_name: '',
        email: '',
        phone: ''
    });
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [passwordConfirm, setPasswordConfirm] = useState('');
    const [avatarFile, setAvatarFile] = useState(null);
    const fileInputRef = useRef(null);

    useEffect(() => {
        const userData = localStorage.getItem('user');
        if (userData) {
            const parsedUser = JSON.parse(userData);
            setUser(parsedUser);
            setFormData({
                first_name: parsedUser.first_name || 'Jendope',
                middle_name: parsedUser.middle_name || 'D.',
                last_name: parsedUser.last_name || 'Tug',
                email: parsedUser.email || 'admin@university.edu',
                phone: parsedUser.phone || '+1 (555) 123-4567'
            });
            // username already set above
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('name', username);
            data.append('first_name', formData.first_name);
            data.append('middle_name', formData.middle_name);
            data.append('last_name', formData.last_name);
            data.append('email', formData.email);
            data.append('phone', formData.phone);
            if (password) {
                data.append('password', password);
                data.append('password_confirmation', passwordConfirm);
            }
            if (avatarFile) data.append('avatar', avatarFile);

            const response = await axios.post('/api/user/update', data, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            setEditing(false);
            alert('Profile updated');
        } catch (err) {
            console.error('Error updating profile:', err.response || err);
            alert(err.response?.data?.message || 'Failed to update profile');
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

    // Handle avatar selection from hidden file input (clicking avatar triggers this)
    const handleAvatarSelect = async (e) => {
        const file = e.target.files && e.target.files[0];
        if (!file) return;
        try {
            const token = localStorage.getItem('token');
            const data = new FormData();
            data.append('avatar', file);

            const response = await axios.post('/api/user/update', data, {
                headers: { Authorization: `Bearer ${token}`, 'Content-Type': 'multipart/form-data' }
            });

            const updatedUser = response.data.user;
            localStorage.setItem('user', JSON.stringify(updatedUser));
            setUser(updatedUser);
            alert('Avatar updated');
        } catch (err) {
            console.error('Error uploading avatar:', err.response || err);
            alert('Failed to upload avatar');
        }
    };

    const triggerAvatarPicker = () => {
        if (fileInputRef.current) fileInputRef.current.click();
    };

    return (
        <main className="main-content">
            <header className="page-header">
                <h1>My Profile</h1>
            </header>

            <div className="profile-container">
                <div className="profile-sidebar">
                    <div className="profile-avatar" onClick={triggerAvatarPicker} style={{cursor: 'pointer'}}>
                        {user?.avatar ? (
                            <img src={user.avatar} alt="avatar" style={{width: '100%', height: '100%', borderRadius: '50%'}} />
                        ) : (
                            <svg viewBox="0 0 24 24" fill="currentColor">
                                <path fillRule="evenodd" d="M10 9a3 3 0 100-6 3 3 0 000 6zm-7 9a7 7 0 1114 0H3z" clipRule="evenodd"/>
                            </svg>
                        )}
                        <input ref={fileInputRef} type="file" accept="image/*" style={{display: 'none'}} onChange={handleAvatarSelect} />
                    </div>
                    <div className="profile-name">{user?.name || 'admin'}</div>
                    <div className="profile-role">Admin</div>
                    
                    <div className="profile-contact">
                        <div className="contact-item">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2.003 5.884L10 9.882l7.997-3.998A2 2 0 0016 4H4a2 2 0 00-1.997 1.884z"/>
                                <path d="M18 8.118l-8 4-8-4V14a2 2 0 002 2h12a2 2 0 002-2V8.118z"/>
                            </svg>
                            {formData.email}
                        </div>
                        <div className="contact-item">
                            <svg width="16" height="16" fill="currentColor" viewBox="0 0 20 20">
                                <path d="M2 3a1 1 0 011-1h2.153a1 1 0 01.986.836l.74 4.435a1 1 0 01-.54 1.06l-1.548.773a11.037 11.037 0 006.105 6.105l.774-1.548a1 1 0 011.059-.54l4.435.74a1 1 0 01.836.986V17a1 1 0 01-1 1h-2C7.82 18 2 12.18 2 5V3z"/>
                            </svg>
                            {formData.phone}
                        </div>
                    </div>

                    <button className="btn btn-danger btn-block" onClick={handleLogout}>
                        Logout
                    </button>
                </div>

                <div className="profile-main">
                    <div className="card">
                        <div className="card-header">
                            <h3>Profile Information</h3>
                            <button className="btn btn-primary" onClick={() => setEditing(!editing)}>
                                {editing ? 'Cancel' : '✏️ Edit Profile'}
                            </button>
                        </div>

                        {editing ? (
                            <form onSubmit={handleSubmit}>
                                <div className="form-section">
                                    <h4>Personal Information</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>First Name</label>
                                            <input
                                                type="text"
                                                value={formData.first_name}
                                                onChange={(e) => setFormData({...formData, first_name: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Middle Name</label>
                                            <input
                                                type="text"
                                                value={formData.middle_name}
                                                onChange={(e) => setFormData({...formData, middle_name: e.target.value})}
                                            />
                                        </div>
                                        <div className="form-group">
                                            <label>Last Name</label>
                                            <input
                                                type="text"
                                                value={formData.last_name}
                                                onChange={(e) => setFormData({...formData, last_name: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Account Settings</h4>
                                    <div className="form-row">
                                        <div className="form-group">
                                            <label>Username</label>
                                            <input type="text" value={username} onChange={(e) => setUsername(e.target.value)} />
                                        </div>
                                        <div className="form-group">
                                            <label>Email</label>
                                            <input
                                                type="email"
                                                value={formData.email}
                                                onChange={(e) => setFormData({...formData, email: e.target.value})}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-group">
                                        <label>Phone</label>
                                        <input
                                            type="text"
                                            value={formData.phone}
                                            onChange={(e) => setFormData({...formData, phone: e.target.value})}
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label>Avatar</label>
                                        <input type="file" accept="image/*" onChange={(e) => setAvatarFile(e.target.files[0])} />
                                    </div>
                                    <div className="form-group">
                                        <label>New Password (leave blank to keep)</label>
                                        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} />
                                    </div>
                                    <div className="form-group">
                                        <label>Confirm Password</label>
                                        <input type="password" value={passwordConfirm} onChange={(e) => setPasswordConfirm(e.target.value)} />
                                    </div>
                                </div>

                                <button type="submit" className="btn btn-primary">Save Changes</button>
                            </form>
                        ) : (
                            <div>
                                <div className="form-section">
                                    <h4>Personal Information</h4>
                                    <div className="info-row">
                                        <div className="info-item">
                                            <label>First Name</label>
                                            <div>{formData.first_name}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Middle Name</label>
                                            <div>{formData.middle_name}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Last Name</label>
                                            <div>{formData.last_name}</div>
                                        </div>
                                    </div>
                                </div>

                                <div className="form-section">
                                    <h4>Account Settings</h4>
                                    <div className="info-row">
                                        <div className="info-item">
                                            <label>Username</label>
                                            <div>{user?.name || 'admin'}</div>
                                        </div>
                                        <div className="info-item">
                                            <label>Email</label>
                                            <div>{formData.email}</div>
                                        </div>
                                    </div>
                                    <div className="info-item">
                                        <label>Phone</label>
                                        <div>{formData.phone}</div>
                                    </div>
                                </div>

                                {/* Password & Security info removed — password can be changed in Edit Profile */}
                            </div>
                        )}
                    </div>
                </div>
            </div>
        </main>
    );
}

export default MyProfile;
