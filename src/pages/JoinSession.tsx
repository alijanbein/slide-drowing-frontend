import { useState } from "react";
import {
  Box,
  Card,
  CardContent,
  TextField,
  Button,
  Typography,
  Alert,
  CircularProgress,
} from "@mui/material";
import LoginIcon from "@mui/icons-material/Login";
import { useNavigate } from "react-router-dom";
import { joinSession } from "../api/sessions";

const JoinSession = () => {
  const navigate = useNavigate();
  const [joinCode, setJoinCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const handleJoinSession = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!joinCode.trim()) {
      setError("Please enter a join code");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const session = await joinSession(joinCode.trim());
      // Successfully joined, navigate to presenter view
      navigate(`/presenter/${joinCode.trim()}`);
    } catch (err: any) {
      console.error("Failed to join session:", err);
      setError(
        err.response?.data?.detail ||
          "Failed to join session. Please check the join code and try again.",
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <Box
      sx={{
        minHeight: "100vh",
        display: "flex",
        alignItems: "center",
        justifyContent: "center",
        bgcolor: "#f5f5f5",
        p: 2,
      }}
    >
      <Card sx={{ maxWidth: 500, width: "100%" }}>
        <CardContent sx={{ p: 4 }}>
          <Typography variant="h4" gutterBottom align="center">
            Join Session
          </Typography>
          <Typography
            variant="body2"
            color="textSecondary"
            align="center"
            sx={{ mb: 4 }}
          >
            Enter the join code provided by your presenter to join the session
          </Typography>

          {error && (
            <Alert severity="error" sx={{ mb: 3 }}>
              {error}
            </Alert>
          )}

          <form onSubmit={handleJoinSession}>
            <TextField
              fullWidth
              label="Join Code"
              variant="outlined"
              value={joinCode}
              onChange={(e) => setJoinCode(e.target.value)}
              placeholder="Enter 6-character code"
              autoFocus
              disabled={loading}
              sx={{ mb: 3 }}
              inputProps={{
                style: { textTransform: "uppercase" },
                maxLength: 6,
              }}
            />

            <Button
              fullWidth
              variant="contained"
              color="primary"
              size="large"
              type="submit"
              disabled={loading || !joinCode.trim()}
              startIcon={
                loading ? <CircularProgress size={20} /> : <LoginIcon />
              }
            >
              {loading ? "Joining..." : "Join Session"}
            </Button>
          </form>

          <Box sx={{ mt: 3, textAlign: "center" }}>
            <Typography variant="body2" color="textSecondary">
              Don't have a join code?{" "}
              <Button
                color="primary"
                onClick={() => navigate("/login")}
                sx={{ textTransform: "none" }}
              >
                Sign in to create a session
              </Button>
            </Typography>
          </Box>
        </CardContent>
      </Card>
    </Box>
  );
};

export default JoinSession;
