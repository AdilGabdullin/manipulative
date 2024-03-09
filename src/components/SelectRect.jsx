import { Rect } from "react-konva";

const SelectRect = () => {
  return <Rect id="select-rect" visible={false} stroke="#03a5fc" fill="#03a5fc" opacity={0.5} />;
};

export function selectRectMove(dragTarget, downPos, movePos, originX, originY) {
  dragTarget.nodes[0].setAttrs({
    x: downPos.x + originX,
    y: downPos.y + originY,
    width: movePos.x - downPos.x,
    height: movePos.y - downPos.y,
    visible: true,
  });
}

export function selectRectStop(dragTarget, upPos) {
  dragTarget.nodes[0].visible(false);
}

export default SelectRect;
