// Decide how (or whether) to preview a file in-app.
// Office and other unsupported types fall back to download (kind === "none").
import { FileItem } from "../FileGrid";

export type PreviewKind =
  | "image"
  | "video"
  | "audio"
  | "pdf"
  | "text"
  | "markdown"
  | "none";

const TEXT_EXTENSIONS = [
  ".txt", ".log", ".json", ".js", ".jsx", ".ts", ".tsx", ".css", ".scss",
  ".xml", ".yaml", ".yml", ".ini", ".conf", ".sh", ".py", ".go", ".rs",
  ".java", ".c", ".cpp", ".h", ".toml", ".env", ".gitignore",
];

export function getExt(key: string): string {
  const i = key.lastIndexOf(".");
  return i >= 0 ? key.slice(i).toLowerCase() : "";
}

export function getPreviewKind(file: FileItem): PreviewKind {
  const ct = file.httpMetadata?.contentType || "";
  const ext = getExt(file.key);
  if (ct.startsWith("image/")) return "image";
  if (ct.startsWith("video/")) return "video";
  if (ct.startsWith("audio/")) return "audio";
  if (ct === "application/pdf") return "pdf";
  if (ext === ".md" || ext === ".markdown") return "markdown";
  if (ct.startsWith("text/")) return "text";
  if (TEXT_EXTENSIONS.includes(ext)) return "text";
  return "none";
}
