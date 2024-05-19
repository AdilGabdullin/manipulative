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

export const animationDuration = 400;

export const config = {
  intl: new Intl.NumberFormat("en-US"),
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
    size: 62,
    options: [
      { fill: colors.yellow, stroke: colors.black, text: "+" },
      { fill: colors.red, stroke: colors.black, text: "-" },
      { fill: colors.darkGrey, stroke: colors.black, text: "0", height: 1.5 },
    ],
  },
  frame: {
    size: 70,
    shift: 5,
  },
};
