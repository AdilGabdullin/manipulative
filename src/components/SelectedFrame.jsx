import { Rect, Text } from "react-konva";
import { useAppStore } from "../state/store";
import { Fragment, useEffect } from "react";
import { elementBox, halfPixel, setVisibility, setVisibilityFrame } from "../util";
import ShapeResizeHandles from "./ShapeResizeHandles";
import { KIND, colorOptions, createTextArea } from "./TextElement";
import { regroupPossible } from "../state/breakRegroupSlice";
import { magnetToAll } from "./Block";
import config from "../config";
import { rectProps } from "./Factors";

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
        switch (el.type) {
          default:
            pushTarget(id);
        }
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

  const factorsRect = state.workspace == config.workspace.factors && rectProps(state);
  const others = { ...elements };
  for (const id of selected) {
    delete others[id];
  }
  const onDragMove = (e) => {
    let dx = (e.target.x() - x) / state.scale;
    let dy = (e.target.y() - y) / state.scale;

    for (const id of selected) {
      const block = elements[id];
      if (block.type != "block") continue;
      const pos = magnetToAll({ ...block, x: block.x + dx, y: block.y + dy }, others, factorsRect);
      if (pos) {
        dx = pos.x - block.x;
        dy = pos.y - block.y;
        break;
      }
    }
    selectedTargets.forEach(({ node, x, y }) => {
      node.setAttrs({ x: halfPixel(x + dx), y: halfPixel(y + dy) });
    });
    e.target.setAttrs({ x: halfPixel(x + dx * scale), y: halfPixel(y + dy * scale) });
  };

  const onDragEnd = (e) => {
    const dx = (e.target.x() - x) / state.scale;
    const dy = (e.target.y() - y) / state.scale;
    setVisibilityFrame(e, true);
    state.relocateSelected(dx, dy);
  };

  let menuButtons = [
    {
      text: "Edit",
      active: !lockSelect,
      show: selected.length == 1 && elements[selected[0]]?.type == "text",
      onPointerClick: (e) => {
        const stage = e.target.getStage();
        if (elements[selected[0]].kind == KIND.mixed) {
          createTextArea(stage.findOne("#" + selected[0] + "?2"), state);
        } else {
          createTextArea(stage.findOne("#" + selected[0] + "?0"), state);
        }
      },
    },
    {
      text: "Color",
      active: !lockSelect,
      show: selected.length == 1 && elements[selected[0]]?.type == "text",
      onPointerClick: (e) => {
        state.setValue("colorMenuVisible", true);
      },
    },
    {
      text: "Break",
      active: !lockSelect && selected.some((id) => elements[id].label != "1"),
      show: state.workspace != config.workspace.placeValue && selected.some((id) => elements[id].type == "block"),
      onPointerClick: (e) => {
        state.breakSelected();
      },
    },
    {
      text: "Regroup",
      active: !lockSelect && regroupPossible(state),
      show: state.workspace != config.workspace.placeValue && selected.some((id) => elements[id].type == "block"),
      onPointerClick: (e) => {
        state.regroupSelected();
      },
    },
    {
      text: "Rotate",
      active: !lockSelect,
      show: selected.length == 1 && elements[selected[0]]?.type == "block" && elements[selected[0]]?.label == 10,
      onPointerClick: (e) => {
        state.rotateBlock10(selected[0]);
      },
    },
    {
      text: "Fill On/Off",
      active: !lockSelect,
      show: selected.some((id) => elements[id].fill != undefined && elements[id].type != "block"),
      onPointerClick: (e) => {
        state.toggleValueSelected("fill");
      },
    },
    {
      text: "Copy",
      active: !lockSelect,
      show: true,
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
  const buttonWidth = 110;
  const padding = 8;

  const onMouseEnter = (e, i) => {
    if (menuButtons[i] && !menuButtons[i].active) {
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
    if (menuButtons[i] && !menuButtons[i].active) {
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
      {state.colorMenuVisible && (
        <>
          <Rect
            name={"popup-menu"}
            x={x + width + buttonWidth + 2 * padding}
            y={y + padding}
            width={buttonWidth + padding * 2}
            height={(padding * 3 + buttonHeight) * colorOptions.length + padding}
            stroke="grey"
            strokeWidth={1}
            cornerRadius={12}
            fill="#ffffff"
            shadowColor="grey"
            shadowBlur={5}
            shadowOffset={{ x: 3, y: 3 }}
            shadowOpacity={0.5}
          />
          {colorOptions.map(({ name, fill }, i) => {
            const id = i + 100;
            return (
              <Fragment key={name}>
                <Rect
                  id={"menu-item-" + id}
                  name={"popup-menu"}
                  x={x + width + buttonWidth + 3 * padding}
                  y={y + 2 * padding + (padding * 3 + buttonHeight) * i}
                  width={buttonWidth}
                  height={buttonHeight + padding * 2}
                  cornerRadius={5}
                  onMouseEnter={(e) => onMouseEnter(e, id)}
                  onMouseLeave={(e) => onMouseLeave(e, id)}
                  onPointerClick={(e) => {
                    e.cancelBubble = true;
                    state.setColor(i);
                  }}
                />
                <Rect
                  name={"popup-menu"}
                  x={x + width + buttonWidth + padding * 4}
                  y={y + padding * 3 + (padding * 3 + buttonHeight) * i}
                  width={20}
                  height={20}
                  fill={fill}
                  onMouseEnter={(e) => onMouseEnter(e, id)}
                  onMouseLeave={(e) => onMouseLeave(e, id)}
                  onPointerClick={(e) => {
                    e.cancelBubble = true;
                    state.setColor(i);
                  }}
                />
                <Text
                  id={"menu-item-text" + id}
                  name={"popup-menu"}
                  x={x + width + buttonWidth + padding * 5 + 20}
                  y={y + padding * 3 + (padding * 3 + buttonHeight) * i}
                  text={name}
                  fontSize={18}
                  fontFamily="Calibri"
                  onPointerClick={(e) => {
                    e.cancelBubble = true;
                    state.setColor(i);
                  }}
                  onMouseEnter={(e) => onMouseEnter(e, id)}
                  onMouseLeave={(e) => onMouseLeave(e, id)}
                />
              </Fragment>
            );
          })}
        </>
      )}
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
