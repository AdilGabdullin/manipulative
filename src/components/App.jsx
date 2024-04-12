import { Stage, Layer } from "react-konva";
import { useEffect, useLayoutEffect, useRef } from "react";
import SelectRect, { selectRectMove, selectRectStop } from "./SelectRect";
import { useAppStore } from "../state/store";
import LeftToolbar, { leftToolbarWidth } from "./LeftToolbar";
import { getStageXY } from "../util";
import TopToolbar, { topToolbarHeight } from "./TopToolbar";
import Menu from "./Menu";
import Scrolls from "./Scrolls";
import SelectedFrame from "./SelectedFrame";
import Elements from "./Elements";
import FreeDrawing from "./FreeDrawing";
import ImagePreloader from "./ImagePreloader";
import { appSaveText } from "./TextElement";
import Summary from "./Summary";
import Solving from "./Solving";

const App = () => {
  const state = useAppStore();
  let downPos = null;
  let dragTarget = null;
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  // console.log(state);

  useLayoutEffect(() => {
    function updateSize() {
      state.setSize();
    }
    window.addEventListener("resize", updateSize);
    updateSize();
    return () => window.removeEventListener("resize", updateSize);
  }, []);

  useEffect(() => {
    containerRef.current.focus();
    state.checkAnnihilations();
  });

  if (state.width == 0) {
    return <div ref={containerRef} />;
  }

  const findOne = (id) => {
    const node = stageRef.current.findOne("#" + id);
    if (node) return node;
    // console.error(`id (${id}) not found`);
  };

  const findAll = (name) => {
    return stageRef.current.find("." + name);
  };

  const onMouseDown = (e) => {
    // console.log("stage down", e.target);
    appSaveText(state, findOne);
    if (e.target.name() == "color-drawer") return;
    if (state.fdMode) {
      const { x, y } = getStageXY(stageRef.current, state);
      const pos = stageRef.current.getPointerPosition();
      if (pos.x > leftToolbarWidth && pos.y < state.height - topToolbarHeight) {
        downPos = { x, y };
        findOne("fd-last-line").setAttrs({
          points: [x, y, x, y],
        });
      }
      return;
    }

    if (e.target.draggable() || e.target.parent?.draggable() || e.target.parent?.parent?.draggable()) {
      return;
    }
    downPos = getStageXY(stageRef.current, state);
    dragTarget = {
      type: "select-rect",
      nodes: ["select-rect"],
      downPos,
    };
    dragTarget.nodes = dragTarget.nodes.map((id) => stageRef.current.findOne("#" + id));
  };

  const onMouseMove = (e) => {
    e.evt.preventDefault();
    if (downPos && state.fdMode) {
      const { x, y } = getStageXY(stageRef.current, state);
      const lastLine = findOne("fd-last-line");
      lastLine.setAttrs({ points: [...lastLine.points(), x, y] });
      return;
    }

    if (!dragTarget) {
      return;
    }
    const movePos = getStageXY(stageRef.current, state);

    if ((downPos.x - movePos.x) ** 2 + (downPos.y - movePos.y) ** 2 < 25) {
      return;
    }
    switch (dragTarget.type) {
      case "select-rect":
        selectRectMove(dragTarget, downPos, movePos, state.origin.x, state.origin.y);
        findAll("popup-menu").forEach((node) => node.visible(false));
        break;
    }
  };

  const onMouseUp = (e) => {
    // console.log("stage up");
    e && e.evt.preventDefault();
    if (!downPos) return;

    if (state.fdMode) {
      const lastLine = findOne("fd-last-line");
      state.fdAddLine([...lastLine.getAttr("points")]);
      lastLine.setAttrs({ points: [] });
      downPos = null;
      return;
    }

    const upPos = getStageXY(stageRef.current, state);
    if ((downPos.x - upPos.x) ** 2 + (downPos.y - upPos.y) ** 2 < 25) {
      onMouseClick(e);
      downPos = null;
      dragTarget = null;
      return;
    }
    if (!dragTarget) {
      return;
    }
    switch (dragTarget.type) {
      case "select-rect":
        selectRectStop(dragTarget, upPos);
        findAll("popup-menu").forEach((node) => node.visible(true));
        state.select(downPos, upPos);
        break;
    }
    downPos = null;
    dragTarget = null;
  };

  const onMouseClick = (e) => {
    // console.log("stage click");
    if (state.selected.length > 0) state.clearSelect();
  };

  const onWheel = (e) => {
    e.evt.preventDefault();
    const { wheelDeltaX, shiftKey, ctrlKey } = e.evt;
    const sign = Math.sign(e.evt.wheelDelta);
    if (ctrlKey) {
      state.setScale(state.scale + 0.1 * sign);
    } else if (shiftKey || wheelDeltaX != 0) {
      state.setOffsetX(state.offset.x - 50 * sign);
    } else {
      state.setOffsetY(state.offset.y - 50 * sign);
    }
  };

  const onMouseLeave = (e) => {
    // console.log("Leave");
    onMouseUp();
  };

  // shapes menu events
  const shadow = null;
  const getShadow = (id) => {
    return shadow || findOne(id);
  };
  const dragShape = (e) => {
    return e.dataTransfer.types[0].replace("editable-text", "text");
  };
  const onDragOver = (e) => {
    e.preventDefault();
    const stage = stageRef.current;
    stage.setPointersPositions(e);
    const pos = getStageXY(stageRef.current, state);
    const x = pos.x + state.origin.x;
    const y = pos.y + state.origin.y;
    const shape = dragShape(e);
    switch (shape) {
      case "text":
        getShadow("shadow-text").setAttrs({ visible: true, x: x - 40, y: y - 20 });
        break;
      case "rect":
        getShadow("shadow-" + shape).setAttrs({
          visible: true,
          fill: null,
          stroke: "black",
          width: 120,
          height: 120,
          x: x - 60,
          y: y - 60,
        });
        break;
      case "ellipse":
        getShadow("shadow-" + shape).setAttrs({
          visible: true,
          fill: null,
          stroke: "black",
          width: 120,
          height: 120,
          x: x,
          y: y,
        });
        break;
      case "line":
        getShadow("shadow-line").setAttrs({
          visible: true,
          fill: null,
          stroke: "black",
          points: [-60, 0, 60, 0],
          x,
          y,
        });
        break;
    }
  };

  const onDrop = (e) => {
    const stage = stageRef.current;
    stage.setPointersPositions(e);
    const pos = getStageXY(stageRef.current, state);
    const x = pos.x;
    const y = pos.y;
    const shape = dragShape(e);
    switch (shape) {
      case "text":
        state.addElement({
          type: "text",
          x: x - 40,
          y: y - 20,
          text: "Text",
          fontSize: 36,
          width: 60,
          height: 36,
          newText: true,
          scale: 1.0,
        });
        getShadow("shadow-" + shape).visible(false);
        break;
      case "rect":
        state.addElement({ type: "rect", x: x - 60, y: y - 60, width: 120, height: 120, fill: false });
        getShadow("shadow-" + shape).visible(false);
        break;
      case "ellipse":
        state.addElement({ type: "ellipse", x: x, y: y, radiusX: 60, radiusY: 60, fill: false });
        getShadow("shadow-" + shape).visible(false);
        break;
      case "line":
        state.addElement({ type: "line", x: x - 60, y: y, x2: 120, y2: 0 });
        getShadow("shadow-" + shape).visible(false);
        break;
    }
  };

  return (
    <div
      ref={containerRef}
      onDragOver={onDragOver}
      onDrop={onDrop}
      tabIndex={1}
      className={"stage-wrap " + (state.fullscreen ? "stage-wrap-fullscreen" : "stage-wrap-default")}
    >
      <TopToolbar />
      <Stage
        ref={stageRef}
        width={state.width}
        height={state.height}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
        onTouchStart={(e) => {
          e.evt.preventDefault();
          onMouseDown(e);
        }}
        onTouchEnd={(e) => {
          e.evt.preventDefault();
          onMouseUp(e);
        }}
        onTouchMove={(e) => {
          e.evt.preventDefault();
          onMouseMove(e);
        }}
        onMouseLeave={onMouseLeave}
        onWheel={onWheel}
      >
        <Layer
          id="board-layer"
          offsetX={state.offset.x}
          offsetY={state.offset.y}
          scaleX={state.scale}
          scaleY={state.scale}
        >
          <Solving />
          <Elements />
          <SelectRect />
        </Layer>
        <Layer
          id="free-drawing-layer"
          offsetX={state.offset.x}
          offsetY={state.offset.y}
          scaleX={state.scale}
          scaleY={state.scale}
        >
          <FreeDrawing />
        </Layer>
        {state.imagesReady && (
          <Layer id="interface-layer">
            <LeftToolbar findOne={findOne} />
            <Menu />
            <Scrolls />
            <Summary />
            <SelectedFrame findOne={findOne} />
          </Layer>
        )}
      </Stage>
      <ImagePreloader />
    </div>
  );
};

export default App;
