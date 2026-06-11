/**
 * AI Document Import Pipeline — V2 Premium
 * Architecture prête en V1, implémentation OCR en V2.
 */

export type DocumentSourceType = "photo" | "pdf" | "scan";

export type ImportJobStatus =
  | "queued"
  | "processing"
  | "review"
  | "completed"
  | "failed";

export interface ExtractedOrderLine {
  designation: string;
  quantity?: number;
  section?: string;
  confidence: number;
}

export interface ExtractedOrderData {
  eventName?: string;
  clientName?: string;
  date?: string;
  address?: string;
  guests?: number;
  orderLines: ExtractedOrderLine[];
  remarks: string[];
  confidence: number;
}

export interface DocumentImportJob {
  id: string;
  organizationId: string;
  sourceType: DocumentSourceType;
  fileUrl: string;
  status: ImportJobStatus;
  extractedData?: ExtractedOrderData;
  errorMessage?: string;
}

export interface DocumentProcessor {
  process(job: DocumentImportJob): Promise<ExtractedOrderData>;
}

export class NullDocumentProcessor implements DocumentProcessor {
  async process(): Promise<ExtractedOrderData> {
    throw new Error(
      "Import IA non disponible — fonctionnalité premium EVENTRACK PRO AI (V2)"
    );
  }
}

export const AI_PIPELINE_QUEUE = "ai-import" as const;
