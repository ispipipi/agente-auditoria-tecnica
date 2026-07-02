import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import { casosMock } from "../data/casos.mock";
import { preciosMercadoMock } from "../data/preciosMercado.mock";
import { DECISION_LABELS, evaluateCase, findMarketPrice, getPriceKey } from "../lib/decisionEngine";

const DemoContext = createContext(null);

const STORAGE_KEY = "agente-auditoria-tecnica-demo-v2";
const STEP_SEQUENCE = ["extraccion", "decision", "financiero", "resultado"];
const DEMO_PLAYBOOK = ["Aprobado", "Rechazado", "Incompleto", "Indemnizacion"];

function buildInitialPrices() {
  return preciosMercadoMock.reduce((accumulator, item) => {
    accumulator[getPriceKey(item)] = item.precioMercado;
    return accumulator;
  }, {});
}

function buildInitialWorkflow() {
  return casosMock.reduce((accumulator, item) => {
    accumulator[item.idTicket] = {
      status: "new",
      currentStep: STEP_SEQUENCE[0],
      lastVisitedStep: -1,
      startedAt: null,
      completedAt: null,
    };
    return accumulator;
  }, {});
}

function readStoredState() {
  if (typeof window === "undefined") return null;

  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : null;
  } catch {
    return null;
  }
}

function buildStoredWorkflow(storedWorkflow) {
  const baseWorkflow = buildInitialWorkflow();

  return Object.keys(baseWorkflow).reduce((accumulator, idTicket) => {
    accumulator[idTicket] = {
      ...baseWorkflow[idTicket],
      ...(storedWorkflow?.[idTicket] ?? {}),
    };
    return accumulator;
  }, {});
}

function buildInitialSession() {
  const stored = readStoredState();

  return {
    priceMap: stored?.priceMap ?? buildInitialPrices(),
    overrides: stored?.overrides ?? {},
    workflow: buildStoredWorkflow(stored?.workflow),
  };
}

function getCaseLink(idTicket, stepKey) {
  return `/caso/${idTicket}/${stepKey}`;
}

function getStepIndex(stepKey) {
  return STEP_SEQUENCE.indexOf(stepKey);
}

