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
    Grid,
    Alert,
    Snackbar,
    CircularProgress,
    FormControl,
    InputLabel,
    MenuItem,
    Select,
    Tooltip
} from '@mui/material';
import DatePicker from 'react-datepicker';
import 'react-datepicker/dist/react-datepicker.css';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import UpdateIcon from '@mui/icons-material/Update';
import SearchIcon from '@mui/icons-material/Search';
import RefreshIcon from '@mui/icons-material/Refresh';
import InfoIcon from '@mui/icons-material/Info';
import { format, addMinutes, isWithinInterval } from 'date-fns';
import { ro } from 'date-fns/locale';
import AppointmentService from '../api/AppointmentService';
import DoctorService from '../api/DoctorService';
import MedicalServiceService from '../api/MedicalService';

const AppointmentManagement = () => {
    const [appointments, setAppointments] = useState([]);
    const [filteredAppointments, setFilteredAppointments] = useState([]);
    const [loading, setLoading] = useState(true);
    const [savingLoading, setSavingLoading] = useState(false);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openStatusDialog, setOpenStatusDialog] = useState(false);
    const [currentAppointment, setCurrentAppointment] = useState(null);
    const [doctors, setDoctors] = useState([]);
    const [services, setServices] = useState([]);
    const [searchPatientName, setSearchPatientName] = useState('');
    const [statusFilter, setStatusFilter] = useState('ALL');
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [appointmentForm, setAppointmentForm] = useState({
        patientName: '',
        doctorId: '',
        serviceId: '',
        date: new Date(),
        time: new Date()
    });

    const [newStatus, setNewStatus] = useState('');
    const [doctorSchedule, setDoctorSchedule] = useState(null);
    const [doctorAppointments, setDoctorAppointments] = useState([]);

    useEffect(() => {
        fetchAppointments();
        fetchDoctors();
        fetchServices();
    }, []);

    useEffect(() => {
        applyFilters();
    }, [appointments, searchPatientName, statusFilter]);

    useEffect(() => {
        if (appointmentForm.doctorId) {
            const selectedDoctor = doctors.find(doc => doc.id.toString() === appointmentForm.doctorId.toString());
            if (selectedDoctor) {
                setDoctorSchedule(selectedDoctor.workingHours);

                const doctorApps = appointments.filter(app => app.doctor.id.toString() === appointmentForm.doctorId.toString());
                setDoctorAppointments(doctorApps);
            }
        } else {
            setDoctorSchedule(null);
            setDoctorAppointments([]);
        }
    }, [appointmentForm.doctorId, doctors, appointments]);

    const fetchAppointments = async () => {
        try {
            setLoading(true);
            const data = await AppointmentService.getAllAppointments();
            setAppointments(data);
            setFilteredAppointments(data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea programărilor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const fetchDoctors = async () => {
        try {
            const data = await DoctorService.getAllDoctors();
            setDoctors(data);
        } catch (err) {
            console.error('Error fetching doctors:', err);
        }
    };

    const fetchServices = async () => {
        try {
            const data = await MedicalServiceService.getAllServices();
            setServices(data);
        } catch (err) {
            console.error('Error fetching services:', err);
        }
    };

    const applyFilters = () => {
        if (!appointments) return;

        let filtered = [...appointments];

        if (searchPatientName.trim() !== '') {
            filtered = filtered.filter(app =>
                app.patientName.toLowerCase().includes(searchPatientName.toLowerCase())
            );
        }

        if (statusFilter !== 'ALL') {
            filtered = filtered.filter(app => app.status === statusFilter);
        }

        setFilteredAppointments(filtered);
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setAppointmentForm({
            ...appointmentForm,
            [name]: value
        });
    };

    const handleDateChange = (date) => {
        setAppointmentForm({
            ...appointmentForm,
            date: date
        });
    };

    const handleTimeChange = (time) => {
        setAppointmentForm({
            ...appointmentForm,
            time: time
        });
    };

    const handleSearchChange = (e) => {
        setSearchPatientName(e.target.value);
    };

    const handleStatusFilterChange = (e) => {
        setStatusFilter(e.target.value);
    };

    const handleOpenAddDialog = () => {
        setCurrentAppointment(null);
        setAppointmentForm({
            patientName: '',
            doctorId: '',
            serviceId: '',
            date: new Date(),
            time: new Date()
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (appointment) => {
        setCurrentAppointment(appointment);

        const appointmentDate = new Date(appointment.startDateTime);

        setAppointmentForm({
            patientName: appointment.patientName,
            doctorId: appointment.doctor.id.toString(),
            serviceId: appointment.medicalService.id.toString(),
            date: appointmentDate,
            time: appointmentDate
        });

        setOpenDialog(true);
    };

    const handleOpenStatusDialog = (appointment) => {
        setCurrentAppointment(appointment);
        setNewStatus(appointment.status);
        setOpenStatusDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenStatusDialog(false);
    };

    const isDoctorAvailable = () => {
        if (!doctorSchedule || doctorSchedule.length === 0) return false;

        const appointmentDate = new Date(appointmentForm.date);
        const appointmentTime = new Date(appointmentForm.time);

        const dayOfWeek = appointmentDate.getDay();

        const dayNames = ['SUNDAY', 'MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY'];
        const dayName = dayNames[dayOfWeek];

        const hours = appointmentTime.getHours();
        const minutes = appointmentTime.getMinutes();

        for (const workingHour of doctorSchedule) {
            if (workingHour.dayOfWeek === dayName) {
                const startHourParts = workingHour.startTime.split(':');
                const endHourParts = workingHour.endTime.split(':');

                const startTime = new Date();
                startTime.setHours(parseInt(startHourParts[0]), parseInt(startHourParts[1]), 0);

                const endTime = new Date();
                endTime.setHours(parseInt(endHourParts[0]), parseInt(endHourParts[1]), 0);

                const appointmentTimeObj = new Date();
                appointmentTimeObj.setHours(hours, minutes, 0);

                if (appointmentTimeObj >= startTime && appointmentTimeObj <= endTime) {
                    return true;
                }
            }
        }

        return false;
    };

    const hasAppointmentOverlap = (startDateTime, endDateTime) => {
        if (!doctorAppointments || doctorAppointments.length === 0) return false;

        const relevantAppointments = currentAppointment
            ? doctorAppointments.filter(app => app.id !== currentAppointment.id)
            : doctorAppointments;

        for (const appointment of relevantAppointments) {
            const existingStart = new Date(appointment.startDateTime);
            const existingEnd = new Date(appointment.endDateTime);

            if (
                (startDateTime >= existingStart && startDateTime < existingEnd) ||
                (endDateTime > existingStart && endDateTime <= existingEnd) ||
                (startDateTime <= existingStart && endDateTime >= existingEnd)
            ) {
                return true;
            }
        }

        return false;
    };

    const handleSaveAppointment = async () => {
        try {
            if (!appointmentForm.patientName || !appointmentForm.doctorId || !appointmentForm.serviceId) {
                setSnackbar({
                    open: true,
                    message: 'Completați toate câmpurile obligatorii',
                    severity: 'error'
                });
                return;
            }

            setSavingLoading(true);

            const appointmentDate = new Date(appointmentForm.date);
            const appointmentTime = new Date(appointmentForm.time);

            const year = appointmentDate.getFullYear();
            const month = appointmentDate.getMonth();
            const day = appointmentDate.getDate();
            const hours = appointmentTime.getHours();
            const minutes = appointmentTime.getMinutes();

            const startDate = new Date(year, month, day, hours, minutes, 0, 0);

            if (!isDoctorAvailable()) {
                setSnackbar({
                    open: true,
                    message: 'Medicul nu este disponibil în ziua sau intervalul orar selectat',
                    severity: 'error'
                });
                setSavingLoading(false);
                return;
            }

            const selectedService = services.find(service => service.id.toString() === appointmentForm.serviceId.toString());
            if (!selectedService) {
                setSnackbar({
                    open: true,
                    message: 'Eroare: Nu s-a putut găsi serviciul selectat',
                    severity: 'error'
                });
                setSavingLoading(false);
                return;
            }

            const endDate = new Date(startDate);

            let durationInMinutes = 30;

            if (selectedService.duration) {
                if (typeof selectedService.duration === 'object' && selectedService.duration.seconds) {
                    durationInMinutes = selectedService.duration.seconds / 60;
                } else if (typeof selectedService.duration === 'number') {
                    durationInMinutes = selectedService.duration / 60;
                }
            }

            endDate.setMinutes(startDate.getMinutes() + durationInMinutes);

            if (hasAppointmentOverlap(startDate, endDate)) {
                setSnackbar({
                    open: true,
                    message: 'Există deja o programare în intervalul orar selectat',
                    severity: 'error'
                });
                setSavingLoading(false);
                return;
            }

            const appointmentData = {
                id: currentAppointment ? currentAppointment.id : null,
                patientName: appointmentForm.patientName,
                doctor: { id: parseInt(appointmentForm.doctorId, 10) },
                medicalService: { id: parseInt(appointmentForm.serviceId, 10) },
                startDateTime: startDate.toISOString(),
                endDateTime: endDate.toISOString(),
                status: currentAppointment ? currentAppointment.status : 'NEW'
            };

            const response = await AppointmentService.createAppointment(appointmentData);

            setSnackbar({
                open: true,
                message: currentAppointment ? 'Programarea a fost actualizată cu succes' : 'Programarea a fost adăugată cu succes',
                severity: 'success'
            });

            handleCloseDialog();
            fetchAppointments();
        } catch (error) {
            console.error('Error saving appointment:', error);

            let errorMessage = 'Eroare la salvarea programării';
            if (error.response && error.response.data) {
                errorMessage = typeof error.response.data === 'string' ? error.response.data : JSON.stringify(error.response.data);
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        } finally {
            setSavingLoading(false);
        }
    };

    const handleUpdateStatus = async () => {
        try {
            if (!currentAppointment || !newStatus) {
                setSnackbar({
                    open: true,
                    message: 'Eroare: Date de status lipsă',
                    severity: 'error'
                });
                return;
            }

            setSavingLoading(true);
            const updatedAppointment = await AppointmentService.updateAppointmentStatus(currentAppointment.id, newStatus);

            setSnackbar({
                open: true,
                message: 'Statusul programării a fost actualizat cu succes',
                severity: 'success'
            });

            const updatedAppointments = appointments.map(app =>
                app.id === currentAppointment.id ? updatedAppointment : app
            );

            setAppointments(updatedAppointments);
            handleCloseDialog();
        } catch (error) {
            console.error('Error updating appointment status:', error);

            setSnackbar({
                open: true,
                message: 'Eroare la actualizarea statusului programării',
                severity: 'error'
            });
        } finally {
            setSavingLoading(false);
        }
    };

    const getDoctorScheduleTooltip = () => {
        if (!doctorSchedule || doctorSchedule.length === 0) return "Nu există ore de lucru definite pentru acest medic";

        return doctorSchedule.map(wh =>
            `${wh.dayOfWeek}: ${wh.startTime} - ${wh.endTime}`
        ).join("\n");
    };

    const formatDateTime = (dateTimeStr) => {
        const date = new Date(dateTimeStr);
        return format(date, 'dd MMMM yyyy, HH:mm', { locale: ro });
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    const handleResetSearch = () => {
        setSearchPatientName('');
        setStatusFilter('ALL');
    };

    const translateStatus = (status) => {
        switch(status) {
            case 'NEW': return 'Nou';
            case 'IN_PROGRESS': return 'În progres';
            case 'COMPLETED': return 'Finalizat';
            default: return status;
        }
    };

    return (
        <Box>
            <Box sx={{ mb: 3 }}>
                <Typography variant="h6" component="h2" gutterBottom>
                    Gestionare Programări
                </Typography>

                <Paper sx={{ p: 2, display: 'flex', flexDirection: 'column', gap: 2 }}>
                    <Grid container spacing={2} alignItems="center">
                        <Grid item xs={12} sm={6} md={4}>
                            <TextField
                                fullWidth
                                label="Caută după numele pacientului"
                                variant="outlined"
                                value={searchPatientName}
                                onChange={handleSearchChange}
                                InputProps={{
                                    startAdornment: (
                                        <SearchIcon color="action" sx={{ mr: 1 }} />
                                    ),
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6} md={3}>
                            <FormControl fullWidth variant="outlined">
                                <InputLabel>Filtrează după status</InputLabel>
                                <Select
                                    value={statusFilter}
                                    onChange={handleStatusFilterChange}
                                    label="Filtrează după status"
                                >
                                    <MenuItem value="ALL">Toate statusurile</MenuItem>
                                    <MenuItem value="NEW">Nou</MenuItem>
                                    <MenuItem value="IN_PROGRESS">În progres</MenuItem>
                                    <MenuItem value="COMPLETED">Finalizat</MenuItem>
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={12} md={5}>
                            <Box sx={{ display: 'flex', gap: 2, justifyContent: { xs: 'flex-start', md: 'flex-end' } }}>
                                <Button
                                    variant="outlined"
                                    startIcon={<RefreshIcon />}
                                    onClick={handleResetSearch}
                                >
                                    Resetează
                                </Button>
                                <Button
                                    variant="contained"
                                    startIcon={<AddIcon />}
                                    onClick={handleOpenAddDialog}
                                    sx={{ bgcolor: '#76b852', '&:hover': { bgcolor: '#5da03f' } }}
                                >
                                    Adaugă Programare
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

            <Paper sx={{ width: '100%', overflow: 'hidden' }}>
                {loading ? (
                    <Box sx={{ display: 'flex', justifyContent: 'center', my: 3 }}>
                        <CircularProgress />
                    </Box>
                ) : (
                    <TableContainer sx={{ maxHeight: 440 }}>
                        <Table stickyHeader>
                            <TableHead>
                                <TableRow>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>ID</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Pacient</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Medic</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Serviciu</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Data și Ora</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Status</TableCell>
                                    <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Acțiuni</TableCell>
                                </TableRow>
                            </TableHead>
                            <TableBody>
                                {filteredAppointments.length === 0 ? (
                                    <TableRow>
                                        <TableCell colSpan={7} align="center">
                                            Nu există programări care să corespundă criteriilor de căutare
                                        </TableCell>
                                    </TableRow>
                                ) : (
                                    filteredAppointments.map((appointment) => (
                                        <TableRow key={appointment.id} hover>
                                            <TableCell>{appointment.id}</TableCell>
                                            <TableCell>{appointment.patientName}</TableCell>
                                            <TableCell>{appointment.doctor.name}</TableCell>
                                            <TableCell>{appointment.medicalService.name}</TableCell>
                                            <TableCell>{formatDateTime(appointment.startDateTime)}</TableCell>
                                            <TableCell>
                                                <Box
                                                    sx={{
                                                        display: 'inline-block',
                                                        px: 1,
                                                        py: 0.5,
                                                        borderRadius: 1,
                                                        color: 'white',
                                                        bgcolor: appointment.status === 'NEW' ? '#2196f3' :
                                                            appointment.status === 'IN_PROGRESS' ? '#ff9800' : '#4caf50'
                                                    }}
                                                >
                                                    {translateStatus(appointment.status)}
                                                </Box>
                                            </TableCell>
                                            <TableCell>
                                                <Button
                                                    size="small"
                                                    startIcon={<EditIcon />}
                                                    onClick={() => handleOpenEditDialog(appointment)}
                                                    sx={{ mr: 1 }}
                                                >
                                                    Editează
                                                </Button>
                                                <Button
                                                    size="small"
                                                    color="primary"
                                                    startIcon={<UpdateIcon />}
                                                    onClick={() => handleOpenStatusDialog(appointment)}
                                                >
                                                    Status
                                                </Button>
                                            </TableCell>
                                        </TableRow>
                                    ))
                                )}
                            </TableBody>
                        </Table>
                    </TableContainer>
                )}
            </Paper>

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="md" fullWidth>
                <DialogTitle>
                    {currentAppointment ? 'Editare Programare' : 'Adăugare Programare'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Nume Pacient"
                                name="patientName"
                                value={appointmentForm.patientName}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Medic</InputLabel>
                                <Select
                                    name="doctorId"
                                    value={appointmentForm.doctorId}
                                    onChange={handleFormChange}
                                    label="Medic"
                                    required
                                >
                                    {doctors.map((doctor) => (
                                        <MenuItem key={doctor.id} value={doctor.id.toString()}>
                                            {doctor.name} ({doctor.specialization})
                                        </MenuItem>
                                    ))}
                                </Select>
                            </FormControl>
                            {appointmentForm.doctorId && (
                                <Box sx={{ mt: 1, display: 'flex', alignItems: 'center' }}>
                                    <Typography variant="caption" color="text.secondary">
                                        Program medic:
                                    </Typography>
                                    <Tooltip
                                        title={
                                            <pre style={{ whiteSpace: 'pre-wrap' }}>
                                                {getDoctorScheduleTooltip()}
                                            </pre>
                                        }
                                    >
                                        <InfoIcon fontSize="small" color="info" sx={{ ml: 1, cursor: 'pointer' }} />
                                    </Tooltip>
                                </Box>
                            )}
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <FormControl fullWidth margin="normal">
                                <InputLabel>Serviciu Medical</InputLabel>
                                <Select
                                    name="serviceId"
                                    value={appointmentForm.serviceId}
                                    onChange={handleFormChange}
                                    label="Serviciu Medical"
                                    required
                                >
                                    {services.map((service) => {
                                        let durationMinutes = 30;
                                        if (service.duration) {
                                            if (typeof service.duration === 'object' && service.duration.seconds) {
                                                durationMinutes = service.duration.seconds / 60;
                                            } else if (typeof service.duration === 'number') {
                                                durationMinutes = service.duration / 60;
                                            }
                                        }

                                        return (
                                            <MenuItem key={service.id} value={service.id.toString()}>
                                                {service.name} ({service.price} lei, {durationMinutes} min)
                                            </MenuItem>
                                        );
                                    })}
                                </Select>
                            </FormControl>
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                                Data:
                            </Typography>
                            <DatePicker
                                selected={appointmentForm.date}
                                onChange={handleDateChange}
                                dateFormat="dd/MM/yyyy"
                                minDate={new Date()}
                                customInput={
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                    />
                                }
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <Typography variant="subtitle1" sx={{ mt: 2, mb: 1 }}>
                                Ora:
                            </Typography>
                            <DatePicker
                                selected={appointmentForm.time}
                                onChange={handleTimeChange}
                                showTimeSelect
                                showTimeSelectOnly
                                timeIntervals={15}
                                dateFormat="HH:mm"
                                timeFormat="HH:mm"
                                timeCaption="Ora"
                                customInput={
                                    <TextField
                                        fullWidth
                                        variant="outlined"
                                    />
                                }
                            />
                        </Grid>
                        {appointmentForm.doctorId && !isDoctorAvailable() && (
                            <Grid item xs={12}>
                                <Alert severity="warning" sx={{ mt: 2 }}>
                                    Atenție: Medicul selectat nu este disponibil în ziua sau intervalul orar selectat.
                                </Alert>
                            </Grid>
                        )}
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anulează</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveAppointment}
                        disabled={savingLoading}
                        sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#2a75f3' } }}
                    >
                        {savingLoading ? <CircularProgress size={24} /> : 'Salvează'}
                    </Button>
                </DialogActions>
            </Dialog>

            <Dialog open={openStatusDialog} onClose={handleCloseDialog}>
                <DialogTitle>Actualizare Status Programare</DialogTitle>
                <DialogContent>
                    <Typography gutterBottom>
                        Programare pentru: <strong>{currentAppointment?.patientName}</strong>
                    </Typography>
                    <Typography gutterBottom>
                        Medic: <strong>{currentAppointment?.doctor?.name}</strong>
                    </Typography>
                    <Typography gutterBottom sx={{ mb: 3 }}>
                        Data: <strong>{currentAppointment && formatDateTime(currentAppointment.startDateTime)}</strong>
                    </Typography>

                    <FormControl fullWidth>
                        <InputLabel>Status Nou</InputLabel>
                        <Select
                            value={newStatus}
                            onChange={(e) => setNewStatus(e.target.value)}
                            label="Status Nou"
                        >
                            <MenuItem value="NEW">Nou</MenuItem>
                            <MenuItem value="IN_PROGRESS">În progres</MenuItem>
                            <MenuItem value="COMPLETED">Finalizat</MenuItem>
                        </Select>
                    </FormControl>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anulează</Button>
                    <Button
                        variant="contained"
                        onClick={handleUpdateStatus}
                        disabled={savingLoading}
                        sx={{ bgcolor: '#4285f4', '&:hover': { bgcolor: '#2a75f3' } }}
                    >
                        {savingLoading ? <CircularProgress size={24} /> : 'Actualizează'}
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

export default AppointmentManagement;