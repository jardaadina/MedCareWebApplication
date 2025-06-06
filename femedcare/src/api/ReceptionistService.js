import api from './api';

const ReceptionistService = {
    getAllReceptionists: async () => {
        try {
            const response = await api.get('/receptionists');
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    createReceptionist: async (receptionistData) => {
        try {
            const response = await api.post('/receptionists', receptionistData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    updateReceptionist: async (id, receptionistData) => {
        try {
            const response = await api.put(`/receptionists/${id}`, receptionistData);
            return response.data;
        } catch (error) {
            throw error;
        }
    },

    deleteReceptionist: async (id) => {
        try {
            await api.delete(`/receptionists/${id}`);
            return true;
        } catch (error) {
            throw error;
        }
    }
};

export default ReceptionistService;