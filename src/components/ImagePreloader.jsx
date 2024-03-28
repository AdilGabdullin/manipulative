import { useAppStore } from "../state/store";

const config = [
  { id: "undo-button", src: "buttons/undo-min.png" },
  { id: "redo-button", src: "buttons/undo-min.png" },
  { id: "clear-button", src: "buttons/clear-canvas-min.png" },
  { id: "zoom-in-button", src: "buttons/zoom-in-min.png" },
  { id: "zoom-out-button", src: "buttons/zoom-out-min.png" },
  { id: "fullscreen-button", src: "buttons/full-screen-min.png" },
  { id: "brush-button", src: "buttons/pencil-min.png" },
  { id: "eraser-button", src: "buttons/eraser-min.png" },
  { id: "fill-button", src: "buttons/fill-min.png" },
  { id: "angle-button", src: "buttons/angle-min.png" },
  { id: "band-0", src: "bands/band-0.svg" },
  { id: "band-1", src: "bands/band-1.svg" },
  { id: "band-2", src: "bands/band-2.svg" },
  { id: "band-3", src: "bands/band-3.svg" },
  { id: "band-4", src: "bands/band-4.svg" },
  { id: "band-5", src: "bands/band-5.svg" },
];
const ImagePreloader = () => {
  const state = useAppStore();
  const { loadedImagesCount } = state;
  const onLoad = (e) => {
    if (loadedImagesCount + 1 == config.length) {
      state.setValue("imagesReady", true);
    } else {
      state.setValue("loadedImagesCount", loadedImagesCount + 1);
    }
  };
  const images = config;
  return (
    <div style={{ display: "none" }}>
      {images.map(({ id, src }) => (
        <img key={id} id={id} src={"./img/" + src} onLoad={onLoad} />
      ))}
    </div>
  );
};

export default ImagePreloader;
