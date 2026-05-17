import api from './api';

export const lookupWord = async (word: string): Promise<{ meaning: string | null; example: string | null }> => {
  try {
    const response = await api.get<{ word: string; meaning: string; example: string }>(
      '/dictionary/lookup',
      { params: { word } }
    );

    const data = response.data;
    return {
      meaning: data.meaning || null,
      example: data.example || null,
    };
  } catch (error) {
    console.error('Dictionary lookup error:', error);
    return { meaning: null, example: null };
  }
};
