import { post } from 'aws-amplify/api';
import { fetchAuthSession } from 'aws-amplify/auth';
import { useEffect, useRef, useState } from 'react';
import ReactMarkdown from 'react-markdown';

export default function AIChat({ messages, setMessages }) {
    const [input, setInput] = useState('');
    const [loading, setLoading] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => { messagesEndRef.current?.scrollIntoView({ behavior: "smooth" }); };

    // Scroll on mount and when messages change
    useEffect(scrollToBottom, [messages]);

    const handleSend = async (e) => {
        e.preventDefault();
        if (!input.trim()) return;

        const userMsg = { role: 'user', content: input };
        setMessages(prev => [...prev, userMsg]);
        setInput('');
        setLoading(true);

        try {
            const authToken = (await fetchAuthSession()).tokens?.idToken?.toString();
            const response = await post({
                apiName: 'ExpenseTrackerAPI', path: '/chat',
                options: { headers: { Authorization: authToken }, body: { query: userMsg.content } }
            }).response;
            const data = await response.body.json();

            setMessages(prev => [...prev, { role: 'assistant', content: data.response }]);
        } catch (error) {
            setMessages(prev => [...prev, { role: 'assistant', content: "Sorry, I encountered an error." }]);
        }
        setLoading(false);
    };

    return (
        <div className="bg-white rounded-xl shadow-md border border-slate-200 h-[600px] flex flex-col">
            <div className="p-4 border-b border-slate-100 bg-slate-50 rounded-t-xl">
                <h2 className="text-xl font-bold text-slate-800 flex items-center gap-2">
                    🤖 DompetHub Financial Advisor <span className="text-xs bg-blue-100 text-blue-600 px-2 py-0.5 rounded-full">Beta</span>
                </h2>
            </div>

            <div className="flex-grow overflow-y-auto p-4 space-y-4">
                {messages.map((msg, idx) => (
                    <div key={idx} className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                        <div className={`max-w-[85%] p-3.5 rounded-2xl text-sm leading-relaxed ${msg.role === 'user' ? 'bg-blue-600 text-white rounded-br-none' : 'bg-slate-100 text-slate-800 rounded-bl-none'}`}>
                            <ReactMarkdown
                                components={{
                                    p: ({ node, ...props }) => <p className="mb-2 last:mb-0" {...props} />,
                                    ul: ({ node, ...props }) => <ul className="list-disc ml-4 mb-2" {...props} />,
                                    ol: ({ node, ...props }) => <ol className="list-decimal ml-4 mb-2" {...props} />,
                                    li: ({ node, ...props }) => <li className="mb-1" {...props} />,
                                    strong: ({ node, ...props }) => <span className="font-bold" {...props} />,
                                }}
                            >
                                {msg.content}
                            </ReactMarkdown>
                        </div>
                    </div>
                ))}
                {loading && (
                    <div className="flex justify-start">
                        <div className="bg-slate-100 p-3 rounded-2xl rounded-bl-none flex gap-1 items-center h-10">
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-75"></span>
                            <span className="w-2 h-2 bg-slate-400 rounded-full animate-bounce delay-150"></span>
                        </div>
                    </div>
                )}
                <div ref={messagesEndRef} />
            </div>

            <form onSubmit={handleSend} className="p-4 border-t border-slate-100 flex gap-2">
                <input
                    value={input}
                    onChange={e => setInput(e.target.value)}
                    placeholder="Ask about your finances..."
                    className="flex-grow p-3 border border-slate-300 rounded-xl focus:ring-2 focus:ring-blue-500 outline-none transition-shadow"
                    disabled={loading}
                />
                <button type="submit" disabled={loading} className="p-3 bg-blue-600 text-white rounded-xl hover:bg-blue-700 disabled:bg-slate-300 transition-colors shadow-sm">
                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" /></svg>
                </button>
            </form>
        </div>
    );
}