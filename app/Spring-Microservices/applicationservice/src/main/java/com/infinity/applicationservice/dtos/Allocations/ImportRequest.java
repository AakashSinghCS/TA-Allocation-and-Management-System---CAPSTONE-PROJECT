package com.infinity.applicationservice.dtos.Allocations;

import java.util.List;
import java.util.Map;

public record ImportRequest(
    List<Map<String, String>> rows,
    boolean autoCreateMissing)
    {}
