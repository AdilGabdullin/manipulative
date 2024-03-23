import { Arc, Circle, Image, Rect } from "react-konva";
import { cubeShift, cubeSize, gridStep, useAppStore } from "../state/store";
import { distance2, fractionMagnet, getStageXY, numberBetween } from "../util";
import { Fragment, useEffect, useState } from "react";
import ResizableIcon from "./ResizableIcon";
import LeftToolbarPatternBlocks from "./LeftToolbarPatternBlocks";
import { ballRadius, initialPositions, rekenrekHeight, rekenrekWidth, strokeWidth1 } from "./Rekenrek";

export const leftToolbarWidth = 180;
const ids = {
  geoboard: ["band-0", "band-1", "band-2", "band-3", "band-4", "band-5"],
  "linking-cubes": [
    "cube-0-up",
    "cube-0-right",
    "cube-1-up",
    "cube-1-right",
    "cube-2-up",
    "cube-2-right",
    "cube-3-up",
    "cube-3-right",
    "cube-4-up",
    "cube-4-right",
    "cube-5-up",
    "cube-5-right",
    "cube-6-up",
    "cube-6-right",
    "cube-7-up",
    "cube-7-right",
    "cube-8-up",
    "cube-8-right",
    "cube-9-up",
    "cube-9-right",
  ],
};

const colors = {
  geoboard: ["#d90080", "#900580", "#002a84", "#20a19a", "#fdd700", "#df040b"],
  "linking-cubes": [
    "#ffc000",
    "#e22da1",
    "#1b57c1",
    "#009bdd",
    "#20a19a",
    "#008f30",
    "#4ba82c",
    "#fdd700",
    "#df040b",
    "#8e8e8e",
  ],
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
  const { mode, origin, fullscreen } = state;
  const margin = fullscreen ? 20 : 10;
  const height = (i) => (state.height - margin * 17) / 10;
  const width = (i) => (height(i) * (i + 10)) / 10;
  const imageX = (i) => (leftToolbarWidth - width(i)) / 2;
  const imageY = (i) => margin * (i + 2) + height(i) * i;
  const fill = (i) => colors["rods"][i][0];
  const stroke = (i) => colors["rods"][i][1];

  const onDragStart = (e, i) => {
    state.clearSelect();
    e.target.visible(false);
    findOne("shadow-rect").setAttrs({
      visible: true,
      fill: fill(i),
      stroke: stroke(i),
      width: gridStep * (i + 1) - 2,
      height: gridStep - 2,
    });
  };

  const magnet = (i, { x, y }) => {
    x = x - (gridStep * (i + 1)) / 2;
    x -= x % (gridStep / 2);
    y = y - gridStep / 2;
    y -= y % (gridStep / 2);
    return { x: x + 1, y: y + 1 };
  };

  const onDragMove = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    findOne("shadow-rect").setAttrs({
      x: origin.x + x,
      y: origin.y + y,
    });
  };

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
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
      resizable: i == colors["rods"].length - 1,
    });
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} />
      {colors["rods"].map((color, i) => {
        const last = i == colors["rods"].length - 1;
        return (
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

            {last && (
              <ResizableIcon
                width={width(i) / 3}
                height={height(i) / 4}
                x={imageX(i) + width(i) - width(i) / 3 / 2}
                y={imageY(i) + height(i) / 2}
              />
            )}
          </Fragment>
        );
      })}
    </>
  );
};

