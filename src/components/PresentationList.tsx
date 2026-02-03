import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  Box,
  Chip,
  Collapse,
  IconButton,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  DialogContentText,
  Snackbar,
  Alert,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import AddIcon from "@mui/icons-material/Add";
import ExpandMoreIcon from "@mui/icons-material/ExpandMore";
import ExpandLessIcon from "@mui/icons-material/ExpandLess";
import DeleteIcon from "@mui/icons-material/Delete";
import type { Presentation } from "../types";
import { createSession, deleteSession } from "../api/sessions";
import { useNavigate } from "react-router-dom";

interface PresentationListProps {
  presentations: Presentation[];
  loading: boolean;
}

interface StoredSession {
  sessionId: string;
  joinCode: string;
  createdAt: string;
  title: string;
}

const STORAGE_KEY = "presentation_sessions";

const PresentationList: React.FC<PresentationListProps> = ({
  presentations,
  loading,
}) => {
  const navigate = useNavigate();
  const [creatingSessionId, setCreatingSessionId] = useState<string | null>(
    null,
  );
  const [expandedPresentations, setExpandedPresentations] = useState<
    Set<string>
  >(new Set());
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [sessionToDelete, setSessionToDelete] = useState<{
    presentationId: string;
    sessionId: string;
    joinCode: string;
  } | null>(null);
  const [deletingSessionId, setDeletingSessionId] = useState<string | null>(
    null,
  );
  const [snackbar, setSnackbar] = useState<{
    open: boolean;
    message: string;
    severity: "success" | "error";
  }>({ open: false, message: "", severity: "success" });
  const [refreshKey, setRefreshKey] = useState(0);

  // Get sessions for a specific presentation
  const getSessionsForPresentation = (
    presentationId: string,
  ): StoredSession[] => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return [];
      const allSessions = JSON.parse(stored);
      return allSessions[presentationId] || [];
    } catch {
      return [];
    }
  };

  // Save a new session
  const saveSession = (
    presentationId: string,
    sessionId: string,
    joinCode: string,
    title: string,
  ) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      const allSessions = stored ? JSON.parse(stored) : {};

      const newSession: StoredSession = {
        sessionId,
        joinCode,
        createdAt: new Date().toISOString(),
        title,
      };

      const presentationSessions = allSessions[presentationId] || [];
      // Add to beginning, keep last 5
      allSessions[presentationId] = [newSession, ...presentationSessions].slice(
        0,
        5,
      );

      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
    } catch (e) {
      console.error("Failed to save session to localStorage:", e);
    }
  };

  const handleCreateSession = async (presentationId: string, title: string) => {
    setCreatingSessionId(presentationId);
    try {
      const { sessionId, joinCode } = await createSession(presentationId);

      // Save to localStorage
      saveSession(presentationId, sessionId, joinCode, title);

      // Navigate to presenter view
      navigate(`/presenter/${joinCode}`);
    } catch (error) {
      console.error("Failed to create session", error);
    } finally {
      setCreatingSessionId(null);
    }
  };

  const handleContinueSession = (joinCode: string) => {
    navigate(`/presenter/${joinCode}`);
  };

  const toggleExpand = (presentationId: string) => {
    setExpandedPresentations((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(presentationId)) {
        newSet.delete(presentationId);
      } else {
        newSet.add(presentationId);
      }
      return newSet;
    });
  };

  const formatDate = (isoString: string) => {
    const date = new Date(isoString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffMins = Math.floor(diffMs / 60000);

    if (diffMins < 1) return "Just now";
    if (diffMins < 60) return `${diffMins}m ago`;
    if (diffMins < 1440) return `${Math.floor(diffMins / 60)}h ago`;
    return `${Math.floor(diffMins / 1440)}d ago`;
  };

  // Open delete confirmation dialog
  const handleDeleteClick = (
    presentationId: string,
    sessionId: string,
    joinCode: string,
  ) => {
    setSessionToDelete({ presentationId, sessionId, joinCode });
    setDeleteDialogOpen(true);
  };

  // Remove session from localStorage
  const removeSessionFromStorage = (
    presentationId: string,
    joinCode: string,
  ) => {
    try {
      const stored = localStorage.getItem(STORAGE_KEY);
      if (!stored) return;
      const allSessions = JSON.parse(stored);
      const presentationSessions = allSessions[presentationId] || [];
      allSessions[presentationId] = presentationSessions.filter(
        (s: StoredSession) => s.joinCode !== joinCode,
      );
      localStorage.setItem(STORAGE_KEY, JSON.stringify(allSessions));
    } catch (e) {
      console.error("Failed to remove session from localStorage:", e);
    }
  };

  // Confirm and execute deletion
  const handleConfirmDelete = async () => {
    if (!sessionToDelete) return;

    setDeletingSessionId(sessionToDelete.sessionId);
    try {
      // Delete from backend
      await deleteSession(sessionToDelete.sessionId);

      // Remove from localStorage
      removeSessionFromStorage(
        sessionToDelete.presentationId,
        sessionToDelete.joinCode,
      );

      // Show success message
      setSnackbar({
        open: true,
        message: "Session deleted successfully",
        severity: "success",
      });

      // Force refresh to update UI
      setRefreshKey((prev) => prev + 1);
    } catch (error) {
      console.error("Failed to delete session:", error);
      setSnackbar({
        open: true,
        message: "Failed to delete session. Please try again.",
        severity: "error",
      });
    } finally {
      setDeletingSessionId(null);
      setDeleteDialogOpen(false);
      setSessionToDelete(null);
    }
  };

  // Cancel deletion
  const handleCancelDelete = () => {
    setDeleteDialogOpen(false);
    setSessionToDelete(null);
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (presentations.length === 0)
    return <Typography>No presentations found.</Typography>;

  return (
    <List key={refreshKey}>
      {presentations.map((p) => {
        const sessions = getSessionsForPresentation(p.id);
        const isExpanded = expandedPresentations.has(p.id);

        return (
          <Card key={p.id} sx={{ mb: 2 }}>
            <CardContent>
              <Box
                sx={{
                  display: "flex",
                  justifyContent: "space-between",
                  alignItems: "center",
                }}
              >
                <Box sx={{ flex: 1 }}>
                  <Typography variant="h6">{p.title}</Typography>
                  <Typography variant="body2" color="textSecondary">
                    {p.slide_count} slides
                  </Typography>
                </Box>
                <Box sx={{ display: "flex", gap: 1, alignItems: "center" }}>
                  <Button
                    variant="contained"
                    color="primary"
                    startIcon={<AddIcon />}
                    onClick={() => handleCreateSession(p.id, p.title)}
                    disabled={creatingSessionId === p.id}
                  >
                    {creatingSessionId === p.id
                      ? "Creating..."
                      : "Start New Session"}
                  </Button>
                  {sessions.length > 0 && (
                    <IconButton onClick={() => toggleExpand(p.id)} size="small">
                      {isExpanded ? <ExpandLessIcon /> : <ExpandMoreIcon />}
                    </IconButton>
                  )}
                </Box>
              </Box>

              {/* Recent Sessions */}
              {sessions.length > 0 && (
                <Collapse in={isExpanded}>
                  <Box sx={{ mt: 2, pt: 2, borderTop: "1px solid #e0e0e0" }}>
                    <Typography
                      variant="subtitle2"
                      color="textSecondary"
                      gutterBottom
                    >
                      Recent Sessions
                    </Typography>
                    {sessions.map((session) => (
                      <Box
                        key={session.joinCode}
                        sx={{
                          display: "flex",
                          justifyContent: "space-between",
                          alignItems: "center",
                          py: 1,
                          px: 2,
                          mb: 1,
                          bgcolor: "#f5f5f5",
                          borderRadius: 1,
                        }}
                      >
                        <Box
                          sx={{ display: "flex", gap: 2, alignItems: "center" }}
                        >
                          <Chip
                            label={session.joinCode}
                            size="small"
                            color="primary"
                            variant="outlined"
                          />
                          <Typography variant="caption" color="textSecondary">
                            {formatDate(session.createdAt)}
                          </Typography>
                        </Box>
                        <Box sx={{ display: "flex", gap: 1 }}>
                          <Button
                            size="small"
                            variant="outlined"
                            startIcon={<PlayArrowIcon />}
                            onClick={() =>
                              handleContinueSession(session.joinCode)
                            }
                          >
                            Continue
                          </Button>
                          <IconButton
                            size="small"
                            color="error"
                            onClick={() =>
                              handleDeleteClick(
                                p.id,
                                session.sessionId,
                                session.joinCode,
                              )
                            }
                            disabled={deletingSessionId === session.sessionId}
                          >
                            <DeleteIcon fontSize="small" />
                          </IconButton>
                        </Box>
                      </Box>
                    ))}
                  </Box>
                </Collapse>
              )}
            </CardContent>
          </Card>
        );
      })}

      {/* Delete Confirm ation Dialog */}
      <Dialog open={deleteDialogOpen} onClose={handleCancelDelete}>
        <DialogTitle>Delete Session?</DialogTitle>
        <DialogContent>
          <DialogContentText>
            Are you sure you want to delete this session? This will permanently
            remove:
            <ul>
              <li>The session and its join code</li>
              <li>All drawings and annotations from all users</li>
            </ul>
            This action cannot be undone.
          </DialogContentText>
        </DialogContent>
        <DialogActions>
          <Button onClick={handleCancelDelete}>Cancel</Button>
          <Button
            onClick={handleConfirmDelete}
            color="error"
            variant="contained"
            disabled={deletingSessionId !== null}
          >
            {deletingSessionId ? "Deleting..." : "Delete"}
          </Button>
        </DialogActions>
      </Dialog>

      {/* Success/Error Snackbar */}
      <Snackbar
        open={snackbar.open}
        autoHideDuration={4000}
        onClose={() => setSnackbar({ ...snackbar, open: false })}
        anchorOrigin={{ vertical: "bottom", horizontal: "center" }}
      >
        <Alert
          onClose={() => setSnackbar({ ...snackbar, open: false })}
          severity={snackbar.severity}
          variant="filled"
        >
          {snackbar.message}
        </Alert>
      </Snackbar>
    </List>
  );
};

export default PresentationList;
