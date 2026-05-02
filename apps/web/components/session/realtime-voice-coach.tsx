"use client";

import { useEffect, useRef, useState } from "react";
import { DEFAULT_USER_ID } from "../../lib/user";

type CoachMode = "interview_simulation" | "confidence_check_in" | "quick_speaking_warmup" | "media_practice" | "impromptu_speaking";
type CoachVoiceStyle = "natural" | "calm" | "energetic";

const MIN_AUDIO_BYTES = 1024;
const MAX_ANSWER_SECONDS = 90;

const preferredVoiceNames = [
  "Microsoft Aria",
  "Microsoft Jenny",
  "Microsoft Sonia",
  "Microsoft Libby",
  "Google UK English Female",
  "Google UK English Male",
  "Google US English",
  "Samantha",
  "Alex"
];

function selectNaturalVoice(voices: SpeechSynthesisVoice[]) {
  const englishVoices = voices.filter((voice) => voice.lang.toLowerCase().startsWith("en"));
  return (
    preferredVoiceNames
      .map((name) => englishVoices.find((voice) => voice.name.toLowerCase().includes(name.toLowerCase())))
      .find(Boolean) ??
    englishVoices.find((voice) => /natural|neural|online/i.test(voice.name)) ??
    englishVoices[0] ??
    voices[0]
  );
}

function voiceSettings(style: CoachVoiceStyle) {
  switch (style) {
    case "calm":
      return { rate: 0.86, pitch: 0.95 };
    case "energetic":
      return { rate: 0.98, pitch: 1.05 };
    case "natural":
    default:
      return { rate: 0.92, pitch: 0.98 };
  }
}

function blobToBase64(blob: Blob) {
  return new Promise<string>((resolve, reject) => {
    const reader = new FileReader();
    reader.onloadend = () => resolve(String(reader.result ?? ""));
    reader.onerror = () => reject(new Error("audio_read_failed"));
    reader.readAsDataURL(blob);
  });
}

