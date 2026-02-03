import { useEffect, useState } from "react";
import { Box, Grid, Typography, Divider } from "@mui/material";
import UploadCard from "../components/UploadCard";
import PresentationList from "../components/PresentationList";
import { listPresentations } from "../api/presentations";
import type { Presentation } from "../types";

const Dashboard = () => {
  const [presentations, setPresentations] = useState<Presentation[]>([]);
  const [loading, setLoading] = useState(true);

  const fetchPresentations = async () => {
    setLoading(true);
    try {
      const data = await listPresentations();
      setPresentations(data || []);
    } catch (error) {
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchPresentations();
  }, []);

  return (
    <Box>
      <Typography variant="h4" gutterBottom>
        Dashboard
      </Typography>
      <Grid container spacing={4}>
        <Grid size={{ xs: 12, md: 4 }}>
          <UploadCard onUploadSuccess={fetchPresentations} />
        </Grid>
        <Grid size={{ xs: 12, md: 8 }}>
          <Typography variant="h5" gutterBottom>
            My Presentations
          </Typography>
          <Divider sx={{ mb: 2 }} />
          <PresentationList presentations={presentations} loading={loading} />
        </Grid>
      </Grid>
    </Box>
  );
};

export default Dashboard;
