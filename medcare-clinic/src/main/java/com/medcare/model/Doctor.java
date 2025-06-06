package com.medcare.model;
import jakarta.persistence.*;
import java.time.DayOfWeek;
import java.time.LocalTime;
import java.util.HashSet;
import java.util.Objects;
import java.util.Set;

//clasa ce reprezinta medicii din clinica
@Entity
@Table(name = "doctors")
public class Doctor
{
    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    //am date despre nume, specializare si program de lucru
    @Column(nullable = false)
    private String name;

    @Column(nullable = false)
    private String specialization;

    @ElementCollection(fetch = FetchType.EAGER)
    @CollectionTable(name = "doctor_schedule", joinColumns = @JoinColumn(name = "doctor_id"))
    private Set<WorkingHours> workingHours = new HashSet<>();

    public Long getId() {
        return id;
    }

    public void setId(Long id) {
        this.id = id;
    }

    public String getName() {
        return name;
    }

    public void setName(String name) {
        this.name = name;
    }

    public String getSpecialization() {
        return specialization;
    }

    public void setSpecialization(String specialization) {
        this.specialization = specialization;
    }

    public Set<WorkingHours> getWorkingHours() {
        return workingHours;
    }

    public void setWorkingHours(Set<WorkingHours> workingHours) {
        this.workingHours = workingHours;
    }

    //metoda prin care verific daca medicul este disponibil sau nu - FIXED
    public boolean isAvailable(DayOfWeek day, LocalTime startTime, LocalTime endTime)
    {
        // Verificare și debugging
        System.out.println("Verificare disponibilitate pentru: " + this.name);
        System.out.println("Ziua: " + day + ", Start: " + startTime + ", End: " + endTime);

        // Verificăm fiecare interval orar al medicului pentru ziua respectivă
        for (WorkingHours wh : workingHours) {
            System.out.println("Verificare interval: " + wh.getDayOfWeek() + " " + wh.getStartTime() + "-" + wh.getEndTime());

            // Verificăm dacă este aceeași zi
            if (wh.getDayOfWeek() == day) {
                System.out.println("Ziua corespunde: " + day);

                // Verificăm dacă intervalul orar solicitat este în intervalul de lucru
                if (!startTime.isBefore(wh.getStartTime()) && !endTime.isAfter(wh.getEndTime())) {
                    System.out.println("Medicul este disponibil în intervalul orar!");
                    return true;
                } else {
                    System.out.println("Interval orar necorespunzător: " + startTime + "-" + endTime +
                            " nu este în " + wh.getStartTime() + "-" + wh.getEndTime());
                }
            }
        }

        System.out.println("Medicul nu este disponibil!");
        return false;
    }

    @Override
    public boolean equals(Object o)
    {
        if (this == o)
            return true;
        if (o == null || getClass() != o.getClass())
            return false;
        Doctor doctor = (Doctor) o;
        return Objects.equals(id, doctor.id) && Objects.equals(name, doctor.name);
    }

    @Override
    public int hashCode() {
        return Objects.hash(id, name);
    }
}