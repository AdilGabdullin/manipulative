import { Group, Line, Rect } from "react-konva";
import config from "../config";
import { cos, sin } from "../util";

export const Block = ({ id, x, y, size, label, events }) => {
  const { blockSize, blocks, colors, angle } = config;
  const [sx, sy, sz] = size;
  const width = sx * blockSize;
  const height = sy * blockSize;
  const depthStepX = cos(angle) * blockSize * 0.5;
  const depthStepY = sin(angle) * blockSize * 0.5;
  const depthX = depthStepX * sz;
  const depthY = depthStepY * sz;
  const { fill, dark } = blocks[label];
  const stroke = colors.black;

  const hPoints = [0, 0, width, 0];
  const vPoints = [0, 0, 0, height];
  const zPoints = [0, 0, depthX, -depthY];

  const lines = [];
  for (let i = 0; i <= sy; i += 1) {
    lines.push({ x: 0, y: blockSize * i, points: hPoints });
  }
  for (let i = 1; i <= sz; i += 1) {
    lines.push({ x: depthStepX * i, y: -depthStepY * i, points: hPoints });
  }

  for (let i = 0; i <= sx; i += 1) {
    lines.push({ x: blockSize * i, y: 0, points: vPoints });
  }
  for (let i = 1; i <= sz; i += 1) {
    lines.push({ x: width + depthStepX * i, y: -depthStepY * i, points: vPoints });
  }
  for (let i = 0; i <= sx; i += 1) {
    lines.push({ x: blockSize * i, y: 0, points: zPoints });
  }
  for (let i = 1; i <= sy; i += 1) {
    lines.push({ x: width, y: blockSize * i, points: zPoints });
  }

  return (
    <Group id={id} x={x} y={y} {...events}>
      <Rect width={width} height={height} fill={fill} />
      <Line x={0} y={0} points={[0, 0, depthX, -depthY, depthX + width, -depthY, width, 0]} closed fill={fill} />
      <Line
        x={0}
        y={0}
        points={[width, 0, width + depthX, -depthY, depthX + width, height - depthY, width, height]}
        closed
        fill={dark}
      />
      {lines.map((props, i) => (
        <Line key={i} {...props} stroke={stroke} strokeWidth={1} />
      ))}
    </Group>
  );
};

export const ToolbarBlock = (props) => {
  const events = {
    draggable: true,
    onDragMove: (e) => {
      console.log("move");
    },
  };
  return <Block {...props} events={events} />;
};
