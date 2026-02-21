// Simple placeholder - follows same pattern as Projects
export default function ResearchAdmin() {
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">Research Papers</h1>
        <p className="text-gray-400">Manage research publications (following same CRUD pattern)</p>
      </div>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">🔬</div>
        <p className="text-gray-400 text-lg">
          Research admin follows the same pattern as Projects/Blog admin.
          <br />
          Add DataTable + FormModal with fields: title, abstract, status, technologies, methodology
        </p>
      </div>
    </div>
  );
}
