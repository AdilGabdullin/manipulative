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
  blockSize: 20,
  angle: 30,
  blocks: {
    1: { size: [1, 1, 1], fill: "#ffc107", dark: "#ffa000", label: 1 },
    10: { size: [1, 10, 1], fill: "#03a9f4", dark: "#0288d1", label: 10 },
    100: { size: [10, 10, 1], fill: "#ff5722", dark: "#e44c1c", label: 100 },
    1000: { size: [10, 10, 10], fill: "#39c669", dark: "#008d35", label: 1000 },
  },
};

export default config;
