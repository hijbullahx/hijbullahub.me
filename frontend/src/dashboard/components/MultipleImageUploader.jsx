import { useState } from "react";

export default function MultipleImageUploader({ value = [], onChange, label = "Upload Images" }) {
  const [previews, setPreviews] = useState([]);

  const handleFileChange = (e) => {
    const files = Array.from(e.target.files);
    
    if (!files.length) return;

    // Create previews
    const newPreviews = files.map(file => ({
      file,
      url: URL.createObjectURL(file)
    }));
    
    setPreviews([...previews, ...newPreviews]);
    onChange([...value, ...files]);
  };

  const removeImage = (index) => {
    const newPreviews = previews.filter((_, i) => i !== index);
    const newFiles = value.filter((_, i) => i !== index);
    
    // Revoke URL to free memory
    URL.revokeObjectURL(previews[index].url);
    
    setPreviews(newPreviews);
    onChange(newFiles);
  };

  return (
    <div className="space-y-3">
      <label className="block text-sm font-medium text-gray-300">{label}</label>
      
      {/* Image Grid */}
      {previews.length > 0 && (
        <div className="grid grid-cols-4 gap-3">
          {previews.map((preview, index) => (
            <div key={index} className="relative group">
              <img
                src={preview.url}
                alt={`Preview ${index + 1}`}
                className="w-full h-24 object-cover rounded-lg border border-white/10"
              />
              <button
                type="button"
                onClick={() => removeImage(index)}
                className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <svg className="w-4 h-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
          ))}
        </div>
      )}

      {/* Upload Button */}
      <label className="relative cursor-pointer">
        <div className="flex items-center justify-center gap-2 px-4 py-3 bg-white/5 border-2 border-dashed border-white/20 rounded-lg hover:border-cyan-500/50 hover:bg-white/10 transition-all duration-300">
          <svg className="w-5 h-5 text-gray-400" fill="none" viewBox="0 0 24 24" stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 4v16m8-8H4" />
          </svg>
          <span className="text-sm text-gray-400">Add More Images</span>
        </div>
        <input
          type="file"
          multiple
          accept="image/*"
          onChange={handleFileChange}
          className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
        />
      </label>

      <p className="text-xs text-gray-500">Upload multiple images for project gallery. First image will be featured.</p>
    </div>
  );
}
