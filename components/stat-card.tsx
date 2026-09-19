import type { LucideIcon } from "lucide-react";
import clsx from "clsx";

export default function StatCard({
  label,
  value,
  icon: Icon,
  tone = "pink",
  hint,
}: {
  label: string;
  value: string;
  icon: LucideIcon;
  tone?: "pink" | "mint" | "lavender" | "coral";
  hint?: string;
}) {
  const toneClasses: Record<string, string> = {
    pink: "from-hotpink-500 to-hotpink-400",
    mint: "from-mint-500 to-mint-400",
    lavender: "from-lavender-500 to-lavender-400",
    coral: "from-coral-500 to-coral-400",
  };

  return (
    <div className="card flex items-start gap-4">
      <div className={clsx("rounded-2xl bg-gradient-to-br p-3 text-white", toneClasses[tone])}>
        <Icon size={22} />
      </div>
      <div>
        <p className="text-sm font-medium text-lavender-500">{label}</p>
        <p className="font-heading text-xl font-bold text-hotpink-800">{value}</p>
        {hint && <p className="mt-0.5 text-xs text-lavender-400">{hint}</p>}
      </div>
    </div>
  );
}
