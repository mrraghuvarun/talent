import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { useLocation, Link } from 'react-router-dom';
import { DocumentDownloadIcon } from '@heroicons/react/solid';

function CandidateDetails() {
    const location = useLocation();
    const candidate = location.state?.candidate; // Get candidate data from the state
    const [details, setDetails] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [isEditing, setIsEditing] = useState({
        personal: false,
        qualifications: false,
        skills: false,
        certifications: false
    });
    const [formData, setFormData] = useState({
        personalDetails: {},
        qualifications: [],
        skills: [],
        certifications: []
    });
    const [resumeFile, setResumeFile] = useState(null); // For handling resume file upload

    useEffect(() => {
        if (candidate) {
            fetchPersonalDetails(candidate.id);
        }
    }, [candidate]);

    const fetchPersonalDetails = async (id) => {
        try {
            const response = await axios.get(`http://localhost:3000/api/personalDetails/${id}`);
            setDetails(response.data);
            setFormData({
                personalDetails: response.data.personalDetails,
                qualifications: response.data.qualifications.map(qual => ({
                    ...qual,
                    recent_job: qual.recent_job || '',
                    preferred_roles: qual.preferred_roles || '',
                    availability: qual.availability || '',
                    work_permit_status: qual.work_permit_status || '',
                    preferred_role_type: qual.preferred_role_type || '',
                    preferred_work_arrangement: qual.preferred_work_arrangement || '',
                    compensation: qual.compensation || ''
                })),
                skills: response.data.skills,
                certifications: response.data.certifications
            });
        } catch (error) {
            setError('Failed to fetch personal details');
        } finally {
            setLoading(false);
        }
    };


    const handleDownloadResume = async () => {
       /* try {
            const response = await axios.get(`http://localhost:3000/api/resume/${details.personalDetails.id}`, {
                responseType: 'blob', // Important for downloading files
            });
            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'resume.pdf'); // You can change the file name here
            document.body.appendChild(link);
            link.click();
            link.remove();
        } catch (error) {
            alert('Failed to download resume');
        }*/

            try {
                const resumeUrl = `http://localhost:3000/api/resume/${details.personalDetails.id}`;
                window.open(resumeUrl, '_blank'); // Opens the resume in a new tab
              } catch (error) {
                alert('Failed to view resume');
              }
    };

    const handleEditToggle = (section) => {
        setIsEditing((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const handleChange = (e) => {
        const { name, value } = e.target;

        if (name.startsWith('qualification_')) {
            const index = name.split('_')[1];
            setFormData((prev) => {
                const updatedQualifications = [...prev.qualifications];
                updatedQualifications[index] = {
                    ...updatedQualifications[index],
                    [name.split('_')[2]]: value
                };
                return { ...prev, qualifications: updatedQualifications };
            });
        } else if (name.startsWith('skill_')) {
            const index = name.split('_')[1];
            setFormData((prev) => {
                const updatedSkills = [...prev.skills];
                updatedSkills[index] = value;
                return { ...prev, skills: updatedSkills };
            });
        } else if (name.startsWith('certification_')) {
            const index = name.split('_')[1];
            setFormData((prev) => {
                const updatedCertifications = [...prev.certifications];
                updatedCertifications[index] = value;
                return { ...prev, certifications: updatedCertifications };
            });
        } else {
            setFormData((prev) => ({
                ...prev,
                personalDetails: {
                    ...prev.personalDetails,
                    [name]: value
                }
            }));
        }
    };

    const handleResumeChange = (e) => {
        setResumeFile(e.target.files[0]); // Store the selected resume file
    };

    const handleSubmit = async (e, section) => {
        e.preventDefault();
        try {
            const id = details.personalDetails.id;

            // Create a FormData object to handle file uploads
            const formDataToSubmit = new FormData();
            if (section === 'personal') {
                // Append all personal details to formData
                Object.keys(formData.personalDetails).forEach(key => {
                    formDataToSubmit.append(key, formData.personalDetails[key]);
                });
                // If there's a new resume file, append it as well
                if (resumeFile) {
                    formDataToSubmit.append('resume', resumeFile);
                }

                await axios.put(`http://localhost:3000/api/candidates/${id}/personal`, formDataToSubmit                , {
                    headers: {
                        'Content-Type': 'multipart/form-data',
                    }
                });
                // Fetch updated details after submission
                fetchPersonalDetails(id);
                handleEditToggle(section); // Close the edit form
            } else if (section === 'qualifications') {
                // Assuming qualifications is an array and you want to update each one
                for (const qualification of formData.qualifications) {
                    await axios.put(`http://localhost:3000/api/candidates/${id}/qualifications`, qualification);
                }
                fetchPersonalDetails(id); // Fetch updated details after submission
                handleEditToggle(section); // Close the edit form
            } else if (section === 'skills') {
                await axios.put(`http://localhost:3000/api/candidates/${id}/skills`, { skills: formData.skills });
                fetchPersonalDetails(id); // Fetch updated details after submission
                handleEditToggle(section); // Close the edit form
            } else if (section === 'certifications') {
                await axios.put(`http://localhost:3000/api/candidates/${id}/certifications`, { certifications: formData.certifications });
                fetchPersonalDetails(id); // Fetch updated details after submission
                handleEditToggle(section); // Close the edit form
            }
        } catch (error) {
            alert('Failed to update details: ' + (error.response?.data?.error || 'Unknown error'));
        }
    };

    if (loading) {
        return <p className="text-center">Loading candidate details...</p>;
    }

    if (error) {
        return <p className="text-red-500 text-center">{error}</p>;
    }

    if (!details) {
        return <p className="text-center">No personal details found.</p>;
    }

    const { personalDetails, qualifications, skills, certifications } = details;

    return (
        <div className="container mx-auto p-6 relative">
            <Link to="/admin-dashboard" className="absolute top-4 right-4 px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600 transition duration-300 text-sm">
                Back to Admin Dashboard
            </Link>

            <div className="bg-white shadow-lg rounded-lg p-6 mt-6">
                <h1 className="text-4xl font-bold mb-4 text-center text-blue-600">Candidate Details</h1>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {/* Left Column: Personal Details */}
                    <div>
                        <h2 className="text-3xl font-semibold mt-2 mb-2 underline">Personal Details</h2>
                        <div className="bg-gray-100 p-3 rounded-lg shadow mb-2">
                            {isEditing.personal ? (
                                <form onSubmit={(e) => handleSubmit(e, 'personal')}>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <label>
                                                <strong>First Name:</strong>
                                                <input
                                                    type="text"
                                                    name="first_name"
                                                    value={formData.personalDetails?.first_name || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                />
                                            </label>
                                            <label>
                                                <strong>Phone No:</strong>
                                                <input
                                                    type="text"
                                                    name="phone_no"
                                                    value={formData.personalDetails?.phone_no || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                />
                                            </label>
                                            <label>
                                                <strong>State:</strong>
                                                <input
                                                    type="text"
                                                    name="state"
                                                    value={formData.personalDetails?.state || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                />
                                            </label>
                                            <label>
                                                <strong>Address:</strong>
                                                <input
                                                    type="text"
                                                    name="address_line1"
                                                    value={formData.personalDetails?.address_line1 || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                />
                                                <input
                                                    type="text"
                                                    name="address_line2"
                                                    value={formData.personalDetails?.address_line2 || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                    placeholder="Address Line 2 (optional)"
                                                />
                                            </label>
                                        </div>
                                        <div className="flex flex-col">
                                            <label>
                                                <strong>Last Name:</strong>
                                                <input
                                                    type="text"
                                                    name="last_name"
                                                    value={formData.personalDetails?.last_name || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                />
                                            </label>
                                            <label>
                                                <strong>City:</strong>
                                                <input
                                                    type="text"
                                                    name="city"
                                                    value={formData.personalDetails?.city || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                />
                                            </label>
                                            <label>
                                                <strong>Country:</strong>
                                                <input
                                                    type="text"
                                                    name="country"
                                                    value={formData.personalDetails?.country || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                />
                                            </label>
                                            <label>
                                                <strong>Postal Code:</strong>
                                                <input
                                                    type="text"
                                                    name="postal_code"
                                                    value={formData.personalDetails?.postal_code || ''}
                                                    onChange={handleChange}
                                                    className="border rounded p-1"
                                                />
                                            </label>
                                        </div>
                                    </div>
                                    <div className="flex mt-2">
                                        <label>
                                            <strong>LinkedIn URL:</strong>
                                            <input
                                                type="text"
                                                name="linkedin_url"
                                                value={formData.personalDetails?.linkedin_url || ''}
                                                onChange={handleChange}
                                                className="border rounded p-1"
                                            />
                                        </label>
                                    </div>
                                    <div className="flex mt-4">
                                        <label>
                                            <strong>Resume:</strong>
                                            <input
                                                type="file"
                                                onChange={handleResumeChange}
                                                className="border rounded p-1"
                                            />
                                        </label>
                                    </div>
                                    <div className="flex justify-center mt-4">
                                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                                            Save Changes
                                        </button>
                                        <button type="button" onClick={() => handleEditToggle('personal')} className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div className="flex flex-col">
                                            <p><strong>First Name:</strong> {personalDetails.first_name || 'N/A'}</p>
                                            <p><strong>Phone No:</strong> {personalDetails.phone_no || 'N/A'}</p>
                                            <p><strong>State:</strong> {personalDetails.state || 'N/A'}</p>
                                            <p><strong>Address:</strong> {`${personalDetails.address_line1 || ''} ${personalDetails.address_line2 ? ', ' + personalDetails.address_line2 : ''}`}</p>
                                        </div>
                                        <div className="flex flex-col">
                                            <p><strong>Last Name:</strong> {personalDetails.last_name || 'N/A'}</p>
                                            <p><strong>City:</strong> {personalDetails.city || 'N/A'}</p>
                                            <p><strong>Country:</strong> {personalDetails.country || 'N/A'}</p>
                                            <p><strong>Postal Code:</strong> {personalDetails.postal_code || 'N/A'}</p>
                                        </div>
                                    </div>
                                    <div className="flex mt-2">
                                        <p><strong>LinkedIn URL:</strong> {personalDetails.linkedin_url ? 
                                            <a href={personalDetails.linkedin_url} target="_blank" rel="noopener noreferrer" className="text-blue-500 hover:underline">{personalDetails.linkedin_url}</a> 
                                            : 'N/A'}
                                        </p>
                                    </div>
                                    <div className="flex justify-center">
                                        <button onClick={() => handleEditToggle('personal')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                                            Edit Personal Details
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        {/* Download Resume Button */}
                        <div className="flex justify-center">
                            <button onClick={handleDownloadResume} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300 flex items-center">
                                <DocumentDownloadIcon className="h-5 w-5 mr-1" />
                                Download Resume
                            </button>
                        </div>
                        </div>

{/* Right Column: Qualifications, Skills, and Certifications */}
<div>
    <h2 className="text-3xl font-semibold mt-2 mb-2 underline">Qualifications</h2>
    <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
        {isEditing.qualifications ? (
            <form onSubmit={(e) => handleSubmit(e, 'qualifications')}>
                {formData.qualifications.map((qual, index) => (
                    <div key={index} className="flex flex-col mb-2">
                        <input
                            type="text"
                            name={`qualification_${index}_recent_job`}
                            value={qual.recent_job || ''}
                            onChange={handleChange}
                            className="border rounded p-1"
                            placeholder="Recent Job"
                        />
                        <input
                            type="text"
                            name={`qualification_${index}_preferred_roles`}
                            value={qual.preferred_roles || ''}
                            onChange={handleChange}
                            className="border rounded p-1"
                            placeholder="Preferred Roles"
                        />
                        <input
                            type="text"
                            name={`qualification_${index}_availability`}
                            value={qual.availability || ''}
                            onChange={handleChange}
                            className="border rounded p-1"
                            placeholder="Availability"
                        />
                        <input
                            type="text"
                            name={`qualification_${index}_work_permit_status`}
                            value={qual.work_permit_status || ''}
                            onChange={handleChange}
                            className="border rounded p-1"
                            placeholder="Work Permit Status"
                        />
                        <input
                            type="text"
                            name={`qualification_${index}_preferred_role_type`}
                            value={qual.preferred_role_type || ''}
                            onChange={handleChange}
                            className="border rounded p-1"
                            placeholder="Preferred Role Type"
                        />
                        <input
                            type="text"
                            name={`qualification_${index}_preferred_work_arrangement`}
                            value={qual.preferred_work_arrangement || ''}
                            onChange={handleChange}
                            className="border rounded p-1"
                            placeholder="Preferred Work Arrangement"
                        />
                        <input
                            type="text"
                            name={`qualification_${index}_compensation`}
                            value={qual.compensation || ''}
                            onChange={handleChange}
                            className="border rounded p-1"
                            placeholder="Compensation"
                        />
                        <hr className="my-2" />
                    </div>
                ))}
                <div className="flex justify-center mt-4">
                    <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                        Save Changes
                    </button>
                    <button type="button" onClick={() => handleEditToggle('qualifications')} className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300">
                        Cancel
                    </button>
                </div>
            </form>
        ) : (
            <>
                {qualifications.length > 0 ? (
                    qualifications.map((qual, index) => (
                        <div key={index} className="mb-2">
                            <p><strong>Recent Job:</strong> {qual.recent_job || 'N/A'}</p>
                            <p><strong>Preferred Roles:</strong> {qual.preferred_roles || 'N/A'}</p>
                            <p><strong>Availability:</strong> {qual.availability || 'N/A'}</p>
                            <p><strong>Work Permit Status:</strong> {qual.work_permit_status || 'N/A'}</p>
                            <p><strong>Preferred Role Type:</strong> {qual.preferred_role_type || 'N/A'}</p>
                            <p><strong>Preferred Work Arrangement:</strong> {qual.preferred_work_arrangement || 'N/A'}</p>
                            <p><strong>Compensation:</strong> {qual.compensation || 'N/A'}</p>
                            <hr className="my-2" />
                        </div>
                    ))
                ) : (
                    <p>No qualifications available.</p>
                )}
                <div className="flex justify-center">
                    <button onClick={() => handleEditToggle('qualifications')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                        Edit Qualifications
                    </button>
                </div>
            </>
        )}
    </div>

    <h2 className="text-3xl font-semibold mt-2 mb-2 underline">Skills</h2>
    <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
                            {isEditing.skills ? (
                                <form onSubmit={(e) => handleSubmit(e, 'skills')}>
                                    <div className="flex flex-col">
                                        <label>
                                            <strong>Skills:</strong>
                                            <textarea
                                                name="skills"
                                                value={formData.skills.join(', ') || ''}
                                                onChange={(e) => setFormData({ ...formData, skills: e.target.value.split(',').map(skill => skill.trim()) })}
                                                className="border rounded p-1"
                                                placeholder="Enter skills separated by commas"
                                            />
                                        </label>
                                    </div>
                                    <div className="flex justify-center mt-4">
                                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                                            Save Changes
                                        </button>
                                        <button type="button" onClick={() => handleEditToggle('skills')} className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {skills.length > 0 ? (
                                        <p>{skills.join(', ')}</p>
                                    ) : (
                                        <p>No skills available.</p>
                                    )}
                                    <div className="flex justify-center">
                                        <button onClick={() => handleEditToggle('skills')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                                            Edit Skills
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>

                        <h2 className="text-3xl font-semibold mt-2 mb-2 underline">Certifications</h2>
                        <div className="bg-gray-100 p-4 rounded-lg shadow mb-4">
                            {isEditing.certifications ? (
                                <form onSubmit={(e) => handleSubmit(e, 'certifications')}>
                                    <div className="flex flex-col">
                                        <label>
                                            <strong>Certifications:</strong>
                                            <textarea
                                                name="certifications"
                                                value={formData.certifications.join(', ') || ''}
                                                onChange={(e) => setFormData({ ...formData, certifications: e.target.value.split(',').map(cert => cert.trim()) })}
                                                className="border rounded p-1"
                                                placeholder="Enter certifications separated by commas"
                                            />
                                        </label>
                                    </div>
                                    <div className="flex justify-center mt-4">
                                        <button type="submit" className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition duration-300">
                                            Save Changes
                                        </button>
                                        <button type="button" onClick={() => handleEditToggle('certifications')} className="ml-2 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition duration-300">
                                            Cancel
                                        </button>
                                    </div>
                                </form>
                            ) : (
                                <>
                                    {certifications.length > 0 ? (
                                        <p>{certifications.join(', ')}</p>
                                    ) : (
                                        <p>No certifications available.</p>
                                    )}
                                    <div className="flex justify-center">
                                        <button onClick={() => handleEditToggle('certifications')} className="mt-4 px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition duration-300">
                                            Edit Certifications
                                        </button>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default CandidateDetails;