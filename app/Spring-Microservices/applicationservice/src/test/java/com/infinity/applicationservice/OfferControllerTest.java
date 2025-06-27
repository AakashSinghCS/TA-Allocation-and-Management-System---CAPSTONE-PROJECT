package com.infinity.applicationservice;

import com.fasterxml.jackson.databind.ObjectMapper;
import com.infinity.applicationservice.controllers.OfferController;
import com.infinity.applicationservice.dtos.OfferDto;
import com.infinity.applicationservice.dtos.OfferRequest;
import com.infinity.applicationservice.models.Application;
import com.infinity.applicationservice.models.Offer;
import com.infinity.applicationservice.services.OfferService;

import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.test.autoconfigure.web.servlet.WebMvcTest;
import org.springframework.boot.test.autoconfigure.web.servlet.AutoConfigureMockMvc;
import org.springframework.http.MediaType;
import org.springframework.test.context.bean.override.mockito.MockitoBean;
import org.springframework.test.web.servlet.MockMvc;

import java.util.List;

import static org.hamcrest.Matchers.hasSize;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.when;
import static org.mockito.Mockito.doNothing;
import static org.springframework.test.web.servlet.request.MockMvcRequestBuilders.*;
import static org.springframework.test.web.servlet.result.MockMvcResultMatchers.*;

@WebMvcTest(OfferController.class)
@AutoConfigureMockMvc(addFilters = false)
public class OfferControllerTest {

    @Autowired
    private MockMvc mvc;

    @Autowired
    private ObjectMapper mapper;

    @MockitoBean
    private OfferService offerService;

    private OfferDto sampleOfferDto;

    @BeforeEach
    void setup() {
        sampleOfferDto = new OfferDto(1L, false, "Here is your offer");
    }

    @Test
    void createOffer_returnsCreatedOffer() throws Exception {
        OfferRequest request = new OfferRequest(2L, "Here is your offer");
        when(offerService.createOffer(any(OfferRequest.class))).thenReturn(sampleOfferDto);

        mvc.perform(post("/offers/create")
                .contentType(MediaType.APPLICATION_JSON)
                .content(mapper.writeValueAsString(request)))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.description").value("Here is your offer"))
            .andExpect(jsonPath("$.isAccepted").value(false));
    }

    @Test
    void getOffer_returnsOfferById() throws Exception {
        when(offerService.getOffer(1L)).thenReturn(sampleOfferDto);

        mvc.perform(get("/offers/1"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.description").value("Here is your offer"))
            .andExpect(jsonPath("$.isAccepted").value(false));
    }

    @Test
    void getOffersByApplicationId_returnsOffersList() throws Exception {
        when(offerService.getOffersByApplicationId(2L)).thenReturn(List.of(sampleOfferDto));

        mvc.perform(get("/offers/application/2"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$", hasSize(1)))
            .andExpect(jsonPath("$[0].id").value(1L))
            .andExpect(jsonPath("$[0].description").value("Here is your offer"))
            .andExpect(jsonPath("$[0].isAccepted").value(false));
    }

    @Test
    void updateAcceptanceStatus_updatesAndReturnsOffer() throws Exception {
        OfferDto updatedDto = new OfferDto(1L, true, "Here is your offer");
        when(offerService.updateAcceptanceStatus(1L, true)).thenReturn(updatedDto);

        mvc.perform(put("/offers/1/accept")
                .param("isAccepted", "true"))
            .andExpect(status().isOk())
            .andExpect(jsonPath("$.id").value(1L))
            .andExpect(jsonPath("$.isAccepted").value(true))
            .andExpect(jsonPath("$.description").value("Here is your offer"));
    }

    @Test
    void deleteOffer_executesWithoutError() throws Exception {
        doNothing().when(offerService).deleteOffer(1L);

        mvc.perform(delete("/offers/1"))
            .andExpect(status().isNoContent());
    }
}

