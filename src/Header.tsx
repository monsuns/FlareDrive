import { Box, IconButton, InputBase, Toolbar } from "@mui/material";
import {
  ArrowDownward as ArrowDownIcon,
  ArrowUpward as ArrowUpIcon,
  PendingActions as ProgressIcon,
  Sort as SortBySizeIcon,
  SortByAlpha as SortByNameIcon,
  Update as SortByDateIcon,
  ViewList as ViewListIcon,
  ViewModule as ViewModuleIcon,
} from "@mui/icons-material";
import { ViewMode } from "./FileGrid";

export type SortMode = "name-asc" | "name-desc" | "size-desc" | "date-desc";

const SORT_META: Record<
  SortMode,
  { icon: typeof SortByNameIcon; label: string; arrow: "up" | "down" }
> = {
  "name-asc": { icon: SortByNameIcon, label: "Name A→Z", arrow: "up" },
  "name-desc": { icon: SortByNameIcon, label: "Name Z→A", arrow: "down" },
  "size-desc": { icon: SortBySizeIcon, label: "Largest first", arrow: "down" },
  "date-desc": { icon: SortByDateIcon, label: "Newest first", arrow: "down" },
};

function Header({
  search,
  onSearchChange,
  setShowProgressDialog,
  viewMode,
  setViewMode,
  sortMode,
  cycleSort,
}: {
  search: string;
  onSearchChange: (newSearch: string) => void;
  setShowProgressDialog: (show: boolean) => void;
  viewMode: ViewMode;
  setViewMode: (mode: ViewMode) => void;
  sortMode: SortMode;
  cycleSort: () => void;
}) {
  const meta = SORT_META[sortMode];
  const SortIcon = meta.icon;
  const ArrowIcon = meta.arrow === "up" ? ArrowUpIcon : ArrowDownIcon;

  return (
    <Toolbar disableGutters sx={{ padding: 1, gap: 0.5 }}>
      <InputBase
        size="small"
        fullWidth
        placeholder="Search…"
        value={search}
        onChange={(e) => onSearchChange(e.target.value)}
        sx={{
          backgroundColor: "whitesmoke",
          borderRadius: "999px",
          padding: "8px 16px",
        }}
      />
      <IconButton
        aria-label="View as"
        title={`View: ${viewMode === "grid" ? "grid" : "list"}`}
        onClick={() => setViewMode(viewMode === "grid" ? "list" : "grid")}
      >
        {viewMode === "grid" ? <ViewModuleIcon /> : <ViewListIcon />}
      </IconButton>
      <IconButton
        aria-label="Sort by"
        title={`Sort: ${meta.label}`}
        onClick={cycleSort}
      >
        <Box sx={{ position: "relative", display: "inline-flex" }}>
          <SortIcon />
          <ArrowIcon
            fontSize="small"
            sx={{
              position: "absolute",
              right: -4,
              bottom: -4,
              fontSize: 12,
              backgroundColor: "background.paper",
              borderRadius: "50%",
            }}
          />
        </Box>
      </IconButton>
      <IconButton
        aria-label="Progress"
        title="Transfer history"
        onClick={() => setShowProgressDialog(true)}
      >
        <ProgressIcon />
      </IconButton>
    </Toolbar>
  );
}

export default Header;
