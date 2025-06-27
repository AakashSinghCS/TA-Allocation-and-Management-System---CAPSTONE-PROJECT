package com.infinity.applicationservice.models;

import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.Lob;
import jakarta.persistence.MapsId;
import jakarta.persistence.OneToOne;
import lombok.Data;
import lombok.NoArgsConstructor;

@Entity
@Data
@NoArgsConstructor
public class Transcript {
    
    @Id
    @Column(name = "application_id")
    private Long id;

    @OneToOne
    @MapsId
    @JoinColumn(name = "application_id")
    private Application application;

    private String fileName;

    private String contentType;

    @Lob
    private byte[] data;
}