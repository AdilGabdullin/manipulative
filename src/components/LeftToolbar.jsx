import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import Arrow from "./toolbar/Arrow";
import OpenMarker, { omHeight, omWidth } from "./toolbar/OpenMarker";
import NumberLine from "./toolbar/NumberLine";
import { nlHeight } from "./NumberLine";
import { sum } from "../util";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const { height } = useAppStore();
  if (!height) return null;

  const left = 25;
  const width = leftToolbarWidth - 2 * left;
  const shapes = [];
  const options = [
    { Component: Arrow, x: left, width: width, height: width / 2, isBlue: true },
    { Component: Arrow, x: left, width: width, height: width / 2, isBlue: false },
    { Component: OpenMarker, x: (leftToolbarWidth - omWidth) / 2, width: omWidth, height: omHeight },
    { Component: NumberLine, x: left, width: width, height: nlHeight },
  ];

  const top = (height - sum(options.map((o) => o.height))) / (options.length + 1);
  let y = top;
  for (const option of options) {
    option.y = y;
    y += option.height + top;
  }

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={height} />
      {shapes}

      {options.map(({ Component, ...props }, i) => (
        <Component key={i} {...props} />
      ))}
    </>
  );
};

export default LeftToolbar;
