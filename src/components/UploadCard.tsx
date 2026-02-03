import React, { useState } from "react";
import {
  Card,
  CardContent,
  Typography,
  Button,
  Box,
  CircularProgress,
  Alert,
} from "@mui/material";
import { createPresentation } from "../api/presentations";

interface UploadCardProps {
  onUploadSuccess: () => void;
}

const UploadCard: React.FC<UploadCardProps> = ({ onUploadSuccess }) => {
  const [file, setFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [uploading, setUploading] = useState(false);
  const [error, setError] = useState("");

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      setFile(e.target.files[0]);
      // Auto-set title from filename if empty
      if (!title) {
        setTitle(e.target.files[0].name.replace(".pdf", ""));
      }
    }
  };

  const handleUpload = async () => {
    if (!file) return;
    setUploading(true);
    setError("");

    const formData = new FormData();
    formData.append("title", title || file.name);
    formData.append("file", file);

    try {
      await createPresentation(formData);
      setFile(null);
      setTitle("");
      onUploadSuccess();
    } catch (err) {
      setError("Upload failed");
    } finally {
      setUploading(false);
    }
  };

  return (
    <Card>
      <CardContent>
        <Typography variant="h6" gutterBottom>
          Upload Presentation (PDF)
        </Typography>
        {error && (
          <Alert severity="error" sx={{ mb: 1 }}>
            {error}
          </Alert>
        )}
        <Box sx={{ display: "flex", flexDirection: "column", gap: 2 }}>
          <Button variant="outlined" component="label">
            Select PDF
            <input
              type="file"
              hidden
              accept="application/pdf"
              onChange={handleFileChange}
            />
          </Button>
          {file && <Typography variant="body2">{file.name}</Typography>}

          <Button
            variant="contained"
            disabled={!file || uploading}
            onClick={handleUpload}
          >
            {uploading ? <CircularProgress size={24} /> : "Upload"}
          </Button>
        </Box>
      </CardContent>
    </Card>
  );
};

export default UploadCard;
