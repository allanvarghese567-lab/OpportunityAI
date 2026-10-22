import { useState, useRef, useEffect } from "react";
import { Volume2, Square, Loader2 } from "lucide-react";

interface Props {
  text: string;
  label?: string;
  className?: string;
  voiceId?: string;
}

/** Browser speech by default (no key). Ara/xAI when XAI_API_KEY is set. */
export default function SpeakButton({
  text,
  label = "Speak",
  className = "",
  voiceId = "ara",
}: Props) {
  const [loading, setLoading] = useState(false);
  const [playing, setPlaying] = useState(false);
  const [error, setError] = useState("");
  const [mode, setMode] = useState<"browser" | "ara">("browser");
  const audioRef = useRef<HTMLAudioElement | null>(null);

  useEffect(() => {
    const token = localStorage.getItem("token");
    if (!token) return;
    fetch("/api/v1/voice/status", {
      headers: { Authorization: `Bearer ${token}` },
    })
      .then((r) => (r.ok ? r.json() : null))
      .then((d) => {
        if (d?.enabled) setMode("ara");
      })
      .catch(() => {});
  }, []);

  function stopAll() {
    if (typeof window !== "undefined" && window.speechSynthesis) {
      window.speechSynthesis.cancel();
    }
    if (audioRef.current) {
      audioRef.current.pause();
      audioRef.current = null;
    }
    setPlaying(false);
  }

  function speakBrowser(trimmed: string) {
    if (!window.speechSynthesis) {
      throw new Error("This browser does not support speech. Try Chrome or Edge.");
    }
    window.speechSynthesis.cancel();
    const u = new SpeechSynthesisUtterance(trimmed);
    u.lang = "en-IN";
    u.rate = 1;
    u.pitch = 1;
    const voices = window.speechSynthesis.getVoices();
    const preferred =
      voices.find((v) => /en(-|_)?(IN|GB|US)/i.test(v.lang) && /female|zira|samantha|google uk english female/i.test(v.name)) ||
      voices.find((v) => /en(-|_)?(IN|GB|US)/i.test(v.lang)) ||
      voices[0];
    if (preferred) u.voice = preferred;
    u.onend = () => setPlaying(false);
    u.onerror = () => {
      setPlaying(false);
      setError("Browser speech failed");
    };
    setPlaying(true);
    window.speechSynthesis.speak(u);
  }

  async function speakAra(trimmed: string) {
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
      throw new Error(typeof err.detail === "string" ? err.detail : "Ara voice failed");
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
  }

  async function handleSpeak() {
    if (playing) {
      stopAll();
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
      if (mode === "ara") {
        try {
          await speakAra(trimmed);
        } catch {
          setMode("browser");
          speakBrowser(trimmed);
        }
      } else {
        speakBrowser(trimmed);
      }
    } catch (e: any) {
      setError(e.message || "Could not speak");
    } finally {
      setLoading(false);
    }
  }

  const buttonLabel = playing
    ? "Stop"
    : mode === "ara"
      ? label.includes("Ara")
        ? label
        : "Speak with Ara"
      : label === "Speak with Ara"
        ? "Speak"
        : label;

  return (
    <div className={`inline-flex flex-col items-start gap-1 ${className}`}>
      <button
        type="button"
        onClick={handleSpeak}
        disabled={loading || !text?.trim()}
        className="inline-flex items-center gap-2 px-3 py-1.5 rounded-lg text-sm font-medium
          bg-violet-50 text-violet-700 border border-violet-200
          hover:bg-violet-100 disabled:opacity-50 transition-colors"
        title={mode === "ara" ? "Speak with Ara (Grok TTS)" : "Speak using your browser (no API key needed)"}
      >
        {loading ? (
          <Loader2 className="w-4 h-4 animate-spin" />
        ) : playing ? (
          <Square className="w-4 h-4" />
        ) : (
          <Volume2 className="w-4 h-4" />
        )}
        {buttonLabel}
      </button>
      <span className="text-[10px] text-slate-400">
        {mode === "ara" ? "Voice: Ara (xAI)" : "Voice: browser (free, no key)"}
      </span>
      {error && <span className="text-xs text-red-600 max-w-xs">{error}</span>}
    </div>
  );
}
