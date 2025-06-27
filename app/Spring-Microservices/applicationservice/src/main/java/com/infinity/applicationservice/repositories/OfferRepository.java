package com.infinity.applicationservice.repositories;

import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import com.infinity.applicationservice.models.Offer;

@Repository
public interface OfferRepository extends JpaRepository<Offer, Long>{

}
