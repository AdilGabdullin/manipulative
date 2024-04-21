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
  solving: "Solving",
};

export const config = {
  intl: new Intl.NumberFormat("en-US"),
  animationDuration: 400,
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
    height: 52,
    dropdown: {
      fontSize: 18,
      margin: 5,
      padding: 2,
    },
  },
  colors,
  tile: {
    size: 20,
    options: [
      { fill: "yellow", stroke: "yellow", name: "Yellow" },
      { fill: "red", stroke: "red", name: "Red" },
      { fill: "green", stroke: "green", name: "Green" },
      { fill: "blue", stroke: "blue", name: "Blue" },
      { fill: "pink", stroke: "pink", name: "Pink" },
      { fill: "purple", stroke: "purple", name: "Purple" },
      { fill: "orange", stroke: "orange", name: "Orange" },
    ],
  },
};
