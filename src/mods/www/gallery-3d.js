const DEFAULT_FOV = 90;

function getOrientation() { return window.innerHeight > window.innerWidth ? "portrait" : "landscape"; }
function isLandscape() { return getOrientation() == "landscape"; }
function isPortait() { return getOrientation() == "portrait"; }

class Viewer {
	static #instance;
	static sphereWidth = 1;
	#initDone = false;
	camera;
	container;
	defaultMaterial;
	fov = DEFAULT_FOV;
	renderer;
	scene;
	sphere;
	texture;
	isRenderLoop = false;
	isVideo = false;
	fragment_shader = 
`
#define PI 3.1415926538
#define RAD90 1.5707963267948966
uniform float blurBottomRadius;
uniform float blurAtRadius;
uniform float cropFactor;
uniform float fov;
uniform sampler2D tex;

const vec3 AXIS_X = vec3(1.0, 0.0, 0.0);
const vec3 AXIS_Y = vec3(0.0, 1.0, 0.0);
const vec3 AXIS_Z = vec3(0.0, 0.0, 1.0);

varying vec3 vNormal;
varying vec3 vPosition;
out vec4 fragColor;
float expCurve(float x, float pw, float pwDiv) { return (pow(abs(x), pw) / pwDiv); }
float getAngle(vec3 a, vec3 b) 	{ 
	float d = dot(a, b);
	if (d == 0.0) return RAD90;
	return abs(acos(d)); 
}
float capValue(float f) {
	if (f < -1.0) return -1.0;
	if (f >  1.0) return  1.0;
	return f;
}
float getUVy(float y) 			{ return capValue(y / 2.0 + 0.5); }
float getUVx(float x, float z)  { return capValue( z >= 0.0    ?    (x + 1.0) / 4.0    :    1.0 - ((x + 1.0) / 4.0) ); }
vec2 toUV(vec3 pos, out float f) {
	vec2 uv;
	vec3 abspos = abs(normalize(pos));
	if (abspos.z <= 0.001) { // if at edge
		uv = normalize(pos.xy);
		f = 1.0;
	} else {	
		float a = getAngle(abspos, AXIS_Z);
		float angleFromCenter = capValue(a / RAD90);
		uv = normalize(abspos.xy) * angleFromCenter;
		if (sign(pos.x) != 0.0) uv.x *= sign(pos.x);
		if (sign(pos.y) != 0.0) uv.y *= sign(pos.y);
	}
	uv *= cropFactor;
	uv.y = getUVy(uv.y);
	uv.x = getUVx(-uv.x + 2.0, pos.z); //negative x to flip left-right
	return uv;
}

void main() {
	float r;
	vec2 uv1 = toUV(vPosition, r);
	vec3 color = texture2D(tex, uv1).rgb;
	
	if (r > blurAtRadius) {
		vec3 bPos = vPosition;
		bPos.z *= -1.0;
		vec2 uv2 = toUV(bPos, r);
		vec3 color2 = texture2D(tex, uv2).rgb;
		float range = 1.0 - blurAtRadius;
		float f = capValue((r - blurAtRadius) / range);
		color = mix(color, color2, f / 2.0);
	}
	/*
	vec3 pos = normalize(vPosition);
	if (pos.y <= -blurBottomRadius) {
		float range = 1.0 - blurBottomRadius;
		float f = capValue(-(blurBottomRadius + pos.y) / range);
		vec3 bPos = vPosition;
		bPos.z *= -1.0;
		//bPos.xz = -bPos.xz;
		vec2 uv3 = toUV(bPos, r);
		vec3 color3 = texture2D(tex, uv3).rgb;
		color = mix(color, color3, f / 2.0);
		color *= (1.0 - f);
	}
	*/
	fragColor = vec4( color, 1.0 );
}`;

	vertex_shader =  
`
#define PI 3.1415926538
#define RAD90 1.5707963267948966
#define MAX_FOV 120.0
#define MIN_FOV 50.0
uniform float fov;
uniform vec3 cameraDirection;
uniform float outerPixelPushForwardFactor;
uniform float outerPixelPushOutwardFactor;
varying vec3 vNormal;
varying vec3 vPosition;
float expCurve(float x, float pw, float pwDiv) { return (pow(abs(x), pw) / pwDiv); }
float getAngle(vec3 a, vec3 b) 	{ 
	float d = dot(a, b);
	if (d == 0.0) return RAD90;
	return abs(acos(d)); 
}
void main() {
	vNormal = normal;
	vPosition = position;
	vec3 pos = position;
	vec3 camDir = cameraDirection;
	
	float fovRad = fov * PI / 180.0;
	float fovHalf = fovRad / 2.0;
	float factor = max(0.0, (fov - MIN_FOV) / (MAX_FOV - MIN_FOV));
	float fovCurve = expCurve(factor, 2.0, 0.99999999999); 
	float angle = getAngle(camDir, normalize(pos));
	float angleFactor = angle / fovHalf;
	
	
	
	float angleCurve = expCurve(angleFactor, 1.1, 0.99999999);
	float camPullFactor = 0.2 * angleCurve * fovCurve;
	vec3 posPushedForward = mix(pos, camDir, camPullFactor * outerPixelPushForwardFactor);
	vec3 posPushedOutward = mix(vec3(0.0, 0.0, 0.0), pos, 1.0 + camPullFactor * outerPixelPushOutwardFactor);
	pos = posPushedForward + (posPushedOutward - pos);
	
	gl_Position = projectionMatrix * modelViewMatrix * vec4( pos, 1.0 );
}`;
	
