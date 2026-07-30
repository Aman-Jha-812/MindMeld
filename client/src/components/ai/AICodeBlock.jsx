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
    result = result.replace(regex, '<span class="text-purple-400">$1</span>');
  });
  result = result.replace(
    /\/\/.*$/gm,
    '<span class="text-gray-500">$&</span>'
  );
  result = result.replace(
    /\/\*[\s\S]*?\*\//g,
    '<span class="text-gray-500">$&</span>'
  );
  result = result.replace(
    /("(?:[^"\\]|\\.)*"|'(?:[^'\\]|\\.)*'|`(?:[^`\\]|\\.)*`)/g,
    '<span class="text-green-400">$1</span>'
  );
  result = result.replace(
    /(\b\d+\.?\d*\b)/g,
    '<span class="text-yellow-400">$1</span>'
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
    <div className="relative group bg-gray-950 rounded-lg overflow-hidden border border-gray-800 my-2">
      <div className="flex items-center justify-between px-4 py-1.5 bg-gray-900 border-b border-gray-800">
        <span className="text-xs text-gray-500 font-mono uppercase">{lang}</span>
        <button
          onClick={handleCopy}
          className="flex items-center gap-1 text-xs text-gray-500 hover:text-gray-300 transition-colors"
        >
          {copied ? (
            <>
              <FiCheck size={14} className="text-green-400" />
              <span className="text-green-400">Copied</span>
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
              <span className="text-gray-600 text-xs select-none w-8 text-right mr-4 flex-shrink-0">
                {i + 1}
              </span>
              <span
                dangerouslySetInnerHTML={{ __html: highlightLine(line, lang) }}
                className="text-gray-200"
              />
            </div>
          ))}
        </code>
      </pre>
    </div>
  );
};

export default AICodeBlock;
