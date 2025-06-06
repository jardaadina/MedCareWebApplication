package com.medcare.service;
import com.medcare.model.Appointment;
import com.medcare.model.Doctor;
import com.medcare.model.MedicalService;
import com.medcare.repository.AppointmentRepository;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.stereotype.Service;
import java.time.DayOfWeek;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

//gestioneaza programrile
@Service
public class AppointmentService
{
    private final AppointmentRepository appointmentRepository;
    private final DoctorService doctorService;
    private final MedicalServiceService medicalServiceService;

    @Autowired
    public AppointmentService(
            AppointmentRepository appointmentRepository,
            DoctorService doctorService,
            MedicalServiceService medicalServiceService)
    {
        this.appointmentRepository = appointmentRepository;
        this.doctorService = doctorService;
        this.medicalServiceService = medicalServiceService;
    }

    public List<Appointment> findAllAppointments() {
        return appointmentRepository.findAll();
    }

    public Optional<Appointment> findAppointmentById(Long id) {
        return appointmentRepository.findById(id);
    }

    public List<Appointment> findAppointmentsByDateRange(LocalDateTime start, LocalDateTime end)
    {
        return appointmentRepository.findByStartDateTimeBetween(start, end);
    }

    public List<Appointment> findAppointmentsByPatientName(String patientName)
    {
        return appointmentRepository.findByPatientNameContainingIgnoreCase(patientName);
    }

    //creaza o programare
    public Appointment createAppointment(Appointment appointment) throws IllegalArgumentException
    {
        // CORECTAT: Verifică dacă există ID-ul doctorului și încarcă entitatea completă
        if (appointment.getDoctor() != null && appointment.getDoctor().getId() != null) {
            Optional<Doctor> doctorOpt = doctorService.findDoctorById(appointment.getDoctor().getId());
            if (doctorOpt.isPresent()) {
                appointment.setDoctor(doctorOpt.get());
            } else {
                throw new IllegalArgumentException("Doctor with ID " + appointment.getDoctor().getId() + " not found");
            }
        } else {
            throw new IllegalArgumentException("Doctor ID is required");
        }

        // CORECTAT: Verifică dacă există ID-ul serviciului medical și încarcă entitatea completă
        if (appointment.getMedicalService() != null && appointment.getMedicalService().getId() != null) {
            Optional<MedicalService> serviceOpt = medicalServiceService.findMedicalServiceById(
                    appointment.getMedicalService().getId());
            if (serviceOpt.isPresent()) {
                appointment.setMedicalService(serviceOpt.get());
            } else {
                throw new IllegalArgumentException("Medical service with ID " +
                        appointment.getMedicalService().getId() + " not found");
            }
        } else {
            throw new IllegalArgumentException("Medical service ID is required");
        }

        validateAppointment(appointment);

        appointment.setStatus(Appointment.AppointmentStatus.NEW);

        return appointmentRepository.save(appointment);
    }

    //actualizeaza statusul programarii pe care il avem ca o enumeratie interna in Appointment
    public Appointment updateAppointmentStatus(Long id, Appointment.AppointmentStatus status)
    {
        Optional<Appointment> appointmentOpt = appointmentRepository.findById(id);
        if (appointmentOpt.isPresent())
        {
            Appointment appointment = appointmentOpt.get();
            appointment.setStatus(status);
            return appointmentRepository.save(appointment);
        }
        else
        {
            throw new IllegalArgumentException("Appointment not found with id: " + id);
        }
    }

    //valideaza programarea
    private void validateAppointment(Appointment appointment)
    {
        Doctor doctor = appointment.getDoctor();
        MedicalService service = appointment.getMedicalService();
        LocalDateTime startDateTime = appointment.getStartDateTime();
        LocalDateTime endDateTime = appointment.getEndDateTime();

        // CORECTAT: Verificările de nulitate sunt făcute deja în createAppointment
        // Acum putem presupune că doctorul și serviciul sunt obiecte valide

        DayOfWeek dayOfWeek = startDateTime.getDayOfWeek();
        LocalTime startTime = startDateTime.toLocalTime();
        LocalTime endTime = endDateTime.toLocalTime();

        // Fix: Debugging pentru verificarea disponibilității
        System.out.println("Verificare disponibilitate doctor:");
        System.out.println("Doctor: " + doctor.getName());
        System.out.println("Day of week: " + dayOfWeek);
        System.out.println("Start time: " + startTime);
        System.out.println("End time: " + endTime);

        // Fix: Verificare disponibilitate doctor - afișează programul medicului
        System.out.println("Programul medicului:");
        doctor.getWorkingHours().forEach(wh -> {
            System.out.println("- " + wh.getDayOfWeek() + ": " + wh.getStartTime() + " - " + wh.getEndTime());
        });

        //daca doctorul dorit este disponibil in ziua dorita la ora dorita
        boolean isAvailable = doctor.isAvailable(dayOfWeek, startTime, endTime);
        if (!isAvailable)
        {
            System.out.println("Medicul nu este disponibil la ora selectată!");
            throw new IllegalArgumentException("Doctor is not available at the selected time");
        } else {
            System.out.println("Medicul este disponibil la ora selectată.");
        }

        // CORECTAT: Verifică pentru suprapuneri de programări cu o metodă mai robustă
        List<Appointment> conflictingAppointments = appointmentRepository.findByDoctorAndStartDateTimeBetween(
                doctor,
                startDateTime.minusMinutes(1),
                endDateTime.plusMinutes(1)
        );

        // Dacă edităm o programare existentă, excludem programarea curentă din verificarea de suprapunere
        if (appointment.getId() != null) {
            conflictingAppointments.removeIf(app -> app.getId().equals(appointment.getId()));
        }

        if (!conflictingAppointments.isEmpty())
        {
            throw new IllegalArgumentException("The doctor already has an appointment at the selected time");
        }
    }
}