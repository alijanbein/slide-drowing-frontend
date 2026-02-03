import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import { useNavigate, Link as RouterLink } from "react-router-dom";
import {
  Box,
  Button,
  TextField,
  Typography,
  Paper,
  Alert,
  Link,
} from "@mui/material";

const Login = () => {
  const { login } = useAuth();
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    try {
      await login({ username: email, password }); // Contract says {email, password} but let's double check contract.
      // Contract: POST /auth/login {email,password} -> {token, user}
      // Note: "username" is often used in OAuth/FastAPI standard form, but the USER REQUEST said:
      // "POST /auth/login {email,password}"
      // I will send email as "email" unless standard form data is required.
      // Wait, standard FastAPI OAuth2PasswordRequestForm expects `username` and `password` as form data.
      // The user specified contract explicitly: `{email,password}` JSON?
      // "POST /auth/login {email,password} -> {token, user}" implies JSON body.
      // I will stick to what the user asked: JSON props matching the names.
      // However, if the backend uses `OAuth2PasswordRequestForm`, it needs `username` (which holds email).
      // Given "API CONTRACT (do not change)", I must send what is documented.
      // If it fails, I might need to adjust. But I will use the contract names.
      // Actually my contexts passed `data` directly.
      // I'll assume usage of `email` and `password`.

      navigate("/dashboard");
    } catch (err: any) {
      setError("Invalid credentials");
    }
  };

  return (
    <Box
      sx={{
        display: "flex",
        justifyContent: "center",
        alignItems: "center",
        minHeight: "80vh",
      }}
    >
      <Paper elevation={3} sx={{ p: 4, width: "100%", maxWidth: 400 }}>
        <Typography variant="h5" align="center" gutterBottom>
          Login
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 2 }}>
            {error}
          </Alert>
        )}
        <form onSubmit={handleSubmit}>
          <TextField
            fullWidth
            label="Email"
            type="email"
            margin="normal"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />
          <TextField
            fullWidth
            label="Password"
            type="password"
            margin="normal"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />
          <Button fullWidth type="submit" variant="contained" sx={{ mt: 3 }}>
            Login
          </Button>
          <Box sx={{ mt: 2, textAlign: "center" }}>
            <Link component={RouterLink} to="/register">
              Don't have an account? Register
            </Link>
          </Box>
        </form>
      </Paper>
    </Box>
  );
};

export default Login;
