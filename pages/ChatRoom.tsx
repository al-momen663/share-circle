import React, { useState, useEffect, useRef } from 'react';
import { useParams, Link } from 'react-router-dom';
import { 
  collection, 
  addDoc, 
  onSnapshot, 
  query, 
  where, 
  orderBy, 
  doc, 
  getDoc 
} from 'firebase/firestore';
import { db } from '../lib/firebase';
import { User, Message, Donation } from '../types';
// Import Gemini API
import { GoogleGenAI } from "@google/genai";

interface ChatRoomProps {
  user: User;
}
const ChatRoom: React.FC<ChatRoomProps> = ({ user }) => {
  const { id } = useParams<{ id: string }>();
  const [messages, setMessages] = useState<Message[]>([]);
  const [inputText, setInputText] = useState('');
  const [donation, setDonation] = useState<Donation | null>(null);
  const [suggestion, setSuggestion] = useState<string | null>(null);
  const [aiLoading, setAiLoading] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!id) return;

    // Fetch donation metadata
    getDoc(doc(db, 'donations', id)).then(snap => {
      if (snap.exists()) setDonation({ id: snap.id, ...snap.data() } as Donation);
    });

    // Real-time messages listener
    const q = query(
      collection(db, 'messages'),
      where('donationId', '==', id),
      orderBy('timestamp', 'asc')
    );

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const msgs = snapshot.docs.map(d => ({
        id: d.id,
        ...d.data()
      })) as Message[];
      setMessages(msgs);
    });

    return () => unsubscribe();
  }, [id]);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, [messages]);
    const fetchAiSuggestion = async () => {
    if (!donation) return;
    setAiLoading(true);
    try {
      
      const ai = new GoogleGenAI({ apiKey: process.env.API_KEY });
      const prompt = `You are a helpful community assistant for a donation app. 
        Donation item: ${donation.title}
        Task: Suggest a one-sentence polite and safe coordination message (e.g., asking for pickup time or confirming location).
        Context: The user is a ${user.role.toLowerCase()}.`;
      
      const response = await ai.models.generateContent({
        model: 'gemini-3-flash-preview',
        contents: prompt,
      });
      
      
      const text = response.text;
      if (text) setSuggestion(text.trim());
    } catch (error) {
      console.error("AI Suggestion error", error);
    } finally {
      setAiLoading(false);
    }
  };
  const handleSendMessage = async (e: React.FormEvent | string) => {
    if (typeof e !== 'string') e.preventDefault();
    const textToSend = typeof e === 'string' ? e : inputText;
    
    if (!textToSend.trim() || !id) return;

    try {
      await addDoc(collection(db, 'messages'), {
        donationId: id,
        senderId: user.id,
        text: textToSend,
        timestamp: Date.now()
      });
      setInputText('');
      setSuggestion(null);
    } catch (err) {
      console.error("Message send error", err);
    }
  };
  if (!donation) return <div className="p-10 text-center dark:text-white">Loading live chat...</div>;

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 h-[calc(100vh-80px)] flex flex-col transition-all">
      <div className="bg-white dark:bg-gray-800 border border-gray-100 dark:border-gray-700 rounded-t-[2.5rem] p-6 shadow-xl flex items-center justify-between z-10">
        <div className="flex items-center space-x-5">
          <Link to={`/donations/${id}`} className="p-3 bg-gray-50 dark:bg-gray-700 hover:bg-gray-100 dark:hover:bg-gray-600 rounded-2xl transition">
            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-gray-600 dark:text-gray-300" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 19l-7-7 7-7" /></svg>
          </Link>
          <div>
            <h2 className="font-black text-gray-900 dark:text-white text-xl">Coordination</h2>
            <p className="text-xs text-emerald-600 dark:text-emerald-400 font-bold uppercase tracking-widest">{donation.title}</p>
          </div>
        </div>
        <div className="hidden sm:flex items-center space-x-2 bg-emerald-50 dark:bg-emerald-950 px-4 py-2 rounded-xl">
           <span className="w-2.5 h-2.5 bg-emerald-500 rounded-full animate-pulse"></span>
           <span className="text-[10px] font-black text-emerald-700 dark:text-emerald-300 uppercase tracking-widest">Real-time Connected</span>
        </div>
      </div>

      <div 
        ref={scrollRef}
        className="flex-grow overflow-y-auto p-8 bg-gray-50 dark:bg-gray-900 space-y-6 scrollbar-hide border-x border-gray-100 dark:border-gray-800"
      >
        {messages.length === 0 ? (
          <div className="text-center py-20">
            <div className="text-5xl mb-6 grayscale opacity-30">🤝</div>
            <p className="text-gray-400 dark:text-gray-600 font-bold italic">Coordinates your meeting safely here!</p>
          </div>
        ) : (
          messages.map((msg) => (
            <div 
              key={msg.id} 
              className={`flex ${msg.senderId === user.id ? 'justify-end' : 'justify-start'}`}
            >
              <div className={`max-w-[80%] px-6 py-4 rounded-[2rem] shadow-sm transition-all ${
                msg.senderId === user.id 
                  ? 'bg-emerald-600 text-white rounded-tr-none shadow-emerald-100 dark:shadow-none' 
                  : 'bg-white dark:bg-gray-800 text-gray-800 dark:text-gray-200 rounded-tl-none border border-gray-100 dark:border-gray-700'
              }`}>
                <p className="text-sm font-medium leading-relaxed">{msg.text}</p>
                <div className={`text-[9px] mt-2 font-black uppercase tracking-widest opacity-60 text-right`}>
                  {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="px-6 py-3 bg-white dark:bg-gray-800 border-x border-gray-100 dark:border-gray-700">
        {!suggestion ? (
          <button 
            onClick={fetchAiSuggestion}
            disabled={aiLoading}
            className="text-[10px] font-black text-emerald-600 dark:text-emerald-400 uppercase tracking-widest hover:underline flex items-center"
          >
            {aiLoading ? '✨ Thinking...' : '✨ Get AI Kindness Suggestion'}
          </button>
        ) : (
          <div className="bg-emerald-50 dark:bg-emerald-950 p-3 rounded-xl border border-emerald-100 dark:border-emerald-900 flex justify-between items-center animate-in fade-in slide-in-from-bottom-2">
            <p className="text-xs text-emerald-800 dark:text-emerald-200 font-medium italic">"{suggestion}"</p>
            <div className="flex space-x-2">
              <button onClick={() => handleSendMessage(suggestion)} className="text-[10px] font-black bg-emerald-600 text-white px-3 py-1 rounded-lg">Use</button>
              <button onClick={() => setSuggestion(null)} className="text-[10px] font-black text-gray-400 px-3 py-1">Dismiss</button>
            </div>
          </div>
        )}
      </div>

      <form 
        onSubmit={handleSendMessage}
        className="bg-white dark:bg-gray-800 border-t border-gray-100 dark:border-gray-700 p-6 rounded-b-[2.5rem] shadow-2xl flex space-x-3 z-10"
      >
        <input 
          type="text" 
          placeholder="Write a message..."
          className="flex-grow px-8 py-4 bg-gray-50 dark:bg-gray-900 border-none rounded-2xl outline-none focus:ring-2 focus:ring-emerald-500 text-sm transition dark:text-white placeholder-gray-400 font-medium"
          value={inputText}
          onChange={(e) => setInputText(e.target.value)}
        />
        <button 
          type="submit"
          className="bg-emerald-600 text-white w-14 h-14 rounded-2xl flex items-center justify-center hover:bg-emerald-700 transition shadow-xl shadow-emerald-200 dark:shadow-none active:scale-95"
        >
          <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 rotate-90" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={3} d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
};
export default ChatRoom;