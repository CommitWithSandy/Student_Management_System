package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.math.BigDecimal;
import java.time.LocalDateTime;

@Entity
@Table(name = "marks", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"exam_subject_id", "student_id"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class Mark {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "exam_subject_id", nullable = false)
    private ExamSubject examSubject;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "student_id", nullable = false)
    private Student student;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "teacher_id", nullable = false)
    private Teacher teacher;

    @Column(name = "marks_obtained", nullable = false, precision = 5, scale = 2)
    @Builder.Default
    private BigDecimal marksObtained = BigDecimal.ZERO;

    @Column(name = "is_absent", nullable = false)
    @Builder.Default
    private Boolean isAbsent = false;

    @Column(length = 255)
    private String remarks;

    @CreationTimestamp
    @Column(name = "entered_at", updatable = false)
    private LocalDateTime enteredAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;
}
