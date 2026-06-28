import {
  AudioFile as AudioFileIcon,
  Code as CodeIcon,
  Folder as FolderIcon,
  FolderZipOutlined as FolderZipOutlinedIcon,
  Image as ImageIcon,
  InsertDriveFileOutlined as InsertDriveFileOutlinedIcon,
  PictureAsPdf as PdfIcon,
  VideoFile as VideoFileIcon,
} from "@mui/icons-material";

function MimeIcon({ contentType }: { contentType: string }) {
  const fallbackIcon = <InsertDriveFileOutlinedIcon fontSize="large" />;
  if (typeof contentType !== "string") return fallbackIcon;

  return contentType.startsWith("image/") ? (
    <ImageIcon fontSize="large" />
  ) : contentType.startsWith("audio/") ? (
    <AudioFileIcon fontSize="large" />
  ) : contentType.startsWith("video/") ? (
    <VideoFileIcon fontSize="large" />
  ) : contentType === "application/pdf" ? (
    <PdfIcon fontSize="large" />
  ) : ["application/zip", "application/gzip"].includes(contentType) ? (
    <FolderZipOutlinedIcon fontSize="large" />
  ) : contentType.startsWith("text/") ? (
    <CodeIcon fontSize="large" />
  ) : contentType === "application/x-directory" ? (
    <FolderIcon fontSize="large" />
  ) : (
    fallbackIcon
  );
}

export default MimeIcon;
