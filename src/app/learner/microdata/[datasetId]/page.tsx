import { MicrodataDatasetView } from "@/components/microdata-dataset-view";

export default async function LearnerMicrodataDatasetPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  return <MicrodataDatasetView datasetId={decodeURIComponent(datasetId)} canDownload />;
}
