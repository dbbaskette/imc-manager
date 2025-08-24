package com.insurancemegacorp.imcmanager.web;

import com.insurancemegacorp.imcmanager.service.ServiceRegistryService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.HashMap;
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

    @GetMapping("/{serviceName}/files")
    public ResponseEntity<Map<String, Object>> getServiceFiles(@PathVariable String serviceName) {
        try {
            // Get the service URL from service registry
            List<ServiceRegistryService.ServiceInfo> services = serviceRegistryService.getAvailableServices();
            ServiceRegistryService.ServiceInfo service = services.stream()
                .filter(s -> serviceName.equals(s.getName()))
                .findFirst()
                .orElse(null);
                
            if (service == null || service.getUrl() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Service not found: " + serviceName));
            }
            
            // Proxy the request to the actual service
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(
                service.getUrl() + "/api/files", 
                (Class<Map<String, Object>>) (Class<?>) Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to fetch files from service"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error fetching files: " + e.getMessage()));
        }
    }

    @PostMapping("/{serviceName}/reprocess")
    public ResponseEntity<Map<String, Object>> reprocessFiles(@PathVariable String serviceName) {
        try {
            // Get the service URL from service registry
            List<ServiceRegistryService.ServiceInfo> services = serviceRegistryService.getAvailableServices();
            ServiceRegistryService.ServiceInfo service = services.stream()
                .filter(s -> serviceName.equals(s.getName()))
                .findFirst()
                .orElse(null);
                
            if (service == null || service.getUrl() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Service not found: " + serviceName));
            }
            
            // For hdfsWatcher, we need to use the reprocess-all endpoint for simplicity
            // This stops processing and clears all processed flags
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                service.getUrl() + "/api/reprocess-all", 
                null,
                (Class<Map<String, Object>>) (Class<?>) Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to reprocess files"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error reprocessing files: " + e.getMessage()));
        }
    }

    @PostMapping("/{serviceName}/processing/reset")
    public ResponseEntity<Map<String, Object>> resetProcessing(@PathVariable String serviceName) {
        try {
            // Get the service URL from service registry
            List<ServiceRegistryService.ServiceInfo> services = serviceRegistryService.getAvailableServices();
            ServiceRegistryService.ServiceInfo service = services.stream()
                .filter(s -> serviceName.equals(s.getName()))
                .findFirst()
                .orElse(null);
                
            if (service == null || service.getUrl() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Service not found: " + serviceName));
            }
            
            // embedProc doesn't have a /processing/reset endpoint, return not supported response
            if ("embedproc".equals(serviceName)) {
                return ResponseEntity.badRequest().body(Map.of(
                    "error", "Reset not supported",
                    "message", "embedProc service does not support processing reset operation",
                    "supportedOperations", Arrays.asList("start", "stop", "toggle")
                ));
            }
            
            // Proxy the reset request to the actual service (textProc, hdfsWatcher)
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            ResponseEntity<Map<String, Object>> response = restTemplate.postForEntity(
                service.getUrl() + "/api/processing/reset", 
                null,
                (Class<Map<String, Object>>) (Class<?>) Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to reset processing"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error resetting processing: " + e.getMessage()));
        }
    }

    @GetMapping("/{serviceName}/files/processed")
    public ResponseEntity<Map<String, Object>> getProcessedFiles(@PathVariable String serviceName) {
        try {
            // Get the service URL from service registry
            List<ServiceRegistryService.ServiceInfo> services = serviceRegistryService.getAvailableServices();
            ServiceRegistryService.ServiceInfo service = services.stream()
                .filter(s -> serviceName.equals(s.getName()))
                .findFirst()
                .orElse(null);
                
            if (service == null || service.getUrl() == null) {
                return ResponseEntity.badRequest().body(Map.of("error", "Service not found: " + serviceName));
            }
            
            // embedProc doesn't have a /files/processed endpoint, return empty response
            if ("embedproc".equals(serviceName)) {
                return ResponseEntity.ok(Map.of(
                    "files", new ArrayList<>(),
                    "processedCount", 0,
                    "message", "embedProc service does not expose processed files endpoint"
                ));
            }
            
            // Proxy the request to get processed files (for textProc and hdfsWatcher)
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            String endpoint = "textproc".equals(serviceName) ? "/api/files/processed" : "/files/processed";
            ResponseEntity<Map<String, Object>> response = restTemplate.getForEntity(
                service.getUrl() + endpoint, 
                (Class<Map<String, Object>>) (Class<?>) Map.class
            );
            
            if (response.getStatusCode().is2xxSuccessful() && response.getBody() != null) {
                return ResponseEntity.ok(response.getBody());
            } else {
                return ResponseEntity.badRequest().body(Map.of("error", "Failed to get processed files"));
            }
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error getting processed files: " + e.getMessage()));
        }
    }

    @PostMapping("/restart-pipeline")
    public ResponseEntity<Map<String, Object>> restartPipeline() {
        try {
            List<String> results = new ArrayList<>();
            List<String> errors = new ArrayList<>();
            
            // Get all services
            List<ServiceRegistryService.ServiceInfo> services = serviceRegistryService.getAvailableServices();
            org.springframework.web.client.RestTemplate restTemplate = new org.springframework.web.client.RestTemplate();
            
            // Stop all services (hdfswatcher, textproc, embedproc)
            for (String serviceName : Arrays.asList("hdfswatcher", "textproc", "embedproc")) {
                try {
                    ServiceRegistryService.ServiceInfo service = services.stream()
                        .filter(s -> serviceName.equals(s.getName()))
                        .findFirst()
                        .orElse(null);
                        
                    if (service != null && service.getUrl() != null) {
                        restTemplate.postForEntity(service.getUrl() + "/api/processing/stop", null, Map.class);
                        results.add("Stopped " + serviceName);
                    }
                } catch (Exception e) {
                    errors.add("Failed to stop " + serviceName + ": " + e.getMessage());
                }
            }
            
            // Reset hdfsWatcher files
            try {
                ServiceRegistryService.ServiceInfo hdfsService = services.stream()
                    .filter(s -> "hdfswatcher".equals(s.getName()))
                    .findFirst()
                    .orElse(null);
                    
                if (hdfsService != null && hdfsService.getUrl() != null) {
                    restTemplate.postForEntity(hdfsService.getUrl() + "/api/clear", null, Map.class);
                    results.add("Reset hdfsWatcher files");
                }
            } catch (Exception e) {
                errors.add("Failed to reset hdfsWatcher files: " + e.getMessage());
            }
            
            // Reset textProc processing
            try {
                ServiceRegistryService.ServiceInfo textService = services.stream()
                    .filter(s -> "textproc".equals(s.getName()))
                    .findFirst()
                    .orElse(null);
                    
                if (textService != null && textService.getUrl() != null) {
                    restTemplate.postForEntity(textService.getUrl() + "/api/processing/reset", null, Map.class);
                    results.add("Reset textProc processing");
                }
            } catch (Exception e) {
                errors.add("Failed to reset textProc: " + e.getMessage());
            }
            
            // TODO: Add embedProc reset when available
            // try {
            //     ServiceRegistryService.ServiceInfo embedService = services.stream()
            //         .filter(s -> "embedproc".equals(s.getName()))
            //         .findFirst()
            //         .orElse(null);
            //         
            //     if (embedService != null && embedService.getUrl() != null) {
            //         restTemplate.postForEntity(embedService.getUrl() + "/api/processing/reset", null, Map.class);
            //         results.add("Reset embedProc processing");
            //     }
            // } catch (Exception e) {
            //     errors.add("Failed to reset embedProc: " + e.getMessage());
            // }
            
            Map<String, Object> response = new HashMap<>();
            response.put("status", "success");
            response.put("message", "Pipeline restart completed");
            response.put("results", results);
            if (!errors.isEmpty()) {
                response.put("errors", errors);
            }
            
            return ResponseEntity.ok(response);
            
        } catch (Exception e) {
            return ResponseEntity.badRequest().body(Map.of("error", "Error restarting pipeline: " + e.getMessage()));
        }
    }
}
