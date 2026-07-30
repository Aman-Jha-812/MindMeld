import api from './api';

export const chatSummary = (data) => api.post('/ai/chat-summary', data);

export const generateCode = (data) => api.post('/ai/generate-code', data);

export const debugCode = (data) => api.post('/ai/debug-code', data);

export const explainCode = (data) => api.post('/ai/explain-code', data);

export const meetingNotes = (data) => api.post('/ai/meeting-notes', data);

export const documentation = (data) => api.post('/ai/documentation', data);

export const commitMessage = (data) => api.post('/ai/commit-message', data);

export const technicalQuestion = (data) => api.post('/ai/technical-question', data);

export const actionItems = (data) => api.post('/ai/action-items', data);

export const suggestTasks = (data) => api.post('/ai/suggest-tasks', data);

export const codeReview = (data) => api.post('/ai/code-review', data);

export const sendQuery = (query, tab, contextText) => {
  switch (tab) {
    case 'summarize': return chatSummary({ conversation: contextText, prompt: query });
    case 'generate': return generateCode({ prompt: query, language: 'JavaScript' });
    case 'debug': return debugCode({ code: query });
    case 'explain': return explainCode({ code: query });
    case 'notes': return meetingNotes({ transcript: query });
    case 'docs': return documentation({ code: query, language: '' });
    case 'review': return codeReview({ code: query });
    default: return chatSummary({ conversation: contextText, prompt: query });
  }
};
