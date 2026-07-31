import { useState, useRef, useEffect } from 'react';
import {
  FiX,
  FiSun,
  FiCode,
  FiTerminal,
  FiHelpCircle,
  FiFileText,
  FiBook,
  FiSearch,
  FiSend,
  FiClock,
  FiMessageSquare,
} from 'react-icons/fi';
import * as aiService from '../../services/aiService';
import AICodeBlock from './AICodeBlock';

const TABS = [
  { id: 'summarize', label: 'Summarize', icon: FiSun },
  { id: 'generate', label: 'Generate Code', icon: FiCode },
  { id: 'debug', label: 'Debug', icon: FiTerminal },
  { id: 'explain', label: 'Explain', icon: FiHelpCircle },
  { id: 'notes', label: 'Meeting Notes', icon: FiFileText },
  { id: 'docs', label: 'Docs', icon: FiBook },
  { id: 'review', label: 'Review', icon: FiSearch },
];

const processResponse = (text) => {
  const parts = [];
  const codeRegex = /```(\w*)\n([\s\S]*?)```/g;
  let lastIndex = 0;
  let match;
  while ((match = codeRegex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push({ type: 'text', content: text.slice(lastIndex, match.index) });
    }
    parts.push({ type: 'code', language: match[1] || 'text', content: match[2] });
    lastIndex = match.index + match[0].length;
  }
  if (lastIndex < text.length) {
    parts.push({ type: 'text', content: text.slice(lastIndex) });
  }
  return parts;
};

const AIAssistantPanel = ({ isOpen, onClose, channelMessages }) => {
  const [activeTab, setActiveTab] = useState('summarize');
  const [prompt, setPrompt] = useState('');
  const [loading, setLoading] = useState(false);
  const [history, setHistory] = useState([]);
  const responseEndRef = useRef(null);

  useEffect(() => {
    if (responseEndRef.current) {
      responseEndRef.current.scrollIntoView({ behavior: 'smooth' });
    }
  }, [history]);

  const formatMessages = (msgs, count = 10) =>
    msgs
      .filter((m) => m.messageType !== 'system')
      .slice(-count)
      .map((m) => `${m.sender?.name || 'Unknown'}: ${m.content || ''}`)
      .join('\n');

  const handleSubmit = async () => {
    const query = prompt.trim();
    if (!query) return;
    setLoading(true);
    const newEntry = { role: 'user', content: query, tab: activeTab, timestamp: new Date() };
    setHistory((prev) => [newEntry, ...prev]);
    setPrompt('');
    const updateEntry = (response) =>
      setHistory((prev) => prev.map((h) => (h === newEntry ? { ...h, response } : h)));
    try {
      const contextText = formatMessages(channelMessages, 10);
      const res = await aiService.sendQuery(query, activeTab, contextText);
      const result = res.data?.data || res.data || res;
      updateEntry(result);
    } catch (err) {
      const msg = err?.response?.data?.message || err.message || 'Unable to get AI response. Please try again.';
      updateEntry(`Error: ${msg}`);
    } finally {
      setLoading(false);
    }
  };

  const handleSummarizeChat = () => {
    if (!channelMessages || channelMessages.length === 0) return;
    const recentContent = channelMessages
      .filter((m) => m.messageType !== 'system')
      .slice(-20)
      .map((m) => `${m.sender?.name || 'Unknown'}: ${m.content}`)
      .join('\n');
    const summaryPrompt = `Summarize the following chat conversation:\n\n${recentContent}`;
    setPrompt(summaryPrompt);
    setActiveTab('summarize');
  };

  if (!isOpen) return null;

  const TabIcon = TABS.find((t) => t.id === activeTab)?.icon || FiMessageSquare;

  return (
    <div className="fixed inset-y-0 right-0 w-full sm:w-96 bg-gray-900 border-l border-gray-800 shadow-2xl flex flex-col z-50">
      <div className="flex items-center justify-between px-4 py-3 border-b border-gray-800">
        <div className="flex items-center gap-2">
          <TabIcon size={18} className="text-indigo-400" />
          <h2 className="text-sm font-semibold text-gray-100">AI Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors rounded hover:bg-gray-800"
        >
          <FiX size={18} />
        </button>
      </div>

      <div className="flex overflow-x-auto border-b border-gray-800 px-2 py-1 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1 px-2.5 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-indigo-600/20 text-indigo-300'
                  : 'text-gray-500 hover:text-gray-300 hover:bg-gray-800'
              }`}
            >
              <Icon size={14} />
              {tab.label}
            </button>
          );
        })}
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-3 space-y-4">
        {activeTab === 'summarize' && channelMessages?.length > 0 && (
          <button
            onClick={handleSummarizeChat}
            className="w-full flex items-center gap-2 text-xs text-indigo-400 hover:text-indigo-300 bg-indigo-600/10 hover:bg-indigo-600/20 rounded-lg px-3 py-2 transition-colors"
          >
            <FiSun size={14} />
            Summarize Chat
          </button>
        )}

        {history.map((entry, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-indigo-600 flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiMessageSquare size={12} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-gray-400">
                  <span className="font-medium text-gray-300">You</span> ({entry.tab})
                </p>
                <p className="text-sm text-gray-200 mt-0.5 whitespace-pre-wrap">{entry.content}</p>
              </div>
            </div>
            {entry.response && (
              <div className="ml-8 p-3 bg-gray-800 rounded-lg">
                <ResponseRenderer content={entry.response} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-gray-400 ml-8">
            <div className="w-4 h-4 border-2 border-indigo-500 border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        )}

        <div ref={responseEndRef} />
      </div>

      <div className="p-4 border-t border-gray-800">
        <div className="flex gap-2">
          <input
            value={prompt}
            onChange={(e) => setPrompt(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                handleSubmit();
              }
            }}
            placeholder={`Ask AI to ${activeTab}...`}
            className="flex-1 text-sm bg-gray-800 text-gray-100 placeholder-gray-500 rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-indigo-500"
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || loading}
            className="p-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
          >
            <FiSend size={16} />
          </button>
        </div>
      </div>
    </div>
  );
};

const ResponseRenderer = ({ content }) => {
  const parts = processResponse(content);
  return (
    <div className="text-sm text-gray-300 space-y-2">
      {parts.map((part, i) => {
        if (part.type === 'code') {
          return <AICodeBlock key={i} code={part.content} language={part.language} />;
        }
        return (
          <p key={i} className="whitespace-pre-wrap">
            {part.content.split('\n').map((line, j) => (
              <span key={j}>
                {line}
                {j < part.content.split('\n').length - 1 && <br />}
              </span>
            ))}
          </p>
        );
      })}
    </div>
  );
};

export default AIAssistantPanel;
