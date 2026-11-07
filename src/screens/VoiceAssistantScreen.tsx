import React, { useState, useEffect, useRef } from 'react';
import {
  Mic,
  MicOff,
  Send,
  Volume2,
  VolumeX,
  Compass,
  Wind,
  ArrowRight,
  Sparkles,
  MapPin,
  Brain,
  RefreshCw,
} from 'lucide-react';
import { ScreenType, VoiceMessage } from '../types';

interface VoiceAssistantScreenProps {
  onNavigate: (screen: ScreenType) => void;
}

export const VoiceAssistantScreen: React.FC<VoiceAssistantScreenProps> = ({ onNavigate }) => {
  const [messages, setMessages] = useState<VoiceMessage[]>([
    {
      id: 'm1',
      sender: 'assistant',
      text: "Hello. I'm your MotionEase voice companion powered by Gemini. You can speak or tap queries such as 'I feel nauseous', 'Find nearest rest stop', or 'Explain inner ear mismatch'.",
      timestamp: 'Just now',
    },
  ]);
  const [inputText, setInputText] = useState('');
  const [isListening, setIsListening] = useState(false);
  const [isSpeaking, setIsSpeaking] = useState(false);
  const [transcribing, setTranscribing] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const currentAudioRef = useRef<HTMLAudioElement | null>(null);
  const chatBottomRef = useRef<HTMLDivElement>(null);

  const quickQueries = [
    "I'm feeling nauseous",
    "I'm feeling dizzy",
    'Start breathing exercise',
    'Find nearest rest stop',
    'Show acupressure point',
    'Explain vestibular mismatch',
  ];

  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  useEffect(() => {
    return () => {
      if (currentAudioRef.current) {
        currentAudioRef.current.pause();
        currentAudioRef.current = null;
      }
    };
  }, []);

  const handleStartRecording = async () => {
    try {
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
        await handleTranscribeAudio(audioBlob);
      };

      mediaRecorder.start();
      setIsListening(true);
    } catch (err) {
      console.warn('Microphone error:', err);
      setIsListening(false);
    }
  };

  const handleStopRecording = () => {
    if (mediaRecorderRef.current && isListening) {
      mediaRecorderRef.current.stop();
      setIsListening(false);
    }
  };

  const handleTranscribeAudio = async (blob: Blob) => {
    setTranscribing(true);
    try {
      const reader = new FileReader();
      reader.onloadend = async () => {
        const base64Data = (reader.result as string)?.split(',')[1];
        if (!base64Data) return;

        const res = await fetch('/api/gemini/transcribe', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audioBase64: base64Data, mimeType: 'audio/webm' }),
        });

        if (res.ok) {
          const data = await res.json();
          if (data.transcript) {
            handleUserQuery(data.transcript);
          }
        }
      };
      reader.readAsDataURL(blob);
    } catch (err) {
      console.error('Transcription failed:', err);
    } finally {
      setTranscribing(false);
    }
  };

  const speakText = async (text: string) => {
    try {
      setIsSpeaking(true);
      const res = await fetch('/api/gemini/tts', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ text }),
      });

      if (res.ok) {
        const data = await res.json();
        if (data.audioBase64) {
          const audioBlob = await fetch(`data:${data.mimeType};base64,${data.audioBase64}`).then(r => r.blob());
          const audioUrl = URL.createObjectURL(audioBlob);
          const audio = new Audio(audioUrl);
          currentAudioRef.current = audio;
          audio.onended = () => setIsSpeaking(false);
          audio.onerror = () => setIsSpeaking(false);
          await audio.play();
          return;
        }
      }
    } catch (e) {
      // Fallback
    }

    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
      const utterance = new SpeechSynthesisUtterance(text);
      utterance.rate = 0.95;
      utterance.onend = () => setIsSpeaking(false);
      utterance.onerror = () => setIsSpeaking(false);
      window.speechSynthesis.speak(utterance);
    } else {
      setIsSpeaking(false);
    }
  };

  const handleUserQuery = async (query: string) => {
    if (!query.trim()) return;

    const userMsg: VoiceMessage = {
      id: `usr_${Date.now()}`,
      sender: 'user',
      text: query,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
    };

    setMessages(prev => [...prev, userMsg]);
    setInputText('');

    const q = query.toLowerCase();
    let replyText = '';
    let actionTrigger: ScreenType | undefined = undefined;

    if (q.includes('nausea') || q.includes('nauseous') || q.includes('sick')) {
      replyText =
        'Rest your head firmly back against the headrest. Aim cold air vent toward your forehead, and apply firm circular pressure 3 finger-widths above your wrist crease. Would you like to start guided breathing?';
      actionTrigger = 'relief';
    } else if (q.includes('dizzy') || q.includes('spinning') || q.includes('vertigo')) {
      replyText =
        'Fixate your eyes onto the furthest stable horizon point in front of you. Avoid looking down at books or screens. Take slow, even belly breaths.';
      actionTrigger = 'relief';
    } else if (q.includes('breath') || q.includes('relax') || q.includes('calm')) {
      replyText =
        'Starting 4-7-8 relaxing breath now. Inhale gently for 4 seconds, hold for 7, and exhale slowly for 8.';
      actionTrigger = 'relief';
    } else if (q.includes('rest') || q.includes('stop') || q.includes('pharmacy') || q.includes('map')) {
      replyText =
        'Opening Route and Rest Navigator to find scenic overlooks, fresh air parks, and nearby motion wellness supplies.';
      actionTrigger = 'maps';
    } else if (q.includes('mismatch') || q.includes('ear') || q.includes('science') || q.includes('vestibular')) {
      replyText =
        'Opening Vestibular Science Lab. Motion sickness stems from sensory mismatch between semicircular canal fluid deflection and ocular optical flow.';
      actionTrigger = 'science';
    } else if (q.includes('acupressure') || q.includes('wrist') || q.includes('point')) {
      replyText =
        'Measure three finger widths from your inner wrist crease. Press your thumb firmly into the center between the two tendons for 2 minutes.';
      actionTrigger = 'relief';
    } else if (q.includes('travel') || q.includes('mode') || q.includes('cue')) {
      replyText =
        'Travel Mode is active with visual focus cues enabled to counteract vehicle inertia.';
      actionTrigger = 'travel';
    } else {
      // General Dr. Sola query
      try {
        const res = await fetch('/api/gemini/chat', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            messages: [{ role: 'user', content: query }],
          }),
        });
        if (res.ok) {
          const data = await res.json();
          replyText = data.reply || 'Keep your head centered and relax your shoulders. Direct cold air toward your face.';
        } else {
          replyText = 'Keep your head centered, gaze at the distant horizon, and take slow rhythmic breaths.';
        }
      } catch (e) {
        replyText = 'Keep your head centered, gaze at the distant horizon, and take slow rhythmic breaths.';
      }
    }

    const botMsg: VoiceMessage = {
      id: `bot_${Date.now()}`,
      sender: 'assistant',
      text: replyText,
      timestamp: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
      actionTriggered: actionTrigger,
    };

    setMessages(prev => [...prev, botMsg]);
    speakText(replyText);
  };

  return (
    <div className="flex-1 w-full min-h-full p-4 flex flex-col justify-between text-[#252C28] dark:text-[#F3F4EF] bg-[#F3F4EF] dark:bg-[#1B221E] transition-colors font-sans">
      {/* Header with status */}
      <div className="flex items-center justify-between pb-2 border-b border-[#D8DCD5] dark:border-[#333E37]">
        <div>
          <h2 className="text-sm font-bold text-[#252C28] dark:text-white font-heading">
            Voice Companion
          </h2>
          <span className="text-[11px] text-[#557B61] dark:text-[#91A995]">
            {transcribing
              ? 'Transcribing audio with Gemini...'
              : isSpeaking
              ? 'Speaking response (TTS)...'
              : isListening
              ? 'Listening to microphone...'
              : 'Hands-Free Ready'}
          </span>
        </div>

        {isSpeaking && (
          <button
            onClick={() => {
              if (currentAudioRef.current) currentAudioRef.current.pause();
              if ('speechSynthesis' in window) window.speechSynthesis.cancel();
              setIsSpeaking(false);
            }}
            className="p-1.5 rounded-lg bg-[#E4EBE2] text-[#34483B] dark:bg-[#34483B] dark:text-white text-xs flex items-center gap-1 cursor-pointer"
          >
            <VolumeX className="w-3.5 h-3.5" />
            <span className="text-[10px]">Mute</span>
          </button>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto py-3 space-y-3">
        {messages.map(msg => {
          const isBot = msg.sender === 'assistant';
          return (
            <div key={msg.id} className={`flex flex-col ${isBot ? 'items-start' : 'items-end'}`}>
              <div
                className={`max-w-[85%] p-3.5 rounded-2xl text-xs leading-relaxed font-sans ${
                  isBot
                    ? 'bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-[#F3F4EF]'
                    : 'bg-[#34483B] text-white'
                }`}
              >
                <p>{msg.text}</p>

                {msg.actionTriggered && (
                  <button
                    onClick={() => onNavigate(msg.actionTriggered as ScreenType)}
                    className="mt-2.5 px-3 py-1.5 rounded-xl bg-[#E4EBE2] dark:bg-[#34483B] text-[#34483B] dark:text-[#E4EBE2] font-semibold text-[11px] flex items-center gap-1.5 cursor-pointer transition-colors"
                  >
                    {msg.actionTriggered === 'relief' && <Wind className="w-3.5 h-3.5" />}
                    {msg.actionTriggered === 'travel' && <Compass className="w-3.5 h-3.5" />}
                    {msg.actionTriggered === 'maps' && <MapPin className="w-3.5 h-3.5" />}
                    {msg.actionTriggered === 'science' && <Brain className="w-3.5 h-3.5" />}
                    <span>Open {msg.actionTriggered.toUpperCase()}</span>
                    <ArrowRight className="w-3 h-3 ml-auto" />
                  </button>
                )}
              </div>
              <span className="text-[10px] text-[#68746B] dark:text-[#9EACA1] mt-1 px-1">
                {msg.timestamp}
              </span>
            </div>
          );
        })}
        <div ref={chatBottomRef} />
      </div>

      {/* Query chips */}
      <div className="py-2 border-t border-[#D8DCD5] dark:border-[#333E37] overflow-x-auto flex gap-1.5 no-scrollbar">
        {quickQueries.map((q, idx) => (
          <button
            key={idx}
            onClick={() => handleUserQuery(q)}
            className="whitespace-nowrap px-2.5 py-1 rounded-full bg-white dark:bg-[#242D28] hover:bg-[#E4EBE2] text-[#252C28] dark:text-[#F3F4EF] text-[11px] border border-[#D8DCD5] dark:border-[#333E37] transition-colors shrink-0 cursor-pointer"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Mic & Input */}
      <div className="pt-2">
        <div className="flex items-center gap-2">
          <button
            onClick={isListening ? handleStopRecording : handleStartRecording}
            className={`w-11 h-11 rounded-xl flex items-center justify-center shrink-0 cursor-pointer transition-all ${
              isListening
                ? 'bg-[#B65D5D] text-white animate-pulse'
                : 'bg-[#34483B] hover:bg-[#2B3C31] text-white'
            }`}
            title={isListening ? 'Stop Recording' : 'Hold or tap to speak (Gemini Transcribe)'}
          >
            {transcribing ? (
              <RefreshCw className="w-5 h-5 animate-spin" />
            ) : isListening ? (
              <MicOff className="w-5 h-5" />
            ) : (
              <Mic className="w-5 h-5 stroke-[1.8]" />
            )}
          </button>

          <form
            onSubmit={e => {
              e.preventDefault();
              handleUserQuery(inputText);
            }}
            className="flex-1 flex gap-1.5"
          >
            <input
              type="text"
              value={inputText}
              onChange={e => setInputText(e.target.value)}
              placeholder="Ask for relief advice or speak..."
              className="flex-1 h-11 px-3 text-xs rounded-xl bg-white dark:bg-[#242D28] border border-[#D8DCD5] dark:border-[#333E37] text-[#252C28] dark:text-white focus:outline-hidden focus:border-[#34483B]"
            />
            <button
              type="submit"
              disabled={!inputText.trim()}
              className="w-11 h-11 rounded-xl bg-white dark:bg-[#242D28] text-[#252C28] dark:text-white border border-[#D8DCD5] dark:border-[#333E37] flex items-center justify-center disabled:opacity-40 cursor-pointer shrink-0"
            >
              <Send className="w-4 h-4 stroke-[1.8]" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
