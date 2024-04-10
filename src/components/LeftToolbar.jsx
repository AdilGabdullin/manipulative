import { Group, Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { getStageXY, sum } from "../util";
import { Tile, baseSize, dynamicProps } from "./Tile";
import { useRef } from "react";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const { height } = useAppStore();
  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={height} />
      {createTiles(height, tileRows())}
    </>
  );
};

const ShadowedTile = ({ x, y, text, width, height, base }) => {
  const state = useAppStore();
  const { origin } = state;
  const shadow = useRef();

  let boardShadow = null;
  const getBoardShadow = (e) => {
    return boardShadow || (boardShadow = e.target.getStage().findOne("#shadow-tile"));
  };

  const onDragStart = (e) => {
    shadow.current.visible(true);
    const group = getBoardShadow(e);
    const [rect, tileText] = group.children;
    const dynamic = dynamicProps({ text, width: width * baseSize, height: height * baseSize, visible: true });
    rect.setAttrs(dynamic.rect);
    tileText.setAttrs(dynamic.text);
  };

  const onDragMove = (e) => {
    const target = e.target;
    const out = outOfToolbar(e);
    target.visible(!out);
    const { x, y } = getStageXY(target.getStage(), state);
    const w = width * baseSize;
    const h = height * baseSize;
    const dynamic = dynamicProps({ x: x - w / 2, y: y - h / 2, width: w, height: h, visible: true });
    getBoardShadow(e).setAttrs({ x: origin.x + dynamic.group.x, y: origin.y + dynamic.group.y, visible: out });
  };
  const onDragEnd = (e) => {
    const target = e.target;
    const out = outOfToolbar(e);
    target.visible(!out);
    shadow.current.visible(false);
    target.setAttrs({ x, y, visible: true });
    getBoardShadow(e).visible(false);
  };
  return (
    <>
      <Group ref={shadow} visible={false}>
        <Tile x={x} y={y} width={width * base} height={height * base} text={text} />
      </Group>
      <Group x={x} y={y} draggable onDragStart={onDragStart} onDragMove={onDragMove} onDragEnd={onDragEnd}>
        <Tile width={width * base} height={height * base} text={text} />
      </Group>
    </>
  );
};

function createTiles(height, rows) {
  const base = leftToolbarWidth / 5.5;
  const totalHeight = sum(rows.map((row) => row[0].height));
  const gap = (height - totalHeight * base) / (rows.length + 1);
  let y = gap;
  const tiles = [];
  for (const [i, row] of Object.entries(rows)) {
    if (row.length == 1) {
      const width = row[0].width;
      tiles.push(<ShadowedTile key={i * 2} {...row[0]} base={base} x={(leftToolbarWidth - width * base) / 2} y={y} />);
    } else {
      const width0 = row[0].width;
      const width1 = row[1].width;
      const left = (leftToolbarWidth - (width0 + width1 + 0.5) * base) / 2;
      tiles.push(<ShadowedTile key={i * 2} {...row[0]} base={base} x={left} y={y} />);
      tiles.push(<ShadowedTile key={i * 2 + 1} {...row[1]} base={base} x={left + (width0 + 0.5) * base} y={y} />);
    }
    y += row[0].height * base + gap;
  }
  return tiles;
}

function tileRows() {
  return [
    [
      { text: "1", width: 1, height: 1 },
      { text: "-1", width: 1, height: 1 },
    ],
    [{ text: "x", width: 2.5, height: 1 }],
    [{ text: "-x", width: 2.5, height: 1 }],
    [{ text: "x²", width: 2.5, height: 2.5 }],
    [{ text: "-x²", width: 2.5, height: 2.5 }],
    [
      { text: "y", width: 2, height: 1 },
      { text: "-y", width: 2, height: 1 },
    ],
    [
      { text: "y²", width: 2, height: 2 },
      { text: "-y²", width: 2, height: 2 },
    ],
    [
      { text: "xy", width: 2, height: 3 },
      { text: "-xy", width: 2, height: 3 },
    ],
  ];
}

function outOfToolbar(e) {
  return e.target.getStage().getPointerPosition().x > leftToolbarWidth;
}

export default LeftToolbar;
