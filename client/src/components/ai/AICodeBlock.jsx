import { useState, useCallback } from 'react';
import { FiCopy, FiCheck } from 'react-icons/fi';

const KEYWORDS = {
  javascript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends',
    'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'throw',
    'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'of', 'in',
  ],
  typescript: [
    'const', 'let', 'var', 'function', 'return', 'if', 'else', 'for', 'while',
    'do', 'switch', 'case', 'break', 'continue', 'new', 'this', 'class', 'extends',
    'import', 'export', 'default', 'from', 'async', 'await', 'try', 'catch', 'throw',
    'typeof', 'instanceof', 'null', 'undefined', 'true', 'false', 'of', 'in',
    'interface', 'type', 'enum', 'implements', 'as', 'any', 'void', 'never',
    'string', 'number', 'boolean', 'readonly', 'private', 'public', 'protected',
  ],
  python: [
    'def', 'class', 'return', 'if', 'elif', 'else', 'for', 'while', 'import',
    'from', 'as', 'try', 'except', 'finally', 'with', 'yield', 'lambda',
    'True', 'False', 'None', 'in', 'not', 'and', 'or', 'is', 'async', 'await',
    'self', 'raise', 'pass', 'break', 'continue',
  ],
  java: [
    'public', 'private', 'protected', 'class', 'interface', 'extends', 'implements',
    'static', 'final', 'void', 'return', 'if', 'else', 'for', 'while', 'do',
    'new', 'this', 'super', 'try', 'catch', 'throw', 'throws', 'import', 'package',
    'null', 'true', 'false', 'int', 'String', 'boolean', 'double', 'float', 'long',
  ],
};

const getLanguageAlias = (lang) => {
  const map = {
    js: 'javascript', ts: 'typescript', py: 'python', jsx: 'javascript',
    tsx: 'typescript', rb: 'ruby', go: 'go', rs: 'rust', sh: 'bash',
    bash: 'bash', zsh: 'bash', html: 'html', css: 'css', json: 'json',
    yaml: 'yaml', yml: 'yaml', md: 'markdown',
  };
  return map[lang?.toLowerCase()] || lang?.toLowerCase() || 'text';
};

const highlightLine = (line, lang) => {
  const keywords = KEYWORDS[lang] || [];
  let result = line;
  keywords.forEach((kw) => {
    const regex = new RegExp(`\\b(${kw})\\b`, 'g');
    result = result.replace(regex, '<span class="text-accent">$1</span>');
  });
  result = result.replace(
    /\/\/.*$/gm,
    '<span class="text-ink-muted">$&</span>'
  );
  result = result.replace(
    /\/\*[\s\S]*?\*\//g,
    '<span class="text-ink-muted">$&</span>'
  );
  result = result.replace(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
    '<span class="text-success">$1</span>'
  );
  result = result.replace(
    /(\b\d+\.?\d*\b)/g,
    '<span class="text-warning">$1</span>'
  );
  return result;
};

const AICodeBlock = ({ code, language }) => {
  const [copied, setCopied] = useState(false);
  const lang = getLanguageAlias(language);

  const handleCopy = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      const textarea = document.createElement('textarea');
      textarea.value = code;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  }, [code]);

  const lines = code.split('\n');

  return (
      <div className="relative group bg-hover rounded-lg overflow-hidden border border-line my-2">
      <div className="flex items-center justify-between px-4 py-1.5 bg-sidebar border-b border-line">
        <span className="text-xs text-ink-muted font-mono uppercase">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-ink-muted hover:text-ink-secondary transition-colors"
        >
          {copied ? (
            <>
              <FiCheck size={14} className="text-success" />
              <span className="text-success">Copied</span>
            </>
          ) : (
            <>
              <FiCopy size={14} />
              <span>Copy</span>
            </>
          )}
        </button>
      </div>
      <pre className="p-4 overflow-x-auto">
        <code className="font-mono text-sm leading-relaxed">
          {lines.map((line, i) => (
            <div key={i} className="flex">
              <span className="text-ink-muted text-xs select-none w-8 text-right mr-4 flex-shrink-0">
                {i + 1}
              </span>
              <span
                dangerouslySetInnerHTML={{ __html: highlightLine(line, lang) }}
                className="text-ink"
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default AICodeBlock;
