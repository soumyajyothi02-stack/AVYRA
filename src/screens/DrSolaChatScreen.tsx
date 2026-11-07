import React, { useState, useRef, useEffect } from 'react';
import { Send, Mic, MicOff, Volume2, Sparkles, Brain, Stethoscope, ArrowLeft, RefreshCw, AlertCircle, Info } from 'lucide-react';
import { ScreenType, UserProfile, SymptomLog, JourneyRecord } from '../types';
import { useLanguage } from '../context/LanguageContext';

interface Message {
  id: string;
  role: 'user' | 'model';
  content: string;
  timestamp: string;
}

interface DrSolaChatScreenProps {
  onNavigate: (screen: ScreenType) => void;
  profile?: UserProfile;
  symptoms?: SymptomLog[];
  journeys?: JourneyRecord[];
}

const QUICK_PROMPTS = [
  'I feel dizzy and nauseous right now',
  'Why do winding roads cause sickness?',
  'How do I locate the P6 acupressure point?',
  'Tips for riding in the back seat',
  'Explain vestibular vs visual conflict',
];

export const DrSolaChatScreen: React.FC<DrSolaChatScreenProps> = ({
  onNavigate,
  profile,
  symptoms = [],
  journeys = [],
}) => {
  const { languageObj, openLanguageModal, t } = useLanguage();
  const [messages, setMessages] = useState<Message[]>([
    {
      id: 'welcome-1',
      role: 'model',
      content:
        'Hello, I am Dr. Sola, your vestibular wellness companion. Motion sickness happens when your inner ear fluid senses vehicle motion while your eyes fixate on a stationary interior.\n\nTake a slow, deep breath. How are you feeling right now?',
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    },
  ]);
  const [inputValue, setInputValue] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [isRecording, setIsRecording] = useState(false);
  const [audioPlayingId, setAudioPlayingId] = useState<string | null>(null);
  const [transcribing, setTranscribing] = useState(false);
  const [apiError, setApiError] = useState<string | null>(null);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, isLoading]);

  // Clean up audio on unmount
  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const handleSendMessage = async (textToSend?: string) => {
    const text = (textToSend || inputValue).trim();
    if (!text || isLoading) return;

    const userMsg: Message = {
      id: `usr-${Date.now()}`,
      role: 'user',
      content: text,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    const newHistory = [...messages, userMsg];
    setMessages(newHistory);
    setInputValue('');
    setIsLoading(true);
    setApiError(null);

    try {
      const response = await fetch('/api/gemini/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: newHistory.map(m => ({ role: m.role, content: m.content })),
          language: languageObj.name,
          userContext: {
            userName: profile?.name || 'Traveler',
            sensitivityLevel: profile?.sensitivityLevel || 'Moderate',
            triggers: profile?.triggers || ['Back seat', 'Screen reading'],
            recentTripsCount: journeys?.length || 0,
            recentSymptoms: symptoms?.slice(0, 3).map(s => s.symptoms.join(', ')) || [],
          },
        }),
      });

      if (!response.ok) {
        throw new Error(`Server returned ${response.status}`);
      }

      const data = await response.json();
      const modelMsg: Message = {
        id: `mod-${Date.now()}`,
        role: 'model',
        content: data.reply || 'Focus on a fixed point on the distant horizon and breathe slowly through your nose.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, modelMsg]);
    } catch (err: unknown) {
      const msg = err instanceof Error ? err.message : String(err);
      console.error('Chat error:', msg);
      setApiError('Unable to connect to Dr. Sola. Using offline neuro-relief suggestions.');
      // Graceful offline fallback
      const fallbackMsg: Message = {
        id: `fallback-${Date.now()}`,
        role: 'model',
        content:
          'Immediate Comfort Tip: Fix your gaze on the farthest stable point outside (horizon or tree line). Press the P6 acupressure point three finger-widths above your wrist crease. Sip cool water and keep fresh air circulating across your face.',
        timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      };
      setMessages(prev => [...prev, fallbackMsg]);
    } finally {
      setIsLoading(false);
    }
  };

  // Text-To-Speech
  const handlePlayTTS = async (text: string, msgId: string) => {
    if (audioPlayingId === msgId) {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
      setAudioPlayingId(null);
      return;
    }

    try {
      setAudioPlayingId(msgId);
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (!res.ok) throw new Error('TTS failed');
      const data = await res.json();
      if (!data.audioBase64) throw new Error('No audio received');

      const audioBlob = await fetch(`data:${data.mimeType};base64,${data.audioBase64}`).then(r => r.blob());
      const audioUrl = URL.createObjectURL(audioBlob);

      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
      }

      const audio = new Audio(audioUrl);
      currentAudioRef.current = audio;
      audio.onended = () => {
        setAudioPlayingId(null);
      };
      audio.onerror = () => {
        setAudioPlayingId(null);
      };
      await audio.play();
    } catch (err) {
      console.warn('TTS error, falling back to speech synthesis:', err);
      // Client-side Web Speech API fallback
      if ('speechSynthesis' in window) {
        window.speechSynthesis.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.rate = 0.9;
        utterance.pitch = 1.0;
        utterance.onend = () => setAudioPlayingId(null);
        utterance.onerror = () => setAudioPlayingId(null);
        window.speechSynthesis.speak(utterance);
      } else {
        setAudioPlayingId(null);
      }
    }
  };

  // Microphone Voice Transcription
  const handleStartRecording = async () => {
    try {
      setApiError(null);
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      audioChunksRef.current = [];
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = e => {
        if (e.data.size > 0) audioChunksRef.current.push(e.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, { type: 'audio/webm' });
        stream.getTracks().forEach(t => t.stop());
        await handleTranscribeBlob(audioBlob);
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error('Microphone error:', err);
      setApiError('Microphone permission required for voice transcription.');
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  };

  const handleTranscribeBlob = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string)?.split(',')[1];
        if (!base64Data) throw new Error('Failed to read audio');

        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Data, mimeType: 'audio/webm' }),
        });

        if (!res.ok) throw new Error('Transcription failed');
        const data = await res.json();
        if (data.transcript) {
          setInputValue(data.transcript);
          handleSendMessage(data.transcript);
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Transcription error:', err);
      setApiError('Voice transcription could not be completed.');
    } finally {
      setTranscribing(false);
    }
  };

  return (
    <div className="flex-1 flex flex-col bg-[#F3F4EF] dark:bg-[#1E2521] min-h-[calc(100vh-3.5rem)] text-[#252C28] dark:text-[#E4EBE2]">
      {/* Top Banner */}
      <div className="bg-white dark:bg-[#252C28] border-b border-[#D8DCD5] dark:border-[#34483B] px-4 py-3 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button
            onClick={() => onNavigate('home')}
            className="w-8 h-8 rounded-lg flex items-center justify-center text-[#68746B] dark:text-[#9EACA1] hover:bg-[#E4EBE2] dark:hover:bg-[#34483B] transition-colors cursor-pointer"
            aria-label="Back to Home"
          >
            <ArrowLeft className="w-4 h-4 stroke-[2]" />
          </button>
          <div className="w-9 h-9 rounded-xl bg-[#34483B] text-white flex items-center justify-center shadow-xs">
            <Stethoscope className="w-5 h-5 text-[#91A995]" />
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <h2 className="text-sm font-bold text-[#252C28] dark:text-white font-heading">
                Dr. Sola – Vestibular AI
              </h2>
              <span className="inline-flex items-center px-1.5 py-0.5 rounded-full text-[10px] font-semibold bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#91A995]">
                Gemini 3.8
              </span>
            </div>
            <p className="text-[11px] text-[#68746B] dark:text-[#9EACA1]">
              Neurobiology & Motion Wellness Guide
            </p>
          </div>
        </div>

        <button
          onClick={() => onNavigate('science')}
          className="text-xs font-semibold px-2.5 py-1 rounded-lg bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] hover:opacity-90 flex items-center gap-1 transition-all cursor-pointer"
        >
          <Brain className="w-3.5 h-3.5" />
          <span>BioScience</span>
        </button>
      </div>

      {apiError && (
        <div className="mx-4 mt-3 p-2.5 rounded-xl bg-[#FBF0EE] dark:bg-[#3B2828] border border-[#B65D5D]/30 flex items-center gap-2 text-xs text-[#B65D5D] dark:text-[#F3A7A7]">
          <AlertCircle className="w-4 h-4 shrink-0" />
          <span>{apiError}</span>
        </div>
      )}

      {/* Messages Scroll Area */}
      <div className="flex-1 overflow-y-auto px-4 py-4 space-y-3.5">
        {messages.map(msg => (
          <div
            key={msg.id}
            className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'}`}
          >
            <div
              className={`max-w-[85%] rounded-2xl px-4 py-3 text-xs leading-relaxed ${
                msg.role === 'user'
                  ? 'bg-[#34483B] text-white rounded-tr-xs'
                  : 'bg-white dark:bg-[#252C28] text-[#252C28] dark:text-[#E4EBE2] border border-[#D8DCD5] dark:border-[#34483B] rounded-tl-xs shadow-xs'
              }`}
            >
              {msg.role === 'model' && (
                <div className="flex items-center justify-between pb-1 mb-1 border-b border-[#D8DCD5]/60 dark:border-[#34483B] text-[10px] text-[#68746B] dark:text-[#9EACA1]">
                  <span className="font-semibold flex items-center gap-1">
                    <Sparkles className="w-3 h-3 text-[#91A995]" /> Dr. Sola
                  </span>
                  <button
                    onClick={() => handlePlayTTS(msg.content, msg.id)}
                    className="p-1 hover:text-[#34483B] dark:hover:text-white flex items-center gap-1 cursor-pointer"
                    title="Listen to soothing voice"
                  >
                    <Volume2 className={`w-3.5 h-3.5 ${audioPlayingId === msg.id ? 'text-[#557B61] animate-pulse' : ''}`} />
                    <span>{audioPlayingId === msg.id ? 'Playing...' : 'Listen'}</span>
                  </button>
                </div>
              )}
              <div className="whitespace-pre-wrap">{msg.content}</div>
              <div
                className={`text-[9px] mt-1.5 text-right ${
                  msg.role === 'user' ? 'text-white/60' : 'text-[#68746B] dark:text-[#9EACA1]'
                }`}
              >
                {msg.timestamp}
              </div>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex items-start">
            <div className="bg-white dark:bg-[#252C28] border border-[#D8DCD5] dark:border-[#34483B] rounded-2xl rounded-tl-xs px-4 py-3 text-xs text-[#68746B] dark:text-[#9EACA1] flex items-center gap-2">
              <RefreshCw className="w-3.5 h-3.5 animate-spin text-[#91A995]" />
              <span>Dr. Sola is thinking...</span>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Quick Prompts Chips */}
      <div className="px-4 py-2 overflow-x-auto flex gap-1.5 no-scrollbar bg-white/50 dark:bg-[#252C28]/50 border-t border-[#D8DCD5] dark:border-[#34483B]">
        {QUICK_PROMPTS.map((prompt, idx) => (
          <button
            key={idx}
            onClick={() => handleSendMessage(prompt)}
            disabled={isLoading}
            className="whitespace-nowrap px-2.5 py-1 rounded-full text-[11px] bg-white dark:bg-[#34483B] border border-[#D8DCD5] dark:border-[#42584A] text-[#34483B] dark:text-[#E4EBE2] hover:bg-[#E4EBE2] dark:hover:bg-[#42584A] transition-colors cursor-pointer disabled:opacity-50"
          >
            {prompt}
          </button>
        ))}
      </div>

      {/* Input Bar */}
      <div className="bg-white dark:bg-[#252C28] border-t border-[#D8DCD5] dark:border-[#34483B] p-3">
        <form
          onSubmit={e => {
            e.preventDefault();
            handleSendMessage();
          }}
          className="flex items-center gap-2"
        >
          {/* Voice Microphone Record Button */}
          <button
            type="button"
            onClick={isRecording ? handleStopRecording : handleStartRecording}
            className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all cursor-pointer ${
              isRecording
                ? 'bg-[#B65D5D] text-white animate-pulse'
                : 'bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] hover:opacity-90'
            }`}
            title={isRecording ? 'Tap to finish recording' : 'Hold or tap to speak (Gemini Transcribe)'}
          >
            {isRecording ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4" />}
          </button>

          <input
            type="text"
            value={inputValue}
            onChange={e => setInputValue(e.target.value)}
            placeholder={
              transcribing
                ? 'Transcribing your voice with Gemini...'
                : isRecording
                ? 'Listening to your voice...'
                : 'Ask Dr. Sola anything about motion comfort...'
            }
            disabled={isLoading || transcribing}
            className="flex-1 bg-[#F3F4EF] dark:bg-[#1E2521] border border-[#D8DCD5] dark:border-[#34483B] rounded-xl px-3.5 py-2 text-xs text-[#252C28] dark:text-[#E4EBE2] placeholder-[#68746B] dark:placeholder-[#9EACA1] focus:outline-hidden focus:border-[#91A995]"
          />

          <button
            type="submit"
            disabled={isLoading || !inputValue.trim()}
            className="w-10 h-10 rounded-xl bg-[#34483B] text-white flex items-center justify-center hover:bg-[#252C28] transition-colors disabled:opacity-40 cursor-pointer"
          >
            <Send className="w-4 h-4 stroke-[2]" />
          </button>
        </form>
        <p className="text-[10px] text-center text-[#68746B] dark:text-[#9EACA1] mt-1.5 leading-normal">
          <strong>Medical Notice:</strong> Supportive companion guidance only. Does not diagnose medical conditions, prescribe medication or dosages, or guarantee prevention. Seek professional medical care for severe or concerning symptoms.
        </p>
      </div>
    </div>
  );
};
