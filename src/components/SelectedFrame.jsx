import { Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { bandPointRadius } from "./GeoboardBand";
import { Fragment, useEffect } from "react";

const SelectedFrame = (props) => {
  const state = useAppStore();
  const { selected, lockSelect, geoboardBands, elements, origin, offset, scale, mode } = state;

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

  const onDragStart = (e) => {
    setVisibility(e, false);
  };
  const onDragMove = (e) => {
    const dx = (e.target.x() - x) / state.scale;
    const dy = (e.target.y() - y) / state.scale;
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
    }
  };
  const onDragEnd = (e) => {
    const dx = (e.target.x() - x) / state.scale;
    const dy = (e.target.y() - y) / state.scale;
    state.relocateSelected(dx, dy);
    setVisibility(e, true);
  };

  const menuButtons = [
    {
      text: "Fill On/Off",
      active: !lockSelect,
      onClick: (e) => {
        state.toggleValueSelected("fill");
      },
    },
    {
      text: "Angle On/Off",
      active: !lockSelect,
      onClick: (e) => {
        state.toggleValueSelected("measures");
      },
    },
    {
      text: "Copy",
      active: !lockSelect,
      onClick: (e) => {
        state.copySelected();
      },
    },
    {
      text: "Delete",
      active: !lockSelect,
      onClick: (e) => {
        state.deleteSelected();
      },
    },
    {
      text: lockSelect ? "Unlock" : "Lock",
      active: true,
      onClick: (e) => {
        e.cancelBubble = true;
        state.lockSelected(!lockSelect);
      },
    },
  ];

  if (state.mode != "geoboard") {
    menuButtons.shift();
    menuButtons.shift();
  }
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

  const setVisibility = (e, value) => {
    e.target
      .getStage()
      .find(".popup-menu,.angle-measure")
      .forEach((node) => node.visible(value));
  };

  return (
    <>
      <Rect
        x={x}
        y={y}
        width={width}
        height={height}
        stroke="#2196f3"
        strokeWidth={2}
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
      />
      <Rect
        id="popup-menu"
        name={"popup-menu"}
        x={x + width + padding}
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
      {menuButtons.map(({ text, active, onClick }, i) => (
        <Fragment key={text}>
          <Rect
            id={"menu-item-" + i}
            name={"popup-menu"}
            x={x + width + padding * 2}
            y={y + padding + (padding * 3 + buttonHeight) * i}
            width={buttonWidth}
            height={buttonHeight + padding * 2}
            cornerRadius={5}
            onMouseEnter={(e) => onMouseEnter(e, i)}
            onMouseLeave={(e) => onMouseLeave(e, i)}
            onMouseUp={(e) => {
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
            x={x + width + padding * 3}
            y={y + padding * 2 + (padding * 3 + buttonHeight) * i}
            text={text}
            fill={active ? "black" : "#aaaaaa"}
            fontSize={18}
            fontFamily="Calibri"
            onMouseUp={(e) => {
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
      const { id, x, y, width, height } = element;
      if (selected.includes(id)) {
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
