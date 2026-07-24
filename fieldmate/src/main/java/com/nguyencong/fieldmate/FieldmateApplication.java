package com.nguyencong.fieldmate;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.scheduling.annotation.EnableScheduling;

@SpringBootApplication
@EnableScheduling
public class FieldmateApplication {

	public static void main(String[] args) {
		SpringApplication.run(FieldmateApplication.class, args);
	}

}
