import { normalizeText } from "../lib/decisionEngine";

export function KeywordText({ text, keywords }) {
  if (!text) {
    return <span>Sin texto disponible.</span>;
  }

  if (!keywords.length) {
    return <span>{text}</span>;
  }

  const ranges = [];
  const normalized = normalizeText(text);

  keywords.forEach((keyword) => {
    const matchIndex = normalized.indexOf(normalizeText(keyword));
    if (matchIndex >= 0) {
      ranges.push([matchIndex, matchIndex + keyword.length]);
    }
  });

  ranges.sort((left, right) => left[0] - right[0]);

  const segments = [];
  let cursor = 0;

  ranges.forEach(([start, end], index) => {
    if (start > cursor) {
      segments.push(text.slice(cursor, start));
    }

    segments.push(
      <mark
        key={`${start}-${end}-${index}`}
        className="keyword-highlight"
      >
        {text.slice(start, end)}
      </mark>,
    );
    cursor = end;
  });

  if (cursor < text.length) {
    segments.push(text.slice(cursor));
  }

  return <span>{segments}</span>;
}
