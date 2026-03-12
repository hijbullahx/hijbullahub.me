import { useState, useEffect } from "react";
import { Reorder } from "framer-motion";
import api from "../../api/client";
import FormModal from "../components/FormModal";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";
import ImageUploader from "../components/ImageUploader";
import FileUploader from "../components/FileUploader";

const EMPTY_FORM = {
  degree_name: "",
  institution_name: "",
  location: "",
  institution_type: "university",
  start_date: "",
  end_date: "",
  result: "",
  is_current: false,
  is_active: true,
};

const INSTITUTION_TYPES = [
  { value: 'board', label: 'Board' },
  { value: 'university', label: 'University' },
  { value: 'school', label: 'School' },
  { value: 'madrasah', label: 'Madrasah' },
  { value: 'college', label: 'College' },
];

export default function EducationAdmin() {
  const [educations, setEducations] = useState([]);
  const [loading, setLoading] = useState(true);
  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState(null);
  const [formData, setFormData] = useState(EMPTY_FORM);
  const [logoFile, setLogoFile] = useState(null);
  const [existingLogoUrl, setExistingLogoUrl] = useState(null);
  const [certFile, setCertFile] = useState(null);
  const [existingCertUrl, setExistingCertUrl] = useState(null);
  const toast = useToast();

  useEffect(() => { load(); }, []);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get("/education/");
      let items = data.results ?? data;
      setEducations(items);
    } catch {
      toast.error("Failed to load education.");
    } finally {
      setLoading(false);
    }
  };

  const set = (k, v) => setFormData((p) => ({ ...p, [k]: v }));

  const openAdd = () => {
    setEditing(null);
    setFormData(EMPTY_FORM);
    setLogoFile(null);
    setCertFile(null);
    setExistingLogoUrl(null);
    setExistingCertUrl(null);
    setModalOpen(true);
  };

  const openEdit = (item) => {
    setEditing(item.id);
    setFormData({
      degree_name: item.degree_name,
      institution_name: item.institution_name,
      location: item.location || "",
      institution_type: item.institution_type,
      start_date: item.start_date || "",
      end_date: item.end_date || "",
      result: item.result || "",
      is_current: item.is_current,
      is_active: item.is_active,
    });
    setLogoFile(null);
    setCertFile(null);
    setExistingLogoUrl(item.institution_logo_url || item.institution_logo);
    setExistingCertUrl(item.certificate);
    setModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const fd = new FormData();
    Object.keys(formData).forEach((k) => {
        if ((k === 'end_date' || k === 'result') && !formData[k]) {
             return;
        }
        fd.append(k, formData[k]);
    });

    if (logoFile) fd.append("institution_logo", logoFile);
    if (certFile) fd.append("certificate", certFile);

    try {
      if (editing) {
        await api.patch(`/education/${editing}/`, fd);
        toast.success("Education updated.");
      } else {
        await api.post("/education/", fd);
        toast.success("Education added.");
      }
      setModalOpen(false);
      await load();
    } catch (err) {
      console.error(err);
      if (err.response && err.response.data) {
          const msg = Object.values(err.response.data).flat().join(" ");
          toast.error(msg || "Failed to save.");
      } else {
          toast.error("Failed to save.");
      }
    }
  };

  const handleDelete = async (e, id) => {
    e.stopPropagation();
    if (!window.confirm("Delete this education entry?")) return;
    try {
      await api.delete(`/education/${id}/`);
      setEducations((prev) => prev.filter((e) => e.id !== id));
      toast.success("Deleted.");
    } catch {
      toast.error("Failed to delete.");
    }
  };

  const handleReorder = (newOrder) => {
    setEducations(newOrder);
  };

  const saveOrder = async () => {
    try {
      const updates = educations.map((item, index) => 
        api.patch(`/education/${item.id}/`, { display_order: index })
      );
      await Promise.all(updates);
    } catch {
      toast.error("Failed to save order.");
    }
  };

  if (loading) return <div className="p-8 text-center text-slate-400">Loading education...</div>;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h1 className="text-2xl font-bold gradient-text">Manage Education</h1>
        <GlowButton onClick={openAdd}>+ Add Education</GlowButton>
      </div>

      <div className="text-sm text-slate-400 mb-2 italic">
        Drag items to reorder them on the homepage.
      </div>

      <Reorder.Group axis="y" values={educations} onReorder={handleReorder} className="space-y-3">
        {educations.map((item) => (
          <Reorder.Item
            key={item.id}
            value={item}
            onDragEnd={saveOrder}
            className="bg-white/5 border border-white/10 rounded-xl p-4 flex items-center justify-between gap-4 select-none"
            whileDrag={{ scale: 1.02, boxShadow: "0 5px 15px rgba(0,0,0,0.3)" }}
          >
            <div className="flex items-center gap-4 overflow-hidden flex-1">
               <div className="text-slate-500 cursor-grab active:cursor-grabbing px-2" title="Drag to reorder">
                <svg className="w-5 h-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 8h16M4 16h16" />
                </svg>
              </div>

               <div className="w-12 h-12 flex-shrink-0 rounded-lg bg-white/5 border border-white/10 overflow-hidden flex items-center justify-center relative group">
                  {(item.institution_logo_url || item.institution_logo) ? (
                    <img 
                      src={item.institution_logo_url || item.institution_logo} 
                      alt={item.institution_name} 
                      className="w-full h-full object-cover" 
                      onError={(e) => {
                        e.target.onerror = null; 
                        e.target.src = "https://via.placeholder.com/48?text=Edu";
                      }}
                    />
                  ) : (
                    <span className="text-xl">🎓</span>
                  )}
               </div>

               <div className="min-w-0 flex-1">
                  <h3 className="font-bold text-white truncate text-lg">{item.degree_name}</h3>
                  <div className="flex items-center gap-2 text-sm text-slate-400">
                    <span className="truncate max-w-[200px]">{item.institution_name}</span>
                    <span>•</span>
                    {/* Display passing_year from backend property or format dates locally */}
                    <span>{item.passing_year}</span>
                    {item.is_current && (
                      <span className="text-xs bg-cyan-500/20 text-cyan-400 px-2 py-0.5 rounded border border-cyan-500/30 ml-2">
                        Current
                      </span>
                    )}
                  </div>
               </div>
            </div>

            <div className="flex items-center gap-2">
               <button 
                onClick={() => openEdit(item)}
                className="p-2 text-slate-400 hover:text-cyan-400 transition-colors rounded-lg hover:bg-white/5"
                title="Edit"
               >
                 ✏️
               </button>
               <button 
                onClick={(e) => handleDelete(e, item.id)}
                className="p-2 text-slate-400 hover:text-red-400 transition-colors rounded-lg hover:bg-white/5"
                title="Delete"
               >
                 🗑️
               </button>
            </div>
          </Reorder.Item>
        ))}
      </Reorder.Group>

      {educations.length === 0 && (
         <div className="text-center py-10 text-slate-500 border border-dashed border-white/10 rounded-xl">
            No education entries yet.<br/>Click "+ Add Education" to get started.
         </div>
      )}

      <FormModal
        isOpen={modalOpen}
        onClose={() => setModalOpen(false)}
        title={editing ? "Edit Education" : "Add Education"}
      >
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Degree Name</label>
            <input
              type="text"
              required
              value={formData.degree_name}
              onChange={(e) => set("degree_name", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:ring-1 ring-cyan-500 outline-none text-white placeholder-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Institution Name</label>
            <input
              type="text"
              required
              value={formData.institution_name}
              onChange={(e) => set("institution_name", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:ring-1 ring-cyan-500 outline-none text-white placeholder-slate-500"
            />
          </div>
          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Location <span className="text-xs text-slate-500">(Optional)</span></label>
            <input
              type="text"
              value={formData.location}
              placeholder="e.g. Dhaka, Bangladesh"
              onChange={(e) => set("location", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:ring-1 ring-cyan-500 outline-none text-white placeholder-slate-500"
            />
          </div>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium mb-1 text-slate-300">Type</label>
              <select
                value={formData.institution_type}
                onChange={(e) => set("institution_type", e.target.value)}
                className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:ring-1 ring-cyan-500 outline-none text-white [&>option]:bg-[#0d1117] [&>option]:text-white"
              >
                {INSTITUTION_TYPES.map(t => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
          </div>
          
           
          <div className="pt-2">
            <label className="flex items-center gap-2 cursor-pointer bg-white/5 p-3 rounded-lg border border-white/10 hover:bg-white/10 transition mb-4">
              <input
                type="checkbox"
                checked={formData.is_current}
                onChange={(e) => set("is_current", e.target.checked)}
                className="rounded bg-white/10 border-white/20 text-cyan-500 focus:ring-cyan-500/50"
              />
              <span className="text-sm text-slate-300">Currently Studying Here?</span>
            </label>
            
            <div className="grid grid-cols-2 gap-4">
                <div>
                   <label className="block text-sm font-medium mb-1 text-slate-300">
                     Start Date <span className="text-red-400">*</span>
                   </label>
                   <input
                     type="date"
                     required
                     value={formData.start_date}
                     onChange={(e) => set("start_date", e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:ring-1 ring-cyan-500 outline-none text-white placeholder-slate-500 scheme-dark"
                   />
                </div>
                <div>
                   <label className="block text-sm font-medium mb-1 text-slate-300">
                     {formData.is_current ? "Expected End Date" : "End Date"}
                   </label>
                   <input
                     type="date"
                     value={formData.end_date}
                     onChange={(e) => set("end_date", e.target.value)}
                     className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:ring-1 ring-cyan-500 outline-none text-white placeholder-slate-500 scheme-dark"
                   />
                </div>
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1 text-slate-300">Result (Optional)</label>
            <input
              type="text"
              value={formData.result}
              onChange={(e) => set("result", e.target.value)}
              className="w-full bg-white/5 border border-white/10 rounded px-3 py-2 focus:ring-1 ring-cyan-500 outline-none text-white placeholder-slate-500"
              placeholder="e.g. GPA 5.0"
            />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <ImageUploader 
                label="Institution Logo (Optional)"
                value={existingLogoUrl}
                onChange={setLogoFile}
            />
            <ImageUploader 
                label="Certificate (Image Only)"
                value={existingCertUrl}
                onChange={setCertFile}
                accept="image/*"
            />
          </div>
          
          <div className="flex gap-3 pt-4 border-t border-white/10 mt-6">
            <button
              type="button"
              onClick={() => setModalOpen(false)}
              className="flex-1 px-4 py-2 rounded-lg border border-white/10 text-slate-300 hover:bg-white/5 transition"
            >
              Cancel
            </button>
            <GlowButton type="submit" className="flex-1">
              {editing ? "Update Education" : "Save Education"}
            </GlowButton>
          </div>
        </form>
      </FormModal>
    </div>
  );
}
