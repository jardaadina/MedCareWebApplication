import api from './api';

const ReportService = {
    getAppointmentsReport: async (startDate, endDate) => {
        try {
            const response = await api.get('/reports/appointments', {
                params: { startDate, endDate }
            });
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getMostRequestedDoctorsReport: async () => {
        try {
            const response = await api.get('/reports/doctors/most-requested');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getMostRequestedServicesReport: async () => {
        try {
            const response = await api.get('/reports/services/most-requested');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    exportAppointmentsToCSV: async (startDate, endDate) => {
        try {
            const response = await api.get('/reports/appointments/export', {
                params: { startDate, endDate },
                responseType: 'blob'
            });

            const url = window.URL.createObjectURL(new Blob([response.data]));
            const link = document.createElement('a');
            link.href = url;
            link.setAttribute('download', 'appointments.csv');
            document.body.appendChild(link);
            link.click();
            link.remove();

            return true;
        } catch (error) {
            throw error;
        }
    }
};

export default ReportService;