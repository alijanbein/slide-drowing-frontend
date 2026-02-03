import React, { useRef, useState, useEffect } from "react";
import { Stage, Layer, Line, Image as KonvaImage } from "react-konva";
import useImage from "use-image";
import type { Stroke } from "../types";

interface SlideCanvasProps {
  imageUrl: string;
  strokes: Stroke[];
  onStrokesChange: (newStrokes: Stroke[]) => void;
  tool: "pen" | "eraser";
  color: string;
  size: number;
  width: number;
  height: number;
}

const SlideCanvas: React.FC<SlideCanvasProps> = ({
  imageUrl,
  strokes,
  onStrokesChange,
  tool,
  color,
  size,
  width,
  height,
}) => {
  const [image] = useImage(imageUrl, "anonymous");
  const isDrawing = useRef(false);
  const stageRef = useRef<any>(null);

  const [scale, setScale] = useState(1);
  const [stagePos, setStagePos] = useState({ x: 0, y: 0 });

  useEffect(() => {
    if (image) {
      const scaleX = width / image.width;
      const scaleY = height / image.height;
      const newScale = Math.min(scaleX, scaleY);
      setScale(newScale);

      const newX = (width - image.width * newScale) / 2;
      const newY = (height - image.height * newScale) / 2;
      setStagePos({ x: newX, y: newY });
    }
  }, [image, width, height]);

  const handleMouseDown = (e: any) => {
    isDrawing.current = true;
    const pos = e.target.getStage().getPointerPosition();
    const localX = (pos.x - stagePos.x) / scale;
    const localY = (pos.y - stagePos.y) / scale;

    const newStroke: Stroke = {
      tool,
      color,
      size: size / scale,
      points: [localX, localY],
    };
    onStrokesChange([...strokes, newStroke]);
  };

  const handleMouseMove = (e: any) => {
    if (!isDrawing.current) return;
    const stage = e.target.getStage();
    const point = stage.getPointerPosition();
    const localX = (point.x - stagePos.x) / scale;
    const localY = (point.y - stagePos.y) / scale;

    const lastStroke = strokes[strokes.length - 1];
    lastStroke.points = lastStroke.points.concat([localX, localY]);

    const newStrokes = strokes.slice(0, strokes.length - 1).concat(lastStroke);
    onStrokesChange(newStrokes);
  };

  const handleMouseUp = () => {
    isDrawing.current = false;
  };

  return (
    <Stage
      width={width}
      height={height}
      onMouseDown={handleMouseDown}
      onMousemove={handleMouseMove}
      onMouseup={handleMouseUp}
      onTouchStart={handleMouseDown}
      onTouchMove={handleMouseMove}
      onTouchEnd={handleMouseUp}
      ref={stageRef}
      style={{ backgroundColor: "#f0f0f0" }}
    >
      {/* Background Layer */}
      <Layer x={stagePos.x} y={stagePos.y} scaleX={scale} scaleY={scale}>
        {image && <KonvaImage image={image} />}
      </Layer>

      {/* Drawing Layer - Eraser works here without erasing the image */}
      <Layer x={stagePos.x} y={stagePos.y} scaleX={scale} scaleY={scale}>
        {strokes.map((stroke, i) => (
          <Line
            key={i}
            points={stroke.points}
            stroke={stroke.tool === "eraser" ? "#000000" : stroke.color}
            strokeWidth={stroke.size}
            tension={0.5}
            lineCap="round"
            lineJoin="round"
            globalCompositeOperation={
              stroke.tool === "eraser" ? "destination-out" : "source-over"
            }
          />
        ))}
      </Layer>
    </Stage>
  );
};

export default SlideCanvas;
