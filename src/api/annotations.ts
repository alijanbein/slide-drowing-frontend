import client from "./client";
import type { Stroke } from "../types";

export const getAnnotations = async (
  sessionId: string,
  slideNumber: number,
): Promise<Stroke[]> => {
  const response = await client.get(
    `/sessions/${sessionId}/slides/${slideNumber}/annotations?authorId=me`,
  );
  // Backend returns { version, width, height, strokes: [...] }
  return response.data.strokes || [];
};

export const saveAnnotations = async (
  sessionId: string,
  slideNumber: number,
  strokes: Stroke[],
): Promise<void> => {
  // Backend expects { version, width, height, strokes: [...] }
  // We'll use a standard/safe canvas size for normalization if not strictly enforced,
  // or just pass 1920x1080 as a default reference frame.
  const payload = {
    version: 1,
    width: 1920,
    height: 1080,
    strokes: strokes,
  };
  await client.put(
    `/sessions/${sessionId}/slides/${slideNumber}/annotations`,
    payload,
  );
};
