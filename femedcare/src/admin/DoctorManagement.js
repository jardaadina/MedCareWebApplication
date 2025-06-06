import React, { useState, useEffect } from 'react';
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
    Dialog,
    DialogTitle,
    DialogContent,
    DialogActions,
    TextField,
    Checkbox,
    FormControlLabel,
    Grid,
    Alert,
    Snackbar,
    CircularProgress
} from '@mui/material';
import DoctorService from '../api/DoctorService';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';

const DoctorManagement = () => {
    const [doctors, setDoctors] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentDoctor, setCurrentDoctor] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [doctorForm, setDoctorForm] = useState({
        name: '',
        specialization: '',
        workingHours: [
            { dayOfWeek: 'MONDAY', startTime: '', endTime: '', enabled: false },
            { dayOfWeek: 'TUESDAY', startTime: '', endTime: '', enabled: false },
            { dayOfWeek: 'WEDNESDAY', startTime: '', endTime: '', enabled: false },
            { dayOfWeek: 'THURSDAY', startTime: '', endTime: '', enabled: false },
            { dayOfWeek: 'FRIDAY', startTime: '', endTime: '', enabled: false },
            { dayOfWeek: 'SATURDAY', startTime: '', endTime: '', enabled: false },
            { dayOfWeek: 'SUNDAY', startTime: '', endTime: '', enabled: false }
        ]
    });

    useEffect(() => {
        fetchDoctors();
    }, []);

    const fetchDoctors = async () => {
        try {
            setLoading(true);
            const data = await DoctorService.getAllDoctors();
            setDoctors(data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea medicilor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setDoctorForm({
            ...doctorForm,
            [name]: value
        });
    };

    const handleWorkingHoursChange = (index, field, value) => {
        const updatedWorkingHours = [...doctorForm.workingHours];
        updatedWorkingHours[index] = {
            ...updatedWorkingHours[index],
            [field]: field === 'enabled' ? value : value
        };
        setDoctorForm({
            ...doctorForm,
            workingHours: updatedWorkingHours
        });
    };

    const handleOpenAddDialog = () => {
        setCurrentDoctor(null);
        setDoctorForm({
            name: '',
            specialization: '',
            workingHours: [
                { dayOfWeek: 'MONDAY', startTime: '', endTime: '', enabled: false },
                { dayOfWeek: 'TUESDAY', startTime: '', endTime: '', enabled: false },
                { dayOfWeek: 'WEDNESDAY', startTime: '', endTime: '', enabled: false },
                { dayOfWeek: 'THURSDAY', startTime: '', endTime: '', enabled: false },
                { dayOfWeek: 'FRIDAY', startTime: '', endTime: '', enabled: false },
                { dayOfWeek: 'SATURDAY', startTime: '', endTime: '', enabled: false },
                { dayOfWeek: 'SUNDAY', startTime: '', endTime: '', enabled: false }
            ]
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (doctor) => {
        setCurrentDoctor(doctor);

        const workingHoursMap = {};
        doctor.workingHours.forEach(wh => {
            workingHoursMap[wh.dayOfWeek] = wh;
        });

        const initialWorkingHours = [
            'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'
        ].map(day => {
            if (workingHoursMap[day]) {
                return {
                    dayOfWeek: day,
                    startTime: workingHoursMap[day].startTime,
                    endTime: workingHoursMap[day].endTime,
                    enabled: true
                };
            }
            return { dayOfWeek: day, startTime: '', endTime: '', enabled: false };
        });

        setDoctorForm({
            name: doctor.name,
            specialization: doctor.specialization,
            workingHours: initialWorkingHours
        });

        setOpenDialog(true);
    };

    const handleOpenDeleteDialog = (doctor) => {
        setCurrentDoctor(doctor);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSaveDoctor = async () => {
        try {
            // Validare
            if (!doctorForm.name || !doctorForm.specialization) {
                setSnackbar({
                    open: true,
                    message: 'Completați numele și specializarea medicului',
                    severity: 'error'
                });
                return;
            }

            const hasWorkingDay = doctorForm.workingHours.some(wh => wh.enabled);
            if (!hasWorkingDay) {
                setSnackbar({
                    open: true,
                    message: 'Selectați cel puțin o zi de lucru',
                    severity: 'error'
                });
                return;
            }

            for (const wh of doctorForm.workingHours) {
                if (wh.enabled) {
                    if (!wh.startTime || !wh.endTime) {
                        setSnackbar({
                            open: true,
                            message: `Completați orele pentru ${wh.dayOfWeek}`,
                            severity: 'error'
                        });
                        return;
                    }
                }
            }

            const doctorData = {
                id: currentDoctor ? currentDoctor.id : null,
                name: doctorForm.name,
                specialization: doctorForm.specialization,
                workingHours: doctorForm.workingHours
                    .filter(wh => wh.enabled)
                    .map(wh => ({
                        dayOfWeek: wh.dayOfWeek,
                        startTime: wh.startTime,
                        endTime: wh.endTime
                    }))
            };

            if (currentDoctor) {
                await DoctorService.updateDoctor(currentDoctor.id, doctorData);
                setSnackbar({
                    open: true,
                    message: 'Medicul a fost actualizat cu succes',
                    severity: 'success'
                });
            } else {
                await DoctorService.createDoctor(doctorData);
                setSnackbar({
                    open: true,
                    message: 'Medicul a fost adăugat cu succes',
                    severity: 'success'
                });
            }

            handleCloseDialog();
            fetchDoctors();
        } catch (error) {
            console.error('Error saving doctor:', error);
            setSnackbar({
                open: true,
                message: 'Eroare la salvarea medicului',
                severity: 'error'
            });
        }
    };

    const handleDeleteDoctor = async () => {
        try {
            await DoctorService.deleteDoctor(currentDoctor.id);

            setSnackbar({
                open: true,
                message: 'Medicul a fost șters cu succes',
                severity: 'success'
            });

            handleCloseDialog();
            fetchDoctors();
        } catch (error) {
            console.error('Error deleting doctor:', error);
            setSnackbar({
                open: true,
                message: 'Eroare la ștergerea medicului',
                severity: 'error'
            });
        }
    };

    const formatWorkingHours = (workingHours) => {
        if (!workingHours || workingHours.length === 0) {
            return 'Nicio zi de lucru definită';
        }

        return workingHours.map(wh =>
            `${wh.dayOfWeek}: ${wh.startTime}-${wh.endTime}`
        ).join(', ');
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Gestionare Medici
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                    sx={{ bgcolor: '#76b852', '&:hover': { bgcolor: '#5da03f' } }}
                >
                    Adaugă Medic
                </Button>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {loading ? (
                <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                    <CircularProgress />
                </Box>
            ) : (
                <TableContainer component={Paper} sx={{ maxHeight: 440 }}>
                    <Table stickyHeader>
                        <TableHead>
                            <TableRow>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>ID</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Nume</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Specializare</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Program</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Acțiuni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {doctors.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Nu există medici înregistrați
                                    </TableCell>
                                </TableRow>
                            ) : (
                                doctors.map((doctor) => (
                                    <TableRow key={doctor.id} hover>
                                        <TableCell>{doctor.id}</TableCell>
                                        <TableCell>{doctor.name}</TableCell>
                                        <TableCell>{doctor.specialization}</TableCell>
                                        <TableCell>{formatWorkingHours(doctor.workingHours)}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenEditDialog(doctor)}
                                                sx={{ mr: 1 }}
                                            >
                                                Editează
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDeleteDialog(doctor)}
                                            >
                                                Șterge
                                            </Button>
                                        </TableCell>
                                    </TableRow>
                                ))
                            )}
                        </TableBody>
                    </Table>
                </TableContainer>
            )}

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {currentDoctor ? 'Editare Medic' : 'Adăugare Medic'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Nume"
                                name="name"
                                value={doctorForm.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Specializare"
                                name="specialization"
                                value={doctorForm.specialization}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                                Program de lucru
                            </Typography>
                            <Paper sx={{ p: 2 }}>
                                <Grid container spacing={2}>
                                    {doctorForm.workingHours.map((wh, index) => (
                                        <Grid item xs={12} key={wh.dayOfWeek}>
                                            <Box sx={{ display: 'flex', alignItems: 'center' }}>
                                                <FormControlLabel
                                                    control={
                                                        <Checkbox
                                                            checked={wh.enabled}
                                                            onChange={(e) => handleWorkingHoursChange(index, 'enabled', e.target.checked)}
                                                        />
                                                    }
                                                    label={wh.dayOfWeek}
                                                    sx={{ width: 150 }}
                                                />
                                                <TextField
                                                    label="Ora început"
                                                    type="time"
                                                    value={wh.startTime}
                                                    onChange={(e) => handleWorkingHoursChange(index, 'startTime', e.target.value)}
                                                    disabled={!wh.enabled}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ step: 300 }}
                                                    sx={{ mx: 1 }}
                                                />
                                                <TextField
                                                    label="Ora sfârșit"
                                                    type="time"
                                                    value={wh.endTime}
                                                    onChange={(e) => handleWorkingHoursChange(index, 'endTime', e.target.value)}
                                                    disabled={!wh.enabled}
                                                    InputLabelProps={{ shrink: true }}
                                                    inputProps={{ step: 300 }}
                                                    sx={{ mx: 1 }}
                                                />
                                            </Box>
                                        </Grid>
                                    ))}
                                </Grid>
                            </Paper>
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anulează</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveDoctor}
                        sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#2a75f3' } }}
                    >
                        Salvează
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openDeleteDialog} onClose={handleCloseDialog}>
                <DialogTitle>Confirmare ștergere</DialogTitle>
                <DialogContent>
                    <Typography>
                        Sigur doriți să ștergeți medicul {currentDoctor?.name}?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anulează</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteDoctor}
                    >
                        Șterge
                    </Button>
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

export default DoctorManagement;