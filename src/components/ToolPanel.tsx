import React from "react";
import {
  Paper,
  ToggleButton,
  ToggleButtonGroup,
  Slider,
  Box,
  Typography,
  IconButton,
  Tooltip,
  Divider,
} from "@mui/material";
import CreateIcon from "@mui/icons-material/Create"; // Pen
import AutoFixNormalIcon from "@mui/icons-material/AutoFixNormal"; // Eraser (best fit logic)
import UndoIcon from "@mui/icons-material/Undo";
import DeleteIcon from "@mui/icons-material/Delete";

import CircleIcon from "@mui/icons-material/Circle";

interface ToolPanelProps {
  tool: "pen" | "eraser";
  setTool: (t: "pen" | "eraser") => void;
  color: string;
  setColor: (c: string) => void;
  size: number;
  setSize: (s: number) => void;
  onUndo: () => void;
  onClear: () => void;
}

const COLORS = [
  "#000000",
  "#df4b26",
  "#228b22",
  "#0000ff",
  "#ff00ff",
  "#ffa500",
];

const ToolPanel: React.FC<ToolPanelProps> = ({
  tool,
  setTool,
  color,
  setColor,
  size,
  setSize,
  onUndo,
  onClear,
}) => {
  return (
    <Paper
      elevation={3}
      sx={{
        p: 2,
        display: "flex",
        flexDirection: "column",
        gap: 2,
        width: "100%",
        maxWidth: 250,
      }}
    >
      {/* Tool Selection */}
      <Box>
        <Typography variant="caption" color="textSecondary">
          Tool
        </Typography>
        <ToggleButtonGroup
          value={tool}
          exclusive
          onChange={(_, newTool) => newTool && setTool(newTool)}
          fullWidth
          size="small"
        >
          <ToggleButton value="pen" title="Pen">
            <CreateIcon />
          </ToggleButton>
          <ToggleButton value="eraser" title="Eraser">
            <AutoFixNormalIcon />
          </ToggleButton>
        </ToggleButtonGroup>
      </Box>

      {/* Color Selection - Only for Pen */}
      <Box
        sx={{
          opacity: tool === "eraser" ? 0.5 : 1,
          pointerEvents: tool === "eraser" ? "none" : "auto",
        }}
      >
        <Typography variant="caption" color="textSecondary">
          Color
        </Typography>
        <Box sx={{ display: "flex", flexWrap: "wrap", gap: 1 }}>
          {COLORS.map((c) => (
            <IconButton
              key={c}
              size="small"
              onClick={() => setColor(c)}
              sx={{
                p: 0,
                border:
                  color === c ? "2px solid #555" : "2px solid transparent",
              }}
            >
              <CircleIcon sx={{ color: c }} />
            </IconButton>
          ))}
        </Box>
      </Box>

      {/* Size Slider */}
      <Box>
        <Typography variant="caption" color="textSecondary">
          Size ({size})
        </Typography>
        <Slider
          value={size}
          onChange={(_, val) => setSize(val as number)}
          min={1}
          max={20}
          valueLabelDisplay="auto"
        />
      </Box>

      <Divider />

      {/* Actions */}
      <Box sx={{ display: "flex", justifyContent: "space-between" }}>
        <Tooltip title="Undo">
          <IconButton onClick={onUndo}>
            <UndoIcon />
          </IconButton>
        </Tooltip>
        <Tooltip title="Clear Slide">
          <IconButton onClick={onClear} color="error">
            <DeleteIcon />
          </IconButton>
        </Tooltip>
      </Box>
    </Paper>
  );
};

export default ToolPanel;
