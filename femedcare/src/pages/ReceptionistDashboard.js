import React from 'react';
import {
    Box,
    Container,
    Typography,
    Paper
} from '@mui/material';
import Header from '../components/Header';
import AppointmentManagement from '../receptionist/AppointmentManagement';

const ReceptionistDashboard = () => {
    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f0f8ff' }}>
            <Header />

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
                        Dashboard Recepționist
                    </Typography>

                    <AppointmentManagement />
                </Paper>
            </Container>
        </Box>
    );
};

export default ReceptionistDashboard;