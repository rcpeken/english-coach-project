package com.recep.encoach.service;

import com.recep.encoach.dto.StudentResponse;
import com.recep.encoach.entity.TeacherStudent;
import com.recep.encoach.entity.User;
import com.recep.encoach.enums.Role;
import com.recep.encoach.repository.TeacherStudentRepository;
import com.recep.encoach.repository.UserRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TeacherStudentService {

    private final TeacherStudentRepository teacherStudentRepository;
    private final UserRepository userRepository;

    public List<StudentResponse> getMyStudents(String teacherEmail) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Öğretmen bulunamadı."));

        return teacherStudentRepository.findByTeacher(teacher).stream()
                .map(ts -> StudentResponse.builder()
                        .id(ts.getStudent().getId())
                        .fullName(ts.getStudent().getFullName())
                        .email(ts.getStudent().getEmail())
                        .addedAt(ts.getAddedAt().toString())
                        .build())
                .collect(Collectors.toList());
    }

    @Transactional
    public StudentResponse addStudent(String teacherEmail, Long studentId) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Öğretmen bulunamadı."));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Bu ID'ye sahip kullanıcı bulunamadı."));

        if (student.getRole() != Role.STUDENT) {
            throw new RuntimeException("Bu kullanıcı bir öğrenci değil.");
        }

        if (student.getId().equals(teacher.getId())) {
            throw new RuntimeException("Kendinizi öğrenci olarak ekleyemezsiniz.");
        }

        if (teacherStudentRepository.existsByTeacherAndStudent(teacher, student)) {
            throw new RuntimeException("Bu öğrenci zaten listenizde.");
        }

        TeacherStudent ts = TeacherStudent.builder()
                .teacher(teacher)
                .student(student)
                .build();
        teacherStudentRepository.save(ts);

        return StudentResponse.builder()
                .id(student.getId())
                .fullName(student.getFullName())
                .email(student.getEmail())
                .addedAt(ts.getAddedAt().toString())
                .build();
    }

    @Transactional
    public void removeStudent(String teacherEmail, Long studentId) {
        User teacher = userRepository.findByEmail(teacherEmail)
                .orElseThrow(() -> new RuntimeException("Öğretmen bulunamadı."));

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Öğrenci bulunamadı."));

        TeacherStudent ts = teacherStudentRepository.findByTeacherAndStudent(teacher, student)
                .orElseThrow(() -> new RuntimeException("Bu öğrenci listenizde değil."));

        teacherStudentRepository.delete(ts);
    }
}
