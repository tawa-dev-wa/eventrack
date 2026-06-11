"use client";



import {

  createContext,

  useCallback,

  useContext,

  useMemo,

  useState,

  type ReactNode,

  type SetStateAction,

} from "react";

import type {

  EventStatus,

  MissingResponseType,

  OrderSection,

} from "@eventrack/shared";

import { initialMockStore } from "./seed";

import type {

  MockEvent,

  MockMissingHistoryEntry,

  MockMissingItem,

  MockModification,

  MockNotification,

  MockOrderLine,

  MockPreparationLine,

  MockPrepAction,

  MockProduct,

  MockStore,

  MockInventoryLine,

  MockInventorySession,
} from "./types";
import {
  applyDepotDelta,
  buildStockAdjustment,
  getDepotAllocation,
  updateProductStock,
} from "./stock-ops";
import {
  computeStockReliability,
  estimateMissionMinutes,
  getExpectedDepotStock,
  getMissionProducts,
  getOnPrestationCount,
  getRotationForDate,
} from "@/lib/inventory";
import { DEMO_DATE } from "@/lib/demo-date";

import {

  formatCommercialResponse,

  getEventMissingSummary,

  isMissingActive,

  missingQuantity,

  needsCommercialAction,

} from "./missing-workflow";

import { buildPreparationLine, computePrepProgress, type PrepProgress } from "./preparation";



type CreateEventInput = {

  name: string;

  clientName: string;

  date: string;

  startTime: string;

  departureTime: string;

  address: string;

  guestsAdults: number;

  guestsChildren: number;

  eventType: string;

  comments?: string;

};



type CreateMissingInput = {

  eventId: string;

  productId?: string;

  designation: string;

  reference?: string;

  quantityRequested: number;

  quantityFound: number;

  comment?: string;

};



type CreateMissingFromPrepInput = {

  prepLineId: string;

  missingQuantity: number;

  comment?: string;

  photoUrl?: string;

  preparedBy?: string;

};



const COMMERCIAL_USER = "Mina";

const PREP_USER = "Kevin";



function historyEntry(

  type: MockMissingHistoryEntry["type"],

  label: string,

  detail: string,

  userName: string

): MockMissingHistoryEntry {

  return {

    id: uid("mh"),

    type,

    label,

    detail,

    userName,

    at: new Date().toISOString(),

  };

}



function makePrepAction(

  line: MockPreparationLine,

  action: MockPrepAction["action"],

  userName: string,

  quantityPrepared = line.quantityPrepared

): MockPrepAction {

  return {

    id: uid("pa"),

    eventId: line.eventId,

    lineId: line.id,

    designation: line.designation,

    reference: line.reference,

    quantityPrepared,

    quantityRequested: line.quantityRequested,

    action,

    userName,

    at: new Date().toISOString(),

  };

}



function autoResolveMissingForLine(

  items: MockMissingItem[],

  line: MockPreparationLine

): MockMissingItem[] {

  if (line.quantityPrepared < line.quantityRequested) return items;



  return items.map((m) => {

    if (m.workflowStatus === "closed") return m;

    const linked =

      m.preparationLineId === line.id ||

      (m.eventId === line.eventId && m.productId === line.productId);

    if (!linked) return m;

    return {

      ...m,

      workflowStatus: "closed" as const,

      quantityFound: line.quantityRequested,

      commercialResponse:

        m.commercialResponse ?? "Résolu automatiquement — préparation complète",

      responseType: m.responseType ?? ("cancelled" as MissingResponseType),

      history: [

        ...m.history,

        historyEntry(

          "auto_resolved",

          "Clos automatiquement",

          "Préparation complète",

          PREP_USER

        ),

      ],

    };

  });

}



interface MockStoreContextValue extends MockStore {

  openMissingCount: number;

  unreadNotificationCount: number;

  trucksOnRoute: number;

  expectedReturns: number;

  getEvent: (id: string) => MockEvent | undefined;

  getProduct: (id: string) => MockProduct | undefined;

  getOrderLines: (eventId: string) => MockOrderLine[];

  getPreparationLines: (eventId: string) => MockPreparationLine[];

  getEventPrepProgress: (eventId: string) => PrepProgress;

  getEventMissing: (eventId: string) => MockMissingItem[];

  getMissingForPrepLine: (prepLineId: string) => MockMissingItem | undefined;

  getEventMissingSummary: (eventId: string) => ReturnType<typeof getEventMissingSummary>;

