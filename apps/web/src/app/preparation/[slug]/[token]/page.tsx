import { MockStoreProvider } from "@/lib/mock/store";
import { InterimPreparationClient } from "@/components/interim-preparation-client";

export default async function InterimPreparationPage({
  params,
}: {
  params: Promise<{ slug: string; token: string }>;
}) {
  const { slug, token } = await params;
  return (
    <MockStoreProvider isolated>
      <InterimPreparationClient slug={slug} token={token} />
    </MockStoreProvider>
  );
}
