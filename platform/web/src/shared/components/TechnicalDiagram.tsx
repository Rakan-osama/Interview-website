import type { LessonVisual } from "../../entities/curriculum";

const WIDTH = 820;
const HEIGHT = 330;
type PositionedNode = LessonVisual["data"]["nodes"][number] & { x: number; y: number };

export function TechnicalDiagram({ visual }: { visual: LessonVisual }) {
  const positions = positionNodes(visual);
  const byId = new Map(positions.map((node) => [node.id, node]));
  const markerId = `arrow-${visual.id}`;

  return <figure className={`technical-diagram diagram-${visual.kind}`} aria-labelledby={`diagram-${visual.id}-title`}>
    <svg viewBox={`0 0 ${WIDTH} ${HEIGHT}`} role="img" aria-labelledby={`diagram-${visual.id}-title diagram-${visual.id}-description`}>
      <title id={`diagram-${visual.id}-title`}>{visual.title}</title>
      <desc id={`diagram-${visual.id}-description`}>{visual.altText}</desc>
      <defs><marker id={markerId} viewBox="0 0 10 10" refX="9" refY="5" markerWidth="7" markerHeight="7" orient="auto-start-reverse"><path d="M 0 0 L 10 5 L 0 10 z" /></marker></defs>
      <Swimlanes visible={["pipeline", "data-flow", "transaction-timeline"].includes(visual.kind)} />
      {visual.data.edges.map((edge, index) => {
        const start = byId.get(edge.from);
        const end = byId.get(edge.to);
        if (!start || !end) return null;
        const path = edgePath(start, end, visual.kind);
        const labelX = (start.x + end.x) / 2;
        const labelY = (start.y + end.y) / 2 - 12;
        return <g key={`${edge.from}-${edge.to}-${index}`} className="diagram-edge">
          <path d={path} markerEnd={`url(#${markerId})`} />
          {edge.label && <text x={labelX} y={labelY} textAnchor="middle">{edge.label}</text>}
        </g>;
      })}
      {positions.map((node) => <DiagramNode key={node.id} node={node} kind={visual.kind} />)}
    </svg>
    {visual.data.annotations?.map((annotation) => <aside className="diagram-annotation" key={`${annotation.label}-${annotation.text}`}><strong>{annotation.label}</strong><span>{annotation.text}</span></aside>)}
    <figcaption>{visual.caption}</figcaption>
    <details><summary>Text alternative</summary><p>{visual.altText}</p></details>
  </figure>;
}

function Swimlanes({ visible }: { visible: boolean }) {
  if (!visible) return null;
  return <g className="diagram-lanes" aria-hidden="true">
    <rect x="18" y="45" width="242" height="235" rx="12" /><rect x="289" y="45" width="242" height="235" rx="12" /><rect x="560" y="45" width="242" height="235" rx="12" />
    <text x="32" y="68">Input</text><text x="303" y="68">Processing</text><text x="574" y="68">Outcome</text>
  </g>;
}

function DiagramNode({ node, kind }: { node: PositionedNode; kind: LessonVisual["kind"] }) {
  const lines = splitLabel(node.label);
  const shape = kind === "state-machine" ? <ellipse cx={node.x} cy={node.y} rx="88" ry="39" /> : <rect x={node.x - 88} y={node.y - 39} width="176" height="78" rx={kind === "entity-relationship" ? 4 : 13} />;
  return <g className={`diagram-node group-${node.group ?? "process"}`}>
    {shape}
    {lines.map((line, index) => <text key={line} x={node.x} y={node.y + (index - (lines.length - 1) / 2) * 17 + 5} textAnchor="middle">{line}</text>)}
  </g>;
}

function positionNodes(visual: LessonVisual): PositionedNode[] {
  const nodes = visual.data.nodes;
  if (["architecture", "entity-relationship"].includes(visual.kind)) {
    const grid = [[210, 110], [610, 110], [210, 245], [610, 245]];
    return nodes.map((node, index) => ({ ...node, x: grid[index % grid.length][0], y: grid[index % grid.length][1] }));
  }
  if (visual.kind === "comparison") {
    const fork = [[125, 165], [365, 95], [365, 235], [675, 165]];
    return nodes.map((node, index) => ({ ...node, x: fork[index % fork.length][0], y: fork[index % fork.length][1] }));
  }
  if (["data-flow", "flow"].includes(visual.kind)) {
    return nodes.map((node, index) => ({ ...node, x: 115 + index * 195, y: index % 2 ? 215 : 115 }));
  }
  if (["state-machine", "state"].includes(visual.kind)) {
    const state = [[125, 165], [340, 90], [670, 165], [340, 245]];
    return nodes.map((node, index) => ({ ...node, x: state[index % state.length][0], y: state[index % state.length][1] }));
  }
  return nodes.map((node, index) => ({ ...node, x: 110 + index * (600 / Math.max(1, nodes.length - 1)), y: 165 }));
}

function edgePath(start: PositionedNode, end: PositionedNode, kind: LessonVisual["kind"]): string {
  if (["architecture", "entity-relationship", "comparison", "state-machine", "state"].includes(kind)) {
    const middleX = (start.x + end.x) / 2;
    return `M ${start.x} ${start.y} C ${middleX} ${start.y}, ${middleX} ${end.y}, ${end.x} ${end.y}`;
  }
  return `M ${start.x + 88} ${start.y} L ${end.x - 94} ${end.y}`;
}

function splitLabel(label: string): string[] {
  if (label.length <= 24) return [label];
  const words = label.split(" ");
  const lines: string[] = [];
  for (const word of words) {
    const current = lines.at(-1);
    if (!current || current.length + word.length > 24) lines.push(word);
    else lines[lines.length - 1] = `${current} ${word}`;
  }
  return lines.slice(0, 3);
}
