import React, { useState } from 'react';
import { IconBriefcase, IconUsers, IconClipboardList } from './components/icons';
import { JobsDashboard } from './components/JobsDashboard';
import { CandidatesDashboard } from './components/CandidatesDashboard';
import { AssessmentBuilder } from './components/AssessmentBuilder';
import { useMockApi } from './lib/mockApi';

export default function App() {
    const [view, setView] = useState('jobs'); // 'jobs', 'candidates', 'assessments'
    const api = useMockApi();
    
    const NavLink = ({ active, onClick, children, icon: Icon }) => (
         <button
            onClick={onClick}
            className={`flex items-center gap-3 px-4 py-2 rounded-lg font-semibold transition ${
                active
                    ? 'bg-blue-100 text-blue-700'
                    : 'text-gray-600 hover:bg-gray-100'
            }`}
        >
            <Icon className="w-6 h-6" />
            <span>{children}</span>
        </button>
    );

    return (
        <div className="min-h-screen bg-gray-50 font-sans text-gray-900">
            <header className="bg-white/80 backdrop-blur-lg border-b sticky top-0 z-40">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="flex justify-between items-center h-16">
                        <div className="flex items-center gap-2">
                            <IconBriefcase className="w-8 h-8 text-blue-600" />
                            <h1 className="text-2xl font-bold text-gray-800">TalentFlow</h1>
                        </div>
                         <nav className="flex items-center gap-2 sm:gap-4">
                            <NavLink active={view === 'jobs'} onClick={() => setView('jobs')} icon={IconBriefcase}>Jobs</NavLink>
                            <NavLink active={view === 'candidates'} onClick={() => setView('candidates')} icon={IconUsers}>Candidates</NavLink>
                            <NavLink active={view === 'assessments'} onClick={() => setView('assessments')} icon={IconClipboardList}>Assessments</NavLink>
                        </nav>
                    </div>
                </div>
            </header>
            <main>
                {view === 'jobs' && <JobsDashboard api={api} />}
                {view === 'candidates' && <CandidatesDashboard api={api} />}
                {view === 'assessments' && <AssessmentBuilder api={api} />}
            </main>
        </div>
    );
}
