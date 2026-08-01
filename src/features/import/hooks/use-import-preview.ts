"use client";

import { useMutation } from "@tanstack/react-query";
import { previewResponseSchema, type PreviewResponse } from "../schemas/preview-response-schema";

/** Uploads a workbook to the server-only parse pipeline and returns its preview — writes nothing. */
export function useImportPreview() {
  return useMutation<PreviewResponse, Error, { cityId: string; file: File }>({
    mutationFn: async ({ cityId, file }) => {
      const formData = new FormData();
      formData.append("cityId", cityId);
      formData.append("file", file);

      const response = await fetch("/api/import/preview", { method: "POST", body: formData });
      const json = await response.json();

      if (!response.ok) {
        throw new Error(json.error ?? "فشل تحليل الملف");
      }

      return previewResponseSchema.parse(json);
    },
  });
}
