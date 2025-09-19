import React, { useState, useEffect } from 'react';

export function JobEditorModal({ job, onClose, onSave, show }) {
    const [formData, setFormData] = useState({ title: '', tags: '' });
    const [isLoading, setIsLoading] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        if (job) {
            setFormData({
                title: job.title || '',
                tags: job.tags ? job.tags.join(', ') : '',
            });
        } else {
            // Reset for new job
            setFormData({ title: '', tags: '' });
        }
    }, [job]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setFormData(prev => ({ ...prev, [name]: value }));
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        if (!formData.title) {
            setError('Title is required.');
            return;
        }
        setIsLoading(true);
        try {
            await onSave({
                ...job,
                title: formData.title,
                tags: formData.tags.split(',').map(t => t.trim()).filter(Boolean),
            });
            onClose();
        } catch (err) {
            setError(err.message || 'Failed to save job.');
        } finally {
            setIsLoading(false);
        }
    };

    if (!show) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg shadow-xl w-full max-w-lg p-6 animate-fade-in-up">
                <h2 className="text-2xl font-bold mb-4 text-gray-800">{job ? 'Edit Job' : 'Create New Job'}</h2>
                <form onSubmit={handleSubmit}>
                    <div className="mb-4">
                        <label htmlFor="title" className="block text-sm font-medium text-gray-700 mb-1">Job Title</label>
                        <input
                            type="text"
                            id="title"
                            name="title"
                            value={formData.title}
                            onChange={handleChange}
                            className="input-field"
                            required
                        />
                    </div>
                    <div className="mb-6">
                        <label htmlFor="tags" className="block text-sm font-medium text-gray-700 mb-1">Tags (comma-separated)</label>
                        <input
                            type="text"
                            id="tags"
                            name="tags"
                            value={formData.tags}
                            onChange={handleChange}
                            className="input-field"
                        />
                    </div>
                    {error && <p className="text-red-500 text-sm mb-4">{error}</p>}
                    <div className="flex justify-end gap-3">
                        <button type="button" onClick={onClose} className="btn-secondary">Cancel</button>
                        <button type="submit" disabled={isLoading} className="btn-primary disabled:bg-blue-300">
                            {isLoading ? 'Saving...' : 'Save Job'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
