import { LegendPanel } from './components';

export default function App() {
  return <LegendPanel colors={{} as any} visibleSeverities={new Set()} visibleEdgeTypes={new Set()} onToggleSeverity={() => {}} onToggleEdgeType={() => {}} metadata={undefined} />;
}
