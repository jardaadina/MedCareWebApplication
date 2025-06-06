import React, { createContext, useState, useEffect } from 'react';
import AuthService from '../api/AuthService';

export const AuthContext = createContext();

export const AuthProvider = ({ children }) => {
    const [currentUser, setCurrentUser] = useState(null);
    const [loading, setLoading] = useState(true);
    const [authError, setAuthError] = useState(null);

    useEffect(() => {
        const user = AuthService.getCurrentUser();
        if (user) {
            console.log('Found saved user in localStorage:', user);
            setCurrentUser(user);
        } else {
            console.log('No user found in localStorage');
        }
        setLoading(false);
    }, []);

    const login = async (username, password) => {
        try {
            console.log('Attempting login for user:', username);
            const user = await AuthService.login(username, password);
            console.log('Login successful, user data:', user);

            if (!user.userType) {
                console.error('User data missing userType:', user);
                throw new Error('Datele utilizatorului sunt incomplete. Contactați administratorul.');
            }

            setCurrentUser(user);
            setAuthError(null);
            return user;
        } catch (error) {
            console.error('Login error:', error);
            setAuthError(error.message || 'Login failed');
            throw error;
        }
    };

    const logout = () => {
        console.log('Logging out user');
        AuthService.logout();
        setCurrentUser(null);
    };

    const isAdmin = () => {
        if (!currentUser) {
            console.log('isAdmin check: No current user');
            return false;
        }

        const hasAdminRole = currentUser.userType === 'Administrator';
        console.log(`isAdmin check: User type is ${currentUser.userType}, isAdmin=${hasAdminRole}`);
        return hasAdminRole;
    };

    const isReceptionist = () => {
        if (!currentUser) {
            console.log('isReceptionist check: No current user');
            return false;
        }

        const hasReceptionistRole = currentUser.userType === 'Receptionist';
        console.log(`isReceptionist check: User type is ${currentUser.userType}, isReceptionist=${hasReceptionistRole}`);
        return hasReceptionistRole;
    };

    const getUserRole = () => {
        if (!currentUser) return 'Not logged in';
        return currentUser.userType || 'Unknown';
    };

    const hasPermission = (requiredPermission) => {
        if (!currentUser) return false;

        switch(requiredPermission) {
            case 'manage_services':
            case 'manage_doctors':
            case 'manage_receptionists':
                return isAdmin();

            case 'manage_appointments':
                return isAdmin() || isReceptionist();

            default:
                console.warn(`Unknown permission check: ${requiredPermission}`);
                return false;
        }
    };

    const value = {
        currentUser,
        authError,
        login,
        logout,
        isAdmin,
        isReceptionist,
        getUserRole,
        hasPermission
    };

    return (
        <AuthContext.Provider value={value}>
            {!loading && children}
        </AuthContext.Provider>
    );
};