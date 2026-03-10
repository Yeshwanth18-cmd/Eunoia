"use client";

import { useState, useEffect, useCallback, useRef } from "react";

// Add Speech Recognition Types since they aren't standard in lib.dom.d.ts yet
interface SpeechRecognition extends EventTarget {
    continuous: boolean;
    interimResults: boolean;
    lang: string;
    start(): void;
    stop(): void;
    abort(): void;
    onresult: (event: SpeechRecognitionEvent) => void;
    onerror: (event: SpeechRecognitionErrorEvent) => void;
    onend: () => void;
}

interface SpeechRecognitionEvent {
    resultIndex: number;
    results: SpeechRecognitionResultList;
}

interface SpeechRecognitionResultList {
    length: number;
    [index: number]: SpeechRecognitionResult;
}

interface SpeechRecognitionResult {
    isFinal: boolean;
    [index: number]: SpeechRecognitionAlternative;
}

interface SpeechRecognitionAlternative {
    transcript: string;
}

interface SpeechRecognitionErrorEvent extends Event {
    error: string;
}

type SpeechInputProps = {
    onSpeechResult: (text: string) => void;
    className?: string;
};

export default function SpeechInput({ onSpeechResult, className }: SpeechInputProps) {
    const [isListening, setIsListening] = useState(false);
    const [isSupported, setIsSupported] = useState(false);
    const [isEnabled, setIsEnabled] = useState(true); // Default to true, check config later

    useEffect(() => {
        // Check browser support
        if ('webkitSpeechRecognition' in window || 'SpeechRecognition' in window) {
            setIsSupported(true);
        }

        // Check system config
        fetch('/api/config')
            .then(res => res.json())
            .then(data => {
                if (data.voiceEnabled === false) setIsEnabled(false);
            })
            .catch(() => { }); // Default to true on error
    }, []);

    const recognitionRef = useRef<SpeechRecognition | null>(null);

    useEffect(() => {
        return () => {
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        };
    }, []);

    const toggleListening = useCallback(() => {
        if (!isSupported || !isEnabled) return;

        if (isListening) {
            setIsListening(false);
            if (recognitionRef.current) {
                recognitionRef.current.stop();
            }
        } else {
            setIsListening(true);

            // Define SpeechRecognition interface if not available globally (simplified for this context)
            const SpeechRecognition = (window as unknown as { SpeechRecognition: new () => SpeechRecognition; webkitSpeechRecognition: new () => SpeechRecognition }).SpeechRecognition || (window as unknown as { webkitSpeechRecognition: new () => SpeechRecognition }).webkitSpeechRecognition;

            if (!SpeechRecognition) return;

            const recognition = new SpeechRecognition();
            recognitionRef.current = recognition;

            recognition.continuous = true;
            recognition.interimResults = true;
            recognition.lang = "en-US";

            recognition.onresult = (event: SpeechRecognitionEvent) => {
                let finalTranscript = "";
                for (let i = event.resultIndex; i < event.results.length; ++i) {
                    if (event.results[i].isFinal) {
                        finalTranscript += event.results[i][0].transcript + " ";
                    }
                }
                if (finalTranscript) {
                    onSpeechResult(finalTranscript);
                }
            };

            recognition.onerror = (event: SpeechRecognitionErrorEvent) => {
                console.error("Speech error", event);
                if (event.error === 'not-allowed') {
                    setIsListening(false);
                }
            };

            recognition.onend = () => {
                setIsListening(false);
            };

            recognition.start();
        }
    }, [isListening, isSupported, isEnabled, onSpeechResult]);

    if (!isSupported || !isEnabled) return null;

    return (
        <button
            onClick={toggleListening}
            className={`p-3 rounded-full transition-all ${isListening ? "bg-red-500 text-white animate-pulse" : "bg-surface-hover text-muted-foreground hover:text-primary"} ${className}`}
            title="Voice to Text"
        >
            {isListening ? "⏹️" : "🎙️"}
        </button>
    );
}
