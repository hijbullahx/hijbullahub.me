// Site Settings - singleton form
export default function SettingsAdmin() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Site Settings</h1>
        <p className="text-gray-400">Global site configuration (singleton form)</p>
      </div>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">⚙️</div>
        <p className="text-gray-400 text-lg">
          Settings admin follows the same pattern as Hero admin (single record).
          <br />
          Fields: site_title, meta_description, email, github_username, linkedin_url, social_links
        </p>
      </div>
    </div>
  );
}
