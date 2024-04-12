import { Group, Rect, Text } from "react-konva";
import { animationDuration, colors } from "../config";
import { useAppStore } from "../state/store";
import { blendColors, getStageXY, hexToRgb, invertText, pointsIsClose, rgbToHex } from "../util";
import { useEffect, useRef } from "react";
import { outOfToolbar } from "./LeftToolbar";
import { Animation } from "konva/lib/Animation";

const fontSize = 24;
export const baseSize = 45;
export const tileType = "algebra-tile";

function dynamicProps({ x, y, width, height, text, visible, color, borderColor }, multiColored) {
  const { black, white, blue, red, blueBorder, redBorder } = colors;
  const isNegative = text && text[0] == "-";
  let fill = isNegative ? red : blue;
  let stroke = isNegative ? redBorder : blueBorder;
  if (color && multiColored && !isNegative) {
    fill = color;
  }
  if (borderColor && multiColored && !isNegative) {
    stroke = borderColor;
  }
  x = x || 0;
  y = y || 0;
  width = (width || 0) - 1;
  height = (height || 0) - 1;
  return {
    group: { x, y, visible },
    rect: { width, height, x: width / 2, y: height / 2, offsetX: width / 2, offsetY: height / 2, fill, stroke },
    text: {
      x: 0,
      y: (height - fontSize) / 2,
      width: width,
      text: text,
      fill: multiColored && text == "1" ? black : white,
    },
  };
}

export const Tile = (props) => {
  const { multiColored } = useAppStore();
  const dynamic = dynamicProps(props, multiColored);
  return (
    <Group id={props.id} {...dynamic.group} draggable={!!props.events && !props.locked} {...props.events}>
      <Rect {...dynamic.rect} />
      <Text {...dynamic.text} fontFamily="Calibri" fontSize={fontSize} align="center" />
    </Group>
  );
};

export const ToolbarTile = ({ x, y, text, width, height, placeWidth, placeHeight, base, color, borderColor }) => {
  const state = useAppStore();
  const { origin, addElement, lastActiveElement, elements, multiColored } = state;
  const shadow = useRef();

  const placeProps = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    const w = placeWidth * baseSize;
    const h = placeHeight * baseSize;
    return { x: x - w / 2, y: y - h / 2, width: w, height: h };
  };

  let boardShadow = null;
  const getBoardShadow = (e) => {
    return boardShadow || (boardShadow = e.target.getStage().findOne("#shadow-tile"));
  };
  const events = {
    onDragStart: (e) => {
      shadow.current.visible(true);
      const group = getBoardShadow(e);
      const [rect, tileText] = group.children;
      const dynamic = dynamicProps(
        {
          text,
          width: placeWidth * baseSize,
          height: placeHeight * baseSize,
          visible: true,
          color,
          borderColor,
        },
        multiColored
      );
      rect.setAttrs(dynamic.rect);
      tileText.setAttrs(dynamic.text);
    },
    onDragMove: (e) => {
      const target = e.target;
      const out = outOfToolbar(e);
      target.visible(!out);
      const place = placeProps(e);
      const pos = magnetToAll(place, elements);
      const x = origin.x + (pos ? pos.x : place.x);
      const y = origin.y + (pos ? pos.y : place.y);
      getBoardShadow(e).setAttrs({ x, y, visible: out });
    },
    onDragEnd: (e) => {
      const target = e.target;
      const out = outOfToolbar(e);
      target.visible(!out);
      shadow.current.visible(false);
      target.setAttrs({ x, y, visible: true });
      getBoardShadow(e).visible(false);
      if (out) {
        const place = placeProps(e);
        const pos = magnetToAll(place, elements);
        addElement({
          type: tileType,
          x: pos ? pos.x : place.x,
          y: pos ? pos.y : place.y,
          width: place.width,
          height: place.height,
          text,
          color,
          borderColor,
        });
      }
    },
    onPointerClick: (e) => {
      const { width, height } = placeProps(e);
      const pos = { x: -width / 2, y: -height / 2 };
      const last = elements[lastActiveElement];
      if (last) {
        pos.x = last.x;
        pos.y = last.y - height;
      }
      addElement({ type: tileType, width, height, text, color, borderColor, ...pos });
    },
  };
  return (
    <>
      <Group ref={shadow} visible={false}>
        <Tile
          x={x}
          y={y}
          width={width * base}
          height={height * base}
          text={text}
          color={color}
          borderColor={borderColor}
        />
      </Group>
      <Group x={x} y={y} draggable {...events}>
        <Tile width={width * base} height={height * base} text={text} color={color} borderColor={borderColor} />
      </Group>
    </>
  );
};

