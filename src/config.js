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
  menuIcon: "purple",
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
      { fill: "#4caf50", stroke: "#39903d", name: "Blue" },
      { fill: "#f06292", stroke: "#e92265", name: "Pink" },
      { fill: "#ff9800", stroke: "#f67e00", name: "Orange" },
      { fill: "#9c27b0", stroke: "#7d1fa3", name: "Purple" },
      { fill: "#ffeb3b", stroke: "#fdd935", name: "Yellow" },
      { fill: "brown", stroke: "#5C4033", name: "Brown" },
      { fill: "#2196f3", stroke: "#1978d4", name: "Green" },
      { fill: "#f44336", stroke: "#d5302f", name: "Red" },
      { fill: "grey", stroke: "#444444", name: "Grey" },
      { fill: "black", stroke: "#222222", name: "Black" },
    ],
  },
  frame: {
    size: 70,
    shift: 5,
  },
};
