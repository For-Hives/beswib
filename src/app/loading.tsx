import Loader from "@/components/ui/Loader";

export default function Loading() {
  return (
    <div className="flex min-h-screen items-center justify-center">
      <div className="flex flex-col items-center space-y-4">
        <Loader size="lg" />
        <p className="text-sm text-muted-foreground">Chargement...</p>
      </div>
    </div>
  );
}