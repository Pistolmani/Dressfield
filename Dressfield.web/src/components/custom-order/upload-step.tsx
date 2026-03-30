/* eslint-disable @next/next/no-img-element */
"use client";

import { useState } from "react";
import { useDropzone } from "react-dropzone";
import { ArrowLeft, UploadCloud } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  UPLOAD_ALLOWED_EXTENSIONS,
  UPLOAD_MAX_SIZE_MB,
  UploadValidationError,
  uploadDesignImage,
  validateDesignFile,
} from "@/lib/upload";
import { useCustomOrderStore } from "@/stores/custom-order-store";

function formatFileSize(bytes: number) {
  return `${(bytes / 1024 / 1024).toFixed(2)} MB`;
}

export function UploadStep() {
  const setStep = useCustomOrderStore((state) => state.setStep);
  const setUploadedFile = useCustomOrderStore((state) => state.setUploadedFile);
  const setDesign = useCustomOrderStore((state) => state.setDesign);
  const design = useCustomOrderStore((state) => state.design);

  const [file, setFile] = useState<File | null>(null);
  const [previewUrl, setPreviewUrl] = useState<string | null>(design?.previewDataUrl || null);
  const [error, setError] = useState("");
  const [isUploading, setIsUploading] = useState(false);

  function handleFile(nextFile: File) {
    try {
      validateDesignFile(nextFile);
      setError("");
      setFile(nextFile);
      setPreviewUrl((current) => {
        if (
          current &&
          current.startsWith("blob:") &&
          current !== design?.previewDataUrl
        ) {
          URL.revokeObjectURL(current);
        }
        return URL.createObjectURL(nextFile);
      });
    } catch (uploadError) {
      if (uploadError instanceof UploadValidationError) {
        setError(uploadError.message);
      } else {
        setError("ფაილის დამუშავება ვერ მოხერხდა.");
      }
    }
  }

  const dropzone = useDropzone({
    multiple: false,
    accept: {
      "image/jpeg": [".jpg", ".jpeg"],
      "image/png": [".png"],
      "image/webp": [".webp"],
    },
    onDropAccepted: (acceptedFiles) => {
      const nextFile = acceptedFiles[0];
      if (nextFile) {
        handleFile(nextFile);
      }
    },
    onDropRejected: () => setError("მხოლოდ JPG, PNG ან WebP ფორმატი დასაშვებია."),
  });

  async function handleUpload() {
    if (!file || !previewUrl) return;

    try {
      setIsUploading(true);
      setError("");
      const url = await uploadDesignImage(file);
      setUploadedFile(file);
      setDesign({
        designImageUrl: url,
        previewDataUrl: previewUrl,
        placement: "chest",
        size: "M",
        threadColor: "#7C3AED",
        width: null,
        height: null,
        positionX: null,
        positionY: null,
      });
      setStep(3);
    } catch {
      setError("ატვირთვა ვერ მოხერხდა");
    } finally {
      setIsUploading(false);
    }
  }

  return (
    <div className="space-y-6">
      <Button variant="outline" onClick={() => setStep(1)}>
        <ArrowLeft className="h-4 w-4" />
        უკან
      </Button>

      <div className="space-y-2">
        <h1 className="font-ui text-5xl font-semibold tracking-[0.04em]">
          ატვირთეთ დიზაინი
        </h1>
        <p className="text-muted-foreground">
          ჩააგდეთ ფაილი აქ ან დააჭირეთ ასარჩევად
        </p>
      </div>

      <div
        {...dropzone.getRootProps()}
        className="rounded-3xl border-2 border-dashed border-black/20 bg-white px-6 py-14 text-center shadow-sm"
      >
        <input {...dropzone.getInputProps()} />
        <UploadCloud className="mx-auto h-12 w-12 text-accent" />
        <p className="mt-4 text-lg font-medium">
          ჩააგდეთ ფაილი აქ ან დააჭირეთ ასარჩევად
        </p>
        <p className="mt-2 text-sm text-muted-foreground">
          {UPLOAD_ALLOWED_EXTENSIONS.join(", ").toUpperCase().replaceAll(".", "")} —
          მაქსიმუმ {UPLOAD_MAX_SIZE_MB} MB
        </p>
      </div>

      {error ? <p className="text-sm text-destructive">{error}</p> : null}

      {file && previewUrl ? (
        <div className="rounded-3xl border border-black/8 bg-white p-5 shadow-sm">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            <img
              src={previewUrl}
              alt="დიზაინის გადახედვა"
              className="h-28 w-28 rounded-2xl object-cover"
            />
            <div className="space-y-1">
              <p className="font-medium">{file.name}</p>
              <p className="text-sm text-muted-foreground">{formatFileSize(file.size)}</p>
            </div>
          </div>
        </div>
      ) : null}

      <div className="flex justify-end">
        <Button
          className="bg-accent text-white hover:bg-accent-hover"
          disabled={!file || isUploading}
          onClick={handleUpload}
        >
          {isUploading ? "იტვირთება..." : "ატვირთვა და გაგრძელება"}
        </Button>
      </div>
    </div>
  );
}
