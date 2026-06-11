import type { MockPreparationLine, MockOrderLine } from "./types";

export type PrepProgress = {
  totalLines: number;
  preparedLines: number;
  remainingLines: number;
  missingCount: number;
  percent: number;
  totalUnits: number;
  preparedUnits: number;
};

export function computePrepProgress(
  prepLines: MockPreparationLine[],
  openMissingCount: number
): PrepProgress {
  const totalLines = prepLines.length;
  if (totalLines === 0) {
    return {
      totalLines: 0,
      preparedLines: 0,
      remainingLines: 0,
      missingCount: openMissingCount,
      percent: 0,
      totalUnits: 0,
      preparedUnits: 0,
    };
  }

  const preparedLines = prepLines.filter(
    (l) => l.quantityPrepared >= l.quantityRequested
  ).length;

  const totalUnits = prepLines.reduce((sum, l) => sum + l.quantityRequested, 0);
  const preparedUnits = prepLines.reduce(
    (sum, l) => sum + Math.min(l.quantityPrepared, l.quantityRequested),
    0
  );

  const percent =
    totalUnits > 0
      ? Math.round((preparedUnits / totalUnits) * 100)
      : Math.round((preparedLines / totalLines) * 100);

  return {
    totalLines,
    preparedLines,
    remainingLines: totalLines - preparedLines,
    missingCount: openMissingCount,
    percent,
    totalUnits,
    preparedUnits,
  };
}

export function prepLineStatus(
  line: MockPreparationLine
): "complete" | "partial" | "pending" {
  if (line.quantityPrepared >= line.quantityRequested) return "complete";
  if (line.quantityPrepared > 0) return "partial";
  return "pending";
}

export function buildPreparationLine(
  orderLine: MockOrderLine,
  reference?: string,
  overrides?: Partial<MockPreparationLine>
): MockPreparationLine {
  return {
    id: `prep-${orderLine.id}`,
    eventId: orderLine.eventId,
    orderLineId: orderLine.id,
    productId: orderLine.productId,
    designation: orderLine.designation,
    reference,
    quantityRequested: orderLine.quantityRequested,
    quantityPrepared: 0,
    ...overrides,
  };
}

export function formatDepartureTime(time: string) {
  const [h, m] = time.split(":");
  return `${h}h${m ?? "00"}`;
}
