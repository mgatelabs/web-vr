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
		ipd: undefined,
		initHead: function(options){
			this.ipd = options.ipd / 1000.0;
			this.neck = new THREE.Object3D();
			this.center = new THREE.Object3D();
			this.left = new VR.clazz.Eye();
			this.right = new VR.clazz.Eye();
			
			this.left.position.set(this.ipd / -2.0, 0, 0);
			this.right.position.set(this.ipd / 2.0, 0, 0);
			
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
			
			// Framework
			var width = 1024;
			var height = width / 2;
			
			this.container = this.options.el;
			this.scene = options.source && options.source.onInit ? options.source.onInit() : new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
			this.targetEyeLeft = new THREE.WebGLRenderTarget(1024, 1024, {format: THREE.RGBFormat, anisotropy: 2});
			this.targetEyeLeft.autoClear = true;
			switch (this.options.mode) {
				case 'SBS': {
					this.targetEyeRight = new THREE.WebGLRenderTarget(1024, 1024, {format: THREE.RGBFormat, anisotropy: 2});
					this.targetEyeRight.autoClear = true;
				} break;
				default: {
					this.targetEyeRight = nil;
				} break;
			}
			this.renderer = new THREE.WebGLRenderer({antialias:true});
			this.renderer.setSize(width, height);			
			this.renderer.autoClear = true;
			
			this.cameras = {};
			
			this.container.append(this.renderer.domElement );
			this.perspective = new VR.clazz.Head();
			this.cameras['main'] = this.perspective;
			this.scene.add(this.perspective);
			
			this.outputScene = new THREE.Scene();
			this.outputCamera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 10 );
			this.outputScene.add(this.outputCamera);
	
			this.meshEyeLeft = new THREE.Mesh(VR.utils.generateDistortionMesh({k1:0.02, k2: 0.02, quality:6}), new THREE.MeshBasicMaterial({wireframe: false, map: this.targetEyeLeft, shading:THREE.FlatShading, fog: false}));
			
			this.meshEyeRight = new THREE.Mesh(VR.utils.generateDistortionMesh({k1:0.02, k2: 0.02, quality:6}), new THREE.MeshBasicMaterial({wireframe: false, map: this.targetEyeRight, shading: THREE.FlatShading, fog: false}));
			
			this.meshEyeLeft.position.set( -256, 0, -1);
			this.meshEyeLeft.scale.set(512,512,1);
			this.meshEyeRight.position.set( 256, 0, -1);
			this.meshEyeRight.scale.set(512,512,1);
			
			this.outputScene.add(this.meshEyeLeft);
			this.outputScene.add(this.meshEyeRight);
		},
		start: function(timeSince, timeSince3){
			var that = this;
			requestAnimationFrame(function(timeSince2) {that.start(timeSince2, timeSince2 - timeSince)});
			this.render(timeSince3 ? timeSince3 : 0.01);
		},
		render: function(timeSince) {
			this.renderer.clear();
			
			this.options.source.onFrame(timeSince);
			
			this.renderer.setClearColor( 0x000000, 1 );
			this.renderer.render(this.scene, this.perspective.left.camera, this.targetEyeLeft, false);
			switch (this.options.mode) {
				case 'SBS': {
					this.renderer.render(this.scene, this.perspective.right.camera, this.targetEyeRight, false);
				} break;
			}
			
			this.renderer.setClearColor( 0xFF0000, 1 );
			this.renderer.setViewport(0, 0, 1024, 512);
			this.renderer.render(this.outputScene, this.outputCamera, undefined, true);
		}
	};
	
}());