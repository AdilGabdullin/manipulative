import { Group, Rect } from "react-konva";
import { leftToolbarWidth } from "../LeftToolbar";
import { useAppStore } from "../../state/store";
import { sarHeight, sarWidth, arcProps, arrowMagnet } from "../RectShape";
import { getStageXY } from "../../util";
import { useRef } from "react";

const RectShape = (props) => {
  const state = useAppStore();
  const { addElement, origin } = state;
  const { x, y, width, height, isBlue } = props;

  let shadow = null;
  const getShadow = (e) => {
    return shadow || (shadow = e.target.getStage().findOne("#shadow-rect-shape-" + (isBlue ? "blue" : "red")));
  };

  const group = useRef();
  const toolbarShadow = useRef();
  const rect = useRef();

  const onDragStart = (e) => {
    getShadow(e).setAttrs({ visible: true });
    toolbarShadow.current.visible(true);
  };

  const onDragMove = (e) => {
    const target = e.target;
    const pos = target.getStage().getPointerPosition();
    const width = sarWidth;
    const height = sarHeight;

    const shadow = getShadow(e);
    if (pos.x > leftToolbarWidth) {
      let stagePos = getStageXY(e.target.getStage(), state);
      stagePos = arrowMagnet({ x: stagePos.x - width / 2, y: stagePos.y - height / 2, width, height }, state);
      target.visible(false);

      shadow.setAttrs({
        x: origin.x + stagePos.x,
        y: origin.y + stagePos.y,
        width: stagePos.width,
        visible: true,
      });
      shadow.children[0].setAttrs(arcProps({ ...props, width: stagePos.width, height }));
    } else {
      target.visible(true);
      shadow.setAttrs({
        visible: false,
      });
    }
  };

  const onDragEnd = (e) => {
    const width = sarWidth;
    const height = sarHeight;
    let stagePos = getStageXY(e.target.getStage(), state);
    stagePos = arrowMagnet({ x: stagePos.x - width / 2, y: stagePos.y - height / 2, width, height }, state);
    e.target.setAttrs({ x, y, visible: true });
    toolbarShadow.current.visible(false);
    getShadow(e).setAttrs({
      visible: false,
    });
    if (e.target.getStage().getPointerPosition().x > leftToolbarWidth) {
      addElement({
        type: "rect-shape",
        width: stagePos.width,
        height,
        isBlue: isBlue,
        x: stagePos.x,
        y: stagePos.y,
        text: stagePos.text,
      });
    }
  };

  const onPointerClick = (e) => {
    const others = [...Object.values(state.elements)].filter((el) => el.type == "rect-shape");
    const last = others[others.length - 1];
    if (last) {
      addElement({
        ...last,
        isBlue: isBlue,
        x: last.x + last.width,
      });
    }
  };

  return (
    <>
      <Group ref={toolbarShadow} x={x} y={y} visible={false}>
        <Rect {...arcProps(props)} />
      </Group>
      <Group
        ref={group}
        x={x}
        y={y}
        draggable
        onDragStart={onDragStart}
        onDragMove={onDragMove}
        onDragEnd={onDragEnd}
        onPointerClick={onPointerClick}
      >
        <Rect {...arcProps(props)} />
        <Rect ref={rect} x={0} y={0} width={width} height={height} />
      </Group>
    </>
  );
};

export default RectShape;
