import { MicrodataCatalogue } from "@/components/microdata-catalogue";

export default function LearnerMicrodataPage() {
  return (
    <div className="space-y-6">
      <h1 className="font-display text-4xl font-bold">Official microdata</h1>
      <p className="text-on-surface-variant">
        Search live MoSPI UnitData through the StatIQ backend. Analysis uses official metadata and
        permitted files only.
      </p>
      <MicrodataCatalogue detailsBase="/learner/microdata" />
    </div>
  );
}
