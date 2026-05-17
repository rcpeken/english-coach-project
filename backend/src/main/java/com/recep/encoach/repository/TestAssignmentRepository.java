package com.recep.encoach.repository;

import com.recep.encoach.entity.TestAssignment;
import com.recep.encoach.enums.AssignmentStatus;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface TestAssignmentRepository extends JpaRepository<TestAssignment, Long> {
    List<TestAssignment> findByStudentId(Long studentId);
    List<TestAssignment> findByStudentIdAndStatus(Long studentId, AssignmentStatus status);
    List<TestAssignment> findByTestTeacherId(Long teacherId);
    List<TestAssignment> findByTestId(Long testId);
    boolean existsByTestIdAndStudentId(Long testId, Long studentId);
}
