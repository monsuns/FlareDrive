import { useEffect, useState } from "react";
import {
  Box,
  CircularProgress,
  Dialog,
  DialogContent,
  DialogTitle,
  IconButton,
  Typography,
} from "@mui/material";
import { Close as CloseIcon, Download as DownloadIcon } from "@mui/icons-material";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";

import { encodeKey, FileItem } from "./FileGrid";
import { getPreviewKind } from "./app/preview";
import { authFetch, fetchAuthBlobUrl } from "./app/auth";
import { downloadFile } from "./app/transfer";

function Centered({ children }: { children: React.ReactNode }) {
  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        height: "100%",
      }}
    >
      {children}
    </Box>
  );
}

// Full-screen preview dialog. Every byte is fetched through an authenticated
// request (WebDAV is auth-protected), then rendered with a native element:
// <img>/<video>/<audio>/<iframe> via blob URL, or <pre>/markdown as text.
export default function PreviewDialog({
  file,
  onClose,
}: {
  file: FileItem | null;
  onClose: () => void;
}) {
  const kind = file ? getPreviewKind(file) : "none";
  const [blobUrl, setBlobUrl] = useState<string | null>(null);
  const [text, setText] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setBlobUrl(null);
    setText(null);
    setError(null);
    if (!file) return;

    let cancelled = false;
    let createdUrl: string | null = null;
    const path = `/webdav/${encodeKey(file.key)}`;
    const k = getPreviewKind(file);

    if (k === "text" || k === "markdown") {
      authFetch(path)
        .then((r) => (r.ok ? r.text() : Promise.reject(new Error(`HTTP ${r.status}`))))
        .then((t) => !cancelled && setText(t))
        .catch((e) => !cancelled && setError(String(e?.message ?? e)));
    } else if (k === "image" || k === "video" || k === "audio" || k === "pdf") {
      fetchAuthBlobUrl(path)
        .then((u) => {
          if (cancelled) {
            URL.revokeObjectURL(u);
            return;
          }
          createdUrl = u;
          setBlobUrl(u);
        })
        .catch((e) => !cancelled && setError(String(e?.message ?? e)));
    }

    return () => {
      cancelled = true;
      if (createdUrl) URL.revokeObjectURL(createdUrl);
    };
  }, [file]);

  const loading = blobUrl === null && text === null && !error;

  return (
    <Dialog fullScreen open={!!file} onClose={onClose}>
      <DialogTitle sx={{ display: "flex", alignItems: "center", gap: 1, pr: 1 }}>
        <Typography noWrap sx={{ flex: 1, minWidth: 0 }}>
          {file?.key}
        </Typography>
        <IconButton
          onClick={() => file && downloadFile(file.key).catch(() => {})}
          title="Download"
        >
          <DownloadIcon />
        </IconButton>
        <IconButton onClick={onClose} title="Close">
          <CloseIcon />
        </IconButton>
      </DialogTitle>
      <DialogContent dividers sx={{ p: 0, overflow: "hidden" }}>
        {error ? (
          <Centered>
            <Typography color="error">Preview failed: {error}</Typography>
          </Centered>
        ) : loading ? (
          <Centered>
            <CircularProgress />
          </Centered>
        ) : kind === "image" ? (
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", overflow: "auto" }}>
            <img
              src={blobUrl!}
              alt={file?.key}
              style={{ maxWidth: "100%", maxHeight: "100%", objectFit: "contain" }}
            />
          </Box>
        ) : kind === "video" ? (
          <Box sx={{ height: "100%", display: "flex", justifyContent: "center", alignItems: "center", background: "#000" }}>
            <video src={blobUrl!} controls autoPlay style={{ maxWidth: "100%", maxHeight: "100%" }} />
          </Box>
        ) : kind === "audio" ? (
          <Centered>
            <audio src={blobUrl!} controls />
          </Centered>
        ) : kind === "pdf" ? (
          <iframe src={blobUrl!} title="pdf-preview" style={{ width: "100%", height: "100%", border: "none" }} />
        ) : kind === "markdown" ? (
          <Box sx={{ p: 3, overflow: "auto", height: "100%" }}>
            <ReactMarkdown remarkPlugins={[remarkGfm]}>{text!}</ReactMarkdown>
          </Box>
        ) : (
          <Box sx={{ p: 2, overflow: "auto", height: "100%" }}>
            <pre style={{ whiteSpace: "pre-wrap", wordBreak: "break-word", margin: 0, fontFamily: "monospace" }}>
              {text}
            </pre>
          </Box>
        )}
      </DialogContent>
    </Dialog>
  );
}
