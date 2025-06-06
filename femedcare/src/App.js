import React, { useContext } from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, AuthContext } from './contexts/AuthContext';
import Login from './pages/Login';
import AdminDashboard from './pages/AdminDashboard';
import ReceptionistDashboard from './pages/ReceptionistDashboard';
import './App.css';

// Component for protected routes
const PrivateRoute = ({ element, requiredRole }) => {
    const { currentUser, isAdmin, isReceptionist } = useContext(AuthContext);

    console.log('PrivateRoute check:', {
        currentUser: currentUser ? 'yes' : 'no',
        requiredRole,
        isAdmin: isAdmin(),
        isReceptionist: isReceptionist()
    });

    // Check if user is authenticated
    if (!currentUser) {
        console.log('User not authenticated, redirecting to login');
        return <Navigate to="/login" />;
    }

    // Check role
    if (requiredRole === 'admin' && !isAdmin()) {
        console.log('User is not admin, redirecting to unauthorized');
        return <Navigate to="/unauthorized" />;
    }

    if (requiredRole === 'receptionist' && !isReceptionist()) {
        console.log('User is not receptionist, redirecting to unauthorized');
        return <Navigate to="/unauthorized" />;
    }

    console.log('User authorized, rendering component');
    return element;
};

// Component for public routes
const PublicRoute = ({ element }) => {
    const { currentUser, isAdmin, isReceptionist } = useContext(AuthContext);

    console.log('PublicRoute check:', {
        currentUser: currentUser ? 'yes' : 'no',
        isAdmin: isAdmin(),
        isReceptionist: isReceptionist()
    });

    // Redirect if user is already authenticated
    if (currentUser) {
        if (isAdmin()) {
            console.log('User is already logged in as admin, redirecting to admin dashboard');
            return <Navigate to="/admin-dashboard" />;
        }

        if (isReceptionist()) {
            console.log('User is already logged in as receptionist, redirecting to receptionist dashboard');
            return <Navigate to="/receptionist-dashboard" />;
        }
    }

    console.log('User not logged in, showing public route');
    return element;
};

const Unauthorized = () => (
    <div style={{ textAlign: 'center', marginTop: '50px' }}>
        <h1>Acces neautorizat</h1>
        <p>Nu ai permisiunea de a accesa această pagină.</p>
    </div>
);

function AppContent() {
    console.log('Rendering AppContent');

    return (
        <Router>
            <Routes>
                <Route path="/login" element={<PublicRoute element={<Login />} />} />
                <Route path="/admin-dashboard" element={<PrivateRoute element={<AdminDashboard />} requiredRole="admin" />} />
                <Route path="/receptionist-dashboard" element={<PrivateRoute element={<ReceptionistDashboard />} requiredRole="receptionist" />} />
                <Route path="/unauthorized" element={<Unauthorized />} />
                <Route path="/" element={<Navigate to="/login" />} />
                <Route path="*" element={<Navigate to="/login" />} />
            </Routes>
        </Router>
    );
}

function App() {
    console.log('Rendering App component');

    return (
        <AuthProvider>
            <AppContent />
        </AuthProvider>
    );
}

export default App;