import React, { useState } from 'react';

// Parser for inline styles like bold and code
const parseInlineStyles = (text) => {
  if (!text) return '';
  const tokens = text.split(/(\*\*.*?\*\*|`.*?`)/g);
  return tokens.map((token, idx) => {
    if (token.startsWith('**') && token.endsWith('**')) {
      return (
        <strong key={idx} className="font-semibold text-slate-900 dark:text-slate-100">
          {token.slice(2, -2)}
        </strong>
      );
    }
    if (token.startsWith('`') && token.endsWith('`')) {
      return (
        <code
          key={idx}
          className="px-1.5 py-0.5 rounded bg-slate-100 dark:bg-slate-850 text-slate-800 dark:text-slate-200 font-mono text-xs border border-slate-200/50 dark:border-slate-800/60 font-semibold"
        >
          {token.slice(1, -1)}
        </code>
      );
    }
    return token;
  });
};

// Parser for lists and standard paragraph formatting
const parseParagraph = (text) => {
  const lines = text.split('\n');
  
  // Detect list structure
  const isBulletList = lines.every(line => line.trim().startsWith('- ') || line.trim().startsWith('* ') || line.trim() === '');
  const isNumberedList = lines.every(line => /^\d+\.\s/.test(line.trim()) || line.trim() === '');

  if (isBulletList && lines.some(line => line.trim() !== '')) {
    return (
      <ul className="list-disc pl-5 my-2 space-y-1.5 text-slate-700 dark:text-slate-300">
        {lines.filter(l => l.trim() !== '').map((line, i) => {
          const content = line.trim().replace(/^[-*]\s+/, '');
          return <li key={i}>{parseInlineStyles(content)}</li>;
        })}
      </ul>
    );
  }

  if (isNumberedList && lines.some(line => line.trim() !== '')) {
    return (
      <ol className="list-decimal pl-5 my-2 space-y-1.5 text-slate-700 dark:text-slate-300">
        {lines.filter(l => l.trim() !== '').map((line, i) => {
          const content = line.trim().replace(/^\d+\.\s+/, '');
          return <li key={i}>{parseInlineStyles(content)}</li>;
        })}
      </ol>
    );
  }

  return (
    <p className="leading-relaxed text-slate-700 dark:text-slate-300 whitespace-pre-wrap">
      {parseInlineStyles(text)}
    </p>
  );
};

