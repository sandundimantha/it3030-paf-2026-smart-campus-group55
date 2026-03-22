package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.Resource;
import com.smartcampus.operationshub.model.ResourceType;
import com.smartcampus.operationshub.repository.ResourceRepository;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.Optional;

@Service
public class ResourceService {

    private final ResourceRepository resourceRepository;

    public ResourceService(ResourceRepository resourceRepository) {
        this.resourceRepository = resourceRepository;
    }

    public List<Resource> searchResources(ResourceType type, Integer minCapacity, String location) {
        return resourceRepository.searchResources(type, minCapacity, location);
    }

    public Resource createResource(Resource resource) {
        return resourceRepository.save(resource);
    }

    public Optional<Resource> getResourceById(Long id) {
        return resourceRepository.findById(id);
    }

    public Resource updateResource(Long id, Resource updatedResource) {
        return resourceRepository.findById(id).map(r -> {
            r.setName(updatedResource.getName());
            r.setType(updatedResource.getType());
            r.setCapacity(updatedResource.getCapacity());
            r.setLocation(updatedResource.getLocation());
            r.setAvailabilityWindows(updatedResource.getAvailabilityWindows());
            r.setStatus(updatedResource.getStatus());
            return resourceRepository.save(r);
        }).orElseThrow(() -> new RuntimeException("Resource not found"));
    }

    public void deleteResource(Long id) {
        resourceRepository.deleteById(id);
    }
}
