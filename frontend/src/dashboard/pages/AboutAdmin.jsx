import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import ImageUploader from "../components/ImageUploader";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";

export default function AboutAdmin() {
  const [about, setAbout] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    mission_statement: "",
    long_bio: "",
    vision_2030: "",
    quote: "",
  });
  const [aboutImage, setAboutImage] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchAbout();
  }, []);

  const fetchAbout = async () => {
    try {
      const response = await api.get("/about/");
      const data = response.data.results?.[0] || response.data[0];
      if (data) {
        setAbout(data);
        setFormData({
          mission_statement: data.mission_statement || "",
          long_bio: data.long_bio || "",
          vision_2030: data.vision_2030 || "",
          quote: data.quote || "",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch about data");
    } finally {
      setLoading(false);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();

    const data = new FormData();
    Object.keys(formData).forEach((key) => {
      data.append(key, formData[key]);
    });

    if (aboutImage) {
      data.append("image", aboutImage);
    }

    try {
      if (about) {
        await api.patch(`/about/${about.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("About section updated successfully");
      } else {
        await api.post("/about/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("About section created successfully");
      }
      fetchAbout();
    } catch (error) {
      toast.error("Failed to update about section");
    }
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-12 h-12 border-4 border-cyan-500/30 border-t-cyan-500 rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Mission & Vision</h1>
        <p className="text-gray-400">Edit Mission, Vision, Quote & Biography</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 gap-6">
            {/* Mission Statement */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Mission Statement
              </label>
              <textarea
                value={formData.mission_statement}
                onChange={(e) => setFormData({ ...formData, mission_statement: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Your mission statement..."
              />
            </div>

            {/* Vision */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Vision
              </label>
              <textarea
                value={formData.vision_2030}
                onChange={(e) => setFormData({ ...formData, vision_2030: e.target.value })}
                required
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Your vision..."
              />
            </div>

            {/* Quote */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Quote <span className="text-gray-500 text-xs">(Optional - displays below Mission & Vision)</span>
              </label>
              <input
                type="text"
                value={formData.quote}
                onChange={(e) => setFormData({ ...formData, quote: e.target.value })}
                maxLength={255}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="An inspirational quote..."
              />
              <p className="mt-1 text-xs text-gray-500">
                {formData.quote.length}/255 characters
              </p>
            </div>

            {/* Long Bio */}
            <div>
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Biography <span className="text-gray-500 text-xs">(Detailed biography)</span>
              </label>
              <textarea
                value={formData.long_bio}
                onChange={(e) => setFormData({ ...formData, long_bio: e.target.value })}
                required
                rows={6}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Your detailed biography..."
              />
            </div>

            {/* Image Uploader */}
            <div>
              <ImageUploader
                value={about?.image}
                onChange={setAboutImage}
                label="About Image (Optional)"
              />
            </div>
          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <GlowButton type="submit">
              Save Changes
            </GlowButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
