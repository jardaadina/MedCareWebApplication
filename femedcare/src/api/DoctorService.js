import api from './api';

const DoctorService = {
    getAllDoctors: async () => {
        try {
            const response = await api.get('/doctors');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getDoctorById: async (id) => {
        try {
            const response = await api.get(`/doctors/${id}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createDoctor: async (doctorData) => {
        try {
            const response = await api.post('/doctors', doctorData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateDoctor: async (id, doctorData) => {
        try {
            const response = await api.put(`/doctors/${id}`, doctorData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteDoctor: async (id) => {
        try {
            await api.delete(`/doctors/${id}`);
            return true;
        } catch (error) {
            throw error;
        }
    },

    getDoctorsBySpecialization: async (specialization) => {
        try {
            const response = await api.get(`/doctors/specialization/${specialization}`);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    getMostRequestedDoctors: async () => {
        try {
            const response = await api.get('/doctors/most-requested');
            return response.data;
        } catch (error) {
            throw error;
        }
    }
};
export default DoctorService;