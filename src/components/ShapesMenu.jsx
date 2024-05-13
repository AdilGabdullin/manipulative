import { colors } from "../config";
import { useAppStore } from "../state/store";
import FrameIcon from "./FrameIcon";

const color = colors.menuIcon;
export const buttonSize = 30;

const containerStyle = {
  display: "flex",
  gap: 8,
};

const buttonStyle = {
  width: buttonSize,
  height: buttonSize,
  color: color,
  fontSize: 40,
  fontFamily: "Calibri",
};

const svgStyle = {
  display: "block",
};

const emptyImage = new Image();
emptyImage.src = "data:image/gif;base64,R0lGODlhAQABAIAAAAUEBAAAACwAAAAAAQABAAACAkQBADs=";

export const ShapesMenu = () => {
  const state = useAppStore();
  const onDragStart = (shape) => (e) => {
    const { dataTransfer } = e;
    dataTransfer.setData(shape, shape);
    dataTransfer.setDragImage(emptyImage, 0, 0);
  };

  return (
    <div style={containerStyle}>
      <FrameIcon
        rows={1}
        columns={5}
        onDragStart={onDragStart("frame5")}
        onClick={() => {
          console.log("frame5");
        }}
      />
      <FrameIcon
        rows={2}
        columns={5}
        onDragStart={onDragStart("frame10")}
        onClick={() => {
          console.log("frame10");
        }}
      />
      <FrameIcon
        rows={3}
        columns={3}
        resizable={true}
        onDragStart={onDragStart("resizable-frame")}
        onClick={() => {
          console.log("resizable");
        }}
      />
      <div
        style={buttonStyle}
        draggable="true"
        onDragStart={onDragStart("editable-text")}
        onClick={() => {
          state.addElement({
            type: "text",
            x: -40,
            y: -20,
            text: "Text",
            fontSize: 36,
            width: 60,
            height: 36,
            newText: true,
            scale: 1.0,
          });
        }}
      >
        <svg style={svgStyle} viewBox={`0 0 ${buttonSize} ${buttonSize}`}>
          <text x="6" y="28" style={{ fontSize: 40, fontFamily: "Calibri", stroke: color, fill: color }}>
            T
          </text>
        </svg>
      </div>
      <div
        style={buttonStyle}
        draggable="true"
        onDragStart={onDragStart("rect")}
        onClick={() => {
          state.addElement({ type: "rect", x: -60, y: -60, width: 120, height: 120, fill: false });
        }}
      >
        <svg style={svgStyle} viewBox={`0 0 ${buttonSize} ${buttonSize}`}>
          <rect
            x={0 + 1}
            y={0 + 1}
            width={buttonSize - 2}
            height={buttonSize - 2}
            style={{ fill: "rgb(0,0,0,0)", strokeWidth: 2, stroke: color }}
          />
        </svg>
      </div>
      <div
        style={buttonStyle}
        draggable="true"
        onDragStart={onDragStart("ellipse")}
        onClick={() => {
          state.addElement({ type: "ellipse", x: 0, y: 0, radiusX: 60, radiusY: 60, fill: false });
        }}
      >
        <svg style={svgStyle} viewBox={`0 0 ${buttonSize} ${buttonSize}`}>
          <ellipse
            cx={buttonSize / 2}
            cy={buttonSize / 2}
            rx={buttonSize / 2 - 2}
            ry={buttonSize / 2 - 2}
            style={{ fill: "rgb(0,0,0,0)", strokeWidth: 2, stroke: color }}
          />
        </svg>
      </div>
      <div
        style={buttonStyle}
        draggable="true"
        onDragStart={onDragStart("line")}
        onClick={() => {
          state.addElement({ type: "line", x: -60, y: 0, x2: 120, y2: 0 });
        }}
      >
        <svg style={svgStyle} viewBox={`0 0 ${buttonSize} ${buttonSize}`}>
          <line
            x1={0}
            y1={buttonSize / 2}
            x2={buttonSize}
            y2={buttonSize / 2}
            style={{ fill: "rgb(0,0,0,0)", strokeWidth: 2, stroke: color }}
          />
        </svg>
      </div>
    </div>
  );
};

export default ShapesMenu;
