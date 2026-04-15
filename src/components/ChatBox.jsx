import { useEffect, useState } from 'react';
import { sendMessage, subscribeToMessages } from '../services/firestoreService';

const ChatBox = ({ chatId, currentUserId, peerName }) => {
  const [messages, setMessages] = useState([]);
  const [draft, setDraft] = useState('');

  useEffect(() => {
    if (!chatId) return;
    const unsubscribe = subscribeToMessages(chatId, setMessages);
    return unsubscribe;
  }, [chatId]);

  const submitMessage = async (event) => {
    event.preventDefault();
    const text = draft.trim();
    if (!text) return;

    await sendMessage({ chatId, senderId: currentUserId, text });
    setDraft('');
  };

  return (
    <section className="flex h-[70vh] flex-col rounded-2xl border border-slate-200 bg-white shadow-sm">
      <header className="border-b border-slate-200 px-4 py-3 text-sm font-semibold text-slate-700">
        Chat with {peerName || 'your match'}
      </header>

      <div className="flex-1 space-y-2 overflow-y-auto p-4">
        {messages.map((message) => {
          const own = message.senderId === currentUserId;
          return (
            <div key={message.id} className={`flex ${own ? 'justify-end' : 'justify-start'}`}>
              <div
                className={`max-w-xs rounded-2xl px-3 py-2 text-sm ${
                  own ? 'bg-indigo-600 text-white' : 'bg-slate-100 text-slate-700'
                }`}
              >
                {message.text}
              </div>
            </div>
          );
        })}
      </div>

      <form onSubmit={submitMessage} className="flex gap-2 border-t border-slate-200 p-3">
        <input
          value={draft}
          onChange={(event) => setDraft(event.target.value)}
          placeholder="Type a message..."
          className="flex-1 rounded-lg border border-slate-200 px-3 py-2 text-sm"
        />
        <button
          type="submit"
          className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-700"
        >
          Send
        </button>
      </form>
    </section>
  );
};

export default ChatBox;
