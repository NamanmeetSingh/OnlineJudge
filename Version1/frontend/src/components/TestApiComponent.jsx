import React, { useState, useEffect } from 'react';
import apiService from '../services/api';

const TestApiComponent = () => {
  const [status, setStatus] = useState('Loading...');
  const [data, setData] = useState(null);
  const [error, setError] = useState(null);

  useEffect(() => {
    const testApi = async () => {
      try {
        console.log('Testing API call...');
        setStatus('Making API call...');
        
        const response = await apiService.getProblems();
        console.log('API Response received:', response);
        
        setData(response);
        setStatus('Success!');
      } catch (err) {
        console.error('API Error:', err);
        setError(err.message);
        setStatus('Failed!');
      }
    };

    testApi();
  }, []);

  return (
    <div style={{ padding: '20px', fontFamily: 'Arial' }}>
      <h1>API Test Component</h1>
      <p><strong>Status:</strong> {status}</p>
      
      {error && (
        <div style={{ color: 'red' }}>
          <h3>Error:</h3>
          <p>{error}</p>
        </div>
      )}
      
      {data && (
        <div style={{ color: 'green' }}>
          <h3>Success!</h3>
          <p>Found {data.data?.problems?.length || 0} problems</p>
          <pre>{JSON.stringify(data, null, 2)}</pre>
        </div>
      )}
    </div>
  );
};

export default TestApiComponent;
