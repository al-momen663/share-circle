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
};
export default ChatRoom;