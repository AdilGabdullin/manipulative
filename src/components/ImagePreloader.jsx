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
    { id: "cube-0-up", src: "cubes/01-01.svg" },
    { id: "cube-1-up", src: "cubes/01-02.svg" },
    { id: "cube-2-up", src: "cubes/01-03.svg" },
    { id: "cube-3-up", src: "cubes/01-04.svg" },
    { id: "cube-4-up", src: "cubes/01-05.svg" },
    { id: "cube-5-up", src: "cubes/01-06.svg" },
    { id: "cube-6-up", src: "cubes/01-07.svg" },
    { id: "cube-7-up", src: "cubes/01-08.svg" },
    { id: "cube-8-up", src: "cubes/01-09.svg" },
    { id: "cube-9-up", src: "cubes/01-10.svg" },
    { id: "cube-0-right", src: "cubes/01-11.svg" },
    { id: "cube-1-right", src: "cubes/01-12.svg" },
    { id: "cube-2-right", src: "cubes/01-13.svg" },
    { id: "cube-3-right", src: "cubes/01-14.svg" },
    { id: "cube-4-right", src: "cubes/01-15.svg" },
    { id: "cube-5-right", src: "cubes/01-16.svg" },
    { id: "cube-6-right", src: "cubes/01-17.svg" },
    { id: "cube-7-right", src: "cubes/01-18.svg" },
    { id: "cube-8-right", src: "cubes/01-19.svg" },
    { id: "cube-9-right", src: "cubes/01-20.svg" },
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
