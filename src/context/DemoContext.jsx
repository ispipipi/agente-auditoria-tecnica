import { createContext, useContext, useState } from "react";
import { casosMock } from "../data/casos.mock";
import { preciosMercadoMock } from "../data/preciosMercado.mock";
import { DECISION_LABELS, evaluateCase, findMarketPrice, getPriceKey } from "../lib/decisionEngine";

const DemoContext = createContext(null);

function buildInitialPrices() {
  return preciosMercadoMock.reduce((accumulator, item) => {
    accumulator[getPriceKey(item)] = item.precioMercado;
    return accumulator;
  }, {});
}

export function DemoProvider({ children }) {
  const [cases] = useState(casosMock);
  const [priceMap, setPriceMap] = useState(buildInitialPrices);
  const [overrides, setOverrides] = useState({});

  function getCaseById(idTicket) {
    return cases.find((item) => item.idTicket === idTicket) ?? null;
  }

  function getMarketPriceForCase(caseItem) {
    const fallbackPrice = findMarketPrice(caseItem, preciosMercadoMock);
    const key = getPriceKey(caseItem);
    const currentValue = priceMap[key];

    return {
      key,
      value:
        currentValue ?? fallbackPrice?.precioMercado ?? null,
      source: fallbackPrice?.fuente ?? "Ingreso manual",
    };
  }

  function updateMarketPrice(caseItem, nextValue) {
    const key = getPriceKey(caseItem);
    setPriceMap((current) => ({
      ...current,
      [key]: nextValue === "" ? "" : Number(nextValue),
    }));
  }

  function getAgentAnalysis(caseItem) {
    const marketPrice = getMarketPriceForCase(caseItem).value;
    return evaluateCase(caseItem, marketPrice === "" ? null : marketPrice);
  }

  function getFinalDecision(caseItem) {
    const override = overrides[caseItem.idTicket];
    if (override) {
      return override.decisionFinal;
    }

    return getAgentAnalysis(caseItem).decision;
  }

  function confirmAgentDecision(caseItem) {
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
  }

  function saveOverride(caseItem, decisionFinal, comentarioOverride) {
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
  }

  return (
    <DemoContext.Provider
      value={{
        cases,
        overrides,
        decisions: DECISION_LABELS,
        getCaseById,
        getMarketPriceForCase,
        updateMarketPrice,
        getAgentAnalysis,
        getFinalDecision,
        confirmAgentDecision,
        saveOverride,
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
