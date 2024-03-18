import { Circle, Rect, Text } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { bandPointRadius } from "./GeoboardBand";
import { Fragment, useEffect, useRef } from "react";
import ResizeHandle from "./ResizeHandle";
import { elementBox, fractionMagnet, getStageXY, setVisibility, setVisibilityFrame } from "../util";

const SelectedFrame = (props) => {
  const state = useAppStore();
  const { selected, lockSelect, geoboardBands, origin, offset, scale, mode, elements } = state;

  const selectedTargets = [];

  useEffect(() => {
    if (selected) {
      if (mode == "geoboard") {
        for (const band of geoboardBands) {
          for (const [pointIndex, point] of band.points.entries()) {
            if (selected.includes(point.id)) {
              const node = props.findOne(point.id);
              selectedTargets.push({
                point: node,
                sides: props.findOne(`${band.id}-sides`),
                x: node.x(),
                y: node.y(),
                pointIndex,
              });
            }
          }
        }
      } else {
        for (const id of selected) {
          const node = props.findOne(id);
          if (node) {
            selectedTargets.push({
              node,
              x: node.x(),
              y: node.y(),
            });
          }
        }
      }
    }
  });

  if (selected.length == 0) {
    return <></>;
  }

  const { xMin, yMin, xMax, yMax } = getBounds(state);
  const x = (origin.x + xMin - bandPointRadius - offset.x) * scale - 1;
  const y = (origin.y + yMin - bandPointRadius - offset.y) * scale - 1;
  const width = (xMax - xMin + bandPointRadius * 2) * scale + 2;
  const height = (yMax - yMin + bandPointRadius * 2) * scale + 2;

  const showResizeHandle = mode == "rods" && selected.length == 1 && elements[selected[0]].resizable;
  const rhShift = showResizeHandle ? 10 : 0;

  let rhNode, rhX, rhY;
  const onMouseDown = (e) => {
    if (showResizeHandle) {
      rhNode = props.findOne("resize-handle");
      rhX = rhNode.x();
      rhY = rhNode.y();
    }
  };

  const onDragStart = (e) => {
    setVisibility(e, false);
    if (mode == "fractions" && selectedTargets.length == 1) {
      setVisibilityFrame(e, false);
    }
  };

  const onDragMove = (e) => {
    let dx = (e.target.x() - x) / state.scale;
    let dy = (e.target.y() - y) / state.scale;
    if (mode == "rods") {
      dx -= dx % (gridStep / 2);
      dy -= dy % (gridStep / 2);
      if (showResizeHandle) {
        if (!rhNode) rhNode = props.findOne("resize-handle");
        rhNode.setAttrs({ x: rhX + dx * state.scale, y: rhY + dy * state.scale });
      }
    }
    if (mode == "geoboard") {
      selectedTargets.forEach(({ point, sides, x, y, pointIndex }) => {
        point.setAttrs({ x: x + dx, y: y + dy });
        const points = sides.points();
        points[pointIndex * 2] = x + dx;
        points[pointIndex * 2 + 1] = y + dy;
        sides.setAttrs({ points });
      });
    } else {
      selectedTargets.forEach(({ node, x, y }) => {
        node.setAttrs({ x: x + dx, y: y + dy });
      });
      e.target.setAttrs({ x: x + dx * scale, y: y + dy * scale });
    }

    if (mode == "fractions" && selectedTargets.length == 1) {
      const node = selectedTargets[0].node;
      let { x, y } = getStageXY(e.target.getStage(), state);
      let magnet = null;
      for (const id in state.elements) {
        const el = state.elements[id];
        if (el.id == node.id()) continue;
        magnet = fractionMagnet({ x, y }, el, node.angle ? node.angle() : 360, origin) || magnet;
      }
      node.setAttrs(magnet || { rotation: elements[selected[0]].rotation });
    }
  };

  const onDragEnd = (e) => {
    if (mode == "fractions" && selectedTargets.length == 1) {
      const node = selectedTargets[0].node;
      state.updateElement(selected[0], {
        x: node.x() - origin.x,
        y: node.y() - origin.y,
        rotation: node.rotation(),
      });
    } else {
      const dx = (e.target.x() - x) / state.scale;
      const dy = (e.target.y() - y) / state.scale;
      state.relocateSelected(dx, dy);
    }
    setVisibilityFrame(e, true);
  };

  let menuButtons = [
    {
      text: "Rotate",
      active: !lockSelect,
      hide: ["geoboard", "linking-cubes", "fractions"],
      onPointerClick: (e) => {
        state.rotateSelected();
      },
    },
    {
      text: "Fill On/Off",
      active: !lockSelect,
      hide: ["linking-cubes"],
      onPointerClick: (e) => {
        state.toggleValueSelected("fill");
      },
    },
    {
      text: "Angle On/Off",
      active: !lockSelect,
      hide: ["linking-cubes", "rods", "fractions"],
      onPointerClick: (e) => {
        state.toggleValueSelected("measures");
      },
    },
    {
      text: "Copy",
      active: !lockSelect,
      hide: [],
      onPointerClick: (e) => {
        state.copySelected();
      },
    },
    {
      text: "Delete",
      active: !lockSelect,
      hide: [],
      onPointerClick: (e) => {
        state.deleteSelected();
      },
    },
    {
      text: lockSelect ? "Unlock" : "Lock",
      active: true,
      hide: [],
      onPointerClick: (e) => {
        e.cancelBubble = true;
        state.lockSelected(!lockSelect);
      },
    },
  ];

  menuButtons = menuButtons.filter((button) => !button.hide.includes(mode));

  const buttonHeight = 20;
  const buttonWidth = 110;
  const padding = 8;

  const onMouseEnter = (e, i) => {
    if (!menuButtons[i].active) {
      return;
    }
    e.target
      .getStage()
      .findOne("#menu-item-" + i)
      .setAttrs({
        fill: "#e8f4fe",
      });
  };

  const onMouseLeave = (e, i) => {
    if (!menuButtons[i].active) {
      return;
    }
    e.target
      .getStage()
      .findOne("#menu-item-" + i)
      .setAttrs({
        fill: "#ffffff",
      });
  };

  return (
    <>
      <Rect
        id="selected-frame"
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="#2196f3"
        strokeWidth={2}
        draggable={!lockSelect}
        onMouseDown={onMouseDown}
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
      {showResizeHandle && <ResizeHandle frameProps={{ x, y, width, height }} element={elements[selected[0]]} />}
      <Rect
        id="popup-menu"
        name={"popup-menu"}
        x={x + width + padding + rhShift}
        y={y}
        width={buttonWidth + padding * 2}
        height={padding * 3 * menuButtons.length + padding + buttonHeight * menuButtons.length}
        stroke="grey"
        strokeWidth={1}
        cornerRadius={12}
        fill="#ffffff"
        shadowColor="grey"
        shadowBlur={5}
        shadowOffset={{ x: 3, y: 3 }}
        shadowOpacity={0.5}
      />
      <RotateHandle x={x + width / 2} y={y + height + 20} />
      {menuButtons.map(({ text, active, onPointerClick }, i) => (
        <Fragment key={text}>
          <Rect
            id={"menu-item-" + i}
            name={"popup-menu"}
            x={x + width + padding * 2 + rhShift}
            y={y + padding + (padding * 3 + buttonHeight) * i}
            width={buttonWidth}
            height={buttonHeight + padding * 2}
            cornerRadius={5}
            onMouseEnter={(e) => onMouseEnter(e, i)}
            onMouseLeave={(e) => onMouseLeave(e, i)}
            onPointerClick={(e) => {
              e.cancelBubble = true;
              if (!active) {
                return;
              }
              onPointerClick(e);
            }}
          />
          <Text
            id={"menu-item-text" + i}
            name={"popup-menu"}
            x={x + width + padding * 3 + rhShift}
            y={y + padding * 2 + (padding * 3 + buttonHeight) * i}
            text={text}
            fill={active ? "black" : "#aaaaaa"}
            fontSize={18}
            fontFamily="Calibri"
            onPointerClick={(e) => {
              e.cancelBubble = true;
              if (!active) {
                return;
              }
              onPointerClick(e);
            }}
            onMouseEnter={(e) => onMouseEnter(e, i)}
            onMouseLeave={(e) => onMouseLeave(e, i)}
          />
        </Fragment>
      ))}
    </>
  );
};

