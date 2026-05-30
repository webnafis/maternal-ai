"use client";
import { useState, useRef } from "react";

interface AudioRecorderProps {
  onTranscriptionComplete: (text: string) => void;
  disabled?: boolean;
}

export default function AudioRecorder({
  onTranscriptionComplete,
  disabled,
}: AudioRecorderProps) {
  const [isRecording, setIsRecording] = useState(false);
  const [loading, setLoading] = useState(false);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioChunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    audioChunksRef.current = [];
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream, {
        mimeType: "audio/webm",
      });
      mediaRecorderRef.current = mediaRecorder;

      mediaRecorder.ondataavailable = (event) => {
        if (event.data.size > 0) audioChunksRef.current.push(event.data);
      };

      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunksRef.current, {
          type: "audio/webm",
        });
        await uploadAudio(audioBlob);

        // Clean up and turn off mic hardware tracks completely
        stream.getTracks().forEach((track) => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (err) {
      console.error("Microphone access denied or unsupported:", err);
      alert("Could not access microphone. Please check browser permissions.");
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  async function uploadAudio(blob: Blob) {
    setLoading(false);
    try {
      setLoading(true);
      const formData = new FormData();
      formData.append("file", blob, "recording.webm");

      const res = await fetch("/api/ai-chat/transcribe", {
        method: "POST",
        body: formData,
      });

      const data = await res.json();
      if (data.text?.trim()) {
        onTranscriptionComplete(data.text);
      }
    } catch (error) {
      console.error("Error processing speech payload:", error);
    } finally {
      setLoading(false);
    }
  }

  return (
    <button
      type="button"
      disabled={disabled || loading}
      onClick={isRecording ? stopRecording : startRecording}
      style={{
        padding: "12px",
        fontSize: 16,
        borderRadius: 12,
        background: isRecording ? "#ef4444" : "var(--rose, #e11d48)",
        color: "white",
        border: "none",
        cursor: "pointer",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        minWidth: 46,
        transition: "all 0.2s ease",
        opacity: disabled ? 0.6 : 1,
      }}
    >
      {loading ? "⌛" : isRecording ? "⏹️" : "🎙️"}
    </button>
  );
}
