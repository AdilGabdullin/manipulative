import { Stage, Layer, Line } from "react-konva";
import { useEffect, useLayoutEffect, useRef } from "react";
import Grid from "./Grid";
import SelectRect, { selectRectMove, selectRectStop } from "./SelectRect";
import { useAppStore } from "../state/store";
import GeoboardBand, {
  Angles,
  bandPointMove,
  bandPointRadius,
  bandPointSearch,
  bandSideMove,
  bandSideSearch,
} from "./GeoboardBand";
import LeftToolbar, { leftToolbarWidth } from "./LeftToolbar";
import { SEARCH_THRESHOLD, flattenPoints, getStageXY, pointsIsClose } from "../util";
import BottomToolbar, { bottomToolbarHeight } from "./BottomToolbar";
import BottomMenu from "./BottomMenu";
import Scrolls from "./Scrolls";
import SelectedFrame from "./SelectedFrame";
import Elements from "./Elements";
import FreeDrawing from "./FreeDrawing";

const App = () => {
  const state = useAppStore();
  let downPos = null;
  let dragTarget = null;
  const stageRef = useRef(null);
  const containerRef = useRef(null);

  // console.log(
  //   state.elements,
  //   state.selected
  // );

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
  });

  const magnetSearch = (movePos) => {
    return state.grid.find((gridItem) => pointsIsClose(movePos, gridItem)) || movePos;
  };

  const findOne = (id) => {
    const node = stageRef.current.findOne("#" + id);
    if (node) return node;
    console.error(`id (${id}) not found`);
  };

  const findAll = (name) => {
    return stageRef.current.find("." + name);
  };

  const onMouseDown = (e) => {
    // console.log("stage down");
    if (state.fdMode) {
      const { x, y } = getStageXY(stageRef.current, state);
      const pos = stageRef.current.getPointerPosition();
      if (pos.x > leftToolbarWidth && pos.y < state.height - bottomToolbarHeight) {
        downPos = { x, y };
        findOne("fd-last-line").setAttrs({
          points: [x, y, x, y],
        });
      }
      return;
    }

    if (e.target.draggable()) {
      return;
    }
    downPos = getStageXY(stageRef.current, state);
    dragTarget = bandPointSearch(state, downPos) ||
      bandSideSearch(state, downPos) || {
        type: "select-rect",
        nodes: ["select-rect"],
        downPos,
      };
    dragTarget.nodes = dragTarget.nodes.map((id) => stageRef.current.findOne("#" + id));
    if (dragTarget.type != "select-rect") {
      findAll("angle-measure").forEach((node) => node.visible(false));
    }
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
    const movePos = { ...magnetSearch(getStageXY(stageRef.current, state)) };

    if ((downPos.x - movePos.x) ** 2 + (downPos.y - movePos.y) ** 2 < 25) {
      return;
    }
    switch (dragTarget.type) {
      case "band-point":
        bandPointMove(dragTarget, movePos, state.origin.x, state.origin.y);
        break;
      case "band-side":
        bandSideMove(dragTarget, movePos, state.origin);
        break;
      case "select-rect":
        selectRectMove(dragTarget, downPos, movePos, state.origin.x, state.origin.y);
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
      case "band-point":
        state.relocateBandPoint(dragTarget, magnetSearch(upPos));
        break;
      case "band-side":
        state.relocateBandSide(dragTarget, magnetSearch(upPos));
        break;
      case "select-rect":
        selectRectStop(dragTarget, upPos);
        state.select(downPos, upPos);
        break;
    }
    if (dragTarget.type != "select-rect") {
      findAll("angle-measure").forEach((node) => node.visible(true));
    }
    downPos = null;
    dragTarget = null;
  };

  const onMouseClick = (e) => {
    console.log("stage click");
    const pos = getStageXY(stageRef.current, state);
    for (const band of state.geoboardBands) {
      for (const point of band.points) {
        if (pointsIsClose(point, pos, bandPointRadius + SEARCH_THRESHOLD)) {
          state.selectIds([point.id], point.locked);
          return;
        }
      }
    }
    if (state.selected.length > 0) state.clearSelect();
  };

  const onWheel = (e) => {
    const { wheelDeltaX, shiftKey } = e.evt;
    const sign = Math.sign(e.evt.wheelDelta);
    if (shiftKey || wheelDeltaX != 0) {
      state.setOffsetX(state.offset.x - 50 * sign);
    } else {
      state.setOffsetY(state.offset.y - 50 * sign);
    }
  };

  const onMouseLeave = (e) => {
    console.log("Leave");
    onMouseUp();
  };

  if (state.width == 0) {
    return <div ref={containerRef} />;
  }

  return (
    <div
      ref={containerRef}
      tabIndex={1}
      className={"stage-wrap " + (state.fullscreen ? "stage-wrap-fullscreen" : "stage-wrap-default")}
    >
      <Stage
        ref={stageRef}
        width={state.width}
        height={state.height}
        onMouseDown={onMouseDown}
        onMouseUp={onMouseUp}
        onMouseMove={onMouseMove}
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
          {state.mode == "geoboard" && (
            <>
              {state.geoboardBands.map((band) => (
                <GeoboardBand key={band.id} {...band} findOne={findOne} />
              ))}
              <Grid />
              {state.geoboardBands.map((band) => (
                <Angles key={band.id} {...band} />
              ))}
            </>
          )}
          {state.mode != "geoboard" && <Elements />}
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
        <Layer id="interface-layer">
          <LeftToolbar findOne={findOne} />
          <BottomMenu />
          <Scrolls />
          <SelectedFrame findOne={findOne} />
        </Layer>
      </Stage>
      <BottomToolbar />
    </div>
  );
};

export default App;
