package com.insurancemegacorp.imcmanager.web;

import com.insurancemegacorp.imcmanager.service.ServiceRegistryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.Map;

@RestController
@RequestMapping("/api/services")
public class ServiceController {

    @Autowired
    private ServiceRegistryService serviceRegistryService;

    @GetMapping
    public ResponseEntity<List<ServiceRegistryService.ServiceInfo>> getServices() {
        return ResponseEntity.ok(serviceRegistryService.getAvailableServices());
    }

    @GetMapping("/{serviceName}/status")
    public ResponseEntity<ServiceRegistryService.ServiceStatus> getServiceStatus(@PathVariable String serviceName) {
        ServiceRegistryService.ServiceStatus status = serviceRegistryService.getServiceStatus(serviceName);
        if (status != null) {
            return ResponseEntity.ok(status);
        }
        return ResponseEntity.notFound().build();
    }

    @GetMapping("/{serviceName}/state")
    public ResponseEntity<Map<String, Object>> getServiceState(@PathVariable String serviceName) {
        Map<String, Object> state = serviceRegistryService.getServiceState(serviceName);
        return ResponseEntity.ok(state);
    }

    @PostMapping("/{serviceName}/start")
    public ResponseEntity<Map<String, Object>> startService(@PathVariable String serviceName) {
        boolean success = serviceRegistryService.startService(serviceName);
        if (success) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "Service started successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Failed to start service"));
        }
    }

    @PostMapping("/{serviceName}/stop")
    public ResponseEntity<Map<String, Object>> stopService(@PathVariable String serviceName) {
        boolean success = serviceRegistryService.stopService(serviceName);
        if (success) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "Service stopped successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Failed to stop service"));
        }
    }

    @PostMapping("/{serviceName}/toggle")
    public ResponseEntity<Map<String, Object>> toggleService(@PathVariable String serviceName) {
        boolean success = serviceRegistryService.toggleService(serviceName);
        if (success) {
            return ResponseEntity.ok(Map.of("status", "success", "message", "Service toggled successfully"));
        } else {
            return ResponseEntity.badRequest().body(Map.of("status", "error", "message", "Failed to toggle service"));
        }
    }

    @GetMapping("/rag-pipeline/overview")
    public ResponseEntity<Map<String, Object>> getRAGPipelineOverview() {
        List<ServiceRegistryService.ServiceInfo> services = serviceRegistryService.getAvailableServices();
        
        long activeServices = services.stream()
            .filter(s -> "STARTED".equals(s.getStatus()))
            .count();
        
        long totalServices = services.size();
        String overallStatus = activeServices == totalServices ? "HEALTHY" : 
                             activeServices > totalServices / 2 ? "DEGRADED" : "CRITICAL";
        
        return ResponseEntity.ok(Map.of(
            "totalServices", totalServices,
            "activeServices", activeServices,
            "overallStatus", overallStatus,
            "services", services
        ));
    }
}
