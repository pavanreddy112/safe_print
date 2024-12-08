import React, { useState, useEffect } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';

const FileUploadPage = () => {
  const { shopId } = useParams(); // Get shopId from URL
  const [selectedFile, setSelectedFile] = useState(null);
  const [error, setError] = useState('');
  const [successMessage, setSuccessMessage] = useState('');
  const [ownerId, setOwnerId] = useState(null); // State to store the ownerId
  const [isUploading, setIsUploading] = useState(false); // Flag to track if file is being uploaded

  // Fetch the ownerId based on the shopId
  useEffect(() => {
    const fetchOwnerId = async () => {
      try {
        const response = await axios.get(`http://localhost:5000/api/shops/${shopId}`);
        const shop = response.data.shop;
        if (shop && shop.owner) {
          const ownerId = shop.owner._id; // Access the populated owner details
          setOwnerId(ownerId); // Set the ownerId in the state
          console.log("Fetched Owner ID:", ownerId); // Log the fetched ownerId
        } else {
          console.error("Owner data is missing in the response.");
          setError("Owner information is missing.");
        }
      } catch (error) {
        console.error("Error fetching owner ID:", error);
        setError("Failed to fetch owner information.");
      }
    };

    fetchOwnerId();
  }, [shopId]); // Fetch ownerId whenever shopId changes

  // Extract userId from the JWT token in localStorage
  const getUserIdFromToken = async () => {
    const token = localStorage.getItem('token');
    if (!token) {
      setError('You must be logged in to upload a file.');
      return null;
    }

    try {
      const jwt_decode = (await import('jwt-decode')).default; // Dynamic import
      const decodedToken = jwt_decode(token); // Decode the JWT
      console.log("Decoded Token:", decodedToken); // Log the decoded token to inspect the structure
      return decodedToken.id; // Use 'id' instead of 'userId' from the decoded token
    } catch (error) {
      console.error("Invalid token:", error);
      setError("Failed to decode the token.");
      return null;
    }
  };

  // Handle file selection
  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setSelectedFile(file);
    }
  };

  // Handle file upload
  const handleFileUpload = async () => {
    if (isUploading) {
      return; // Prevent the upload if it's already in progress
    }

    setIsUploading(true); // Set uploading flag to true
    console.log("Uploading file...");

    if (!selectedFile) {
      setError('Please select a file to upload.');
      setIsUploading(false); // Reset uploading flag
      return;
    }

    const userId = await getUserIdFromToken();
    if (!userId) {
      setIsUploading(false); // Reset uploading flag
      return; // If userId is not available, exit the upload process
    }

    if (!ownerId) {
      setError('Owner ID is not available.');
      setIsUploading(false); // Reset uploading flag
      return;
    }

    // Log the user ID and owner ID
    console.log("User ID (from token):", userId);
    console.log("Owner ID (from shop data):", ownerId);

    const formData = new FormData();
    formData.append('file', selectedFile);
    formData.append('userId', userId); // Add userId extracted from the token
    formData.append('shopId', shopId);  // Add shopId from state or URL
    formData.append('ownerId', ownerId);  // Add ownerId

    try {
      console.log("Sending request to server...");
      const response = await axios.post('http://localhost:5000/api/chat/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          Authorization: `Bearer ${localStorage.getItem('token')}`,
        },
      });

      // Log the server response
      console.log("Server response:", response);

      if (response.status === 200) {
        setSuccessMessage('File uploaded successfully!');
        setSelectedFile(null); // Reset file input
      } else {
        setError('Failed to upload file. Please try again.');
      }
    } catch (error) {
      console.error('Error uploading file:', error);
      setError('Failed to upload file. Please try again.');
    }

    setIsUploading(false); // Reset uploading flag
  };

  return (
    <div>
      <h1>Upload Files for Shop {shopId}</h1>

      {/* Display any error or success message */}
      {error && <div style={{ color: 'red' }}>{error}</div>}
      {successMessage && <div style={{ color: 'green' }}>{successMessage}</div>}

      {/* File Upload Form */}
      <div>
        <input
          type="file"
          onChange={handleFileChange}
        />
        <button onClick={handleFileUpload} disabled={isUploading}>
          {isUploading ? 'Uploading...' : 'Upload File'}
        </button>
      </div>

      {/* Confirmation message after file upload */}
      {successMessage && (
        <div>
          <p>Confirmation: File uploaded successfully! All good.</p>
        </div>
      )}
    </div>
  );
};

export default FileUploadPage;
