import React, { useState, useEffect, useContext } from 'react';
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
    InputAdornment
} from '@mui/material';
import MedicalServiceService from '../api/MedicalService';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import BugReportIcon from '@mui/icons-material/BugReport';
import { AuthContext } from '../contexts/AuthContext';

const ServiceManagement = () => {
    const [services, setServices] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [openDebugDialog, setOpenDebugDialog] = useState(false);
    const [currentService, setCurrentService] = useState(null);
    const [debugInfo, setDebugInfo] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const { currentUser, isAdmin } = useContext(AuthContext);

    const [serviceForm, setServiceForm] = useState({
        name: '',
        price: '',
        duration: ''
    });

    useEffect(() => {
        fetchServices();
    }, []);

    const fetchServices = async () => {
        try {
            setLoading(true);
            console.log('Fetching medical services...');
            const data = await MedicalServiceService.getAllServices();
            console.log('Services fetched successfully:', data);
            setServices(data);
            setError(null);
        } catch (err) {
            console.error('Error fetching services:', err);
            setError('Eroare la încărcarea serviciilor medicale: ' + (err.message || 'Eroare necunoscută'));
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setServiceForm({
            ...serviceForm,
            [name]: value
        });
    };

    const handleOpenAddDialog = () => {
        setCurrentService(null);
        setServiceForm({
            name: '',
            price: '',
            duration: ''
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (service) => {
        setCurrentService(service);

        const durationMinutes = service.duration && service.duration.seconds
            ? service.duration.seconds / 60
            : (typeof service.duration === 'number' ? service.duration / 60 : 0);

        setServiceForm({
            name: service.name,
            price: service.price.toString(),
            duration: durationMinutes.toString()
        });

        setOpenDialog(true);
    };

    const handleOpenDeleteDialog = (service) => {
        setCurrentService(service);
        setOpenDeleteDialog(true);
    };


    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSaveService = async () => {
        try {
            if (!serviceForm.name || !serviceForm.price || !serviceForm.duration) {
                setSnackbar({
                    open: true,
                    message: 'Completați toate câmpurile',
                    severity: 'error'
                });
                return;
            }

            if (isNaN(parseFloat(serviceForm.price)) || parseFloat(serviceForm.price) <= 0) {
                setSnackbar({
                    open: true,
                    message: 'Prețul trebuie să fie un număr pozitiv',
                    severity: 'error'
                });
                return;
            }

            if (isNaN(parseInt(serviceForm.duration)) || parseInt(serviceForm.duration) <= 0) {
                setSnackbar({
                    open: true,
                    message: 'Durata trebuie să fie un număr întreg pozitiv',
                    severity: 'error'
                });
                return;
            }

            const serviceData = {
                id: currentService ? currentService.id : null,
                name: serviceForm.name,
                price: parseFloat(serviceForm.price),
                duration: parseInt(serviceForm.duration)
            };

            console.log('Saving service data:', serviceData);

            if (currentService) {
                console.log('Updating existing service with ID:', currentService.id);
                await MedicalServiceService.updateService(currentService.id, serviceData);
                setSnackbar({
                    open: true,
                    message: 'Serviciul a fost actualizat cu succes',
                    severity: 'success'
                });
            } else {
                console.log('Creating new service');
                await MedicalServiceService.createService(serviceData);
                setSnackbar({
                    open: true,
                    message: 'Serviciul a fost adăugat cu succes',
                    severity: 'success'
                });
            }

            handleCloseDialog();
            fetchServices();
        } catch (error) {
            console.error('Error saving service:', error);

            let errorMessage = 'Eroare la salvarea serviciului';

            if (error.response) {
                if (error.response.status === 403) {
                    errorMessage = 'Nu aveți permisiunea de a efectua această acțiune. Este necesară autorizare de administrator.';
                } else if (error.response.data) {
                    errorMessage = error.response.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const handleDeleteService = async () => {
        try {
            console.log('Deleting service with ID:', currentService.id);
            await MedicalServiceService.deleteService(currentService.id);

            setSnackbar({
                open: true,
                message: 'Serviciul a fost șters cu succes',
                severity: 'success'
            });

            handleCloseDialog();
            fetchServices();
        } catch (error) {
            console.error('Error deleting service:', error);

            let errorMessage = 'Eroare la ștergerea serviciului';

            if (error.response) {
                if (error.response.status === 403) {
                    errorMessage = 'Nu aveți permisiunea de a șterge acest serviciu. Este necesară autorizare de administrator.';
                } else if (error.response.status === 500) {
                    errorMessage = 'Eroare de server. Serviciul nu poate fi șters deoarece este posibil să fie utilizat în programări.';
                } else if (error.response.data) {
                    errorMessage = error.response.data;
                }
            } else if (error.message) {
                errorMessage = error.message;
            }

            setSnackbar({
                open: true,
                message: errorMessage,
                severity: 'error'
            });
        }
    };

    const formatDuration = (duration) => {
        if (!duration) {
            return '0 minute';
        }

        const minutes = typeof duration === 'object' && duration.seconds
            ? duration.seconds / 60
            : (typeof duration === 'number' ? duration / 60 : 0);

        return `${minutes} minute`;
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Gestionare Servicii Medicale
                </Typography>
                <Box>
                    <Button
                        variant="contained"
                        startIcon={<AddIcon />}
                        onClick={handleOpenAddDialog}
                        sx={{ bgcolor: '#76b852', '&:hover': { bgcolor: '#5da03f' } }}
                    >
                        Adaugă Serviciu
                    </Button>
                </Box>
            </Box>

            {error && (
                <Alert severity="error" sx={{ mb: 2 }}>
                    {error}
                </Alert>
            )}

            {!isAdmin || !isAdmin() && (
                <Alert severity="warning" sx={{ mb: 2 }}>
                    Notă: Pentru a adăuga, edita sau șterge servicii medicale, trebuie să fiți autentificat ca administrator.
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
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Preț (lei)</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Durată</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Acțiuni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {services.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={5} align="center">
                                        Nu există servicii înregistrate
                                    </TableCell>
                                </TableRow>
                            ) : (
                                services.map((service) => (
                                    <TableRow key={service.id} hover>
                                        <TableCell>{service.id}</TableCell>
                                        <TableCell>{service.name}</TableCell>
                                        <TableCell>{service.price} lei</TableCell>
                                        <TableCell>{formatDuration(service.duration)}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenEditDialog(service)}
                                                sx={{ mr: 1 }}
                                                disabled={!isAdmin || !isAdmin()}
                                            >
                                                Editează
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDeleteDialog(service)}
                                                disabled={!isAdmin || !isAdmin()}
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

            <Dialog open={openDialog} onClose={handleCloseDialog} maxWidth="sm" fullWidth>
                <DialogTitle>
                    {currentService ? 'Editare Serviciu' : 'Adăugare Serviciu'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Nume"
                                name="name"
                                value={serviceForm.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Preț"
                                name="price"
                                type="number"
                                value={serviceForm.price}
                                onChange={handleFormChange}
                                required
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">lei</InputAdornment>,
                                }}
                            />
                        </Grid>
                        <Grid item xs={12} sm={6}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Durată"
                                name="duration"
                                type="number"
                                value={serviceForm.duration}
                                onChange={handleFormChange}
                                required
                                InputProps={{
                                    endAdornment: <InputAdornment position="end">minute</InputAdornment>,
                                }}
                            />
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anulează</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveService}
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
                        Sigur doriți să ștergeți serviciul "{currentService?.name}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anulează</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteService}
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

export default ServiceManagement;