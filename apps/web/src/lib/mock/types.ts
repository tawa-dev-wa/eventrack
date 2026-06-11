import type {
  EventStatus,
  MissingResponseType,
  OrderSection,
} from "@eventrack/shared";

export interface MockProduct {
  id: string;
  reference: string;
  name: string;
  category: string;
  stockTotal: number;
  stockAvailable: number;
  stockReserved: number;
  stockBroken: number;
  location: string;
  photoColor: string;
  photoUrls?: string[];
  /** Poids relatif / priorité de chargement (100 = le plus lourd, en fond de palette). */
  prepPriority: number;
  /** Unités par caisse (1 = pas de conditionnement caisse). */
  packSize: number;
}

export interface MockOrderLine {
  id: string;
  eventId: string;
  section: OrderSection;
  productId: string;
  designation: string;
  quantityRequested: number;
}

export interface MockStockAllocation {
  id: string;
  productId: string;
  quantity: number;
  status: "available" | "reserved" | "out" | "broken";
  eventId?: string;
  eventName?: string;
  truckName?: string;
  expectedReturn?: string;
}

export type MissingWorkflowStatus =
  | "declared"
  | "commercial_response"
  | "replacement_done"
  | "closed";

export interface MockMissingHistoryEntry {
  id: string;
  type:
    | "declared"
    | "commercial_response"
    | "replacement_done"
    | "closed"
    | "auto_resolved";
  label: string;
  detail: string;
  userName: string;
  at: string;
}

export interface MockNotification {
  id: string;
  type: "missing_response" | "missing_declared";
  title: string;
  body: string;
  eventId?: string;
  missingItemId?: string;
  read: boolean;
  createdAt: string;
}

export interface MockMissingItem {
  id: string;
  eventId: string;
  eventName: string;
  productId?: string;
  preparationLineId?: string;
  designation: string;
  reference?: string;
  quantityRequested: number;
  quantityFound: number;
  comment?: string;
  photoUrl?: string;
  workflowStatus: MissingWorkflowStatus;
  responseType?: MissingResponseType;
  commercialResponse?: string;
  respondedBy?: string;
  respondedAt?: string;
  replacementConfirmedBy?: string;
  replacementConfirmedAt?: string;
  history: MockMissingHistoryEntry[];
  createdBy: string;
  createdAt: string;
}

export interface MockModification {
  id: string;
  eventId: string;
  eventName: string;
  userName: string;
  time: string;
  detail: string;
}

export interface MockTruck {
  id: string;
  name: string;
  status: "available" | "on_route";
  currentLocation?: string;
  nextStop?: string;
}

export interface MockPrepAction {
  id: string;
  eventId: string;
  lineId: string;
  designation: string;
  reference?: string;
  quantityPrepared: number;
  quantityRequested: number;
  action: "validated" | "updated" | "missing" | "replacement";
  userName: string;
  at: string;
}

export interface MockEvent {
  id: string;
  name: string;
  clientName: string;
  date: string;
  startTime: string;
  departureTime: string;
  endTime?: string;
  address: string;
  guestsAdults: number;
  guestsChildren: number;
  eventType: string;
  commercial: string;
  /** Préparateur assigné à cette commande. */
  assignedPreparer?: string;
  driver?: string;
  truckId?: string;
  status: EventStatus;
  comments: string;
  createdAt: string;
}

export interface MockInventoryLine {
  productId: string;
  productName: string;
  reference: string;
  expectedDepot: number;
  countedDepot: number;
  variance: number;
  onPrestation: number;
  stockTotal: number;
}

export interface MockInventorySession {
  id: string;
  date: string;
  zoneId: string;
  zoneLabel: string;
  userName: string;
  lines: MockInventoryLine[];
  completedAt: string;
}

export interface MockPreparationLine {
  id: string;
  eventId: string;
  orderLineId: string;
  productId: string;
  designation: string;
  reference?: string;
  quantityRequested: number;
  quantityPrepared: number;
  validatedAt?: string;
  validatedBy?: string;
}

export interface MockStockAdjustment {
  id: string;
  productId: string;
  type: "inventory" | "manual";
  quantity: number;
  note?: string;
  userName: string;
  at: string;
}

export type MockStore = {
  events: MockEvent[];
  products: MockProduct[];
  orderLines: MockOrderLine[];
  preparationLines: MockPreparationLine[];
  missingItems: MockMissingItem[];
  notifications: MockNotification[];
  prepActions: MockPrepAction[];
  stockAllocations: MockStockAllocation[];
  stockAdjustments: MockStockAdjustment[];
  inventorySessions: MockInventorySession[];
  modifications: MockModification[];
  trucks: MockTruck[];
};
