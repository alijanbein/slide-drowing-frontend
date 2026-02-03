import client from "./client";
import type { SessionJoinResponse } from "../types";

export const createSession = async (
  presentationId: string,
): Promise<{ sessionId: string; joinCode: string }> => {
  const response = await client.post("/sessions", { presentationId });
  return response.data;
};

export const joinSession = async (
  joinCode: string,
): Promise<SessionJoinResponse> => {
  const response = await client.get(`/sessions/join/${joinCode}`);
  return response.data;
};

export const updateCurrentSlide = async (
  sessionId: string,
  currentSlideNumber: number,
): Promise<void> => {
  await client.patch(`/sessions/${sessionId}/current-slide`, {
    currentSlideNumber,
  }); // API expects literal value or json?
  // Contract: PATCH /sessions/{sessionId}/current-slide {currentSlideNumber}
  // "body = {currentSlideNumber}" usually implies JSON object.
  // If contract meant raw body: await client.patch(..., currentSlideNumber, { headers: { 'Content-Type': 'application/json' } })
  // But usually FastAPI @Body expects JSON. I will assume JSON object `{ currentSlideNumber: X }` is safer or standard.
  // Re-reading contract: "PATCH ... {currentSlideNumber}" - format usually implies JSON body.
};

export const deleteSession = async (sessionId: string): Promise<void> => {
  await client.delete(`/sessions/${sessionId}`);
};
