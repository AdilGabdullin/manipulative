import { Group, Rect, Text } from "react-konva";
import { colors } from "../config";
import { useAppStore } from "../state/store";
import { getStageXY, pointsIsClose } from "../util";
import { useRef } from "react";
import { outOfToolbar } from "./LeftToolbar";

const fontSize = 24;
export const baseSize = 45;
export const tileType = "algebra-tile";

function dynamicProps({ x, y, width, height, text, visible }) {
  const { blue, red, blueBorder, redBorder } = colors;
  const isPositive = text && text[0] != "-";
  const fill = isPositive ? blue : red;
  const stroke = isPositive ? blueBorder : redBorder;
  return {
    group: { x, y, visible },
    rect: { width, height, fill, stroke },
    text: {
      x: 0,
      y: (height - fontSize) / 2 || 0,
      width: width,
      text: text,
    },
  };
}

export const Tile = (props) => {
  const dynamic = dynamicProps(props);
  return (
    <Group id={props.id} {...dynamic.group} draggable={!!props.events} {...props.events}>
      <Rect {...dynamic.rect} />
      <Text {...dynamic.text} fontFamily="Calibri" fontSize={fontSize} align="center" fill={colors.white} />
    </Group>
  );
};

export const ToolbarTile = ({ x, y, text, width, height, placeWidth, placeHeight, base }) => {
  const state = useAppStore();
  const { origin, addElement, lastActiveElement, elements } = state;
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
      const dynamic = dynamicProps({
        text,
        width: placeWidth * baseSize,
        height: placeHeight * baseSize,
        visible: true,
      });
      rect.setAttrs(dynamic.rect);
      tileText.setAttrs(dynamic.text);
    },
    onDragMove: (e) => {
      const target = e.target;
      const out = outOfToolbar(e);
      target.visible(!out);
      const dynamic = dynamicProps({ ...placeProps(e), visible: true });
      getBoardShadow(e).setAttrs({ x: origin.x + dynamic.group.x, y: origin.y + dynamic.group.y, visible: out });
    },
    onDragEnd: (e) => {
      const target = e.target;
      const out = outOfToolbar(e);
      target.visible(!out);
      shadow.current.visible(false);
      target.setAttrs({ x, y, visible: true });
      getBoardShadow(e).visible(false);
      addElement({ type: tileType, ...placeProps(e), text });
    },
    onPointerClick: (e) => {
      const pos = { x: 0, y: 0 };
      const { width, height } = placeProps(e);
      const last = elements[lastActiveElement];
      if (last) {
        pos.x = last.x;
        pos.y = last.y - height;
      }
      addElement({ type: tileType, width, height, text, ...pos });
    },
  };
  return (
    <>
      <Group ref={shadow} visible={false}>
        <Tile x={x} y={y} width={width * base} height={height * base} text={text} />
      </Group>
      <Group x={x} y={y} draggable {...events}>
        <Tile width={width * base} height={height * base} text={text} />
      </Group>
    </>
  );
};

export const BoardTile = (props) => {
  const { origin, selectIds, relocateElement, elements } = useAppStore();
  const { id, locked } = props;
  const x = props.x + origin.x;
  const y = props.y + origin.y;
  const events = {
    onDragStart: (e) => {},
    onDragMove: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      let pos = null;
      for (const [id, element] of Object.entries(elements)) {
        if (props.id == id) continue;
        pos = magnet({ ...props, x: props.x + dx, y: props.y + dy }, element);
        if (pos) {
          e.target.setAttrs({ x: origin.x + pos.x, y: origin.y + pos.y });
          return;
        }
      }
    },
    onDragEnd: (e) => {
      relocateElement(id, e.target.x() - x, e.target.y() - y);
    },
    onPointerClick: (e) => {
      selectIds([id], locked);
    },
  };
  return <Tile {...props} x={x} y={y} events={events} />;
};

function magnet(tile, other) {
  const { x, y, width, height } = tile;

  const options = [
    [0, 0],
    [width, 0],
    [0, height],
    [width, height],
    [-other.width + 0, 0],
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
