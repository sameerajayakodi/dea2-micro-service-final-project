package com.wms.dispatch_transportation_service;

import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.cloud.client.discovery.EnableDiscoveryClient;

@SpringBootApplication
@EnableDiscoveryClient
public class DispatchTransportationServiceApplication {

	public static void main(String[] args) {
		SpringApplication.run(DispatchTransportationServiceApplication.class, args);
	}

}
