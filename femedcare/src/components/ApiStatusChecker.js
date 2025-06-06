import React, { useState, useEffect } from 'react';
import { Box, Typography, Button, CircularProgress, Alert } from '@mui/material';
import axios from 'axios';

const ApiStatusChecker = () => {
    const [status, setStatus] = useState('unknown');
    const [loading, setLoading] = useState(false);
    const apiUrl = 'http://localhost:8080/api';

    const checkApiStatus = async () => {
        setLoading(true);
        setStatus('checking');

        try {
            // Try to make a simple request to the API
            await axios.get(`${apiUrl}/auth/health`, { timeout: 5000 });
            setStatus('online');
        } catch (error) {
            console.error('API Status Check Error:', error);

            if (error.code === 'ECONNABORTED') {
                setStatus('timeout');
            } else if (!error.response) {
                setStatus('offline');
            } else {
                // If we get any response, even an error, the API is running
                setStatus('online');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        checkApiStatus();
    }, []);

    return (
        <Box sx={{ mt: 2, p: 2, border: '1px solid #ddd', borderRadius: 1 }}>
            <Typography variant="h6">API Status Checker</Typography>
            <Typography variant="body2" sx={{ mb: 2 }}>
                Endpoint: {apiUrl}
            </Typography>

            {status === 'checking' || loading ? (
                <Box sx={{ display: 'flex', alignItems: 'center' }}>
                    <CircularProgress size={24} sx={{ mr: 2 }} />
                    <Typography>Checking API status...</Typography>
                </Box>
            ) : (
                <>
                    {status === 'online' && (
                        <Alert severity="success">
                            API is online! You should be able to log in.
                        </Alert>
                    )}
                    {status === 'offline' && (
                        <Alert severity="error">
                            API appears to be offline. Please make sure the Spring Boot backend is running on port 8080.
                        </Alert>
                    )}
                    {status === 'timeout' && (
                        <Alert severity="warning">
                            API request timed out. The server might be slow or not responding.
                        </Alert>
                    )}
                    {status === 'unknown' && (
                        <Alert severity="info">
                            API status unknown. Click the button below to check.
                        </Alert>
                    )}

                    <Button
                        variant="outlined"
                        onClick={checkApiStatus}
                        disabled={loading}
                        sx={{ mt: 2 }}
                    >
                        {loading ? <CircularProgress size={24} /> : 'Check Again'}
                    </Button>
                </>
            )}
        </Box>
    );
};

export default ApiStatusChecker;