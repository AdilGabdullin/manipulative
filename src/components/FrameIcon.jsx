import { colors, config } from "../config";
import { useAppStore } from "../state/store";
import { halfPixel } from "../util";

const buttonSize = 31;
const lineStyle = { fill: "rgb(0,0,0,0)", strokeWidth: 1, stroke: colors.menuIcon };
const { size } = config.frame;

const FrameIcon = ({ rows, columns, resizable, onDragStart }) => {
  const state = useAppStore();
  const { xs, ys } = xy(rows, columns);
  const left = xs[0];
  const right = xs[columns];
  const top = ys[0];
  const bottom = ys[rows];
  const width = size * columns;
  const height = size * rows;
  return (
    <div
      style={{ width: buttonSize, height: buttonSize }}
      draggable="true"
      onDragStart={onDragStart}
      onClick={() => {
        state.addElement({
          type: "frame",
          x: resizable ? -(width + size) / 2 : -width / 2,
          y: -height / 2,
          width: resizable ? width + size : width,
          height: height,
        });
      }}
    >
      <svg
        style={{
          display: "block",
        }}
        viewBox={`0 0 ${buttonSize} ${buttonSize}`}
      >
        {xs.map((x) => (
          <line key={x} x1={x} y1={top} x2={x} y2={bottom} style={lineStyle} />
        ))}
        {ys.map((y) => (
          <line key={y} x1={left} y1={y} x2={right} y2={y} style={lineStyle} />
        ))}
        {resizable && (
          <>
            <line x1={bottom + 1} y1={right + 1} x2={bottom + 5} y2={right + 5} style={lineStyle} />
            <line x1={bottom + 5} y1={right + 1} x2={bottom + 5} y2={right + 5} style={lineStyle} />
            <line x1={bottom + 1} y1={right + 5} x2={bottom + 5} y2={right + 5} style={lineStyle} />
          </>
        )}
      </svg>
    </div>
  );
};

function xy(rows, columns) {
  const xs = [];
  for (let i = 0, x = halfPixel((30 - 6 * columns) / 2); i <= columns; i += 1, x += 6) {
    xs.push(x);
  }
  const ys = [];
  for (let i = 0, y = halfPixel((30 - 6 * rows) / 2); i <= rows; i += 1, y += 6) {
    ys.push(y);
  }
  return { xs, ys };
}

export default FrameIcon;
