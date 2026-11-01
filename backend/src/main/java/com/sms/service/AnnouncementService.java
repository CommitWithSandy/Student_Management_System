package com.sms.service;

import com.sms.dto.AnnouncementDto;
import com.sms.dto.PagedResponse;
import com.sms.entity.*;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.time.LocalDate;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class AnnouncementService {

    private final AnnouncementRepository announcementRepository;
    private final CourseRepository courseRepository;
    private final ClassBatchRepository classBatchRepository;
    private final DepartmentRepository departmentRepository;
    private final UserRepository userRepository;

    @Transactional(readOnly = true)
    public PagedResponse<AnnouncementDto> getAllAnnouncements(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<Announcement> announcements = announcementRepository.findAllByOrderByCreatedAtDesc(pageable);

        List<AnnouncementDto> dtos = announcements.getContent().stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, announcements.getNumber(), announcements.getSize(), announcements.getTotalElements(), announcements.getTotalPages(), announcements.isLast());
    }

    @Transactional(readOnly = true)
    public List<AnnouncementDto> getAnnouncementsForUser(String role, Long courseId, Long classId) {
        return announcementRepository.findTargetedAnnouncements(role, courseId, classId, LocalDate.now()).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public AnnouncementDto createAnnouncement(AnnouncementDto dto, String username) {
        User user = userRepository.findByUsername(username)
                .orElseThrow(() -> new ResourceNotFoundException("User not found: " + username));

        Course course = dto.getCourseId() != null ? courseRepository.findById(dto.getCourseId()).orElse(null) : null;
        ClassBatch classBatch = dto.getClassId() != null ? classBatchRepository.findById(dto.getClassId()).orElse(null) : null;
        Department dept = dto.getDepartmentId() != null ? departmentRepository.findById(dto.getDepartmentId()).orElse(null) : null;

        Announcement ann = Announcement.builder()
                .title(dto.getTitle().trim())
                .description(dto.getDescription().trim())
                .targetAudience(Announcement.TargetAudience.valueOf(dto.getTargetAudience().toUpperCase()))
                .department(dept)
                .course(course)
                .classBatch(classBatch)
                .publishDate(dto.getPublishDate())
                .expiryDate(dto.getExpiryDate())
                .attachmentPath(dto.getAttachmentPath())
                .createdBy(user)
                .isActive(true)
                .build();

        return mapToDto(announcementRepository.save(ann));
    }

    @Transactional
    public void deleteAnnouncement(Long id) {
        Announcement ann = announcementRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Announcement", "id", id));
        ann.setIsActive(false);
        announcementRepository.save(ann);
    }

    private AnnouncementDto mapToDto(Announcement a) {
        return AnnouncementDto.builder()
                .id(a.getId())
                .title(a.getTitle())
                .description(a.getDescription())
                .targetAudience(a.getTargetAudience().name())
                .departmentId(a.getDepartment() != null ? a.getDepartment().getId() : null)
                .courseId(a.getCourse() != null ? a.getCourse().getId() : null)
                .courseName(a.getCourse() != null ? a.getCourse().getName() : null)
                .classId(a.getClassBatch() != null ? a.getClassBatch().getId() : null)
                .className(a.getClassBatch() != null ? a.getClassBatch().getDisplayName() : null)
                .publishDate(a.getPublishDate())
                .expiryDate(a.getExpiryDate())
                .attachmentPath(a.getAttachmentPath())
                .createdByName(a.getCreatedBy().getFullName())
                .isActive(a.getIsActive())
                .createdAt(a.getCreatedAt())
                .build();
    }
}
