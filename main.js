import * as THREE from 'three';
import { RGBELoader } from 'RGBELoader';

var viewDirection = new THREE.Vector3();
var k = 3;
noise.seed(Math.random());
var time;

/*------------------------------
Renderer
------------------------------*/
const renderer = new THREE.WebGLRenderer({
  antialias: true,
  alpha: true
});
renderer.setSize( window.innerWidth, window.innerHeight );
document.body.appendChild( renderer.domElement );


/*------------------------------
Scene & Camera
------------------------------*/
const scene = new THREE.Scene();
scene.background = new THREE.Color( 0x000000 );
const camera = new THREE.PerspectiveCamera( 
  50, 
  window.innerWidth / window.innerHeight,
  0.1,
  100
);
camera.position.z = 3;
camera.position.y = 0;

/*===============================================
Clock
===============================================*/
const clock = new THREE.Clock();


/*------------------------------
Resize
------------------------------*/
function onWindowResize() {
  camera.aspect = window.innerWidth / window.innerHeight;
  camera.updateProjectionMatrix();
  renderer.setSize( window.innerWidth, window.innerHeight );
}
window.addEventListener( 'resize', onWindowResize, false );

/*===============================================
MouseMove
===============================================*/
function onMouseMove(e) {
  const x = e.clientX;
  const y = e.clientY;

  gsap.to(scene.rotation, {
    y: gsap.utils.mapRange(0, window.innerWidth, .2, -.2, x),
    x: gsap.utils.mapRange(0, window.innerHeight, .2, -.3, y)
  })
}

//window.addEventListener('mousemove', onMouseMove);

/*===============================================
reflection
===============================================*/
const hdrEquirect = new RGBELoader().load(
  "./empty_warehouse_01_4k.hdr",
  () => {
    hdrEquirect.mapping = THREE.EquirectangularReflectionMapping;
  }
);

/*===============================================
sphere
===============================================*/
const geometry = new THREE.SphereGeometry( 1, 200, 200 );
const material = new THREE.MeshPhysicalMaterial({  
  transparent: true,
  opacity: 1,
  roughness: 0,   
  transmission: 1,  
  thickness: 1,
  envMap: hdrEquirect,
  side: THREE.DoubleSide,
});
// const material = new THREE.MeshNormalMaterial();
const sphere = new THREE.Mesh( geometry, material );
//sphere.scale = new THREE.Vector3(1.5, 1.5, 1.5);
sphere.scale.x = 2;
sphere.scale.y = 2;
sphere.scale.z = 2;
sphere.position.x = 1;
scene.add( sphere );


function sp() {
  var mag = 0.1;
  sphere.position.x = Math.cos(time)*mag + 1;
  sphere.position.y = Math.sin(time * 0.8)*mag;

  const {array} = sphere.geometry.attributes.position;
  for (let i=0; i < array.length; i+=3) {

      const pos = new THREE.Vector3(array[i], array[i+1], array[i+2]);
      pos.normalize().multiplyScalar(1 + 0.1 * noise.perlin3(pos.x * k + time * 0.5, pos.y * k, pos.z * k));

      array[i] = pos.x;
      array[i + 1] = pos.y;
      array[i + 2] = pos.z;
  }

  sphere.geometry.computeVertexNormals();
  sphere.geometry.normalsNeedUpdate = true;
  sphere.geometry.verticesNeedUpdate = true;
}


/*------------------------------
Loop
------------------------------*/
const animate = function () {
  time = clock.getElapsedTime();
  sphere.rotation.x += 0.0005;
  sphere.rotation.z -= 0.001;
  camera.getWorldDirection(viewDirection);
  requestAnimationFrame( animate );
  //composer.render();
  sp();
  renderer.render( scene, camera );
};
animate();