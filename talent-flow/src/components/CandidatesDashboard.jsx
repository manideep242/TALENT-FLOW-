import React, { useState, useEffect, useMemo, useRef } from 'react';

export function CandidatesDashboard({ api }) {
    const CANDIDATE_STAGES = ["applied", "screen", "tech", "offer", "hired", "rejected"];
    
    const [allCandidates, setAllCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [search, setSearch] = useState('');

    const dragItem = useRef(null);

    useEffect(() => {
        const fetchCandidates = async () => {
            setLoading(true);
            try {
                const data = await api.getCandidates();
                setAllCandidates(data);
            } catch (err) {
                setError(err.message || "Failed to load candidates.");
            } finally {
                setLoading(false);
            }
        };
        fetchCandidates();
    }, [api]);

    const filteredCandidates = useMemo(() => {
        return allCandidates.filter(c => 
            c.name.toLowerCase().includes(search.toLowerCase()) || 
            c.email.toLowerCase().includes(search.toLowerCase())
        );
    }, [allCandidates, search]);

    const handleDragEnd = async (candidateId, newStage) => {
        const originalCandidates = [...allCandidates];
        const candidate = allCandidates.find(c => c.id === candidateId);
        const originalStage = candidate.stage;

        // Optimistic update
        setAllCandidates(prev => prev.map(c => c.id === candidateId ? { ...c, stage: newStage } : c));

        try {
            await api.updateCandidateStage(candidateId, newStage);
        } catch (err) {
            // Rollback
            setAllCandidates(originalCandidates);
            alert("Failed to move candidate. Please try again.");
        }
    };
    
    const stageColorMap = {
        applied: "bg-gray-200", screen: "bg-blue-200", tech: "bg-indigo-200",
        offer: "bg-purple-200", hired: "bg-green-200", rejected: "bg-red-200"
    };

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <h1 className="text-3xl font-bold text-gray-800 mb-6">Candidates Kanban</h1>
            <input
                type="text"
                placeholder="Search by name or email..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="w-full max-w-md mb-6 px-4 py-2 border border-gray-300 rounded-md"
            />
            
            {loading && <p>Loading candidates...</p>}
            {error && <p className="text-red-500">{error}</p>}
            
            {!loading && !error && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-5">
                    {CANDIDATE_STAGES.map(stage => (
                        <div 
                            key={stage} 
                            className={`rounded-lg p-3 ${stageColorMap[stage]}`}
                            onDragOver={(e) => e.preventDefault()}
                            onDrop={() => handleDragEnd(dragItem.current, stage)}
                        >
                            <h2 className="font-bold capitalize text-gray-800 mb-4">{stage} ({filteredCandidates.filter(c => c.stage === stage).length})</h2>
                            <div className="space-y-3 h-96 overflow-y-auto">
                                {filteredCandidates.filter(c => c.stage === stage).map(candidate => (
                                    <div 
                                        key={candidate.id}
                                        className="bg-white p-3 rounded-md shadow cursor-grab"
                                        draggable
                                        onDragStart={() => dragItem.current = candidate.id}
                                    >
                                        <p className="font-semibold text-gray-900">{candidate.name}</p>
                                        <p className="text-sm text-gray-600 truncate">{candidate.email}</p>
                                    </div>
                                ))}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
