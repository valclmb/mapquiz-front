import { Badge } from "../ui/badge";
import { STATUS_CONFIG } from "./PlayerStatusConfig";

export function PlayerStatusBadge({ status }: { status?: string }) {
  const statusConfig = STATUS_CONFIG[status as keyof typeof STATUS_CONFIG];
  if (!statusConfig) return null;
  return (
    <Badge variant="outline" className={statusConfig.style}>
      {statusConfig.label}
    </Badge>
  );
}
