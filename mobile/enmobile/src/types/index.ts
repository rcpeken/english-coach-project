export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  email: string;
  password: string;
  fullName: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface AuthResponse {
  token: string;
  userId: number;
  email: string;
  fullName: string;
  role: 'TEACHER' | 'STUDENT';
}

export interface QuestionRequest {
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
  correctOption: string;
}

export interface TestRequest {
  title: string;
  description?: string;
  questions: QuestionRequest[];
}

export interface QuestionResponse {
  id: number;
  questionText: string;
  optionA: string;
  optionB: string;
  optionC: string;
  optionD: string;
}

export interface TestResponse {
  id: number;
  title: string;
  description: string;
  teacherName: string;
  questions: QuestionResponse[];
  createdAt: string;
}

export interface TestAssignment {
  assignmentId: number;
  testId: number;
  testTitle: string;
  status: 'PENDING' | 'COMPLETED';
  assignedAt: string;
}

export interface AnswerRequest {
  questionId: number;
  selectedOption: string;
}

export interface SubmitTestRequest {
  answers: AnswerRequest[];
}

export interface AnswerDetail {
  questionId: number;
  questionText: string;
  selectedOption: string;
  correctOption: string;
  correct: boolean;
}

export interface TestResultResponse {
  id: number;
  assignmentId: number;
  testTitle: string;
  studentName: string;
  score: number;
  totalQuestions: number;
  percentage: number;
  answers: AnswerDetail[];
  completedAt: string;
}

export interface ReadingPassageRequest {
  title: string;
  content: string;
}

export interface ReadingPassageResponse {
  id: number;
  title: string;
  content: string;
  teacherName: string;
  createdAt: string;
}

export interface StudentResponse {
  id: number;
  fullName: string;
  email: string;
  addedAt: string;
}

export interface VocabularyWordRequest {
  word: string;
  meaning: string;
  exampleSentence?: string;
  passageId?: number;
}

export interface VocabularyWordResponse {
  id: number;
  word: string;
  meaning: string;
  exampleSentence: string;
  passageId: number;
  passageTitle: string;
  masteryLevel: number;
  reviewCount: number;
  nextReviewAt: string;
  createdAt: string;
}

export interface ChatMessage {
  role: 'user' | 'model';
  text: string;
}

export interface AiChatRequest {
  messages: ChatMessage[];
  message: string;
}

export interface AiExplainWordRequest {
  word: string;
}

export interface AiAnalyzeTextRequest {
  text: string;
  question: string;
}

export interface AiWrongAnswer {
  questionText: string;
  selectedOption: string;
  correctOption: string;
}

export interface AiExplainAnswersRequest {
  testTitle: string;
  wrongAnswers: AiWrongAnswer[];
}

export interface AiGenerateQuizRequest {
  topic: string;
  count: number;
}

export interface AiResponse {
  reply: string;
}

export type RootStackParamList = {
  Login: undefined;
  Register: undefined;
  TeacherTabs: undefined;
  StudentTabs: undefined;
  CreateTest: undefined;
  TestDetail: { testId: number };
  TestResults: undefined;
  CreatePassage: undefined;
  PassageDetail: { passageId: number };
  MyStudents: undefined;
  AssignToStudent: { studentId: number; studentName: string };
  SolveTest: { assignmentId: number; testId: number };
  TestResult: { resultId: number };
  Reading: { passageId: number; passageTitle: string };
  VocabularyReview: undefined;
  AiChat: undefined;
  AiQuiz: undefined;
};
