package com.medcare.controller;

import com.medcare.model.Receptionist;
import com.medcare.service.AdministratorService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/receptionists")
public class ReceptionistController {

    private final AdministratorService administratorService;

    @Autowired
    public ReceptionistController(AdministratorService administratorService) {
        this.administratorService = administratorService;
    }

    @GetMapping
    public ResponseEntity<List<Receptionist>> getAllReceptionists() {
        return ResponseEntity.ok(administratorService.findAllReceptionists());
    }

    @PostMapping
    public ResponseEntity<Receptionist> createReceptionist(@RequestBody Receptionist receptionist) {
        try {
            Receptionist createdReceptionist = administratorService.createReceptionist(receptionist);
            return ResponseEntity.status(HttpStatus.CREATED).body(createdReceptionist);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @PutMapping("/{id}")
    public ResponseEntity<Receptionist> updateReceptionist(
            @PathVariable Long id, @RequestBody Receptionist receptionist) {
        try {
            receptionist.setId(id);
            Receptionist updatedReceptionist = administratorService.updateReceptionist(receptionist);
            return ResponseEntity.ok(updatedReceptionist);
        } catch (IllegalArgumentException e) {
            return ResponseEntity.status(HttpStatus.BAD_REQUEST).build();
        }
    }

    @DeleteMapping("/{id}")
    public ResponseEntity<Void> deleteReceptionist(@PathVariable Long id) {
        administratorService.deleteReceptionist(id);
        return ResponseEntity.noContent().build();
    }
}