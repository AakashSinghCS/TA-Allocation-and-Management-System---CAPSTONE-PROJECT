package com.infinity.courseservice.dtos;

public record Response<T>(boolean success, String message, T data) {

}
