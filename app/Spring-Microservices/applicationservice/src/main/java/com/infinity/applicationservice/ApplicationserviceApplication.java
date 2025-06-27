package com.infinity.applicationservice;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.openfeign.EnableFeignClients;

@SpringBootApplication
@EnableFeignClients(basePackages = "com.infinity.applicationservice.feign")

public class ApplicationserviceApplication {

	public static void main(String[] args) {
		SpringApplication.run(ApplicationserviceApplication.class, args);
	}

}
