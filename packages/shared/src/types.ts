import type { EventStatus, MissingResponseType, OrderSection } from "./constants";
import type { Role } from "./roles";

export interface OrganizationSettings {
  timezone?: string;
  defaultPreparationLeadHours?: number;
}

export interface EventSummary {
  id: string;
  name: string;
  clientName: string;
  date: Date;
  status: EventStatus;
  guestsAdults: number;
  guestsChildren: number;
  commercialName?: string;
}

export interface ProductSearchResult {
  id: string;
  reference: string;
  name: string;
  photoUrl?: string;
  stockAvailable: number;
  locationLabel?: string;
}

export interface OrderLineInput {
  section: OrderSection;
  productId?: string;
  designation: string;
  quantityRequested: number;
  notes?: string;
}

export interface EventModificationEntry {
  id: string;
  userName: string;
  field: string;
  oldValue: string;
  newValue: string;
  comment?: string;
  createdAt: Date;
}

export interface MissingItemSummary {
  id: string;
  productName: string;
  quantityMissing: number;
  status: string;
  responseType?: MissingResponseType;
}

export interface DashboardStats {
  eventsToday: number;
  eventsThisWeek: number;
  criticalMissing: number;
  trucksOnRoute: number;
  materialOutOfDepot: number;
  expectedReturns: number;
  recentModifications: number;
}

export interface SessionUser {
  id: string;
  name: string;
  email: string;
  image?: string | null;
  role?: Role;
  organizationId?: string;
  organizationName?: string;
}
