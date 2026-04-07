import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";

const Icon = ({ d, size = 18, className = "" }) => (
  <svg width={size} height={size} viewBox="0 0 24 24" fill="none"
    stroke="currentColor" strokeWidth={1.8} strokeLinecap="round" strokeLinejoin="round"
    className={className}>
    <path d={d} />
  </svg>
);

const ICONS = {
  send:   "M22 2L11 13M22 2L15 22l-4-9-9-4 20-7z",
  search: "M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0",
  attach: "M21.44 11.05l-9.19 9.19a6 6 0 01-8.49-8.49l9.19-9.19a4 4 0 015.66 5.66l-9.2 9.19a2 2 0 01-2.83-2.83l8.49-8.48",
  more:   "M12 5v.01M12 12v.01M12 19v.01M12 6a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2zm0 7a1 1 0 110-2 1 1 0 010 2z",
  check2: "M20 6L9 17l-5-5",
  phone:  "M22 16.92v3a2 2 0 01-2.18 2 19.79 19.79 0 01-8.63-3.07A19.5 19.5 0 013.07 9.81 19.79 19.79 0 01.07 1.18 2 2 0 012 0h3a2 2 0 012 1.72c.127.96.361 1.903.7 2.81a2 2 0 01-.45 2.11L6.91 7.91a16 16 0 006.18 6.18l1.27-1.27a2 2 0 012.11-.45c.907.339 1.85.573 2.81.7A2 2 0 0122 16.92z",
  emoji:  "M12 22a10 10 0 110-20 10 10 0 010 20zM8 14s1.5 2 4 2 4-2 4-2M9 9h.01M15 9h.01",
};

const CONVERSATIONS = [
  {
    id: 1, name: "Precision Works Inc", role: "CNC Machining",
    avatar: "P", color: "from-emerald-400 to-teal-500",
    lastMsg: "We can deliver within 14 days at $12,400", time: "2m ago", unread: 2,
    online: true, rfq: "RFQ-2024-001",
    messages: [
      { id: 1, from: "them", text: "Hello! We received your RFQ-2024-001 for CNC Machining parts.", time: "10:00 AM" },
      { id: 2, from: "me",   text: "Thanks! Can you provide a detailed quote with lead time?", time: "10:05 AM" },
      { id: 3, from: "them", text: "Our quote is $12,400 for the full batch. We can deliver within 14 working days.", time: "10:12 AM" },
      { id: 4, from: "me",   text: "That sounds reasonable. What's the material specification?", time: "10:15 AM" },
      { id: 5, from: "them", text: "We use 6061-T6 Aluminum per your spec. We can deliver within 14 days at $12,400", time: "10:18 AM" },
    ],
  },
  {
    id: 2, name: "AluForm GmbH", role: "Investment Casting",
    avatar: "A", color: "from-blue-400 to-indigo-500",
    lastMsg: "Please review our revised quote", time: "1h ago", unread: 1,
    online: true, rfq: "RFQ-2024-002",
    messages: [
      { id: 1, from: "them", text: "Good day! We have reviewed your investment casting requirements.", time: "9:00 AM" },
      { id: 2, from: "me",   text: "Great, please send us your best pricing.", time: "9:30 AM" },
      { id: 3, from: "them", text: "Please review our revised quote", time: "9:45 AM" },
    ],
  },
  {
    id: 3, name: "MetalCraft Co", role: "Sheet Metal",
    avatar: "M", color: "from-violet-400 to-purple-500",
    lastMsg: "We have 12+ years in sheet metal fabrication", time: "3h ago", unread: 0,
    online: false, rfq: "RFQ-2024-003",
    messages: [
      { id: 1, from: "them", text: "Hi, we saw your RFQ for sheet metal. We have 12+ years of experience.", time: "7:00 AM" },
      { id: 2, from: "me",   text: "Interesting! What's your typical turnaround time?", time: "8:00 AM" },
    ],
  },
  {
    id: 4, name: "FormTech Asia", role: "Injection Molding",
    avatar: "F", color: "from-amber-400 to-orange-500",
    lastMsg: "Can we schedule a call to discuss specs?", time: "1d ago", unread: 0,
    online: false, rfq: "RFQ-2024-004",
    messages: [
      { id: 1, from: "them", text: "Hello! We specialize in high-precision injection molding.", time: "Yesterday" },
      { id: 2, from: "them", text: "Can we schedule a call to discuss specs?", time: "Yesterday" },
    ],
  },
];

