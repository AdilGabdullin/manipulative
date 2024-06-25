import { colors } from "../config";
import { useAppStore } from "../state/store";
import FrameIcon from "./FrameIcon";
import { KIND, initialProps } from "./TextElement";

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
      <FrameIcon rows={1} columns={5} onDragStart={onDragStart("frame-5")} />
      <FrameIcon rows={2} columns={5} onDragStart={onDragStart("frame-10")} />
      <FrameIcon rows={3} columns={3} resizable={true} onDragStart={onDragStart("frame-resizable")} />
      <div
        style={buttonStyle}
        draggable="true"
        onDragStart={onDragStart("editable-text")}
        onClick={() => {
          state.addElement(initialProps[KIND.text]);
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
        onDragStart={onDragStart("fraction")}
        onClick={() => {
          state.addElement(initialProps[KIND.fraction]);
        }}
      >
        <svg style={svgStyle} viewBox={`0 0 ${buttonSize} ${buttonSize}`}>
          <text x="11" y="12" style={{ fontSize: 16, fontFamily: "Calibri", stroke: color, fill: color }}>
            1
          </text>
          <line
            x1={8}
            y1={15}
            x2={23}
            y2={15}
            style={{ fill: "rgb(0,0,0,0)", strokeWidth: 2, stroke: color }}
          />
          <text x="11" y="28" style={{ fontSize: 16, fontFamily: "Calibri", stroke: color, fill: color }}>
            2
          </text>
        </svg>
      </div>
      <div
        style={buttonStyle}
        draggable="true"
        onDragStart={onDragStart("mixed")}
        onClick={() => {
          state.addElement(initialProps[KIND.mixed]);
        }}
      >
        <svg style={svgStyle} viewBox={`0 0 ${buttonSize} ${buttonSize}`}>
          <text x="0" y="20" style={{ fontSize: 16, fontFamily: "Calibri", stroke: color, fill: color }}>
            3
          </text>
          <text x="11" y="12" style={{ fontSize: 16, fontFamily: "Calibri", stroke: color, fill: color }}>
            1
          </text>
          <line
            x1={buttonSize / 4}
            y1={buttonSize / 2}
            x2={(buttonSize * 3) / 4}
            y2={buttonSize / 2}
            style={{ fill: "rgb(0,0,0,0)", strokeWidth: 2, stroke: color }}
          />
          <text x="11" y="28" style={{ fontSize: 16, fontFamily: "Calibri", stroke: color, fill: color }}>
            2
          </text>
        </svg>
      </div>
      <div
        style={buttonStyle}
        draggable="true"
        onDragStart={onDragStart("exponent")}
        onClick={() => {
          state.addElement(initialProps[KIND.exponent]);
        }}
      >
        <svg style={svgStyle} viewBox={`0 0 ${buttonSize} ${buttonSize}`}>
          <text x="0" y="28" style={{ fontSize: 36, fontFamily: "Calibri", stroke: color, fill: color }}>
            x²
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
