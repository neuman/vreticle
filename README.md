# vreticle
A gaze directed interface for THREE.js with an event handling system, live demo available here: http://neuman.github.io/vreticle/ . 

Include vreticle

```html
<script src="js/deps/vreticle.js"></script>
```
Initialize the reticle by handing it the camera you want it attached to.

```javascript
//create gaze interaction manager
var reticle = vreticle.Reticle(camera);
scene.add(camera);
```
Define event handler functions for your THREE.js object.

```javascript
var cube = new THREE.Mesh(geometry, material);

cube.ongazelong = function(){
  this.material = reticle.get_random_hex_material();
}

cube.ongazeover = function(){
  this.material = reticle.get_random_hex_material();
}

cube.ongazeout = function(){
  this.material = reticle.default_material();
}
```

Lastly, add your THREE.js object to the reticle's collider list!

```javascript
reticle.add_collider(cube);
```