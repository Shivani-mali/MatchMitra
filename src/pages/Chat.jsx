import { useEffect, useState, useRef } from 'react';
import { collection, onSnapshot, query, where } from 'firebase/firestore';
import toast from 'react-hot-toast';
import Navbar from '../components/Navbar';
import Footer from '../components/Footer';
import { useAuth } from '../context/AuthContext';
import { db } from '../services/firebase';
import {
  getChatsForUser,
  sendImageMessage,
  sendMessage,
  sendVoiceMessage,
  subscribeToMessages,
} from '../services/firestoreService';

const AttachmentIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M21 12.5l-8.8 8.8a5 5 0 01-7.1-7.1l9.9-9.9a3.5 3.5 0 114.9 4.9l-9.9 9.9a2 2 0 11-2.8-2.8l8.4-8.4" />
  </svg>
);

const MicIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 14.5a3 3 0 003-3V6.5a3 3 0 10-6 0v5a3 3 0 003 3zm-5-3a5 5 0 0010 0m-5 5.5v3.5" />
  </svg>
);

const StopIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
    <rect x="6" y="6" width="12" height="12" rx="3" />
  </svg>
);

const KeyboardIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <rect x="3" y="6" width="18" height="12" rx="2.5" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 10h.01M10 10h.01M13 10h.01M16 10h.01M8 13h8" />
  </svg>
);

const SendIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 11 13" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M22 2 15 22l-4-9-9-4 20-7Z" />
  </svg>
);

const ChatIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M7 19.5 4 22v-3.6A8.5 8.5 0 1 1 7 19.5Z" />
  </svg>
);

const BackIcon = ({ className = '' }) => (
  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.8" className={className} aria-hidden="true">
    <path strokeLinecap="round" strokeLinejoin="round" d="M15 18 9 12l6-6" />
  </svg>
);

const ChatSkeleton = () => (
  <div className="mx-auto flex h-[calc(100vh-152px)] max-w-7xl gap-4 p-4 md:h-[calc(100vh-200px)] md:p-6">
    <div className="w-full rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:w-1/3">
      <div className="h-6 w-24 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 space-y-3">
        {[1, 2, 3, 4].map((item) => (
          <div key={item} className="flex items-center gap-3 rounded-xl p-2">
            <div className="h-10 w-10 animate-pulse rounded-full bg-slate-200" />
            <div className="flex-1 space-y-2">
              <div className="h-3 w-24 animate-pulse rounded bg-slate-200" />
              <div className="h-3 w-36 animate-pulse rounded bg-slate-100" />
            </div>
          </div>
        ))}
      </div>
    </div>
    <div className="hidden rounded-2xl border border-slate-200 bg-white p-4 shadow-sm md:block md:w-2/3">
      <div className="h-8 w-48 animate-pulse rounded bg-slate-200" />
      <div className="mt-4 space-y-3">
        {[1, 2, 3].map((item) => (
          <div key={item} className="h-16 animate-pulse rounded-2xl bg-slate-100" />
        ))}
      </div>
    </div>
  </div>
);

