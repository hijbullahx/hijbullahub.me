import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import api from "../../api/client";
import ImageUploader from "../components/ImageUploader";
import { useToast } from "../components/ToastContext";
import GlowButton from "../../components/GlowButton";

export default function HeroAdmin() {
  const [hero, setHero] = useState(null);
  const [loading, setLoading] = useState(true);
  const [formData, setFormData] = useState({
    name: "",
    tagline: "",
    short_bio: "",
    background_type: "gradient",
  });
  const [profileImage, setProfileImage] = useState(null);
  const toast = useToast();

  useEffect(() => {
    fetchHero();
  }, []);

  const fetchHero = async () => {
    try {
      const response = await api.get("/hero/");
      const data = response.data.results?.[0] || response.data[0];
      if (data) {
        setHero(data);
        setFormData({
          name: data.name || "",
          tagline: data.tagline || "",
          short_bio: data.short_bio || "",
          background_type: data.background_type || "gradient",
        });
      }
    } catch (error) {
      toast.error("Failed to fetch hero data");
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

    if (profileImage) {
      data.append("profile_image", profileImage);
    }

    try {
      if (hero) {
        await api.patch(`/hero/${hero.id}/`, data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Hero section updated successfully");
      } else {
        await api.post("/hero/", data, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        toast.success("Hero section created successfully");
      }
      fetchHero();
    } catch (error) {
      toast.error("Failed to update hero section");
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
        <h1 className="text-3xl font-bold text-white mb-2">Hero Section</h1>
        <p className="text-gray-400">Edit the main landing page hero content</p>
      </div>

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8"
      >
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-2 gap-6">
            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Name / Heading
              </label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                required
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Your Name"
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Tagline (Animated Text)
              </label>
              <input
                type="text"
                value={formData.tagline}
                onChange={(e) => setFormData({ ...formData, tagline: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="AI Engineer | ML Specialist | etc."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Short Bio
              </label>
              <textarea
                value={formData.short_bio}
                onChange={(e) => setFormData({ ...formData, short_bio: e.target.value })}
                rows={4}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
                placeholder="Brief introduction..."
              />
            </div>

            <div className="col-span-2">
              <label className="block text-sm font-medium text-gray-300 mb-2">
                Background Type
              </label>
              <select
                value={formData.background_type}
                onChange={(e) => setFormData({ ...formData, background_type: e.target.value })}
                className="w-full px-4 py-3 bg-white/5 border border-white/10 rounded-lg text-white focus:ring-2 focus:ring-cyan-500/50 focus:border-transparent"
              >
                <option value="gradient">Gradient</option>
                <option value="particles">Particles</option>
                <option value="solid">Solid Color</option>
              </select>
            </div>

            <div className="col-span-2">
              <ImageUploader
                value={hero?.profile_image}
                onChange={setProfileImage}
                label="Profile Image"
              />
            </div>

          </div>

          <div className="flex justify-end pt-4 border-t border-white/10">
            <GlowButton type="submit">
              Save Hero Section
            </GlowButton>
          </div>
        </form>
      </motion.div>
    </div>
  );
}
