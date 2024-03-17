import { Line, Text } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { cos, sin } from "../util";

const FractionLabel = (props) => {
  const { x, y, angle, rotation, onPointerClick } = props;
  const state = useAppStore();
  const { labelMode, origin } = state;

  const alpha = rotation + angle / 2;
  const c = cos(alpha);
  const s = sin(alpha);
  const x0 = origin.x + x;
  const y0 = origin.y + y;

  const color = angle == 90 ? "#666560" : "white";
  const commonProps = {
    name: "drag-hidden",
    fill: color,
    stroke: color,
    fontFamily: "Calibri",
    fontSize: 25,
    onPointerClick: onPointerClick,
  };

  if (labelMode == "Fractions") {
    if (angle == 360) {
      return <Text x={x0} y={y0} text={"1"} offsetX={6} offsetY={11} {...commonProps} />;
    }

    const r1 = gridStep * 0.8;
    const r2 = gridStep * 1.2;

    return (
      <>
        <Text
          x={x0 + c * r1}
          y={y0 + s * r1}
          text={"1"}
          rotation={alpha - 90}
          offsetX={7}
          offsetY={0}
          {...commonProps}
        />
        <Line
          name="drag-hidden"
          points={[
            x0 + cos(alpha - 10) * r2,
            y0 + sin(alpha - 10) * r2,
            x0 + cos(alpha + 10) * r2,
            y0 + sin(alpha + 10) * r2,
          ]}
          stroke={color}
        />
        <Text
          x={x0 + c * r2}
          y={y0 + s * r2}
          text={360 / angle}
          rotation={alpha - 90}
          offsetX={7 + (angle <= 36 ? 6 : 0)}
          {...commonProps}
        />
      </>
    );
  }
  return <></>;
};

export default FractionLabel;
