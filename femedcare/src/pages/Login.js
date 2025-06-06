import React, { useState, useContext, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { AuthContext } from '../contexts/AuthContext';
import ApiStatusChecker from '../components/ApiStatusChecker';
import {
    Container,
    Box,
    Typography,
    TextField,
    Button,
    Paper,
    Alert,
    CircularProgress
} from '@mui/material';

const Login = () => {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const [loading, setLoading] = useState(false);

    const { currentUser, login, isAdmin, isReceptionist } = useContext(AuthContext);
    const navigate = useNavigate();

    useEffect(() => {
        console.log('Login component mounted, checking user state...');
        if (currentUser) {
            console.log('User already logged in:', currentUser);
            redirectBasedOnRole();
        }
    }, []);

    const redirectBasedOnRole = () => {
        if (isAdmin()) {
            console.log('User is admin, redirecting to admin dashboard');
            navigate('/admin-dashboard');
        } else if (isReceptionist()) {
            console.log('User is receptionist, redirecting to receptionist dashboard');
            navigate('/receptionist-dashboard');
        } else {
            console.warn('User role unknown:', currentUser);
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');

        if (!username || !password) {
            setError('Te rugăm să introduci atât numele de utilizator cât și parola.');
            return;
        }

        try {
            console.log('Attempting to login with:', { username });
            setLoading(true);

            const user = await login(username, password);
            console.log('Login successful, user data:', user);

            setTimeout(() => {
                redirectBasedOnRole();
            }, 100);

        } catch (error) {
            console.error('Login error:', error);
            setError(error.message || 'Nume de utilizator sau parolă incorecte.');
        } finally {
            setLoading(false);
        }
    };

    return (
        <Container component="main" maxWidth="xs">
            <Box
                sx={{
                    display: 'flex',
                    flexDirection: 'column',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minHeight: '100vh'
                }}
            >
                <Paper
                    elevation={3}
                    sx={{
                        padding: 4,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        width: '100%',
                        bgcolor: '#f0f8ff'
                    }}
                >
                    <Typography component="h1" variant="h4" sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
                        MedCare Clinic
                    </Typography>
                    <Typography component="h2" variant="subtitle1" sx={{ color: '#4285f4', mb: 3 }}>
                        Sistem de Management Medical
                    </Typography>

                    {error && (
                        <Alert severity="error" sx={{ width: '100%', mb: 2 }}>
                            {error}
                        </Alert>
                    )}

                    <Box component="form" onSubmit={handleSubmit} sx={{ mt: 1, width: '100%' }}>
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            id="username"
                            label="Nume de utilizator"
                            name="username"
                            autoComplete="username"
                            autoFocus
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            sx={{ mb: 2 }}
                        />
                        <TextField
                            margin="normal"
                            required
                            fullWidth
                            name="password"
                            label="Parolă"
                            type="password"
                            id="password"
                            autoComplete="current-password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            sx={{ mb: 3 }}
                        />
                        <Button
                            type="submit"
                            fullWidth
                            variant="contained"
                            sx={{ mt: 2, mb: 2, bgcolor: '#4285f4', '&:hover': { bgcolor: '#1966d2' } }}
                            disabled={loading}
                        >
                            {loading ? <CircularProgress size={24} /> : 'Autentificare'}
                        </Button>
                    </Box>

                    <Typography variant="body2" color="text.secondary" align="center" sx={{ mt: 4 }}>
                        © 2025 MedCare Clinic
                    </Typography>
                    
                </Paper>
            </Box>
        </Container>
    );
};

export default Login;