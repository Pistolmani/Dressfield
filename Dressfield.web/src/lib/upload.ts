import api from "@/lib/api";

export const UPLOAD_MAX_SIZE_MB = 10;
export const UPLOAD_MAX_SIZE_BYTES = UPLOAD_MAX_SIZE_MB * 1024 * 1024;
export const UPLOAD_ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp"];
export const UPLOAD_ALLOWED_EXTENSIONS = [".jpg", ".jpeg", ".png", ".webp"];

export class UploadValidationError extends Error {
  constructor(message: string) {
    super(message);
    this.name = "UploadValidationError";
  }
}

export function validateDesignFile(file: File): void {
  if (file.size > UPLOAD_MAX_SIZE_BYTES) {
    throw new UploadValidationError(
      `ფაილის ზომა არ უნდა აღემატებოდეს ${UPLOAD_MAX_SIZE_MB} MB-ს.`
    );
  }

  if (!UPLOAD_ALLOWED_TYPES.includes(file.type)) {
    throw new UploadValidationError(
      "მხოლოდ JPG, PNG ან WebP ფორმატი დასაშვებია."
    );
  }
}

export async function uploadDesignImage(file: File): Promise<string> {
  validateDesignFile(file);

  const form = new FormData();
  form.append("file", file);

  const { data } = await api.post<{ url: string }>("/api/upload/design", form, {
    headers: { "Content-Type": "multipart/form-data" },
  });

  return data.url;
}
