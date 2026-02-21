// About page - single record form (like Hero)
export default function AboutAdmin() {
  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <div>
        <h1 className="text-3xl font-bold text-white mb-2">About Section</h1>
        <p className="text-gray-400">Edit about page content (singleton form like Hero)</p>
      </div>
      <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-12 text-center">
        <div className="text-6xl mb-4">👤</div>
        <p className="text-gray-400 text-lg">
          About admin follows the same pattern as Hero admin (single record).
          <br />
          Fields: mission_statement, long_bio, vision_2030, quote, profile_image
        </p>
      </div>
    </div>
  );
}
