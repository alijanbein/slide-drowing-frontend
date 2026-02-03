import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  List,
  Box,
} from "@mui/material";
import PlayArrowIcon from "@mui/icons-material/PlayArrow";
import type { Presentation } from "../types";
import { createSession } from "../api/sessions";
import { useNavigate } from "react-router-dom";

interface PresentationListProps {
  presentations: Presentation[];
  loading: boolean;
}

const PresentationList: React.FC<PresentationListProps> = ({
  presentations,
  loading,
}) => {
  const navigate = useNavigate();
  const [creatingSessionId, setCreatingSessionId] = useState<string | null>(
    null,
  );

  const handleCreateSession = async (presentationId: string) => {
    setCreatingSessionId(presentationId);
    try {
      const { joinCode } = await createSession(presentationId);
      // After creating session, user might want to present immediately or just see the code.
      // Goal says "shows joinCode + button 'Open Presenter View'".
      // I'll assume we redirect to dashboard or show a dialog?
      // Or actually, simpler: Redirect to Presenter view which shows the join code?
      // Wait, Presenter view is for the teacher.
      // "Dashboard ... create session ... shows joinCode + button 'Open Presenter View'"
      // So I probably shouldn't auto-redirect. I should show the result details in the list or a dialog.

      // For MVP, I will auto-open the presenter view with a state param or just navigate there.
      // But user request: "shows joinCode + button".
      // Let's navigate to Presenter View and let Presenter View show the join code.
      navigate(`/presenter/${joinCode}`);
    } catch (error) {
      console.error("Failed to create session", error);
    } finally {
      setCreatingSessionId(null);
    }
  };

  if (loading) return <Typography>Loading...</Typography>;
  if (presentations.length === 0)
    return <Typography>No presentations found.</Typography>;

  return (
    <List>
      {presentations.map((p) => (
        <Card key={p.id} sx={{ mb: 2 }}>
          <CardContent>
            <Box
              sx={{
                display: "flex",
                justifyContent: "space-between",
                alignItems: "center",
              }}
            >
              <Box>
                <Typography variant="h6">{p.title}</Typography>
                <Typography variant="body2" color="textSecondary">
                  {p.slide_count} slides
                </Typography>
              </Box>
              <Button
                variant="contained"
                color="primary"
                startIcon={<PlayArrowIcon />}
                onClick={() => handleCreateSession(p.id)}
                disabled={creatingSessionId === p.id}
              >
                {creatingSessionId === p.id ? "Starting..." : "Start Session"}
              </Button>
            </Box>
          </CardContent>
        </Card>
      ))}
    </List>
  );
};

export default PresentationList;