export const ChatMessage = ({ message }) => {
  const { role, content, timestamp } = message;
  const isUser = role === 'user';
  
  const [isCopied, setIsCopied] = useState(false);
  const [copiedCodeIdx, setCopiedCodeIdx] = useState(null);

  const handleCopyMessage = async () => {
    try {
      await navigator.clipboard.writeText(content);
      setIsCopied(true);
      setTimeout(() => setIsCopied(false), 2000);
    } catch (err) {
      console.error('Failed to copy message:', err);
    }
  };

  const handleCopyCode = async (codeText, idx) => {
    try {
      await navigator.clipboard.writeText(codeText);
      setCopiedCodeIdx(idx);
      setTimeout(() => setCopiedCodeIdx(null), 2000);
    } catch (err) {
      console.error('Failed to copy code:', err);
    }
  };

  const renderContent = (rawText) => {
    const segments = rawText.split(/(```[\s\S]*?```)/g);
    return segments.map((chunk, idx) => {
      if (chunk.startsWith('```') && chunk.endsWith('```')) {
        const cleanBlock = chunk.slice(3, -3).trim();
        const firstLineBreak = cleanBlock.indexOf('\n');
        const language = firstLineBreak !== -1 ? cleanBlock.substring(0, firstLineBreak) : 'code';
        const rawCode = firstLineBreak !== -1 ? cleanBlock.substring(firstLineBreak + 1) : cleanBlock;

        return (
          <div key={idx} className="my-4 rounded-xl overflow-hidden border border-slate-200 dark:border-slate-800/80 shadow-sm font-mono text-xs max-w-full">
            <div className="flex justify-between items-center px-4 py-2 bg-slate-50 dark:bg-slate-900/60 text-slate-500 dark:text-slate-400 border-b border-slate-200/80 dark:border-slate-800/60 select-none">
              <span className="text-[10px] uppercase tracking-wider font-semibold text-slate-500 dark:text-slate-400">
                {language || 'code'}
              </span>
              <button 
                onClick={() => handleCopyCode(rawCode, idx)}
                className="flex items-center space-x-1.5 py-0.5 px-2 rounded hover:bg-slate-200 dark:hover:bg-slate-800 hover:text-slate-700 dark:hover:text-slate-200 transition-colors cursor-pointer text-[11px]"
              >
                {copiedCodeIdx === idx ? (
                  <>
                    <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                    </svg>
                    <span className="text-emerald-500 font-semibold">Copied!</span>
                  </>
                ) : (
                  <>
                    <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M8 16H6a2 2 0 01-2-2V6a2 2 0 012-2h8a2 2 0 012 2v2m-6 12h8a2 2 0 002-2v-8a2 2 0 00-2-2h-8a2 2 0 00-2 2v8a2 2 0 002 2z"/>
                    </svg>
                    <span>Copy code</span>
                  </>
                )}
              </button>
            </div>
            <pre className="p-4 bg-slate-950 text-slate-100 overflow-x-auto whitespace-pre scrolling-touch leading-relaxed">
              <code>{rawCode}</code>
            </pre>
          </div>
        );
      }
      
      // Standard markdown paragraph/list renderer
      const blocks = chunk.split('\n\n');
      return blocks.map((block, bIdx) => (
        <div key={`${idx}-${bIdx}`} className="mb-3 last:mb-0">
          {parseParagraph(block)}
        </div>
      ));
    });
  };

  const formattedTime = (() => {
    try {
      return new Date(timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    } catch {
      return '';
    }
  })();

  return (
    <div className={`group flex items-start space-x-4 max-w-3xl w-full mx-auto px-4 md:px-6 py-5 border-b border-slate-100/50 dark:border-slate-900/30 last:border-b-0 transition-colors ${
      isUser ? 'bg-slate-50/20 dark:bg-slate-950/10' : 'bg-slate-50/70 dark:bg-slate-900/25'
    }`}>
      {/* Avatar Container */}
      <div className="flex-shrink-0 w-8 h-8 select-none">
        {isUser ? (
          <div className="w-8 h-8 rounded-xl bg-slate-200 dark:bg-slate-800 flex items-center justify-center text-slate-700 dark:text-slate-300 font-semibold text-xs shadow-sm">
            ME
          </div>
        ) : (
          <div className="w-8 h-8 rounded-xl bg-slate-950 dark:bg-white flex items-center justify-center text-white dark:text-slate-950 font-bold text-[13px] shadow-sm border border-slate-200/10 dark:border-slate-850">
            AI
          </div>
        )}
      </div>

      {/* Content Area */}
      <div className="flex-1 min-w-0 space-y-1.5 relative">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold tracking-wide text-slate-500 dark:text-slate-400 select-none">
            {isUser ? 'You' : 'AI Assistant'}
          </span>
          
          <div className="flex items-center space-x-2">
            <span className="text-[10px] text-slate-400 dark:text-slate-500 select-none font-medium">
              {formattedTime}
            </span>
            
            {/* Action Buttons (Copy) */}
            <button
              onClick={handleCopyMessage}
              title="Copy response"
              className="opacity-0 group-hover:opacity-100 p-1.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800 text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-300 transition-all duration-150 cursor-pointer"
            >
              {isCopied ? (
                <svg className="w-3.5 h-3.5 text-emerald-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M5 13l4 4L19 7" />
                </svg>
              ) : (
                <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2" />
                </svg>
              )}
            </button>
          </div>
        </div>

        {/* Message body text */}
        <div className="text-[14px] md:text-[15px] text-slate-800 dark:text-slate-200 break-words leading-relaxed">
          {renderContent(content)}
        </div>
      </div>
    </div>
  );
};
