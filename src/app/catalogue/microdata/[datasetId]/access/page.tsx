import { Navbar } from "@/components/navbar";
import { Footer } from "@/components/footer";
import { MicrodataDatasetView } from "@/components/microdata-dataset-view";

export const dynamic = "force-dynamic";

export default async function CatalogueMicrodataAccessPage({
  params,
}: {
  params: Promise<{ datasetId: string }>;
}) {
  const { datasetId } = await params;
  return (
    <>
      <Navbar />
      <main className="mx-auto max-w-6xl px-6 pb-24 pt-32">
        <MicrodataDatasetView datasetId={decodeURIComponent(datasetId)} initialTab="access" />
      </main>
      <Footer />
    </>
  );
}
