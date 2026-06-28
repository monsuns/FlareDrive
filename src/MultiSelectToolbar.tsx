import { useState } from "react";
import { Button, Menu, MenuItem, Slide, Toolbar } from "@mui/material";
import {
  Close as CloseIcon,
  Delete as DeleteIcon,
  Download as DownloadIcon,
  MoreHoriz as MoreHorizIcon,
} from "@mui/icons-material";

function MultiSelectToolbar({
  multiSelected,
  onClose,
  onDownload,
  onRename,
  onDelete,
  onShare,
}: {
  multiSelected: string[] | null;
  onClose: () => void;
  onDownload: () => void;
  onRename: () => void;
  onDelete: () => void;
  onShare: () => void;
}) {
  const [anchorEl, setAnchorEl] = useState<null | HTMLElement>(null);
  const single =
    multiSelected?.length === 1 && !multiSelected[0].endsWith("/");

  return (
    <Slide direction="up" in={multiSelected !== null}>
      <Toolbar
        sx={{
          position: "fixed",
          bottom: 0,
          left: 0,
          right: 0,
          zIndex: 100,
          backgroundColor: (theme) => theme.palette.background.paper,
          borderTop: "1px solid lightgray",
          justifyContent: "space-evenly",
          gap: 1,
          flexWrap: "wrap",
        }}
      >
        <Button
          size="small"
          color="primary"
          startIcon={<CloseIcon />}
          onClick={onClose}
        >
          Close
        </Button>
        <Button
          size="small"
          color="primary"
          disabled={!single}
          startIcon={<DownloadIcon />}
          onClick={onDownload}
        >
          Download
        </Button>
        <Button
          size="small"
          color="primary"
          startIcon={<DeleteIcon />}
          onClick={onDelete}
        >
          Delete
        </Button>
        <Button
          size="small"
          color="primary"
          disabled={!single}
          startIcon={<MoreHorizIcon />}
          onClick={(e) => setAnchorEl(e.currentTarget)}
        >
          More
        </Button>
        {multiSelected?.length && (
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={() => setAnchorEl(null)}
          >
            {single && (
              <>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    onRename();
                  }}
                >
                  Rename
                </MenuItem>
                <MenuItem
                  onClick={() => {
                    setAnchorEl(null);
                    onShare();
                  }}
                >
                  Share
                </MenuItem>
              </>
            )}
          </Menu>
        )}
      </Toolbar>
    </Slide>
  );
}

export default MultiSelectToolbar;
