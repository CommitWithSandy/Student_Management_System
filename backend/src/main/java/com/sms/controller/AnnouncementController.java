package com.sms.controller;

import com.sms.dto.AnnouncementDto;
import com.sms.dto.ApiResponse;
import com.sms.dto.PagedResponse;
import com.sms.service.AnnouncementService;
import com.sms.service.StudentService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/announcements")
@RequiredArgsConstructor
public class AnnouncementController {

    private final AnnouncementService announcementService;
    private final StudentService studentService;

    @GetMapping
    public ResponseEntity<PagedResponse<AnnouncementDto>> getAllAnnouncements(
            @RequestParam(defaultValue = "0") int page,
            @RequestParam(defaultValue = "10") int size
    ) {
        return ResponseEntity.ok(announcementService.getAllAnnouncements(page, size));
    }

    @GetMapping("/feed")
    public ResponseEntity<ApiResponse<List<AnnouncementDto>>> getMyFeed(@AuthenticationPrincipal UserDetails userDetails) {
        com.sms.entity.User user = (com.sms.entity.User) userDetails;
        String role = user.getRole().getName();
        Long courseId = null;
        Long classId = null;

        if ("ROLE_STUDENT".equals(role)) {
            var student = studentService.getStudentByUserId(user.getId());
            courseId = student.getCourseId();
            classId = student.getClassId();
        }

        List<AnnouncementDto> feed = announcementService.getAnnouncementsForUser(role, courseId, classId);
        return ResponseEntity.ok(ApiResponse.success(feed));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN', 'TEACHER')")
    public ResponseEntity<ApiResponse<AnnouncementDto>> createAnnouncement(
            @Valid @RequestBody AnnouncementDto dto,
            @AuthenticationPrincipal UserDetails userDetails
    ) {
        AnnouncementDto created = announcementService.createAnnouncement(dto, userDetails.getUsername());
        return ResponseEntity.ok(ApiResponse.success("Announcement broadcasted successfully", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteAnnouncement(@PathVariable Long id) {
        announcementService.deleteAnnouncement(id);
        return ResponseEntity.ok(ApiResponse.success("Announcement archived successfully", null));
    }
}
