import { useEffect, useState, useRef } from 'react';
import Navbar from '../components/Navbar';
import { useAuth } from '../context/AuthContext';
import {
  createChatId,
  getChatsForUser,
  sendMessage,
  subscribeToMessages,
} from '../services/firestoreService';

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  // Load chats with last messages
  useEffect(() => {
    const loadChats = async () => {
      if (!user?.uid) {
        setLoading(false);
        return;
      }

      try {
        const chatsData = await getChatsForUser(user.uid);
        setChats(chatsData);
        console.log('Chats loaded:', chatsData);
      } catch (error) {
        console.error('Error loading chats:', error);
      } finally {
        setLoading(false);
      }
    };

    loadChats();
  }, [user?.uid]);

  // Subscribe to messages when chat selected
  useEffect(() => {
    if (!selectedChatId || !user?.uid) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(selectedChatId, (msgs) => {
      setMessages(msgs);
      console.log('Messages updated:', msgs);
    });

    return () => unsubscribe();
  }, [selectedChatId, user?.uid]);

  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.chatId);
    setSelectedProfile(chat.otherProfile);
    console.log('Selected chat:', chat);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !user?.uid || !selectedChatId) {
      console.warn('Cannot send message: missing required data');
      return;
    }

    setSending(true);
    try {
      await sendMessage({
        chatId: selectedChatId,
        senderId: user.uid,
        text: messageText.trim(),
      });
      setMessageText('');
      console.log('Message sent successfully');
    } catch (error) {
      console.error('Error sending message:', error);
      alert('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <div className="flex items-center justify-center p-6">
          <p className="text-slate-600">Loading chats...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      
      {/* Page Header */}
      <div className="border-b-4 border-orange-600 bg-orange-50 px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h2 className="text-xl font-bold text-orange-900">💬 CHAT PAGE</h2>
        </div>
      </div>

      <main className="mx-auto flex max-w-7xl gap-4 p-4 md:p-6" style={{ height: 'calc(100vh - 200px)' }}>
        {/* Chat List - Left Sidebar */}
        <aside className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm md:w-1/3">
          <div className="border-b border-slate-200 p-4">
            <h3 className="text-lg font-semibold text-slate-800">Messages</h3>
            <p className="mt-1 text-xs text-slate-500">
              {chats.length} chat{chats.length !== 1 ? 's' : ''}
            </p>
          </div>

          <div className="overflow-y-auto" style={{ height: 'calc(100% - 80px)' }}>
            {chats.length > 0 ? (
              <div className="space-y-1 p-2">
                {chats.map((chat) => (
                  <button
                    key={chat.chatId}
                    onClick={() => handleSelectChat(chat)}
                    className={`w-full rounded-lg px-3 py-3 text-left transition ${
                      selectedChatId === chat.chatId
                        ? 'border-l-4 border-indigo-600 bg-indigo-50'
                        : 'border-l-4 border-transparent hover:bg-slate-50'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <img
                        src={chat.otherProfile?.photo || '/default-avatar.png'}
                        alt={chat.otherProfile?.name}
                        className="h-12 w-12 rounded-full object-cover"
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-slate-800 truncate">
                          {chat.otherProfile?.name || 'Unknown'}
                        </p>
                        <p className="text-xs text-slate-500 truncate">
                          {chat.lastMessage?.text || 'No messages yet'}
                        </p>
                        {chat.lastMessage?.createdAt && (
                          <p className="text-xs text-slate-400 mt-1">
                            {new Date(
                              chat.lastMessage.createdAt.toDate?.() || chat.lastMessage.createdAt
                            ).toLocaleDateString()}
                          </p>
                        )}
                      </div>
                    </div>
                  </button>
                ))}
              </div>
            ) : (
              <div className="flex h-full items-center justify-center p-4">
                <p className="text-center text-sm text-slate-500">
                  No chats yet. Accept interests to start chatting!
                </p>
              </div>
            )}
          </div>
        </aside>

        {/* Chat Window - Right Side */}
        <section className="w-full rounded-2xl border border-slate-200 bg-white shadow-sm md:w-2/3">
          {selectedProfile ? (
            <div className="flex h-full flex-col">
              {/* Chat Header */}
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  <img
                    src={selectedProfile.photo || '/default-avatar.png'}
                    alt={selectedProfile.name}
                    className="h-14 w-14 rounded-full object-cover"
                  />
                  <div className="flex-1">
                    <h3 className="font-semibold text-slate-800">{selectedProfile.name}</h3>
                    <p className="text-sm text-slate-500">{selectedProfile.profession}</p>
                    <p className="text-xs text-slate-400">{selectedProfile.location}</p>
                  </div>
                </div>
              </div>

              {/* Messages Area */}
              <div className="flex-1 overflow-y-auto space-y-4 p-4">
                {messages.length > 0 ? (
                  <>
                    {messages.map((msg) => (
                      <div
                        key={msg.id}
                        className={`flex ${msg.senderId === user?.uid ? 'justify-end' : 'justify-start'}`}
                      >
                        <div
                          className={`max-w-xs rounded-2xl px-4 py-2 ${
                            msg.senderId === user?.uid
                              ? 'bg-indigo-600 text-white'
                              : 'bg-slate-100 text-slate-800'
                          }`}
                        >
                          <p className="text-sm">{msg.text}</p>
                          <p
                            className={`mt-1.5 text-xs ${
                              msg.senderId === user?.uid
                                ? 'text-indigo-100'
                                : 'text-slate-500'
                            }`}
                          >
                            {msg.createdAt
                              ? new Date(msg.createdAt.toDate?.() || msg.createdAt).toLocaleTimeString('en-US', {
                                  hour: '2-digit',
                                  minute: '2-digit',
                                })
                              : 'Just now'}
                          </p>
                        </div>
                      </div>
                    ))}
                    <div ref={messagesEndRef} />
                  </>
                ) : (
                  <div className="flex h-full items-center justify-center">
                    <div className="text-center">
                      <p className="text-sm text-slate-500">No messages yet</p>
                      <p className="text-xs text-slate-400 mt-1">Start the conversation!</p>
                    </div>
                  </div>
                )}
              </div>

              {/* Message Input */}
              <form onSubmit={handleSendMessage} className="border-t border-slate-200 p-4">
                <div className="flex gap-2">
                  <input
                    type="text"
                    placeholder="Type a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    disabled={sending}
                    className="flex-1 rounded-full border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="rounded-full bg-indigo-600 px-6 py-2.5 text-sm font-semibold text-white hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50 transition"
                  >
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⟳</span>
                      </span>
                    ) : (
                      'Send'
                    )}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <div className="text-4xl mb-3">💬</div>
                <p className="text-slate-500 font-medium">Select a chat to start messaging</p>
                <p className="text-slate-400 text-sm mt-2">
                  {chats.length === 0 ? 'No active chats' : 'Choose a conversation from the list'}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
    </div>
  );
};

export default Chat;
