import { useAppStore } from "../state/store";

const config = {
  common: [
    { id: "undo-button", src: "buttons/undo-min.png" },
    { id: "redo-button", src: "buttons/undo-min.png" },
    { id: "clear-button", src: "buttons/clear-canvas-min.png" },
    { id: "zoom-in-button", src: "buttons/zoom-in-min.png" },
    { id: "zoom-out-button", src: "buttons/zoom-out-min.png" },
    { id: "fullscreen-button", src: "buttons/full-screen-min.png" },
    { id: "brush-button", src: "buttons/pencil-min.png" },
    { id: "eraser-button", src: "buttons/eraser-min.png" },
    { id: "fill-button", src: "buttons/fill-min.png" },
  ],
  geoboard: [
    { id: "angle-button", src: "buttons/angle-min.png" },
    { id: "band-0", src: "bands/band-0.svg" },
    { id: "band-1", src: "bands/band-1.svg" },
    { id: "band-2", src: "bands/band-2.svg" },
    { id: "band-3", src: "bands/band-3.svg" },
    { id: "band-4", src: "bands/band-4.svg" },
    { id: "band-5", src: "bands/band-5.svg" },
  ],
  "linking-cubes": [
    { id: "cube-0-up", src: "cubes/cube-0-up.png" },
    { id: "cube-0-right", src: "cubes/cube-0-right.png" },
  ],
};

const ImagePreloader = () => {
  const state = useAppStore();
  const { mode, loadedImagesCount } = state;
  const special = config[mode] || [];
  const onLoad = (e) => {
    if (loadedImagesCount + 1 == special.length + config.common.length) {
      state.setValue("imagesReady", true);
    } else {
      state.setValue("loadedImagesCount", loadedImagesCount + 1);
    }
  };
  const images = [...config.common, ...special];
  return (
    <div style={{ display: "none" }}>
      {images.map(({ id, src }) => (
        <img key={id} id={id} src={"./img/" + src} onLoad={onLoad} />
      ))}
    </div>
  );
};

export default ImagePreloader;
