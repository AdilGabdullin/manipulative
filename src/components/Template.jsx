import Pattern from "./Pattern";

const Template = (props) => {
  const { id, patterns, locked } = props;
  return (
    <>
      {patterns.map((p) => (
        <Pattern key={p.id} {...p} template={id} />
      ))}
    </>
  );
};

export default Template;
