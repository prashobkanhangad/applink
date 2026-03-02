import React, { useState, useEffect } from 'react';
import { useChatSocket } from '@/contexts/ChatSocketContext';

/**
 * In-app toast when a support message arrives and chat is closed.
 * Renders nothing until a new_message (from support) is received while isChatOpen is false.
 */
export function ChatNotification({ isChatOpen, onOpenChat }) {
  const { socket } = useChatSocket();
  const [toast, setToast] = useState(null);

  useEffect(() => {
    if (!socket || isChatOpen) return;
    const onNew = (payload) => {
      const msg = payload?.message;
      if (!msg || msg.from !== 'support') return;
      setToast({ id: msg.id, text: msg.text?.slice(0, 60) || 'New message from Support' });
    };
    socket.on('new_message', onNew);
    return () => socket.off('new_message', onNew);
  }, [socket, isChatOpen]);

  const handleOpen = () => {
    setToast(null);
    onOpenChat?.();
  };

  const handleDismiss = () => setToast(null);

  if (!toast) return null;

  return (
    <div className="fixed bottom-6 left-4 right-4 sm:left-auto sm:right-24 z-[99] max-w-sm animate-in fade-in slide-in-from-bottom-2 duration-300">
      <div className="bg-white border border-gray-200 rounded-xl shadow-lg p-4 flex items-start gap-3">
        <div className="w-10 h-10 rounded-full bg-gray-900 flex items-center justify-center flex-shrink-0">
          <ChatIcon className="w-5 h-5 text-white" />
        </div>
        <div className="min-w-0 flex-1">
          <p className="text-sm font-medium text-gray-900">Support</p>
          <p className="text-xs text-gray-600 mt-0.5 truncate">{toast.text}{toast.text.length >= 60 ? '…' : ''}</p>
          <div className="flex gap-2 mt-2">
            <button
              type="button"
              onClick={handleOpen}
              className="text-xs font-medium text-gray-900 bg-gray-100 hover:bg-gray-200 px-2.5 py-1.5 rounded-lg"
            >
              Open chat
            </button>
            <button
              type="button"
              onClick={handleDismiss}
              className="text-xs text-gray-500 hover:text-gray-700"
            >
              Dismiss
            </button>
          </div>
        </div>
        <button
          type="button"
          onClick={handleDismiss}
          className="p-1 rounded hover:bg-gray-100 text-gray-400"
          aria-label="Dismiss"
        >
          <CloseIcon className="w-4 h-4" />
        </button>
      </div>
    </div>
  );
}

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
