import api from './api';

const MedicalServiceService = {
    getAllServices: async () => {
        try {
            console.log('MedicalServiceService: Getting all services');
            const response = await api.get('/medical-services');
            console.log('Services retrieved successfully', response.data);
            return response.data;
        } catch (error) {
            console.error('Error retrieving services:', error);
            throw handleApiError(error, 'Nu am putut obține lista de servicii medicale');
        }
    },

    getServiceById: async (id) => {
        try {
            console.log(`MedicalServiceService: Getting service with ID ${id}`);
            const response = await api.get(`/medical-services/${id}`);
            return response.data;
        } catch (error) {
            console.error(`Error retrieving service with ID ${id}:`, error);
            throw handleApiError(error, 'Nu am putut găsi serviciul medical');
        }
    },

    createService: async (serviceData) => {
        try {
            console.log('MedicalServiceService: Creating new service', serviceData);

            // Format data for backend - ensure duration is in correct format
            const formattedData = formatServiceData(serviceData);
            console.log('Formatted data for backend:', formattedData);

            const response = await api.post('/medical-services', formattedData);
            console.log('Service created successfully', response.data);
            return response.data;
        } catch (error) {
            console.error('Error creating service:', error);
            throw handleApiError(error, 'Nu am putut crea serviciul medical');
        }
    },

    updateService: async (id, serviceData) => {
        try {
            console.log(`MedicalServiceService: Updating service with ID ${id}`, serviceData);

            const formattedData = formatServiceData(serviceData);
            console.log('Formatted data for backend:', formattedData);

            const response = await api.put(`/medical-services/${id}`, formattedData);
            console.log('Service updated successfully', response.data);
            return response.data;
        } catch (error) {
            console.error(`Error updating service with ID ${id}:`, error);
            throw handleApiError(error, 'Nu am putut actualiza serviciul medical');
        }
    },

    deleteService: async (id) => {
        try {
            console.log(`MedicalServiceService: Deleting service with ID ${id}`);
            await api.delete(`/medical-services/${id}`);
            console.log('Service deleted successfully');
            return true;
        } catch (error) {
            console.error(`Error deleting service with ID ${id}:`, error);
            throw handleApiError(error, 'Nu am putut șterge serviciul medical');
        }
    },

    getMostRequestedServices: async () => {
        try {
            console.log('MedicalServiceService: Getting most requested services');
            const response = await api.get('/medical-services/most-requested');
            return response.data;
        } catch (error) {
            console.error('Error getting most requested services:', error);
            throw handleApiError(error, 'Nu am putut obține statisticile pentru servicii');
        }
    }
};

function formatServiceData(serviceData) {
    const formattedData = { ...serviceData };

    if (typeof formattedData.price === 'string') {
        formattedData.price = parseFloat(formattedData.price);
    }

    if (formattedData.duration !== undefined) {
        const durationInSeconds = typeof formattedData.duration === 'number'
            ? formattedData.duration * 60
            : parseInt(formattedData.duration) * 60;

        formattedData.duration = `PT${durationInSeconds}S`;

        console.log('Formatted duration:', formattedData.duration);
    }

    return formattedData;
}

function handleApiError(error, defaultMessage) {
    console.error('Full error object:', error);

    if (error.response) {
        console.error('Server responded with error:', error.response.status);
        console.error('Response data:', error.response.data);

        if (error.response.status === 401) {
            return new Error('Sesiunea a expirat. Vă rugăm să vă autentificați din nou.');
        }

        if (error.response.status === 403) {
            return new Error('Nu aveți permisiunea necesară pentru această acțiune.');
        }

        if (error.response.data && typeof error.response.data === 'string') {
            return new Error(error.response.data);
        }

        if (error.response.status === 400) {
            return new Error('Date invalide. Verificați informațiile introduse.');
        }

        if (error.response.status === 404) {
            return new Error('Resursa solicitată nu a fost găsită.');
        }

        if (error.response.status === 500) {
            return new Error('Eroare de server. Vă rugăm să încercați mai târziu.');
        }
    } else if (error.request) {
        console.error('No response received:', error.request);
        return new Error('Nu am primit răspuns de la server. Verificați conexiunea.');
    }

    console.error('Request setup error:', error.message);
    return new Error(defaultMessage || 'A apărut o eroare. Vă rugăm să încercați din nou.');
}

export default MedicalServiceService;