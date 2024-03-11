import { useAppStore } from "../state/store";

const config = {
  geoboard: [
    { id: "band-0", src: "./img/bands/band-0.svg" },
    { id: "band-1", src: "./img/bands/band-1.svg" },
    { id: "band-2", src: "./img/bands/band-2.svg" },
    { id: "band-3", src: "./img/bands/band-3.svg" },
    { id: "band-4", src: "./img/bands/band-4.svg" },
    { id: "band-5", src: "./img/bands/band-5.svg" },
  ],
  "linking-cubes": [
    { id: "cube-0-up", src: "./img/cubes/cube-0-up.png" },
    { id: "cube-0-right", src: "./img/cubes/cube-0-right.png" },
  ],
};

const ImagePreloader = () => {
  const state = useAppStore();
  const { mode, loadedImagesCount } = state;
  const onLoad = (e) => {
    if (loadedImagesCount + 1 == config[mode].length) {
      state.setValue("imagesReady", true);
    } else {
      state.setValue("loadedImagesCount", loadedImagesCount + 1);
    }
  };
  return (
    <div style={{ display: "none" }}>
      {config[mode].map(({ id, src }) => (
        <img key={id} id={id} src={src} onLoad={onLoad} />
      ))}
    </div>
  );
};

export default ImagePreloader;
