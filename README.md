# MedCare Clinic Management System

A full-stack medical clinic management application built with **Spring Boot** (backend) and **React** (frontend).

## Features

### User Roles
- **Administrator**: Manage doctors, receptionists, medical services, and view reports
- **Receptionist**: Manage patient appointments and view appointment details

### Core Functionality
- **User Authentication**: Role-based access control
- **Doctor Management**: Add, edit, delete doctors with working schedules
- **Medical Services**: Manage services with pricing and duration
- **Appointment Scheduling**: Create and manage patient appointments with conflict detection
- **Reports & Analytics**: Generate appointment reports and export to CSV
- **Real-time Validation**: Check doctor availability and prevent scheduling conflicts

## Tech Stack

### Backend
- **Java 17** with **Spring Boot 3.x**
- **Spring Security** for authentication
- **Spring Data JPA** with Hibernate
- **H2 Database** (in-memory for development)
- **Maven** for dependency management

### Frontend
- **React 18** with functional components and hooks
- **Material-UI (MUI)** for responsive design
- **React Router** for navigation
- **Axios** for API communication
- **React DatePicker** for date/time selection

## Default Users

The application comes with pre-configured users:

- **Administrator**
  - Username: `admin`
  - Password: `admin123`

- **Receptionist**
  - Username: `reception`
  - Password: `reception123`

## Key Features Implementation

### Appointment Management
- Doctor availability validation based on working hours
- Automatic conflict detection for overlapping appointments
- Service duration calculation for end times
- Real-time status updates (New, In Progress, Completed)

### Role-Based Access
- Administrators can manage all system entities
- Receptionists have limited access to appointment management only
- Secure route protection and API authorization

### Data Validation
- Form validation on both frontend and backend
- Working hours configuration for doctors
- Service pricing and duration management
- Patient appointment conflict prevention

## API Endpoints

### Authentication
- `POST /api/auth/login` - User login

### Appointments
- `GET /api/appointments` - Get all appointments
- `POST /api/appointments` - Create new appointment
- `PUT /api/appointments/{id}/status` - Update appointment status

### Doctors
- `GET /api/doctors` - Get all doctors
- `POST /api/doctors` - Create doctor (Admin only)
- `PUT /api/doctors/{id}` - Update doctor (Admin only)

### Medical Services
- `GET /api/medical-services` - Get all services
- `POST /api/medical-services` - Create service (Admin only)

### Reports
- `GET /api/reports/appointments` - Generate appointment reports
- `GET /api/reports/appointments/export` - Export to CSV
