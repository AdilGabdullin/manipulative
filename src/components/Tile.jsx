import { Group, Rect } from "react-konva";
import { animationDuration, colors, config, workspace } from "../config";
import {
  blendColors,
  getStageXY,
  halfPixel,
  hexToRgb,
  pointInRect,
  pointsIsClose,
  rgbToHex,
  setVisibility,
} from "../util";
import { useAppStore } from "../state/store";
import { useEffect, useRef } from "react";
import { magnetToLine, lineZeroPos } from "./NumberLine";
import { graphZeroPos } from "./Graph";
import { getPPWSize } from "./PartPartWhole";
import { Animation } from "konva/lib/Animation";

const size = config.tile.size;

export const Tile = ({ id, x, y, size, fill, visible, events, text }) => {
  x = halfPixel(x);
  y = halfPixel(y);
  size = Math.round(size);
  const signWidth = 5;
  return (
    <Group id={id} x={x} y={y} visible={visible} {...events}>
      {text == "0" ? (
        <>
          <Rect width={size} height={size} fill={fill} cornerRadius={size / 2} opacity={0.5} />
          <Rect y={size / 2} width={size} height={size} fill={fill} cornerRadius={size / 2} opacity={0.5} />
          <Rect x={size / 4} y={size / 2 - signWidth / 2} width={size / 2} height={signWidth} fill={colors.black} />
          <Rect y={size / 4} x={size / 2 - signWidth / 2} height={size / 2} width={signWidth} fill={colors.black} />
          <Rect
            x={size / 4}
            y={halfPixel(size - signWidth / 2)}
            width={size / 2}
            height={signWidth}
            fill={colors.black}
          />
        </>
      ) : (
        <>
          <Rect width={size} height={size} fill={fill} cornerRadius={size / 2} />
          <Rect x={size / 4} y={size / 2 - signWidth / 2} width={size / 2} height={signWidth} fill={colors.white} />
          <Rect
            y={size / 4}
            x={size / 2 - signWidth / 2}
            height={size / 2}
            width={signWidth}
            fill={colors.white}
            opacity={text == "+" ? 1 : 0}
          />
        </>
      )}
    </Group>
  );
};

