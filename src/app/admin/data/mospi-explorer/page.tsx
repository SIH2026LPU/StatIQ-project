import { MoSPIExplorer } from "@/components/mospi-explorer";
import { Notice } from "@/components/app-shell";

export default function MoSPIExplorerPage() {
  return (
    <div className="space-y-8 animate-fade-up max-w-6xl mx-auto pb-12">
      <Notice />
      <MoSPIExplorer />
    </div>
  );
}
