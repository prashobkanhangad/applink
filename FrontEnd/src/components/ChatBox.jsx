import React, { useState, useEffect, useRef } from 'react';
import { getChatMessages, sendChatMessage } from '@/services/appService';
import { useChatSocket } from '@/contexts/ChatSocketContext';
import { playNotificationSound } from '@/utils/notificationSound';

function formatMessageTime(iso) {
  if (!iso) return '';
  const d = new Date(iso);
  const now = new Date();
  const diffMs = now - d;
  if (diffMs < 60000) return 'Just now';
  if (diffMs < 3600000) return `${Math.floor(diffMs / 60000)}m ago`;
  if (d.toDateString() === now.toDateString()) return d.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  return d.toLocaleDateString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
}

/**
 * Chatbox – support chat with Socket.io for instant delivery, delivered/read ticks.
 */
export const ChatBox = ({ isOpen, onClose, onNewMessageFromSupport }) => {
  const { socket } = useChatSocket();
  const [input, setInput] = useState('');
  const [messages, setMessages] = useState([]);
  const [loading, setLoading] = useState(false);
  const [sending, setSending] = useState(false);
  const [error, setError] = useState(null);
  const messagesEndRef = useRef(null);

  const applyMessages = (data) => {
    const list = (data.messages || []).map((m) => ({
      id: m.id,
      from: m.from,
      text: m.text,
      time: formatMessageTime(m.time),
      deliveredAt: m.deliveredAt ?? null,
      readAt: m.readAt ?? null,
    }));
    if (list.length === 0) {
      list.push({
        id: 'welcome',
        from: 'support',
        text: 'Hi! How can we help you today?',
        time: 'Just now',
        deliveredAt: null,
        readAt: null,
      });
    }
    setMessages(list);
  };

  // Initial load when chat opens
  useEffect(() => {
    if (!isOpen) return;
    setError(null);
    setLoading(true);
    getChatMessages()
      .then(applyMessages)
      .catch((err) => setError(err.message || 'Failed to load messages'))
      .finally(() => setLoading(false));
  }, [isOpen]);

  // Socket: new_message (instant admin reply)
  useEffect(() => {
    if (!socket) return;
    const onNew = (payload) => {
      const msg = payload?.message;
      if (!msg || msg.from !== 'support') return;
      setMessages((prev) => {
        if (prev.some((m) => m.id === msg.id)) return prev;
        return [
          ...prev,
          {
            id: msg.id,
            from: 'support',
            text: msg.text,
            time: formatMessageTime(msg.time),
            deliveredAt: msg.deliveredAt ?? null,
            readAt: msg.readAt ?? null,
          },
        ];
      });
      playNotificationSound();
      if (isOpen) {
        socket.emit('mark_delivered', { messageId: msg.id });
        setTimeout(() => socket.emit('mark_read', { messageId: msg.id }), 500);
      }
      onNewMessageFromSupport?.(msg);
    };
    socket.on('new_message', onNew);
    return () => socket.off('new_message', onNew);
  }, [socket, isOpen, onNewMessageFromSupport]);

  // Socket: message_status (update ticks for user's messages – WhatsApp-style)
  useEffect(() => {
    if (!socket) return;
    const onStatus = (payload) => {
      const { messageId, status, deliveredAt, readAt } = payload || {};
      if (!messageId) return;
      setMessages((prev) =>
        prev.map((m) => {
          if (m.id !== messageId) return m;
          if (status === 'delivered') return { ...m, deliveredAt: deliveredAt ?? true };
          if (status === 'read') return { ...m, deliveredAt: deliveredAt ?? m.deliveredAt ?? true, readAt: readAt ?? true };
          return m;
        })
      );
    };
    socket.on('message_status', onStatus);
    return () => socket.off('message_status', onStatus);
  }, [socket]);

  const handleSend = (e) => {
    e.preventDefault();
    const trimmed = input.trim();
    if (!trimmed || sending) return;
    setSending(true);
    setError(null);
    sendChatMessage(trimmed)
      .then((data) => {
        const m = data.message || data;
        setMessages((prev) => [
          ...prev,
          {
            id: m.id,
            from: 'user',
            text: m.text,
            time: formatMessageTime(m.time) || 'Just now',
            deliveredAt: m.deliveredAt ?? null,
            readAt: m.readAt ?? null,
          },
        ]);
        setInput('');
      })
      .catch((err) => setError(err.message || 'Failed to send'))
      .finally(() => setSending(false));
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  return (
    <>
      {/* Backdrop */}
      <div
        className={`fixed inset-0 z-[100] transition-opacity duration-200 ${isOpen ? 'bg-black/20 lg:bg-transparent' : 'pointer-events-none opacity-0'}`}
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel - when closed: move fully off-screen (extra offset on lg for right-6) so no sliver shows */}
      <div
        className={`fixed bottom-0 right-0 top-0 lg:top-auto lg:bottom-6 lg:right-6 w-full lg:w-[380px] lg:max-h-[520px] lg:rounded-2xl bg-white border border-gray-200 shadow-2xl z-[101] flex flex-col overflow-hidden transition-all duration-200 ease-out ${isOpen ? 'translate-x-0 opacity-100' : 'translate-x-full lg:translate-x-[calc(100%+2rem)] opacity-0 pointer-events-none'}`}
        role="dialog"
        aria-label="Chat with support"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-gray-200 bg-gray-50 shrink-0">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center">
              <ChatIcon className="w-5 h-5 text-white" />
            </div>
            <div>
              <h3 className="text-sm font-semibold text-gray-900">Support</h3>
              <p className="text-xs text-gray-500">We typically reply in a few minutes</p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-2 rounded-lg hover:bg-gray-200 text-gray-500 hover:text-gray-700 transition-colors"
            aria-label="Close chat"
          >
            <CloseIcon className="w-5 h-5" />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4 min-h-[200px]">
          {error && (
            <p className="text-sm text-red-600 bg-red-50 px-3 py-2 rounded-lg">{error}</p>
          )}
          {loading ? (
            <p className="text-sm text-gray-500">Loading messages…</p>
          ) : (
          <>
          {messages.map((msg) => (
            <div
              key={msg.id}
              className={`flex ${msg.from === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-2.5 ${
                  msg.from === 'user'
                    ? 'bg-gray-900 text-white rounded-br-md'
                    : 'bg-gray-100 text-gray-900 rounded-bl-md'
                }`}
              >
                <p className="text-sm">{msg.text}</p>
                <div className="flex items-center gap-1.5 mt-1 justify-end">
                  <span className={`text-[10px] ${msg.from === 'user' ? 'text-gray-300' : 'text-gray-400'}`}>
                    {msg.time}
                  </span>
                  {msg.from === 'user' && (
                    <span className="flex items-center" title={msg.readAt ? 'Read' : msg.deliveredAt ? 'Delivered' : 'Sent'}>
                      {msg.readAt ? (
                        <DoubleTickIcon className="w-3.5 h-3.5 text-blue-300" />
                      ) : msg.deliveredAt ? (
                        <DoubleTickIcon className="w-3.5 h-3.5 text-gray-400" />
                      ) : (
                        <SingleTickIcon className="w-3.5 h-3.5 text-gray-400" />
                      )}
                    </span>
                  )}
                </div>
              </div>
            </div>
          ))}
          <div ref={messagesEndRef} />
          </>
          )}
        </div>

        {/* Input */}
        <form onSubmit={handleSend} className="p-4 border-t border-gray-200 bg-white shrink-0">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              className="flex-1 min-w-0 px-4 py-2.5 text-sm border border-gray-300 rounded-xl focus:outline-none focus:ring-2 focus:ring-gray-900 focus:border-transparent placeholder:text-gray-400"
              autoComplete="off"
            />
            <button
              type="submit"
              disabled={sending}
              className="shrink-0 w-10 h-10 rounded-xl bg-gray-900 text-white flex items-center justify-center hover:bg-black transition-colors disabled:opacity-50"
              aria-label="Send message"
            >
              <SendIcon className="w-4 h-4" />
            </button>
          </div>
        </form>
      </div>
    </>
  );
};

const ChatIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
  </svg>
);

const CloseIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
  </svg>
);

const SendIcon = ({ className }) => (
  <svg className={className} fill="none" stroke="currentColor" viewBox="0 0 24 24">
    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9 2zm0 0v-8" />
  </svg>
);

const SingleTickIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 16 15" fill="currentColor">
    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.266c.143.14.361.125.465-.033l2.046-2.77a.365.365 0 0 0-.063-.51z" />
  </svg>
);

const DoubleTickIcon = ({ className }) => (
  <svg className={className} viewBox="0 0 16 15" fill="currentColor">
    <path d="M15.01 3.316l-.478-.372a.365.365 0 0 0-.51.063L8.666 9.88a.32.32 0 0 1-.484.032l-.358-.325a.32.32 0 0 0-.484.032l-.378.48a.418.418 0 0 0 .036.54l1.32 1.266c.143.14.361.125.465-.033l2.046-2.77a.365.365 0 0 0-.063-.51zm-4.1 0l-.478-.372a.365.365 0 0 0-.51.063L4.566 9.88a.32.32 0 0 1-.484.032L1.892 7.77a.366.366 0 0 0-.516.005l-.423.433a.364.364 0 0 0 .006.514l3.255 3.185c.143.14.361.125.465-.033l2.046-2.77a.365.365 0 0 0-.063-.51z" />
  </svg>
);

export default ChatBox;
