import React, { useState, useEffect } from 'react';
import { IconTrash } from './icons';

export function AssessmentBuilder({ api, initialJobId = 'job-1' }) {
    const [assessment, setAssessment] = useState(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    
    useEffect(() => {
        const fetchAssessment = async () => {
            setLoading(true);
            const data = await api.getAssessment(initialJobId);
            setAssessment(data || { id: `assess-${initialJobId}`, jobId: initialJobId, questions: [] });
            setLoading(false);
        };
        fetchAssessment();
    }, [api, initialJobId]);
    
    const addQuestion = (type) => {
        const newQuestion = {
            id: `q-${Date.now()}`,
            type,
            label: `New ${type.replace('-', ' ')} question`,
            required: false,
        };
        if(type === 'single-choice' || type === 'multi-choice') newQuestion.options = ['Option 1', 'Option 2'];
        if(type === 'numeric') { newQuestion.min = 0; newQuestion.max = 10; }
        
        setAssessment(prev => ({...prev, questions: [...prev.questions, newQuestion]}));
    };
    
    const updateQuestion = (qId, field, value) => {
        setAssessment(prev => ({
            ...prev,
            questions: prev.questions.map(q => q.id === qId ? { ...q, [field]: value } : q)
        }));
    };
    
     const updateOption = (qId, optIndex, value) => {
        setAssessment(prev => ({
            ...prev,
            questions: prev.questions.map(q => {
                if (q.id === qId) {
                    const newOptions = [...q.options];
                    newOptions[optIndex] = value;
                    return { ...q, options: newOptions };
                }
                return q;
            })
        }));
    };

    const removeQuestion = (qId) => {
        setAssessment(prev => ({...prev, questions: prev.questions.filter(q => q.id !== qId)}));
    };

    const handleSave = async () => {
        setSaving(true);
        try {
            await api.saveAssessment(initialJobId, assessment);
            alert("Assessment saved successfully!");
        } catch(err) {
            alert("Failed to save assessment.");
        } finally {
            setSaving(false);
        }
    };
    
    const questionTypes = ['short-text', 'long-text', 'single-choice', 'multi-choice', 'numeric', 'file-upload'];

    if(loading) return <p className="p-8">Loading assessment builder...</p>;

    return (
        <div className="p-4 sm:p-6 lg:p-8">
            <div className="flex justify-between items-center mb-6">
                <h1 className="text-3xl font-bold text-gray-800">Assessment Builder (Job: {initialJobId})</h1>
                <button onClick={handleSave} disabled={saving} className="px-5 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:bg-blue-300">
                    {saving ? 'Saving...' : 'Save Assessment'}
                </button>
            </div>
            
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
                {/* Builder Controls */}
                <div className="bg-white p-6 rounded-lg shadow-lg">
                    <h2 className="text-xl font-bold mb-4">Questions</h2>
                    <div className="space-y-4">
                        {assessment.questions.map((q) => (
                            <div key={q.id} className="p-4 border rounded-md bg-gray-50">
                                <input 
                                    type="text"
                                    value={q.label}
                                    onChange={(e) => updateQuestion(q.id, 'label', e.target.value)}
                                    className="w-full font-semibold border-b p-1 mb-2"
                                />
                                <p className="text-xs text-gray-500 capitalize mb-2">{q.type.replace('-', ' ')}</p>

                                {(q.type === 'single-choice' || q.type === 'multi-choice') && (
                                    <div className="space-y-1 ml-4 mt-2">
                                        {q.options.map((opt, i) => (
                                            <input 
                                                key={i}
                                                type="text"
                                                value={opt}
                                                onChange={(e) => updateOption(q.id, i, e.target.value)}
                                                className="w-full text-sm p-1 border-b"
                                            />
                                        ))}
                                    </div>
                                )}
                                
                                <div className="mt-4 flex justify-between items-center">
                                    <label className="flex items-center text-sm gap-2">
                                        <input type="checkbox" checked={q.required} onChange={(e) => updateQuestion(q.id, 'required', e.target.checked)} />
                                        Required
                                    </label>
                                    <button onClick={() => removeQuestion(q.id)} className="p-1 text-gray-400 hover:text-red-500">
                                        <IconTrash className="w-4 h-4" />
                                    </button>
                                </div>
                            </div>
                        ))}
                    </div>
                    <div className="mt-6 border-t pt-4">
                        <h3 className="font-semibold mb-2">Add New Question</h3>
                        <div className="flex flex-wrap gap-2">
                            {questionTypes.map(type => (
                                <button key={type} onClick={() => addQuestion(type)} className="px-3 py-1 text-sm bg-gray-200 hover:bg-gray-300 rounded-md capitalize">
                                    {type.replace('-', ' ')}
                                </button>
                            ))}
                        </div>
                    </div>
                </div>

                {/* Live Preview */}
                <div className="bg-gray-100 p-6 rounded-lg border-2 border-dashed">
                     <h2 className="text-xl font-bold mb-4 text-center text-gray-600">Live Preview</h2>
                     <div className="bg-white p-6 rounded-lg shadow-inner max-w-lg mx-auto space-y-6">
                         {assessment.questions.map(q => (
                             <div key={q.id}>
                                <label className="block font-medium text-gray-700">
                                    {q.label} {q.required && <span className="text-red-500">*</span>}
                                </label>
                                {q.type === 'short-text' && <input type="text" className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />}
                                {q.type === 'long-text' && <textarea className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" rows="3"></textarea>}
                                {q.type === 'numeric' && <input type="number" min={q.min} max={q.max} className="mt-1 w-full px-3 py-2 border border-gray-300 rounded-md" />}
                                {q.type === 'file-upload' && <input type="file" className="mt-1 w-full text-sm" />}
                                {q.type === 'single-choice' && (
                                    <div className="mt-2 space-y-2">
                                        {q.options.map((opt, i) => <label key={i} className="flex items-center gap-2"><input type="radio" name={q.id} /> {opt}</label>)}
                                    </div>
                                )}
                                {q.type === 'multi-choice' && (
                                    <div className="mt-2 space-y-2">
                                        {q.options.map((opt, i) => <label key={i} className="flex items-center gap-2"><input type="checkbox" /> {opt}</label>)}
                                    </div>
                                )}
                             </div>
                         ))}
                         <button type="submit" className="w-full bg-blue-600 text-white py-2 rounded-md mt-6">Submit</button>
                     </div>
                </div>
            </div>
        </div>
    );
}
