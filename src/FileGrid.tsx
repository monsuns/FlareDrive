import React, { useEffect, useRef, useState } from "react";
import {
  Box,
  Grid,
  IconButton,
  List,
  ListItemButton,
  ListItemIcon,
  ListItemText,
  Typography,
} from "@mui/material";
import { Download as DownloadIcon, Visibility as VisibilityIcon } from "@mui/icons-material";
import MimeIcon from "./MimeIcon";
import { fetchAuthBlobUrl } from "./app/auth";
import { humanReadableSize } from "./app/utils";

export interface FileItem {
  key: string;
  size: number;
  uploaded: string;
  httpMetadata: { contentType: string };
  customMetadata?: { thumbnail?: string };
}

export type ViewMode = "grid" | "list";

function extractFilename(key: string) {
  return key.split("/").pop();
}

export function encodeKey(key: string) {
  return key.split("/").map(encodeURIComponent).join("/");
}

export function isDirectory(file: FileItem) {
  return file.httpMetadata?.contentType === "application/x-directory";
}

// Thumbnails live under a Basic-auth-protected WebDAV path. The browser can't
// attach our Authorization header to an <img src>, so fetch the bytes ourselves
// and render via a blob URL. A 401 is surfaced globally by authFetch.
function Thumbnail({
  digest,
  contentType,
  alt,
}: {
  digest: string;
  contentType: string;
  alt: string;
}) {
  const [url, setUrl] = useState<string | null>(null);
  useEffect(() => {
    let objectUrl: string | null = null;
    let cancelled = false;
    fetchAuthBlobUrl(`/webdav/_$flaredrive$/thumbnails/${digest}.png`)
      .then((u) => {
        if (cancelled) {
          URL.revokeObjectURL(u);
          return;
        }
        objectUrl = u;
        setUrl(u);
      })
      .catch(() => {
        /* auth failures are handled globally; otherwise simply no thumbnail */
      });
    return () => {
      cancelled = true;
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    };
  }, [digest]);

  if (!url) return <MimeIcon contentType={contentType} />;
  return (
    <img
      src={url}
      alt={alt}
      style={{ width: 36, height: 36, objectFit: "cover" }}
    />
  );
}

// Shared row used by both grid and list layouts. Long-press (touch) enters
// multi-select mode, mirroring the existing right-click (contextmenu) trigger.
function FileRow({
  file,
  multiSelected,
  onMultiSelect,
  onPreview,
  onDownload,
  onCwdChange,
  listView,
}: {
  file: FileItem;
  multiSelected: string[] | null;
  onMultiSelect: (key: string) => void;
  onPreview: (key: string) => void;
  onDownload: (key: string) => void;
  onCwdChange: (newCwd: string) => void;
  listView: boolean;
}) {
  const pressTimer = useRef<number | null>(null);
  const longPressed = useRef(false);

  const startPress = () => {
    pressTimer.current = window.setTimeout(() => {
      longPressed.current = true;
      onMultiSelect(file.key);
    }, 500);
  };
  const cancelPress = () => {
    if (pressTimer.current) {
      clearTimeout(pressTimer.current);
      pressTimer.current = null;
    }
  };

  return (
    <ListItemButton
      selected={multiSelected?.includes(file.key)}
      onClick={() => {
        // Suppress the synthetic click that follows a long-press selection.
        if (longPressed.current) {
          longPressed.current = false;
          return;
        }
        if (multiSelected !== null) {
          onMultiSelect(file.key);
        } else if (isDirectory(file)) {
          onCwdChange(file.key + "/");
        } else onPreview(file.key);
      }}
      onContextMenu={(e) => {
        e.preventDefault();
        onMultiSelect(file.key);
      }}
      onTouchStart={startPress}
      onTouchMove={cancelPress}
      onTouchEnd={cancelPress}
      divider={listView}
      sx={{
        userSelect: "none",
        position: "relative",
        "&:hover .preview-actions": { opacity: 1 },
      }}
    >
      <Box
        className="preview-actions"
        sx={{
          position: "absolute",
          right: 4,
          top: 4,
          opacity: 0,
          transition: "opacity .15s",
          display: "flex",
          zIndex: 2,
        }}
      >
        <IconButton
          size="small"
          title="Preview"
          onClick={(e) => {
            e.stopPropagation();
            onPreview(file.key);
          }}
        >
          <VisibilityIcon fontSize="small" />
        </IconButton>
        <IconButton
          size="small"
          title="Download"
          onClick={(e) => {
            e.stopPropagation();
            onDownload(file.key);
          }}
        >
          <DownloadIcon fontSize="small" />
        </IconButton>
      </Box>
      <ListItemIcon>
        {file.customMetadata?.thumbnail ? (
          <Thumbnail
            digest={file.customMetadata.thumbnail}
            contentType={file.httpMetadata.contentType}
            alt={file.key}
          />
        ) : (
          <MimeIcon contentType={file.httpMetadata.contentType} />
        )}
      </ListItemIcon>
      <ListItemText
        primary={extractFilename(file.key)}
        primaryTypographyProps={{
          whiteSpace: "nowrap",
          overflow: "hidden",
          textOverflow: "ellipsis",
        }}
        secondary={
          <React.Fragment>
            <Typography
              component="span"
              sx={{
                display: "inline-block",
                minWidth: listView ? "120px" : "160px",
                marginRight: 1,
              }}
            >
              {new Date(file.uploaded).toLocaleString()}
            </Typography>
            {!isDirectory(file) && humanReadableSize(file.size)}
          </React.Fragment>
        }
      />
    </ListItemButton>
  );
}

function FileGrid({
  files,
  viewMode,
  onCwdChange,
  multiSelected,
  onMultiSelect,
  onPreview,
  onDownload,
  emptyMessage,
}: {
  files: FileItem[];
  viewMode: ViewMode;
  onCwdChange: (newCwd: string) => void;
  multiSelected: string[] | null;
  onMultiSelect: (key: string) => void;
  onPreview: (key: string) => void;
  onDownload: (key: string) => void;
  emptyMessage?: React.ReactNode;
}) {
  if (files.length === 0) return <>{emptyMessage}</>;

  const row = (file: FileItem) => (
    <FileRow
      key={file.key}
      file={file}
      listView={viewMode === "list"}
      onCwdChange={onCwdChange}
      multiSelected={multiSelected}
      onMultiSelect={onMultiSelect}
      onPreview={onPreview}
      onDownload={onDownload}
    />
  );

  return viewMode === "list" ? (
    <List sx={{ paddingBottom: "48px" }}>{files.map(row)}</List>
  ) : (
    <Grid container sx={{ paddingBottom: "48px" }}>
      {files.map((file) => (
        <Grid item key={file.key} xs={12} sm={6} md={4} lg={3} xl={2}>
          {row(file)}
        </Grid>
      ))}
    </Grid>
  );
}

export default FileGrid;
