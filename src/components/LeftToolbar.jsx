import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import Arrow from "./toolbar/Arrow";
import OpenMarker from "./toolbar/OpenMarker";
import NumberLine from "./toolbar/NumberLine";
import { defaultHeight } from "./NumberLine";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const { height } = useAppStore();
  if (!height) return null;

  const left = 25;
  const width = leftToolbarWidth - 2 * left;
  const shapes = [];
  const heightTotal = width + width * 0.9 + width / 10;
  const options = [
    { Component: Arrow, x: left, width: width, height: width / 2, isBlue: true },
    { Component: Arrow, x: left, width: width, height: width / 2, isBlue: false },
    { Component: OpenMarker, x: left + width / 4, width: width / 2, height: width * 0.9 },
    { Component: NumberLine, x: left, width: width, height: defaultHeight },
  ];

  const top = (height - heightTotal) / 5;
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
