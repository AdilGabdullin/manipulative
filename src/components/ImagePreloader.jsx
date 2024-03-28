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
};

const ImagePreloader = () => {
  const state = useAppStore();
  const {  loadedImagesCount } = state;
  const special = [];
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
