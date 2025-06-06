package com.medcare.controller;

import com.medcare.model.MedicalService;
import com.medcare.service.MedicalServiceService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/medical-services")
public class MedicalServiceController {

    private final MedicalServiceService medicalServiceService;

    @Autowired
    public MedicalServiceController(MedicalServiceService medicalServiceService) {
        this.medicalServiceService = medicalServiceService;
    }

    @GetMapping
    public ResponseEntity<List<MedicalService>> getAllMedicalServices() {
        return ResponseEntity.ok(medicalServiceService.findAllMedicalServices());
    }

    @GetMapping("/{id}")
    public ResponseEntity<MedicalService> getMedicalServiceById(@PathVariable Long id) {
        return medicalServiceService.findMedicalServiceById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    @PostMapping
    public ResponseEntity<MedicalService> createMedicalService(@RequestBody MedicalService medicalService) {
        return ResponseEntity.status(HttpStatus.CREATED)
                .body(medicalServiceService.saveMedicalService(medicalService));
    }

    @PutMapping("/{id}")
    public ResponseEntity<MedicalService> updateMedicalService(
            @PathVariable Long id, @RequestBody MedicalService medicalService) {
        medicalService.setId(id);
        return ResponseEntity.ok(medicalServiceService.saveMedicalService(medicalService));
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteMedicalService(@PathVariable Long id) {
        medicalServiceService.deleteMedicalService(id);
        return ResponseEntity.noContent().build();
    }

    @GetMapping("/most-requested")
    public ResponseEntity<List<Object[]>> getMostRequestedServices() {
        return ResponseEntity.ok(medicalServiceService.findMostRequestedServices());
    }
}