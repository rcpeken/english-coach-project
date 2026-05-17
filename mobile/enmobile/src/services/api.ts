import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeModules, Platform } from 'react-native';
import {
  LoginRequest, RegisterRequest, AuthResponse,
  TestRequest, TestResponse, TestResultResponse,
  ReadingPassageRequest, ReadingPassageResponse,
  VocabularyWordRequest, VocabularyWordResponse,
  SubmitTestRequest, TestAssignment, StudentResponse,
} from '../types';

const DEFAULT_API_PORT = '8080';

const withApiPath = (baseUrl: string) => {
  const normalized = baseUrl.replace(/\/+$/, '');
  return normalized.endsWith('/api') ? normalized : `${normalized}/api`;
};

const getDevServerHost = () => {
  const scriptUrl = NativeModules?.SourceCode?.scriptURL;
  if (typeof scriptUrl !== 'string') return null;

  const hostMatch = scriptUrl.match(/^(?:https?:\/\/)?([^/:]+)/i);
  const host = hostMatch?.[1];

  if (!host || host === 'localhost' || host === '127.0.0.1' || host === '10.0.2.2') {
    return null;
  }

  return host;
};

const resolveBaseUrl = () => {
  const configured = process.env.EXPO_PUBLIC_API_URL?.trim();
  if (configured) {
    return withApiPath(configured);
  }

  const devHost = getDevServerHost();
  if (devHost) {
    return `http://${devHost}:${DEFAULT_API_PORT}/api`;
  }

  if (Platform.OS === 'android') {
    return `http://10.0.2.2:${DEFAULT_API_PORT}/api`;
  }

  return `http://localhost:${DEFAULT_API_PORT}/api`;
};

const BASE_URL = resolveBaseUrl();

export const getApiErrorMessage = (error: unknown, fallback: string) => {
  if (axios.isAxiosError(error)) {
    const data = error.response?.data as any;
    const detail = typeof data === 'string'
      ? data
      : data?.message || data?.error || data?.detail || error.message;

    if (error.response?.status) {
      return detail
        ? `${fallback} (HTTP ${error.response.status}: ${detail})`
        : `${fallback} (HTTP ${error.response.status})`;
    }

    if (error.message === 'Network Error') {
      return `${fallback} (Sunucuya ulaşılamadı. API adresini kontrol edin.)`;
    }

    return `${fallback} (${detail})`;
  }

  if (error instanceof Error) {
    return `${fallback} (${error.message})`;
  }

  return fallback;
};

const api = axios.create({
  baseURL: BASE_URL,
  headers: { 'Content-Type': 'application/json' },
});

api.interceptors.request.use(async (config) => {
  const token = await AsyncStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

export const authApi = {
  login: (data: LoginRequest) =>
    api.post<AuthResponse>('/auth/login', data).then(r => r.data),
  register: (data: RegisterRequest) =>
    api.post<AuthResponse>('/auth/register', data).then(r => r.data),
};

export const testApi = {
  create: (data: TestRequest) =>
    api.post<TestResponse>('/tests', data).then(r => r.data),
  getMyTests: () =>
    api.get<TestResponse[]>('/tests').then(r => r.data),
  getById: (id: number) =>
    api.get<TestResponse>(`/tests/${id}`).then(r => r.data),
  assign: (testId: number, studentId: number) =>
    api.post(`/tests/${testId}/assign?studentId=${studentId}`).then(r => r.data),
  getResults: () =>
    api.get<TestResultResponse[]>('/tests/results').then(r => r.data),
  getMyAssignments: () =>
    api.get<TestAssignment[]>('/tests/my-assignments').then(r => r.data),
  getPending: () =>
    api.get<TestAssignment[]>('/tests/my-assignments/pending').then(r => r.data),
  submit: (assignmentId: number, data: SubmitTestRequest) =>
    api.post<TestResultResponse>(`/tests/assignments/${assignmentId}/submit`, data).then(r => r.data),
  getResult: (resultId: number) =>
    api.get<TestResultResponse>(`/tests/results/${resultId}`).then(r => r.data),
  deleteTest: (testId: number) =>
    api.delete(`/tests/${testId}`).then(r => r.data),
  deleteResult: (resultId: number) =>
    api.delete(`/tests/results/${resultId}`).then(r => r.data),
};

export const passageApi = {
  create: (data: ReadingPassageRequest) =>
    api.post<ReadingPassageResponse>('/passages', data).then(r => r.data),
  getMyPassages: () =>
    api.get<ReadingPassageResponse[]>('/passages').then(r => r.data),
  getById: (id: number) =>
    api.get<ReadingPassageResponse>(`/passages/${id}`).then(r => r.data),
  assign: (passageId: number, studentId: number) =>
    api.post(`/passages/${passageId}/assign?studentId=${studentId}`).then(r => r.data),
  getMyAssigned: () =>
    api.get<ReadingPassageResponse[]>('/passages/my-assignments').then(r => r.data),
  deleteAssignment: (passageId: number) =>
    api.delete(`/passages/my-assignments/${passageId}`).then(r => r.data),
};

export const vocabApi = {
  add: (data: VocabularyWordRequest) =>
    api.post<VocabularyWordResponse>('/vocabulary', data).then(r => r.data),
  getMyWords: () =>
    api.get<VocabularyWordResponse[]>('/vocabulary').then(r => r.data),
  getForReview: () =>
    api.get<VocabularyWordResponse[]>('/vocabulary/review').then(r => r.data),
  markReviewed: (wordId: number, knewIt: boolean) =>
    api.put<VocabularyWordResponse>(`/vocabulary/${wordId}/review?knewIt=${knewIt}`).then(r => r.data),
  delete: (wordId: number) =>
    api.delete(`/vocabulary/${wordId}`).then(r => r.data),
};

export const studentApi = {
  getMyStudents: () =>
    api.get<StudentResponse[]>('/teacher/students').then(r => r.data),
  addStudent: (studentId: number) =>
    api.post<StudentResponse>(`/teacher/students/${studentId}`).then(r => r.data),
  removeStudent: (studentId: number) =>
    api.delete(`/teacher/students/${studentId}`).then(r => r.data),
};

import type {
  AiChatRequest, AiExplainWordRequest, AiAnalyzeTextRequest,
  AiExplainAnswersRequest, AiGenerateQuizRequest, AiResponse,
} from '../types';

export const aiApi = {
  chat: (data: AiChatRequest) =>
    api.post<AiResponse>('/ai/chat', data).then(r => r.data),
  explainWord: (data: AiExplainWordRequest) =>
    api.post<AiResponse>('/ai/explain-word', data).then(r => r.data),
  analyzeText: (data: AiAnalyzeTextRequest) =>
    api.post<AiResponse>('/ai/analyze-text', data).then(r => r.data),
  explainAnswers: (data: AiExplainAnswersRequest) =>
    api.post<AiResponse>('/ai/explain-answers', data).then(r => r.data),
  generateQuiz: (data: AiGenerateQuizRequest) =>
    api.post<AiResponse>('/ai/generate-quiz', data).then(r => r.data),
};

export default api;