const Chat = () => {
  const { user } = useAuth();
  const [chats, setChats] = useState([]);
  const [selectedChatId, setSelectedChatId] = useState('');
  const [selectedProfile, setSelectedProfile] = useState(null);
  const [messages, setMessages] = useState([]);
  const [messageText, setMessageText] = useState('');
  const [sending, setSending] = useState(false);
  const [recording, setRecording] = useState(false);
  const [voiceSupported, setVoiceSupported] = useState(true);
  const [loading, setLoading] = useState(true);
  const messagesEndRef = useRef(null);
  const fileInputRef = useRef(null);
  const messageInputRef = useRef(null);
  const mediaRecorderRef = useRef(null);
  const mediaStreamRef = useRef(null);
  const audioChunksRef = useRef([]);
  const [isMobileView, setIsMobileView] = useState(false);

  // Scroll to bottom when messages change
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  useEffect(() => {
    const hasVoiceSupport = Boolean(
      navigator?.mediaDevices?.getUserMedia && window.MediaRecorder,
    );
    setVoiceSupported(hasVoiceSupport);
  }, []);

  useEffect(() => {
    const mediaQuery = window.matchMedia('(max-width: 767px)');
    const updateMobileState = (event) => {
      setIsMobileView(event.matches);
    };

    setIsMobileView(mediaQuery.matches);
    mediaQuery.addEventListener('change', updateMobileState);

    return () => {
      mediaQuery.removeEventListener('change', updateMobileState);
    };
  }, []);

  // Load chats with last messages
  useEffect(() => {
    if (!user?.uid) {
      setLoading(false);
      setChats([]);
      return;
    }

    setLoading(true);

    const chatsQuery = query(
      collection(db, 'chats'),
      where('users', 'array-contains', user.uid),
    );

    const unsubscribe = onSnapshot(
      chatsQuery,
      async () => {
        try {
          const chatsData = await getChatsForUser(user.uid);
          setChats(chatsData);
          setLoading(false);
        } catch (error) {
          console.error('Error processing chats snapshot:', error);
          toast.error('Failed to refresh chats. Please try again.');
          setLoading(false);
        }
      },
      (error) => {
        console.error('Error subscribing to chats:', error);
        toast.error('Unable to load chats right now.');
        setLoading(false);
      },
    );

    return () => unsubscribe();
  }, [user?.uid]);

  // Subscribe to messages when chat selected
  useEffect(() => {
    if (!selectedChatId || !user?.uid) {
      setMessages([]);
      return;
    }

    const unsubscribe = subscribeToMessages(selectedChatId, (msgs) => {
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [selectedChatId, user?.uid]);

  const handleSelectChat = (chat) => {
    setSelectedChatId(chat.chatId);
    setSelectedProfile(chat.otherProfile);
  };

  const handleBackToList = () => {
    setSelectedChatId('');
    setSelectedProfile(null);
    setMessages([]);
  };

  const handleSendMessage = async (e) => {
    e.preventDefault();
    if (!messageText.trim() || !user?.uid || !selectedChatId) {
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
    } catch (error) {
      console.error('Error sending message:', error);
      toast.error('Failed to send message. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const handleInputKeyDown = async (event) => {
    if (event.key === 'Enter' && !event.shiftKey) {
      event.preventDefault();
      await handleSendMessage(event);
    }
  };

  const handleImageClick = () => {
    fileInputRef.current?.click();
  };

  const handleImageSelected = async (event) => {
    const file = event.target.files?.[0];

    if (!file || !user?.uid || !selectedChatId) {
      return;
    }

    if (!file.type.startsWith('image/')) {
      toast.error('Please select a valid image file.');
      return;
    }

    setSending(true);
    try {
      await sendImageMessage({
        chatId: selectedChatId,
        senderId: user.uid,
        imageFile: file,
        caption: '',
      });
      event.target.value = '';
    } catch (error) {
      console.error('Error sending image:', error);
      toast.error('Failed to send image. Please try again.');
    } finally {
      setSending(false);
    }
  };

  const startVoiceRecording = async () => {
    if (!voiceSupported || !user?.uid || !selectedChatId) {
      return;
    }

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      mediaStreamRef.current = stream;

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;
      audioChunksRef.current = [];

      recorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        const audioFile = new File([audioBlob], `voice-${Date.now()}.webm`, {
          type: 'audio/webm',
        });

        mediaStreamRef.current?.getTracks().forEach((track) => track.stop());

        setSending(true);
        try {
          await sendVoiceMessage({
            chatId: selectedChatId,
            senderId: user.uid,
            audioFile,
          });
        } catch (error) {
          console.error('Error sending voice message:', error);
          toast.error('Failed to send voice message. Please try again.');
        } finally {
          setSending(false);
        }
      };

      recorder.start();
      setRecording(true);
    } catch (error) {
      console.error('Unable to start recording:', error);
      toast.error('Microphone access denied or unavailable.');
    }
  };

  const stopVoiceRecording = () => {
    if (mediaRecorderRef.current && mediaRecorderRef.current.state !== 'inactive') {
      mediaRecorderRef.current.stop();
      setRecording(false);
    }
  };

  const toggleVoiceRecording = async () => {
    if (recording) {
      stopVoiceRecording();
    } else {
      await startVoiceRecording();
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-slate-100">
        <Navbar />
        <ChatSkeleton />
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-100">
      <Navbar />
      
      {/* Page Header */}
      <div className="border-b border-slate-200 bg-white px-4 py-3">
        <div className="mx-auto max-w-7xl">
          <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-800">
            <ChatIcon className="h-5 w-5 text-indigo-600" />
            Chat Page
          </h2>
        </div>
      </div>

      <main className="mx-auto flex h-[calc(100vh-152px)] max-w-7xl gap-4 p-4 md:h-[calc(100vh-200px)] md:p-6">
        {/* Chat List - Left Sidebar */}
        <aside
          className={`w-full rounded-2xl border border-slate-200 bg-white shadow-sm md:w-1/3 ${
            isMobileView && selectedProfile ? 'hidden' : 'block'
          }`}
        >
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
                          {chat.lastMessage || 'No messages yet'}
                        </p>
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
        <section
          className={`w-full rounded-2xl border border-slate-200 bg-white shadow-sm md:w-2/3 ${
            isMobileView && !selectedProfile ? 'hidden' : 'block'
          }`}
        >
          {selectedProfile ? (
            <div className="flex h-full flex-col">
              {/* Chat Header */}
              <div className="border-b border-slate-200 p-4">
                <div className="flex items-center gap-3">
                  {isMobileView && (
                    <button
                      type="button"
                      onClick={handleBackToList}
                      className="inline-flex h-9 w-9 items-center justify-center rounded-full border border-slate-200 text-slate-600 transition hover:bg-slate-100"
                      aria-label="Back to chats list"
                    >
                      <BackIcon className="h-4 w-4" />
                    </button>
                  )}
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
                          {msg.messageType === 'image' && msg.mediaUrl && (
                            <img
                              src={msg.mediaUrl}
                              alt={msg.fileName || 'Shared image'}
                              className="mb-2 max-h-52 max-w-full rounded-lg object-cover"
                            />
                          )}

                          {msg.messageType === 'voice' && msg.mediaUrl && (
                            <audio controls className="mb-2 w-full max-w-55">
                              <source src={msg.mediaUrl} type="audio/webm" />
                              Your browser does not support audio playback.
                            </audio>
                          )}

                          {msg.text && <p className="text-sm whitespace-pre-wrap">{msg.text}</p>}

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
                <div className="mb-2 flex items-center gap-2">
                  <button
                    type="button"
                    onClick={handleImageClick}
                    disabled={sending}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900 disabled:opacity-50"
                    title="Attach image"
                    aria-label="Attach image"
                  >
                    <AttachmentIcon className="h-4.5 w-4.5" />
                  </button>

                  <button
                    type="button"
                    onClick={toggleVoiceRecording}
                    disabled={sending || !voiceSupported}
                    className={`inline-flex h-10 w-10 items-center justify-center rounded-full text-white transition disabled:opacity-50 ${recording ? 'bg-rose-600 hover:bg-rose-700' : 'bg-slate-800 hover:bg-slate-900'}`}
                    title={recording ? 'Stop recording and send voice note' : 'Record voice note'}
                    aria-label={recording ? 'Stop recording and send voice note' : 'Record voice note'}
                  >
                    {recording ? <StopIcon className="h-4.5 w-4.5" /> : <MicIcon className="h-4.5 w-4.5" />}
                  </button>

                  <button
                    type="button"
                    onClick={() => messageInputRef.current?.focus()}
                    className="inline-flex h-10 w-10 items-center justify-center rounded-full border border-slate-300 bg-white text-slate-600 transition hover:bg-slate-50 hover:text-slate-900"
                    title="Focus message box"
                    aria-label="Focus message box"
                  >
                    <KeyboardIcon className="h-4.5 w-4.5" />
                  </button>

                  <input
                    ref={fileInputRef}
                    type="file"
                    accept="image/*"
                    onChange={handleImageSelected}
                    className="hidden"
                  />

                  {recording && <p className="text-xs font-medium text-rose-600">Recording voice note…</p>}
                </div>

                <div className="flex gap-2">
                  <textarea
                    ref={messageInputRef}
                    placeholder="Write a message..."
                    value={messageText}
                    onChange={(e) => setMessageText(e.target.value)}
                    onKeyDown={handleInputKeyDown}
                    disabled={sending}
                    rows={1}
                    className="flex-1 resize-none rounded-2xl border border-slate-300 px-4 py-2.5 text-sm focus:border-indigo-600 focus:outline-none focus:ring-1 focus:ring-indigo-600"
                  />
                  <button
                    type="submit"
                    disabled={sending || !messageText.trim()}
                    className="inline-flex items-center gap-2 rounded-full bg-indigo-600 px-5 py-2.5 text-sm font-semibold text-white transition hover:bg-indigo-700 disabled:cursor-not-allowed disabled:opacity-50"
                  >
                    {sending ? (
                      <span className="flex items-center gap-2">
                        <span className="animate-spin">⟳</span>
                      </span>
                    ) : (
                      <>
                        <SendIcon className="h-4 w-4" />
                        <span>Send</span>
                      </>
                    )}
                  </button>
                </div>
                <p className="mt-2 text-xs text-slate-400">Press Enter to send • Shift+Enter for a new line</p>
              </form>
            </div>
          ) : (
            <div className="flex h-full items-center justify-center">
              <div className="text-center">
                <ChatIcon className="mx-auto mb-3 h-10 w-10 text-slate-300" />
                <p className="font-medium text-slate-600">Select a chat to start messaging</p>
                <p className="text-slate-400 text-sm mt-2">
                  {chats.length === 0 ? 'No active chats' : 'Choose a conversation from the list'}
                </p>
              </div>
            </div>
          )}
        </section>
      </main>
      <Footer />
    </div>
  );
};

export default Chat;
