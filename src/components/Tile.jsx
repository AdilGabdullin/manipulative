import { Group, Rect } from "react-konva";
import { config, workspace } from "../config";
import { getStageXY, halfPixel, pointsIsClose, setVisibility } from "../util";
import { useAppStore } from "../state/store";
import { useRef } from "react";
import { magnetToLine, lineZeroPos } from "./NumberLine";
import TileLabel, {
  decimalsVisible,
  fractionsVisible,
  labelColor,
  labelFontSize,
  labelText,
  overlineText,
} from "./TileLabel";
import { magnetToWall, wallPos } from "./Wall";

const size = config.tile.size;

export const Tile = ({ id, x, y, width, height, fill, stroke, visible, denominator, boardTile, events }) => {
  x = halfPixel(x);
  y = halfPixel(y);
  width = Math.round(width) - 1;
  height = Math.round(height) - 1;
  return (
    <Group id={id} x={x} y={y} visible={visible} {...events}>
      <Rect width={width} height={height} fill={fill} stroke={stroke} strokeWidth={1} />
      <TileLabel {...{ x, y, width, height, denominator, fill, boardTile }} />
    </Group>
  );
};

export const ToolbarTile = (props) => {
  const state = useAppStore();
  const { origin, elements, addElement } = state;
  const shadow = useRef();
  const size = config.tile.size;
  const scaledSize = getSize(state);

  const outOfToolbar = (e) => e.target.getStage().getPointerPosition().x > config.leftToolbar.width;

  const placeProps = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    const m = state.workspace == workspace.wall ? 16 : 8;
    return {
      x: x - scaledSize / 2,
      y: y - scaledSize / 2,
      width: state.orientation == "Horizontal" ? (size / props.denominator) * m : size,
      height: state.orientation == "Horizontal" ? size : (size / props.denominator) * m,
    };
  };

  let boardShadow = null;
  const getBoardShadow = (e) => {
    return boardShadow || (boardShadow = e.target.getStage().findOne("#shadow-tile"));
  };

  const add = (pos, place) => {
    addElement({
      ...props,
      type: "tile",
      x: pos ? pos.x : place.x,
      y: pos ? pos.y : place.y,
      size: size,
      width: place.width,
      height: place.height,
      fill: props.fill,
      fillColor: props.fill,
      stroke: props.stroke,
    });
  };

  const fVisible = fractionsVisible(props.denominator, state.labels);
  const dVisible = decimalsVisible(props.denominator, state.labels);

  const events = {
    onDragStart: (e) => {
      const { width, height } = placeProps(e);
      const fontSize = labelFontSize(true, height > width, null, props.denominator, state.labels);
      const children = getBoardShadow(e).children;
      const fill = labelColor(props.denominator);
      shadow.current.setAttrs({
        visible: true,
      });
      children[0].setAttrs({ width: width - 1, height: height - 1 });
      children[1].setAttrs({ x: (width - 1) / 2, y: (height - 1) / 2 });
      children[1].children[0].setAttrs({ fill: fill, fontSize: fontSize, y: -fontSize + 1, visible: fVisible });
      children[1].children[1].setAttrs({ stroke: fill, visible: fVisible });
      children[1].children[2].setAttrs({ text: props.denominator, fill: fill, fontSize: fontSize, visible: fVisible });
      children[1].children[3].setAttrs({
        text: labelText(props.denominator, state.labels),
        fill: fill,
        fontSize: fontSize,
        y: -fontSize / 2,
        visible: dVisible,
      });
      children[1].children[4].setAttrs({
        text: overlineText(props.denominator, state.labels),
        fill: fill,
        fontSize: fontSize,
        y: -fontSize / 2,
        visible: dVisible,
      });
    },
    onDragMove: (e) => {
      const target = e.target;
      const out = outOfToolbar(e);
      target.visible(!out);
      const place = placeProps(e);
      const pos = magnetToAll(place, elements, state);
      const x = halfPixel(origin.x + (pos ? pos.x : place.x));
      const y = halfPixel(origin.y + (pos ? pos.y : place.y));
      const boardShadow = getBoardShadow(e);
      boardShadow.setAttrs({ x, y, visible: out });
      boardShadow.children[0].setAttrs({ fill: props.fill, stroke: props.stroke });
    },
    onDragEnd: (e) => {
      const target = e.target;
      const out = outOfToolbar(e);
      target.visible(!out);
      shadow.current.visible(false);
      target.setAttrs({ x: 0, y: 0, visible: true });
      getBoardShadow(e).visible(false);
      if (out) {
        const place = placeProps(e);
        const pos = magnetToAll(place, elements, state);
        add(pos, place);
      }
    },
    onPointerClick: (e) => {
      const place = placeProps(e);
      if (state.workspace == workspace.wall) {
        const pos = wallPos(state);
        if (pos) add(pos, place);
        return;
      }
      const last = elements[state.lastActiveElement];
      if (last && last.type == "tile") {
        if (state.orientation == "Horizontal") {
          add({ x: last.x + last.width, y: last.y }, place);
        } else {
          add({ x: last.x, y: last.y - place.height }, place);
        }
      } else {
        add(firstPos(state, place.height), place);
      }
    },
  };

  return (
    <>
      <Group ref={shadow} visible={false}>
        <Tile {...props} />
      </Group>
      <Group draggable {...events}>
        <Tile {...props} />
      </Group>
    </>
  );
};

