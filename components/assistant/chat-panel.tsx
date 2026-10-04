'use client';
import { useState, useEffect, useRef } from 'react';
import { ArrowUpRight, Send, RotateCcw } from 'lucide-react';
import { Modal } from '@/components/ui/modal';
import { getPortfolioResponse, suggestions, welcome, type ChatMessage } from '@/lib/assistant';

export function ChatPanel({ onClose, messages, setMessages }: { onClose: () => void; messages: ChatMessage[]; setMessages: React.Dispatch<React.SetStateAction<ChatMessage[]>> }) {
  const [input, setInput] = useState('');
  const [pending, setPending] = useState(false);
  const busy = useRef(false);
  const end = useRef<HTMLDivElement>(null);
  const field = useRef<HTMLInputElement>(null);
  useEffect(() => { end.current?.scrollIntoView({ behavior: 'instant', block: 'nearest' }); }, [messages, pending]);
  async function ask(question: string) {
    if (!question.trim() || busy.current) return;
    busy.current = true;
    setMessages(current => [...current, { role: 'user', content: question.trim().slice(0, 1000) }]);
    setInput(''); setPending(true);
    try {
      const answer = await getPortfolioResponse(question.trim().slice(0, 1000));
      setMessages(current => [...current, { role: 'assistant', content: answer }]);
    } finally { busy.current = false; setPending(false); field.current?.focus(); }
  }
  return <Modal label="Rifky portfolio assistant" onClose={onClose} className="chat-overlay">
    <div className="chat-header"><div className="chat-avatar glass-orb" aria-hidden="true" /><div><h2>Rifky AI</h2><span><i /> Portfolio assistant · Local mode</span></div></div>
    <div className="chat-messages" role="log" aria-label="Conversation" aria-live="polite" aria-relevant="additions">
      {messages.map((message, index) => <div className={`chat-message ${message.role}`} key={index}><span>{message.role === 'assistant' ? 'RIFKY AI' : 'YOU'}</span><p>{message.content}</p></div>)}
      {pending && <div className="chat-thinking" role="status"><span /><span /><span /><span className="sr-only">Preparing a portfolio response</span></div>}
      <div ref={end} />
    </div>
    <div className="chat-suggestions" aria-label="Suggested questions">{suggestions.map(suggestion => <button key={suggestion} onClick={() => ask(suggestion)} disabled={pending}>{suggestion}<ArrowUpRight size={12} /></button>)}</div>
    <form className="chat-input" onSubmit={event => { event.preventDefault(); void ask(input); }}>
      <input ref={field} data-autofocus value={input} onChange={event => setInput(event.target.value)} placeholder="Ask about Rifky…" aria-label="Message to portfolio assistant" maxLength={1000} />
      <button className="icon-button" type="submit" disabled={pending || !input.trim()} aria-label="Send message"><Send size={18} /></button>
    </form>
    <div className="chat-bottom"><p>Portfolio knowledge. No external AI service.</p><button className="icon-button" disabled={pending} aria-label="Reset conversation" onClick={() => setMessages([{ role: 'assistant', content: welcome }])}><RotateCcw size={14} /></button></div>
  </Modal>;
}
