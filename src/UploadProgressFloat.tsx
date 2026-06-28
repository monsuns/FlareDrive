import { Box, LinearProgress, Paper, Typography } from "@mui/material";
import { useTransferQueue } from "./app/transferQueue";
import { humanReadableSize } from "./app/utils";

// Floating upload progress card (bottom-right, above the Upload FAB).
// Shows one linear progress bar per active task; hides entirely when no
// task is pending or in-progress (i.e. uploads finished).
export default function UploadProgressFloat() {
  const tasks = useTransferQueue();
  const active = tasks.filter(
    (t) => t.status === "pending" || t.status === "in-progress"
  );
  if (active.length === 0) return null;

  return (
    <Paper
      elevation={6}
      sx={{
        position: "fixed",
        right: 16,
        bottom: 88,
        width: 320,
        maxWidth: "90vw",
        maxHeight: "50vh",
        overflowY: "auto",
        zIndex: 1200,
        p: 1.5,
      }}
    >
      <Typography variant="subtitle2" sx={{ mb: 1 }}>
        Uploading ({active.length})
      </Typography>
      {active.map((t) => {
        const pct = t.total ? Math.round((t.loaded / t.total) * 100) : 0;
        return (
          <Box key={t.name} sx={{ mb: 1.5, "&:last-child": { mb: 0 } }}>
            <Typography
              variant="caption"
              noWrap
              sx={{ display: "block", fontSize: 13 }}
            >
              {t.name}
            </Typography>
            <LinearProgress
              variant="determinate"
              value={pct}
              sx={{ height: 8, borderRadius: 4, mt: 0.5 }}
            />
            <Typography variant="caption" color="text.secondary">
              {t.status === "pending"
                ? "Waiting…"
                : `${humanReadableSize(t.loaded)} / ${humanReadableSize(
                    t.total
                  )} · ${pct}%`}
            </Typography>
          </Box>
        );
      })}
    </Paper>
  );
}
