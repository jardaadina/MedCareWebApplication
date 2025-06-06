import api from './api';

const AppointmentService = {
    getAllAppointments: async () => {
        try {
            const response = await api.get('/appointments');
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments:', error);
            throw error;
        }
    },

    getAppointmentById: async (id) => {
        try {
            const response = await api.get(`/appointments/${id}`);
            return response.data;
        } catch (error) {
            console.error('Error fetching appointment:', error);
            throw error;
        }
    },

    getAppointmentsByDateRange: async (start, end) => {
        try {
            const response = await api.get('/appointments/date-range', {
                params: { start, end }
            });
            return response.data;
        } catch (error) {
            console.error('Error fetching appointments by date range:', error);
            throw error;
        }
    },

    searchAppointmentsByPatientName: async (patientName) => {
        try {
            const response = await api.get('/appointments/search', {
                params: { patientName }
            });
            return response.data;
        } catch (error) {
            console.error('Error searching appointments:', error);
            throw error;
        }
    },

    createAppointment: async (appointmentData) => {
        try {
            console.log('Sending appointment data to server:', JSON.stringify(appointmentData));
            const response = await api.post('/appointments', appointmentData);
            return response.data;
        } catch (error) {
            console.error('Error creating appointment:', error);
            if (error.response) {
                console.error('Server response:', error.response.data);
            }
            throw error;
        }
    },

    updateAppointmentStatus: async (id, status) => {
        try {
            console.log(`Updating appointment ${id} status to ${status}`);

            const response = await api.put(`/appointments/${id}/status`, status);

            console.log('Status update response:', response.data);
            return response.data;
        } catch (error) {
            console.error('Error updating appointment status:', error);
            throw error;
        }
    }
};

export default AppointmentService;