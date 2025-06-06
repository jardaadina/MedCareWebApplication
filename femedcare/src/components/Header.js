// Header.js
import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Button, Box } from '@mui/material';
import { AuthContext } from '../contexts/AuthContext';

const Header = () => {
    const { currentUser, logout } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = () => {
        logout();
        navigate('/login');
    };

    return (
        <AppBar position="static" sx={{ bgcolor: '#1976d2' }}>
            <Toolbar>
                <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
                    MedCare Clinic
                </Typography>
                <Box>
                    {currentUser && (
                        <>
                            <Typography variant="body1" sx={{ mr: 2, display: 'inline' }}>
                                {currentUser.name}
                            </Typography>
                            <Button color="inherit" onClick={handleLogout}>
                                Deconectare
                            </Button>
                        </>
                    )}
                </Box>
            </Toolbar>
        </AppBar>
    );
};

export default Header;