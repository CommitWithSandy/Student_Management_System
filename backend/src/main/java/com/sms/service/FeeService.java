package com.sms.service;

import com.sms.dto.FeePaymentDto;
import com.sms.dto.FeeStructureDto;
import com.sms.dto.PagedResponse;
import com.sms.dto.StudentFeeDto;
import com.sms.entity.*;
import com.sms.exception.BadRequestException;
import com.sms.exception.ResourceNotFoundException;
import com.sms.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import org.springframework.data.domain.Pageable;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.format.DateTimeFormatter;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FeeService {

    private final FeeStructureRepository feeStructureRepository;
    private final StudentFeeRepository studentFeeRepository;
    private final FeePaymentRepository feePaymentRepository;
    private final CourseRepository courseRepository;
    private final StudentRepository studentRepository;
    private final UserRepository userRepository;
    private final AuditLogService auditLogService;

    @Transactional(readOnly = true)
    public PagedResponse<FeeStructureDto> getAllFeeStructures(int page, int size) {
        Pageable pageable = PageRequest.of(page, size);
        Page<FeeStructure> structures = feeStructureRepository.findAllByOrderByDueDateDesc(pageable);

        List<FeeStructureDto> dtos = structures.getContent().stream()
                .map(this::mapStructureToDto)
                .collect(Collectors.toList());

        return PagedResponse.of(dtos, structures.getNumber(), structures.getSize(), structures.getTotalElements(), structures.getTotalPages(), structures.isLast());
    }

    @Transactional
    public FeeStructureDto createFeeStructure(FeeStructureDto dto) {
        Course course = courseRepository.findById(dto.getCourseId())
                .orElseThrow(() -> new ResourceNotFoundException("Course", "id", dto.getCourseId()));

        FeeStructure fs = FeeStructure.builder()
                .course(course)
                .academicYear(dto.getAcademicYear().trim())
                .semester(dto.getSemester())
                .title(dto.getTitle().trim())
                .totalAmount(dto.getTotalAmount())
                .dueDate(dto.getDueDate())
                .description(dto.getDescription())
                .build();

        FeeStructure savedFs = feeStructureRepository.save(fs);

        // Auto-assign this fee structure to all enrolled students of this course & semester
        List<Student> students = studentRepository.findByCourseIdAndCurrentSemester(course.getId(), dto.getSemester());
        for (Student st : students) {
            if (studentFeeRepository.findByStudentIdAndFeeStructureId(st.getId(), savedFs.getId()).isEmpty()) {
                StudentFee sf = StudentFee.builder()
                        .student(st)
                        .feeStructure(savedFs)
                        .totalAmount(savedFs.getTotalAmount())
                        .paidAmount(BigDecimal.ZERO)
                        .pendingAmount(savedFs.getTotalAmount())
                        .status(StudentFee.FeeStatus.UNPAID)
                        .build();
                studentFeeRepository.save(sf);
            }
        }

        return mapStructureToDto(savedFs);
    }

    @Transactional(readOnly = true)
    public List<StudentFeeDto> getFeesForStudent(Long studentId) {
        return studentFeeRepository.findByStudentId(studentId).stream()
                .map(this::mapStudentFeeToDto)
                .collect(Collectors.toList());
    }

    @Transactional
    public FeePaymentDto recordPayment(FeePaymentDto dto, String username) {
        StudentFee sf = studentFeeRepository.findById(dto.getStudentFeeId())
                .orElseThrow(() -> new ResourceNotFoundException("StudentFee", "id", dto.getStudentFeeId()));

        if (dto.getAmountPaid().compareTo(BigDecimal.ZERO) <= 0) {
            throw new BadRequestException("Payment amount must be greater than zero");
        }

        if (dto.getAmountPaid().compareTo(sf.getPendingAmount()) > 0) {
            throw new BadRequestException("Payment amount (" + dto.getAmountPaid() + ") exceeds current pending dues (" + sf.getPendingAmount() + ")");
        }

        User user = userRepository.findByUsername(username).orElse(null);

        // Generate clean unique receipt number (e.g. REC-20261025-XXXX)
        String receiptNumber = "REC-" + LocalDate.now().format(DateTimeFormatter.BASIC_ISO_DATE) + "-" +
                UUID.randomUUID().toString().substring(0, 6).toUpperCase();

        FeePayment payment = FeePayment.builder()
                .studentFee(sf)
                .receiptNumber(receiptNumber)
                .amountPaid(dto.getAmountPaid())
                .paymentDate(dto.getPaymentDate())
                .paymentMode(FeePayment.PaymentMode.valueOf(dto.getPaymentMode().toUpperCase()))
                .transactionReference(dto.getTransactionReference())
                .remarks(dto.getRemarks())
                .recordedBy(user)
                .build();

        FeePayment savedPayment = feePaymentRepository.save(payment);

        // Update student fee ledger
        BigDecimal newPaid = sf.getPaidAmount().add(dto.getAmountPaid());
        BigDecimal newPending = sf.getTotalAmount().subtract(newPaid);
        sf.setPaidAmount(newPaid);
        sf.setPendingAmount(newPending);

        if (newPending.compareTo(BigDecimal.ZERO) == 0) {
            sf.setStatus(StudentFee.FeeStatus.PAID);
        } else {
            sf.setStatus(StudentFee.FeeStatus.PARTIAL);
        }
        studentFeeRepository.save(sf);

        auditLogService.logAction(user != null ? user.getId() : null, username, "FEE_PAYMENT_RECORDED", "FEE_PAYMENT", savedPayment.getId().toString(),
                "Receipt " + receiptNumber + " for student: " + sf.getStudent().getStudentIdNumber() + ", amount: " + dto.getAmountPaid(), null);

        return FeePaymentDto.builder()
                .id(savedPayment.getId())
                .studentFeeId(sf.getId())
                .receiptNumber(savedPayment.getReceiptNumber())
                .amountPaid(savedPayment.getAmountPaid())
                .paymentDate(savedPayment.getPaymentDate())
                .paymentMode(savedPayment.getPaymentMode().name())
                .transactionReference(savedPayment.getTransactionReference())
                .remarks(savedPayment.getRemarks())
                .recordedByName(user != null ? user.getFullName() : "Admin")
                .createdAt(savedPayment.getCreatedAt())
                .build();
    }

    private FeeStructureDto mapStructureToDto(FeeStructure fs) {
        return FeeStructureDto.builder()
                .id(fs.getId())
                .courseId(fs.getCourse().getId())
                .courseName(fs.getCourse().getName())
                .academicYear(fs.getAcademicYear())
                .semester(fs.getSemester())
                .title(fs.getTitle())
                .totalAmount(fs.getTotalAmount())
                .dueDate(fs.getDueDate())
                .description(fs.getDescription())
                .createdAt(fs.getCreatedAt())
                .build();
    }

    private StudentFeeDto mapStudentFeeToDto(StudentFee sf) {
        List<FeePaymentDto> payments = feePaymentRepository.findByStudentFeeId(sf.getId()).stream()
                .map(p -> FeePaymentDto.builder()
                        .id(p.getId())
                        .studentFeeId(sf.getId())
                        .receiptNumber(p.getReceiptNumber())
                        .amountPaid(p.getAmountPaid())
                        .paymentDate(p.getPaymentDate())
                        .paymentMode(p.getPaymentMode().name())
                        .transactionReference(p.getTransactionReference())
                        .remarks(p.getRemarks())
                        .recordedByName(p.getRecordedBy() != null ? p.getRecordedBy().getFullName() : null)
                        .createdAt(p.getCreatedAt())
                        .build())
                .collect(Collectors.toList());

        return StudentFeeDto.builder()
                .id(sf.getId())
                .studentId(sf.getStudent().getId())
                .studentName(sf.getStudent().getUser().getFullName())
                .studentIdNumber(sf.getStudent().getStudentIdNumber())
                .feeStructureId(sf.getFeeStructure().getId())
                .feeTitle(sf.getFeeStructure().getTitle())
                .courseName(sf.getFeeStructure().getCourse().getName())
                .semester(sf.getFeeStructure().getSemester())
                .totalAmount(sf.getTotalAmount())
                .paidAmount(sf.getPaidAmount())
                .pendingAmount(sf.getPendingAmount())
                .status(sf.getStatus().name())
                .dueDate(sf.getFeeStructure().getDueDate())
                .payments(payments)
                .createdAt(sf.getCreatedAt())
                .build();
    }
}
