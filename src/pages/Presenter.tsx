import { useEffect, useState, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Box,
  IconButton,
  Typography,
  Drawer,
  useMediaQuery,
  useTheme,
  CircularProgress,
  Badge,
} from "@mui/material";
import ArrowBackIcon from "@mui/icons-material/ArrowBack";
import ArrowForwardIcon from "@mui/icons-material/ArrowForward";
import SaveIcon from "@mui/icons-material/Save";
import MenuIcon from "@mui/icons-material/Menu";
import { joinSession, updateCurrentSlide } from "../api/sessions";
import { getAnnotations, saveAnnotations } from "../api/annotations";
import type { Stroke } from "../types";
import SlideCanvas from "../components/SlideCanvas";
import ToolPanel from "../components/ToolPanel";

const Presenter = () => {
  const { joinCode } = useParams<{ joinCode: string }>();
  // navigate? user might use browser back
  const theme = useTheme();
  const isMobile = useMediaQuery(theme.breakpoints.down("md"));

  const [session, setSession] = useState<any>(null); // { sessionId, presentationId, ... }
  const [currentSlide, setCurrentSlide] = useState(1);
  const [loading, setLoading] = useState(true);
  const [strokes, setStrokes] = useState<Stroke[]>([]);

  // Tool State
  const [tool, setTool] = useState<"pen" | "eraser">("pen");
  const [color, setColor] = useState("#000000");
  const [size, setSize] = useState(5);

  const [drawerOpen, setDrawerOpen] = useState(false);
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Dimensions
  const [containerSize, setContainerSize] = useState({
    width: 800,
    height: 600,
  });
  const containerRef = useRef<HTMLDivElement>(null);

  // Load Session
  useEffect(() => {
    const loadSession = async () => {
      if (!joinCode) return;
      try {
        const data = await joinSession(joinCode);
        setSession(data);
        setCurrentSlide(data.currentSlideNumber || 1);
      } catch (e) {
        console.error("Failed to join", e);
      } finally {
        setLoading(false);
      }
    };
    loadSession();
  }, [joinCode]);

  // Handle Resize
  useEffect(() => {
    const handleResize = () => {
      if (containerRef.current) {
        setContainerSize({
          width: containerRef.current.offsetWidth,
          height: containerRef.current.offsetHeight,
        });
      }
    };
    window.addEventListener("resize", handleResize);
    handleResize();
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  // Load Annotations when slide changes
  useEffect(() => {
    if (!session) return;
    const loadStrokes = async () => {
      try {
        const loaded = await getAnnotations(session.sessionId, currentSlide);
        setStrokes(loaded || []);
        setHasUnsavedChanges(false);
      } catch (e) {
        console.error("Failed annotations", e);
      }
    };
    loadStrokes();
  }, [session, currentSlide]);

  const handleSave = async () => {
    if (!session) return;
    try {
      await saveAnnotations(session.sessionId, currentSlide, strokes);
      setHasUnsavedChanges(false);
    } catch (e) {
      console.error("Save failed", e);
    }
  };

  const changeSlide = async (delta: number) => {
    if (!session) return;
    // Auto-save before switch
    if (hasUnsavedChanges) {
      await handleSave(); // detailed logic: wait or fire and forget? Prompt says "auto-save on slide change"
    }

    const newSlide = currentSlide + delta;
    if (newSlide < 1 || newSlide > session.slideCount) return;

    setCurrentSlide(newSlide);
    // Update session state in backend
    try {
      await updateCurrentSlide(session.sessionId, newSlide);
    } catch (e) {
      console.error(e);
    }
  };

  const handleStrokesChange = (newStrokes: Stroke[]) => {
    setStrokes(newStrokes);
    setHasUnsavedChanges(true);
  };

  // derived image URL
  const imageUrl = session
    ? `${import.meta.env.VITE_API_BASE_URL || "http://localhost:8000"}/sessions/${session.presentationId}/${currentSlide}/image`
    : "";

  if (loading) return <CircularProgress />;
  if (!session) return <Typography>Session not found.</Typography>;

  return (
    <Box
      sx={{
        height: "100vh",
        display: "flex",
        flexDirection: "column",
        overflow: "hidden",
      }}
    >
      {/* Top Bar */}
      <Box
        sx={{
          p: 1,
          borderBottom: "1px solid #ddd",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between",
          bgcolor: "white",
          zIndex: 10,
        }}
      >
        <Box sx={{ display: "flex", alignItems: "center", gap: 2 }}>
          <Typography variant="h6">{session.title}</Typography>
          <Typography variant="body2">Code: {joinCode}</Typography>
        </Box>
        <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
          {hasUnsavedChanges && (
            <Badge color="warning" variant="dot" sx={{ mr: 2 }}>
              <Typography variant="caption">Unsaved</Typography>
            </Badge>
          )}
          <IconButton
            onClick={handleSave}
            color="primary"
            title="Save manually"
          >
            <SaveIcon />
          </IconButton>
          <IconButton
            onClick={() => changeSlide(-1)}
            disabled={currentSlide <= 1}
          >
            <ArrowBackIcon />
          </IconButton>
          <Typography>
            {currentSlide} / {session.slideCount}
          </Typography>
          <IconButton
            onClick={() => changeSlide(1)}
            disabled={currentSlide >= session.slideCount}
          >
            <ArrowForwardIcon />
          </IconButton>
          {isMobile && (
            <IconButton onClick={() => setDrawerOpen(true)}>
              <MenuIcon />
            </IconButton>
          )}
        </Box>
      </Box>

      {/* Main Content */}
      <Box
        sx={{
          flexGrow: 1,
          display: "flex",
          position: "relative",
          bgcolor: "#e0e0e0",
        }}
      >
        {/* Sidebar Tools (Desktop) */}
        {!isMobile && (
          <Box
            sx={{
              width: 260,
              p: 2,
              bgcolor: "white",
              borderRight: "1px solid #ddd",
              zIndex: 5,
            }}
          >
            <ToolPanel
              tool={tool}
              setTool={setTool}
              color={color}
              setColor={setColor}
              size={size}
              setSize={setSize}
              onUndo={() => {
                setStrokes((prev) => prev.slice(0, -1));
                setHasUnsavedChanges(true);
              }}
              onClear={() => {
                if (confirm("Clear all drawings on this slide?")) {
                  setStrokes([]);
                  setHasUnsavedChanges(true);
                }
              }}
            />
          </Box>
        )}

        {/* Canvas Container */}
        <Box
          ref={containerRef}
          sx={{
            flexGrow: 1,
            position: "relative",
            overflow: "hidden",
            display: "flex",
            justifyContent: "center",
            alignItems: "center",
          }}
        >
          <SlideCanvas
            width={containerSize.width}
            height={containerSize.height}
            imageUrl={imageUrl}
            strokes={strokes}
            onStrokesChange={handleStrokesChange}
            tool={tool}
            color={color}
            size={size}
          />
        </Box>
      </Box>

      {/* Mobile Drawer */}
      <Drawer
        anchor="right"
        open={drawerOpen}
        onClose={() => setDrawerOpen(false)}
      >
        <Box sx={{ p: 2, width: 280 }}>
          <Typography variant="h6" gutterBottom>
            Tools
          </Typography>
          <ToolPanel
            tool={tool}
            setTool={setTool}
            color={color}
            setColor={setColor}
            size={size}
            setSize={setSize}
            onUndo={() => {
              setStrokes((prev) => prev.slice(0, -1));
              setHasUnsavedChanges(true);
            }}
            onClear={() => {
              setStrokes([]);
              setHasUnsavedChanges(true);
            }}
          />
        </Box>
      </Drawer>
    </Box>
  );
};

export default Presenter;
