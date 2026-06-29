'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'

interface ProductCard {
  id: string; name: string; slug: string
  price: number; originalPrice: number; discount: number
  image: string; link: string
}

interface Message {
  id: string
  role: 'user' | 'model'
  text: string
  products?: ProductCard[]
}

const ZALO_URL = 'https://zalo.me/0869308231'

const QUICK_QUESTIONS = [
  'Tôi cận 3 độ, nên chọn tròng nào?',
  'Gọng nào hợp mặt tròn?',
  'Giá kính cận bao nhiêu?',
  'Chính sách đổi trả thế nào?',
]

export default function ChatWidget() {
  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef<HTMLDivElement>(null)
  const inputRef = useRef<HTMLInputElement>(null)

  const scrollToBottom = useCallback(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [])

  useEffect(() => {
    scrollToBottom()
  }, [messages, scrollToBottom])

  useEffect(() => {
    if (isOpen && inputRef.current) {
      inputRef.current.focus()
    }
  }, [isOpen])

  const sendMessage = async (text: string) => {
    if (!text.trim() || isLoading) return

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      text: text.trim(),
    }

    const newMessages = [...messages, userMsg]
    setMessages(newMessages)
    setInput('')
    setIsLoading(true)

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newMessages.map(m => ({ role: m.role, text: m.text })),
        }),
      })

      const data = await res.json()
      const replyText = data.reply || data.error || 'Xin lỗi, đã có lỗi xảy ra ạ.'

      setMessages(prev => [
        ...prev,
        { id: (Date.now() + 1).toString(), role: 'model', text: replyText, products: data.products },
      ])
    } catch {
      setMessages(prev => [
        ...prev,
        {
          id: (Date.now() + 1).toString(),
          role: 'model',
          text: 'Dạ xin lỗi, em không kết nối được. Anh/chị nhắn Zalo 0869308231 để được tư vấn ạ.',
        },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    sendMessage(input)
  }

  return (
    <>
      {/* Floating button */}
      <AnimatePresence>
        {!isOpen && (
          <motion.button
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0, opacity: 0 }}
            onClick={() => setIsOpen(true)}
            className="fixed bottom-20 right-4 z-40 flex items-center gap-2 rounded-full bg-brand-black text-white shadow-lg hover:shadow-xl transition-shadow active:scale-95 md:bottom-6 animate-pulse-chat"
          >
            <div className="w-14 h-14 flex items-center justify-center rounded-full">
              <svg width="26" height="26" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
              </svg>
            </div>
            <span className="hidden sm:block pr-4 text-sm font-semibold whitespace-nowrap">
              Tôi Cần Tư Vấn
            </span>
          </motion.button>
        )}
      </AnimatePresence>

      {/* Chat panel */}
      <AnimatePresence>
        {isOpen && (
          <motion.div
            initial={{ opacity: 0, y: 20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
            className="fixed bottom-0 right-0 z-50 w-full h-full sm:bottom-4 sm:right-4 sm:w-[400px] sm:h-[600px] sm:max-h-[80vh] sm:rounded-2xl flex flex-col bg-white shadow-2xl overflow-hidden sm:border sm:border-brand-border"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-4 py-3 bg-brand-black text-white shrink-0">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-full bg-brand-gold flex items-center justify-center text-brand-black font-bold text-sm">
                  S
                </div>
                <div>
                  <p className="font-semibold text-sm">SONi Tư Vấn</p>
                  <p className="text-xs text-gray-300">Trả lời ngay</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-white/10 transition-colors"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="18" y1="6" x2="6" y2="18" />
                  <line x1="6" y1="6" x2="18" y2="18" />
                </svg>
              </button>
            </div>

            {/* Messages area */}
            <div className="flex-1 overflow-y-auto px-4 py-3 space-y-3 bg-gray-50">
              {messages.length === 0 && (
                <div className="space-y-3">
                  {/* Welcome message */}
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm max-w-[85%] text-sm text-brand-black">
                    Dạ chào anh/chị! 😊 Em là trợ lý tư vấn kính mắt của SONi. Anh/chị cần em hỗ trợ gì ạ?
                  </div>
                  {/* Quick questions */}
                  <div className="space-y-2">
                    <p className="text-xs text-brand-muted px-1">Câu hỏi thường gặp:</p>
                    {QUICK_QUESTIONS.map(q => (
                      <button
                        key={q}
                        onClick={() => sendMessage(q)}
                        className="block w-full text-left text-sm px-3 py-2 rounded-xl border border-brand-border bg-white hover:bg-brand-light transition-colors text-brand-black"
                      >
                        {q}
                      </button>
                    ))}
                  </div>
                </div>
              )}

              {messages.map(msg => (
                <div key={msg.id} className="space-y-2">
                  <div className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                    <div
                      className={`max-w-[85%] px-4 py-2.5 text-sm whitespace-pre-wrap ${
                        msg.role === 'user'
                          ? 'bg-brand-black text-white rounded-2xl rounded-br-sm'
                          : 'bg-white text-brand-black rounded-2xl rounded-tl-sm shadow-sm'
                      }`}
                    >
                      {msg.text}
                    </div>
                  </div>
                  {msg.products?.map(p => (
                    <div key={p.id} className="flex justify-start">
                      <a href={p.link} className="block max-w-[85%] bg-white rounded-2xl rounded-tl-sm shadow-sm overflow-hidden border border-brand-border hover:shadow-md transition-shadow">
                        {p.image && (
                          <img src={p.image} alt={p.name} className="w-full h-36 object-cover" />
                        )}
                        <div className="p-3">
                          <p className="font-semibold text-sm text-brand-black leading-tight">{p.name}</p>
                          <div className="flex items-center gap-2 mt-1.5">
                            <span className="font-bold text-red-500 text-sm">
                              {new Intl.NumberFormat('vi-VN').format(p.price)}đ
                            </span>
                            <span className="text-xs text-gray-400 line-through">
                              {new Intl.NumberFormat('vi-VN').format(p.originalPrice)}đ
                            </span>
                            <span className="text-[10px] bg-red-500 text-white px-1.5 py-0.5 rounded-full font-bold">
                              -{p.discount}%
                            </span>
                          </div>
                          <p className="text-xs text-brand-zalo font-semibold mt-2">Xem chi tiết →</p>
                        </div>
                      </a>
                    </div>
                  ))}
                </div>
              ))}

              {isLoading && (
                <div className="flex justify-start">
                  <div className="bg-white rounded-2xl rounded-tl-sm px-4 py-3 shadow-sm">
                    <div className="flex gap-1.5">
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                      <span className="w-2 h-2 bg-gray-300 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
                    </div>
                  </div>
                </div>
              )}

              <div ref={messagesEndRef} />
            </div>

            {/* Zalo escalation */}
            <a
              href={ZALO_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 px-4 py-2 bg-blue-50 text-blue-600 text-xs hover:bg-blue-100 transition-colors shrink-0"
            >
              <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 1.89.525 3.66 1.438 5.168L2 22l4.832-1.438A9.96 9.96 0 0012 22c5.523 0 10-4.477 10-10S17.523 2 12 2zm-3 7h6a1 1 0 110 2H9a1 1 0 110-2zm0 4h4a1 1 0 110 2H9a1 1 0 110-2z"/>
              </svg>
              Cần tư vấn chi tiết hơn? Nhắn Zalo cho SONi
            </a>

            {/* Input */}
            <form onSubmit={handleSubmit} className="flex items-center gap-2 px-3 py-3 border-t border-brand-border bg-white shrink-0 pb-safe">
              <input
                ref={inputRef}
                type="text"
                value={input}
                onChange={e => setInput(e.target.value)}
                placeholder="Nhập câu hỏi..."
                disabled={isLoading}
                className="flex-1 px-4 py-2.5 text-sm rounded-full border border-brand-border bg-brand-light focus:outline-none focus:border-brand-black transition-colors disabled:opacity-50"
              />
              <button
                type="submit"
                disabled={!input.trim() || isLoading}
                className="w-10 h-10 flex items-center justify-center rounded-full bg-brand-black text-white disabled:opacity-30 hover:bg-gray-800 transition-colors shrink-0"
              >
                <svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
                  <line x1="22" y1="2" x2="11" y2="13" />
                  <polygon points="22 2 15 22 11 13 2 9 22 2" />
                </svg>
              </button>
            </form>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  )
}
