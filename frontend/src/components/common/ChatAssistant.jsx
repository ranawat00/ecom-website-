import React, { useState, useRef, useEffect } from 'react';
import { MessageSquare, X, Send, Bot, Sparkles } from 'lucide-react';
import axios from 'axios';
import '../../assets/styles/ChatAssistant.css';

const API_BASE_URL = import.meta.env.VITE_API_URL || `${window.location.protocol}//${window.location.hostname}:5000/api`;


const ChatAssistant = () => {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');
    const [messages, setMessages] = useState([
        { role: 'ai', text: 'Welcome to MaaPoshan! I am your wellness concierge. How can I help you discover our traditional postpartum healing treasures today?' }
    ]);
    const [isLoading, setIsLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    };

    useEffect(() => {
        scrollToBottom();
    }, [messages, isLoading]);

    const handleSend = async (e, customMessage = null) => {
        if (e) e.preventDefault();
        const textToSend = customMessage || message;
        if (!textToSend.trim() || isLoading) return;

        const userMessage = { role: 'user', text: textToSend };
        setMessages(prev => [...prev, userMessage]);
        setMessage('');
        setIsLoading(true);

        try {
            const response = await axios.post(`${API_BASE_URL}/ai/chat`, {
                message: textToSend,
                history: messages
                    .filter((m, index) => index !== 0) // Skip the initial AI greeting
                    .map(m => ({
                        role: m.role === 'ai' ? 'model' : 'user',
                        parts: [{ text: m.text }]
                    }))
            });


            if (response.data.success) {
                setMessages(prev => [...prev, { role: 'ai', text: response.data.reply }]);
            } else {
                setMessages(prev => [...prev, { role: 'ai', text: response.data.reply || "I'm having a bit of a moment. Please try again!" }]);
            }
        } catch (error) {
            console.error('Chat Error:', error);
            const errorMsg = error.response?.data?.reply || error.response?.data?.message || "I'm sorry, I'm having trouble connecting to the harvest fields right now. Please check if the server is running!";
            setMessages(prev => [...prev, { 
                role: 'ai', 
                text: errorMsg
            }]);
        } finally {

            setIsLoading(false);
        }
    };

    const suggestedQuestions = [
        "What is Jaggery?",
        "Best ghee for health?",
        "Shipping options?",
        "Our pure values"
    ];

    return (
        <div className="chat-assistant-container">
            {/* Toggle Button */}
            <button 
                className="chat-bubble-toggle"
                onClick={() => setIsOpen(!isOpen)}
                aria-label="Open AI Assistant"
            >
                {isOpen ? <X /> : <MessageSquare />}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="chat-window">
                    <div className="chat-header">
                        <div className="chat-header-info">
                            <div className="chat-bot-avatar">
                                <Bot size={20} />
                            </div>
                            <div className="chat-header-text">
                                <h3>Harvest Concierge</h3>
                                <span><Sparkles size={10} style={{display:'inline', marginRight:'4px'}} /> AI Assistant</span>
                            </div>
                        </div>
                        <button className="chat-close-btn" onClick={() => setIsOpen(false)}>
                            <X size={20} />
                        </button>
                    </div>

                    <div className="chat-messages">
                        {messages.map((msg, idx) => (
                            <div key={idx} className={`chat-message message-${msg.role}`}>
                                {msg.text}
                            </div>
                        ))}
                        {isLoading && (
                            <div className="typing-indicator">
                                <span className="dot"></span>
                                <span className="dot"></span>
                                <span className="dot"></span>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {!isLoading && messages.length < 3 && (
                        <div className="suggested-questions">
                            {suggestedQuestions.map((q, i) => (
                                <button 
                                    key={i} 
                                    className="suggest-btn"
                                    onClick={() => handleSend(null, q)}
                                >
                                    {q}
                                </button>
                            ))}
                        </div>
                    )}

                    <form className="chat-input-container" onSubmit={handleSend}>
                        <input 
                            type="text" 
                            className="chat-input"
                            placeholder="Ask anything..."
                            value={message}
                            onChange={(e) => setMessage(e.target.value)}
                            disabled={isLoading}
                        />
                        <button 
                            type="submit" 
                            className="chat-send-btn"
                            disabled={!message.trim() || isLoading}
                        >
                            <Send size={18} />
                        </button>
                    </form>
                </div>
            )}
        </div>
    );
};

export default ChatAssistant;
