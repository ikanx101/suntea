import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "turquoise",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "turquoise" | "mint" | "ocean" | "rose";
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    turquoise: "from-turquoise-500 to-aqua-400",
    mint: "from-mint-500 to-mint-400",
    ocean: "from-ocean-600 to-ocean-400",
    rose: "from-rose-500 to-rose-400",
  };

  return (
    <div className="card flex items-start gap-4">
      <div className={clsx("rounded-2xl bg-gradient-to-br p-3 text-white", toneClasses[tone])}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-ocean-500">{label}</p>
        <p className="font-heading text-xl font-bold text-turquoise-800">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-ocean-400">{hint}</p>}
      </div>
    </div>
  );
}
