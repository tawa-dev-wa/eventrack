import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@eventrack/ui";

export default function ComingSoonPage({
  title,
  description,
}: {
  title: string;
  description: string;
}) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>{title}</CardTitle>
        <CardDescription>{description}</CardDescription>
      </CardHeader>
      <CardContent>
        <p className="text-sm text-brand-primary/60">
          Module prévu après le MVP démo — Phase 2.
        </p>
      </CardContent>
    </Card>
  );
}
