import { Group, Rect, Line, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { colors, config } from "../config";
import { center, pointInRect } from "../util";

const size = config.frame.size;
const fontSize = 32;

const Frame = (props) => {
  const { id, width, height, resizable, visible, locked } = props;
  const { elements, origin, fdMode, selectIds, relocateElements } = useAppStore();
  const x = Math.round(origin.x + (props.x || 0));
  const y = Math.round(origin.y + (props.y || 0));
  const { xs, ys } = xy(width, height);

  let tiles = null;
  const getTiles = (e) => {
    const inFrame = (tile) => pointInRect(center(tile), props);
    const tiles = Object.values(elements).filter((e) => e.type == "tile" && inFrame(e));
    const stage = e.target.getStage();
    return tiles.map((tile) => ({
      node: stage.findOne("#" + tile.id),
      x: tile.x,
      y: tile.y,
      id: tile.id,
    }));
  };

  const events = {
    onPointerClick: (e) => {
      if (fdMode) return;
      selectIds([...getTiles(e).map((t) => t.id), id], locked);
    },
    onDragStart: (e) => {
      tiles = getTiles(e);
    },
    onDragMove: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      if (tiles) {
        tiles.forEach(({ node, x, y }, i) => {
          node.setAttrs({ x: origin.x + x + dx, y: origin.y + y + dy });
        });
      }
    },
    onDragEnd: (e) => {
      relocateElements([...tiles.map((t) => t.id), id], e.target.x() - x, e.target.y() - y);
    },
  };

  return (
    <Group id={id} x={x} y={y} visible={visible} draggable={!locked && !fdMode} {...events}>
      <Rect x={0} y={0} width={width} height={height} strokeWidth={2} stroke={colors.black} />
      {xs.map((x) => (
        <Line key={x} points={[x, 0, x, height]} strokeWidth={2} stroke={colors.black} />
      ))}
      {ys.map((y) => (
        <Line key={y} points={[0, y, width, y]} strokeWidth={2} stroke={colors.black} />
      ))}

      {resizable && <SizeText x={width / 2} y={-20} text={(width / size).toString()} />}
      {resizable && <SizeText x={-20} y={height / 2} text={(height / size).toString()} />}
    </Group>
  );
};

const SizeText = (props) => {
  return (
    <Text
      {...props}
      x={props.x - 50}
      y={props.y - fontSize / 2}
      width={100}
      fontSize={fontSize}
      fontFamily="Calibri"
      align="center"
    />
  );
};

function xy(width, height) {
  const xs = [];
  for (let x = size; x < width; x += size) {
    xs.push(x);
  }
  const ys = [];
  for (let y = size; y < height; y += size) {
    ys.push(y);
  }
  return { xs, ys };
}

export default Frame;
