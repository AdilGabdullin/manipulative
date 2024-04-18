import { Group, Line, Rect } from "react-konva";
import config from "../config";
import { cos, getStageXY, pointsIsClose, sin } from "../util";
import { useAppStore } from "../state/store";
import { useRef } from "react";

export const Block = ({ id, x, y, size, label, scale, visible, events }) => {
  const { angle, depthScale, options, stroke } = config.block;
  const option = options[label];
  const { fill, dark } = option;
  const [sx, sy, sz] = size || option.size;
  const width = sx * scale;
  const height = sy * scale;
  const depthStepX = cos(angle) * scale * depthScale;
  const depthStepY = sin(angle) * scale * depthScale;
  const depthX = depthStepX * sz;
  const depthY = depthStepY * sz;

  const hPoints = [0, 0, width, 0];
  const vPoints = [0, 0, 0, height];
  const zPoints = [0, 0, depthX, -depthY];

  const lines = [];
  for (let i = 0; i <= sy; i += 1) {
    lines.push({ x: 0, y: scale * i, points: hPoints });
  }
  for (let i = 1; i <= sz; i += 1) {
    lines.push({ x: depthStepX * i, y: -depthStepY * i, points: hPoints });
  }

  for (let i = 0; i <= sx; i += 1) {
    lines.push({ x: scale * i, y: 0, points: vPoints });
  }
  for (let i = 1; i <= sz; i += 1) {
    lines.push({ x: width + depthStepX * i, y: -depthStepY * i, points: vPoints });
  }
  for (let i = 0; i <= sx; i += 1) {
    lines.push({ x: scale * i, y: 0, points: zPoints });
  }
  for (let i = 1; i <= sy; i += 1) {
    lines.push({ x: width, y: scale * i, points: zPoints });
  }

  return (
    <Group id={id} x={x} y={y} visible={visible} {...events}>
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
  const state = useAppStore();
  const { origin, elements, addElement } = state;
  const shadow = useRef();
  const scale = config.block.size;

  const outOfToolbar = (e) => e.target.getStage().getPointerPosition().x > config.leftToolbar.width;

  const placeProps = (e) => {
    const { x, y } = getStageXY(e.target.getStage(), state);
    const w = props.width * scale;
    const h = props.height * scale;
    return { x: x - w / 2, y: y - h / 2, width: w, height: h };
  };

  let boardShadow = null;
  const getBoardShadow = (e) => {
    return boardShadow || (boardShadow = e.target.getStage().findOne("#shadow-block-" + props.label));
  };

  const add = (pos, place) => {
    const { width, height, top, right } = props;
    addElement({
      ...props,
      type: "block",
      x: pos ? pos.x : place.x,
      y: pos ? pos.y : place.y,
      width: width * scale,
      height: height * scale,
      top: top * scale,
      right: right * scale,
      scale,
    });
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
      const x = origin.x + (pos ? pos.x : place.x);
      const y = origin.y + (pos ? pos.y : place.y);
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
      const pos = { x: -width / 2, y: -height / 2 };
      const last = elements[state.lastActiveElement];
      if (last) {
        pos.x = last.x;
        pos.y = last.y - height * scale;
      }
      add(pos);
    },
  };

  return (
    <>
      <Group ref={shadow} visible={false}>
        <Block {...props} />
      </Group>
      <Group draggable {...events}>
        <Block {...props} />
      </Group>
    </>
  );
};

export const BoardBlock = (props) => {
  const state = useAppStore();
  const { origin, selectIds, relocateElement, elements } = state;
  const { id, locked } = props;
  const x = props.x + origin.x;
  const y = props.y + origin.y;
  const groupRef = useRef();
  // useEffect(() => {
  //   if (annihilation) animateAnnihilation(groupRef.current);
  //   if (moveTo) animateMove(groupRef.current, moveTo.x - props.x, moveTo.y - props.y);
  //   if (invert) {
  //     const inSolving = state.workspace == workspace.solving && boxesIntersect(props, solvingRectProps(state));
  //     animateInvert(groupRef.current, props, origin, multiColored, inSolving);
  //   }
  //   if (rotate) animateRotate(groupRef.current, props, origin, multiColored);
  // }, [annihilation, moveTo, invert, rotate]);

  const events = {
    draggable: true,
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
