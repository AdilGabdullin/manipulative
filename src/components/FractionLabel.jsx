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

  if (labelMode == "Black") {
    return null;
  }

  if (angle == 360) {
    if (labelMode == "Percents") {
      return <Text x={x0} y={y0} text={"100%"} offsetX={26} offsetY={11} {...commonProps} />;
    } else if (labelMode == "Decimals" || labelMode == "Fractions") {
      return <Text x={x0} y={y0} text={"1"} offsetX={6} offsetY={11} {...commonProps} />;
    }
  }

  if (labelMode == "Fractions") {
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

  if (labelMode == "Decimals") {
    const r = gridStep;
    const text = {
      120: "0.3",
      60: "0.16",
      30: "0.083",
    };
    const offsetX = {
      180: 15,
      120: 15,
      90: 25,
      72: 15,
      60: 25,
      45: 28,
      36: 15,
      30: 24,
    };
    const offsetY = {
      45: -20,
      30: -30,
    };
    const lineOffsetX = {
      120: -4,
      60: -7,
      30: -15,
    };
    return (
      <>
        <Text
          x={x0 + c * r}
          y={y0 + s * r}
          text={text[angle] || angle / 360}
          rotation={alpha - 90}
          offsetX={offsetX[angle]}
          offsetY={offsetY[angle] || 0}
          {...commonProps}
          fontSize={angle == 30 ? 22 : 25}
        />
        {!!lineOffsetX[angle] && (
          <Text
            x={x0 + c * r}
            y={y0 + s * r}
            text="‾"
            rotation={alpha - 90}
            offsetX={lineOffsetX[angle]}
            offsetY={offsetY[angle] + 2 || 2}
            {...commonProps}
            fontSize={angle == 30 ? 22 : 25}
          />
        )}
      </>
    );
  }

  if (labelMode == "Percents") {
    const r = gridStep;
    const text = {
      120: "33.3%",
      60: "16.6%",
      30: "8.3%",
    };
    const offsetX = {
      180: 15 + 5,
      120: 30,
      90: 20,
      72: 15 + 5,
      60: 25,
      45: 28,
      36: 15 + 5,
      30: 20,
    };
    const offsetY = {
      45: -20,
      30: -30,
    };
    const lineOffsetX = {
      120: -1,
      60: -7,
      30: 3,
    };
    return (
      <>
        <Text
          x={x0 + c * r}
          y={y0 + s * r}
          text={text[angle] || (angle / 360) * 100 + "%"}
          rotation={alpha - 90}
          offsetX={offsetX[angle]}
          offsetY={offsetY[angle] || 0}
          {...commonProps}
          fontSize={angle == 30 ? 22 : 25}
        />
        {!!lineOffsetX[angle] && (
          <Text
            x={x0 + c * r}
            y={y0 + s * r}
            text="‾"
            rotation={alpha - 90}
            offsetX={lineOffsetX[angle]}
            offsetY={offsetY[angle] + 2 || 2}
            {...commonProps}
            fontSize={angle == 30 ? 22 : 25}
          />
        )}
      </>
    );
  }
  return <></>;
};

export default FractionLabel;
