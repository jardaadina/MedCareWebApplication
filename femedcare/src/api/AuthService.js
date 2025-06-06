import api from './api';

const AuthService = {
    login: async (username, password) => {
        try {
            console.log('AuthService: Making login request to API');
            const response = await api.post('/auth/login', { username, password });
            console.log('AuthService: Login response received', response);

            if (response.data) {
                console.log('AuthService: Saving user data to localStorage');
                localStorage.setItem('user', JSON.stringify(response.data));
                return response.data;
            } else {
                console.error('AuthService: No data in response');
                throw new Error('No data returned from server');
            }
        } catch (error) {
            console.error('AuthService: Login error', error);
            if (error.response) {
                console.error('AuthService: Error response', error.response);
                throw new Error(error.response.data || 'Authentication failed');
            } else if (error.request) {
                console.error('AuthService: Error request', error.request);
                throw new Error('No response from server. Is the backend running?');
            } else {
                throw error;
            }
        }
    },

    logout: () => {
        console.log('AuthService: Removing user from localStorage');
        localStorage.removeItem('user');
    },

    getCurrentUser: () => {
        try {
            const userStr = localStorage.getItem('user');
            if (userStr) {
                console.log('AuthService: User found in localStorage');
                return JSON.parse(userStr);
            }
            console.log('AuthService: No user in localStorage');
            return null;
        } catch (error) {
            console.error('AuthService: Error parsing user from localStorage', error);
            localStorage.removeItem('user');
            return null;
        }
    },

    isAdmin: () => {
        const user = AuthService.getCurrentUser();
        return user && user.userType === 'Administrator';
    },

    isReceptionist: () => {
        const user = AuthService.getCurrentUser();
        return user && user.userType === 'Receptionist';
    }
};

export default AuthService;