package com.infinity.profileservice.dtos.profile;

import java.util.List;

public record ProfileAnswerRequest(List<Long> answerIds, List<FreeTextRequest> freeTextRequests) {
    
}