    static get instance() {
        if (!Viewer.#instance) Viewer.#instance = new Viewer();
        return Viewer.#instance;
    }
	
	init() {
		if (!this.#initDone) {
			var w = window.innerWidth, h = window.innerHeight;
			
			this.renderer = new THREE.WebGLRenderer({alpha: false, antialias: true});
			this.renderer.setPixelRatio(window.devicePixelRatio);
			this.renderer.setSize( w, h );
			this.renderer.outputEncoding = THREE.sRGBEncoding;
			this.renderer.setSize(w*2, h*2);
			this.renderer.domElement.style.width = w;
			this.renderer.domElement.style.height = h;
			this.renderer.domElement.width = w*2;
			this.renderer.domElement.height = h*2;
			this.container.appendChild(this.renderer.domElement);
			
			this.scene = new THREE.Scene();
			
			this.camera = new THREE.PerspectiveCamera(this.fov, w / h, 0.00001, 2);
			this.camera.position.set(0, 0, 0);
			this.camera.rotation.order = "YXZ";
			//this.camera = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, 1, 1000 );
			//this.camera.zoom = h / Viewer.sphereWidth;
			//this.camera.position.setZ(100);
			this.scene.add(this.camera);
					
			var geometry = new THREE.SphereGeometry(Viewer.sphereWidth, 32, 32);
			this.defaultMaterial = new THREE.MeshBasicMaterial({map: new THREE.TextureLoader().load( "/blank.png" ), side:  THREE.BackSide, wireframe: false});
			this.sphere = new THREE.Mesh(geometry, this.defaultMaterial);
			
			this.scene.add(this.sphere);
		
		
			this.uniforms = {
				blurBottomRadius: {value: 0.9},
				blurAtRadius: {value: 0.996},
				cameraDirection: {value: new THREE.Vector3( 0, 0, -1 )},
				cropFactor: {value: 0.94},
				fov: {value: this.fov}, 
				outerPixelPushForwardFactor: {value: 1.4},
				outerPixelPushOutwardFactor: {value: 1.0},
				tex: {value: this.texture}, 
			};
			this.setWideness();
			
			this.composer = new THREE.EffectComposer( this.renderer );
		
			this.renderPass = new THREE.RenderPass( this.scene, this.camera );
			this.renderPass.clearColor = new THREE.Color( 0, 0, 0 );
			this.renderPass.clearAlpha = 0;

			this.fxaaPass = new THREE.ShaderPass( THREE.FXAAShader );
			this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( w * window.devicePixelRatio );
			this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( h * window.devicePixelRatio );
				
			this.composer = new THREE.EffectComposer( this.renderer );
			this.composer.addPass( this.renderPass );
			this.composer.addPass( this.fxaaPass );

			this.#initDone = true;
		}
		
		const thiz = this;
		
		var isMouseDown = false;
		var scale = 0.25;
		var prevX = 0;
		var prevY = 0;
		var prevP = 0;

		function getInpX() {return event.pageX || (event.touches && event.touches.length? event.touches[0].pageX : null); }
		function getInpY() {return event.pageY || (event.touches && event.touches.length? event.touches[0].pageY : null); }
		$(document).bind('mousedown touchstart', (event) => { 
			isMouseDown = true;
			prevX = getInpX();
			prevY = getInpY();
			prevP = 1.0;
		});
		$(document).bind('mouseup touchend', (event) => { 
			isMouseDown = false;
			prevP = 1.0;
		});
		$(document).bind('mousemove touchmove', (event) => {
			if (isMouseDown) {
				var mouseX = getInpX() - prevX;
				var mouseY = getInpY() - prevY;
				prevX = getInpX();
				prevY = getInpY();
				mouseX = mouseX * Math.PI / 180 * scale;
				mouseY = mouseY * Math.PI / 180 * scale;
				var newRotX = thiz.camera.rotation.x + mouseY;
				var newRotY = thiz.camera.rotation.y + mouseX
				if (newRotX < 1.5708 && newRotX > -1.5708) {
					thiz.camera.rotation.x = newRotX;
				}
				thiz.camera.rotation.y = newRotY;
				thiz.updateCamera();
				thiz.render();
			}
		});
		function changeFov(change) {
			thiz.fov += change;
			if (thiz.fov < 30) thiz.fov = 30;
			if (thiz.fov > 120) thiz.fov = 120;
			thiz.updateCamera();
			thiz.render();
		}
		$(document).bind('mousewheel', function(e){
			var change = (e.originalEvent.wheelDelta /120 > 0) ? -1 : 1;
			changeFov(3 * change);
		});
		
		// see http://hammerjs.github.io/
		var mc = new Hammer.Manager(this.renderer.domElement);
		var pinch = new Hammer.Pinch();
		mc.add([pinch]);
		mc.on("pinch", function(ev) {
			var change = -(ev.scale - prevP) * 100;
			changeFov(change);
			prevP = ev.scale;
		});
		
		this.onWindowResize();
		$(window).resize(() => { thiz.onWindowResize(); });
	}
	
	updateCamera() {
		this.camera.fov = this.fov;
		this.camera.updateProjectionMatrix();
			
		this.uniforms.fov.value = this.fov;
		this.uniforms.cameraDirection.value = new THREE.Vector3( 0, 0, -1 ).applyEuler(this.camera.rotation);
	}
	
	setWideness(wideness) {
		if (!wideness || wideness == 'normal') {
			this.uniforms.outerPixelPushForwardFactor.value = 1.1;
			this.uniforms.outerPixelPushOutwardFactor.value = 1.0;
		} else if (wideness == 'ultra') {
			this.uniforms.outerPixelPushForwardFactor.value = 1.5;
			this.uniforms.outerPixelPushOutwardFactor.value = 1.2;
		} else if (wideness == 'fisheye') {
			this.uniforms.outerPixelPushForwardFactor.value = 1.8;
			this.uniforms.outerPixelPushOutwardFactor.value = 1.5;
		}
		this.updateCamera();
	}
	
	setTextureSource(textureSource) {
		console.log('setTextureSource');
		const thiz = this;
		this.isVideo = textureSource.tagName == 'VIDEO';
		this.sphere.material = this.defaultMaterial;
		
		
		this.fov = DEFAULT_FOV;
		this.camera.rotation.x = 0;
		this.camera.rotation.y = 0;//Math.PI;
		this.updateCamera();
		
		this.texture = this.isVideo ?
		    new THREE.VideoTexture(textureSource) :
		    new THREE.TextureLoader().load( textureSource.src, () => {
		        console.log('render img');
		        thiz.render()
		    });
		this.texture.anisotropy = 8;
		this.texture.minFilter = THREE.NearestFilter; // seam fix
		this.texture.magFilter = THREE.NearestFilter;
		this.uniforms.tex.value = this.texture;
		
		this.material = new THREE.ShaderMaterial( {
			uniforms		: this.uniforms,
			vertexShader	: this.vertex_shader,
			fragmentShader	: this.fragment_shader,
			side			: THREE.BackSide,
			glslVersion	 	: THREE.GLSL3
		});		
		// use when rectilinear is available
		//var material = new THREE.MeshBasicMaterial({map: this.texture, side:  THREE.BackSide});
		this.sphere.material = this.material;
			
		console.log('textureSource:', textureSource, 'texture:', this.texture);
		
		this.container.appendChild( this.renderer.domElement );
		
		if (this.isVideo) {
			this.texture.needsUpdate = true;
			this.sphere.material.needsUpdate = true;
			this.requestRenderLoop();
		}
	}
	
	disposePreviousMaterials() {
		var $document = $(document)
			.unbind('mousedown touchstart')
			.unbind('mouseup touchend')
			.unbind('mousemove touchmove')
			.unbind('mousewheel')
		;
		if (this.texture != null) this.texture.dispose();
		if (this.material != null) this.material.dispose();
	}
	
	onWindowResize() {
		console.log('onWindowResize');
		//var w = window.innerWidth, h = window.innerHeight;
		var w = this.container.clientWidth, h = this.container.clientHeight;
		/*if (this.camera.isOrthographicCamera) {
			this.camera = new THREE.OrthographicCamera( w / - 2, w / 2, h / 2, h / - 2, 1, 1000 );
			this.camera.zoom = h / Viewer.sphereWidth / 2;
		} else this.camera.aspectRatio = w / h;*/
		this.renderer.setSize(w, h);
		this.composer.setSize(w, h);
		this.fxaaPass.material.uniforms[ 'resolution' ].value.x = 1 / ( w * window.devicePixelRatio );
		this.fxaaPass.material.uniforms[ 'resolution' ].value.y = 1 / ( h * window.devicePixelRatio );
		this.camera.aspect = w / h;
		this.camera.updateProjectionMatrix();
		this.render();
	}
	
	render() {
		console.log('render');
		//this.renderer.render( this.scene, this.camera );
		this.composer.render();
	}
	
	requestRenderLoop() {
		console.log('requestRenderLoop');
		this.camera.lookAt(0, 0, -10);
		this.camera.updateProjectionMatrix();
		this.isRenderLoop = true;
		this.renderLoop();
	}
	
	renderLoop() {
		if (this.isRenderLoop) {
			requestAnimationFrame( function() { window.G.renderLoop(); });
			this.render();
		}
	}
	
	stopRenderLoop() {
		console.log('stopRenderLoop');
		this.isRenderLoop = false;
	}
}
