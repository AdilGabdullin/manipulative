import { Group, Line, Rect } from "react-konva";
import {config} from "../config";
import { cos, getStageXY, halfPixel, pointsIsClose, setVisibility, sin } from "../util";
import { useAppStore } from "../state/store";
import { useEffect, useRef } from "react";
import { Animation } from "konva/lib/Animation";

export const Tile = ({ id, x, y, fill, stroke, events }) => {
  const state = useAppStore();
  const size = getSize(state);

  return (
    <Group id={id} x={halfPixel(x)} y={halfPixel(y)} {...events}>
      <Rect width={size} height={size} fill={fill} stroke={stroke} strokeWidth={1} />
    </Group>
  );
};

export const ToolbarTile = (props) => {
  const state = useAppStore();
  const { origin, elements, addElement, breakPlaced } = state;
  const shadow = useRef();
  const size = getSize(state);

  const outOfToolbar = (e) => e.target.getStage().getPointerPosition().x > config.leftToolbar.width;

  const placeProps = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    return { x: x - size / 2, y: size - h / 2, width: size, height: size };
  };

  let boardShadow = null;
  const getBoardShadow = (e) => {
    return boardShadow || (boardShadow = e.target.getStage().findOne(props.shadowId));
  };

  const add = (pos, place) => {
    const { width, height, top, right } = props;
    const block = {
      ...props,
      type: "block",
      x: pos ? pos.x : place.x,
      y: pos ? pos.y : place.y,
      width: width * scale,
      height: height * scale,
      top: top * scale,
      right: right * scale,
      scale,
    };
    if (elementInBreakColumn(state, block)) {
      breakPlaced(block);
    } else if (!elementInWrongColumn(state, block)) {
      addElement(block);
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
      const pos = magnetToAll(place, elements);
      const x = halfPixel(origin.x + (pos ? pos.x : place.x));
      const y = halfPixel(origin.y + (pos ? pos.y : place.y));
      getBoardShadow(e).setAttrs({ x, y, visible: out });
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
        const pos = magnetToAll(place, elements);
        add(pos, place);
      }
    },
    onPointerClick: (e) => {
      const { width, height } = props;
      const pos = { x: (-width / 2) * scale, y: (-height / 2) * scale };
      const last = elements[state.lastActiveElement];
      if (last) {
        pos.x = last.x + width * scale;
        pos.y = last.y;
      }
      add(pos);
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
  const { origin, selectIds, elements } = state;
  const { id, locked } = props;
  const x = props.x + origin.x;
  const y = props.y + origin.y;
  const groupRef = useRef();
  const { moveTo } = props;
  useEffect(() => {
    if (moveTo) animateMove(groupRef.current.children[0], x, y, moveTo.x + origin.x, moveTo.y + origin.y);
  }, [moveTo]);

  const events = {
    draggable: true,
    onDragStart: (e) => {
      setVisibility(e, false);
    },
    onDragMove: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      const block = { ...props, x: props.x + dx, y: props.y + dy };
      const pos = magnetToAll(block, elements);
      if (pos) {
        e.target.setAttrs({ x: halfPixel(origin.x + pos.x), y: halfPixel(origin.y + pos.y) });
      }
    },
    onDragEnd: (e) => {
      const dx = e.target.x() - x;
      const dy = e.target.y() - y;
      const block = { ...props, x: props.x + dx, y: props.y + dy };
      setVisibility(e, true);
      if (elementInBreakColumn(state, block)) {
        state.relocateAndBreak(id, dx, dy);
      } else if (elementInWrongColumn(state, block)) {
        state.cancelMove(id, dx, dy);
      } else {
        state.relocateElement(id, dx, dy);
      }
    },
    onPointerClick: (e) => {
      selectIds([id], locked);
    },
  };
  return (
    <Group x={0} y={0} ref={groupRef}>
      <Block {...props} x={x} y={y} events={events} />
    </Group>
  );
};

export function magnetToAll(block, elements) {
  for (const [id, element] of Object.entries(elements)) {
    if (block.id == id || element.type != "block") continue;
    const pos = magnetToOne(block, element);
    if (pos) return pos;
  }
  return null;
}

function magnetToOne(block, other) {
  const { x, y, width, height } = block;

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

function animateMove(node, xFrom, yFrom, xTo, yTo) {
  const animation = new Animation(({ time }) => {
    if (time > config.animationDuration) {
      animation.stop();
      // node.setAttrs({ x: 0, y: 0 });
      return;
    }
    const t = time / config.animationDuration;
    const k = (t * t) / (2 * (t * t - t) + 1);
    node.setAttrs({
      x: xFrom * (1 - k) + xTo * k,
      y: yFrom * (1 - k) + yTo * k,
    });
  }, node.getLayer());
  animation.start();
}

export function getSize(state) {
  return Math.round(config.tile.size * state.scale);
}
