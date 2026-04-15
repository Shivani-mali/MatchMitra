import { useMemo, useState } from 'react';

const BOT_RULES = {
  'how to find matches': 'Go to the Matches page from the navbar, apply filters, and browse suggested profiles.',
  'how to send interest': 'Open a profile card on the Matches page and click “Send Interest”. The status starts as pending.',
};

const ChatbotWidget = () => {
  const [query, setQuery] = useState('');
  const [history, setHistory] = useState([]);

  const suggestions = useMemo(() => Object.keys(BOT_RULES), []);

  const ask = (question) => {
    const normalized = question.trim().toLowerCase();
    const answer = BOT_RULES[normalized] || 'I can currently answer: “How to find matches?” and “How to send interest?”';

    setHistory((prev) => [...prev, { question, answer }]);
    setQuery('');
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h3 className="text-lg font-semibold text-slate-800">MatchMitra Assistant</h3>
      <p className="mt-1 text-sm text-slate-500">Ask basic help questions about using the platform.</p>

      <div className="mt-3 flex flex-wrap gap-2">
        {suggestions.map((item) => (
          <button
            key={item}
            type="button"
            onClick={() => ask(item)}
            className="rounded-full bg-indigo-50 px-3 py-1 text-xs font-medium text-indigo-700"
          >
            {item}
          </button>
        ))}
      </div>

      <form
        className="mt-4 flex gap-2"
        onSubmit={(event) => {
          event.preventDefault();
          if (!query.trim()) return;
          ask(query);
        }}
      >
        <input
          value={query}
          onChange={(event) => setQuery(event.target.value)}
          placeholder="Ask a question"
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-slate-900 px-3 py-2 text-sm font-medium text-white"
        >
          Ask
        </button>
      </form>

      <div className="mt-4 space-y-2">
        {history.slice(-3).map((item, index) => (
          <div key={`${item.question}-${index}`} className="rounded-lg bg-slate-50 p-3 text-sm">
            <p className="font-medium text-slate-700">Q: {item.question}</p>
            <p className="mt-1 text-slate-600">A: {item.answer}</p>
          </div>
        ))}
      </div>
    </section>
  );
};

export default ChatbotWidget;
