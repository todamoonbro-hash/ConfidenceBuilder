"use client";

import { useEffect, useMemo, useRef, useState } from "react";

type SaveState = "idle" | "saving" | "saved" | "error";
type SkillBranch = "confidence" | "articulation" | "reading" | "impromptu" | "listening" | "executive" | "media" | "presentation" | "storytelling" | "persuasion";

type VoiceRecorderProps = {
  userId?: string;
  skillBranch?: SkillBranch;
  initialSessionId?: string;
  initialExerciseId?: string;
  drillId?: string;
  drillInstruction?: string;
  drillExamplePhrase?: string;
  drillTargetFocus?: string;
  drillDifficultyLevel?: string;
  mediaMode?: boolean;
  mediaKeyMessages?: string[];
  soundbiteOriginalAnswer?: string;
  soundbiteTargetText?: string;
  crisisMode?: boolean;
  crisisQuestion?: string;
  readingMode?: boolean;
  readingPassageId?: string;
  readingSourceText?: string;
  impromptuMode?: boolean;
  impromptuPrompt?: string;
  impromptuTargetSeconds?: 30 | 60 | 90 | 120;
  listeningMode?: boolean;
  listeningPrompt?: {
    id: string;
    drillType: string;
    promptText: string;
    expectedFocus: string[];
    expectedTone?: string;
  };
  executiveMode?: boolean;
  executiveSimulation?: {
    mode: string;
    style: string;
    openingQuestion: string;
    scenarioBrief: string;
  };
};

const formatDuration = (seconds: number) => {
  const mins = Math.floor(seconds / 60)
    .toString()
    .padStart(2, "0");
  const secs = Math.floor(seconds % 60)
    .toString()
    .padStart(2, "0");
  return `${mins}:${secs}`;
};

