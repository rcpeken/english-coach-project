package com.recep.encoach.service;

import com.recep.encoach.dto.*;
import com.recep.encoach.entity.*;
import com.recep.encoach.enums.AssignmentStatus;
import com.recep.encoach.enums.QuestionOption;
import com.recep.encoach.repository.*;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import java.util.ArrayList;
import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TestService {

    private final TestRepository testRepository;
    private final QuestionRepository questionRepository;
    private final TestAssignmentRepository testAssignmentRepository;
    private final TestResultRepository testResultRepository;
    private final UserRepository userRepository;

    @Transactional
    public TestResponse createTest(TestRequest request, User teacher) {
        Test test = Test.builder()
                .title(request.getTitle())
                .description(request.getDescription())
                .teacher(teacher)
                .build();

        List<Question> questions = new ArrayList<>();
        for (QuestionRequest qr : request.getQuestions()) {
            Question question = Question.builder()
                    .test(test)
                    .questionText(qr.getQuestionText())
                    .optionA(qr.getOptionA())
                    .optionB(qr.getOptionB())
                    .optionC(qr.getOptionC())
                    .optionD(qr.getOptionD())
                    .correctOption(QuestionOption.valueOf(qr.getCorrectOption().toUpperCase()))
                    .build();
            questions.add(question);
        }
        test.setQuestions(questions);

        test = testRepository.save(test);
        return mapToTestResponse(test);
    }

    public List<TestResponse> getTestsByTeacher(Long teacherId) {
        return testRepository.findByTeacherId(teacherId).stream()
                .map(this::mapToTestResponse)
                .collect(Collectors.toList());
    }

    public TestResponse getTestById(Long testId) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test bulunamadı!"));
        return mapToTestResponse(test);
    }

    @Transactional
    public void assignTestToStudent(Long testId, Long studentId, User teacher) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test bulunamadı!"));

        if (!test.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Bu test size ait değil!");
        }

        if (testAssignmentRepository.existsByTestIdAndStudentId(testId, studentId)) {
            throw new RuntimeException("Bu test bu öğrenciye zaten atanmış!");
        }

        User student = userRepository.findById(studentId)
                .orElseThrow(() -> new RuntimeException("Öğrenci bulunamadı!"));

        TestAssignment assignment = TestAssignment.builder()
                .test(test)
                .student(student)
                .build();

        testAssignmentRepository.save(assignment);
    }

    public List<TestAssignment> getStudentAssignments(Long studentId) {
        return testAssignmentRepository.findByStudentId(studentId);
    }

    public List<TestAssignment> getPendingAssignments(Long studentId) {
        return testAssignmentRepository.findByStudentIdAndStatus(studentId, AssignmentStatus.PENDING);
    }

    @Transactional
    public TestResultResponse submitTest(Long assignmentId, SubmitTestRequest request, User student) {
        TestAssignment assignment = testAssignmentRepository.findById(assignmentId)
                .orElseThrow(() -> new RuntimeException("Atama bulunamadı!"));

        if (!assignment.getStudent().getId().equals(student.getId())) {
            throw new RuntimeException("Bu atama size ait değil!");
        }

        if (assignment.getStatus() == AssignmentStatus.COMPLETED) {
            throw new RuntimeException("Bu test zaten tamamlanmış!");
        }

        Test test = assignment.getTest();
        List<Question> questions = questionRepository.findByTestId(test.getId());

        int score = 0;
        List<StudentAnswer> studentAnswers = new ArrayList<>();
        List<TestResultResponse.AnswerDetail> answerDetails = new ArrayList<>();

        TestResult testResult = TestResult.builder()
                .assignment(assignment)
                .totalQuestions(questions.size())
                .build();

        for (SubmitTestRequest.AnswerRequest ar : request.getAnswers()) {
            Question question = questions.stream()
                    .filter(q -> q.getId().equals(ar.getQuestionId()))
                    .findFirst()
                    .orElseThrow(() -> new RuntimeException("Soru bulunamadı: " + ar.getQuestionId()));

            QuestionOption selected = QuestionOption.valueOf(ar.getSelectedOption().toUpperCase());
            boolean isCorrect = selected == question.getCorrectOption();
            if (isCorrect) score++;

            StudentAnswer answer = StudentAnswer.builder()
                    .testResult(testResult)
                    .question(question)
                    .selectedOption(selected)
                    .correct(isCorrect)
                    .build();
            studentAnswers.add(answer);

            answerDetails.add(TestResultResponse.AnswerDetail.builder()
                    .questionId(question.getId())
                    .questionText(question.getQuestionText())
                    .selectedOption(selected.name())
                    .correctOption(question.getCorrectOption().name())
                    .correct(isCorrect)
                    .build());
        }

        testResult.setScore(score);
        testResult.setStudentAnswers(studentAnswers);
        testResultRepository.save(testResult);

        assignment.setStatus(AssignmentStatus.COMPLETED);
        testAssignmentRepository.save(assignment);

        return TestResultResponse.builder()
                .id(testResult.getId())
                .assignmentId(assignmentId)
                .testTitle(test.getTitle())
                .studentName(student.getFullName())
                .score(score)
                .totalQuestions(questions.size())
                .percentage(questions.isEmpty() ? 0 : (double) score / questions.size() * 100)
                .answers(answerDetails)
                .completedAt(testResult.getCompletedAt())
                .build();
    }

    public TestResultResponse getTestResult(Long resultId) {
        TestResult result = testResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Sonuç bulunamadı!"));

        TestAssignment assignment = result.getAssignment();
        Test test = assignment.getTest();

        List<TestResultResponse.AnswerDetail> answerDetails = result.getStudentAnswers().stream()
                .map(sa -> TestResultResponse.AnswerDetail.builder()
                        .questionId(sa.getQuestion().getId())
                        .questionText(sa.getQuestion().getQuestionText())
                        .selectedOption(sa.getSelectedOption().name())
                        .correctOption(sa.getQuestion().getCorrectOption().name())
                        .correct(sa.isCorrect())
                        .build())
                .collect(Collectors.toList());

        return TestResultResponse.builder()
                .id(result.getId())
                .assignmentId(assignment.getId())
                .testTitle(test.getTitle())
                .studentName(assignment.getStudent().getFullName())
                .score(result.getScore())
                .totalQuestions(result.getTotalQuestions())
                .percentage(result.getTotalQuestions() == 0 ? 0 :
                        (double) result.getScore() / result.getTotalQuestions() * 100)
                .answers(answerDetails)
                .completedAt(result.getCompletedAt())
                .build();
    }

    public List<TestResultResponse> getResultsByTeacher(Long teacherId) {
        return testResultRepository.findByAssignmentTestTeacherId(teacherId).stream()
                .map(result -> {
                    TestAssignment assignment = result.getAssignment();
                    return TestResultResponse.builder()
                            .id(result.getId())
                            .assignmentId(assignment.getId())
                            .testTitle(assignment.getTest().getTitle())
                            .studentName(assignment.getStudent().getFullName())
                            .score(result.getScore())
                            .totalQuestions(result.getTotalQuestions())
                            .percentage(result.getTotalQuestions() == 0 ? 0 :
                                    (double) result.getScore() / result.getTotalQuestions() * 100)
                            .completedAt(result.getCompletedAt())
                            .build();
                })
                .collect(Collectors.toList());
    }

    @Transactional
    public void deleteTest(Long testId, User teacher) {
        Test test = testRepository.findById(testId)
                .orElseThrow(() -> new RuntimeException("Test bulunamadı!"));
        if (!test.getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Bu test size ait değil!");
        }
        List<TestAssignment> assignments = testAssignmentRepository.findByTestId(testId);
        for (TestAssignment assignment : assignments) {
            testResultRepository.findByAssignmentId(assignment.getId())
                    .ifPresent(testResultRepository::delete);
        }
        testAssignmentRepository.deleteAll(assignments);
        testRepository.delete(test);
    }

    @Transactional
    public void deleteTestResult(Long resultId, User teacher) {
        TestResult result = testResultRepository.findById(resultId)
                .orElseThrow(() -> new RuntimeException("Sonuç bulunamadı!"));
        if (!result.getAssignment().getTest().getTeacher().getId().equals(teacher.getId())) {
            throw new RuntimeException("Bu sonuç size ait değil!");
        }
        testResultRepository.delete(result);
    }

    private TestResponse mapToTestResponse(Test test) {
        List<TestResponse.QuestionResponse> questionResponses = test.getQuestions().stream()
                .map(q -> TestResponse.QuestionResponse.builder()
                        .id(q.getId())
                        .questionText(q.getQuestionText())
                        .optionA(q.getOptionA())
                        .optionB(q.getOptionB())
                        .optionC(q.getOptionC())
                        .optionD(q.getOptionD())
                        .build())
                .collect(Collectors.toList());

        return TestResponse.builder()
                .id(test.getId())
                .title(test.getTitle())
                .description(test.getDescription())
                .teacherName(test.getTeacher().getFullName())
                .questions(questionResponses)
                .createdAt(test.getCreatedAt())
                .build();
    }
}
