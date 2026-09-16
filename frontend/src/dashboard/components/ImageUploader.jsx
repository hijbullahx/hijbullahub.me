import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MAX_IMAGE_SIZE_KB,
  MAX_IMAGE_SIZE_BYTES,
  formatFileSize,
  FREE_COMPRESSION_TOOLS,
  compressImageToMaxKB,
} from "../utils/imageCompressor";

export default function ImageUploader({
  value,
  onChange,
  label = "Upload Image",
  accept = "image/*",
}) {
  const [preview, setPreview] = useState(value || null);
  const [isDragging, setIsDragging] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");
  const [pendingOversizedFile, setPendingOversizedFile] = useState(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const fileInputRef = useRef(null);

  const processFile = (file) => {
    if (!file || !file.type.startsWith("image/")) {
      setErrorMessage("Please select a valid image file.");
      return;
    }

    if (file.size > MAX_IMAGE_SIZE_BYTES) {
      setErrorMessage(
        `File is too large (${formatFileSize(file.size)}). The maximum allowed size is ${MAX_IMAGE_SIZE_KB} KB.`
      );
      setPendingOversizedFile(file);
      return;
    }

    // Valid size
    setErrorMessage("");
    setPendingOversizedFile(null);

    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result);
    };
    reader.readAsDataURL(file);
    onChange(file);
  };

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files[0];
    if (file) {
      processFile(file);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    setErrorMessage("");
    setPendingOversizedFile(null);
    onChange(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleAutoCompress = async () => {
    if (!pendingOversizedFile) return;
    setIsCompressing(true);
    try {
      const compressed = await compressImageToMaxKB(pendingOversizedFile, 95);
      processFile(compressed);
    } catch {
      setErrorMessage("Automatic compression failed. Please use one of the free compression sites below.");
    } finally {
      setIsCompressing(false);
    }
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-300">
          {label}
        </label>
        {/* Prominent limit sign */}
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <span>⚠️</span> Max size: {MAX_IMAGE_SIZE_KB} KB
        </span>
      </div>

      <AnimatePresence mode="wait">
        {preview ? (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            className="relative group rounded-xl overflow-hidden border border-white/15"
          >
            <img
              src={preview}
              alt="Preview"
              className="w-full h-48 object-cover rounded-xl"
            />
            <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
              <button
                type="button"
                onClick={() => fileInputRef.current?.click()}
                className="px-4 py-2 bg-cyan-500 text-white rounded-lg text-xs font-semibold hover:bg-cyan-600 transition-colors"
              >
                Change Image
              </button>
              <button
                type="button"
                onClick={handleRemove}
                className="px-4 py-2 bg-rose-500 text-white rounded-lg text-xs font-semibold hover:bg-rose-600 transition-colors"
              >
                Remove
              </button>
            </div>
          </motion.div>
        ) : (
          <motion.div
            initial={{ opacity: 0, scale: 0.98 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.98 }}
            onDragOver={handleDragOver}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop}
            onClick={() => fileInputRef.current?.click()}
            className={`border-2 border-dashed rounded-xl p-6 text-center cursor-pointer transition-all ${
              isDragging
                ? "border-cyan-500 bg-cyan-500/10"
                : "border-white/20 hover:border-cyan-500/50 hover:bg-white/5 bg-slate-900/40"
            }`}
          >
            <div className="w-10 h-10 mx-auto mb-2 text-cyan-400 flex items-center justify-center rounded-xl bg-cyan-500/10">
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 16l4.586-4.586a2 2 0 012.828 0L16 16m-2-2l1.586-1.586a2 2 0 012.828 0L20 14m-6-6h.01M6 20h12a2 2 0 002-2V6a2 2 0 00-2-2H6a2 2 0 00-2 2v12a2 2 0 002 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium text-slate-200 mb-1">
              {isDragging ? "Drop image here" : "Click or drag image here to upload"}
            </p>
            <p className="text-xs text-slate-400">
              WebP, PNG, JPG under <strong className="text-cyan-400">100 KB</strong>
            </p>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Error and Auto-Compress Action */}
      {errorMessage && (
        <motion.div
          initial={{ opacity: 0, y: -6 }}
          animate={{ opacity: 1, y: 0 }}
          className="p-3.5 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2.5"
        >
          <div className="flex items-start gap-2">
            <span className="text-base leading-none">⚠️</span>
            <span className="flex-1 font-medium">{errorMessage}</span>
          </div>

          {pendingOversizedFile && (
            <div className="pt-2 border-t border-rose-500/20 flex items-center gap-3">
              <button
                type="button"
                onClick={handleAutoCompress}
                disabled={isCompressing}
                className="px-3 py-1.5 rounded-lg bg-cyan-500 hover:bg-cyan-600 text-white font-semibold text-xs flex items-center gap-1.5 transition-colors shadow-sm disabled:opacity-50"
              >
                {isCompressing ? "Compressing..." : "⚡ Auto-Compress to <100 KB"}
              </button>
              <span className="text-[11px] text-slate-400">or compress externally:</span>
            </div>
          )}

          {/* Free compression tool links */}
          <div className="pt-1.5 flex flex-wrap items-center gap-2">
            <span className="text-[11px] font-semibold text-slate-400">Free Tools:</span>
            {FREE_COMPRESSION_TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 rounded-md bg-white/10 hover:bg-cyan-500 hover:text-white text-cyan-300 text-[11px] font-medium transition-colors"
                title={tool.desc}
              >
                {tool.name} ↗
              </a>
            ))}
          </div>
        </motion.div>
      )}

      <input
        ref={fileInputRef}
        type="file"
        accept={accept}
        onChange={handleFileChange}
        className="hidden"
      />
    </div>
  );
}