export function DemoProvider({ children }) {
  const [cases] = useState(casosMock);
  const [priceMap, setPriceMap] = useState(() => buildInitialSession().priceMap);
  const [overrides, setOverrides] = useState(() => buildInitialSession().overrides);
  const [workflow, setWorkflow] = useState(() => buildInitialSession().workflow);

  useEffect(() => {
    if (typeof window === "undefined") return;

    window.localStorage.setItem(
      STORAGE_KEY,
      JSON.stringify({
        priceMap,
        overrides,
        workflow,
      }),
    );
  }, [overrides, priceMap, workflow]);

  const getCaseById = useCallback((idTicket) => {
    return cases.find((item) => item.idTicket === idTicket) ?? null;
  }, [cases]);

  const getCaseState = useCallback((caseItemOrId) => {
    const idTicket = typeof caseItemOrId === "string" ? caseItemOrId : caseItemOrId.idTicket;
    return (
      workflow[idTicket] ?? {
        status: "new",
        currentStep: STEP_SEQUENCE[0],
        lastVisitedStep: -1,
        startedAt: null,
        completedAt: null,
      }
    );
  }, [workflow]);

  const setCaseWorkflow = useCallback((idTicket, updater) => {
    setWorkflow((current) => {
      const previous =
        current[idTicket] ?? {
          status: "new",
          currentStep: STEP_SEQUENCE[0],
          lastVisitedStep: -1,
          startedAt: null,
          completedAt: null,
        };
      const next = typeof updater === "function" ? updater(previous) : updater;

      return {
        ...current,
        [idTicket]: next,
      };
    });
  }, []);

  const getMarketPriceForCase = useCallback((caseItem) => {
    const fallbackPrice = findMarketPrice(caseItem, preciosMercadoMock);
    const key = getPriceKey(caseItem);
    const currentValue = priceMap[key];

    return {
      key,
      value: currentValue ?? fallbackPrice?.precioMercado ?? null,
      source: fallbackPrice?.fuente ?? "Ingreso manual",
    };
  }, [priceMap]);

  const updateMarketPrice = useCallback((caseItem, nextValue) => {
    const key = getPriceKey(caseItem);
    setPriceMap((current) => ({
      ...current,
      [key]: nextValue === "" ? "" : Number(nextValue),
    }));
  }, []);

  const getAgentAnalysis = useCallback((caseItem) => {
    const marketPrice = getMarketPriceForCase(caseItem).value;
    return evaluateCase(caseItem, marketPrice === "" ? null : marketPrice);
  }, [getMarketPriceForCase]);

  const getFinalDecision = useCallback((caseItem) => {
    const override = overrides[caseItem.idTicket];
    if (override) {
      return override.decisionFinal;
    }

    return getAgentAnalysis(caseItem).decision;
  }, [getAgentAnalysis, overrides]);

  const visitStep = useCallback((caseItem, stepKey) => {
    setCaseWorkflow(caseItem.idTicket, (previous) => {
      const nextStepIndex = getStepIndex(stepKey);
      const nextVisited = Math.max(previous.lastVisitedStep, nextStepIndex);

      if (
        previous.status === "closed" ||
        (previous.currentStep === stepKey &&
          previous.status === "in_review" &&
          previous.lastVisitedStep === nextVisited)
      ) {
        return previous;
      }

      return {
        ...previous,
        status: "in_review",
        currentStep: stepKey,
        lastVisitedStep: nextVisited,
        startedAt: previous.startedAt ?? new Date().toISOString(),
      };
    });
  }, [setCaseWorkflow]);

  const startCase = useCallback((caseItem) => {
    visitStep(caseItem, STEP_SEQUENCE[0]);
    return getCaseLink(caseItem.idTicket, STEP_SEQUENCE[0]);
  }, [visitStep]);

  const getCaseRoute = useCallback((caseItem) => {
    const state = getCaseState(caseItem);
    return getCaseLink(caseItem.idTicket, state.status === "closed" ? "resultado" : state.currentStep);
  }, [getCaseState]);

  const getCaseProgress = useCallback((caseItem) => {
    const state = getCaseState(caseItem);

    if (state.status === "closed") {
      return 100;
    }

    if (state.lastVisitedStep < 0) {
      return 0;
    }

    return Math.round(((state.lastVisitedStep + 1) / STEP_SEQUENCE.length) * 100);
  }, [getCaseState]);

  const confirmAgentDecision = useCallback((caseItem) => {
    const analysis = getAgentAnalysis(caseItem);

    setOverrides((current) => ({
      ...current,
      [caseItem.idTicket]: {
        idTicket: caseItem.idTicket,
        decisionAgente: analysis.decision,
        decisionFinal: analysis.decision,
        intervencionHumana: false,
        comentarioOverride: "",
      },
    }));

    setCaseWorkflow(caseItem.idTicket, (previous) => ({
      ...previous,
      status: "closed",
      currentStep: "resultado",
      lastVisitedStep: STEP_SEQUENCE.length - 1,
      startedAt: previous.startedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }));
  }, [getAgentAnalysis, setCaseWorkflow]);

  const saveOverride = useCallback((caseItem, decisionFinal, comentarioOverride) => {
    const analysis = getAgentAnalysis(caseItem);

    setOverrides((current) => ({
      ...current,
      [caseItem.idTicket]: {
        idTicket: caseItem.idTicket,
        decisionAgente: analysis.decision,
        decisionFinal,
        intervencionHumana: true,
        comentarioOverride,
      },
    }));

    setCaseWorkflow(caseItem.idTicket, (previous) => ({
      ...previous,
      status: "closed",
      currentStep: "resultado",
      lastVisitedStep: STEP_SEQUENCE.length - 1,
      startedAt: previous.startedAt ?? new Date().toISOString(),
      completedAt: new Date().toISOString(),
    }));
  }, [getAgentAnalysis, setCaseWorkflow]);

  const resetDemo = useCallback(() => {
    setPriceMap(buildInitialPrices());
    setOverrides({});
    setWorkflow(buildInitialWorkflow());
  }, []);

  const getRecommendedCase = useCallback((excludeIdTicket = null) => {
    const orderedCases = [...cases].sort((left, right) => {
      return DEMO_PLAYBOOK.indexOf(left.escenario) - DEMO_PLAYBOOK.indexOf(right.escenario);
    });

    return (
      orderedCases.find((item) => {
        const state = getCaseState(item);
        return state.status !== "closed" && item.idTicket !== excludeIdTicket;
      }) ?? orderedCases.find((item) => item.idTicket !== excludeIdTicket) ?? orderedCases[0]
    );
  }, [cases, getCaseState]);

  const dashboardMetrics = useMemo(() => {
    const states = cases.map((item) => getCaseState(item));
    const closed = states.filter((item) => item.status === "closed").length;
    const inReview = states.filter((item) => item.status === "in_review").length;
    const pending = states.filter((item) => item.status === "new").length;
    const overridesApplied = Object.values(overrides).filter(
      (item) => item.intervencionHumana,
    ).length;

    return {
      total: cases.length,
      closed,
      inReview,
      pending,
      overridesApplied,
      completedAll: closed === cases.length,
    };
  }, [cases, overrides, workflow]);

  return (
    <DemoContext.Provider
      value={{
        cases,
        overrides,
        workflow,
        decisions: DECISION_LABELS,
        dashboardMetrics,
        getCaseById,
        getCaseState,
        getCaseRoute,
        getCaseProgress,
        getMarketPriceForCase,
        getAgentAnalysis,
        getFinalDecision,
        getRecommendedCase,
        updateMarketPrice,
        visitStep,
        startCase,
        confirmAgentDecision,
        saveOverride,
        resetDemo,
      }}
    >
      {children}
    </DemoContext.Provider>
  );
}

export function useDemo() {
  const context = useContext(DemoContext);
  if (!context) {
    throw new Error("useDemo debe usarse dentro de DemoProvider");
  }

  return context;
}
