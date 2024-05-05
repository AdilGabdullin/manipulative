export const colors = {
  black: "#000000",
  blue: "#2196f3",
  blueBorder: "#1976d2",
  red: "#f44336",
  redBorder: "#d53737",
  purple: "#9c27b0",
  yellow: "#ffc107",
  white: "#ffffff",
  grey: "#e0e0e0",
  darkGrey: "grey",
  solitude: "#e8f4fe",
};

export const workspace = {
  basic: "Basic",
  numberLine: "Number Line",
  graph: "Graph",
  ppw: "Part-Part-Whole",
};

export const config = {
  intl: new Intl.NumberFormat("en-US"),
  animationDuration: 400,
  leftToolbar: {
    width: 180,
    padding: 20,
  },
  summary: {
    height: 56,
  },
  menu: {
    padding: 8,
    height: 52,
    dropdown: {
      fontSize: 18,
      margin: 5,
      padding: 2,
    },
  },
  colors,
  tile: {
    size: 60,
    options: [
      { fill: "#ffeb3b", stroke: "#fdd935", name: "Yellow" },
      { fill: "#f44336", stroke: "#d5302f", name: "Red" },
      { fill: "#2196f3", stroke: "#1978d4", name: "Green" },
      { fill: "#4caf50", stroke: "#39903d", name: "Blue" },
      { fill: "#f06292", stroke: "#e92265", name: "Pink" },
      { fill: "#9c27b0", stroke: "#7d1fa3", name: "Purple" },
      { fill: "#ff9800", stroke: "#f67e00", name: "Orange" },
      { fill: "brown", stroke: "#5C4033", name: "Brown" },
    ],

    options: [
      { fill: "#f44336", stroke: "#d73130", denominator: 1 },
      { fill: "#f06292", stroke: "#e92467", denominator: 2 },
      { fill: "#ff9800", stroke: "#f57f07", denominator: 3 },
      { fill: "#ffeb3b", stroke: "#fed936", denominator: 4 },
      { fill: "#4caf50", stroke: "#388f3d", denominator: 5 },
      { fill: "#03a9f4", stroke: "#0a8cd2", denominator: 6 },
      { fill: "#3f51b5", stroke: "#3240a0", denominator: 8 },
      { fill: "#9c27b0", stroke: "#7d22a3", denominator: 10 },
      { fill: "#616161", stroke: "#2b2e31", denominator: 12 },
    ],
  },
};
