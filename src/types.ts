export interface User {
  id: string;
  email: string;
  name: string;
  role?: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Presentation {
  id: string;
  title: string;
  original_filename?: string;
  created_at?: string;
  slide_count: number;
}

export interface PresentationDetail extends Presentation {
  slides?: {
    id: string;
    slide_number: number;
    image_url: string;
  }[];
}

export interface Session {
  id: string;
  presentationId: string; // Postman Create Session response uses camelCase: { sessionId, joinCode }
  joinCode: string;
}

export interface SessionJoinResponse {
  sessionId: string;
  presentationId: string;
  currentSlideNumber: number;
  slideCount: number;
  title: string;
}

export interface SessionJoinResponse {
  sessionId: string;
  presentationId: string;
  currentSlideNumber: number;
  slideCount: number;
  title: string;
}

export interface StrokePoint {
  x: number;
  y: number;
}

export interface Stroke {
  tool: "pen" | "eraser";
  color: string;
  size: number;
  points: number[]; // [x1, y1, x2, y2, ...]
}

export interface AnnotationResponse {
  strokes: Stroke[];
  // backend might send specific structure
}