const LeftToolbarCubes = ({ findOne }) => {
  const state = useAppStore();
  const { mode, origin, fullscreen, addElement } = state;
  const margin = fullscreen ? 20 : 10;
  const images = ids[mode].map((id) => document.getElementById(id));
  const baseHeight = ((state.height - margin * 12) / images.length) * 2;
  const baseWidth = (baseHeight / images[0].height) * images[0].width;
  const height = baseWidth;
  const width = baseWidth;
  const left = (leftToolbarWidth - width * 2) / 3;

  const imageX = (i) => left + (left + width) * (i % 2);
  const imageY = (i) => margin * (Math.floor(i / 2) + 1) + height * Math.floor(i / 2);

  const onDragStart = (e, i) => {
    state.clearSelect();
    e.target.visible(false);
    findOne("shadow-image").setAttrs({
      visible: true,
      image: images[i],
    });
  };

  const d = 49;
  const sens = 12;
  const magnet = (i, { x, y }) => {
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.rotation != i % 2) continue;
      if (i % 2 == 0) {
        if (numberBetween(x - d + 9, el.x - sens, el.x + sens) && numberBetween(y - d + 56, el.y - sens, el.y + sens)) {
          x = el.x + d - 9;
          y = el.y + d - 56;
        }
        if (numberBetween(x - d + 9, el.x - sens, el.x + sens) && numberBetween(y - d - 38, el.y - sens, el.y + sens)) {
          x = el.x + d - 9;
          y = el.y + d + 38;
        }
      } else {
        if (numberBetween(y - d + 9, el.y - sens, el.y + sens) && numberBetween(x - d + 56, el.x - sens, el.x + sens)) {
          y = el.y + d - 9;
          x = el.x + d - 56;
        }
        if (numberBetween(y - d + 9, el.y - sens, el.y + sens) && numberBetween(x - d - 38, el.x - sens, el.x + sens)) {
          y = el.y + d - 9;
          x = el.x + d + 38;
        }
      }
    }
    return { x, y };
  };

  const onDragMove = (e, i) => {
    if (mode == "linking-cubes") {
      const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
      findOne("shadow-image").setAttrs({
        x: origin.x + x - cubeSize / 2 - cubeShift,
        y: origin.y + y - cubeSize / 2 - cubeShift,
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
          x: x - cubeSize / 2,
          y: y - cubeSize / 2,
          width: gridStep - 5,
          height: gridStep,
          image: images[i],
          color: colors["linking-cubes"][Math.floor(i / 2)],
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
        <Image key={i} x={imageX(i)} y={imageY(i)} image={image} width={width} height={height} />
      ))}
      {images.map((image, i) => (
        <Image
          key={i}
          x={imageX(i)}
          y={imageY(i)}
          image={image}
          width={width}
          height={height}
          draggable
          onDragStart={(e) => onDragStart(e, i)}
          onDragMove={(e) => onDragMove(e, i)}
          onDragEnd={(e) => onDragEnd(e, i)}
          onPointerClick={(e) => {
            findOne("shadow-image").setAttrs({ visible: false });
            addElement({
              type: "cube",
              rotation: i % 2,
              width: gridStep - 5,
              height: gridStep,
              image: images[i],
              color: colors["linking-cubes"][Math.floor(i / 2)],
            });
          }}
        />
      ))}
    </>
  );
};

