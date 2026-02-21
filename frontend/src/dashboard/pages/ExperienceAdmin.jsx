// Simple placeholder - follows same pattern as Skills/Projects
export default function ExperienceAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Experience</h1>
        <p className="text-gray-400">Manage work experience (following same CRUD pattern as Projects)</p>
      </div>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">💼</div>
        <p className="text-gray-400 text-lg">
          Experience admin follows the same pattern as Projects/Skills admin.
          <br />
          Add DataTable + FormModal with fields: title, company, duration, description, logo
        </p>
      </div>
    </div>
  );
}
