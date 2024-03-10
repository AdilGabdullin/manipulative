
### How to integrate manipulative to your site

1. run "npm run build"
2. copy script tag from /dist/index.html
```
<script type="module" crossorigin src="./assets/index.984fc52f.js"></script>
```
3. add 'id="manipulative-js"' to that script
```
<script type="module" id="manipulative-js" crossorigin src="./assets/index.984fc52f.js"></script>
```
4. place the root to the page
```
<div id="manipulative-canvas-root"></div>
```
5. place images div to the page
```
<div style="display: none;">
    <image id="band-1" src="./band-1.png" />
    <image id="band-2" src="./band-2.png" />
  ...
</div>
```
6. run JS code when DOM is ready
```
if (window.runManipulative) {
  window.runManipulative();
} else {
  document.querySelector('#manipulative-js').addEventListener('load', () => {
    window.runManipulative();
  });
}
```
