import { Rect } from "react-konva";
import { useAppStore } from "../state/store";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const state = useAppStore();

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
    </>
  );
};

export default LeftToolbar;
