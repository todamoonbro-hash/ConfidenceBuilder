"use client";

import { useEffect, useState } from "react";

type CoachMode = "interview_simulation" | "confidence_check_in" | "quick_speaking_warmup" | "media_practice" | "impromptu_speaking";

export function RealtimeVoiceCoach({ userId = "user_001" }: { userId?: string }) {
  const [mode, setMode] = useState<CoachMode>("confidence_check_in");
  const [sessionId, setSessionId] = useState<string | undefined>();
  const [realtimeAvailable, setRealtimeAvailable] = useState(false);
  const [turns, setTurns] = useState<Array<{ role: "coach" | "user"; text: string }>>([]);
  const [summary, setSummary] = useState<{ whatWorked: string; priorityFix: string; nextDrill: string } | undefined>();
  const [error, setError] = useState<string | undefined>();
  const [isListening, setIsListening] = useState(false);
  const [supportsBrowserSpeech, setSupportsBrowserSpeech] = useState(false);

  useEffect(() => {
    setSupportsBrowserSpeech(Boolean((window as any).SpeechRecognition || (window as any).webkitSpeechRecognition));
  }, []);

  const speak = (text: string) => {
    if (typeof window === "undefined" || !window.speechSynthesis) {
      return;
    }
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 1;
    utterance.pitch = 1;
    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
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
    speak(opening.text);
  };

  const captureAndSendTurn = () => {
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
        setIsListening(false);
        return;
      }
      const coachText = String(result.coachReply ?? "");
      setTurns([...turns, { role: "user", text }, { role: "coach", text: coachText }]);
      speak(coachText);
      setIsListening(false);
    };
    recognition.onerror = () => {
      setError("Speech recognition failed. Try again or continue with recorder.");
      setIsListening(false);
    };
    recognition.onend = () => setIsListening(false);
    recognition.start();
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

      <div className="mt-3 flex flex-wrap gap-2">
        <button type="button" onClick={startSession} className="rounded-md bg-slate-900 px-3 py-2 text-sm font-medium text-white">
          Start live coaching session
        </button>
        <button
          type="button"
          onClick={captureAndSendTurn}
          disabled={!sessionId || isListening}
          className="rounded-md bg-slate-700 px-3 py-2 text-sm font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isListening ? "Listening..." : "Answer by voice"}
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
        Realtime capability: {realtimeAvailable ? "available" : "fallback mode"}  -  Browser speech: {supportsBrowserSpeech ? "available" : "unavailable"}
      </p>

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
