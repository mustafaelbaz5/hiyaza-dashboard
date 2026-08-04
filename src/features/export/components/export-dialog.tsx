"use client";

import { useState } from "react";
import { Download, Loader2, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ASSOCIATION_TYPE_LABELS, type AssociationType } from "@/lib/constants";
import { useCities } from "@/features/cities/hooks/use-cities";
import { useExportUnifiedHoldings } from "../hooks/use-export-unified-holdings";
import type { ExportFilters } from "../types";

interface ExportDialogProps {
  /** Pre-fills and locks the city scope (e.g. when opened from a city's holdings page). */
  cityId?: string;
  cityName?: string;
  label?: string;
  variant?: "default" | "outline" | "secondary";
  size?: "default" | "sm" | "lg";
}

const ALL_CITIES = "__all__";
const ALL_TYPES = "__all__";

/** Full export dialog — lets the admin choose city scope and association type before
 * downloading the unified, fully-merged Excel export. Reuses useExportUnifiedHoldings. */
export function ExportDialog({ cityId, cityName, label = "تصدير البيانات", variant = "default", size = "default" }: ExportDialogProps) {
  const [open, setOpen] = useState(false);
  const [selectedCityId, setSelectedCityId] = useState(cityId ?? ALL_CITIES);
  const [associationType, setAssociationType] = useState<string>(ALL_TYPES);
  const [successCount, setSuccessCount] = useState<number | null>(null);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const { data: cities } = useCities();
  const { mutate, isPending } = useExportUnifiedHoldings();

  const cityLocked = Boolean(cityId);

  const handleExport = () => {
    setErrorMessage(null);
    setSuccessCount(null);

    const filters: ExportFilters = {};
    if (selectedCityId !== ALL_CITIES) filters.cityId = selectedCityId;
    if (associationType !== ALL_TYPES) filters.associationType = associationType as AssociationType;

    mutate(filters, {
      onSuccess: (result) => {
        setSuccessCount(result.count);
      },
      onError: (error) => {
        setErrorMessage(error instanceof Error ? error.message : "فشل التصدير");
      },
    });
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(next) => {
        setOpen(next);
        if (!next) {
          setSuccessCount(null);
          setErrorMessage(null);
        }
      }}
    >
      <DialogTrigger asChild>
        <Button variant={variant} size={size} className="gap-2">
          <Download className="h-4 w-4" />
          {label}
        </Button>
      </DialogTrigger>
      <DialogContent>
        <DialogHeader>
          <DialogTitle>تصدير الحيازات إلى Excel</DialogTitle>
          <DialogDescription>
            يتم تصدير أحدث بيانات الحيازات بعد دمج كل التعديلات والحيازات الميدانية في ملف واحد
            بالتنسيق المعتمد (25 عمود).
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="export-city">الجمعية</Label>
            {cityLocked ? (
              <div className="rounded-md border border-border bg-muted/50 px-3 py-2 text-sm">
                {cityName ?? "الجمعية الحالية"}
              </div>
            ) : (
              <Select value={selectedCityId} onValueChange={setSelectedCityId}>
                <SelectTrigger id="export-city" className="w-full" aria-label="اختر الجمعية">
                  <SelectValue placeholder="كل الجمعيات" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={ALL_CITIES}>كل الجمعيات</SelectItem>
                  {(cities ?? []).map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            )}
          </div>

          <div className="space-y-2">
            <Label htmlFor="export-association-type">نوع الجمعية</Label>
            <Select value={associationType} onValueChange={setAssociationType}>
              <SelectTrigger id="export-association-type" className="w-full" aria-label="تصفية حسب نوع الجمعية">
                <SelectValue placeholder="كل الأنواع" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value={ALL_TYPES}>كل الأنواع</SelectItem>
                {Object.entries(ASSOCIATION_TYPE_LABELS).map(([value, labelText]) => (
                  <SelectItem key={value} value={value}>
                    {labelText}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {successCount !== null ? (
            <div className="flex items-center gap-2 rounded-md border border-green-600/30 bg-green-600/10 px-3 py-2 text-sm text-green-700">
              <CheckCircle2 className="h-4 w-4 shrink-0" />
              تم تصدير {successCount.toLocaleString("ar-EG")} حيازة بنجاح
            </div>
          ) : null}
          {errorMessage ? (
            <p className="text-sm text-red-600">خطأ: {errorMessage}</p>
          ) : null}
        </div>

        <DialogFooter>
          <Button onClick={handleExport} disabled={isPending} className="gap-2">
            {isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                جاري التصدير...
              </>
            ) : (
              <>
                <Download className="h-4 w-4" />
                تنزيل ملف Excel
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
