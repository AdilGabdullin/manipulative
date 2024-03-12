import { Arc, Circle, Image, Rect } from "react-konva";
import { gridStep, useAppStore } from "../state/store";
import { distance2, getStageXY, numberBetween } from "../util";
import { Fragment, useState } from "react";

export const leftToolbarWidth = 180;
const ids = {
  geoboard: ["band-0", "band-1", "band-2", "band-3", "band-4", "band-5"],
  "linking-cubes": ["cube-0-up", "cube-0-right"],
};

const colors = {
  geoboard: ["#d90080", "#900580", "#002a84", "#20a19a", "#fdd700", "#df040b"],
  rods: [
    ["#efefef", "#bdbdbd"],
    ["#f44336", "#d32f2f"],
    ["#8bc34a", "#689f38"],
    ["#9c27b0", "#7b1fa2"],
    ["#ffeb3b", "#fdd835"],
    ["#009688", "#00796b"],
    ["#616161", "#2b2e31"],
    ["#795548", "#5d4037"],
    ["#3f51b5", "#303f9f"],
    ["#ff5722", "#e64a19"],
    ["#e91e63", "#c2185b"],
  ],
  fractions: [
    ["#f44336", "#d73130"],
    ["#f06292", "#e92467"],
    ["#ff9800", "#f57f07"],
    ["#ffeb3b", "#fed936"],
    ["#4caf50", "#388f3d"],
    ["#03a9f4", "#0a8cd2"],
    ["#3f51b5", "#3240a0"],
    ["#9c27b0", "#7d22a3"],
    ["#616161", "#2b2e31"],
  ],
};

const LeftToolbarRods = ({ findOne }) => {
  const state = useAppStore();
  const { mode, origin } = state;
  const margin = 20;
  const height = (i) => (state.height - margin * 17) / 10;
  const width = (i) => (height(i) * (i + 10)) / 10;
  const imageX = (i) => (leftToolbarWidth - width(i)) / 2;
  const imageY = (i) => margin * (i + 2) + height(i) * i;
  const fill = (i) => colors["rods"][i][0];
  const stroke = (i) => colors["rods"][i][1];

  const onDragStart = (e, i) => {
    state.clearSelect();
    if (mode == "rods") {
      e.target.visible(false);
      findOne("shadow-rect").setAttrs({
        visible: true,
        fill: fill(i),
        stroke: stroke(i),
        width: gridStep * (i + 1) - 2,
        height: gridStep - 2,
      });
    }
  };

  const magnet = (i, { x, y }) => {
    x = x - (gridStep * (i + 1)) / 2;
    x -= x % (gridStep / 2);
    y = y - gridStep / 2;
    y -= y % (gridStep / 2);
    return { x: x + 1, y: y + 1 };
  };

  const onDragMove = (e, i) => {
    if (mode == "rods") {
      const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
      findOne("shadow-rect").setAttrs({
        x: origin.x + x,
        y: origin.y + y,
      });
    }
  };

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    switch (mode) {
      case "rods":
        findOne("shadow-rect").setAttrs({ visible: false });
        state.addElement({
          type: "rod",
          x: x,
          y: y,
          width: gridStep * (i + 1) - 2,
          height: gridStep - 2,
          fill: state.fill,
          stroke: stroke(i),
          fillColor: fill(i),
        });
        break;
    }
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      {colors["rods"].map((color, i) => (
        <Fragment key={i}>
          <Rect x={imageX(i)} y={imageY(i)} width={width(i)} height={height(i)} fill={color[0]} stroke={color[1]} />
          <Rect
            x={imageX(i)}
            y={imageY(i)}
            width={width(i)}
            height={height(i)}
            fill={color[0]}
            stroke={color[1]}
            draggable
            onDragStart={(e) => onDragStart(e, i)}
            onDragMove={(e) => onDragMove(e, i)}
            onDragEnd={(e) => onDragEnd(e, i)}
          />
        </Fragment>
      ))}
    </>
  );
};