const RotateHandle = ({ x, y }) => {
  const state = useAppStore();
  const { selected, mode, elements } = state;
  const ref = useRef(null);
  if (selected.length != 1 || mode != "fractions" || elements[selected[0]].angle == 360 || elements[selected[0]].type != "fraction") {
    return null;
  }

  const onDragStart = (e) => {
    setVisibilityFrame(e, false);
  };
  const onDragMove = (e) => {
    const stage = e.target.getStage();
    const { x, y } = getStageXY(e.target.getStage(), state);
    const element = selected.length == 1 && elements[selected[0]];
    const rotation = (Math.atan2(y - element.y, x - element.x) / Math.PI) * 180 - element.angle / 2;
    const node = stage.findOne("#" + selected[0]);
    node.setAttrs({ rotation: rotation });
  };
  const onDragEnd = (e) => {
    setVisibilityFrame(e, true);
    const { x, y } = getStageXY(e.target.getStage(), state);
    const element = selected.length == 1 && elements[selected[0]];
    const rotation = (Math.atan2(y - element.y, x - element.x) / Math.PI) * 180 - element.angle / 2;
    ref.current.setAttrs({ x, y });
    state.updateElement(element.id, { rotation });
  };

  return (
    <Circle
      ref={ref}
      name="popup-menu"
      x={x}
      y={y}
      radius={10}
      fill="#2196f3"
      draggable
      onDragStart={onDragStart}
      onDragMove={onDragMove}
      onDragEnd={onDragEnd}
    />
  );
};

function getBounds(state) {
  const { selected, geoboardBands, mode, elements } = state;
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
  if (mode == "geoboard") {
    for (const band of geoboardBands) {
      for (const point of band.points) {
        const { id, x, y } = point;
        if (selected.includes(id)) {
          if (x < xMin) xMin = x;
          if (x > xMax) xMax = x;
          if (y < yMin) yMin = y;
          if (y > yMax) yMax = y;
        }
      }
    }
  } else {
    Object.keys(elements).map((key) => {
      const element = elements[key];
      const { x, y, width, height } = elementBox(element);
      if (selected.includes(element.id)) {
        if (x < xMin) xMin = x;
        if (x + width > xMax) xMax = x + width;
        if (y < yMin) yMin = y;
        if (y + height > yMax) yMax = y + height;
      }
    });
  }
  return { xMin, yMin, xMax, yMax };
}

export default SelectedFrame;
