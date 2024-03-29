export const radius = 32;

const Disk = (props) => {
  return <></>;
};

const intl = new Intl.NumberFormat("en-US");

export function format(value) {
  return intl.format(value);
}

export function fontSize(value) {
  if (value == 1_000_000) return 15;
  if (value == 100_000) return 18;
  return 22;
}

export default Disk;
