import {
  EVENT_STATUS_LABELS,
  type EventStatus,
} from "@eventrack/shared";
import { Badge } from "@eventrack/ui";

const STATUS_VARIANT: Record<
  EventStatus,
  "default" | "secondary" | "success" | "warning" | "critical" | "outline"
> = {
  draft: "outline",
  to_prepare: "warning",
  preparing: "secondary",
  ready: "success",
  in_delivery: "secondary",
  completed: "default",
  cancelled: "critical",
};

export function EventStatusBadge({ status }: { status: EventStatus }) {
  return (
    <Badge variant={STATUS_VARIANT[status]}>
      {EVENT_STATUS_LABELS[status]}
    </Badge>
  );
}

export function AvailabilityBadge({
  variant,
  label,
}: {
  variant: "success" | "warning" | "critical" | "secondary";
  label: string;
}) {
  const mapped =
    variant === "secondary" ? "default" : variant === "critical" ? "critical" : variant;
  return <Badge variant={mapped as "success" | "warning" | "critical" | "default"}>{label}</Badge>;
}

import type { MissingWorkflowStatus } from "@/lib/mock/types";
import { MISSING_WORKFLOW_LABELS } from "@/lib/mock/missing-workflow";

const MISSING_VARIANT: Record<
  MissingWorkflowStatus,
  "default" | "secondary" | "success" | "warning" | "critical" | "outline"
> = {
  declared: "critical",
  commercial_response: "warning",
  replacement_done: "secondary",
  closed: "success",
};

export function MissingStatusBadge({
  status,
}: {
  status: MissingWorkflowStatus;
}) {
  return (
    <Badge variant={MISSING_VARIANT[status]}>
      {MISSING_WORKFLOW_LABELS[status]}
    </Badge>
  );
}