const LeftToolbarGeoboard = ({ findOne }) => {
  const state = useAppStore();
  const { mode, origin } = state;
  const images = ids[mode].map((id) => document.getElementById(id));
  const width = 110;
  const height = (width / images[0].width) * images[0].height;
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

  const sens = 12;
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

  const onDragMove = (e, i) => {};

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    const closest = closestGrid({ x, y });
    state.addBand(closest.x, closest.y, colors[mode][i]);
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
        <Image key={i} x={imageX(i)} y={imageY(i)} image={image} width={width} height={height} />
      ))}
      {images.map((image, i) => (
        <Image
          key={i}
          x={imageX(i)}
          y={imageY(i)}
          image={image}
          width={width}
          height={height}
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
  const { origin } = state;
  const margin = 20;
  const height = (i) => (state.height - margin * 12) / 10;
  const imageX = (i) => leftToolbarWidth / 2;
  const imageY = (i) => margin * (i + 2) + height(i) * (i + 1);
  const angle = [360, 180, 120, 90, 72, 60, 45, 36, 30];
  const rotation = (i) => (180 - angle[i]) / 2;

  let shadowNode = null;

  const onDragStart = (e, i) => {
    state.clearSelect();
    e.target.visible(false);
    if (i > 0) {
      shadowNode = findOne("shadow-arc");
      shadowNode.setAttrs({
        visible: true,
        innerRadius: 0,
        outerRadius: gridStep * 2,
        angle: angle[i],
        rotation: rotation(i),
        fill: colors["fractions"][i][0],
        stroke: colors["fractions"][i][1],
      });
    } else {
      shadowNode = findOne("shadow-circle");
      shadowNode.setAttrs({
        visible: true,
        radius: gridStep * 2,
        fill: colors["fractions"][i][0],
        stroke: colors["fractions"][i][1],
      });
    }
  };

  const magnet = (i, { x, y }) => {
    shadowNode = findOne("shadow-arc");
    const node = shadowNode;
    let magnet = null;
    for (const id in state.elements) {
      const el = state.elements[id];
      if (el.id == node.id()) continue;
      magnet = fractionMagnet({ x, y }, el, angle[i], origin) || magnet;
    }
    return magnet || { x: x + origin.x, y: y + origin.y, rotation: rotation(i) };
  };

  const onDragMove = (e, i) => {
    const { x, y, rotation } = magnet(i, getStageXY(e.target.getStage(), state));

    findOne(i > 0 ? "shadow-arc" : "shadow-circle").setAttrs({
      x: x,
      y: y,
      rotation,
    });
  };

  const onDragEnd = (e, i) => {
    const { x, y } = magnet(i, getStageXY(e.target.getStage(), state));
    e.target.setAttrs({ x: imageX(i), y: imageY(i), visible: true });
    const shadow = findOne(i > 0 ? "shadow-arc" : "shadow-circle");
    shadow.setAttrs({ visible: false });
    state.addElement({
      type: "fraction",
      x: x - origin.x,
      y: y - origin.y,
      innerRadius: 0,
      outerRadius: height(i) * 2,
      angle: angle[i],
      rotation: shadow.getAttr("rotation"),
      fill: state.fill,
      fillColor: colors["fractions"][i][0],
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
                angle={angle[i]}
                rotation={rotation(i)}
                fill={color[0]}
                stroke={color[1]}
                strokeWidth={2}
                lineJoin="round"
                lineCap="round"
              />
              <Arc
                x={imageX(i)}
                y={imageY(i)}
                innerRadius={0}
                outerRadius={height(i)}
                angle={angle[i]}
                rotation={rotation(i)}
                fill={color[0]}
                stroke={color[1]}
                strokeWidth={2}
                lineJoin="round"
                lineCap="round"
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

const LeftToolbarRekenreks = ({ findOne }) => {
  const state = useAppStore();

  useEffect(() => onPointerClick(), []);

  const onPointerClick = (e) => {
    const x = -rekenrekWidth / 2;
    const y = -rekenrekHeight / 2;
    state.addElement({
      type: "rekenrek",
      x: x,
      y: y,
      width: rekenrekWidth,
      height: rekenrekHeight,
      positions: initialPositions(x),
    });
  };

  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={state.height} onPointerClick={onPointerClick} />
    </>
  );
};

const LeftToolbar = ({ findOne }) => {
  const state = useAppStore();
  switch (state.mode) {
    case "geoboard":
      return <LeftToolbarGeoboard findOne={findOne} />;
      break;
    case "linking-cubes":
      return <LeftToolbarCubes findOne={findOne} />;
      break;
    case "rods":
      return <LeftToolbarRods findOne={findOne} />;
      break;
    case "fractions":
      return <LeftToolbarFractions findOne={findOne} />;
      break;
    case "pattern-blocks":
      return <LeftToolbarPatternBlocks findOne={findOne} />;
      break;
    case "rekenreks":
      return <LeftToolbarRekenreks findOne={findOne} />;
      break;
  }
};

export default LeftToolbar;
