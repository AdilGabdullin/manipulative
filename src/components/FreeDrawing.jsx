import { Line } from "react-konva";
import { useAppStore } from "../state/store";
import { eraserSize } from "../state/freeDrawingSlice";

const FreeDrawing = () => {
  const state = useAppStore();
  const { fdMode, fdLines, fdBrushColor, origin } = state;
  return (
    <>
      {Object.keys(fdLines).map((id) => {
        const { points, color, strokeWidth, globalCompositeOperation } = fdLines[id];
        return (
          <Line
            id={id}
            key={id}
            x={origin.x}
            y={origin.y}
            lineCap={"round"}
            lineJoin={"round"}
            stroke={color}
            strokeWidth={strokeWidth}
            globalCompositeOperation={globalCompositeOperation}
            {...fdLines[id]}
            points={points}
          />
        );
      })}
      <Line
        x={origin.x}
        y={origin.y}
        id="fd-last-line"
        lineCap={"round"}
        lineJoin={"round"}
        stroke={fdBrushColor}
        strokeWidth={fdMode == "brush" ? state.fdBrushSize : eraserSize}
        globalCompositeOperation={fdMode == "brush" ? "source-over" : "destination-out"}
      />
    </>
  );
};

export default FreeDrawing;
