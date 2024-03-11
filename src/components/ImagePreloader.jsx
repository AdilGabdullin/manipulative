import { useAppStore } from "../state/store";

const ImagePreloader = () => {
  const state = useAppStore();
  const { mode } = state;
  return (
    <div style={{ display: "none" }}>
      {mode == "geoboard" && (
        <>
          <img id="band-0" src="./img/bands/band-0.svg" />
          <img id="band-1" src="./img/bands/band-1.svg" />
          <img id="band-2" src="./img/bands/band-2.svg" />
          <img id="band-3" src="./img/bands/band-3.svg" />
          <img id="band-4" src="./img/bands/band-4.svg" />
          <img id="band-5" src="./img/bands/band-5.svg" />
          <img id="band-6" src="./img/bands/band-6.svg" />
        </>
      )}
      {mode == "linking-cubes" && (
        <>
          <img id="cube-0-up" src="./img/cubes/cube-0-up.png" />
          <img id="cube-0-right" src="./img/cubes/cube-0-right.png" />
        </>
      )}
    </div>
  );
};

export default ImagePreloader;
