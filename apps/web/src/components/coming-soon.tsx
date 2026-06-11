import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
  PageHeader,
} from "@eventrack/ui";

export default function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <div className="space-y-6">
      <PageHeader title={title} description={description} />
      <Card>
        <CardHeader>
          <CardTitle>Prochainement</CardTitle>
          <CardDescription>Module en cours de conception</CardDescription>
        </CardHeader>
        <CardContent>
          <p className="text-sm text-brand-primary/60">
            Module prévu après le MVP démo — Phase 2.
          </p>
        </CardContent>
      </Card>
    </div>
  );
}
