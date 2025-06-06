package com.medcare.controller;

import com.medcare.model.Appointment;
import com.medcare.service.ReportService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.format.annotation.DateTimeFormat;
import org.springframework.http.HttpHeaders;
import org.springframework.http.HttpStatus;
import org.springframework.http.MediaType;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.io.ByteArrayOutputStream;
import java.io.IOException;
import java.io.OutputStreamWriter;
import java.nio.charset.StandardCharsets;
import java.time.LocalDateTime;
import java.time.format.DateTimeFormatter;
import java.util.List;

@RestController
@RequestMapping("/api/reports")
public class ReportController {

    private final ReportService reportService;

    @Autowired
    public ReportController(ReportService reportService) {
        this.reportService = reportService;
    }

    @GetMapping("/appointments")
    public ResponseEntity<List<Appointment>> getAppointmentsReport(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        List<Appointment> appointments = reportService.getAppointmentsReport(startDate, endDate);
        return ResponseEntity.ok(appointments);
    }

    @GetMapping("/doctors/most-requested")
    public ResponseEntity<List<Object[]>> getMostRequestedDoctorsReport() {
        List<Object[]> report = reportService.getMostRequestedDoctorsReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/services/most-requested")
    public ResponseEntity<List<Object[]>> getMostRequestedServicesReport() {
        List<Object[]> report = reportService.getMostRequestedServicesReport();
        return ResponseEntity.ok(report);
    }

    @GetMapping("/appointments/export")
    public ResponseEntity<byte[]> exportAppointmentsToCSV(
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime startDate,
            @RequestParam @DateTimeFormat(iso = DateTimeFormat.ISO.DATE_TIME) LocalDateTime endDate) {
        try {
            List<Appointment> appointments = reportService.getAppointmentsReport(startDate, endDate);

            ByteArrayOutputStream outputStream = new ByteArrayOutputStream();

            try (OutputStreamWriter writer = new OutputStreamWriter(outputStream, StandardCharsets.UTF_8)) {
                DateTimeFormatter formatter = DateTimeFormatter.ofPattern("yyyy-MM-dd HH:mm");
                writer.write("ID,Patient Name,Doctor,Medical Service,Start Date/Time,End Date/Time,Status\n");

                /*for (Appointment appointment : appointments) {
                    writer.write(String.valueOf(appointment.getId())).write(",")
                            .write(appointment.getPatientName()).write(",")
                            .write(appointment.getDoctor().getName()).write(",")
                            .write(appointment.getMedicalService().getName()).write(",")
                            .write(appointment.getStartDateTime().format(formatter)).write(",")
                            .write(appointment.getEndDateTime().format(formatter)).write(",")
                            .write(appointment.getStatus().toString()).write("\n");
                }*/
            }

            byte[] csvBytes = outputStream.toByteArray();

            HttpHeaders headers = new HttpHeaders();
            headers.setContentType(MediaType.parseMediaType("text/csv"));
            headers.setContentDispositionFormData("attachment", "appointments.csv");

            return new ResponseEntity<>(csvBytes, headers, HttpStatus.OK);
        } catch (IOException e) {
            return ResponseEntity.status(HttpStatus.INTERNAL_SERVER_ERROR).build();
        }
    }
}