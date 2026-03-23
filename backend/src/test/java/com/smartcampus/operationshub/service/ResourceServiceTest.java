package com.smartcampus.operationshub.service;

import com.smartcampus.operationshub.model.Resource;
import com.smartcampus.operationshub.model.ResourceStatus;
import com.smartcampus.operationshub.model.ResourceType;
import com.smartcampus.operationshub.repository.ResourceRepository;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.util.Arrays;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class ResourceServiceTest {

    @Mock
    private ResourceRepository resourceRepository;

    @InjectMocks
    private ResourceService resourceService;

    private Resource sampleResource;

    @BeforeEach
    void setUp() {
        sampleResource = Resource.builder()
                .id(1L)
                .name("Lab 101")
                .type(ResourceType.LAB)
                .capacity(40)
                .location("Building A, Floor 1")
                .status(ResourceStatus.ACTIVE)
                .availabilityWindows("08:00 - 18:00")
                .build();
    }

    @Test
    void searchResources_ReturnsFilteredResults() {
        when(resourceRepository.searchResources(ResourceType.LAB, null, null))
                .thenReturn(List.of(sampleResource));

        List<Resource> result = resourceService.searchResources(ResourceType.LAB, null, null);

        assertEquals(1, result.size());
        assertEquals("Lab 101", result.get(0).getName());
        verify(resourceRepository).searchResources(ResourceType.LAB, null, null);
    }

    @Test
    void searchResources_NoFilters_ReturnsAll() {
        Resource room = Resource.builder().id(2L).name("Room 201").type(ResourceType.ROOM).status(ResourceStatus.ACTIVE).build();
        when(resourceRepository.searchResources(null, null, null))
                .thenReturn(Arrays.asList(sampleResource, room));

        List<Resource> result = resourceService.searchResources(null, null, null);

        assertEquals(2, result.size());
    }

    @Test
    void createResource_SavesAndReturns() {
        when(resourceRepository.save(any(Resource.class))).thenReturn(sampleResource);

        Resource result = resourceService.createResource(sampleResource);

        assertNotNull(result);
        assertEquals("Lab 101", result.getName());
        verify(resourceRepository).save(sampleResource);
    }

    @Test
    void getResourceById_Found() {
        when(resourceRepository.findById(1L)).thenReturn(Optional.of(sampleResource));

        Optional<Resource> result = resourceService.getResourceById(1L);

        assertTrue(result.isPresent());
        assertEquals("Lab 101", result.get().getName());
    }

    @Test
    void getResourceById_NotFound() {
        when(resourceRepository.findById(99L)).thenReturn(Optional.empty());

        Optional<Resource> result = resourceService.getResourceById(99L);

        assertTrue(result.isEmpty());
    }

    @Test
    void updateResource_Success() {
        Resource updated = Resource.builder()
                .name("Lab 101 - Updated")
                .type(ResourceType.LAB)
                .capacity(50)
                .location("Building A, Floor 2")
                .status(ResourceStatus.ACTIVE)
                .availabilityWindows("07:00 - 20:00")
                .build();

        when(resourceRepository.findById(1L)).thenReturn(Optional.of(sampleResource));
        when(resourceRepository.save(any(Resource.class))).thenAnswer(i -> i.getArguments()[0]);

        Resource result = resourceService.updateResource(1L, updated);

        assertEquals("Lab 101 - Updated", result.getName());
        assertEquals(50, result.getCapacity());
        verify(resourceRepository).save(any(Resource.class));
    }

    @Test
    void updateResource_NotFound_ThrowsException() {
        when(resourceRepository.findById(99L)).thenReturn(Optional.empty());

        assertThrows(RuntimeException.class, () ->
                resourceService.updateResource(99L, sampleResource));
    }

    @Test
    void deleteResource_CallsRepository() {
        doNothing().when(resourceRepository).deleteById(1L);

        resourceService.deleteResource(1L);

        verify(resourceRepository).deleteById(1L);
    }
}
