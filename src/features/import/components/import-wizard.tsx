"use client";

import { useState } from "react";
import { toast } from "sonner";
import { useRouter } from "next/navigation";
import { UploadStep } from "./upload-step";
import { PreviewStep } from "./preview-step";
import { useImportPreview } from "../hooks/use-import-preview";
import { useCommitImport } from "../hooks/use-commit-import";
import type { PreviewResponse } from "../schemas/preview-response-schema";
import type { HoldingInsertRecord } from "../core/build-holding-records";

/** Orchestrates upload -> preview -> [user confirms] -> commit. Owns no parsing logic itself. */
export function ImportWizard({ cityId }: { cityId: string }) {
  const router = useRouter();
  const [file, setFile] = useState<File | null>(null);
  const [previewData, setPreviewData] = useState<PreviewResponse | null>(null);

  const preview = useImportPreview();
  const commit = useCommitImport();

  function handleFileSelected(selected: File) {
    setFile(selected);
    setPreviewData(null);
    preview.mutate(
      { cityId, file: selected },
      {
        onSuccess: (data) => setPreviewData(data),
        onError: (e) => toast.error(e.message),
      },
    );
  }

  function handleConfirm() {
    if (!previewData || !file) return;
    commit.mutate(
      {
        cityId,
        fileName: file.name,
        storagePath: null,
        preview: previewData.preview,
        records: previewData.records as unknown as HoldingInsertRecord[],
        mappingUsed: previewData.mappingUsed,
      },
      {
        onSuccess: () => {
          toast.success(`تم استيراد ${previewData.preview.rowsValid} صف بنجاح`);
          setFile(null);
          setPreviewData(null);
          router.refresh();
        },
        onError: () => toast.error("فشل حفظ الاستيراد"),
      },
    );
  }

  function handleCancel() {
    setFile(null);
    setPreviewData(null);
  }

  if (previewData && file) {
    return (
      <PreviewStep
        data={previewData}
        fileName={file.name}
        onConfirm={handleConfirm}
        onCancel={handleCancel}
        isCommitting={commit.isPending}
      />
    );
  }

  return (
    <UploadStep
      onFileSelected={handleFileSelected}
      isLoading={preview.isPending}
      error={preview.error?.message}
    />
  );
}
