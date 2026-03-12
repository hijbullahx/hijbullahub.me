import { useState, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";

export default function FileUploader({ 
  value, 
  onChange, 
  label = "Upload File",
  accept = ".pdf,image/*",
}) {
  const [fileName, setFileName] = useState(null);
  const [isDragging, setIsDragging] = useState(false);
  const fileInputRef = useRef(null);

  const handleFileChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      handleFile(file);
    }
  };

  const handleFile = (file) => {
    setFileName(file.name);
    onChange(file);
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
      handleFile(file);
    }
  };

  const triggerSelect = () => {
    fileInputRef.current?.click();
  };

  const clearFile = (e) => {
    e.stopPropagation();
    setFileName(null);
    onChange(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  return (
    <div className="w-full">
      <label className="block text-sm font-medium mb-2 text-slate-300">
        {label}
      </label>
      
      <div 
        onClick={triggerSelect}
        onDragOver={handleDragOver} 
        onDragLeave={handleDragLeave}
        onDrop={handleDrop}
        className={`
          relative border-2 border-dashed rounded-xl p-4 transition-all duration-300 cursor-pointer
          flex flex-col items-center justify-center gap-2 group
          ${isDragging 
            ? "border-cyan-500 bg-cyan-500/10" 
            : "border-white/10 hover:border-cyan-500/30 hover:bg-white/5"
          }
        `}
      >
        <input 
          type="file" 
          ref={fileInputRef}
          className="hidden" 
          onChange={handleFileChange}
          accept={accept}
        />
        
        <AnimatePresence mode="wait">
          {fileName || value ? (
            <motion.div 
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="w-full flex items-center justify-between p-2 bg-white/5 rounded-lg border border-white/10"
            >
               <div className="flex items-center gap-3 overflow-hidden">
                  <div className="w-8 h-8 rounded bg-cyan-500/20 flex items-center justify-center text-cyan-400">
                    📄
                  </div>
                  <span className="text-sm text-slate-200 truncate max-w-[200px]">
                    {fileName || (typeof value === 'string' ? value.split('/').pop() : "File Selected")}
                  </span>
               </div>
               
               <button 
                 onClick={clearFile}
                 className="p-1 hover:bg-white/10 rounded text-slate-400 hover:text-red-400 transition-colors"
               >
                 ✕
               </button>
            </motion.div>
          ) : (
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="text-center py-4"
            >
              <div className="text-3xl mb-2 text-slate-500 group-hover:text-cyan-500/50 transition-colors">
                📂
              </div>
              <p className="text-sm text-slate-400 group-hover:text-cyan-400 transition-colors">
                Drop file here or click to upload
              </p>
              <p className="text-xs text-slate-500 mt-1">
                PDF or Image (Max 5MB)
              </p>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