export const BoardTile = (props) => {
  const state = useAppStore();
  const { origin, selectIds, elements, fdMode } = state;
  const { id, locked } = props;
  const x = props.x + origin.x;
  const y = props.y + origin.y;
  const groupRef = useRef();

  const events = {
    draggable: !props.locked && !fdMode,
    onDragStart: (e) => {
      setVisibility(e, false);
    },
    onDragMove: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      const pos = magnetToAll({ ...props, x: props.x + dx, y: props.y + dy }, elements, state);
      if (pos) {
        e.target.setAttrs({ x: halfPixel(origin.x + pos.x), y: halfPixel(origin.y + pos.y) });
      }
    },
    onDragEnd: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      setVisibility(e, true);
      state.relocateElement(id, dx, dy);
    },
    onPointerClick: (e) => {
      selectIds([id], locked);
    },
  };
  return (
    <Group x={0} y={0} ref={groupRef}>
      <Tile {...props} x={x} y={y} events={events} boardTile={true} />
    </Group>
  );
};

export function magnetToAll(tile, elements, state) {
  for (const [id, element] of Object.entries(elements)) {
    if (tile.id == id || element.type != "tile") continue;
    const pos = magnetToOne(tile, element);
    if (pos) return pos;
  }
  return magnetToLine(tile, state) || magnetToWall(tile, state);
}

function magnetToOne(tile, other) {
  const { x, y, width, height } = tile;
  const options = [
    [width, height],
    [0, height],
    [width - other.width, height],
    [-other.width, height],

    [width, 0],
    [0, 0],
    [width - other.width, 0],
    [-other.width, 0],

    [width, height - other.height],
    [0, height - other.height],
    [width - other.width, height - other.height],
    [-other.width, height - other.height],

    [width, -other.height],
    [0, -other.height],
    [width - other.width, -other.height],
    [-other.width, -other.height],
  ];
  for (const [dx, dy] of options) {
    if (pointsIsClose({ x: x + dx, y: y + dy }, other)) return { x: other.x - dx, y: other.y - dy };
  }
  return null;
}

export function getSize(state) {
  return Math.round(config.tile.size * state.scale);
}

function firstPos(state, height) {
  switch (state.workspace) {
    case workspace.basic:
      return { x: -size, y: -size };
      break;
    case workspace.numberLine:
      return lineZeroPos(state, -height);
      break;
  }
}
