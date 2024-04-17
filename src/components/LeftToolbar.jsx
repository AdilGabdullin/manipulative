import { Rect } from "react-konva";
import { useAppStore } from "../state/store";
import { sum } from "../util";
import { ToolbarTile } from "./Tile";
import { workspace } from "../config";

export const leftToolbarWidth = 180;

const LeftToolbar = () => {
  const { height, showYTiles, workspace: ws } = useAppStore();
  return (
    <>
      <Rect fill="#f3f9ff" x={0} y={0} width={leftToolbarWidth} height={height} />
      {createTiles(height, tileRows(showYTiles, ws != workspace.factors))}
    </>
  );
};

function createTiles(height, rows) {
  const base = leftToolbarWidth / 5.5;
  const totalHeight = sum(rows.map((row) => (row[0] || row[1]).height));
  const gap = (height - totalHeight * base) / (rows.length + 1);
  let y = gap;
  const tiles = [];
  for (const [i, row] of Object.entries(rows)) {
    const rowHeight = (row[0] || row[1]).height * base;
    if (row.length == 1) {
      const width = row[0].width;
      tiles.push(<ToolbarTile key={i * 2} {...row[0]} base={base} x={(leftToolbarWidth - width * base) / 2} y={y} />);
    } else {
      const width0 = row[0].width;
      const width1 = row[1].width;
      const height0 = row[0].height;
      const height1 = row[1].height;
      const left = (leftToolbarWidth - (width0 + width1 + 0.5) * base) / 2;
      tiles.push(<ToolbarTile key={i * 2} {...row[0]} base={base} x={left} y={y + (rowHeight - height0 * base) / 2} />);
      tiles.push(
        <ToolbarTile
          key={i * 2 + 1}
          {...row[1]}
          base={base}
          x={left + (width0 + 0.5) * base}
          y={y + (rowHeight - height1 * base) / 2}
        />
      );
    }
    y += rowHeight + gap;
  }
  return tiles;
}

// prettier-ignore
function tileRows(showY, showNegative) {
  const xRows = showNegative ? [
    [
      { text: "1", width: 1, height: 1, placeWidth: 1, placeHeight: 1, color: "#ffeb3b", borderColor: "#fdd835" },
      { text: "-1", width: 1, height: 1, placeWidth: 1, placeHeight: 1, color: "#ffeb3b", borderColor: "#fdd835" },
    ],
    [{ text: "x", width: 2.5, height: 1, placeWidth: 4, placeHeight: 1, color: "#4caf50", borderColor: "#388e3c" }],
    [{ text: "-x", width: 2.5, height: 1, placeWidth: 4, placeHeight: 1, color: "#4caf50", borderColor: "#388e3c" }],
    [{ text: "x²", width: 2.5, height: 2.5, placeWidth: 4, placeHeight: 4, color: "#2196f3", borderColor: "#1b7dd9" }],
    [{ text: "-x²", width: 2.5, height: 2.5, placeWidth: 4, placeHeight: 4, color: "#2196f3", borderColor: "#1b7dd9" }],
  ]: [
    [
      { text: "x", width: 2.5, height: 1, placeWidth: 4, placeHeight: 1, color: "#4caf50", borderColor: "#388e3c" },
      { text: "1", width: 1, height: 1, placeWidth: 1, placeHeight: 1, color: "#ffeb3b", borderColor: "#fdd835" },
    ],
    [
      { text: "x²", width: 2.5, height: 2.5, placeWidth: 4, placeHeight: 4, color: "#2196f3", borderColor: "#1b7dd9"},
      { text: "x", width: 1, height: 2.5, placeWidth: 1, placeHeight: 4, color: "#4caf50", borderColor: "#388e3c" },
    ],
  ];
  const yRows = showNegative ? [
    [
      { text: "y", width: 2, height: 1, placeWidth: 3, placeHeight: 1, color: "#ff9800", borderColor: "#f57c00" },
      { text: "-y", width: 2, height: 1, placeWidth: 3, placeHeight: 1, color: "#ff9800", borderColor: "#f57c00" },
    ],
    [
      { text: "y²", width: 2, height: 2, placeWidth: 3, placeHeight: 3, color: "#9c27b0", borderColor: "#7e25a5" },
      { text: "-y²", width: 2, height: 2, placeWidth: 3, placeHeight: 3, color: "#9c27b0", borderColor: "#7e25a5" },
    ],
    [
      { text: "xy", width: 2, height: 3, placeWidth: 3, placeHeight: 4, color: "#e91e63", borderColor: "#c2185b" },
      { text: "-xy", width: 2, height: 3, placeWidth: 3, placeHeight: 4, color: "#e91e63", borderColor: "#c2185b" },
    ],
  ] : [
    [
      { text: "y²", width: 2, height: 2, placeWidth: 3, placeHeight: 3, color: "#9c27b0", borderColor: "#7e25a5" },
      { text: "y", width: 1, height: 2, placeWidth: 1, placeHeight: 3, color: "#ff9800", borderColor: "#f57c00" },
    ],
    [
      { text: "xy", width: 2, height: 3, placeWidth: 3, placeHeight: 4, color: "#e91e63", borderColor: "#c2185b" },
      { text: "y", width: 2, height: 1, placeWidth: 3, placeHeight: 1, color: "#ff9800", borderColor: "#f57c00" },
    ],
    [{ text: "xy", width: 3, height: 2, placeWidth: 4, placeHeight: 3, color: "#e91e63", borderColor: "#c2185b" },],
  ];
  return showY ? [...xRows, ...yRows] : xRows;
}

export function outOfToolbar(e) {
  return e.target.getStage().getPointerPosition().x > leftToolbarWidth;
}

export default LeftToolbar;