export const BoardTile = (props) => {
  const { origin, selectIds, relocateElement, elements, multiColored } = useAppStore();
  const { id, locked, annihilation, moveTo, invert, rotate } = props;
  const x = props.x + origin.x;
  const y = props.y + origin.y;
  const groupRef = useRef();
  useEffect(() => {
    if (annihilation) animateAnnihilation(groupRef.current);
    if (moveTo) animateMove(groupRef.current, moveTo.x - props.x, moveTo.y - props.y);
    if (invert) animateInvert(groupRef.current, props, multiColored);
    if (rotate) animateRotate(groupRef.current, props, origin, multiColored);
  }, [annihilation, moveTo, invert, rotate]);

  const events = {
    onDragStart: (e) => {},
    onDragMove: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      const pos = magnetToAll({ ...props, x: props.x + dx, y: props.y + dy }, elements);
      if (pos) {
        e.target.setAttrs({ x: origin.x + pos.x, y: origin.y + pos.y });
      }
    },
    onDragEnd: (e) => {
      relocateElement(id, e.target.x() - x, e.target.y() - y);
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

export function magnetToAll(tile, elements) {
  for (const [id, element] of Object.entries(elements)) {
    if (tile.id == id || element.type != tileType) continue;
    const pos = magnetToOne(tile, element);
    if (pos) return pos;
  }
  return null;
}

function magnetToOne(tile, other) {
  const { x, y, width, height } = tile;

  const options = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
    [-other.width, 0],
    [-other.width + width, 0],
    [-other.width + 0, height],
    [-other.width + width, height],
    [0, 0 - other.height],
    [width, 0 - other.height],
    [0, height - other.height],
    [width, height - other.height],
    [-other.width + 0, 0 - other.height],
    [-other.width + width, 0 - other.height],
    [-other.width + 0, height - other.height],
    [-other.width + width, height - other.height],
  ];

  for (const [dx, dy] of options) {
    if (pointsIsClose({ x: x + dx, y: y + dy }, other)) return { x: other.x - dx, y: other.y - dy };
  }
  return null;
}

function animateAnnihilation(node) {
  node.setAttr("opacity", 1);
  const animation = new Animation(({ time }) => {
    if (time > animationDuration) {
      animation.stop();
      node.setAttr("opacity", 0);

      return;
    }
    const t = time / animationDuration;
    const k = (t * t) / (2 * (t * t - t) + 1);
    node.setAttr("opacity", 1 - k);
  }, node.getLayer());
  animation.start();
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

function animateInvert(node, props, multiColored) {
  const rect = node.children[0].children[0];
  const text = node.children[0].children[1];
  const from = dynamicProps(props, multiColored);
  const to = dynamicProps({ ...props, text: invertText(props.text) }, multiColored);
  const fillFrom = hexToRgb(from.rect.fill);
  const fillTo = hexToRgb(to.rect.fill);
  const strokeFrom = hexToRgb(from.rect.stroke);
  const strokeTo = hexToRgb(to.rect.stroke);
  const textFillFrom = hexToRgb(from.text.fill);
  const textFillTo = hexToRgb(to.text.fill);
  const animation = new Animation(({ time }) => {
    if (time > animationDuration) {
      animation.stop();
      rect.setAttrs({
        fill: to.rect.fill,
        stroke: to.rect.stroke,
      });
      text.setAttr("fill", to.text.fill);
      return;
    }
    const t = time / animationDuration;
    const k = (t * t) / (2 * (t * t - t) + 1);
    rect.setAttrs({
      fill: blendColors(fillFrom, fillTo, k),
      stroke: blendColors(strokeFrom, strokeTo, k),
    });
    text.setAttr("fill", blendColors(textFillFrom, textFillTo, k));
  }, rect.getLayer());
  animation.start();
  text.setAttr("text", invertText(props.text));
}

function animateRotate(node, props, origin, multiColored) {
  const group = node.children[0];
  const [rect, text] = group.children;

  const { x, y, width, height } = props;
  const animation = new Animation(({ time }) => {
    if (time > animationDuration) {
      const finalProps = dynamicProps({
        ...props,
        width: height,
        height: width,
        x: origin.x + x + width / 2 - height / 2,
        y: origin.y + y + height / 2 - width / 2,
      }, multiColored);
      group.setAttrs(finalProps.group);
      text.setAttrs(finalProps.text);
      rect.setAttrs({ ...finalProps.rect, rotation: 0 });
      animation.stop();
      return;
    }
    const t = time / animationDuration;
    const k = (t * t) / (2 * (t * t - t) + 1);
    rect.setAttr("rotation", k * 90);
  }, node.getLayer());
  animation.start();
}
