import React, { useState } from 'react';
import {
    Box,
    Button,
    Paper,
    Typography,
    Table,
    TableBody,
    TableCell,
    TableContainer,
    TableHead,
    TableRow,
    Alert,
    Snackbar,
    CircularProgress,
    Grid,
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    Tabs,
    Tab
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import DownloadIcon from '@mui/icons-material/Download';
import BarChartIcon from '@mui/icons-material/BarChart';
import ReportService from '../api/ReportService';
import { format } from 'date-fns';
import { ro } from 'date-fns/locale';

const Reports = () => {
    const [startDate, setStartDate] = useState(new Date());
    const [endDate, setEndDate] = useState(new Date());
    const [appointments, setAppointments] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [openStatsDialog, setOpenStatsDialog] = useState(false);
    const [statsTab, setStatsTab] = useState(0);
    const [statsLoading, setStatsLoading] = useState(false);
    const [doctorStats, setDoctorStats] = useState([]);
    const [serviceStats, setServiceStats] = useState([]);

    const handleGenerateReport = async () => {
        try {
            setLoading(true);
            setError(null);

            const startDatetime = new Date(startDate);
            startDatetime.setHours(0, 0, 0, 0);

            const endDatetime = new Date(endDate);
            endDatetime.setHours(23, 59, 59, 999);

            const data = await ReportService.getAppointmentsReport(
                startDatetime.toISOString(),
                endDatetime.toISOString()
            );

            setAppointments(data);

            if (data.length === 0) {
                setError('Nu există programări în intervalul selectat');
            }
        } catch (err) {
            console.error('Error generating report:', err);
            setError('Eroare la generarea raportului');
        } finally {
            setLoading(false);
        }
    };

    const handleExportCsv = async () => {
        try {
            setLoading(true);

            const startDatetime = new Date(startDate);
            startDatetime.setHours(0, 0, 0, 0);

            const endDatetime = new Date(endDate);
            endDatetime.setHours(23, 59, 59, 999);

            await ReportService.exportAppointmentsToCSV(
                startDatetime.toISOString(),
                endDatetime.toISOString()
            );

            setSnackbar({
                open: true,
                message: 'Raport exportat cu succes',
                severity: 'success'
            });
        } catch (err) {
            console.error('Error exporting report:', err);
            setSnackbar({
                open: true,
                message: 'Eroare la exportarea raportului',
                severity: 'error'
            });
        } finally {
            setLoading(false);
        }
    };

    const handleOpenStatsDialog = async () => {
        setOpenStatsDialog(true);
        setStatsTab(0);
        await loadDoctorStats();
    };

    const handleCloseStatsDialog = () => {
        setOpenStatsDialog(false);
    };

    const handleChangeStatsTab = async (event, newValue) => {
        setStatsTab(newValue);
        if (newValue === 0 && doctorStats.length === 0) {
            await loadDoctorStats();
        } else if (newValue === 1 && serviceStats.length === 0) {
            await loadServiceStats();
        }
    };

    const loadDoctorStats = async () => {
        try {
            setStatsLoading(true);
            const data = await ReportService.getMostRequestedDoctorsReport();
            setDoctorStats(data);
        } catch (err) {
            console.error('Error loading doctor stats:', err);
            setSnackbar({
                open: true,
                message: 'Eroare la încărcarea statisticilor despre medici',
                severity: 'error'
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const loadServiceStats = async () => {
        try {
            setStatsLoading(true);
            const data = await ReportService.getMostRequestedServicesReport();
            setServiceStats(data);
        } catch (err) {
            console.error('Error loading service stats:', err);
            setSnackbar({
                open: true,
                message: 'Eroare la încărcarea statisticilor despre servicii',
                severity: 'error'
            });
        } finally {
            setStatsLoading(false);
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return format(date, 'dd MMMM yyyy, HH:mm', { locale: ro });
    };

    return (
        <Box>
            <Box sx={{ mb: 4 }}>
                <Typography variant="h6" component="h2" sx={{ mb: 2 }}>
                    Generare Rapoarte
                </Typography>

                <Paper sx={{ p: 3 }}>
                    <Grid container spacing={3} alignItems="center">
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Dată început:
                            </Typography>
                            <DatePicker
                                selected={startDate}
                                onChange={(date) => setStartDate(date)}
                                selectsStart
                                startDate={startDate}
                                endDate={endDate}
                                dateFormat="dd/MM/yyyy"
                                className="form-control"
                                customInput={
                                    <input
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            width: '100%'
                                        }}
                                    />
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Typography variant="subtitle1" sx={{ mb: 1 }}>
                                Dată sfârșit:
                            </Typography>
                            <DatePicker
                                selected={endDate}
                                onChange={(date) => setEndDate(date)}
                                selectsEnd
                                startDate={startDate}
                                endDate={endDate}
                                minDate={startDate}
                                dateFormat="dd/MM/yyyy"
                                className="form-control"
                                customInput={
                                    <input
                                        style={{
                                            padding: '10px',
                                            border: '1px solid #ccc',
                                            borderRadius: '4px',
                                            width: '100%'
                                        }}
                                    />
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={4}>
                            <Box sx={{ display: 'flex', gap: 2, mt: 3 }}>
                                <Button
                                    variant="contained"
                                    onClick={handleGenerateReport}
                                    disabled={loading}
                                    sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#2a75f3' } }}
                                >
                                    {loading ? <CircularProgress size={24} /> : 'Generează Raport'}
                                </Button>

                                <Button
                                    variant="outlined"
                                    startIcon={<BarChartIcon />}
                                    onClick={handleOpenStatsDialog}
                                    sx={{ color: '#4285f4', borderColor: '#4285f4' }}
                                >
                                    Statistici
                                </Button>
                            </Box>
                        </Grid>
                    </Grid>
                </Paper>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {appointments.length > 0 && (
                <Box>
                    <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                        <Typography variant="h6">
                            Rezultate ({appointments.length} programări)
                        </Typography>

                        <Button
                            variant="outlined"
                            startIcon={<DownloadIcon />}
                            onClick={handleExportCsv}
                            disabled={loading}
                            sx={{ color: '#4285f4', borderColor: '#4285f4' }}
                        >
                            Exportă CSV
                        </Button>
                    </Box>

                    <TableContainer component={Paper} sx={{ maxHeight: 440, mb: 3 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Nume Pacient</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Medic</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Serviciu</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Data și Ora</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Status</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {appointments.map((appointment) => (
                                    <TableRow key={appointment.id} hover>
                                        <TableCell>{appointment.id}</TableCell>
                                        <TableCell>{appointment.patientName}</TableCell>
                                        <TableCell>{appointment.doctor.name}</TableCell>
                                        <TableCell>{appointment.medicalService.name}</TableCell>
                                        <TableCell>{formatDateTime(appointment.startDateTime)}</TableCell>
                                        <TableCell>{appointment.status}</TableCell>
                                    </TableRow>
                                ))}
                            </TableBody>
                        </Table>
                    </TableContainer>
                </Box>
            )}

            <Dialog open={openStatsDialog} onClose={handleCloseStatsDialog} maxWidth="md" fullWidth>
                <DialogTitle>Statistici</DialogTitle>
                <DialogContent dividers>
                    <Tabs
                        value={statsTab}
                        onChange={handleChangeStatsTab}
                        indicatorColor="primary"
                        textColor="primary"
                        variant="fullWidth"
                        sx={{ mb: 2 }}
                    >
                        <Tab label="Medici solicitați" />
                        <Tab label="Servicii solicitate" />
                    </Tabs>

                    {statsLoading ? (
                        <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                            <CircularProgress />
                        </Box>
                    ) : (
                        <>
                            {statsTab === 0 && (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>ID Medic</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Nume Medic</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Număr Programări</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {doctorStats.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center">
                                                        Nu există date disponibile
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                doctorStats.map((stat, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>{stat[0]}</TableCell>
                                                        <TableCell>{stat[1]}</TableCell>
                                                        <TableCell>{stat[2]}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}

                            {statsTab === 1 && (
                                <TableContainer component={Paper}>
                                    <Table>
                                        <TableHead>
                                            <TableRow>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>ID Serviciu</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Nume Serviciu</TableCell>
                                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Număr Solicitări</TableCell>
                                            </TableRow>
                                        </TableHead>
                                        <TableBody>
                                            {serviceStats.length === 0 ? (
                                                <TableRow>
                                                    <TableCell colSpan={3} align="center">
                                                        Nu există date disponibile
                                                    </TableCell>
                                                </TableRow>
                                            ) : (
                                                serviceStats.map((stat, index) => (
                                                    <TableRow key={index} hover>
                                                        <TableCell>{stat[0]}</TableCell>
                                                        <TableCell>{stat[1]}</TableCell>
                                                        <TableCell>{stat[2]}</TableCell>
                                                    </TableRow>
                                                ))
                                            )}
                                        </TableBody>
                                    </Table>
                                </TableContainer>
                            )}
                        </>
                    )}
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseStatsDialog}>Închide</Button>
                </DialogActions>
            </Dialog>

            <Snackbar
                open={snackbar.open}
                autoHideDuration={6000}
                onClose={handleCloseSnackbar}
                anchorOrigin={{ vertical: 'bottom', horizontal: 'center' }}
            >
                <Alert onClose={handleCloseSnackbar} severity={snackbar.severity} sx={{ width: '100%' }}>
                    {snackbar.message}
                </Alert>
            </Snackbar>
        </Box>
    );
};

export default Reports;