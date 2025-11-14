require('./bootstrap');

import React from 'react';
import { createRoot } from 'react-dom/client';
import App from './components/App';

try {
	const container = document.getElementById('root');
	if (!container) throw new Error('Root container not found');
	const root = createRoot(container);
	root.render(<App />);
} catch (err) {
	console.error('App mount error:', err);
	try {
		fetch('/__client-error', {
			method: 'POST',
			headers: { 'Content-Type': 'application/json', 'X-CSRF-TOKEN': document.querySelector('meta[name="csrf-token"]')?.getAttribute('content') || '' },
			body: JSON.stringify({ message: err.message, stack: err.stack })
		});
	} catch (e) {
		// ignore
	}
}