export const ToolbarTile = (props) => {
  const state = useAppStore();
  const { origin, elements, addElement, addTileToFrame } = state;
  const shadow = useRef();
  const size = config.tile.size;
  const scaledSize = getSize(state);

  const outOfToolbar = (e) => e.target.getStage().getPointerPosition().x > config.leftToolbar.width;

  const placeProps = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    return { x: x - scaledSize / 2, y: y - scaledSize / 2 };
  };

  let boardShadow = null;
  const getBoardShadow = (e) => {
    return boardShadow || (boardShadow = e.target.getStage().findOne("#shadow-tile" + props.text));
  };

  const add = (pos, place, frameId) => {
    const tile = {
      ...props,
      type: "tile",
      x: pos ? pos.x : place?.x,
      y: pos ? pos.y : place?.y,
      size: size,
      width: size,
      height: size * props.height,
      fill: props.fill,
      stroke: props.stroke,
    };
    if (frameId) {
      addTileToFrame(tile, frameId);
    } else {
      addElement(tile);
    }
  };

  const events = {
    onDragStart: (e) => {
      shadow.current.visible(true);
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
      const last = elements[state.lastActiveElement];
      if (last && last.type == "tile") {
        if (state.workspace == workspace.graph) {
          add({ x: last.x, y: last.y - size });
        } else {
          add({ x: last.x + size, y: last.y });
        }
      } else if (last && last.type == "frame") {
        add(null, null, last.id);
      } else {
        add(firstPos(state));
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
  const { id, locked, annihilation, moveTo, invert } = props;
  const x = props.x + origin.x;
  const y = props.y + origin.y;
  const groupRef = useRef();

  useEffect(() => {
    // if (annihilation) animateAnnihilation(groupRef.current);
    if (moveTo) animateMove(groupRef.current, moveTo.x - props.x, moveTo.y - props.y);
    if (invert) {
      animateInvert(groupRef.current, props);
    }
  }, [annihilation, moveTo, invert]);

  const events = {
    draggable: !locked && !fdMode,
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
      <Tile {...props} x={x} y={y} events={events} />
    </Group>
  );
};

export function magnetToAll(tile, elements, state) {
  if (state.showGrid || state.workspace == workspace.graph) {
    const size = config.tile.size;
    const { x, y } = tile;
    return { x: Math.round(x / size) * size, y: Math.round(y / size) * size };
  }
  for (const element of Object.values(elements)) {
    if (element.type != "frame") continue;
    const pos = magnetToFrame(tile, element);
    if (pos) return pos;
  }
  for (const [id, element] of Object.entries(elements)) {
    if (tile.id == id || element.type != "tile") continue;
    const pos = magnetToOne(tile, element);
    if (pos) return pos;
  }
  return magnetToLine(tile, state);
}

function magnetToOne(tile, other) {
  const size = other.size;
  const { x, y } = tile;
  const options = [
    [-size, -size],
    [0, -size],
    [size, -size],
    [-size, 0],
    [0, 0],
    [size, 0],
    [-size, size],
    [0, size],
    [size, size],
  ];
  for (const [dx, dy] of options) {
    if (pointsIsClose({ x: x + dx, y: y + dy }, other)) return { x: other.x - dx, y: other.y - dy };
  }
  return null;
}

function magnetToFrame(tile, frame) {
  if (!pointInRect({ x: tile.x + 30, y: tile.y + 30 }, frame)) {
    return null;
  }
  const options = [];
  const { size, shift } = config.frame;
  for (let x = 0; x < frame.width; x += size) {
    for (let y = 0; y < frame.height; y += size) {
      options.push([-x, -y]);
    }
  }
  const { x, y } = tile;
  for (const [dx, dy] of options) {
    if (pointsIsClose({ x: x + dx - shift, y: y + dy - shift }, frame, size / 2)) {
      return { x: frame.x - dx + shift, y: frame.y - dy + shift };
    }
  }
  return null;
}

export function getSize(state) {
  return Math.round(config.tile.size * state.scale);
}

function firstPos(state) {
  switch (state.workspace) {
    case workspace.basic:
      return { x: -size / 2, y: -size / 2 };
      break;
    case workspace.numberLine:
      return lineZeroPos(state);
      break;
    case workspace.graph:
      return graphZeroPos(state);
      break;
    case workspace.ppw:
      const { width } = getPPWSize(state);
      return { x: -width / 2 + size / 2, y: size / 2 };
      break;
  }
}

function animateMove(node, x, y) {
  const animation = new Animation(({ time }) => {
    if (time > animationDuration) {
      animation.stop();
      node.setAttrs({ x, y });
      animateAnnihilation(node);
      return;
    }
    const t = time / animationDuration;
    const k = (t * t) / (2 * (t * t - t) + 1);
    node.setAttrs({
      x: x * k,
      y: y * k,
    });
  }, node.getLayer());
  animation.start();
}

function animateAnnihilation(node) {
  const [circle, ...lines] = node.children[0].children;

  const circleFrom = hexToRgb(circle.getAttr("fill"));
  const circleTo = hexToRgb(colors.darkGrey);
  const lineFrom = hexToRgb(lines[0].getAttr("fill"));
  const lineTo = hexToRgb(colors.black);

  const animation = new Animation(({ time }) => {
    if (time > animationDuration) {
      animation.stop();
      circle.setAttrs({ opacity: 0.5, fill: colors.darkGrey });
      lines.forEach((line) => line.setAttrs({ fill: colors.black }));
      return;
    }
    const t = time / animationDuration;
    const k = (t * t) / (2 * (t * t - t) + 1);
    circle.setAttrs({ opacity: (1 - k) / 2 + 0.5, fill: blendColors(circleFrom, circleTo, k) });
    lines.forEach((line) => line.setAttrs({ fill: blendColors(lineFrom, lineTo, k) }));
  }, node.getLayer());
  animation.start();
}

function animateInvert(node, props) {
  const [circle, ...lines] = node.children[0].children;
  const isPlus = props.text == "+";
  const option = config.tile.options[isPlus ? 1 : 0];
  const from = hexToRgb(props.fill);
  const to = hexToRgb(option.fill);
  const animation = new Animation(({ time }) => {
    if (time > animationDuration) {
      animation.stop();
      circle.setAttr("fill", option.fill);
      lines[1].setAttr("opacity", isPlus ? 0 : 1);
      return;
    }
    const t = time / animationDuration;
    const k = (t * t) / (2 * (t * t - t) + 1);
    circle.setAttr("fill", blendColors(from, to, k));
    lines[1].setAttr("opacity", isPlus ? 1 - k : k);
  }, node.getLayer());
  animation.start();
}
