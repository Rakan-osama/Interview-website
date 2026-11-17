type StructuredValue = string | number | boolean | null | StructuredValue[] | { [key: string]: StructuredValue };

export function StructuredContent({ value }: { value: unknown }) {
  return <div className="structured-content">{renderValue(value as StructuredValue)}</div>;
}

function renderValue(value: StructuredValue): React.ReactNode {
  if (value == null) return null;
  if (["string", "number", "boolean"].includes(typeof value)) return <p dir="auto">{String(value)}</p>;
  if (Array.isArray(value)) {
    if (value.every((item) => ["string", "number", "boolean"].includes(typeof item))) {
      return <ul>{value.map((item, index) => <li key={`${String(item)}-${index}`} dir="auto">{String(item)}</li>)}</ul>;
    }
    return <div className="structured-grid">{value.map((item, index) => <article key={index}>{renderValue(item)}</article>)}</div>;
  }
  return <dl>{Object.entries(value).map(([key, child]) => <div key={key}><dt>{humanize(key)}</dt><dd>{renderValue(child)}</dd></div>)}</dl>;
}

function humanize(value: string) {
  return value.replaceAll("_", " ").replace(/([a-z])([A-Z])/g, "$1 $2");
}
