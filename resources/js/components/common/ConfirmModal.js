import React from 'react';

function ConfirmModal({ title, message, onCancel, onConfirm, confirmLabel = 'Delete', cancelLabel = 'Cancel', loading = false }) {
    return (
        <div className="modal-overlay" onClick={onCancel}>
            <div className="modal" onClick={(e) => e.stopPropagation()} style={{ maxWidth: '520px' }}>
                <div className="modal-header">
                    <h3>{title}</h3>
                </div>
                <div className="modal-body">
                    <p>{message}</p>
                </div>
                <div className="modal-footer" style={{ justifyContent: 'flex-end' }}>
                    <button className="btn btn-secondary" onClick={onCancel} disabled={loading}>{cancelLabel}</button>
                    <button className="btn btn-danger" onClick={onConfirm} disabled={loading} style={{ marginLeft: '8px' }}>{loading ? 'Please wait...' : confirmLabel}</button>
                </div>
            </div>
        </div>
    );
}

export default ConfirmModal;
