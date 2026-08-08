package com.buildflow.workforce.service;

import com.buildflow.workforce.dto.WorkerRequest;
import com.buildflow.workforce.dto.WorkerResponse;

import java.util.List;

public interface WorkerService {
    WorkerResponse createWorker(WorkerRequest request);
    WorkerResponse getWorkerById(Long id);
    List<WorkerResponse> getAllWorkers();
    List<WorkerResponse> getWorkersByProjectId(Long projectId);
    WorkerResponse updateWorker(Long id, WorkerRequest request);
    void deleteWorker(Long id);
}
