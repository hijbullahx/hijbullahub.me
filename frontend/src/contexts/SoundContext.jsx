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

  const mutedRef       = useRef(isMuted);
  const enabledRef     = useRef(true);     // server-side global kill-switch
  const btnRef         = useRef(null);
  const emptyRef       = useRef(null);
  const clickVolRef    = useRef(0.5);      // always current volume — applied at play time
  const emptyVolRef    = useRef(0.3);

  useEffect(() => { mutedRef.current = isMuted; }, [isMuted]);

  // Load (or reload) settings from the API.
  // Keeps existing Audio objects when the URL hasn't changed — just updates volumes.
  const applySettings = (s) => {
    if (!s) return;

    enabledRef.current = s.sounds_enabled !== false;

    const clampVol = (raw, fallback) => {
      const n = parseFloat(raw);
      return isNaN(n) ? fallback : Math.min(1, Math.max(0, n));
    };

    clickVolRef.current = clampVol(s.click_sound_volume, 0.5);
    emptyVolRef.current = clampVol(s.empty_click_sound_volume, 0.3);

    // Recreate Audio only when the URL actually changes (or is new)
    if (s.click_sound_url && btnRef.current?.src !== s.click_sound_url) {
      btnRef.current = new Audio(s.click_sound_url);
    }
    if (s.empty_click_sound_url && emptyRef.current?.src !== s.empty_click_sound_url) {
      emptyRef.current = new Audio(s.empty_click_sound_url);
    }
  };

  const fetchSettings = () =>
    fetch(`${API_BASE}/site-settings/`)
      .then((r) => r.ok ? r.json() : null)
      .then((data) => {
        if (!data) return;
        applySettings(Array.isArray(data) ? data[0] : data.results?.[0]);
      })
      .catch(() => {});

  // Initial load
  useEffect(() => { fetchSettings(); }, []); // eslint-disable-line react-hooks/exhaustive-deps

  // Re-fetch whenever the tab regains focus so volume changes by the admin
  // are picked up without requiring a full page reload.
  useEffect(() => {
    const onFocus = () => fetchSettings();
    document.addEventListener("visibilitychange", onFocus);
    return () => document.removeEventListener("visibilitychange", onFocus);
  }, []); // eslint-disable-line react-hooks/exhaustive-deps

  const playButton = () => {
    if (!enabledRef.current || mutedRef.current || !btnRef.current) return;
    btnRef.current.volume = clickVolRef.current;   // apply latest volume every time
    btnRef.current.currentTime = 0;
    btnRef.current.play().catch(() => {});
  };

  const playEmpty = () => {
    if (!enabledRef.current || mutedRef.current) return;
    const audio = emptyRef.current || btnRef.current;
    if (!audio) return;
    // Use the appropriate volume ref
    audio.volume = (audio === emptyRef.current ? emptyVolRef.current : clickVolRef.current);
    audio.currentTime = 0;
    audio.play().catch(() => {});
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