  getProductAllocations: (productId: string) => MockStore["stockAllocations"];

  getProductStockAdjustments: (productId: string) => MockStore["stockAdjustments"];

  adjustDepotStock: (
    productId: string,
    delta: number,
    note?: string,
    userName?: string
  ) => { ok: true } | { ok: false; error: string };

  getTodayInventoryMission: (date?: string) => {
    zoneId: string;
    zoneLabel: string;
    emoji: string;
    productCount: number;
    estimatedMinutes: number;
    products: MockProduct[];
  };

  submitInventorySession: (
    counts: { productId: string; countedDepot: number }[],
    userName?: string,
    date?: string
  ) => MockInventorySession;

  getInventoryHistory: () => MockInventorySession[];

  getStockReliability: () => number;

  getEventPrepActions: (eventId: string) => MockPrepAction[];

  searchProducts: (query: string) => MockProduct[];

  createEvent: (input: CreateEventInput) => MockEvent;

  updateEvent: (id: string, patch: Partial<MockEvent>) => void;

  updateEventComments: (id: string, comments: string) => void;

  addOrderLine: (

    eventId: string,

    section: OrderSection,

    product: MockProduct,

    quantity: number

  ) => void;

  updateOrderLineQuantity: (

    lineId: string,

    quantity: number,

    userName?: string

  ) => void;

  updatePreparationQuantity: (

    lineId: string,

    quantity: number,

    preparedBy?: string

  ) => void;

  validatePreparationLine: (lineId: string, preparedBy?: string) => void;

  createMissingFromPrep: (input: CreateMissingFromPrepInput) => void;

  syncPreparationFromOrder: (eventId: string) => void;

  createMissing: (input: CreateMissingInput) => void;

  respondToMissing: (

    id: string,

    responseType: MissingResponseType,

    comment: string,

    respondedBy?: string

  ) => void;

  confirmMissingReplacement: (id: string, confirmedBy?: string) => void;

  markNotificationRead: (id: string) => void;

  markAllNotificationsRead: () => void;

  getLineAvailability: (productId: string, quantity: number) => {

    status: "available" | "low" | "missing";

    label: string;

    variant: "success" | "warning" | "critical";

  };

  updateProductPrepPriority: (productId: string, prepPriority: number) => void;

  updateProductPackSize: (productId: string, packSize: number) => void;

}



const MockStoreContext = createContext<MockStoreContextValue | null>(null);



function uid(prefix: string) {

  return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;

}



