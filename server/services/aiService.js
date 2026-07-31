import { safeGenerate } from '../config/openai.js';

async function generateChatSummary({ query, context }) {
  try {
    let prompt;
    if (query && context) {
      prompt = `Answer the user's request using the conversation below as context when relevant, otherwise answer it directly.\n\nConversation:\n${context}\n\nRequest:\n${query}`;
    } else if (query) {
      prompt = query;
    } else if (context) {
      prompt = `Summarize the following conversation concisely:\n\n${context}`;
    } else {
      throw new Error('Nothing to process');
    }
    return await safeGenerate(prompt);
  } catch (error) {
    console.error('generateChatSummary error:', error);
    return null;
  }
}

async function generateCode(prompt, language) {
  return await safeGenerate(`Write ${language} code: ${prompt}`);
}

async function debugCode(code, error) {
  return await safeGenerate(`Debug the following code:\n\n${code}\n\nError:\n${error}\n\nProvide a debug explanation and the fix.`);
}

async function generateMeetingNotes(transcript) {
  return await safeGenerate(`Convert the following meeting transcript into structured meeting notes with title, date, attendees, key points, and action items:\n\n${transcript}`);
}

async function generateDocumentation(code, language) {
  return await safeGenerate(`Generate documentation for the following ${language} code:\n\n${code}`);
}

async function generateCommitMessage(changes) {
  return await safeGenerate(`Generate a concise git commit message for the following changes:\n\n${changes}`);
}

async function answerTechnicalQuestion(question) {
  return await safeGenerate(`Answer the following technical question in detail:\n\n${question}`);
}

async function generateActionItems(text) {
  return await safeGenerate(`Extract all action items from the following text. List them with responsible person and deadline if mentioned:\n\n${text}`);
}

async function suggestTasks(projectDescription) {
  return await safeGenerate(`Break down the following project description into specific tasks:\n\n${projectDescription}`);
}

async function codeReview(code) {
  return await safeGenerate(`Review the following code for bugs, improvements, security issues, and best practices:\n\n${code}`);
}

async function explainCode(code) {
  return await safeGenerate(`Explain the following code step by step:\n\n${code}`);
}

export {
  generateChatSummary,
  generateCode,
  debugCode,
  generateMeetingNotes,
  generateDocumentation,
  generateCommitMessage,
  answerTechnicalQuestion,
  generateActionItems,
  suggestTasks,
  codeReview,
  explainCode,
};