export default function BuyerChat() {
  const [activeId, setActiveId] = useState(1);
  const [input, setInput]       = useState("");
  const [convos, setConvos]     = useState(CONVERSATIONS);
  const [search, setSearch]     = useState("");
  const bottomRef               = useRef(null);

  const active = convos.find(c => c.id === activeId);

  const filtered = convos.filter(c =>
    c.name.toLowerCase().includes(search.toLowerCase()) ||
    c.rfq.toLowerCase().includes(search.toLowerCase())
  );

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [activeId, active?.messages.length]);

  const sendMessage = () => {
    const text = input.trim();
    if (!text) return;
    setConvos(prev => prev.map(c =>
      c.id === activeId
        ? {
            ...c,
            lastMsg: text,
            time: "now",
            unread: 0,
            messages: [...c.messages, {
              id: Date.now(), from: "me", text,
              time: new Date().toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" }),
            }],
          }
        : c
    ));
    setInput("");
  };

  return (
    <div className="h-full flex overflow-hidden bg-background text-text">

      {/* Conversation List */}
      <div className="w-72 bg-surface border-r border-border flex flex-col shrink-0">

        <div className="px-4 py-4 border-b border-border shrink-0">
          <h2 className="font-black text-text text-base mb-3">Messages</h2>

          <div className="relative">
            <Icon d={ICONS.search} size={14}
              className="absolute left-3 top-1/2 -translate-y-1/2 text-text-muted" />
            <input
              value={search}
              onChange={e => setSearch(e.target.value)}
              placeholder="Search conversations…"
              className="w-full pl-9 pr-3 py-2 bg-surface-2 border border-border rounded-xl text-sm
              placeholder:text-text-muted focus:outline-none focus:ring-2
              focus:ring-primary/30 focus:border-primary transition"
            />
          </div>
        </div>

        <div className="flex-1 overflow-y-auto">
          {filtered.map(c => (
            <motion.button
              key={c.id}
              onClick={() => setActiveId(c.id)}
              className={`w-full flex items-start gap-3 px-4 py-3.5 border-b border-border
              text-left transition-colors
              ${activeId === c.id
                ? "bg-primary/10 border-r-2 border-r-primary"
                : "hover:bg-surface-2"
              }`}
            >
              <div className="relative shrink-0">
                <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${c.color}
                  flex items-center justify-center text-white font-black text-sm`}>
                  {c.avatar}
                </div>
                {c.online && (
                  <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3
                    bg-primary rounded-full border-2 border-surface" />
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between gap-1 mb-0.5">
                  <p className="text-sm font-bold text-text truncate">{c.name}</p>
                  <p className="text-[10px] text-text-muted shrink-0">{c.time}</p>
                </div>
                <p className="text-[10px] text-primary font-semibold mb-0.5">{c.rfq}</p>
                <p className="text-xs text-text-muted truncate">{c.lastMsg}</p>
              </div>

              {c.unread > 0 && (
                <span className="bg-primary text-white text-[10px] font-black w-5 h-5
                  rounded-full flex items-center justify-center shrink-0 mt-0.5">
                  {c.unread}
                </span>
              )}
            </motion.button>
          ))}
        </div>
      </div>

      {/* Chat Window */}
      <div className="flex-1 flex flex-col min-w-0 bg-surface-2">

        {/* Chat Header */}
        <div className="bg-surface border-b border-border px-5 py-3.5 flex items-center gap-4 shrink-0">
          <div className={`w-10 h-10 rounded-xl bg-linear-to-br ${active.color}
            flex items-center justify-center text-white font-black text-sm shrink-0`}>
            {active.avatar}
          </div>

          <div className="flex-1 min-w-0">
            <p className="font-bold text-text text-sm">{active.name}</p>
            <div className="flex items-center gap-2">
              <span className={`text-[11px] font-semibold
                ${active.online ? "text-primary" : "text-text-muted"}`}>
                {active.online ? "● Online" : "● Offline"}
              </span>
              <span className="text-border">·</span>
              <span className="text-[11px] text-text-muted">{active.rfq}</span>
            </div>
          </div>

          <button className="p-2 rounded-xl hover:bg-surface-2 transition-colors text-text-muted">
            <Icon d={ICONS.phone} size={16} />
          </button>
          <button className="p-2 rounded-xl hover:bg-surface-2 transition-colors text-text-muted">
            <Icon d={ICONS.more} size={16} />
          </button>
        </div>

        {/* Messages */}
        <div className="flex-1 overflow-y-auto px-5 py-5 space-y-3">

          <div className="flex justify-center">
            <span className="bg-primary/10 text-primary text-[11px] font-semibold px-3 py-1 rounded-full">
              Conversation about {active.rfq}
            </span>
          </div>

          {active.messages.map((msg, i) => (
            <motion.div
              key={msg.id}
              initial={{ opacity: 0, y: 8, scale: 0.97 }}
              animate={{ opacity: 1, y: 0, scale: 1 }}
              transition={{ delay: i * 0.03 }}
              className={`flex ${msg.from === "me" ? "justify-end" : "justify-start"}`}
            >
              {msg.from === "them" && (
                <div className={`w-7 h-7 rounded-lg bg-linear-to-br ${active.color}
                  flex items-center justify-center text-white font-black text-xs
                  mr-2 mt-auto shrink-0`}>
                  {active.avatar}
                </div>
              )}

              <div className="max-w-xs lg:max-w-md xl:max-w-lg">
                <div className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed
                  ${msg.from === "me"
                    ? "bg-primary text-white rounded-br-md"
                    : "bg-surface text-text border border-border rounded-bl-md"
                  }`}>
                  {msg.text}
                </div>

                <div className={`flex items-center gap-1 mt-1
                  ${msg.from === "me" ? "justify-end" : ""}`}>
                  <p className="text-[10px] text-text-muted">{msg.time}</p>
                  {msg.from === "me" &&
                    <Icon d={ICONS.check2} size={11} className="text-primary" />}
                </div>
              </div>
            </motion.div>
          ))}

          <div ref={bottomRef} />
        </div>

        {/* Input */}
        <div className="bg-surface border-t border-border px-5 py-4 shrink-0">
          <div className="flex items-center gap-3">

            <button className="p-2 rounded-xl hover:bg-surface-2 transition-colors text-text-muted shrink-0">
              <Icon d={ICONS.attach} size={18} />
            </button>

            <button className="p-2 rounded-xl hover:bg-surface-2 transition-colors text-text-muted shrink-0">
              <Icon d={ICONS.emoji} size={18} />
            </button>

            <input
              value={input}
              onChange={e => setInput(e.target.value)}
              onKeyDown={e => e.key === "Enter" && !e.shiftKey && sendMessage()}
              placeholder="Type a message… (Enter to send)"
              className="flex-1 px-4 py-2.5 bg-surface-2 border border-border rounded-xl text-sm
              placeholder:text-text-muted focus:outline-none focus:ring-2
              focus:ring-primary/30 focus:border-primary transition"
            />

            <motion.button
              whileTap={{ scale: 0.93 }}
              onClick={sendMessage}
              className="w-10 h-10 bg-primary hover:bg-primary-hover rounded-xl
              flex items-center justify-center text-white transition-colors shrink-0"
            >
              <Icon d={ICONS.send} size={16} />
            </motion.button>

          </div>
        </div>
      </div>
    </div>
  );
}