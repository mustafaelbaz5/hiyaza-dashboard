import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorStateProps {
  message: string;
  onRetry?: () => void;
}

/** The "something failed" state every data view must implement, with an actionable retry. */
export function ErrorState({ message, onRetry }: ErrorStateProps) {
  return (
    <div className="flex flex-col items-center justify-center gap-3 rounded-lg border border-destructive/30 bg-destructive/5 py-16 text-center">
      <AlertTriangle className="size-10 text-destructive" aria-hidden />
      <p className="max-w-sm text-sm text-foreground">{message}</p>
      {onRetry ? (
        <Button variant="outline" size="sm" onClick={onRetry}>
          إعادة المحاولة
        </Button>
      ) : null}
    </div>
  );
}
