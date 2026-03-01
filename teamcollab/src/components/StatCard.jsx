const colorMap = {
  blue: "bg-blue-600",
  teal: "bg-teal-600",
  green: "bg-emerald-600",
  orange: "bg-amber-600",
};

export default function StatCard({ title, value, color = "blue" }) {
  return (
    <div className={`p-5 rounded-xl border border-slate-700 ${colorMap[color] || colorMap.blue} text-white`}>
      <p className="text-white/90 text-sm">{title}</p>
      <h2 className="text-2xl font-bold mt-1">{value}</h2>
    </div>
  );
}
