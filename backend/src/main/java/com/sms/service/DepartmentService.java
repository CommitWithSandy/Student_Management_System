package com.sms.service;

import com.sms.dto.DepartmentDto;
import com.sms.dto.PagedResponse;
import com.sms.entity.Department;
import com.sms.entity.User;
import com.sms.exception.BadRequestException;
import com.sms.exception.DuplicateResourceException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.DepartmentRepository;
import com.sms.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.data.domain.Sort;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class DepartmentService {

    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<DepartmentDto> getAllDepartments(int page, int size, String search, String status) {
        Pageable pageable = PageRequest.of(page, size, Sort.by("id").descending());
        Department.DepartmentStatus deptStatus = null;
        if (status != null && !status.isEmpty()) {
            try {
                deptStatus = Department.DepartmentStatus.valueOf(status.toUpperCase());
            } catch (Exception ignored) {}
        }

        Page<Department> departments = departmentRepository.searchDepartments(
                search != null && !search.trim().isEmpty() ? search.trim() : null,
                deptStatus,
                pageable
        );

        List<DepartmentDto> dtos = departments.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, departments.getNumber(), departments.getSize(), departments.getTotalElements(), departments.getTotalPages(), departments.isLast());
    }

    @Transactional(readOnly = true)
    public List<DepartmentDto> getAllActiveDepartments() {
        return departmentRepository.findByStatus(Department.DepartmentStatus.ACTIVE).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public DepartmentDto getDepartmentById(Long id) {
        Department dept = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        return mapToDto(dept);
    }

    @Transactional
    public DepartmentDto createDepartment(DepartmentDto dto) {
        if (departmentRepository.existsByCode(dto.getCode().trim())) {
            throw new DuplicateResourceException("Department with code '" + dto.getCode() + "' already exists");
        }
        if (departmentRepository.existsByName(dto.getName().trim())) {
            throw new DuplicateResourceException("Department with name '" + dto.getName() + "' already exists");
        }

        User headUser = null;
        if (dto.getHeadUserId() != null) {
            headUser = userRepository.findById(dto.getHeadUserId()).orElse(null);
        }

        Department department = Department.builder()
                .code(dto.getCode().trim().toUpperCase())
                .name(dto.getName().trim())
                .description(dto.getDescription())
                .headUser(headUser)
                .status(Department.DepartmentStatus.ACTIVE)
                .build();

        return mapToDto(departmentRepository.save(department));
    }

    @Transactional
    public DepartmentDto updateDepartment(Long id, DepartmentDto dto) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));

        if (!department.getCode().equalsIgnoreCase(dto.getCode().trim()) && departmentRepository.existsByCode(dto.getCode().trim())) {
            throw new DuplicateResourceException("Department with code '" + dto.getCode() + "' already exists");
        }

        User headUser = null;
        if (dto.getHeadUserId() != null) {
            headUser = userRepository.findById(dto.getHeadUserId()).orElse(null);
        }

        department.setCode(dto.getCode().trim().toUpperCase());
        department.setName(dto.getName().trim());
        department.setDescription(dto.getDescription());
        department.setHeadUser(headUser);

        if (dto.getStatus() != null) {
            department.setStatus(Department.DepartmentStatus.valueOf(dto.getStatus().toUpperCase()));
        }

        return mapToDto(departmentRepository.save(department));
    }

    @Transactional
    public void deleteDepartment(Long id) {
        Department department = departmentRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Department", "id", id));
        try {
            departmentRepository.delete(department);
        } catch (Exception e) {
            throw new BadRequestException("Cannot delete department because active courses, students, or teachers depend on it. Please deactivate the department instead.");
        }
    }

    private DepartmentDto mapToDto(Department d) {
        return DepartmentDto.builder()
                .id(d.getId())
                .code(d.getCode())
                .name(d.getName())
                .description(d.getDescription())
                .headUserId(d.getHeadUser() != null ? d.getHeadUser().getId() : null)
                .headName(d.getHeadUser() != null ? d.getHeadUser().getFullName() : null)
                .status(d.getStatus().name())
                .createdAt(d.getCreatedAt())
                .build();
    }
}
