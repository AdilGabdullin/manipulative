
### How to integrate manipulative to your site

1. run "npm run build"
2. copy script tag from /dist/index.html
```
<script type="module" crossorigin src="./assets/..."></script>
```
3. add 'id="manipulative-js"' to that script
```
<script type="module" id="manipulative-js" crossorigin src="./assets/..."></script>
```

4. add root div
```
<div id="manipulative-canvas-root"></div>
```

5. JS code
```
if (window.runManipulative) {
  window.runManipulative();
} else {
  document.querySelector('#manipulative-js').addEventListener('load', () => {
    window.runManipulative();
  });
}
```
