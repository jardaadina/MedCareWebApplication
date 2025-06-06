import React, { useState } from 'react';
import {
    Box,
    Container,
    Tabs,
    Tab,
    Typography,
    Paper
} from '@mui/material';
import Header from '../components/Header';
import DoctorManagement from '../admin/DoctorManagement';
import ServiceManagement from '../admin/ServiceManagement';
import ReceptionistManagement from '../admin/ReceptionistManagement';
import Reports from '../admin/Reports';

const AdminDashboard = () => {
    const [tabIndex, setTabIndex] = useState(0);

    const handleTabChange = (event, newValue) => {
        setTabIndex(newValue);
    };

    return (
        <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh', bgcolor: '#f0f8ff' }}>
            <Header />

            <Container maxWidth="lg" sx={{ mt: 4, mb: 4, flexGrow: 1 }}>
                <Paper sx={{ p: 2, borderRadius: 2 }}>
                    <Typography variant="h4" gutterBottom sx={{ color: '#1976d2', fontWeight: 'bold', mb: 3 }}>
                        Dashboard Administrator
                    </Typography>

                    <Paper sx={{ width: '100%', mb: 2, bgcolor: '#fff' }}>
                        <Tabs
                            value={tabIndex}
                            onChange={handleTabChange}
                            indicatorColor="primary"
                            textColor="primary"
                            variant="fullWidth"
                        >
                            <Tab label="Recepționiști" />
                            <Tab label="Medici" />
                            <Tab label="Servicii Medicale" />
                            <Tab label="Rapoarte" />
                        </Tabs>
                    </Paper>

                    <Box sx={{ mt: 2 }}>
                        {tabIndex === 0 && <ReceptionistManagement />}
                        {tabIndex === 1 && <DoctorManagement />}
                        {tabIndex === 2 && <ServiceManagement />}
                        {tabIndex === 3 && <Reports />}
                    </Box>
                </Paper>
            </Container>
        </Box>
    );
};

export default AdminDashboard;