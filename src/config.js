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
    1: { size: [1, 1, 1], color: "#ffc107" , label: 1},
    10: { size: [1, 10, 1], color: "#03a9f4" , label: 10},
    100: { size: [10, 10, 1], color: "#ff5722" , label: 100},
    1000: { size: [10, 10, 10], color: "#008d35" , label: 1000},
  },
};

export default config;
