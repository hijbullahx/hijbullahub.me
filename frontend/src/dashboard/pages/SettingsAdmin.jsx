import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";

// ─── Volume Slider ────────────────────────────────────────────────────────────
function VolumeSlider({ value, onChange }) {
  const pct = Math.round((parseFloat(value) || 0) * 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-base w-5 text-center select-none">
        {pct === 0 ? "🔇" : pct < 50 ? "🔉" : "🔊"}
      </span>
      <input
        type="range"
        min="0"
        max="1"
        step="0.05"
        value={value}
        onChange={(e) => onChange(parseFloat(e.target.value))}
        className="flex-1 h-1.5 cursor-pointer accent-cyan-500"
      />
      <span className="text-sm text-cyan-400 w-9 text-right tabular-nums">{pct}%</span>
    </div>
  );
}

// ─── Sound Card ───────────────────────────────────────────────────────────────
function SoundCard({ label, emoji, description, currentUrl, onFileChange, volume, onVolumeChange }) {
  const [localUrl, setLocalUrl] = useState(null);
  const previewUrl = localUrl || currentUrl;

  const handleFile = (file) => {
    setLocalUrl(URL.createObjectURL(file));
    onFileChange(file);
  };

  const previewRef = useRef(null);
  const tryPreview = () => {
    if (!previewUrl) return;
    const a = previewRef.current || (previewRef.current = new Audio(previewUrl));
    a.src = previewUrl;
    a.volume = Math.min(1, Math.max(0, parseFloat(volume) || 0.5));
    a.currentTime = 0;
    a.play().catch(() => {});
  };

  return (
    <div className="bg-white/[0.03] border border-white/10 rounded-2xl p-5 space-y-4 hover:border-white/20 transition-colors">
      <div className="flex items-start gap-3">
        <span className="text-2xl mt-0.5">{emoji}</span>
        <div>
          <h3 className="font-semibold text-white">{label}</h3>
          <p className="text-xs text-gray-500 mt-0.5">{description}</p>
        </div>
      </div>

      {/* Playback + preview */}
      {previewUrl ? (
        <div className="flex items-center gap-2">
          <audio controls src={previewUrl} className="flex-1 h-8 min-w-0" />
          <button
            type="button"
            onClick={tryPreview}
            className="px-3 py-1.5 text-xs rounded-lg bg-cyan-500/10 border border-cyan-500/20 text-cyan-400 hover:bg-cyan-500/20 transition shrink-0"
          >
            ▶ Test
          </button>
        </div>
      ) : (
        <div className="flex items-center gap-2 px-3 py-2.5 rounded-xl bg-white/5 border border-dashed border-white/10 text-gray-600 text-sm">
          <span>🎵</span> No sound uploaded yet
        </div>
      )}

      {/* Upload */}
      <label className="flex items-center gap-2 px-4 py-2.5 rounded-xl border border-dashed border-white/20 text-gray-400 hover:border-cyan-500/40 hover:text-white cursor-pointer transition-all text-sm group">
        <span className="text-base group-hover:scale-110 transition-transform">📁</span>
        <span>{currentUrl || localUrl ? "Replace audio file" : "Upload audio file"}</span>
        <span className="ml-auto text-xs text-gray-600">mp3 · wav · ogg</span>
        <input
          type="file"
          accept="audio/*"
          className="hidden"
          onChange={(e) => { if (e.target.files[0]) handleFile(e.target.files[0]); }}
        />
      </label>

      {/* Volume */}
      <div>
        <label className="block text-xs text-gray-400 mb-2">Volume</label>
        <VolumeSlider value={volume} onChange={onVolumeChange} />
      </div>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────
export default function SettingsAdmin() {
  const [settings, setSettings] = useState(null);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [form, setForm] = useState({
    sounds_enabled: true,
    click_sound_volume: 0.5,
    empty_click_sound_volume: 0.3,
  });
  const [clickSoundFile, setClickSoundFile] = useState(null);
  const [emptyClickSoundFile, setEmptyClickSoundFile] = useState(null);
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/site-settings/");
      const s = data.results ? data.results[0] : data[0];
      if (s) {
        setSettings(s);
        setForm({
          sounds_enabled: s.sounds_enabled !== false,
          click_sound_volume: s.click_sound_volume ?? 0.5,
          empty_click_sound_volume: s.empty_click_sound_volume ?? 0.3,
        });
      }
    } catch {
      toast.error("Failed to load settings.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setForm((p) => ({ ...p, [k]: v }));

  const handleSave = async (e) => {
    e.preventDefault();
    setSaving(true);
    try {
      const data = new FormData();
      Object.entries(form).forEach(([k, v]) => data.append(k, v));
      if (clickSoundFile) data.append("click_sound", clickSoundFile);
      if (emptyClickSoundFile) data.append("empty_click_sound", emptyClickSoundFile);

      if (settings?.id) {
        // PATCH — partial update, no Content-Type override (axios sets boundary automatically)
        await api.patch(`/site-settings/${settings.id}/`, data);
      } else {
        // No record yet — seed required fields with defaults so the row is created
        data.append("site_title", "Portfolio");
        data.append("email", "admin@example.com");
        await api.post("/site-settings/", data);
      }
      toast.success("Settings saved. Reload to apply new sounds.");
      load();
    } catch (err) {
      const detail = err?.response?.data;
      toast.error(detail ? JSON.stringify(detail) : "Save failed.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin w-8 h-8 rounded-full border-2 border-cyan-500 border-t-transparent" />
      </div>
    );
  }

  return (
    <div className="max-w-3xl mx-auto space-y-8">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-white">Site Settings</h1>
        <p className="text-gray-400 mt-1">Global configuration applied across the entire site.</p>
      </div>

      <form onSubmit={handleSave} className="space-y-10">

        {/* ── Sound Settings ────────────────────────────────────────────────── */}
        <section className="space-y-4">
          <div className="border-b border-white/10 pb-2">
            <h2 className="text-base font-semibold text-white flex items-center gap-2">
              <span>🔊</span> Sound Settings
            </h2>
            <p className="text-xs text-gray-500 mt-1">
              Sounds play site-wide on every click. Visitors can mute anytime with the&nbsp;🔇 button (bottom-right corner).
            </p>
          </div>

          {/* ── Global Mute Master Toggle ── */}
          <div className={`flex items-center justify-between gap-4 px-5 py-4 rounded-2xl border transition-all ${
            form.sounds_enabled
              ? "bg-emerald-500/5 border-emerald-500/20"
              : "bg-rose-500/5 border-rose-500/20"
          }`}>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{form.sounds_enabled ? "🔊" : "🔇"}</span>
              <div>
                <p className="text-white font-semibold text-sm">
                  {form.sounds_enabled ? "Sounds Enabled" : "All Sounds Muted"}
                </p>
                <p className="text-xs text-gray-500 mt-0.5">
                  {form.sounds_enabled
                    ? "All visitors will hear click sounds on the site."
                    : "No visitor will hear any sound, globally. Overrides individual volume settings."}
                </p>
              </div>
            </div>
            <button
              type="button"
              onClick={() => set("sounds_enabled", !form.sounds_enabled)}
              className={`relative inline-flex h-7 w-12 shrink-0 cursor-pointer rounded-full border-2 transition-colors duration-200 focus:outline-none ${
                form.sounds_enabled
                  ? "bg-emerald-500 border-emerald-500"
                  : "bg-white/10 border-white/20"
              }`}
            >
              <span
                className={`pointer-events-none inline-block h-5 w-5 transform rounded-full bg-white shadow-lg transition-transform duration-200 mt-0.5 ${
                  form.sounds_enabled ? "translate-x-5" : "translate-x-0.5"
                }`}
              />
            </button>
          </div>

          <div className="grid md:grid-cols-2 gap-5">
            <SoundCard
              label="Button Click Sound"
              emoji="🖱️"
              description="Plays when clicking buttons, links &amp; interactive elements."
              currentUrl={settings?.click_sound_url}
              onFileChange={setClickSoundFile}
              volume={form.click_sound_volume}
              onVolumeChange={(v) => set("click_sound_volume", v)}
            />
            <SoundCard
              label="Empty Click Sound"
              emoji="🌊"
              description="Plays when clicking on non-interactive areas."
              currentUrl={settings?.empty_click_sound_url}
              onFileChange={setEmptyClickSoundFile}
              volume={form.empty_click_sound_volume}
              onVolumeChange={(v) => set("empty_click_sound_volume", v)}
            />
          </div>

          {/* Mute hint */}
          <div className="flex items-center gap-3 px-4 py-3 rounded-xl bg-white/[0.02] border border-white/10 text-sm text-gray-400">
            <span className="text-xl">🔇</span>
            <span>The floating mute button (bottom-right) is visible to <strong className="text-gray-300">all visitors</strong> and persists across sessions.</span>
          </div>
        </section>

        {/* ── Save ─────────────────────────────────────────────────────────── */}
        <div className="flex justify-end pt-2 border-t border-white/10">
          <GlowButton type="submit" disabled={saving}>
            {saving ? "Saving…" : "💾 Save Settings"}
          </GlowButton>
        </div>
      </form>
    </div>
  );
}
