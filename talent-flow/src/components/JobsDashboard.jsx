import React, { useState, useEffect, useCallback, useRef } from 'react';
import { IconPlus, IconEdit, IconArchive, IconGripVertical } from './icons';
import { JobEditorModal } from './JobEditorModal';

export function JobsDashboard({ api }) {
    const [jobs, setJobs] = useState([]);
    const [totalJobs, setTotalJobs] = useState(0);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    
    const [filters, setFilters] = useState({ search: '', status: 'active', page: 1, pageSize: 10 });
    
    const [editingJob, setEditingJob] = useState(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    
    const dragItem = useRef(null);
    const dragOverItem = useRef(null);

    const fetchJobs = useCallback(async () => {
        setLoading(true);
        setError('');
        try {
            const { jobs: fetchedJobs, total } = await api.getJobs(filters);
            setJobs(fetchedJobs);
            setTotalJobs(total);
        } catch (err) {
            setError(err.message || 'Failed to fetch jobs.');
        } finally {
            setLoading(false);
        }
    }, [api, filters]);

    useEffect(() => {
        fetchJobs();
    }, [fetchJobs]);
    
    const handleFilterChange = (key, value) => {
        setFilters(prev => ({ ...prev, [key]: value, page: 1 }));
    };

    const handleSaveJob = async (jobData) => {
        if (jobData.id) { // Update
            await api.updateJob(jobData.id, jobData);
        } else { // Create
            await api.createJob(jobData);
        }
        fetchJobs(); // Refresh list
    };
    
    const handleToggleArchive = async (job) => {
        const originalStatus = job.status;
        const newStatus = originalStatus === 'active' ? 'archived' : 'active';
        
        // Optimistic update
        setJobs(prev => prev.map(j => j.id === job.id ? {...j, status: newStatus} : j));
        
        try {
            await api.updateJob(job.id, { status: newStatus });
            // If successful, refresh the list based on current filters
            if (filters.status && filters.status !== newStatus) {
                fetchJobs();
            }
        } catch(err) {
            // Rollback on failure
            setJobs(prev => prev.map(j => j.id === job.id ? {...j, status: originalStatus} : j));
            alert("Failed to update job status. Please try again.");
        }
    };
    
    const handleDragEnd = async () => {
        if (dragItem.current === null || dragOverItem.current === null || dragItem.current === dragOverItem.current) {
            return;
        }
        
        const fromJob = jobs.find(j => j.order === dragItem.current);
        const toJob = jobs.find(j => j.order === dragOverItem.current);
        
        const originalJobs = [...jobs];
        
        // Optimistic UI update
        let newJobs = [...jobs];
        const [draggedItem] = newJobs.splice(newJobs.indexOf(fromJob), 1);
        newJobs.splice(newJobs.indexOf(toJob), 0, draggedItem);
        setJobs(newJobs);
        
        try {
            await api.reorderJob({ fromOrder: fromJob.order, toOrder: toJob.order });
            // On success, refresh from server to get correct order values
            fetchJobs(); 
        } catch(err) {
            // Rollback
            setJobs(originalJobs);
            alert("Failed to reorder jobs. The server might be busy. Please try again.");
        } finally {
            dragItem.current = null;
            dragOverItem.current = null;
        }
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center mb-6 gap-4">
                <h1 className="text-3xl font-bold text-gray-800">Jobs Board</h1>
                 <button onClick={() => { setEditingJob(null); setIsModalOpen(true); }} className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-md shadow hover:bg-blue-700 transition">
                    <IconPlus className="w-5 h-5" />
                    Create Job
                </button>
            </div>
            
            {/* Filters */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg border">
                <input
                    type="text"
                    placeholder="Search by title..."
                    value={filters.search}
                    onChange={(e) => handleFilterChange('search', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md"
                />
                <select 
                    value={filters.status}
                    onChange={(e) => handleFilterChange('status', e.target.value)}
                    className="px-3 py-2 border border-gray-300 rounded-md bg-white"
                >
                    <option value="">All Statuses</option>
                    <option value="active">Active</option>
                    <option value="archived">Archived</option>
                </select>
            </div>
            
            {/* Jobs List */}
            {loading && <p>Loading jobs...</p>}
            {error && <p className="text-red-500">{error}</p>}
            {!loading && !error && (
                <div className="bg-white rounded-lg shadow overflow-hidden">
                    <ul className="divide-y divide-gray-200">
                    {jobs.map(job => (
                        <li 
                            key={job.id} 
                            className="p-4 flex flex-col md:flex-row items-start md:items-center justify-between gap-4 hover:bg-gray-50 transition"
                            draggable
                            onDragStart={() => dragItem.current = job.order}
                            onDragEnter={() => dragOverItem.current = job.order}
                            onDragEnd={handleDragEnd}
                            onDragOver={(e) => e.preventDefault()}
                        >
                            <div className="flex items-center gap-4 flex-grow">
                                <IconGripVertical className="w-6 h-6 text-gray-400 cursor-grab" />
                                <div>
                                    <h3 className="text-lg font-semibold text-gray-900">{job.title}</h3>
                                    <div className="flex flex-wrap gap-2 mt-1">
                                        {job.tags.map(tag => (
                                            <span key={tag} className="px-2 py-0.5 text-xs font-medium bg-blue-100 text-blue-800 rounded-full">{tag}</span>
                                        ))}
                                    </div>
                                </div>
                            </div>
                            <div className="flex items-center gap-3 self-end md:self-center">
                                <span className={`px-3 py-1 text-xs font-semibold rounded-full ${job.status === 'active' ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {job.status}
                                </span>
                                <button onClick={() => { setEditingJob(job); setIsModalOpen(true); }} className="p-2 text-gray-500 hover:text-blue-600 rounded-full hover:bg-gray-100">
                                    <IconEdit className="w-5 h-5"/>
                                </button>
                                <button onClick={() => handleToggleArchive(job)} className="p-2 text-gray-500 hover:text-yellow-600 rounded-full hover:bg-gray-100">
                                    <IconArchive className="w-5 h-5"/>
                                </button>
                            </div>
                        </li>
                    ))}
                    </ul>
                </div>
            )}

            <JobEditorModal
                show={isModalOpen}
                job={editingJob}
                onClose={() => setIsModalOpen(false)}
                onSave={handleSaveJob}
            />
        </div>
    );
}
