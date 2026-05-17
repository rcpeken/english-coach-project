package com.recep.encoach.repository;

import com.recep.encoach.entity.TeacherStudent;
import com.recep.encoach.entity.User;
import org.springframework.data.jpa.repository.JpaRepository;

import java.util.List;
import java.util.Optional;

public interface TeacherStudentRepository extends JpaRepository<TeacherStudent, Long> {
    List<TeacherStudent> findByTeacher(User teacher);
    List<TeacherStudent> findByStudent(User student);
    Optional<TeacherStudent> findByTeacherAndStudent(User teacher, User student);
    boolean existsByTeacherAndStudent(User teacher, User student);
    void deleteByTeacherAndStudent(User teacher, User student);
}
