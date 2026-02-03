import client from "./client";
import type { Stroke } from "../types";

export const getAnnotations = async (
  sessionId: string,
  slideNumber: number,
): Promise<Stroke[]> => {
  console.log(
    `[getAnnotations] Loading annotations for session ${sessionId}, slide ${slideNumber}`,
  );
  const response = await client.get(
    `/sessions/${sessionId}/slides/${slideNumber}/annotations`,
  );
  console.log(`[getAnnotations] Received response:`, response.data);
  // Backend returns { version, width, height, strokes: [...] }
  const strokes = response.data.strokes || [];
  console.log(`[getAnnotations] Returning ${strokes.length} strokes`);
  return strokes;
};

export const saveAnnotations = async (
  sessionId: string,
  slideNumber: number,
  strokes: Stroke[],
): Promise<void> => {
  console.log(
    `[saveAnnotations] Saving ${strokes.length} strokes for session ${sessionId}, slide ${slideNumber}`,
  );
  // Backend expects { version, width, height, strokes: [...] }
  // We'll use a standard/safe canvas size for normalization if not strictly enforced,
  // or just pass 1920x1080 as a default reference frame.
  const payload = {
    version: 1,
    width: 1920,
    height: 1080,
    strokes: strokes,
  };
  console.log(`[saveAnnotations] Payload:`, payload);
  await client.put(
    `/sessions/${sessionId}/slides/${slideNumber}/annotations`,
    payload,
  );
  console.log(`[saveAnnotations] Save successful`);
};