export function VoiceRecorder({
  userId = "user_001",
  skillBranch = "confidence",
  initialSessionId = "sess_001",
  initialExerciseId = "ex_art_001",
  drillId,
  drillInstruction,
  drillExamplePhrase,
  drillTargetFocus,
  drillDifficultyLevel,
  mediaMode = false,
  mediaKeyMessages = [],
  soundbiteOriginalAnswer,
  soundbiteTargetText,
  crisisMode = false,
  crisisQuestion,
  readingMode = false,
  readingPassageId,
  readingSourceText,
  impromptuMode = false,
  impromptuPrompt,
  impromptuTargetSeconds = 60,
  listeningMode = false,
  listeningPrompt,
  executiveMode = false,
  executiveSimulation
}: VoiceRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [permissionError, setPermissionError] = useState<string | undefined>();
  const [playbackUrl, setPlaybackUrl] = useState<string | undefined>();
  const [durationSeconds, setDurationSeconds] = useState(0);
  const [attemptId, setAttemptId] = useState<string | undefined>();
  const [saveState, setSaveState] = useState<SaveState>("idle");
  const [saveMessage, setSaveMessage] = useState<string>("Record an attempt to save metadata.");
  const [transcriptText, setTranscriptText] = useState<string>("");
  const [isTranscribing, setIsTranscribing] = useState(false);
  const [transcriptionError, setTranscriptionError] = useState<string | undefined>();
  const [isGeneratingFeedback, setIsGeneratingFeedback] = useState(false);
  const [feedbackError, setFeedbackError] = useState<string | undefined>();
  const [feedbackSummary, setFeedbackSummary] = useState<
    | {
        whatWorked: string;
        whatWeakened: string;
        priorityFix: string;
        retryInstruction: string;
        totalScore: number;
      }
    | undefined
  >();
  const [selfRating, setSelfRating] = useState(3);
  const [articulationHeuristic, setArticulationHeuristic] = useState<
    | {
        total: number;
        awardedXp: number;
        label: string;
        factors: Record<string, number>;
      }
    | undefined
  >();
  const [isScoringArticulation, setIsScoringArticulation] = useState(false);
  const [articulationError, setArticulationError] = useState<string | undefined>();
  const [mediaCalmnessRating, setMediaCalmnessRating] = useState(3);
  const [mediaScore, setMediaScore] = useState<
    | {
        total: number;
        awardedXp: number;
        scores: Record<string, number>;
      }
    | undefined
  >();
  const [mediaScoreError, setMediaScoreError] = useState<string | undefined>();
  const [isScoringMedia, setIsScoringMedia] = useState(false);
  const [soundbiteScore, setSoundbiteScore] = useState<{ brevity: number; clarity: number; memorability: number; xp: number } | undefined>();
  const [soundbiteError, setSoundbiteError] = useState<string | undefined>();
  const [isScoringSoundbite, setIsScoringSoundbite] = useState(false);
  const [crisisEvaluation, setCrisisEvaluation] = useState<
    | {
        total: number;
        oneFix: string;
        shouldRetry: boolean;
        improvement?: { delta: number; summary: string };
        scores: Record<string, number>;
      }
    | undefined
  >();
  const [previousCrisisTranscript, setPreviousCrisisTranscript] = useState<string | undefined>();
  const [isEvaluatingCrisis, setIsEvaluatingCrisis] = useState(false);
  const [crisisError, setCrisisError] = useState<string | undefined>();
  const [readingEvaluation, setReadingEvaluation] = useState<
    | {
        total: number;
        awardedXp: number;
        comparison: {
          skippedWords: string[];
          repeatedWords: string[];
          substitutions: Array<{ expected: string; actual: string }>;
          accuracyScore: number;
        };
        feedback: { pacing: string; pauses: string; fluency: string; expression: string; recovery: string };
        metrics: { wordsPerMinute: number };
      }
    | undefined
  >();
  const [isEvaluatingReading, setIsEvaluatingReading] = useState(false);
  const [readingError, setReadingError] = useState<string | undefined>();
  const [impromptuEvaluation, setImpromptuEvaluation] = useState<
    | {
        total: number;
        retryInstruction: string;
        shouldRetry: boolean;
        scores: Record<string, number>;
        diagnostics: { fillerWordCount: number };
        improvement?: { delta: number; summary: string };
        xpAward: number;
      }
    | undefined
  >();
  const [previousImpromptuTranscript, setPreviousImpromptuTranscript] = useState<string | undefined>();
  const [isEvaluatingImpromptu, setIsEvaluatingImpromptu] = useState(false);
  const [impromptuError, setImpromptuError] = useState<string | undefined>();
  const [listeningEvaluation, setListeningEvaluation] = useState<
    | {
        total: number;
        awardedXp: number;
        scores: Record<string, number>;
        feedback: Record<string, string>;
        diagnostics: { matchedFocusCount: number; expectedFocusCount: number };
      }
    | undefined
  >();
  const [isEvaluatingListening, setIsEvaluatingListening] = useState(false);
  const [listeningError, setListeningError] = useState<string | undefined>();
  const [executiveEvaluation, setExecutiveEvaluation] = useState<
    | {
        total: number;
        shouldRetry: boolean;
        followUpQuestion: string;
        structureCoaching: string;
        improvedAnswerSuggestion: string;
        scores: Record<string, number>;
        improvement?: { delta: number; summary: string };
        xpAward: number;
      }
    | undefined
  >();
  const [previousExecutiveTranscript, setPreviousExecutiveTranscript] = useState<string | undefined>();
  const [isEvaluatingExecutive, setIsEvaluatingExecutive] = useState(false);
  const [executiveError, setExecutiveError] = useState<string | undefined>();

  const [sessionId, setSessionId] = useState(initialSessionId);
  const [exerciseId, setExerciseId] = useState(initialExerciseId);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  const chunksRef = useRef<Blob[]>([]);
  const startedAtRef = useRef<string | undefined>();
  const stopTimestampRef = useRef<string | undefined>();
  const timerRef = useRef<number | undefined>();
  const autoStopRef = useRef<number | undefined>();
  const elapsedRef = useRef(0);
  const recordedBlobRef = useRef<Blob | undefined>();

  useEffect(() => {
    setSessionId(initialSessionId);
    setExerciseId(initialExerciseId);
  }, [initialSessionId, initialExerciseId]);

  useEffect(() => {
    return () => {
      if (timerRef.current) {
        window.clearInterval(timerRef.current);
      }
      if (autoStopRef.current) {
        window.clearTimeout(autoStopRef.current);
      }
      if (playbackUrl) {
        URL.revokeObjectURL(playbackUrl);
      }
      streamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
    };
  }, [playbackUrl]);

  const supportsMediaRecorder = typeof window !== "undefined" && !!window.MediaRecorder;

  const statusText = useMemo(() => {
    if (permissionError) {
      return permissionError;
    }

    if (isRecording) {
      return "Recording live…";
    }

    return "Ready. Press start to begin.";
  }, [isRecording, permissionError]);

  const startRecording = async () => {
    if (!supportsMediaRecorder) {
      setPermissionError("This browser does not support audio recording with MediaRecorder.");
      return;
    }

    setPermissionError(undefined);
    setSaveState("idle");
    setSaveMessage("Recording live…");
    setTranscriptionError(undefined);

    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      streamRef.current = stream;
      chunksRef.current = [];
      elapsedRef.current = 0;
      setDurationSeconds(0);
      startedAtRef.current = new Date().toISOString();

      const recorder = new MediaRecorder(stream);
      mediaRecorderRef.current = recorder;

      recorder.ondataavailable = (event: BlobEvent) => {
        if (event.data.size > 0) {
          chunksRef.current.push(event.data);
        }
      };

      recorder.onstop = async () => {
        if (autoStopRef.current) {
          window.clearTimeout(autoStopRef.current);
          autoStopRef.current = undefined;
        }
        const blob = new Blob(chunksRef.current, { type: recorder.mimeType || "audio/webm" });
        recordedBlobRef.current = blob;

        if (playbackUrl) {
          URL.revokeObjectURL(playbackUrl);
        }

        const newPlaybackUrl = URL.createObjectURL(blob);
        setPlaybackUrl(newPlaybackUrl);

        const stoppedAt = stopTimestampRef.current ?? new Date().toISOString();
        const startedAt = startedAtRef.current ?? stoppedAt;
        const computedDuration = Math.max(0, Math.round((Date.parse(stoppedAt) - Date.parse(startedAt)) / 1000));

        setDurationSeconds(computedDuration);
        setSaveState("saving");
        setSaveMessage("Saving attempt metadata...");

        try {
          const response = await fetch("/session/recordings/save", {
            method: "POST",
            headers: {
              "content-type": "application/json"
            },
            body: JSON.stringify({
              attemptId,
              sessionId,
              exerciseId,
              durationSeconds: computedDuration,
              mimeType: blob.type || "audio/webm",
              blobSizeBytes: blob.size,
              startedAt,
              stoppedAt
            })
          });

          const result = await response.json();

          if (!response.ok || !result.ok) {
            throw new Error(result.error ?? "Failed to save attempt metadata");
          }

          setAttemptId(result.attempt.id);
          setSaveState("saved");
          setSaveMessage(`Saved attempt ${result.attempt.id} (${formatDuration(computedDuration)}).`);
        } catch (error) {
          setSaveState("error");
          setSaveMessage(error instanceof Error ? error.message : "Failed to save attempt metadata");
        }

        streamRef.current?.getTracks().forEach((track: MediaStreamTrack) => track.stop());
        streamRef.current = null;
      };

      recorder.start();
      setIsRecording(true);

      timerRef.current = window.setInterval(() => {
        elapsedRef.current += 1;
        setDurationSeconds(elapsedRef.current);
      }, 1000);
      if (impromptuMode && impromptuTargetSeconds > 0) {
        autoStopRef.current = window.setTimeout(() => {
          stopRecording();
        }, impromptuTargetSeconds * 1000);
      }
    } catch (error) {
      setPermissionError(
        error instanceof DOMException && error.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone permission and try again."
          : "Unable to start recording. Check browser microphone permissions."
      );
      setIsRecording(false);
    }
  };

  const evaluateImpromptu = async () => {
    if (!attemptId || !transcriptText || !impromptuPrompt) {
      setImpromptuError("Generate a prompt, record, and transcribe before evaluating.");
      return;
    }

    setIsEvaluatingImpromptu(true);
    setImpromptuError(undefined);
    try {
      const response = await fetch("/session/impromptu/evaluate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          attemptId,
          prompt: impromptuPrompt,
          transcript: transcriptText,
          durationSeconds,
          targetSeconds: impromptuTargetSeconds,
          previousTranscript: previousImpromptuTranscript
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Impromptu evaluation failed");
      }
      setImpromptuEvaluation(result.evaluation);
      if (result.evaluation.shouldRetry) {
        setPreviousImpromptuTranscript(transcriptText);
      }
    } catch (error) {
      setImpromptuError(error instanceof Error ? error.message : "Impromptu evaluation failed");
    } finally {
      setIsEvaluatingImpromptu(false);
    }
  };

  const evaluateCrisis = async () => {
    if (!attemptId || !transcriptText || !crisisQuestion) {
      setCrisisError("Complete a crisis response recording first.");
      return;
    }

    setIsEvaluatingCrisis(true);
    setCrisisError(undefined);

    try {
      const response = await fetch("/session/media/crisis/evaluate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          attemptId,
          question: crisisQuestion,
          transcript: transcriptText,
          previousTranscript: previousCrisisTranscript
        })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Crisis evaluation failed");
      }

      setCrisisEvaluation(result.evaluation);
      if (result.evaluation.shouldRetry) {
        setPreviousCrisisTranscript(transcriptText);
      }
    } catch (error) {
      setCrisisError(error instanceof Error ? error.message : "Crisis evaluation failed");
    } finally {
      setIsEvaluatingCrisis(false);
    }
  };

  const evaluateListening = async () => {
    if (!attemptId || !transcriptText || !listeningPrompt) {
      setListeningError("Start a listening drill, then record and transcribe first.");
      return;
    }

    setIsEvaluatingListening(true);
    setListeningError(undefined);
    try {
      const response = await fetch("/session/listening/evaluate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          attemptId,
          prompt: listeningPrompt,
          transcript: transcriptText,
          durationSeconds
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Listening evaluation failed");
      }
      setListeningEvaluation(result.evaluation);
    } catch (error) {
      setListeningError(error instanceof Error ? error.message : "Listening evaluation failed");
    } finally {
      setIsEvaluatingListening(false);
    }
  };

  const evaluateExecutive = async () => {
    if (!attemptId || !transcriptText || !executiveSimulation) {
      setExecutiveError("Start an executive simulation, then record and transcribe first.");
      return;
    }

    setIsEvaluatingExecutive(true);
    setExecutiveError(undefined);
    try {
      const response = await fetch("/session/executive/evaluate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          attemptId,
          mode: executiveSimulation.mode,
          style: executiveSimulation.style,
          question: executiveEvaluation?.followUpQuestion ?? executiveSimulation.openingQuestion,
          transcript: transcriptText,
          previousTranscript: previousExecutiveTranscript
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Executive evaluation failed");
      }
      setExecutiveEvaluation(result.evaluation);
      if (result.evaluation.shouldRetry) {
        setPreviousExecutiveTranscript(transcriptText);
      }
    } catch (error) {
      setExecutiveError(error instanceof Error ? error.message : "Executive evaluation failed");
    } finally {
      setIsEvaluatingExecutive(false);
    }
  };

  const scoreSoundbite = async () => {
    if (!attemptId || !transcriptText || !soundbiteOriginalAnswer || !soundbiteTargetText) {
      setSoundbiteError("Create a target soundbite first, then complete a practice attempt.");
      return;
    }

    setIsScoringSoundbite(true);
    setSoundbiteError(undefined);

    try {
      const response = await fetch("/session/media/soundbite/score", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          attemptId,
          originalAnswer: soundbiteOriginalAnswer,
          practiceTranscript: transcriptText,
          targetSoundbite: soundbiteTargetText,
          selfRating: mediaCalmnessRating
        })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Soundbite scoring failed");
      }

      setSoundbiteScore({
        brevity: result.soundbite.scores.brevity,
        clarity: result.soundbite.scores.clarity,
        memorability: result.soundbite.scores.memorability,
        xp: result.awardedXp
      });
    } catch (error) {
      setSoundbiteError(error instanceof Error ? error.message : "Soundbite scoring failed");
    } finally {
      setIsScoringSoundbite(false);
    }
  };

  const evaluateReading = async () => {
    if (!attemptId || !transcriptText || !readingPassageId) {
      setReadingError("Complete a reading attempt and transcript first.");
      return;
    }

    setIsEvaluatingReading(true);
    setReadingError(undefined);
    try {
      const response = await fetch("/session/reading/evaluate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          attemptId,
          passageId: readingPassageId,
          transcript: transcriptText,
          durationSeconds
        })
      });
      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Reading evaluation failed");
      }
      setReadingEvaluation(result.evaluation);
    } catch (error) {
      setReadingError(error instanceof Error ? error.message : "Reading evaluation failed");
    } finally {
      setIsEvaluatingReading(false);
    }
  };

  const scoreMedia = async () => {
    if (!attemptId || !transcriptText || !drillId) {
      setMediaScoreError("Complete attempt + transcript first.");
      return;
    }

    setIsScoringMedia(true);
    setMediaScoreError(undefined);

    try {
      const response = await fetch("/session/media/score", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          attemptId,
          drillId,
          transcript: transcriptText,
          durationSeconds,
          selfCalmnessRating: mediaCalmnessRating,
          keyMessages: mediaKeyMessages
        })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Media scoring failed");
      }

      setMediaScore(result.heuristic);
    } catch (error) {
      setMediaScoreError(error instanceof Error ? error.message : "Media scoring failed");
    } finally {
      setIsScoringMedia(false);
    }
  };

  const transcribeRecording = async () => {
    if (!recordedBlobRef.current || !attemptId) {
      setTranscriptionError("Record audio first so it can be transcribed.");
      return;
    }

    setIsTranscribing(true);
    setTranscriptionError(undefined);

    try {
      const audioBase64 = await new Promise<string>((resolve, reject) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          const result = reader.result;
          if (typeof result === "string") {
            resolve(result);
            return;
          }

          reject(new Error("audio_encoding_failed"));
        };
        reader.onerror = () => reject(new Error("audio_encoding_failed"));
        reader.readAsDataURL(recordedBlobRef.current as Blob);
      });

      const response = await fetch("/session/recordings/transcribe", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          attemptId,
          audioBase64,
          mimeType: recordedBlobRef.current.type || "audio/webm",
          fileName: `${attemptId}.webm`
        })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Transcription failed");
      }

      setTranscriptText(result.transcript.content ?? "");
    } catch (error) {
      setTranscriptionError(error instanceof Error ? error.message : "Transcription failed");
    } finally {
      setIsTranscribing(false);
    }
  };

  const generateFeedback = async () => {
    if (!attemptId) {
      setFeedbackError("Save an attempt before generating feedback.");
      return;
    }

    setIsGeneratingFeedback(true);
    setFeedbackError(undefined);

    try {
      const response = await fetch("/session/feedback/generate", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          attemptId,
          userId,
          skillBranch
        })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Feedback generation failed");
      }

      setFeedbackSummary({
        whatWorked: result.feedback.whatWorked,
        whatWeakened: result.feedback.whatWeakened,
        priorityFix: result.feedback.priorityFix,
        retryInstruction: result.feedback.retryInstruction,
        totalScore: result.score.total
      });
    } catch (error) {
      setFeedbackError(error instanceof Error ? error.message : "Feedback generation failed");
    } finally {
      setIsGeneratingFeedback(false);
    }
  };

  const scoreArticulation = async () => {
    if (!drillId || !attemptId || !transcriptText) {
      setArticulationError("Complete recording + transcript first.");
      return;
    }

    setIsScoringArticulation(true);
    setArticulationError(undefined);

    try {
      const response = await fetch("/session/articulation/score", {
        method: "POST",
        headers: {
          "content-type": "application/json"
        },
        body: JSON.stringify({
          userId,
          attemptId,
          drillId,
          transcript: transcriptText,
          durationSeconds,
          selfRating
        })
      });

      const result = await response.json();
      if (!response.ok || !result.ok) {
        throw new Error(result.error ?? "Articulation scoring failed");
      }

      setArticulationHeuristic(result.heuristic);
    } catch (error) {
      setArticulationError(error instanceof Error ? error.message : "Articulation scoring failed");
    } finally {
      setIsScoringArticulation(false);
    }
  };

  const stopRecording = () => {
    if (!mediaRecorderRef.current || mediaRecorderRef.current.state !== "recording") {
      return;
    }

    stopTimestampRef.current = new Date().toISOString();
    mediaRecorderRef.current.stop();
    mediaRecorderRef.current = null;
    setIsRecording(false);

    if (timerRef.current) {
      window.clearInterval(timerRef.current);
      timerRef.current = undefined;
    }
    if (autoStopRef.current) {
      window.clearTimeout(autoStopRef.current);
      autoStopRef.current = undefined;
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Recorder and feedback</h2>
      <p className="mt-1 text-sm text-slate-600">Record once, review quickly, and apply one improvement on your retry.</p>
      {drillInstruction ? (
        <div className="mt-3 rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
          <p>
            <strong>Instruction:</strong> {drillInstruction}
          </p>
          <p className="mt-1">
            <strong>Example phrase:</strong> {drillExamplePhrase}
          </p>
          <p className="mt-1">
            <strong>Target focus:</strong> {drillTargetFocus} · <strong>Difficulty:</strong> {drillDifficultyLevel}
          </p>
        </div>
      ) : null}

      <div className="mt-4 grid gap-3 sm:grid-cols-2">
        <label className="grid gap-1 text-sm text-slate-700">
          Session ID
          <input
            value={sessionId}
            onChange={(event: { target: { value: string } }) => setSessionId(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>

        <label className="grid gap-1 text-sm text-slate-700">
          Exercise ID
          <input
            value={exerciseId}
            onChange={(event: { target: { value: string } }) => setExerciseId(event.target.value)}
            className="rounded-md border border-slate-300 px-3 py-2"
          />
        </label>
      </div>

      <div className="mt-4 grid grid-cols-1 gap-2 sm:grid-cols-2">
        <button
          type="button"
          onClick={startRecording}
          disabled={isRecording}
          className="min-h-12 rounded-lg bg-slate-900 px-4 py-3 text-base font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
        >
          Start recording now
        </button>
        <button
          type="button"
          onClick={stopRecording}
          disabled={!isRecording}
          className="min-h-12 rounded-lg bg-slate-200 px-4 py-3 text-base font-medium text-slate-900 disabled:cursor-not-allowed disabled:bg-slate-100 disabled:text-slate-500"
        >
          Stop and save draft
        </button>
      </div>

      <div className="mt-4 rounded-md bg-slate-50 p-3 text-sm text-slate-700">
        <p>{statusText}</p>
        <p className="mt-1 font-medium">Duration: {formatDuration(durationSeconds)}</p>
        {attemptId ? <p className="mt-1">Linked attempt: {attemptId}</p> : null}
      </div>
      <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3 text-sm text-slate-700">
        <p className="font-medium text-slate-900">Next action</p>
        <p className="mt-1">{!attemptId ? "Record first, then transcribe." : !transcriptText ? "Transcribe this attempt." : !feedbackSummary ? "Generate feedback and pick one fix." : "Apply the priority fix and record one retry."}</p>
      </div>

      {playbackUrl ? (
        <div className="mt-4">
          <p className="mb-2 text-sm font-medium text-slate-800">Playback</p>
          <audio controls src={playbackUrl} className="w-full" />
        </div>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={transcribeRecording}
          disabled={isTranscribing || !attemptId}
          className="min-h-12 rounded-lg bg-indigo-600 px-4 py-3 text-base font-medium text-white disabled:cursor-not-allowed disabled:bg-indigo-300"
        >
          {isTranscribing ? "Transcribing..." : "Transcribe recording"}
        </button>
      </div>

      {transcriptionError ? <p className="mt-3 text-sm text-red-700">{transcriptionError}</p> : null}
      {transcriptText ? (
        <div className="mt-3 rounded-md border border-slate-200 bg-slate-50 p-3">
          <p className="text-sm font-medium text-slate-800">Transcript</p>
          <p className="mt-1 text-sm text-slate-700">{transcriptText}</p>
        </div>
      ) : null}

      <div className="mt-4">
        <button
          type="button"
          onClick={generateFeedback}
          disabled={isGeneratingFeedback || !transcriptText}
          className="min-h-12 rounded-lg bg-emerald-600 px-4 py-3 text-base font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
        >
          {isGeneratingFeedback ? "Generating feedback..." : "Generate focused feedback"}
        </button>
      </div>

      {feedbackError ? <p className="mt-3 text-sm text-red-700">{feedbackError}</p> : null}
      {feedbackSummary ? (
        <div className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-semibold">Executive coach feedback (score: {feedbackSummary.totalScore})</p>
          <p className="mt-2">
            <strong>Worked:</strong> {feedbackSummary.whatWorked}
          </p>
          <p className="mt-1">
            <strong>Weakened:</strong> {feedbackSummary.whatWeakened}
          </p>
          <p className="mt-1">
            <strong>Priority fix:</strong> {feedbackSummary.priorityFix}
          </p>
          <p className="mt-1">
            <strong>Retry:</strong> {feedbackSummary.retryInstruction}
          </p>
        </div>
      ) : null}

      {drillId ? (
        <div className="mt-4 rounded-md border border-orange-200 bg-orange-50 p-3 text-sm text-orange-900">
          <p className="font-medium">Articulation coaching heuristic (not phoneme-precise analysis)</p>
          <label className="mt-2 block">
            Self-rating (1-5)
            <input
              type="range"
              min={1}
              max={5}
              value={selfRating}
              onChange={(event: { target: { value: string } }) => setSelfRating(Number(event.target.value))}
              className="mt-1 w-full"
            />
          </label>
          <p className="mt-1">Current self-rating: {selfRating}</p>
          <button
            type="button"
            onClick={scoreArticulation}
            disabled={isScoringArticulation || !transcriptText}
            className="mt-2 min-h-10 rounded-lg bg-orange-600 px-3 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-orange-300"
          >
            {isScoringArticulation ? "Scoring articulation..." : "Score articulation + award XP"}
          </button>
          {articulationError ? <p className="mt-2 text-red-700">{articulationError}</p> : null}
          {articulationHeuristic ? (
            <p className="mt-2">
              Score: {articulationHeuristic.total} · XP awarded: {articulationHeuristic.awardedXp}
            </p>
          ) : null}
        </div>
      ) : null}

      {mediaMode ? (
        <div className="mt-4 rounded-md border border-sky-200 bg-sky-50 p-3 text-sm text-sky-900">
          <p className="font-medium">Media coaching heuristic (not a definitive behavioral assessment)</p>
          <p className="mt-1 text-xs">Key messages: {mediaKeyMessages.length > 0 ? mediaKeyMessages.join(" | ") : "none saved"}</p>
          <label className="mt-2 block">
            Calmness self-rating (1-5)
            <input
              type="range"
              min={1}
              max={5}
              value={mediaCalmnessRating}
              onChange={(event: { target: { value: string } }) => setMediaCalmnessRating(Number(event.target.value))}
              className="mt-1 w-full"
            />
          </label>
          <button
            type="button"
            onClick={scoreMedia}
            disabled={isScoringMedia || !transcriptText}
            className="mt-2 min-h-10 rounded-lg bg-sky-600 px-3 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-sky-300"
          >
            {isScoringMedia ? "Scoring media performance..." : "Score media performance + award XP"}
          </button>
          {mediaScoreError ? <p className="mt-2 text-red-700">{mediaScoreError}</p> : null}
          {mediaScore ? (
            <p className="mt-2">
              Total: {mediaScore.total} · XP: {mediaScore.awardedXp} · Message control: {mediaScore.scores.messageControl}
            </p>
          ) : null}

          {soundbiteTargetText ? (
            <div className="mt-3 border-t border-sky-200 pt-3">
              <p className="text-xs">Practice target: {soundbiteTargetText}</p>
              <button
                type="button"
                onClick={scoreSoundbite}
                disabled={isScoringSoundbite || !transcriptText}
                className="mt-2 min-h-10 rounded-lg bg-sky-800 px-3 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-sky-300"
              >
                {isScoringSoundbite ? "Scoring soundbite..." : "Score soundbite delivery + award XP"}
              </button>
              {soundbiteError ? <p className="mt-2 text-red-700">{soundbiteError}</p> : null}
              {soundbiteScore ? (
                <p className="mt-2">
                  Brevity {soundbiteScore.brevity} · Clarity {soundbiteScore.clarity} · Memorability {soundbiteScore.memorability} · XP{" "}
                  {soundbiteScore.xp}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {readingMode ? (
        <div className="mt-4 rounded-md border border-indigo-200 bg-indigo-50 p-3 text-sm text-indigo-900">
          <p className="font-medium">Reading evaluation</p>
          <p className="mt-1 text-xs">Transcript will be compared against the selected source text.</p>
          <button
            type="button"
            onClick={evaluateReading}
            disabled={isEvaluatingReading || !transcriptText}
            className="mt-2 min-h-10 rounded-lg bg-indigo-700 px-3 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-indigo-300"
          >
            {isEvaluatingReading ? "Evaluating reading..." : "Compare transcript + score fluency"}
          </button>
          {readingError ? <p className="mt-2 text-red-700">{readingError}</p> : null}
          {readingEvaluation ? (
            <div className="mt-2 text-xs">
              <p>
                Reading score: {readingEvaluation.total} · XP: {readingEvaluation.awardedXp} · WPM: {readingEvaluation.metrics.wordsPerMinute}
              </p>
              <p>Accuracy: {readingEvaluation.comparison.accuracyScore}</p>
              <p>Skipped words: {readingEvaluation.comparison.skippedWords.join(", ") || "none"}</p>
              <p>Repeated words: {readingEvaluation.comparison.repeatedWords.join(", ") || "none"}</p>
              <p>
                Substitutions:{" "}
                {readingEvaluation.comparison.substitutions.length > 0
                  ? readingEvaluation.comparison.substitutions.map((item) => `${item.expected}→${item.actual}`).join(", ")
                  : "none"}
              </p>
              <p className="mt-1">Pacing: {readingEvaluation.feedback.pacing}</p>
              <p>Pauses: {readingEvaluation.feedback.pauses}</p>
              <p>Fluency: {readingEvaluation.feedback.fluency}</p>
              <p>Expression: {readingEvaluation.feedback.expression}</p>
              <p>Recovery: {readingEvaluation.feedback.recovery}</p>
            </div>
          ) : null}
          {readingSourceText ? <p className="mt-2 text-[11px] text-indigo-800">Source length: {readingSourceText.split(/\s+/).filter(Boolean).length} words</p> : null}
        </div>
      ) : null}

      {impromptuMode ? (
        <div className="mt-4 rounded-md border border-violet-200 bg-violet-50 p-3 text-sm text-violet-900">
          <p className="font-medium">Impromptu evaluation</p>
          <p className="mt-1 text-xs">Target timer: {impromptuTargetSeconds}s {impromptuPrompt ? "· prompt loaded" : ""}</p>
          <button
            type="button"
            onClick={evaluateImpromptu}
            disabled={isEvaluatingImpromptu || !transcriptText}
            className="mt-2 min-h-10 rounded-lg bg-violet-700 px-3 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-violet-300"
          >
            {isEvaluatingImpromptu ? "Evaluating impromptu answer..." : "Evaluate impromptu answer + retry drill"}
          </button>
          {impromptuError ? <p className="mt-2 text-red-700">{impromptuError}</p> : null}
          {impromptuEvaluation ? (
            <div className="mt-2 text-xs">
              <p>
                Total: {impromptuEvaluation.total} · XP: {impromptuEvaluation.xpAward} · Fillers: {impromptuEvaluation.diagnostics.fillerWordCount}
              </p>
              <p>Retry instruction: {impromptuEvaluation.retryInstruction}</p>
              <p>Retry needed: {impromptuEvaluation.shouldRetry ? "Yes" : "No"}</p>
              <p>
                Clarity {impromptuEvaluation.scores.clarity} · Structure {impromptuEvaluation.scores.structure} · Confidence{" "}
                {impromptuEvaluation.scores.confidence}
              </p>
              <p>
                Brevity {impromptuEvaluation.scores.brevity} · Filler words {impromptuEvaluation.scores.fillerWords} · Completeness{" "}
                {impromptuEvaluation.scores.answerCompleteness}
              </p>
              {impromptuEvaluation.improvement ? <p>Improvement: +{impromptuEvaluation.improvement.delta} · {impromptuEvaluation.improvement.summary}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {listeningMode ? (
        <div className="mt-4 rounded-md border border-emerald-200 bg-emerald-50 p-3 text-sm text-emerald-900">
          <p className="font-medium">Listening alignment evaluation</p>
          <p className="mt-1 text-xs">Scores summary accuracy, relevance, alignment, concision, and tone recognition.</p>
          <button
            type="button"
            onClick={evaluateListening}
            disabled={isEvaluatingListening || !transcriptText}
            className="mt-2 min-h-10 rounded-lg bg-emerald-700 px-3 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-emerald-300"
          >
            {isEvaluatingListening ? "Evaluating listening response..." : "Evaluate listening response + award XP"}
          </button>
          {listeningError ? <p className="mt-2 text-red-700">{listeningError}</p> : null}
          {listeningEvaluation ? (
            <div className="mt-2 text-xs">
              <p>Total: {listeningEvaluation.total} · XP: {listeningEvaluation.awardedXp}</p>
              <p>
                Summary {listeningEvaluation.scores.summaryAccuracy} · Relevance {listeningEvaluation.scores.relevance} · Alignment{" "}
                {listeningEvaluation.scores.answerAlignment}
              </p>
              <p>
                Concision {listeningEvaluation.scores.concision} · Tone recognition {listeningEvaluation.scores.toneRecognition}
              </p>
              <p>
                Focus matches: {listeningEvaluation.diagnostics.matchedFocusCount}/{listeningEvaluation.diagnostics.expectedFocusCount}
              </p>
              <p>Guidance: {listeningEvaluation.feedback.answerAlignment}</p>
            </div>
          ) : null}
        </div>
      ) : null}

      {executiveMode ? (
        <div className="mt-4 rounded-md border border-slate-300 bg-slate-50 p-3 text-sm text-slate-900">
          <p className="font-medium">Executive simulation evaluation</p>
          <p className="mt-1 text-xs">
            Current question: {executiveEvaluation?.followUpQuestion ?? executiveSimulation?.openingQuestion ?? "N/A"}
          </p>
          <button
            type="button"
            onClick={evaluateExecutive}
            disabled={isEvaluatingExecutive || !transcriptText}
            className="mt-2 min-h-10 rounded-lg bg-slate-900 px-3 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-slate-400"
          >
            {isEvaluatingExecutive ? "Evaluating executive response..." : "Evaluate response + get challenge follow-up"}
          </button>
          {executiveError ? <p className="mt-2 text-red-700">{executiveError}</p> : null}
          {executiveEvaluation ? (
            <div className="mt-2 text-xs">
              <p>Total: {executiveEvaluation.total} · XP: {executiveEvaluation.xpAward}</p>
              <p>
                Presence {executiveEvaluation.scores.executivePresence} · Commercial {executiveEvaluation.scores.commercialSharpness} · Clarity{" "}
                {executiveEvaluation.scores.clarity}
              </p>
              <p>
                Brevity {executiveEvaluation.scores.brevity} · Confidence {executiveEvaluation.scores.confidence} · Structure{" "}
                {executiveEvaluation.scores.answerStructure}
              </p>
              <p>Structure coaching: {executiveEvaluation.structureCoaching}</p>
              <p>Improved answer suggestion: {executiveEvaluation.improvedAnswerSuggestion}</p>
              <p>Challenge follow-up: {executiveEvaluation.followUpQuestion}</p>
              <p>Retry needed: {executiveEvaluation.shouldRetry ? "Yes" : "No"}</p>
              {executiveEvaluation.improvement ? <p>Improvement: +{executiveEvaluation.improvement.delta} · {executiveEvaluation.improvement.summary}</p> : null}
            </div>
          ) : null}
        </div>
      ) : null}

      {crisisMode ? (
        <div className="mt-4 rounded-md border border-rose-200 bg-rose-50 p-3 text-sm text-rose-900">
          <p className="font-medium">Crisis / difficult question simulator</p>
          <p className="mt-1 text-xs">{crisisQuestion}</p>
          <button
            type="button"
            onClick={evaluateCrisis}
            disabled={isEvaluatingCrisis || !transcriptText}
            className="mt-2 min-h-10 rounded-lg bg-rose-700 px-3 py-2 font-medium text-white disabled:cursor-not-allowed disabled:bg-rose-300"
          >
            {isEvaluatingCrisis ? "Evaluating response..." : "Evaluate response + one-fix drill"}
          </button>
          {crisisError ? <p className="mt-2 text-red-700">{crisisError}</p> : null}
          {crisisEvaluation ? (
            <div className="mt-2 text-xs">
              <p>Total: {crisisEvaluation.total}</p>
              <p>One fix: {crisisEvaluation.oneFix}</p>
              <p>Retry needed: {crisisEvaluation.shouldRetry ? "Yes — answer same question again" : "No"}</p>
              {crisisEvaluation.improvement ? (
                <p>
                  Improvement delta: {crisisEvaluation.improvement.delta} · {crisisEvaluation.improvement.summary}
                </p>
              ) : null}
            </div>
          ) : null}
        </div>
      ) : null}

      <p
        className={`mt-4 text-sm ${
          saveState === "error" ? "text-red-700" : saveState === "saved" ? "text-emerald-700" : "text-slate-600"
        }`}
      >
        {saveMessage}
      </p>
    </section>
  );
}
