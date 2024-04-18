import { cos, sin } from "./util";

const config = {
  workspace: {
    basic: "Basic",
    other: "Other",
  },
  colors: {
    black: "#000000",
    blue: "#2196f3",
    red: "#f44336",
    purple: "#9c27b0",
    yellow: "#ffc107",
    white: "#ffffff",
    grey: "#e0e0e0",
  },
  block: {
    size: 20,
    angle: 30,
    depthScale: 0.5,
    options: {
      1: { label: 1, size: [1, 1, 1], fill: "#ffc107", dark: "#ffa000", width: null, height: null, top: null },
      10: { label: 10, size: [1, 10, 1], fill: "#03a9f4", dark: "#0288d1", width: null, height: null, top: null },
      100: { label: 100, size: [10, 10, 1], fill: "#ff5722", dark: "#e44c1c", width: null, height: null, top: null },
      1000: { label: 1000, size: [10, 10, 10], fill: "#39c669", dark: "#008d35", width: null, height: null, top: null },
    },
  },
  leftToolbar: {
    width: 180,
    padding: 20,
  }
};

Object.values(config.block.options).forEach((option) => {
  const [sx, sy, sz] = option.size;
  const { angle, depthScale } = config.block;
  const top = sin(angle) * sz * depthScale;
  const right = cos(angle) * sz * depthScale;
  option.top = top;
  option.width = sx + right;
  option.height = sy + top;
});



export default config;