export function MockStoreProvider({
  children,
  isolated: _isolated = false,
}: {
  children: ReactNode;
  /** Store local isolé (parcours intérimaire démo, sans partage avec le desktop). */
  isolated?: boolean;
}) {

  const [store, setStore] = useState<MockStore>(() =>
    structuredClone(initialMockStore)
  );



  const getEvent = useCallback(

    (id: string) => store.events.find((e) => e.id === id),

    [store.events]

  );



  const getProduct = useCallback(

    (id: string) => store.products.find((p) => p.id === id),

    [store.products]

  );



  const getPreparationLines = useCallback(

    (eventId: string) =>

      store.preparationLines.filter((l) => l.eventId === eventId),

    [store.preparationLines]

  );



  const getEventPrepProgress = useCallback(

    (eventId: string) => {

      const prepLines = store.preparationLines.filter(

        (l) => l.eventId === eventId

      );

      const openMissing = store.missingItems.filter(

        (m) => m.eventId === eventId && isMissingActive(m)

      ).length;

      return computePrepProgress(prepLines, openMissing);

    },

    [store.preparationLines, store.missingItems]

  );



  const getOrderLines = useCallback(

    (eventId: string) =>

      store.orderLines.filter((l) => l.eventId === eventId),

    [store.orderLines]

  );



  const getEventMissing = useCallback(

    (eventId: string) =>

      store.missingItems.filter((m) => m.eventId === eventId),

    [store.missingItems]

  );



  const getMissingForPrepLine = useCallback(

    (prepLineId: string) =>

      store.missingItems.find(

        (m) =>

          m.preparationLineId === prepLineId &&

          isMissingActive(m)

      ),

    [store.missingItems]

  );



  const getEventMissingSummaryFn = useCallback(

    (eventId: string) => getEventMissingSummary(getEventMissing(eventId)),

    [getEventMissing]

  );



  const getEventPrepActions = useCallback(
    (eventId: string) =>
      store.prepActions.filter((a) => a.eventId === eventId),
    [store.prepActions]
  );



  const getProductAllocations = useCallback(

    (productId: string) =>

      store.stockAllocations.filter((a) => a.productId === productId),

    [store.stockAllocations]

  );



  const searchProducts = useCallback(

    (query: string) => {

      const q = query.trim().toLowerCase();

      if (!q) return store.products;

      return store.products.filter(

        (p) =>

          p.name.toLowerCase().includes(q) ||

          p.reference.includes(q) ||

          p.category.toLowerCase().includes(q)

      );

    },

    [store.products]

  );



  const getLineAvailability = useCallback(

    (productId: string, quantity: number) => {

      const product = store.products.find((p) => p.id === productId);

      const available = product?.stockAvailable ?? 0;

      if (quantity <= available) {

        return {

          status: "available" as const,

          label: "Disponible",

          variant: "success" as const,

        };

      }

      if (available > 0) {

        return {

          status: "low" as const,

          label: "Quantité faible",

          variant: "warning" as const,

        };

      }

      return {

        status: "missing" as const,

        label: "Indisponible",

        variant: "critical" as const,

      };

    },

    [store.products]

  );



  const syncPreparationFromOrder = useCallback((eventId: string) => {

    setStore((prev) => {

      const orderLines = prev.orderLines.filter((l) => l.eventId === eventId);

      const existing = prev.preparationLines.filter(

        (l) => l.eventId === eventId

      );

      const existingByOrder = new Map(

        existing.map((l) => [l.orderLineId, l])

      );



      const nextPrep = orderLines.map((ol) => {

        const product = prev.products.find((p) => p.id === ol.productId);

        const current = existingByOrder.get(ol.id);

        if (current) {

          return {

            ...current,

            quantityRequested: ol.quantityRequested,

            designation: ol.designation,

            reference: product?.reference,

          };

        }

        return buildPreparationLine(ol, product?.reference);

      });



      const other = prev.preparationLines.filter(

        (l) => l.eventId !== eventId

      );

      return {

        ...prev,

        preparationLines: [...other, ...nextPrep],

      };

    });

  }, []);



  const createEvent = useCallback((input: CreateEventInput) => {

    const event: MockEvent = {

      id: uid("evt"),

      ...input,

      commercial: COMMERCIAL_USER,

      status: "draft" as EventStatus,

      comments: input.comments ?? "",

      createdAt: new Date().toISOString(),

    };

    setStore((prev) => ({ ...prev, events: [event, ...prev.events] }));

    return event;

  }, []);



  const updateEvent = useCallback((id: string, patch: Partial<MockEvent>) => {

    setStore((prev) => ({

      ...prev,

      events: prev.events.map((e) => (e.id === id ? { ...e, ...patch } : e)),

    }));

  }, []);



  const updateEventComments = useCallback((id: string, comments: string) => {

    updateEvent(id, { comments });

  }, [updateEvent]);



  const addOrderLine = useCallback(

    (

      eventId: string,

      section: OrderSection,

      product: MockProduct,

      quantity: number

    ) => {

      const line: MockOrderLine = {

        id: uid("ol"),

        eventId,

        section,

        productId: product.id,

        designation: product.name,

        quantityRequested: quantity,

      };

      const mod: MockModification = {

        id: uid("mod"),

        eventId,

        eventName: store.events.find((e) => e.id === eventId)?.name ?? "",

        userName: COMMERCIAL_USER,

        time: new Date().toLocaleTimeString("fr-FR", {

          hour: "2-digit",

          minute: "2-digit",

        }),

        detail: `${product.name} — +${quantity} unités ajoutées`,

      };

      setStore((prev) => ({

        ...prev,

        orderLines: [...prev.orderLines, line],

        preparationLines: [

          ...prev.preparationLines,

          buildPreparationLine(line, product.reference),

        ],

        modifications: [mod, ...prev.modifications],

      }));

    },

    [store.events]

  );



  const updateOrderLineQuantity = useCallback(

    (lineId: string, quantity: number, userName = COMMERCIAL_USER) => {

      setStore((prev) => {

        const line = prev.orderLines.find((l) => l.id === lineId);

        if (!line) return prev;

        const mod: MockModification = {

          id: uid("mod"),

          eventId: line.eventId,

          eventName:

            prev.events.find((e) => e.id === line.eventId)?.name ?? "",

          userName,

          time: new Date().toLocaleTimeString("fr-FR", {

            hour: "2-digit",

            minute: "2-digit",

          }),

          detail: `${line.designation} — ${line.quantityRequested} → ${quantity}`,

        };

        return {

          ...prev,

          orderLines: prev.orderLines.map((l) =>

            l.id === lineId ? { ...l, quantityRequested: quantity } : l

          ),

          preparationLines: prev.preparationLines.map((p) =>

            p.orderLineId === lineId

              ? { ...p, quantityRequested: quantity }

              : p

          ),

          modifications: [mod, ...prev.modifications],

        };

      });

    },

    []

  );



  const updatePreparationQuantity = useCallback(

    (lineId: string, quantity: number, preparedBy = PREP_USER) => {

      setStore((prev) => {

        const line = prev.preparationLines.find((l) => l.id === lineId);

        if (!line) return prev;



        const clamped = Math.max(

          0,

          Math.min(quantity, line.quantityRequested)

        );

        const isComplete = clamped >= line.quantityRequested;

        const time = new Date().toLocaleTimeString("fr-FR", {

          hour: "2-digit",

          minute: "2-digit",

        });



        const mod: MockModification = {

          id: uid("mod"),

          eventId: line.eventId,

          eventName:

            prev.events.find((e) => e.id === line.eventId)?.name ?? "",

          userName: preparedBy,

          time,

          detail: `Préparation — ${line.designation}${line.reference ? ` ${line.reference}` : ""} : ${clamped}/${line.quantityRequested}`,

        };



        const updatedLine = {

          ...line,

          quantityPrepared: clamped,

          validatedAt: isComplete ? new Date().toISOString() : line.validatedAt,

          validatedBy: isComplete ? preparedBy : line.validatedBy,

        };



        const resolvedMissing = autoResolveMissingForLine(

          prev.missingItems,

          updatedLine

        );



        const prepActions = isComplete

          ? [

              makePrepAction(updatedLine, "validated", preparedBy, clamped),

              ...prev.prepActions,

            ]

          : prev.prepActions;



        return {

          ...prev,

          preparationLines: prev.preparationLines.map((l) =>

            l.id === lineId ? updatedLine : l

          ),

          missingItems: resolvedMissing,

          prepActions,

          modifications: [mod, ...prev.modifications],

        };

      });

    },

    []

  );



  const validatePreparationLine = useCallback(

    (lineId: string, preparedBy = PREP_USER) => {

      setStore((prev) => {

        const line = prev.preparationLines.find((l) => l.id === lineId);

        if (!line) return prev;



        const time = new Date().toLocaleTimeString("fr-FR", {

          hour: "2-digit",

          minute: "2-digit",

        });



        const mod: MockModification = {

          id: uid("mod"),

          eventId: line.eventId,

          eventName:

            prev.events.find((e) => e.id === line.eventId)?.name ?? "",

          userName: preparedBy,

          time,

          detail: `Préparation — ${line.designation}${line.reference ? ` ${line.reference}` : ""} : ${line.quantityRequested}/${line.quantityRequested} validé`,

        };



        const updatedLine = {

          ...line,

          quantityPrepared: line.quantityRequested,

          validatedAt: new Date().toISOString(),

          validatedBy: preparedBy,

        };



        const prepAction: MockPrepAction = makePrepAction(

          updatedLine,

          "validated",

          preparedBy,

          line.quantityRequested

        );

        return {

          ...prev,

          preparationLines: prev.preparationLines.map((l) =>

            l.id === lineId ? updatedLine : l

          ),

          missingItems: autoResolveMissingForLine(

            prev.missingItems,

            updatedLine

          ),

          prepActions: [prepAction, ...prev.prepActions],

          modifications: [mod, ...prev.modifications],

        };

      });

    },

    []

  );



  const createMissingFromPrep = useCallback(

    (input: CreateMissingFromPrepInput) => {

      setStore((prev) => {

        const line = prev.preparationLines.find((l) => l.id === input.prepLineId);

        if (!line) return prev;

        const preparedBy = input.preparedBy ?? PREP_USER;



        const maxMissing = line.quantityRequested - line.quantityPrepared;

        const missingQty = Math.max(

          1,

          Math.min(input.missingQuantity, maxMissing)

        );

        const quantityFound = line.quantityRequested - missingQty;

        const event = prev.events.find((e) => e.id === line.eventId);

        const now = new Date().toISOString();



        const existing = prev.missingItems.find(

          (m) => m.preparationLineId === line.id && isMissingActive(m)

        );



        const mod: MockModification = {

          id: uid("mod"),

          eventId: line.eventId,

          eventName: event?.name ?? "",

          userName: preparedBy,

          time: new Date().toLocaleTimeString("fr-FR", {

            hour: "2-digit",

            minute: "2-digit",

          }),

          detail: `Manquant déclaré — ${line.designation}${line.reference ? ` ${line.reference}` : ""} : ${missingQty} unité(s)`,

        };



        const declaredHistory = historyEntry(

          "declared",

          "Manquant déclaré",

          `${missingQty} ${line.designation.toLowerCase()}${missingQty > 1 ? "s" : ""}`,

          preparedBy

        );

        const missingPrepAction = makePrepAction(

          { ...line, quantityPrepared: quantityFound },

          "missing",

          preparedBy,

          quantityFound

        );



        if (existing) {

          const notification: MockNotification = {

            id: uid("notif"),

            type: "missing_declared",

            title: `Manquant mis à jour — ${line.designation}`,

            body: `${preparedBy} a déclaré ${missingQty} unité(s) manquante(s)`,

            eventId: line.eventId,

            missingItemId: existing.id,

            read: false,

            createdAt: now,

          };

          return {

            ...prev,

            missingItems: prev.missingItems.map((m) =>

              m.id === existing.id

                ? {

                    ...m,

                    quantityFound,

                    comment: input.comment ?? m.comment,

                    photoUrl: input.photoUrl ?? m.photoUrl,

                    workflowStatus: "declared" as const,

                    history: [...m.history, declaredHistory],

                  }

                : m

            ),

            notifications: [notification, ...prev.notifications],

            modifications: [mod, ...prev.modifications],

            prepActions: [missingPrepAction, ...prev.prepActions],

          };

        }



        const itemId = uid("mi");

        const item: MockMissingItem = {

          id: itemId,

          eventId: line.eventId,

          eventName: event?.name ?? "",

          productId: line.productId,

          preparationLineId: line.id,

          designation: line.designation,

          reference: line.reference,

          quantityRequested: line.quantityRequested,

          quantityFound,

          comment:

            input.comment ??

            `${missingQty} unité(s) introuvable(s) en préparation`,

          photoUrl: input.photoUrl,

          workflowStatus: "declared",

          history: [declaredHistory],

          createdBy: preparedBy,

          createdAt: now,

        };



        const notification: MockNotification = {

          id: uid("notif"),

          type: "missing_declared",

          title: `Nouveau manquant — ${line.designation}`,

          body: `${preparedBy} a déclaré ${missingQty} unité(s) manquante(s)`,

          eventId: line.eventId,

          missingItemId: itemId,

          read: false,

          createdAt: now,

        };



        return {

          ...prev,

          missingItems: [item, ...prev.missingItems],

          notifications: [notification, ...prev.notifications],

          modifications: [mod, ...prev.modifications],

          prepActions: [missingPrepAction, ...prev.prepActions],

        };

      });

    },

    []

  );



  const createMissing = useCallback((input: CreateMissingInput) => {

    const event = store.events.find((e) => e.id === input.eventId);

    const missingQty = input.quantityRequested - input.quantityFound;

    const now = new Date().toISOString();

    const itemId = uid("mi");



    const item: MockMissingItem = {

      id: itemId,

      eventId: input.eventId,

      eventName: event?.name ?? "",

      productId: input.productId,

      designation: input.designation,

      reference: input.reference,

      quantityRequested: input.quantityRequested,

      quantityFound: input.quantityFound,

      comment: input.comment,

      workflowStatus: "declared",

      history: [

        historyEntry(

          "declared",

          "Manquant déclaré",

          `${missingQty} ${input.designation.toLowerCase()}`,

          PREP_USER

        ),

      ],

      createdBy: PREP_USER,

      createdAt: now,

    };



    const notification: MockNotification = {

      id: uid("notif"),

      type: "missing_declared",

      title: `Nouveau manquant — ${input.designation}`,

      body: `${PREP_USER} a déclaré ${missingQty} unité(s) manquante(s)`,

      eventId: input.eventId,

      missingItemId: itemId,

      read: false,

      createdAt: now,

    };



    setStore((prev) => ({

      ...prev,

      missingItems: [item, ...prev.missingItems],

      notifications: [notification, ...prev.notifications],

    }));

  }, [store.events]);



  const respondToMissing = useCallback(

    (

      id: string,

      responseType: MissingResponseType,

      comment: string,

      respondedBy = COMMERCIAL_USER

    ) => {

      setStore((prev) => {

        const item = prev.missingItems.find((m) => m.id === id);

        if (!item) return prev;



        const now = new Date().toISOString();

        const isCancelled = responseType === "cancelled";

        const detailPrefix =

          responseType === "replaced"

            ? "Remplacer par"

            : responseType === "ordered"

              ? "Commandé"

              : responseType === "client_informed"

                ? "Client informé"

                : "Annulé";



        const responseHistory = historyEntry(

          "commercial_response",

          "Réponse commerciale",

          `${detailPrefix} ${comment}`,

          respondedBy

        );



        const updatedItem: MockMissingItem = {

          ...item,

          responseType,

          commercialResponse: comment,

          respondedBy,

          respondedAt: now,

          workflowStatus: isCancelled ? "closed" : "commercial_response",

          history: [

            ...item.history,

            responseHistory,

            ...(isCancelled

              ? [

                  historyEntry(

                    "closed",

                    "Clos",

                    "Ticket annulé par le commercial",

                    respondedBy

                  ),

                ]

              : []),

          ],

        };



        const responseLabel = formatCommercialResponse(updatedItem);

        const notification: MockNotification = {

          id: uid("notif"),

          type: "missing_response",

          title: `Réponse commerciale — ${item.designation}`,

          body: `${respondedBy} a répondu au manquant : ${item.designation}${responseLabel ? ` → ${responseLabel}` : ""}`,

          eventId: item.eventId,

          missingItemId: item.id,

          read: false,

          createdAt: now,

        };



        return {

          ...prev,

          missingItems: prev.missingItems.map((m) =>

            m.id === id ? updatedItem : m

          ),

          notifications: isCancelled

            ? prev.notifications

            : [notification, ...prev.notifications],

        };

      });

    },

    []

  );



  const confirmMissingReplacement = useCallback(

    (id: string, confirmedBy = PREP_USER) => {

      setStore((prev) => {

        const item = prev.missingItems.find((m) => m.id === id);

        if (!item || item.workflowStatus !== "commercial_response") return prev;



        const now = new Date().toISOString();

        const replacementHistory = historyEntry(

          "replacement_done",

          "Remplacement effectué",

          item.commercialResponse ?? "Remplacement appliqué en préparation",

          confirmedBy

        );

        const prepLine = item.preparationLineId

          ? prev.preparationLines.find((l) => l.id === item.preparationLineId)

          : undefined;

        const prepActions = prepLine

          ? [

              makePrepAction(prepLine, "replacement", confirmedBy),

              ...prev.prepActions,

            ]

          : prev.prepActions;



        return {

          ...prev,

          missingItems: prev.missingItems.map((m) =>

            m.id === id

              ? {

                  ...m,

                  workflowStatus: "closed" as const,

                  replacementConfirmedBy: confirmedBy,

                  replacementConfirmedAt: now,

                  history: [...m.history, replacementHistory],

                }

              : m

          ),

          prepActions,

        };

      });

    },

    []

  );



  const markNotificationRead = useCallback((id: string) => {

    setStore((prev) => ({

      ...prev,

      notifications: prev.notifications.map((n) =>

        n.id === id ? { ...n, read: true } : n

      ),

    }));

  }, []);



  const markAllNotificationsRead = useCallback(() => {

    setStore((prev) => ({

      ...prev,

      notifications: prev.notifications.map((n) => ({ ...n, read: true })),

    }));

  }, []);



  const getProductStockAdjustments = useCallback(
    (productId: string) =>
      store.stockAdjustments.filter((a) => a.productId === productId),
    [store.stockAdjustments]
  );

  const adjustDepotStock = useCallback(
    (productId: string, delta: number, note?: string, userName = "Kevin") => {
      if (delta === 0) return { ok: false as const, error: "Quantité invalide" };

      let result: { ok: true } | { ok: false; error: string } = {
        ok: false,
        error: "Produit introuvable",
      };

      setStore((prev) => {
        const product = prev.products.find((p) => p.id === productId);
        if (!product) return prev;

        if (delta < 0 && product.stockAvailable < Math.abs(delta)) {
          result = {
            ok: false,
            error: `Stock insuffisant (${product.stockAvailable} dispo)`,
          };
          return prev;
        }

        const time = new Intl.DateTimeFormat("fr-FR", {
          timeZone: "Europe/Paris",
          hour: "2-digit",
          minute: "2-digit",
        }).format(new Date());

        const label =
          delta > 0
            ? `+${delta} entrepôt${note ? ` — ${note}` : ""}`
            : `${delta} retrait entrepôt${note ? ` — ${note}` : ""}`;

        const mod: MockModification = {
          id: uid("mod"),
          eventId: "",
          eventName: "Stock dépôt",
          userName,
          time,
          detail: `${product.name} — ${label}`,
        };

        const adjustment = buildStockAdjustment(
          {
            productId,
            type: "manual",
            quantity: delta,
            note,
            userName,
          },
          () => uid("adj")
        );

        result = { ok: true };
        return {
          ...prev,
          products: prev.products.map((p) =>
            p.id === productId
              ? updateProductStock(p, {
                  stockAvailable: p.stockAvailable + delta,
                  stockTotal: p.stockTotal + delta,
                })
              : p
          ),
          stockAllocations: applyDepotDelta(
            prev.stockAllocations,
            productId,
            delta,
            () => uid("sa")
          ),
          stockAdjustments: [adjustment, ...prev.stockAdjustments],
          modifications: [mod, ...prev.modifications],
        };
      });

      return result;
    },
    []
  );

  const getTodayInventoryMission = useCallback(
    (date = DEMO_DATE) => {
      const rotation = getRotationForDate(date);
      const missionProducts = getMissionProducts(store.products, date);
      return {
        zoneId: rotation.zoneId,
        zoneLabel: rotation.label,
        emoji: rotation.emoji,
        productCount: missionProducts.length,
        estimatedMinutes: estimateMissionMinutes(missionProducts.length),
        products: missionProducts,
      };
    },
    [store.products]
  );

  const submitInventorySession = useCallback(
    (
      counts: { productId: string; countedDepot: number }[],
      userName = "Kevin",
      date = DEMO_DATE
    ) => {
      const rotation = getRotationForDate(date);
      const sessionId = uid("inv");
      const completedAt = new Date().toISOString();
      const lines: MockInventoryLine[] = [];
      const time = new Intl.DateTimeFormat("fr-FR", {
        timeZone: "Europe/Paris",
        hour: "2-digit",
        minute: "2-digit",
      }).format(new Date());

      setStore((prev) => {
        let next = { ...prev };

        for (const { productId, countedDepot } of counts) {
          const product = prev.products.find((p) => p.id === productId);
          if (!product) continue;

          const expectedDepot = getExpectedDepotStock(product);
          const variance = countedDepot - expectedDepot;

          lines.push({
            productId,
            productName: product.name,
            reference: product.reference,
            stockTotal: product.stockTotal,
            onPrestation: getOnPrestationCount(product),
            expectedDepot,
            countedDepot,
            variance,
          });

          if (variance !== 0) {
            const adjustment = buildStockAdjustment(
              {
                productId,
                type: "inventory",
                quantity: variance,
                note: `Inventaire ${rotation.label}`,
                userName,
              },
              () => uid("adj")
            );

            next = {
              ...next,
              products: next.products.map((p) =>
                p.id === productId
                  ? updateProductStock(p, {
                      stockAvailable: countedDepot,
                      stockTotal: p.stockTotal + variance,
                    })
                  : p
              ),
              stockAllocations: applyDepotDelta(
                next.stockAllocations,
                productId,
                variance,
                () => uid("sa")
              ),
              stockAdjustments: [adjustment, ...next.stockAdjustments],
              modifications: [
                {
                  id: uid("mod"),
                  eventId: "",
                  eventName: "Inventaire",
                  userName,
                  time,
                  detail: `${product.name} — dépôt ${expectedDepot} → ${countedDepot} (${variance >= 0 ? "+" : ""}${variance})`,
                },
                ...next.modifications,
              ],
            };
          }
        }

        const session: MockInventorySession = {
          id: sessionId,
          date,
          zoneId: rotation.zoneId,
          zoneLabel: rotation.label,
          userName,
          lines,
          completedAt,
        };

        return {
          ...next,
          inventorySessions: [session, ...next.inventorySessions],
        };
      });

      return {
        id: sessionId,
        date,
        zoneId: rotation.zoneId,
        zoneLabel: rotation.label,
        userName,
        lines,
        completedAt,
      };
    },
    []
  );

  const getInventoryHistory = useCallback(
    () => store.inventorySessions,
    [store.inventorySessions]
  );

  const getStockReliability = useCallback(
    () => computeStockReliability(store.inventorySessions),
    [store.inventorySessions]
  );

  const updateProductPrepPriority = useCallback(
    (productId: string, prepPriority: number) => {
      const clamped = Math.max(0, Math.min(100, Math.round(prepPriority)));
      setStore((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, prepPriority: clamped } : p
        ),
      }));
    },
    []
  );

  const updateProductPackSize = useCallback(
    (productId: string, packSize: number) => {
      const clamped = Math.max(1, Math.min(999, Math.round(packSize)));
      setStore((prev) => ({
        ...prev,
        products: prev.products.map((p) =>
          p.id === productId ? { ...p, packSize: clamped } : p
        ),
      }));
    },
    []
  );

  const openMissingCount = store.missingItems.filter(needsCommercialAction).length;



  const unreadNotificationCount = store.notifications.filter((n) => !n.read).length;



  const trucksOnRoute = store.trucks.filter(

    (t) => t.status === "on_route"

  ).length;



  const expectedReturns = store.stockAllocations.filter(

    (a) => a.status === "out" || a.status === "reserved"

  ).length;



  const value = useMemo<MockStoreContextValue>(

    () => ({

      ...store,

      openMissingCount,

      unreadNotificationCount,

      trucksOnRoute,

      expectedReturns,

      getEvent,

      getProduct,

      getOrderLines,

      getPreparationLines,

      getEventPrepProgress,

      getEventMissing,

      getMissingForPrepLine,

      getEventMissingSummary: getEventMissingSummaryFn,

      getProductAllocations,

      getProductStockAdjustments,

      getEventPrepActions,

      adjustDepotStock,

      getTodayInventoryMission,
      submitInventorySession,
      getInventoryHistory,
      getStockReliability,
      updateProductPrepPriority,
      updateProductPackSize,

      searchProducts,

      createEvent,

      updateEvent,

      updateEventComments,

      addOrderLine,

      updateOrderLineQuantity,

      updatePreparationQuantity,

      validatePreparationLine,

      createMissingFromPrep,

      syncPreparationFromOrder,

      createMissing,

      respondToMissing,

      confirmMissingReplacement,

      markNotificationRead,

      markAllNotificationsRead,

      getLineAvailability,

    }),

    [

      store,

      openMissingCount,

      unreadNotificationCount,

      trucksOnRoute,

      expectedReturns,

      getEvent,

      getProduct,

      getOrderLines,

      getPreparationLines,

      getEventPrepProgress,

      getEventMissing,

      getMissingForPrepLine,

      getEventMissingSummaryFn,

      getProductAllocations,

      getProductStockAdjustments,

      getEventPrepActions,

      adjustDepotStock,

      getTodayInventoryMission,
      submitInventorySession,
      getInventoryHistory,
      getStockReliability,
      updateProductPrepPriority,
      updateProductPackSize,

      searchProducts,

      createEvent,

      updateEvent,

      updateEventComments,

      addOrderLine,

      updateOrderLineQuantity,

      updatePreparationQuantity,

      validatePreparationLine,

      createMissingFromPrep,

      syncPreparationFromOrder,

      createMissing,

      respondToMissing,

      confirmMissingReplacement,

      markNotificationRead,

      markAllNotificationsRead,

      getLineAvailability,

    ]

  );



  return (

    <MockStoreContext.Provider value={value}>

      {children}

    </MockStoreContext.Provider>

  );

}



export function useMockStore() {

  const ctx = useContext(MockStoreContext);

  if (!ctx) throw new Error("useMockStore must be used within MockStoreProvider");

  return ctx;

}



export { computePrepProgress, formatDepartureTime, prepLineStatus } from "./preparation";

export type { PrepProgress } from "./preparation";

export { isMissingActive, getEventMissingSummary, missingQuantity } from "./missing-workflow";



export function getTodayEvents(events: MockEvent[]) {

  const today = "2026-06-11";

  return events.filter((e) => e.date === today);

}



export function formatDateFr(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", {
    timeZone: "UTC",
    weekday: "long",
    day: "numeric",
    month: "long",
    year: "numeric",
  }).format(date);
}

export function formatShortDate(dateStr: string) {
  const [y, m, d] = dateStr.split("-").map(Number);
  const date = new Date(Date.UTC(y, m - 1, d, 12, 0, 0));
  return new Intl.DateTimeFormat("fr-FR", { timeZone: "UTC" }).format(date);
}


