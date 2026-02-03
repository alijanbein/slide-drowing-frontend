import client from "./client";
import type { Presentation, PresentationDetail } from "../types";

export const listPresentations = async (): Promise<Presentation[]> => {
  const response = await client.get("/presentations");
  return response.data;
};

export const createPresentation = async (
  data: FormData,
): Promise<{ presentationId: string; slideCount: number }> => {
  const response = await client.post("/presentations", data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return response.data;
};

export const getPresentation = async (
  id: string,
): Promise<PresentationDetail> => {
  const response = await client.get(`/presentations/${id}`);
  return response.data;
};