const LeftToolbarImages = ({ findOne }) => {
  const state = useAppStore();
  const { mode, origin } = state;
  const images = ids[mode].map((id) => document.getElementById(id));
  const width = images[0].width * 0.75;
  const height = images[0].height * 0.75;
  const left = (leftToolbarWidth - width) / 2;
  const margin = (state.height - images.length * height) / (images.length + 1);

  const imageX = (i) => left;
  const imageY = (i) => margin * (i + 1) + height * i;

  const onDragStart = (e, i) => {
    state.clearSelect();
    if (mode == "linking-cubes") {
      e.target.visible(false);
      findOne("shadow-image").setAttrs({
        visible: true,
        image: images[i],
      });
    }
  };

  const sens = 10;
  const magnet = (i, { x, y }) => {
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.rotation != i) continue;
      if (i % 2 == 0) {
        if (numberBetween(x - 26, el.x - sens, el.x + sens) && numberBetween(y - 26 + 50, el.y - sens, el.y + sens)) {
          x = el.x + 26;
          y = el.y + 26 - 50;
        }
        if (numberBetween(x - 26, el.x - sens, el.x + sens) && numberBetween(y - 26 - 50, el.y - sens, el.y + sens)) {
          x = el.x + 26;
          y = el.y + 26 + 50;
        }
      } else {
        if (numberBetween(y - 26, el.y - sens, el.y + sens) && numberBetween(x - 26 + 50, el.x - sens, el.x + sens)) {
          y = el.y + 26;
          x = el.x + 26 - 50;
        }
        if (numberBetween(y - 26, el.y - sens, el.y + sens) && numberBetween(x - 26 - 50, el.x - sens, el.x + sens)) {
          y = el.y + 26;
          x = el.x + 26 + 50;
        }
      }
    }
    return { x, y };
  };

  const onDragMove = (e, i) => {
    if (mode == "linking-cubes") {
      const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
      findOne("shadow-image").setAttrs({
        x: origin.x + x - 26,
        y: origin.y + y - 26,
      });
    }
  };

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    switch (mode) {
      case "geoboard":
        const closest = closestGrid({ x, y });
        state.addBand(closest.x, closest.y, colors[mode][i]);
        break;
      case "linking-cubes":
        findOne("shadow-image").setAttrs({ visible: false });
        state.addElement({
          type: "cube",
          rotation: i % 2,
          x: x - 26,
          y: y - 26,
          width: 110,
          height: (images[i].height * 110) / images[i].width,
          // color: colors[mode][i],
          image: images[i],
        });
        break;
    }
  };

  const closestGrid = (movePos) => {
    const grid = state.grid;
    let closest = grid[0];
    let d = distance2(closest, movePos);
    for (let i = 0; i < grid.length; i++) {
      if (distance2(grid[i], movePos) < d) {
        d = distance2(grid[i], movePos);
        closest = grid[i];
      }
    }
    return closest;
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      {images.map((image, i) => (
        <Image
          key={i}
          x={imageX(i)}
          y={imageY(i)}
          image={image}
          width={110}
          height={(images[i].height * 110) / images[i].width}
        />
      ))}
      {images.map((image, i) => (
        <Image
          key={i}
          x={imageX(i)}
          y={imageY(i)}
          image={image}
          width={110}
          height={(images[i].height * 110) / images[i].width}
          draggable
          onDragStart={(e) => onDragStart(e, i)}
          onDragMove={(e) => onDragMove(e, i)}
          onDragEnd={(e) => onDragEnd(e, i)}
        />
      ))}
    </>
  );
};

