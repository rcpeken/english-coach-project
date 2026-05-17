package com.recep.encoach.repository;

import com.recep.encoach.entity.ReadingAssignment;
import org.springframework.data.jpa.repository.JpaRepository;
import java.util.List;

public interface ReadingAssignmentRepository extends JpaRepository<ReadingAssignment, Long> {
    List<ReadingAssignment> findByStudentId(Long studentId);
    List<ReadingAssignment> findByPassageTeacherId(Long teacherId);
    boolean existsByPassageIdAndStudentId(Long passageId, Long studentId);
    void deleteByPassageIdAndStudentId(Long passageId, Long studentId);
}
