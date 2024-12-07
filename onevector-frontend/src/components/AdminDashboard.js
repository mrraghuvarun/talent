import React, { useState, useEffect } from 'react';
import axios from 'axios';
import EditCandidateForm from './EditCandidateForm';
import DarkModeSwitcher from './DarkModeSwitcher';
import { useNavigate } from 'react-router-dom';
import MagicLinkHistoryPopup from './MagicLinkHistoryPopup';

function AdminDashboard() {
    const [email, setEmail] = useState('');
    const [candidates, setCandidates] = useState([]);
    const [loading, setLoading] = useState(true);
    const [editingCandidate, setEditingCandidate] = useState(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [showForm, setShowForm] = useState(false);
    const [error, setError] = useState('');
    const navigate = useNavigate();
    const [showHistoryPopup, setShowHistoryPopup] = useState(false);
const [magicLinks, setMagicLinks] = useState([]);


    useEffect(() => {
        fetchCandidates();
    }, []);
    const fetchMagicLinks = async () => {
        try {
            const response = await axios.get('http://localhost:3000/api/magic-links');
            setMagicLinks(response.data);
            setShowHistoryPopup(true);
        } catch (error) {
            alert('Failed to fetch magic links');
            console.error('Fetch error:', error);
        }
    };
    

    const fetchCandidates = async () => {
        setLoading(true);
        setError('');
        try {
            const response = await axios.get('http://localhost:3000/api/candidates');
            // Filter candidates for 'power_user' and 'user' roles
            const filteredCandidates = response.data.filter(candidate => 
                candidate.role === 'power_user' || candidate.role === 'user'
            );

            // Sort candidates: power_user first, then user
            const sortedCandidates = filteredCandidates.sort((a, b) => {
                if (a.role === 'power_user' && b.role === 'user') {
                    return -1; // a comes before b
                }
                if (a.role === 'user' && b.role === 'power_user') {
                    return 1; // b comes before a
                }
                return 0; // maintain original order if both are the same
            });

            setCandidates(sortedCandidates);
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
        if (window.confirm('Are you sure you want to delete this candidate? This will also delete their personal details, qualifications, skills, and certifications.')) {
            try {
                // First delete the qualifications
                await axios.delete(`http://localhost:3000/api/qualifications/${id}`);
                // Then delete the user skills
                await axios.delete(`http://localhost:3000/api/user_skills/${id}`);
                // Then delete the user certifications
                await axios.delete(`http://localhost:3000/api/user_certifications/${id}`);
                // Then delete the personal details
                await axios.delete(`http://localhost:3000/api/personaldetails/${id}`);
                // Finally delete the user
                await axios.delete(`http://localhost:3000/api/candidates/${id}`);
                
                setCandidates(candidates.filter((candidate) => candidate.id !== id));
                alert('Candidate and all associated data deleted successfully');
            } catch (error) {
                alert('Failed to delete candidate and their associated data');
                console.error('Delete error:', error);
            }
        }
    };

    const handleMakePowerUser   = async (id) => {
        if (window.confirm('Are you sure you want to promote this user to Power User?')) {
            try {
                await axios.put(`http://localhost:3000/api/candidates/${id}/role`, { role: 'power_user' });
                alert('User  promoted to Power User successfully');
                fetchCandidates();
            } catch {
                alert('Failed to promote user');
            }
        }
    };

    const handleRemovePowerUser   = async (id) => {
        if (window.confirm('Are you sure you want to remove this Power User?')) {
            try {
                await axios.put(`http://localhost:3000/api/candidates/${id}/role`, { role: 'user' });
                alert('Power User removed successfully');
                fetchCandidates();
            } catch {
                alert('Failed to remove Power User');
            }
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('token'); // Remove the token
        localStorage.removeItem('user'); // Optionally remove user data
        navigate('/'); // Redirect to login page
    };

    const filteredCandidates = candidates.filter((candidate) =>
        candidate.username.toLowerCase().includes(searchQuery.toLowerCase()) ||
        candidate.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const handleShowDetails = (candidate) => {
        navigate('/candidate-details', { state: { candidate } });         // Navigate to details page with candidate data
    };

    return (
        <div className="min-h-screen bg-white dark:bg-gray-900 transition-colors duration-300">
            <header className="flex justify-between items-center p-6 border-b border-gray-300 dark:border-gray-700">
                <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Admin Dashboard</h1>
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
                            Send Magic Link
                        </button>
                    </form>
                )}
                 <button
                onClick={fetchMagicLinks}
                className="mt-4 bg-purple-500 text-white px-4 py-2 rounded-lg hover:bg-purple-600"
            >
                Check Magic Link History
            </button>

            {/* Render Magic Link History Popup */}
            {showHistoryPopup && (
                <MagicLinkHistoryPopup
                    magicLinks={magicLinks}
                    onClose={() => setShowHistoryPopup(false)}
                />
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
            <th scope="col" className="px-6 py-3">User Name</th>
            <th scope="col" className="px-6 py-3">Role</th>
            <th scope="col" className="px-6 py-3">Details</th>
            <th scope="col" className="px-6 py-3">Actions</th>
        </tr>
    </thead>
    <tbody>
        {filteredCandidates.map((candidate) => (
            <tr key={candidate.id} className="bg-white dark:bg-gray-800 hover:bg-gray-100">
                <td className="px-6 py-4 font-medium text-gray-900 whitespace-nowrap dark:text-white">{candidate.first_name}</td>
                <td className="px-6 py-4">{candidate.role}</td>
                <td className="px-6 py-4">
                    <button onClick={() => handleShowDetails(candidate)} className="text-blue-700 hover:text-white border border-blue-700 hover:bg-blue-800 focus:ring-4 focus:outline-none focus:ring-blue-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Show Details
                    </button>
                </td>
                <td className="px-6 py-4 flex space-x-2">
                    <button onClick={() => handleEdit(candidate)} className="text-yellow-600 hover:text-white border border-yellow-600 hover:bg-yellow-700 focus:ring-4 focus:outline focus:ring-yellow-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Edit
                    </button>
                    <button onClick={() => handleDelete(candidate.id)} className="text-red-600 hover:text-white border border-red-600 hover:bg-red-700 focus:ring-4 focus:outline-none focus:ring-red-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                        Delete
                    </button>
                    {candidate.role === 'user' ? (
                                            <button onClick={() => handleMakePowerUser (candidate.id)} className="text-green-600 hover:text-white border border-green-600 hover:bg-green-700 focus:ring-4 focus:outline-none focus:ring-green-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                            Make Power User
                                        </button>
                                        ) : (
                                        <button onClick={() => handleRemovePowerUser (candidate.id)} className="text-orange-600 hover:text-white border border-orange-600 hover:bg-orange-700 focus:ring-4 focus:outline-none focus:ring-orange-300 font-medium rounded-lg text-sm px-5 py-2.5 text-center">
                                            Remove Power User
                                        </button>
                                        )}
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                ) : (
                    <p className="text-gray-500">No candidates found.</p>
                )}

                {editingCandidate && (
                    <EditCandidateForm
                        candidate={editingCandidate}
                        onUpdate={handleUpdate}
                        onClose={() => setEditingCandidate(null)}
                    />
                )}
            </div>
        </div>
    );
}

export default AdminDashboard;