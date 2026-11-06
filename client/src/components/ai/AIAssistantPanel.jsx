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
      <div className="fixed inset-y-0 right-0 z-50 flex w-full min-w-0 flex-col bg-ai border-l border-ai-border shadow-2xl sm:w-96 xl:static xl:inset-auto xl:z-auto xl:h-full xl:w-[340px] xl:flex-shrink-0 xl:shadow-none">
      <div className="flex items-center justify-between px-4 py-3 border-b border-line">
        <div className="flex items-center gap-2">
          <TabIcon size={18} className="text-brand" />
          <h2 className="text-sm font-semibold text-ink">AI Assistant</h2>
        </div>
        <button
          onClick={onClose}
          className="p-1.5 text-ink-secondary hover:text-ink transition-colors rounded hover:bg-hover"
        >
          <FiX size={18} />
        </button>
      </div>

      <div className="flex w-full min-w-0 overflow-x-auto border-b border-line px-2 py-1 gap-1">
        {TABS.map((tab) => {
          const Icon = tab.icon;
          return (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex shrink-0 items-center gap-1 px-2.5 py-1.5 text-xs rounded-md whitespace-nowrap transition-colors ${
                activeTab === tab.id
                  ? 'bg-brand-soft text-brand'
                  : 'text-ink-muted hover:text-ink-secondary hover:bg-hover'
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
            className="w-full flex items-center gap-2 text-xs text-brand hover:text-brand-hover bg-brand-soft hover:bg-brand-soft rounded-lg px-3 py-2 transition-colors"
          >
            <FiSun size={14} />
            Summarize Chat
          </button>
        )}

        {history.map((entry, i) => (
          <div key={i} className="space-y-2">
            <div className="flex items-start gap-2">
              <div className="w-6 h-6 rounded-full bg-brand flex items-center justify-center flex-shrink-0 mt-0.5">
                <FiMessageSquare size={12} className="text-white" />
              </div>
              <div>
                <p className="text-xs text-ink-secondary">
                  <span className="font-medium text-ink-secondary">You</span> ({entry.tab})
                </p>
                <p className="text-sm text-ink mt-0.5 whitespace-pre-wrap">{entry.content}</p>
              </div>
            </div>
            {entry.response && (
              <div className="ml-8 p-3 bg-card border border-line rounded-lg">
                <ResponseRenderer content={entry.response} />
              </div>
            )}
          </div>
        ))}

        {loading && (
          <div className="flex items-center gap-2 text-sm text-ink-secondary ml-8">
            <div className="w-4 h-4 border-2 border-brand border-t-transparent rounded-full animate-spin" />
            Processing...
          </div>
        )}

        <div ref={responseEndRef} />
      </div>

      <div className="p-4 border-t border-line">
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
            className="flex-1 text-sm bg-card text-ink placeholder-ink-muted rounded-lg px-3 py-2 focus:outline-none focus:ring-1 focus:ring-brand"
          />
          <button
            onClick={handleSubmit}
            disabled={!prompt.trim() || loading}
            className="p-2 bg-brand text-white rounded-lg hover:bg-brand-hover transition-colors disabled:opacity-40 disabled:cursor-not-allowed"
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
    <div className="text-sm text-ink-secondary space-y-2">
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
