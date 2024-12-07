import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import EditCandidateForm from './EditCandidateForm';
import DarkModeSwitcher from './DarkModeSwitcher';

function PowerUserDashboard() {
    const [email, setEmail] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        fetchCandidates();
    }, []);

    const fetchCandidates = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:3000/api/candidates');
            setCandidates(response.data);
        } catch (error) {
            setError('Failed to fetch candidates');
        } finally {
            setLoading(false);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await axios.post('http://localhost:3000/api/send-magic-link', { email });
            alert('Magic link sent successfully');
            setEmail('');
            setShowForm(false);
        } catch (error) {
            alert('Failed to send magic link');
        }
    };

    const handleEdit = (candidate) => setEditingCandidate(candidate);

    const handleUpdate = () => {
        setEditingCandidate(null);
        fetchCandidates();
    };

    const handleDelete = async (id) => {
        if (window.confirm('Are you sure you want to delete this candidate?')) {
            try {
                await axios.delete(`http://localhost:3000/api/candidates/${id}`);
                setCandidates(candidates.filter((candidate) => candidate.id !== id));
                alert('Candidate deleted successfully');
            } catch {
                alert('Failed to delete candidate');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token');
        localStorage.removeItem('user');
        navigate('/');
    };

    // Filter out candidates with role 'power_user'
    const filteredCandidates = candidates
        .filter(candidate => candidate.role === 'user') // Only show 'user' role candidates
        .sort((a, b) => a.id - b.id); // Sort by ID

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <header className="flex justify-between items-center p-6 border-b border-gray-300 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Power User Dashboard</h1>
                <div className="flex items-center">
                    <DarkModeSwitcher />
                    <button
                        onClick={handleLogout}
                        className="ml-4 bg-red-500 text-white px-4 py-2 rounded-lg hover:bg-red-600"
                    >
                        Logout
                    </button>
                </div>
            </header>

            <div className="container mx-auto p-4">
                <button
                    onClick={() => setShowForm(!showForm)}
                    className="mb-4 inline-flex items-center justify-center px-5 py-2.5 text-white bg-gradient-to-br from-cyan-500 to-blue-500 rounded-lg hover:from-cyan-600 hover:to-blue-600 focus:outline-none"
                >
                    {showForm ? 'Cancel' : 'Add Candidate'}
                </button>

                {showForm && (
                    <form onSubmit={handleSubmit} className="mb-4 flex gap-2">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Candidate Email"
                            required
                            className="flex-1 p-2 border rounded-lg"
                        />
                        <button
                            type="submit"
                            className="px-5 py-2.5 text-sm font-medium text-white inline-flex items-center bg-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 rounded-lg text-center dark:bg-blue-600 dark:hover:bg-blue-700 dark:focus:ring-blue-800"
                        >
                            <svg className="w-3.5 h-3.5 text-white me-2" aria-hidden="                            true" xmlns="http://www.w3.org/2000/svg" fill="currentColor" viewBox="0 0 20 16">
                                <path d="m10.036 8.278 9.258-7.79A1.979 1.979 0 0 0 18 0H2A1.987 1.987 0 0 0 .641.541l9.395 7.737Z"/>
                                <path d="M11.241 9.817c-.36.275-.801.425-1.255.427-.428 0-.845-.138-1.187-.395L0 2.6V14a2 2 0 0 0 2 2h16a2 2 0 0 0 2-2V2.5l-8.759 7.317Z"/>
                            </svg>
                            Send Magic Link
                        </button>
                    </form>
                )}

                {/* Search Box */}
                <div className="max-w-md mx-auto mb-4">
                    <label htmlFor="default-search" className="mb-2 text-sm font-medium text-gray-900 sr-only dark:text-white">Search</label>
                    <div className="relative">
                        <div className="absolute inset-y-0 start-0 flex items-center ps-3 pointer-events-none">
                            <svg className="w-4 h-4 text-gray-500 dark:text-gray-400" aria-hidden="true" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 20 20">
                                <path stroke="currentColor" strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="m19 19-4-4m0-7A7 7 0 1 1 1 8a7 7 0 0 1 14 0Z"/>
                            </svg>
                        </div>
                        <input
                            type="search"
                            id="default-search"
                            value={searchQuery}
                            onChange={(e) => setSearchQuery(e.target.value)}
                            className="block w-full p-4 ps-10 text-sm text-gray-900 border border-gray-300 rounded-lg bg-gray-50 focus:ring-blue-500 focus:border-blue-500 dark:bg-gray-700 dark:border-gray-600 dark:placeholder-gray-400 dark:text-white dark:focus:ring-blue-500 dark:focus:border-blue-500"
                            placeholder="Search Name, Email"
                            required
                        />
                    </div>
                </div>

                <h2 className="text-2xl font-bold text-gray-900 dark:text-white">All Candidates</h2>

                {loading ? (
                    <p className="text-gray-500">Loading candidates...</p>
                ) : error ? (
                    <p className="text-red-500">{error}</p>
                ) : filteredCandidates.length > 0 ? (
                    <table className="w-full text-sm text-left rtl:text-right text-gray-500 dark:text-gray-400">
                        <thead className="text-xs text-gray-900 uppercase dark:text-gray-400">
                            <tr>
                                <th scope="col" className="px-6 py-3">ID</th>
                                <th scope="col" className="px-6 py-3">Name</th>
                                <th scope="col" className="px-6 py-3">Email</th>
                                <th scope="col" className="px-6 py-3">Phone</th>
                                <th scope="col" className="px-6 py-3">Address</th>
                                <th scope="col" className="px-6 py-3">Resume</th>
                                <th scope="col" className="px-6 py-3">Actions</th>
                            </tr>
                        </thead>
                        <tbody>
                            {filteredCandidates.map((candidate) => (
                                <tr key={candidate.id} className="bg-white dark:bg-gray-800 hover:bg-gray-100">
                                    <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">
                                        {candidate.id}
                                    </td>
                                    <td className="px-6 py-4">{candidate.username}</td>
                                    <td className="px-6 py-4">{candidate.email}</td>
                                    <td className="px-6 py-4">{candidate.phone}</td>
                                    <td className="px-6 py-4">{candidate.address}</td>
                                    <td className="font-medium text-blue-600 dark:text-blue-500                                     hover:underline">
                                        <a
                                            href={`http://localhost:3000/${candidate.resume_path}`}
                                            target="_blank"
                                            rel="noopener noreferrer"
                                            className="text-blue-500 hover:underline"
                                        >
                                            View Resume
                                        </a>
                                    </td>
                                    <td className="px-6 py-4">
                                        {candidate.role !== 'admin' && (
                                            <button
                                                onClick={() => handleEdit(candidate)}
                                                className="text-yellow-400 hover:bg-yellow-500 border border-yellow-400 rounded-lg px-4 py-2 mr-2"
                                            >
                                                Edit
                                            </button>
                                        )}
                                        <button
                                            onClick={() => handleDelete(candidate.id)}
                                            className="text-red-400 hover:bg-red-500 border border-red-400 rounded-lg px-4 py-2"
                                        >
                                            Delete
                                        </button>
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500">No candidates found.</p>
                )}
            </div>

            {editingCandidate && (
                <EditCandidateForm
                    candidate={editingCandidate}
                    onUpdate={handleUpdate}
                    onClose={() => setEditingCandidate(null)}
                />
            )}
        </div>
    );
}

export default PowerUserDashboard;