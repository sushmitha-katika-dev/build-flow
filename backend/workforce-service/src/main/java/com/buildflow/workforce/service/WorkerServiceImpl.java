package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.WorkerRequest;
import com.buildflow.workforce.dto.WorkerResponse;
import com.buildflow.workforce.entity.Worker;
import com.buildflow.workforce.exception.WorkerNotFoundException;
import com.buildflow.workforce.repository.WorkerRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.stream.Collectors;

@Service
public class WorkerServiceImpl implements WorkerService {

    private final WorkerRepository workerRepository;

    public WorkerServiceImpl(WorkerRepository workerRepository) {
        this.workerRepository = workerRepository;
    }

    @Override
    public WorkerResponse createWorker(WorkerRequest request) {
        if (workerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Worker with email already exists");
        }

        Worker worker = Worker.builder()
                .firstName(request.getFirstName())
                .lastName(request.getLastName())
                .email(request.getEmail())
                .phoneNumber(request.getPhoneNumber())
                .role(request.getRole())
                .projectId(request.getProjectId())
                .hourlyRate(request.getHourlyRate())
                .status(request.getStatus())
                .build();

        Worker savedWorker = workerRepository.save(worker);
        return mapToResponse(savedWorker);
    }

    @Override
    public WorkerResponse getWorkerById(Long id) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new WorkerNotFoundException("Worker not found with id: " + id));
        return mapToResponse(worker);
    }

    @Override
    public List<WorkerResponse> getAllWorkers() {
        List<Worker> workers = workerRepository.findAll();
        return workers.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public List<WorkerResponse> getWorkersByProjectId(Long projectId) {
        List<Worker> workers = workerRepository.findByProjectId(projectId);
        return workers.stream().map(this::mapToResponse).collect(Collectors.toList());
    }

    @Override
    public WorkerResponse updateWorker(Long id, WorkerRequest request) {
        Worker worker = workerRepository.findById(id)
                .orElseThrow(() -> new WorkerNotFoundException("Worker not found with id: " + id));

        // Check if email is updated and exists
        if (!worker.getEmail().equals(request.getEmail()) && workerRepository.existsByEmail(request.getEmail())) {
            throw new IllegalArgumentException("Worker with email already exists");
        }

        worker.setFirstName(request.getFirstName());
        worker.setLastName(request.getLastName());
        worker.setEmail(request.getEmail());
        worker.setPhoneNumber(request.getPhoneNumber());
        worker.setRole(request.getRole());
        worker.setProjectId(request.getProjectId());
        worker.setHourlyRate(request.getHourlyRate());
        worker.setStatus(request.getStatus());

        Worker updatedWorker = workerRepository.save(worker);
        return mapToResponse(updatedWorker);
    }

    @Override
    public void deleteWorker(Long id) {
        if (!workerRepository.existsById(id)) {
            throw new WorkerNotFoundException("Worker not found with id: " + id);
        }
        workerRepository.deleteById(id);
    }

    private WorkerResponse mapToResponse(Worker worker) {
        return WorkerResponse.builder()
                .id(worker.getId())
                .firstName(worker.getFirstName())
                .lastName(worker.getLastName())
                .email(worker.getEmail())
                .phoneNumber(worker.getPhoneNumber())
                .role(worker.getRole())
                .projectId(worker.getProjectId())
                .hourlyRate(worker.getHourlyRate())
                .status(worker.getStatus())
                .createdAt(worker.getCreatedAt())
                .updatedAt(worker.getUpdatedAt())
                .build();
    }
}
