import { cos, sin } from "./util";

const config = {
  workspace: {
    basic: "Basic",
    other: "Other",
  },
  numberSet: {
    whole: "Whole Numbers",
    decimal: "Decimals",
  },
  colors: {
    black: "#000000",
    blue: "#2196f3",
    red: "#f44336",
    purple: "#9c27b0",
    yellow: "#ffc107",
    white: "#ffffff",
    grey: "#e0e0e0",
    solitude: "#e8f4fe",
  },
  block: {
    size: 20,
    angle: 30,
    depthScale: 0.5,
    stroke: "white",
    options: {
      1: { label: "1", size: [1, 1, 1], fill: "#ffc107", dark: "#ffa000" },
      10: { label: "10", size: [1, 10, 1], fill: "#03a9f4", dark: "#0288d1" },
      100: { label: "100", size: [10, 10, 1], fill: "#ff5722", dark: "#e44c1c" },
      1000: { label: "1000", size: [10, 10, 10], fill: "#39c669", dark: "#008d35" },
    },
  },
  leftToolbar: {
    width: 180,
    padding: 20,
  },
  summary: {
    fontSize: 36,
    height: 56,
  },
  menu: {
    padding: 8,
    height: 36,
    dropdown: {
      fontSize: 18,
      margin: 5,
      padding: 2,
    },
  },
  animationDuration: 400,
};

Object.values(config.block.options).forEach((option) => {
  const [sx, sy, sz] = option.size;
  const { angle, depthScale } = config.block;
  const top = sin(angle) * sz * depthScale;
  const right = cos(angle) * sz * depthScale;
  option.top = top;
  option.right = right;
  option.width = sx;
  option.height = sy;
});

export default config;
