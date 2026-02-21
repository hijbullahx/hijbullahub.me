// Simple placeholder - follows same pattern as Skills/Projects
export default function AchievementsAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Achievements</h1>
        <p className="text-gray-400">Manage awards and certifications (following same CRUD pattern)</p>
      </div>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">🏆</div>
        <p className="text-gray-400 text-lg">
          Achievements admin follows the same pattern as Projects/Skills admin.
          <br />
          Add DataTable + FormModal with fields: title, issuer, date, badge_image, certificate_link
        </p>
      </div>
    </div>
  );
}
