import { useState, useRef } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";

interface Props {
  text: string;
  label?: string;
  className?: string;
  voiceId?: string;
}

/** ARTHA AI — Speak with Ara (Grok / xAI TTS via backend). */
export default function SpeakButton({
  text,
  label = "Speak with Ara",
  className = "",
  voiceId = "ara",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  async function handleSpeak() {
    if (playing && audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
      setPlaying(false);
      return;
    }
    const trimmed = (text || "").trim();
    if (!trimmed) {
      setError("Nothing to speak");
      return;
    }
    setError("");
    setLoading(true);
    try {
      const token = localStorage.getItem("token");
      const res = await fetch("/api/v1/voice/speak", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        },
        body: JSON.stringify({ text: trimmed.slice(0, 5000), voice_id: voiceId, language: "en" }),
      });
      if (!res.ok) {
        const err = await res.json().catch(() => ({ detail: res.statusText }));
        throw new Error(typeof err.detail === "string" ? err.detail : "Voice failed");
      }
      const blob = await res.blob();
      const url = URL.createObjectURL(blob);
      const audio = new Audio(url);
      audioRef.current = audio;
      audio.onended = () => {
        setPlaying(false);
        URL.revokeObjectURL(url);
        audioRef.current = null;
      };
      await audio.play();
      setPlaying(true);
    } catch (e: any) {
      setError(e.message || "Could not play Ara voice");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleSpeak}
        disabled={loading || !text?.trim()}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          bg-violet-50 text-violet-700 border border-violet-200
          hover:bg-violet-100 disabled:opacity-50 transition-colors"
        title="Speak with Ara (Grok voice)"
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : playing ? (
          <Square className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {playing ? "Stop" : label}
      </button>
      {error && <span className="text-xs text-red-600 max-w-xs">{error}</span>}
    </div>
  );
}
