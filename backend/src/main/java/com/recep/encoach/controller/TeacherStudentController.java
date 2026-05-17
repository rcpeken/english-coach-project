package com.recep.encoach.controller;

import com.recep.encoach.dto.StudentResponse;
import com.recep.encoach.service.TeacherStudentService;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import com.recep.encoach.entity.User;
import org.springframework.security.core.annotation.AuthenticationPrincipal;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/teacher/students")
@RequiredArgsConstructor
public class TeacherStudentController {

    private final TeacherStudentService teacherStudentService;

    @GetMapping
    public ResponseEntity<List<StudentResponse>> getMyStudents(@AuthenticationPrincipal User teacher) {
        return ResponseEntity.ok(teacherStudentService.getMyStudents(teacher.getEmail()));
    }

    @PostMapping("/{studentId}")
    public ResponseEntity<StudentResponse> addStudent(@AuthenticationPrincipal User teacher, @PathVariable Long studentId) {
        return ResponseEntity.ok(teacherStudentService.addStudent(teacher.getEmail(), studentId));
    }

    @DeleteMapping("/{studentId}")
    public ResponseEntity<Void> removeStudent(@AuthenticationPrincipal User teacher, @PathVariable Long studentId) {
        teacherStudentService.removeStudent(teacher.getEmail(), studentId);
        return ResponseEntity.noContent().build();
    }
}
