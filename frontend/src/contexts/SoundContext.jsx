import { createContext, useContext, useEffect, useRef, useState } from "react";

const SoundCtx = createContext({
  isMuted: false,
  toggleMute: () => {},
  playButton: () => {},
  playEmpty: () => {},
});

const API_BASE = import.meta.env.VITE_API_BASE_URL || "http://127.0.0.1:8000/api";

export function SoundProvider({ children }) {
  const [isMuted, setIsMuted] = useState(() => {
    try { return localStorage.getItem("sound_muted") === "true"; } catch { return false; }
  });

  const mutedRef = useRef(isMuted);
  const btnRef = useRef(null);
  const emptyRef = useRef(null);

  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);

  // Use plain fetch so it works on public pages without any auth headers
  useEffect(() => {
    fetch(`${API_BASE}/site-settings/`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        const s = Array.isArray(data) ? data[0] : data.results?.[0];
        if (!s) return;

        if (s.click_sound_url) {
          const a = new Audio(s.click_sound_url);
          a.volume = Math.min(1, Math.max(0, parseFloat(s.click_sound_volume) || 0.5));
          btnRef.current = a;
        }

        if (s.empty_click_sound_url) {
          const a = new Audio(s.empty_click_sound_url);
          a.volume = Math.min(1, Math.max(0, parseFloat(s.empty_click_sound_volume) || 0.3));
          emptyRef.current = a;
        }
      })
      .catch(() => {});
  }, []);

  const playButton = () => {
    if (mutedRef.current || !btnRef.current) return;
    btnRef.current.currentTime = 0;
    btnRef.current.play().catch(() => {});
  };

  const playEmpty = () => {
    if (mutedRef.current || !emptyRef.current) return;
    emptyRef.current.currentTime = 0;
    emptyRef.current.play().catch(() => {});
  };

  const toggleMute = () => {
    setIsMuted((prev) => {
      const next = !prev;
      mutedRef.current = next;
      try { localStorage.setItem("sound_muted", String(next)); } catch {}
      return next;
    });
  };

  // Global click listener — capture phase, fires on every click across the whole site
  useEffect(() => {
    const INTERACTIVE =
      "button, a, [role='button'], input[type='submit'], input[type='button'], input[type='checkbox'], input[type='radio'], label, select, summary, [tabindex]";

    const handler = (e) => {
      if (mutedRef.current) return;
      if (e.target.closest(INTERACTIVE)) {
        playButton();
      } else {
        playEmpty();
      }
    };

    document.addEventListener("click", handler, true);
    return () => document.removeEventListener("click", handler, true);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  return (
    <SoundCtx.Provider value={{ isMuted, toggleMute, playButton, playEmpty }}>
      {children}
    </SoundCtx.Provider>
  );
}

export const useSound = () => useContext(SoundCtx);
