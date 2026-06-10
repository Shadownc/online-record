import { Badge } from "@/components/ui/badge";
import { Card } from "@/components/ui/card";

type PageHeaderProps = {
  badge?: string;
  title: string;
  description?: string;
  actions?: React.ReactNode;
  stats?: Array<{ label: string; value: string | number }>;
};

export function PageHeader({ badge, title, description, actions, stats }: PageHeaderProps) {
  return (
    <Card>
      <div className="flex flex-col gap-5 md:flex-row md:items-start md:justify-between">
        <div className="flex-1">
          {badge && <Badge live>{badge}</Badge>}
          <h1 className="mt-4 font-heading text-2xl font-bold text-white md:text-3xl">{title}</h1>
          {description && <p className="mt-3 max-w-2xl text-sm leading-relaxed text-stardust">{description}</p>}
          {stats && stats.length > 0 && (
            <div className="mt-5 flex flex-wrap gap-4 font-mono text-xs uppercase tracking-widest text-stardust">
              {stats.map((stat, index) => (
                <div key={index}>
                  {stat.label} <span className="text-white">{stat.value}</span>
                </div>
              ))}
            </div>
          )}
        </div>
        {actions && <div className="flex shrink-0 flex-wrap gap-3">{actions}</div>}
      </div>
    </Card>
  );
}
