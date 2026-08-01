"use client";

import { useRef, useState } from "react";
import { Upload, FileSpreadsheet } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

interface UploadStepProps {
  onFileSelected: (file: File) => void;
  isLoading: boolean;
  error?: string;
}

/** Step 1 of the import wizard — file picker only, no parsing happens client-side. */
export function UploadStep({ onFileSelected, isLoading, error }: UploadStepProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [fileName, setFileName] = useState<string | null>(null);

  function handleChange(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    onFileSelected(file);
  }

  return (
    <Card>
      <CardContent className="flex flex-col items-center gap-4 py-12 text-center">
        <FileSpreadsheet className="size-12 text-muted-foreground" />
        <div>
          <p className="font-medium">ارفع ملف Excel الخاص بالجمعية</p>
          <p className="text-sm text-muted-foreground">
            سيتم تحليل ورقة &quot;جميع البيانات&quot; فقط — لن يتم حفظ أي شيء حتى تؤكد المعاينة
          </p>
        </div>
        {fileName ? <p className="text-sm text-foreground">{fileName}</p> : null}
        {error ? <p className="text-sm text-destructive">{error}</p> : null}
        <input
          ref={inputRef}
          type="file"
          accept=".xlsx,.xls"
          className="hidden"
          onChange={handleChange}
        />
        <Button onClick={() => inputRef.current?.click()} disabled={isLoading}>
          <Upload />
          {isLoading ? "جاري التحليل..." : "اختر ملف"}
        </Button>
      </CardContent>
    </Card>
  );
}
