import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  MAX_IMAGE_SIZE_KB,
  MAX_IMAGE_SIZE_BYTES,
  formatFileSize,
  FREE_COMPRESSION_TOOLS,
  compressImageToMaxKB,
} from "../utils/imageCompressor";

export default function MultipleImageUploader({
  value = [],
  onChange,
  label = "Upload Images",
}) {
  const [previews, setPreviews] = useState([]);
  const [errorMessage, setErrorMessage] = useState("");
  const [isCompressing, setIsCompressing] = useState(false);

  const handleFileChange = async (e) => {
    const rawFiles = Array.from(e.target.files);
    if (!rawFiles.length) return;

    setErrorMessage("");
    const validFiles = [];
    const oversizedFiles = [];

    for (const file of rawFiles) {
      if (!file.type.startsWith("image/")) continue;
      if (file.size > MAX_IMAGE_SIZE_BYTES) {
        oversizedFiles.push(file);
      } else {
        validFiles.push(file);
      }
    }

    if (oversizedFiles.length > 0) {
      setErrorMessage(
        `${oversizedFiles.length} file(s) exceeded the ${MAX_IMAGE_SIZE_KB} KB limit (e.g. ${oversizedFiles[0].name} is ${formatFileSize(oversizedFiles[0].size)}). Please compress them before uploading.`
      );
    }

    if (validFiles.length > 0) {
      const newPreviews = validFiles.map((file) => ({
        file,
        url: URL.createObjectURL(file),
      }));
      setPreviews((prev) => [...prev, ...newPreviews]);
      onChange([...value, ...validFiles]);
    }
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = value.filter((_, i) => i !== index);

    if (previews[index]?.url) {
      URL.revokeObjectURL(previews[index].url);
    }

    setPreviews(newPreviews);
    onChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <div className="flex items-center justify-between">
        <label className="block text-sm font-semibold text-slate-300">{label}</label>
        <span className="inline-flex items-center gap-1 text-[11px] font-bold px-2.5 py-0.5 rounded-full bg-cyan-500/10 text-cyan-400 border border-cyan-500/30">
          <span>⚠️</span> Max size: {MAX_IMAGE_SIZE_KB} KB per image
        </span>
      </div>

      {/* Previews Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-3 sm:grid-cols-4 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group rounded-xl overflow-hidden border border-white/10">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1.5 right-1.5 bg-rose-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
                title="Remove image"
              >
                <svg className="w-3.5 h-3.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <label className="relative block cursor-pointer">
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border-2 border-dashed border-white/20 rounded-xl hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-200">
          <svg className="w-5 h-5 text-cyan-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-xs font-semibold text-slate-300">Add Images (&le; 100 KB each)</span>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="hidden"
        />
      </label>

      {/* Error & Links */}
      {errorMessage && (
        <div className="p-3 rounded-xl bg-rose-500/10 border border-rose-500/30 text-rose-300 text-xs space-y-2">
          <p className="font-medium">{errorMessage}</p>
          <div className="pt-1 flex flex-wrap items-center gap-2">
            <span className="text-[11px] text-slate-400 font-semibold">Free Compression Sites:</span>
            {FREE_COMPRESSION_TOOLS.map((tool) => (
              <a
                key={tool.name}
                href={tool.url}
                target="_blank"
                rel="noreferrer"
                className="px-2 py-0.5 rounded bg-white/10 hover:bg-cyan-500 hover:text-white text-cyan-300 text-[11px] transition-colors"
              >
                {tool.name} ↗
              </a>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
