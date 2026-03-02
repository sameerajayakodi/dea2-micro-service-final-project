package com.wms.workforce_equipment_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;

import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

/**
 * Main application class for the Workforce & Equipment Service.
 */
@SpringBootApplication
@EnableDiscoveryClient
public class WorkforceEquipmentServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(WorkforceEquipmentServiceApplication.class, args);
	}

}
