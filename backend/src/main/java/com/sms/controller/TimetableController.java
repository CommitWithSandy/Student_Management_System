package com.sms.controller;

import com.sms.dto.ApiResponse;
import com.sms.dto.TimetableDto;
import com.sms.service.StudentService;
import com.sms.service.TeacherService;
import com.sms.service.TimetableService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.security.access.prepost.PreAuthorize;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.security.core.userdetails.UserDetails;
import org.springframework.web.bind.annotation.*;

import java.util.Collections;
import java.util.List;

@RestController
@RequestMapping("/api/timetable")
@RequiredArgsConstructor
public class TimetableController {

    private final TimetableService timetableService;
    private final TeacherService teacherService;
    private final StudentService studentService;

    @GetMapping("/class/{classId}")
    public ResponseEntity<ApiResponse<List<TimetableDto>>> getTimetableForClass(@PathVariable Long classId) {
        return ResponseEntity.ok(ApiResponse.success(timetableService.getTimetableForClass(classId)));
    }

    @GetMapping("/teacher/{teacherId}")
    public ResponseEntity<ApiResponse<List<TimetableDto>>> getTimetableForTeacher(@PathVariable Long teacherId) {
        return ResponseEntity.ok(ApiResponse.success(timetableService.getTimetableForTeacher(teacherId)));
    }

    @GetMapping("/my-timetable")
    public ResponseEntity<ApiResponse<List<TimetableDto>>> getMyTimetable(@AuthenticationPrincipal UserDetails userDetails) {
        com.sms.entity.User user = (com.sms.entity.User) userDetails;
        if ("ROLE_TEACHER".equals(user.getRole().getName())) {
            var teacher = teacherService.getTeacherByUserId(user.getId());
            return ResponseEntity.ok(ApiResponse.success(timetableService.getTimetableForTeacher(teacher.getId())));
        } else if ("ROLE_STUDENT".equals(user.getRole().getName())) {
            var student = studentService.getStudentByUserId(user.getId());
            if (student.getClassId() != null) {
                return ResponseEntity.ok(ApiResponse.success(timetableService.getTimetableForClass(student.getClassId())));
            }
        }
        return ResponseEntity.ok(ApiResponse.success(Collections.emptyList()));
    }

    @PostMapping
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<TimetableDto>> createEntry(@Valid @RequestBody TimetableDto dto) {
        TimetableDto created = timetableService.createEntry(dto);
        return ResponseEntity.ok(ApiResponse.success("Timetable entry scheduled without conflicts", created));
    }

    @DeleteMapping("/{id}")
    @PreAuthorize("hasAnyRole('SUPER_ADMIN', 'ADMIN')")
    public ResponseEntity<ApiResponse<Void>> deleteEntry(@PathVariable Long id) {
        timetableService.deleteEntry(id);
        return ResponseEntity.ok(ApiResponse.success("Timetable entry deleted successfully", null));
    }
}
