package com.sms.entity;

import jakarta.persistence.*;
import lombok.*;
import org.hibernate.annotations.CreationTimestamp;
import org.hibernate.annotations.UpdateTimestamp;

import java.time.LocalDateTime;

@Entity
@Table(name = "classes", uniqueConstraints = {
        @UniqueConstraint(columnNames = {"course_id", "academic_year", "semester", "division"})
})
@Getter
@Setter
@NoArgsConstructor
@AllArgsConstructor
@Builder
public class ClassBatch {

    @Id
    @GeneratedValue(strategy = GenerationType.IDENTITY)
    private Long id;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "course_id", nullable = false)
    private Course course;

    @Column(name = "academic_year", nullable = false, length = 20)
    private String academicYear; // e.g. "2026-2028"

    @Column(nullable = false)
    private Integer semester;

    @Column(nullable = false, length = 10)
    private String division; // e.g. "A"

    @Column(length = 20)
    private String section;

    @ManyToOne(fetch = FetchType.LAZY)
    @JoinColumn(name = "class_teacher_id")
    private User classTeacher;

    @Column(name = "room_number", length = 50)
    private String roomNumber;

    @Column(name = "max_capacity", nullable = false)
    @Builder.Default
    private Integer maxCapacity = 60;

    @Enumerated(EnumType.STRING)
    @Column(nullable = false, length = 20)
    @Builder.Default
    private ClassStatus status = ClassStatus.ACTIVE;

    @CreationTimestamp
    @Column(name = "created_at", updatable = false)
    private LocalDateTime createdAt;

    @UpdateTimestamp
    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    public enum ClassStatus {
        ACTIVE, INACTIVE
    }

    public String getDisplayName() {
        return (course != null ? course.getCode() : "Class") + " - Sem " + semester + " (" + division + ") [" + academicYear + "]";
    }
}
