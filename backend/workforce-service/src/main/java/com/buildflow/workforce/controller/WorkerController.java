package com.buildflow.workforce.controller;

import com.buildflow.workforce.dto.WorkerRequest;
import com.buildflow.workforce.dto.WorkerResponse;
import com.buildflow.workforce.service.WorkerService;
import io.swagger.v3.oas.annotations.Operation;
import io.swagger.v3.oas.annotations.tags.Tag;
import jakarta.validation.Valid;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/v1/workforce")
@Tag(name = "Workforce", description = "Endpoints for managing workers and personnel")
public class WorkerController {

    private final WorkerService workerService;

    public WorkerController(WorkerService workerService) {
        this.workerService = workerService;
    }

    @PostMapping
    @Operation(summary = "Create a worker", description = "Adds a new worker to the workforce")
    public ResponseEntity<WorkerResponse> createWorker(@Valid @RequestBody WorkerRequest request) {
        return ResponseEntity.status(HttpStatus.CREATED).body(workerService.createWorker(request));
    }

    @GetMapping("/{id}")
    @Operation(summary = "Get a worker", description = "Retrieves a worker by their ID")
    public ResponseEntity<WorkerResponse> getWorkerById(@PathVariable Long id) {
        return ResponseEntity.ok(workerService.getWorkerById(id));
    }

    @GetMapping
    @Operation(summary = "Get all workers", description = "Retrieves a list of all workers")
    public ResponseEntity<List<WorkerResponse>> getAllWorkers() {
        return ResponseEntity.ok(workerService.getAllWorkers());
    }

    @GetMapping("/project/{projectId}")
    @Operation(summary = "Get workers by project", description = "Retrieves a list of all workers assigned to a specific project")
    public ResponseEntity<List<WorkerResponse>> getWorkersByProjectId(@PathVariable Long projectId) {
        return ResponseEntity.ok(workerService.getWorkersByProjectId(projectId));
    }

    @PutMapping("/{id}")
    @Operation(summary = "Update a worker", description = "Updates an existing worker by ID")
    public ResponseEntity<WorkerResponse> updateWorker(@PathVariable Long id, @Valid @RequestBody WorkerRequest request) {
        return ResponseEntity.ok(workerService.updateWorker(id, request));
    }

    @DeleteMapping("/{id}")
    @Operation(summary = "Delete a worker", description = "Deletes a worker by ID")
    public ResponseEntity<Void> deleteWorker(@PathVariable Long id) {
        workerService.deleteWorker(id);
        return ResponseEntity.noContent().build();
    }
}