export function RealtimeVoiceCoach({ userId = DEFAULT_USER_ID }: { userId?: string }) {
  const [mode, setMode] = useState<CoachMode>("confidence_check_in");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [realtimeAvailable, setRealtimeAvailable] = useState(false);
  const [turns, setTurns] = useState<Array<{ role: "coach" | "user"; text: string }>>([]);
  const [summary, setSummary] = useState<{ whatWorked: string; priorityFix: string; nextDrill: string } | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isListening, setIsListening] = useState(false);
  const [isRecordingAnswer, setIsRecordingAnswer] = useState(false);
  const [isTranscribingAnswer, setIsTranscribingAnswer] = useState(false);
  const [supportsBrowserSpeech, setSupportsBrowserSpeech] = useState(false);
  const [supportsAudioRecording, setSupportsAudioRecording] = useState(false);
  const [availableVoices, setAvailableVoices] = useState<SpeechSynthesisVoice[]>([]);
  const [voiceStyle, setVoiceStyle] = useState<CoachVoiceStyle>("natural");
  const [typedAnswer, setTypedAnswer] = useState("");
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const answerTimerRef = useRef<number | undefined>();

  useEffect(() => {
    setSupportsBrowserSpeech(Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
    setSupportsAudioRecording(Boolean(navigator.mediaDevices && typeof window.MediaRecorder !== "undefined"));

    if (!window.speechSynthesis) {
      return;
    }

    const loadVoices = () => setAvailableVoices(window.speechSynthesis.getVoices());
    loadVoices();
    window.speechSynthesis.onvoiceschanged = loadVoices;

    return () => {
      window.speechSynthesis.cancel();
      window.speechSynthesis.onvoiceschanged = null;
      if (answerTimerRef.current) {
        window.clearTimeout(answerTimerRef.current);
      }
      audioRef.current?.pause();
      streamRef.current?.getTracks().forEach((track) => track.stop());
    };
  }, []);

  const speakWithBrowserVoice = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    const settings = voiceSettings(voiceStyle);
    utterance.rate = settings.rate;
    utterance.pitch = settings.pitch;
    utterance.volume = 1;
    const voice = selectNaturalVoice(availableVoices);
    if (voice) {
      utterance.voice = voice;
      utterance.lang = voice.lang;
    } else {
      utterance.lang = "en-US";
    }
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  };

  const speak = async (text: string) => {
    if (!text.trim()) {
      return;
    }

    audioRef.current?.pause();
    window.speechSynthesis?.cancel();

    try {
      const response = await fetch("/session/audio/speech", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({ text, style: voiceStyle })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "tts_failed");
      }

      const mimeType = String(result.speech?.mimeType ?? "audio/mpeg");
      const audioBase64 = String(result.speech?.audioBase64 ?? "");
      if (!audioBase64) {
        throw new Error("empty_tts_audio");
      }

      const audio = new Audio(`data:${mimeType};base64,${audioBase64}`);
      audioRef.current = audio;
      await audio.play();
    } catch {
      speakWithBrowserVoice(text);
    }
  };

  const sendUserTurn = async (text: string) => {
    if (!text.trim()) {
      setError("Add an answer first.");
      return;
    }

    if (!sessionId) {
      setError("Start session first, then answer by voice.");
      return;
    }

    const response = await fetch("/session/realtime/turn", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ sessionId, userText: text })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setError(result.error ?? "Realtime turn failed");
      return;
    }
    const coachText = String(result.coachReply ?? "");
    setTurns([...turns, { role: "user", text }, { role: "coach", text: coachText }]);
    setTypedAnswer("");
    void speak(coachText);
  };

  const startSession = async () => {
    setError(undefined);
    setSummary(undefined);
    const response = await fetch("/session/realtime/start", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ userId, mode })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setError(result.error ?? "Unable to start realtime session");
      return;
    }
    setSessionId(result.session.sessionId);
    setRealtimeAvailable(Boolean(result.session.realtimeAvailable));
    const opening = { role: "coach" as const, text: result.session.openingMessage };
    setTurns([opening]);
    void speak(opening.text);
  };

  const captureWithBrowserSpeech = () => {
    if (!sessionId) {
      setError("Start session first, then answer by voice.");
      return;
    }
    const Recognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!Recognition) {
      setError("Browser speech recognition is unavailable. Use the recorder section below.");
      return;
    }

    const recognition = new Recognition();
    recognition.lang = "en-US";
    recognition.interimResults = false;
    recognition.maxAlternatives = 1;

    setIsListening(true);
    recognition.onresult = async (event: any) => {
      const text = String(event.results?.[0]?.[0]?.transcript ?? "").trim();
      if (!text) {
        setIsListening(false);
        setError("I did not catch any words. Use record answer for better recognition.");
        return;
      }
      await sendUserTurn(text);
      setIsListening(false);
    };
    recognition.onerror = (event: any) => {
      const reason = typeof event?.error === "string" ? ` (${event.error})` : "";
      setError(`Browser speech recognition failed${reason}. Use record answer for more reliable server transcription.`);
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
  };

  const stopRecordedAnswer = () => {
    if (answerTimerRef.current) {
      window.clearTimeout(answerTimerRef.current);
      answerTimerRef.current = undefined;
    }
    mediaRecorderRef.current?.stop();
  };

  const recordAnswerForTranscription = async () => {
    if (!sessionId) {
      setError("Start session first, then answer by voice.");
      return;
    }

    if (isRecordingAnswer) {
      stopRecordedAnswer();
      return;
    }

    if (!supportsAudioRecording) {
      setError("Audio recording is unavailable in this browser. Use Chrome or Edge and allow microphone access.");
      return;
    }

    setError(undefined);
    chunksRef.current = [];

    try {
      const stream = await navigator.mediaDevices.getUserMedia({
        audio: {
          echoCancellation: true,
          noiseSuppression: true,
          autoGainControl: true
        }
      });
      streamRef.current = stream;
      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        setIsRecordingAnswer(false);
        setIsTranscribingAnswer(true);
        stream.getTracks().forEach((track) => track.stop());
        streamRef.current = null;

        try {
          const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
          if (blob.size < MIN_AUDIO_BYTES) {
            setError("No audio was captured. Check the mic permission and try again.");
            return;
          }

          const audioBase64 = await blobToBase64(blob);
          const response = await fetch("/session/recordings/transcribe", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              attemptId: `rt_${sessionId}_${Date.now()}`,
              audioBase64,
              mimeType: blob.type || "audio/webm",
              fileName: `realtime-answer-${Date.now()}.webm`
            })
          });
          const result = await response.json();
          if (!response.ok || !result.ok) {
            throw new Error(result.error ?? "transcription_failed");
          }

          const text = String(result.transcript?.content ?? "").trim();
          if (!text) {
            setError("Transcription returned no words. Try again closer to the microphone.");
            return;
          }
          await sendUserTurn(text);
        } catch (recordingError) {
          setError(recordingError instanceof Error ? `Transcription failed: ${recordingError.message}` : "Transcription failed. Try again or use the recorder below.");
        } finally {
          setIsTranscribingAnswer(false);
        }
      };

      recorder.start();
      setIsRecordingAnswer(true);
      answerTimerRef.current = window.setTimeout(() => {
        stopRecordedAnswer();
      }, MAX_ANSWER_SECONDS * 1000);
    } catch (recordingError) {
      setIsRecordingAnswer(false);
      setError(
        recordingError instanceof DOMException && recordingError.name === "NotAllowedError"
          ? "Microphone access denied. Allow microphone access in the browser and try again."
          : "Unable to start microphone recording. Check the selected input device."
      );
    }
  };

  const endSession = async () => {
    if (!sessionId) {
      return;
    }
    const response = await fetch("/session/realtime/end", {
      method: "POST",
      headers: {
        "content-type": "application/json"
      },
      body: JSON.stringify({ sessionId })
    });
    const result = await response.json();
    if (!response.ok || !result.ok) {
      setError(result.error ?? "Unable to end session");
      return;
    }
    setSummary(result.summary);
    setTurns(result.transcript ?? []);
  };

  return (
    <section className="rounded-lg border border-slate-200 bg-white p-4">
      <h2 className="text-lg font-semibold text-slate-900">Realtime Voice Coach</h2>
      <p className="mt-1 text-sm text-slate-900">Live conversation practice. If realtime is unavailable, continue with turn-based coaching and recorder flow.</p>

      <label className="mt-3 block text-sm font-medium text-slate-900">
        Coaching mode
        <select value={mode} onChange={(event: { target: { value: string } }) => setMode(event.target.value as CoachMode)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900">
          <option value="interview_simulation">Interview simulation</option>
          <option value="confidence_check_in">Confidence check-in</option>
          <option value="quick_speaking_warmup">Quick speaking warmup</option>
          <option value="media_practice">Media practice</option>
          <option value="impromptu_speaking">Impromptu speaking</option>
        </select>
      </label>

      <label className="mt-3 block text-sm font-medium text-slate-900">
        Coach voice style
        <select value={voiceStyle} onChange={(event: { target: { value: string } }) => setVoiceStyle(event.target.value as CoachVoiceStyle)} className="mt-1 w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900">
          <option value="natural">Natural</option>
          <option value="calm">Calm and slower</option>
          <option value="energetic">More energetic</option>
        </select>
      </label>

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={startSession} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Start live coaching session
        </button>
        <button
          type="button"
          onClick={recordAnswerForTranscription}
          disabled={!sessionId || isTranscribingAnswer}
          className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isTranscribingAnswer ? "Transcribing..." : isRecordingAnswer ? "Stop and transcribe" : "Record answer"}
        </button>
        <button
          type="button"
          onClick={captureWithBrowserSpeech}
          disabled={!sessionId || isListening || !supportsBrowserSpeech}
          className="rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          {isListening ? "Listening..." : "Quick browser dictation"}
        </button>
        <button
          type="button"
          onClick={endSession}
          disabled={!sessionId}
          className="rounded-md bg-slate-800 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          End session + save summary
        </button>
      </div>

      <p className="mt-2 text-xs text-slate-900">
        Realtime capability: {realtimeAvailable ? "available" : "fallback mode"}  -  Server transcription: {supportsAudioRecording ? "available" : "unavailable"}  -  Browser speech: {supportsBrowserSpeech ? "available" : "unavailable"}
      </p>

      <div className="mt-3 grid gap-2">
        <textarea
          value={typedAnswer}
          onChange={(event: { target: { value: string } }) => setTypedAnswer(event.target.value)}
          rows={3}
          className="w-full rounded-md border border-slate-300 px-3 py-2 text-sm text-slate-900"
          placeholder="Type an answer if speech recognition is unavailable."
        />
        <button
          type="button"
          onClick={() => void sendUserTurn(typedAnswer.trim())}
          disabled={!sessionId || !typedAnswer.trim()}
          className="w-fit rounded-md border border-slate-300 px-3 py-2 text-sm font-medium text-slate-800 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-400"
        >
          Send typed answer
        </button>
      </div>

      {error ? <p className="mt-2 text-sm text-red-700">{error}</p> : null}

      {turns.length > 0 ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm">
          <p className="font-medium text-slate-900">Session transcript</p>
          <div className="mt-2 space-y-1 text-slate-700">
            {turns.map((turn, index) => (
              <p key={`turn_${index}`}>
                <strong>{turn.role === "coach" ? "Coach" : "You"}:</strong> {turn.text}
              </p>
            ))}
          </div>
        </div>
      ) : null}

      {summary ? (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p>
            <strong>Summary:</strong> {summary.whatWorked}
          </p>
          <p>
            <strong>Priority fix:</strong> {summary.priorityFix}
          </p>
          <p>
            <strong>Next drill:</strong> {summary.nextDrill}
          </p>
        </div>
      ) : null}
    </section>
  );
}
