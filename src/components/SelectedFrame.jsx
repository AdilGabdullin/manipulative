import { Circle, Rect, Text } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { bandPointRadius } from "./GeoboardBand";
import { Fragment, useEffect } from "react";
import ResizeHandle from "./ResizeHandle";
import { elementBox, setVisibility, setVisibilityFrame } from "../util";

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
  };

  const onDragMove = (e) => {
    let dx = (e.target.x() - x) / state.scale;
    let dy = (e.target.y() - y) / state.scale;
    if (mode == "rods") {
      dx -= dx % (gridStep / 2);
      dy -= dy % (gridStep / 2);
      if (showResizeHandle) {
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
  };

  const onDragEnd = (e) => {
    const dx = (e.target.x() - x) / state.scale;
    const dy = (e.target.y() - y) / state.scale;
    state.relocateSelected(dx, dy);
    setVisibility(e, true);
  };

  let menuButtons = [
    {
      text: "Rotate",
      active: !lockSelect,
      hide: ["geoboard", "linking-cubes", "fractions"],
      onClick: (e) => {
        state.rotateSelected();
      },
    },
    {
      text: "Fill On/Off",
      active: !lockSelect,
      hide: ["linking-cubes"],
      onClick: (e) => {
        state.toggleValueSelected("fill");
      },
    },
    {
      text: "Angle On/Off",
      active: !lockSelect,
      hide: ["linking-cubes", "rods", "fractions"],
      onClick: (e) => {
        state.toggleValueSelected("measures");
      },
    },
    {
      text: "Copy",
      active: !lockSelect,
      hide: [],
      onClick: (e) => {
        state.copySelected();
      },
    },
    {
      text: "Delete",
      active: !lockSelect,
      hide: [],
      onClick: (e) => {
        state.deleteSelected();
      },
    },
    {
      text: lockSelect ? "Unlock" : "Lock",
      active: true,
      hide: [],
      onClick: (e) => {
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
      {menuButtons.map(({ text, active, onClick }, i) => (
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
              onClick(e);
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
              onClick(e);
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
  const { selected, mode, elements, origin } = state;
  if (selected.length != 1 || mode != "fractions") {
    return null;
  }

  const onDragStart = (e) => {
    setVisibilityFrame(e, false);
  };
  const onDragMove = (e) => {
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    const element = selected.length == 1 && elements[selected[0]];
    const ex = origin.x + element.x;
    const ey = origin.y + element.y;
    const rotation = (Math.atan2(y - ey, x - ex) / Math.PI) * 180 - element.angle / 2;
    const node = stage.findOne("#" + selected[0]);
    node.setAttrs({ rotation });
  };
  const onDragEnd = (e) => {
    setVisibilityFrame(e, true);
    const stage = e.target.getStage();
    const { x, y } = stage.getPointerPosition();
    const element = selected.length == 1 && elements[selected[0]];
    const ex = origin.x + element.x;
    const ey = origin.y + element.y;
    const rotation = (Math.atan2(y - ey, x - ex) / Math.PI) * 180 - element.angle / 2;
    state.updateElement(element.id, { rotation });
  };
  return (
    <Circle
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
