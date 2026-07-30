import * as aiService from '../services/aiService.js';
import AIHistory from '../models/AIHistory.js';

async function saveHistory(userId, workspaceId, prompt, response, type, metadata) {
  try {
    await AIHistory.create({
      user: userId,
      workspace: workspaceId || undefined,
      prompt,
      response,
      type,
      metadata: metadata || undefined,
    });
  } catch (err) {
    console.error('Failed to save AI history:', err.message);
  }
}

export const chatSummary = async (req, res) => {
  try {
    const { conversation, prompt, workspaceId } = req.body;
    const text = prompt?.trim() || conversation?.trim();
    if (!text) {
      return res.status(400).json({ success: false, message: 'Conversation text is required' });
    }
    const result = await aiService.generateChatSummary(text);
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error. Check server logs for details.' });
    }
    saveHistory(req.user._id, workspaceId, prompt || text, result, 'chat_summary');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('chatSummary error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const generateCode = async (req, res) => {
  try {
    const { prompt, language, workspaceId } = req.body;
    if (!prompt) {
      return res.status(400).json({ success: false, message: 'Prompt is required' });
    }
    const result = await aiService.generateCode(prompt, language || 'JavaScript');
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, prompt, result, 'code_generate', { language });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('generateCode error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const debugCode = async (req, res) => {
  try {
    const { code, error, workspaceId } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    const result = await aiService.debugCode(code, error || '');
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, `Code: ${code}\nError: ${error}`, result, 'code_debug');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('debugCode error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const explainCode = async (req, res) => {
  try {
    const { code, workspaceId } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    const result = await aiService.explainCode(code);
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, code, result, 'code_explain');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('explainCode error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const meetingNotes = async (req, res) => {
  try {
    const { transcript, workspaceId } = req.body;
    if (!transcript) {
      return res.status(400).json({ success: false, message: 'Transcript is required' });
    }
    const result = await aiService.generateMeetingNotes(transcript);
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, transcript, result, 'meeting_notes');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('meetingNotes error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const documentation = async (req, res) => {
  try {
    const { code, language, workspaceId } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    const result = await aiService.generateDocumentation(code, language || '');
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, code, result, 'documentation', { language });
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('documentation error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const commitMessage = async (req, res) => {
  try {
    const { changes, workspaceId } = req.body;
    if (!changes) {
      return res.status(400).json({ success: false, message: 'Changes description is required' });
    }
    const result = await aiService.generateCommitMessage(changes);
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, changes, result, 'commit_message');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('commitMessage error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const technicalQuestion = async (req, res) => {
  try {
    const { question, workspaceId } = req.body;
    if (!question) {
      return res.status(400).json({ success: false, message: 'Question is required' });
    }
    const result = await aiService.answerTechnicalQuestion(question);
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, question, result, 'technical_question');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('technicalQuestion error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const actionItems = async (req, res) => {
  try {
    const { text, workspaceId } = req.body;
    if (!text) {
      return res.status(400).json({ success: false, message: 'Text is required' });
    }
    const result = await aiService.generateActionItems(text);
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, text, result, 'action_items');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('actionItems error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const suggestTasks = async (req, res) => {
  try {
    const { projectDescription, workspaceId } = req.body;
    if (!projectDescription) {
      return res.status(400).json({ success: false, message: 'Project description is required' });
    }
    const result = await aiService.suggestTasks(projectDescription);
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, projectDescription, result, 'task_suggestion');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('suggestTasks error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const codeReview = async (req, res) => {
  try {
    const { code, workspaceId } = req.body;
    if (!code) {
      return res.status(400).json({ success: false, message: 'Code is required' });
    }
    const result = await aiService.codeReview(code);
    if (result === null) {
      return res.status(502).json({ success: false, message: 'AI service error' });
    }
    saveHistory(req.user._id, workspaceId, code, result, 'code_review');
    res.status(200).json({ success: true, data: result });
  } catch (error) {
    console.error('codeReview error:', error);
    res.status(500).json({ success: false, message: error.message || 'AI processing failed' });
  }
};

export const getHistory = async (req, res) => {
  try {
    const page = parseInt(req.query.page, 10) || 1;
    const limit = parseInt(req.query.limit, 10) || 20;
    const skip = (page - 1) * limit;
    const workspaceId = req.query.workspace;

    const filter = { user: req.user._id };
    if (workspaceId) filter.workspace = workspaceId;

    const total = await AIHistory.countDocuments(filter);
    const history = await AIHistory.find(filter)
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit);

    res.status(200).json({
      success: true,
      data: history,
      pagination: {
        page,
        limit,
        total,
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('GetAIHistory error:', error);
    res.status(500).json({
      success: false,
      message: error.message || 'Server error fetching AI history',
    });
  }
};
