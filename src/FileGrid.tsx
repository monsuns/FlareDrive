import React, { useEffect, useState } from "react";
import {
  Box,
  Grid,
  ListItemButton,
  ListItemIcon,
  ListItemText,
} from "@mui/material";
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

function FileGrid({
  files,
  onCwdChange,
  multiSelected,
  onMultiSelect,
  onOpenFile,
  emptyMessage,
}: {
  files: FileItem[];
  onCwdChange: (newCwd: string) => void;
  multiSelected: string[] | null;
  onMultiSelect: (key: string) => void;
  onOpenFile: (key: string) => void;
  emptyMessage?: React.ReactNode;
}) {
  return files.length === 0 ? (
    emptyMessage
  ) : (
    <Grid container sx={{ paddingBottom: "48px" }}>
      {files.map((file) => (
        <Grid item key={file.key} xs={12} sm={6} md={4} lg={3} xl={2}>
          <ListItemButton
            selected={multiSelected?.includes(file.key)}
            onClick={() => {
              if (multiSelected !== null) {
                onMultiSelect(file.key);
              } else if (isDirectory(file)) {
                onCwdChange(file.key + "/");
              } else onOpenFile(file.key);
            }}
            onContextMenu={(e) => {
              e.preventDefault();
              onMultiSelect(file.key);
            }}
            sx={{ userSelect: "none" }}
          >
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
                  <Box
                    sx={{
                      display: "inline-block",
                      minWidth: "160px",
                      marginRight: 1,
                    }}
                  >
                    {new Date(file.uploaded).toLocaleString()}
                  </Box>
                  {!isDirectory(file) && humanReadableSize(file.size)}
                </React.Fragment>
              }
            />
          </ListItemButton>
        </Grid>
      ))}
    </Grid>
  );
}

export default FileGrid;
