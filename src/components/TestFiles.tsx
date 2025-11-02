import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import apiService from '../utils/apiService';
import type { FileItem } from '../utils/apiService';

const TestFiles: React.FC = () => {
  const [files, setFiles] = useState<FileItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const { isAuthenticated, user } = useAuth();

  useEffect(() => {
    const testAPI = async () => {
      try {
        console.log('🧪 TestFiles: Starting API test...');
        
        // Check authentication status
        console.log('🧪 TestFiles: Is authenticated:', isAuthenticated);
        console.log('🧪 TestFiles: User:', user);
        
        const authToken = document.cookie.split('; ').find(row => row.startsWith('auth_token='));
        console.log('🧪 TestFiles: Auth token found:', !!authToken);
        console.log('🧪 TestFiles: All cookies:', document.cookie);
        
        if (!isAuthenticated) {
          setError('User not authenticated. Please log in.');
          setLoading(false);
          return;
        }
        
        setLoading(true);
        setError(null);

        const response = await apiService.getFiles();
        console.log('🧪 TestFiles: API response:', response);

        if (response.success && response.data) {
          console.log('🧪 TestFiles: Files received:', response.data.files);
          setFiles(response.data.files || []);
        } else {
          console.log('🧪 TestFiles: API call failed or no data');
          console.log('🧪 TestFiles: Response error:', response.error);
          setError(response.error || 'Failed to load files');
        }
      } catch (err) {
        console.error('🧪 TestFiles: Error:', err);
        setError('Error loading files');
      } finally {
        setLoading(false);
      }
    };

    testAPI();
  }, [isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <div className="text-white p-4">
        <h2 className="text-xl font-bold mb-4">Files API Test</h2>
        <p className="text-yellow-400">Please log in to test the Files API</p>
      </div>
    );
  }

  if (loading) {
    return <div className="text-white p-4">Loading files...</div>;
  }

  if (error) {
    return (
      <div className="text-white p-4">
        <h2 className="text-xl font-bold mb-4">Files API Test</h2>
        <div className="text-red-400 mb-4">Error: {error}</div>
        <p className="text-sm text-white/60">
          If you're seeing authentication errors, try logging out and logging back in.
        </p>
      </div>
    );
  }

  return (
    <div className="text-white p-4">
      <h2 className="text-xl font-bold mb-4">Files API Test</h2>
      <p className="mb-4">Files found: {files.length}</p>
      
      {files.length === 0 ? (
        <p className="text-yellow-400">No files found</p>
      ) : (
        <div className="space-y-2">
          {files.map((file, index) => (
            <div key={file.id} className="bg-gray-800 p-3 rounded">
              <p><strong>#{index + 1}</strong></p>
              <p><strong>Name:</strong> {file.name}</p>
              <p><strong>Type:</strong> {file.type}</p>
              <p><strong>Size:</strong> {file.size} bytes</p>
              <p><strong>Upload Date:</strong> {file.uploadDate}</p>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default TestFiles;