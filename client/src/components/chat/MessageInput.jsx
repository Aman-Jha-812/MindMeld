import { useState, useRef, useCallback, useEffect } from 'react';
import { FiSend, FiSmile, FiPaperclip, FiX } from 'react-icons/fi';

const MAX_ROWS = 4;
const DEBOUNCE_MS = 500;

const MessageInput = ({ onSend, onTyping, disabled }) => {
  const [text, setText] = useState('');
  const [file, setFile] = useState(null);
  const textareaRef = useRef(null);
  const fileInputRef = useRef(null);
  const debounceRef = useRef(null);

  const autoResize = useCallback(() => {
    const ta = textareaRef.current;
    if (!ta) return;
    ta.style.height = 'auto';
    const lineHeight = parseInt(getComputedStyle(ta).lineHeight, 10) || 20;
    const maxHeight = lineHeight * MAX_ROWS;
    ta.style.height = `${Math.min(ta.scrollHeight, maxHeight)}px`;
  }, []);

  useEffect(() => {
    autoResize();
  }, [text, autoResize]);

  const handleChange = (e) => {
    setText(e.target.value);
    if (onTyping) {
      clearTimeout(debounceRef.current);
      debounceRef.current = setTimeout(() => onTyping(false), DEBOUNCE_MS);
      onTyping(true);
    }
  };

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleSend = () => {
    if (!text.trim() && !file) return;
    if (disabled) return;
    if (onSend) {
      onSend({ content: text.trim(), file });
    }
    setText('');
    setFile(null);
    if (textareaRef.current) {
      textareaRef.current.style.height = 'auto';
    }
  };

  const handleFileSelect = (e) => {
    const selected = e.target.files?.[0];
    if (selected) {
      setFile(selected);
    }
    e.target.value = '';
  };

  const removeFile = () => {
    setFile(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = '';
    }
  };

  const canSend = text.trim().length > 0 || !!file;

  return (
    <div className="border-t border-gray-700 bg-gray-800 px-2 sm:px-4 py-2 sm:py-3">
      {file && (
        <div className="flex items-center gap-2 mb-2 px-3 py-1.5 bg-gray-700 rounded-lg text-sm">
          <FiPaperclip size={14} className="text-indigo-400 shrink-0" />
          <span className="text-gray-200 truncate flex-1 min-w-0">{file.name}</span>
          <button
            onClick={removeFile}
            className="text-gray-400 hover:text-gray-200 transition-colors shrink-0"
          >
            <FiX size={16} />
          </button>
        </div>
      )}
      <div className="flex items-end gap-1.5 sm:gap-2">
        <div className="flex-1 min-w-0">
          <textarea
            ref={textareaRef}
            value={text}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            disabled={disabled}
            rows={1}
            placeholder="Type a message..."
            className="w-full resize-none bg-gray-700 text-gray-100 placeholder-gray-500 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500 disabled:opacity-50 disabled:cursor-not-allowed"
          />
        </div>
        <div className="flex items-center gap-1 shrink-0">
          <button
            type="button"
            onClick={() => {}}
            disabled={disabled}
            className="hidden sm:flex p-1.5 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
            title="Emoji picker"
          >
            <FiSmile size={16} />
          </button>
          <button
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
            className="p-1.5 text-gray-400 hover:text-gray-200 transition-colors disabled:opacity-50"
            title="Attach file"
          >
            <FiPaperclip size={16} />
          </button>
          <input
            ref={fileInputRef}
            type="file"
            accept="image/*,.pdf,.docx,.zip"
            onChange={handleFileSelect}
            className="hidden"
          />
        </div>
        <button
          onClick={handleSend}
          disabled={!canSend || disabled}
          className="flex items-center justify-center w-9 h-9 sm:w-10 sm:h-10 rounded-lg bg-indigo-600 text-white hover:bg-indigo-500 transition-colors disabled:opacity-40 disabled:cursor-not-allowed shrink-0"
        >
          <FiSend size={16} />
        </button>
      </div>
    </div>
  );
};

export default MessageInput;
