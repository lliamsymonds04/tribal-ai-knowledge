"use client";

import { useState, useRef, useEffect } from "react";

type RecordingState = "idle" | "recording" | "processing";

interface TranscriptionResponse {
  text: string;
  success: boolean;
  error?: string;
}

interface AudioRecorderProps {
  onTranscriptionComplete?: (transcription: string) => void;
  hideTranscription?: boolean;
  showTitle?: boolean;
  startButtonText?: string;
  stopButtonText?: string;
}

export default function AudioRecorder({
  onTranscriptionComplete,
  hideTranscription = false,
  showTitle = true,
  startButtonText = "Start Recording",
  stopButtonText = "Stop Recording",
}: AudioRecorderProps = {}) {
  const [recordingState, setRecordingState] = useState<RecordingState>("idle");
  const [transcription, setTranscription] = useState<string>("");
  const [error, setError] = useState<string>("");
  const [recordingTime, setRecordingTime] = useState<number>(0);
  const [isErrorFadingOut, setIsErrorFadingOut] = useState(false);

  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);
  const timerRef = useRef<NodeJS.Timeout | null>(null);
  const errorTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  useEffect(() => {
    if (error) {
      setIsErrorFadingOut(false);

      // Clear any existing timeout
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }

      // Start fade out after 4 seconds
      errorTimeoutRef.current = setTimeout(() => {
        setIsErrorFadingOut(true);

        // Remove error completely after fade out animation
        setTimeout(() => {
          setError("");
          setIsErrorFadingOut(false);
        }, 300);
      }, 4000);
    }

    return () => {
      if (errorTimeoutRef.current) {
        clearTimeout(errorTimeoutRef.current);
      }
    };
  }, [error]);

  const startRecording = async () => {
    try {
      setError("");
      setTranscription("");
      setRecordingTime(0);

      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      mediaRecorderRef.current = mediaRecorder;
      audioChunksRef.current = [];

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) {
          audioChunksRef.current.push(event.data);
        }
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });

        // Stop all tracks to release microphone
        stream.getTracks().forEach((track) => track.stop());

        await sendAudioForTranscription(audioBlob);
      };

      mediaRecorder.start();
      setRecordingState("recording");

      // Start timer
      timerRef.current = setInterval(() => {
        setRecordingTime((prev) => prev + 1);
      }, 1000);
    } catch (err: any) {
      console.error("Error starting recording:", err);
      setError(
        err.name === "NotAllowedError"
          ? "Microphone access denied. Please allow microphone access in your browser settings."
          : "Failed to start recording. Please check your microphone.",
      );
    }
  };

  const stopRecording = () => {
    if (mediaRecorderRef.current && recordingState === "recording") {
      mediaRecorderRef.current.stop();
      setRecordingState("processing");

      // Clear timer
      if (timerRef.current) {
        clearInterval(timerRef.current);
        timerRef.current = null;
      }
    }
  };

  const sendAudioForTranscription = async (audioBlob: Blob) => {
    try {
      // Check file size (25MB limit)
      const maxSize = 25 * 1024 * 1024;
      if (audioBlob.size > maxSize) {
        setError(
          "Recording is too large (max 25MB). Please record a shorter audio.",
        );
        setRecordingState("idle");
        return;
      }

      const formData = new FormData();
      formData.append("audio", audioBlob, "recording.webm");

      const response = await fetch("/api/transcribe", {
        method: "POST",
        body: formData,
      });

      const data: TranscriptionResponse = await response.json();

      if (!response.ok) {
        throw new Error(data.error || "Failed to transcribe audio");
      }

      setTranscription(data.text);
      setRecordingState("idle");

      // Call callback if provided
      if (onTranscriptionComplete) {
        onTranscriptionComplete(data.text);
      }
    } catch (err: any) {
      console.error("Transcription error:", err);
      setError(err.message || "Failed to transcribe audio. Please try again.");
      setRecordingState("idle");
    }
  };

  const formatTime = (seconds: number): string => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="w-full space-y-4">
      {showTitle && <h2 className="text-2xl font-bold">Audio Transcription</h2>}

      {/* Recording Controls */}
      <div className="flex items-center space-x-4">
        {recordingState === "idle" && (
          <button
            onClick={startRecording}
            className="px-6 py-3 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            {startButtonText}
          </button>
        )}

        {recordingState === "recording" && (
          <>
            <div className="flex items-center space-x-2">
              <div className="w-3 h-3 bg-red-600 rounded-full animate-pulse" />
              <span className="text-red-500 text-lg font-mono">
                {formatTime(recordingTime)}
              </span>
            </div>
            <button
              onClick={stopRecording}
              className="px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
            >
              {stopButtonText}
            </button>
          </>
        )}

        {recordingState === "processing" && (
          <div className="flex items-center space-x-2">
            <div className="w-5 h-5 border-2 border-blue-600 border-t-transparent rounded-full animate-spin" />
            <span className="text-gray-600 animate-pulse">Transcribing...</span>
          </div>
        )}
      </div>

      {/* Error Message */}
      {error && (
        <div
          className={`absolute top-8 left-1/2 -translate-x-1/2 w-auto max-w-md px-6 py-4 bg-red-500 text-white rounded-lg shadow-lg z-50 ${
            isErrorFadingOut
              ? "animate-[fadeOut_0.3s_ease-out]"
              : "animate-[fadeIn_0.3s_ease-out]"
          }`}
        >
          <div className="text-center text-sm font-medium">{error}</div>
        </div>
      )}

      {/* Transcription Result */}
      {!hideTranscription && transcription && (
        <div className="w-full space-y-2">
          <h3 className="text-lg font-semibold">Transcription:</h3>
          <div className="p-4 bg-gray-100 rounded-lg border border-gray-300">
            <p className="text-gray-800">{transcription}</p>
          </div>
        </div>
      )}
    </div>
  );
}
