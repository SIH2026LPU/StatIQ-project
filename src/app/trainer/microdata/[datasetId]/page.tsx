import { MicrodataDatasetView } from "@/components/microdata-dataset-view";

export default async function TrainerMicrodataDatasetPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  return <MicrodataDatasetView datasetId={decodeURIComponent(datasetId)} canDownload canAssign />;
}
