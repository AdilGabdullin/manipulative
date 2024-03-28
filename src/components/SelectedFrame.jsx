import { Rect, Text } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { Fragment, useEffect } from "react";
import { elementBox, setVisibility, setVisibilityFrame } from "../util";
import ShapeResizeHandles from "./ShapeResizeHandles";
import { createTextArea } from "./TextElement";

const SelectedFrame = (props) => {
  const state = useAppStore();
  const { selected, lockSelect, origin, offset, scale, elements } = state;

  const selectedTargets = [];

  const pushTarget = (id) => {
    const node = props.findOne(id);
    if (node) {
      selectedTargets.push({
        node,
        x: node.x(),
        y: node.y(),
      });
    }
  };

  useEffect(() => {
    if (selected) {
      for (const id of selected) {
        const el = elements[id];
        if (!el) continue;

        pushTarget(id);
      }
    }
  });

  if (selected.length == 0) {
    return <></>;
  }

  const { xMin, yMin, xMax, yMax } = getBounds(state);
  const x = (origin.x + xMin - 7 - offset.x) * scale - 1;
  const y = (origin.y + yMin - 7 - offset.y) * scale - 1;
  const width = (xMax - xMin + 7 * 2) * scale + 2;
  const height = (yMax - yMin + 7 * 2) * scale + 2;

  const onPointerDown = (e) => {};

  const onDragStart = (e) => {
    setVisibility(e, false);
  };

  const onDragMove = (e) => {
    let dx = (e.target.x() - x) / state.scale;
    let dy = (e.target.y() - y) / state.scale;
    if (selected.some((id) => elements[id] && elements[id].type == "rod")) {
      dx -= dx % (gridStep / 2);
      dy -= dy % (gridStep / 2);
    }
    selectedTargets.forEach(({ point, node, x, y }) => {
      if (point) return;
      node.setAttrs({ x: x + dx, y: y + dy });
    });
    e.target.setAttrs({ x: x + dx * scale, y: y + dy * scale });
  };

  const onDragEnd = (e) => {
      const dx = (e.target.x() - x) / state.scale;
      const dy = (e.target.y() - y) / state.scale;
      state.relocateSelected(dx, dy);
    
    setVisibilityFrame(e, true);
  };

  const showFlips = selected.length == 1 && selected.some((id) => elements[id]?.type == "pattern");

  let menuButtons = [
    {
      text: "Flip Vertical",
      active: !lockSelect,
      show: showFlips,
      onPointerClick: (e) => {
        state.flipVertical(selected[0]);
      },
    },
    {
      text: "Flip Horizontal",
      active: !lockSelect,
      show: showFlips,
      onPointerClick: (e) => {
        state.flipHorizontal(selected[0]);
      },
    },
    {
      text: "Template",
      active: !lockSelect,
      show:
        selected.some((id) => elements[id]?.type == "pattern") &&
        !selected.some((id) => elements[id]?.type == "template"),
      onPointerClick: (e) => {
        state.convertPatternsToTemplate();
      },
    },
    {
      text: "Edit",
      active: !lockSelect,
      show: selected.length == 1 && elements[selected[0]]?.type == "text",
      onPointerClick: (e) => {
        createTextArea(e.target.getStage().findOne("#" + selected[0]), state);
      },
    },
    {
      text: "Fill On/Off",
      active: !lockSelect,
      show: selected.some((id) => elements[id] == undefined || elements[id].fill != undefined),
      onPointerClick: (e) => {
        state.toggleValueSelected("fill");
      },
    },
    {
      text: "Copy",
      active: !lockSelect,
      show: !selected.some((id) => elements[id]?.type == "template"),
      onPointerClick: (e) => {
        state.copySelected();
      },
    },
    {
      text: "Delete",
      active: !lockSelect,
      show: true,
      onPointerClick: (e) => {
        state.deleteSelected();
      },
    },
    {
      text: lockSelect ? "Unlock" : "Lock",
      active: true,
      show: true,
      onPointerClick: (e) => {
        e.cancelBubble = true;
        state.lockSelected(!lockSelect);
      },
    },
  ];

  menuButtons = menuButtons.filter((button) => button.show);

  const buttonHeight = 20;
  const buttonWidth = 110 + (showFlips ? 10 : 0);
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
        onPointerDown={onPointerDown}
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
      <ShapeResizeHandles x={x} y={y} width={width} height={height} findOne={props.findOne} />
      {menuButtons.map(({ text, active, onPointerClick }, i) => (
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
            x={x + width + padding * 3}
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

function getBounds(state) {
  const { selected, elements } = state;
  let xMin = Infinity;
  let yMin = Infinity;
  let xMax = -Infinity;
  let yMax = -Infinity;
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
  return { xMin, yMin, xMax, yMax };
}

export default SelectedFrame;