const LeftToolbarFractions = ({ findOne }) => {
  const state = useAppStore();
  const { mode, origin } = state;
  const margin = 20;
  const height = (i) => (state.height - margin * 12) / 10;
  const imageX = (i) => leftToolbarWidth / 2;
  const imageY = (i) => margin * (i + 2) + height(i) * (i + 1);
  const fill = (i) => colors["fractions"][i][0];
  const stroke = (i) => colors["fractions"][i][1];

  const onDragStart = (e, i) => {
    state.clearSelect();
    e.target.visible(false);
    if (i > 0) {
      findOne("shadow-arc").setAttrs({
        visible: true,
        innerRadius: 0,
        outerRadius: height(i) * 2,
        angle: 360 / (i + 1),
        rotation: (180 - 360 / (i + 1)) / 2,
        fill: colors["fractions"][i][0],
        stroke: colors["fractions"][i][1],
      });
    } else {
      findOne("shadow-circle").setAttrs({
        visible: true,
        radius: height(i) * 2,
        fill: colors["fractions"][i][0],
        stroke: colors["fractions"][i][1],
      });
    }
  };

  const magnet = (i, { x, y }) => {
    return { x, y: y - height(0) };
    x = x - (gridStep * (i + 1)) / 2;
    x -= x % (gridStep / 2);
    y = y - gridStep / 2;
    y -= y % (gridStep / 2);
    return { x: x + 1, y: y + 1 };
  };

  const onDragMove = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    findOne(i > 0 ? "shadow-arc" : "shadow-circle").setAttrs({
      x: origin.x + x,
      y: origin.y + y,
    });
  };

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    findOne(i > 0 ? "shadow-arc" : "shadow-circle").setAttrs({ visible: false });
    state.addElement({
      type: "fraction",
      x: x,
      y: y,
      innerRadius: 0,
      outerRadius: height(i) * 2,
      angle: 360 / (i + 1),
      rotation: (180 - 360 / (i + 1)) / 2,
      fill: colors["fractions"][i][0],
      stroke: colors["fractions"][i][1],
    });
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      <Circle
        x={imageX(0)}
        y={margin * 2 + height(0)}
        radius={height(0)}
        fill={colors["fractions"][0][0]}
        stroke={colors["fractions"][0][1]}
        strokeWidth={2}
      />
      <Circle
        x={imageX(0)}
        y={margin * 2 + height(0)}
        radius={height(0)}
        fill={colors["fractions"][0][0]}
        stroke={colors["fractions"][0][1]}
        strokeWidth={2}
        draggable
        onDragStart={(e) => onDragStart(e, 0)}
        onDragMove={(e) => onDragMove(e, 0)}
        onDragEnd={(e) => onDragEnd(e, 0)}
      />
      {colors["fractions"].map(
        (color, i) =>
          i > 0 && (
            <Fragment key={i}>
              <Arc
                x={imageX(i)}
                y={imageY(i)}
                innerRadius={0}
                outerRadius={height(i)}
                angle={360 / (i + 1)}
                rotation={(180 - 360 / (i + 1)) / 2}
                fill={color[0]}
                stroke={color[1]}
                strokeWidth={2}
              />
              <Arc
                x={imageX(i)}
                y={imageY(i)}
                innerRadius={0}
                outerRadius={height(i)}
                angle={360 / (i + 1)}
                rotation={(180 - 360 / (i + 1)) / 2}
                fill={color[0]}
                stroke={color[1]}
                strokeWidth={2}
                draggable
                onDragStart={(e) => onDragStart(e, i)}
                onDragMove={(e) => onDragMove(e, i)}
                onDragEnd={(e) => onDragEnd(e, i)}
              />
            </Fragment>
          )
      )}
    </>
  );
};

const LeftToolbar = (props) => {
  const state = useAppStore();
  switch (state.mode) {
    case "geoboard":
    case "linking-cubes":
      return <LeftToolbarImages {...props} />;
      break;
    case "rods":
      return <LeftToolbarRods {...props} />;
      break;
    case "fractions":
      return <LeftToolbarFractions {...props} />;
      break;
  }
};

export default LeftToolbar;
