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
    OutlinedInput,
    InputAdornment,
    IconButton
} from '@mui/material';
import ReceptionistService from '../api/ReceptionistService';
import AddIcon from '@mui/icons-material/Add';
import EditIcon from '@mui/icons-material/Edit';
import DeleteIcon from '@mui/icons-material/Delete';
import Visibility from '@mui/icons-material/Visibility';
import VisibilityOff from '@mui/icons-material/VisibilityOff';

const ReceptionistManagement = () => {
    const [receptionists, setReceptionists] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    const [openDialog, setOpenDialog] = useState(false);
    const [openDeleteDialog, setOpenDeleteDialog] = useState(false);
    const [currentReceptionist, setCurrentReceptionist] = useState(null);
    const [snackbar, setSnackbar] = useState({
        open: false,
        message: '',
        severity: 'success'
    });

    const [receptionistForm, setReceptionistForm] = useState({
        name: '',
        username: '',
        password: ''
    });
    const [showPassword, setShowPassword] = useState(false);

    useEffect(() => {
        fetchReceptionists();
    }, []);

    const fetchReceptionists = async () => {
        try {
            setLoading(true);
            const data = await ReceptionistService.getAllReceptionists();
            setReceptionists(data);
            setError(null);
        } catch (err) {
            setError('Eroare la încărcarea recepționiștilor');
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleFormChange = (e) => {
        const { name, value } = e.target;
        setReceptionistForm({
            ...receptionistForm,
            [name]: value
        });
    };

    const handleClickShowPassword = () => {
        setShowPassword(!showPassword);
    };

    const handleOpenAddDialog = () => {
        setCurrentReceptionist(null);
        setReceptionistForm({
            name: '',
            username: '',
            password: ''
        });
        setOpenDialog(true);
    };

    const handleOpenEditDialog = (receptionist) => {
        setCurrentReceptionist(receptionist);
        setReceptionistForm({
            name: receptionist.name,
            username: receptionist.username,
            password: ''
        });
        setOpenDialog(true);
    };

    const handleOpenDeleteDialog = (receptionist) => {
        setCurrentReceptionist(receptionist);
        setOpenDeleteDialog(true);
    };

    const handleCloseDialog = () => {
        setOpenDialog(false);
        setOpenDeleteDialog(false);
    };

    const handleSaveReceptionist = async () => {
        try {
            if (!receptionistForm.name || !receptionistForm.username) {
                setSnackbar({
                    open: true,
                    message: 'Completați numele și numele de utilizator',
                    severity: 'error'
                });
                return;
            }

            if (!currentReceptionist && !receptionistForm.password) {
                setSnackbar({
                    open: true,
                    message: 'Completați parola pentru noul recepționist',
                    severity: 'error'
                });
                return;
            }

            const receptionistData = {
                id: currentReceptionist ? currentReceptionist.id : null,
                name: receptionistForm.name,
                username: receptionistForm.username,
                password: receptionistForm.password || undefined
            };

            if (currentReceptionist) {
                await ReceptionistService.updateReceptionist(currentReceptionist.id, receptionistData);
                setSnackbar({
                    open: true,
                    message: 'Recepționistul a fost actualizat cu succes',
                    severity: 'success'
                });
            } else {
                await ReceptionistService.createReceptionist(receptionistData);
                setSnackbar({
                    open: true,
                    message: 'Recepționistul a fost adăugat cu succes',
                    severity: 'success'
                });
            }

            handleCloseDialog();
            fetchReceptionists();
        } catch (error) {
            console.error('Error saving receptionist:', error);

            if (error.response && error.response.status === 400) {
                setSnackbar({
                    open: true,
                    message: 'Numele de utilizator există deja',
                    severity: 'error'
                });
            } else {
                setSnackbar({
                    open: true,
                    message: 'Eroare la salvarea recepționistului',
                    severity: 'error'
                });
            }
        }
    };

    const handleDeleteReceptionist = async () => {
        try {
            await ReceptionistService.deleteReceptionist(currentReceptionist.id);

            setSnackbar({
                open: true,
                message: 'Recepționistul a fost șters cu succes',
                severity: 'success'
            });

            handleCloseDialog();
            fetchReceptionists();
        } catch (error) {
            console.error('Error deleting receptionist:', error);
            setSnackbar({
                open: true,
                message: 'Eroare la ștergerea recepționistului',
                severity: 'error'
            });
        }
    };

    const handleCloseSnackbar = () => {
        setSnackbar({ ...snackbar, open: false });
    };

    return (
        <Box>
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
                <Typography variant="h6" component="h2">
                    Gestionare Recepționiști
                </Typography>
                <Button
                    variant="contained"
                    startIcon={<AddIcon />}
                    onClick={handleOpenAddDialog}
                    sx={{ bgcolor: '#76b852', '&:hover': { bgcolor: '#5da03f' } }}
                >
                    Adaugă Recepționist
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
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Nume de utilizator</TableCell>
                                <TableCell sx={{ fontWeight: 'bold', bgcolor: '#4285f4', color: 'white' }}>Acțiuni</TableCell>
                            </TableRow>
                        </TableHead>
                        <TableBody>
                            {receptionists.length === 0 ? (
                                <TableRow>
                                    <TableCell colSpan={4} align="center">
                                        Nu există recepționiști înregistrați
                                    </TableCell>
                                </TableRow>
                            ) : (
                                receptionists.map((receptionist) => (
                                    <TableRow key={receptionist.id} hover>
                                        <TableCell>{receptionist.id}</TableCell>
                                        <TableCell>{receptionist.name}</TableCell>
                                        <TableCell>{receptionist.username}</TableCell>
                                        <TableCell>
                                            <Button
                                                size="small"
                                                startIcon={<EditIcon />}
                                                onClick={() => handleOpenEditDialog(receptionist)}
                                                sx={{ mr: 1 }}
                                            >
                                                Editează
                                            </Button>
                                            <Button
                                                size="small"
                                                color="error"
                                                startIcon={<DeleteIcon />}
                                                onClick={() => handleOpenDeleteDialog(receptionist)}
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
                    {currentReceptionist ? 'Editare Recepționist' : 'Adăugare Recepționist'}
                </DialogTitle>
                <DialogContent dividers>
                    <Grid container spacing={2}>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Nume"
                                name="name"
                                value={receptionistForm.name}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <TextField
                                fullWidth
                                margin="normal"
                                label="Nume de utilizator"
                                name="username"
                                value={receptionistForm.username}
                                onChange={handleFormChange}
                                required
                            />
                        </Grid>
                        <Grid item xs={12}>
                            <FormControl fullWidth margin="normal" variant="outlined">
                                <InputLabel htmlFor="password">Parolă {currentReceptionist ? '(Opțional)' : ''}</InputLabel>
                                <OutlinedInput
                                    id="password"
                                    name="password"
                                    type={showPassword ? 'text' : 'password'}
                                    value={receptionistForm.password}
                                    onChange={handleFormChange}
                                    required={!currentReceptionist}
                                    endAdornment={
                                        <InputAdornment position="end">
                                            <IconButton
                                                aria-label="toggle password visibility"
                                                onClick={handleClickShowPassword}
                                                edge="end"
                                            >
                                                {showPassword ? <VisibilityOff /> : <Visibility />}
                                            </IconButton>
                                        </InputAdornment>
                                    }
                                    label={`Parolă ${currentReceptionist ? '(Opțional)' : ''}`}
                                />
                            </FormControl>
                            {currentReceptionist && (
                                <Typography variant="caption" color="text.secondary">
                                    Completați parola doar dacă doriți să o modificați.
                                </Typography>
                            )}
                        </Grid>
                    </Grid>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anulează</Button>
                    <Button
                        variant="contained"
                        onClick={handleSaveReceptionist}
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
                        Sigur doriți să ștergeți recepționistul "{currentReceptionist?.name}"?
                    </Typography>
                </DialogContent>
                <DialogActions>
                    <Button onClick={handleCloseDialog}>Anulează</Button>
                    <Button
                        variant="contained"
                        color="error"
                        onClick={handleDeleteReceptionist}
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

export default ReceptionistManagement;