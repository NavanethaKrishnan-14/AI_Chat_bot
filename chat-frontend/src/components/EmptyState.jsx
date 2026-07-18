import React from 'react';

const SUGGESTIONS = [
  {
    title: 'Explain code',
    desc: 'Explain quantum computing or code optimization in simple terms.',
    prompt: 'Can you explain how quantum computing works in simple terms, or how to optimize React re-renders?',
    icon: (
      <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0014 18.469V19a2 2 0 11-4 0v-.531c0-.895-.356-1.754-.988-2.386l-.548-.547z" />
      </svg>
    ),
  },
  {
    title: 'Write a script',
    desc: 'Generate a script to fetch data or automate file backups.',
    prompt: 'Write a JavaScript node script to fetch paginated data from an API and write it to a CSV file.',
    icon: (
      <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M10 20l4-16m4 4l4 4-4 4M6 16l-4-4 4-4" />
      </svg>
    ),
  },
  {
    title: 'Design a system',
    desc: 'Brainstorm architectural designs or schemas for a SaaS.',
    prompt: 'Help me design a database schema for an AI SaaS platform that supports subscriptions and usage quotas.',
    icon: (
      <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
      </svg>
    ),
  },
  {
    title: 'Analyze workflows',
    desc: 'Evaluate pipeline logs or suggest optimization steps.',
    prompt: 'How can I optimize my CI/CD deployment pipeline to run tests in parallel and cache node_modules?',
    icon: (
      <svg className="w-5 h-5 text-slate-500 dark:text-slate-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10a2 2 0 01-2 2h-2a2 2 0 01-2-2zm9-10v12m0 0a2 2 0 01-2 2h-2a2 2 0 01-2-2m2-12a2 2 0 00-2-2h-2a2 2 0 00-2 2v12" />
      </svg>
    ),
  },
];

export const EmptyState = ({ onSelectPrompt, welcomeMessage }) => {
  return (
    <div className="flex-1 flex flex-col justify-center max-w-3xl w-full mx-auto px-4 md:px-6 py-12 select-none animate-fade-in">
      <div className="text-center mb-10">
        <div className="inline-flex p-3 rounded-2xl bg-slate-100 dark:bg-slate-800 text-slate-800 dark:text-slate-200 mb-4 border border-slate-200 dark:border-slate-700 shadow-sm">
          <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.8" d="M8 10h.01M12 10h.01M16 10h.01M9 16H5a2 2 0 01-2-2V6a2 2 0 012-2h14a2 2 0 012 2v8a2 2 0 01-2 2h-5l-5 5v-5z" />
          </svg>
        </div>
        <h2 className="text-2xl md:text-3xl font-bold tracking-tight text-slate-800 dark:text-slate-100 mb-3">
          How can I help you today?
        </h2>
        <p className="max-w-md mx-auto text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
          {welcomeMessage || "I'm your assistant, ready to help with code generation, workflow analytics, or systems design."}
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {SUGGESTIONS.map((item, idx) => (
          <button
            key={idx}
            onClick={() => onSelectPrompt(item.prompt)}
            className="flex items-start text-left p-4 rounded-xl border border-slate-200/80 dark:border-slate-800/80 bg-white/40 dark:bg-slate-900/30 hover:bg-slate-50 dark:hover:bg-slate-850 hover:border-slate-350 dark:hover:border-slate-700 cursor-pointer shadow-sm hover:shadow-md transition-all duration-200 group"
          >
            <div className="p-2 rounded-lg bg-slate-50 dark:bg-slate-800 border border-slate-100 dark:border-slate-800 group-hover:scale-105 transition-transform duration-200 mr-3.5">
              {item.icon}
            </div>
            <div className="flex-1 min-w-0">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200 mb-0.5 truncate">
                {item.title}
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 line-clamp-2 leading-relaxed">
                {item.desc}
              </p>
            </div>
          </button>
        ))}
      </div>
    </div>
  );
};
