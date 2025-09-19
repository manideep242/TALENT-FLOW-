import { useState } from 'react';

export const useMockApi = () => {
    const CANDIDATE_STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];

    const generateSeedData = () => {
        console.log("Generating new seed data...");
        // Seed Jobs
        const jobs = Array.from({ length: 25 }, (_, i) => ({
            id: `job-${i + 1}`,
            title: `Software Engineer ${i + 1}`,
            slug: `software-engineer-${i + 1}`,
            status: Math.random() > 0.3 ? "active" : "archived",
            tags: ["React", "Node.js", "TypeScript"].slice(0, Math.floor(Math.random() * 3) + 1),
            order: i + 1,
        }));

        // Seed Candidates
        const candidates = Array.from({ length: 1000 }, (_, i) => ({
            id: `cand-${i + 1}`,
            name: `Candidate ${i + 1}`,
            email: `candidate${i + 1}@example.com`,
            jobId: `job-${Math.floor(Math.random() * 25) + 1}`,
            stage: CANDIDATE_STAGES[Math.floor(Math.random() * CANDIDATE_STAGES.length)],
        }));

        // Seed Assessments
        const assessments = {
            "job-1": {
                id: "assess-1",
                jobId: "job-1",
                questions: [
                    { id: 'q1', type: 'single-choice', label: 'Years of React experience?', options: ['0-1', '1-3', '3-5', '5+'], required: true },
                    { id: 'q2', type: 'multi-choice', label: 'Which state management libraries have you used?', options: ['Redux', 'MobX', 'Zustand', 'Context API'], required: true },
                    { id: 'q3', type: 'short-text', label: 'Link to your GitHub profile.', required: true },
                    { id: 'q4', type: 'long-text', label: 'Describe a challenging technical problem you solved.', required: false },
                    { id: 'q5', type: 'numeric', label: 'On a scale of 1-10, how proficient are you with TypeScript?', min: 1, max: 10, required: true },
                    { id: 'q6', type: 'file-upload', label: 'Upload your resume.', required: true },
                ]
            }
        };

        localStorage.setItem("talentflow_jobs", JSON.stringify(jobs));
        localStorage.setItem("talentflow_candidates", JSON.stringify(candidates));
        localStorage.setItem("talentflow_assessments", JSON.stringify(assessments));
        return { jobs, candidates, assessments };
    };

    const loadData = (key) => {
        try {
            const data = localStorage.getItem(key);
            return data ? JSON.parse(data) : null;
        } catch (error) {
            console.error(`Error loading data for ${key}:`, error);
            return null;
        }
    };
    
    // Initialize data on first load
    const [db, setDb] = useState(() => {
        let jobs = loadData("talentflow_jobs");
        let candidates = loadData("talentflow_candidates");
        let assessments = loadData("talentflow_assessments");
        
        if (!jobs || !candidates || !assessments) {
            return generateSeedData();
        }
        return { jobs, candidates, assessments };
    });

    const saveData = (key, data) => {
        localStorage.setItem(key, JSON.stringify(data));
        setDb(prevDb => ({...prevDb, [key.replace('talentflow_','')]: data }));
    };

    // Mock API call wrapper
    const mockRequest = (data, { errorRate = 0.1, minLatency = 200, maxLatency = 1200 } = {}) => {
        return new Promise((resolve, reject) => {
            const latency = Math.random() * (maxLatency - minLatency) + minLatency;
            setTimeout(() => {
                if (Math.random() < errorRate) {
                    reject(new Error("A random network error occurred."));
                } else {
                    resolve(data);
                }
            }, latency);
        });
    };
    
    // API methods
    const api = {
        getJobs: async ({ search = '', status = '', page = 1, pageSize = 10, sort = 'order' }) => {
            let filteredJobs = [...db.jobs];
            if (search) {
                filteredJobs = filteredJobs.filter(j => j.title.toLowerCase().includes(search.toLowerCase()));
            }
            if (status) {
                filteredJobs = filteredJobs.filter(j => j.status === status);
            }
            // Sorting
            filteredJobs.sort((a, b) => a[sort] > b[sort] ? 1 : -1);
            
            const paginatedJobs = filteredJobs.slice((page - 1) * pageSize, page * pageSize);
            return mockRequest({ jobs: paginatedJobs, total: filteredJobs.length });
        },
        createJob: async (jobData) => {
             const newJob = { 
                ...jobData, 
                id: `job-${Date.now()}`,
                slug: jobData.title.toLowerCase().replace(/\s+/g, '-'),
                order: db.jobs.length + 1,
                status: 'active',
                tags: jobData.tags || [],
             };
             const updatedJobs = [...db.jobs, newJob];
             await mockRequest(newJob);
             saveData("talentflow_jobs", updatedJobs);
             return newJob;
        },
        updateJob: async (jobId, updateData) => {
            const updatedJobs = db.jobs.map(j => j.id === jobId ? { ...j, ...updateData } : j);
            await mockRequest(updateData, { errorRate: 0.05 });
            saveData("talentflow_jobs", updatedJobs);
            return { ...db.jobs.find(j => j.id === jobId), ...updateData };
        },
        reorderJob: async ({ fromOrder, toOrder }) => {
            // This is a complex operation, simplified for the mock.
            // A real backend would handle reordering logic more robustly.
            await mockRequest({}, { errorRate: 0.2 }); // Higher error rate for testing rollback
            const items = [...db.jobs].sort((a,b) => a.order - b.order);
            const [reorderedItem] = items.splice(fromOrder - 1, 1);
            items.splice(toOrder - 1, 0, reorderedItem);
            const updatedJobs = items.map((job, index) => ({ ...job, order: index + 1 }));
            saveData("talentflow_jobs", updatedJobs);
            return updatedJobs;
        },
        getCandidates: async () => mockRequest(db.candidates),
        updateCandidateStage: async (candidateId, newStage) => {
            const updatedCandidates = db.candidates.map(c => c.id === candidateId ? { ...c, stage: newStage } : c);
            await mockRequest({ success: true }, { errorRate: 0.05 });
            saveData("talentflow_candidates", updatedCandidates);
            return { ...db.candidates.find(c => c.id === candidateId), stage: newStage };
        },
        getAssessment: async (jobId) => mockRequest(db.assessments[jobId] || null),
        saveAssessment: async (jobId, assessmentData) => {
            const updatedAssessments = { ...db.assessments, [jobId]: assessmentData };
            await mockRequest({ success: true });
            saveData("talentflow_assessments", updatedAssessments);
            return assessmentData;
        }
    };
    
    return api;
};
