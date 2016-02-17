(function(){
	window.VR = window.VR || {};
	VR.instance = VR.instance || {};
	VR.methods = VR.methods || {};
	VR.clazz = VR.clazz || {};
	
	/**
	 * Eye
	 */
	
	VR.clazz.Eye = (function() {
		THREE.Object3D.call( this );
		this.type = 'Eye';
		this.initEye();
	});
	
	VR.clazz.Eye.prototype = $.extend(Object.create( THREE.Object3D.prototype ), {
		camera: undefined,
		initEye: function(){
			this.camera = new THREE.PerspectiveCamera( 90 /* FOV */, 1 /* W/H */, 1 /* Near */ , 1000 /* Far */);
			this.add(this.camera);
		}
	});
	
	VR.clazz.Eye.prototype.constructor = VR.clazz.Eye;

	/**
	 * Head
	 */
	
	VR.clazz.Head = (function(options) {
		THREE.Object3D.call( this );
		this.type = 'Head';
		this.initHead($.extend({}, {ipd:62}, options));
	});
	
	VR.clazz.Head.prototype = $.extend( Object.create( THREE.Object3D.prototype ), {
		neck: undefined,
		center: undefined,
		left: undefined,
		right: undefined,
		initHead: function(options){
			this.neck = new THREE.Object3D();
			this.center = new THREE.Object3D();
			this.left = new VR.clazz.Eye();
			this.right = new VR.clazz.Eye();
			
			this.add(this.neck);
			this.neck.add(this.center);
			this.center.add(this.left);
			this.center.add(this.right);
		}
	});
	
	VR.clazz.Head.prototype.constructor = VR.clazz.Head;
	
	/**
	 * Instance
	 */
	
	VR.clazz.Instance = (function(containerElement) {
		this.initInstance(containerElement);
	});
	
	VR.clazz.Instance.prototype = {
		options: undefined,
		container: undefined,
		scene: undefined,
		camera: undefined,
		renderer: undefined,
		cameras: undefined,
		perspective: undefined,
		// Framework
		targetEyeLeft: undefined,
		targetEyeRight: undefined,
		meshEyeLeft: undefined,
		meshEyeRight: undefined,
		outputScene:undefined,
		outputCamera: undefined,
		
		constructor: VR.clazz.Instance,
		initInstance: function(options){
			this.options = $.extend({}, {mode: 'MONO'}, options);
			this.container = this.options.el;
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
			this.targetEyeLeft = new THREE.WebGLRenderTarget(256, 256, {format: THREE.RGBFormat});
			switch (this.options.mode) {
				case 'SBS': {
					this.targetEyeRight = new THREE.WebGLRenderTarget(256, 256, {format: THREE.RGBFormat});
				} break;
				default: {
					this.targetEyeRight = nil;
				} break;
			}
			this.renderer = new THREE.WebGLRenderer();
			this.renderer.setSize(512, 256);			
			this.renderer.autoClear = false;
			
			this.cameras = {};
			
			this.container.append(this.renderer.domElement );
			this.perspective = new VR.clazz.Head();
			this.cameras['main'] = this.perspective;
			this.scene.add(this.perspective);
			
			var plane = new THREE.PlaneBufferGeometry(5, 5);

			var quad = new THREE.Mesh( plane, new THREE.MeshBasicMaterial({wireframe: true, color: 0xFFFFFF}) );
			quad.position.z = -10;
			this.scene.add( quad );
			
			// Framework
			var width = 512;
			var height = 256;
			this.outputScene = new THREE.Scene();
			this.outputCamera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 10 );
			this.outputScene.add(this.outputCamera);
	
			this.meshEyeLeft = new THREE.Mesh(VR.utils.generateDistortionMesh(), new THREE.MeshBasicMaterial({wireframe: false, map: this.targetEyeLeft}));
			
			this.meshEyeRight = new THREE.Mesh(VR.utils.generateDistortionMesh(), new THREE.MeshBasicMaterial({wireframe: false, map: this.targetEyeRight}));
			
			this.meshEyeLeft.position.set( -128, 0, -1);
			this.meshEyeLeft.scale.set(128,128,1);
			this.meshEyeRight.position.set( 128, 0, -1);
			this.meshEyeRight.scale.set(128,128,1);
			
			this.outputScene.add(this.meshEyeLeft);
			this.outputScene.add(this.meshEyeRight);
		},
		start: function(){
			var that = this;
			requestAnimationFrame(function() {that.render()});
			this.render();
		},
		render: function() {
			
			//this.renderer.setViewport(0, 0, 256, 256);
			this.renderer.setClearColor( 0x222222, 1 );
			this.renderer.render(this.scene, this.perspective.left.camera, this.targetEyeLeft, true);
			switch (this.options.mode) {
				case 'SBS': {
					this.renderer.clear();
					this.renderer.setClearColor( 0x555555, 1 );
					this.renderer.render(this.scene, this.perspective.right.camera, this.targetEyeRight, true);
				} break;
			}
			
			this.renderer.clear();
			this.renderer.setClearColor( 0x111111, 1 );
			this.renderer.setViewport(0, 0, 512, 256);
			this.renderer.render(this.outputScene, this.outputCamera, undefined, true);
		}
	};
	
}());


$(function(){
	
	VR.instance = new VR.clazz.Instance({el:$('#webvr'), mode:'SBS'});

	VR.instance.start();
	
	//VR.methods.animate();
});