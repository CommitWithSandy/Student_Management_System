package com.sms.service;

import com.sms.dto.TimetableDto;
import com.sms.entity.ClassBatch;
import com.sms.entity.Subject;
import com.sms.entity.Teacher;
import com.sms.entity.Timetable;
import com.sms.exception.BadRequestException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.ClassBatchRepository;
import com.sms.repository.SubjectRepository;
import com.sms.repository.TeacherRepository;
import com.sms.repository.TimetableRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TimetableService {

    private final TimetableRepository timetableRepository;
    private final ClassBatchRepository classBatchRepository;
    private final SubjectRepository subjectRepository;
    private final TeacherRepository teacherRepository;

    @Transactional(readOnly = true)
    public List<TimetableDto> getTimetableForClass(Long classId) {
        return timetableRepository.findByClassBatchId(classId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional(readOnly = true)
    public List<TimetableDto> getTimetableForTeacher(Long teacherId) {
        return timetableRepository.findByTeacherId(teacherId).stream()
                .map(this::mapToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public TimetableDto createEntry(TimetableDto dto) {
        if (dto.getStartTime().isAfter(dto.getEndTime()) || dto.getStartTime().equals(dto.getEndTime())) {
            throw new BadRequestException("Start time must be before end time");
        }

        // Conflict check 1: Teacher
        if (timetableRepository.existsTeacherConflict(dto.getTeacherId(), dto.getDayOfWeek(), dto.getStartTime(), dto.getEndTime(), null)) {
            throw new BadRequestException("Conflict detected: Teacher is already scheduled for another class during this time period on " + dto.getDayOfWeek());
        }

        // Conflict check 2: Room
        if (timetableRepository.existsRoomConflict(dto.getRoomNumber().trim(), dto.getDayOfWeek(), dto.getStartTime(), dto.getEndTime(), null)) {
            throw new BadRequestException("Conflict detected: Room '" + dto.getRoomNumber() + "' is already reserved by another class during this time on " + dto.getDayOfWeek());
        }

        // Conflict check 3: Class
        if (timetableRepository.existsClassConflict(dto.getClassId(), dto.getDayOfWeek(), dto.getStartTime(), dto.getEndTime(), null)) {
            throw new BadRequestException("Conflict detected: This class is already scheduled for another subject during this time on " + dto.getDayOfWeek());
        }

        ClassBatch classBatch = classBatchRepository.findById(dto.getClassId())
                .orElseThrow(() -> new ResourceNotFoundException("ClassBatch", "id", dto.getClassId()));

        Subject subject = subjectRepository.findById(dto.getSubjectId())
                .orElseThrow(() -> new ResourceNotFoundException("Subject", "id", dto.getSubjectId()));

        Teacher teacher = teacherRepository.findById(dto.getTeacherId())
                .orElseThrow(() -> new ResourceNotFoundException("Teacher", "id", dto.getTeacherId()));

        Timetable tt = Timetable.builder()
                .classBatch(classBatch)
                .subject(subject)
                .teacher(teacher)
                .dayOfWeek(dto.getDayOfWeek())
                .startTime(dto.getStartTime())
                .endTime(dto.getEndTime())
                .roomNumber(dto.getRoomNumber().trim())
                .academicYear(dto.getAcademicYear().trim())
                .build();

        return mapToDto(timetableRepository.save(tt));
    }

    @Transactional
    public void deleteEntry(Long id) {
        Timetable tt = timetableRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Timetable entry", "id", id));
        timetableRepository.delete(tt);
    }

    private TimetableDto mapToDto(Timetable t) {
        return TimetableDto.builder()
                .id(t.getId())
                .classId(t.getClassBatch().getId())
                .className(t.getClassBatch().getDisplayName())
                .subjectId(t.getSubject().getId())
                .subjectName(t.getSubject().getName())
                .subjectCode(t.getSubject().getCode())
                .teacherId(t.getTeacher().getId())
                .teacherName(t.getTeacher().getUser().getFullName())
                .dayOfWeek(t.getDayOfWeek())
                .startTime(t.getStartTime())
                .endTime(t.getEndTime())
                .roomNumber(t.getRoomNumber())
                .academicYear(t.getAcademicYear())
                .createdAt(t.getCreatedAt())
                .build();
    }
}
