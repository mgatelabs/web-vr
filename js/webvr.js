(function(){
	window.VR = window.VR || {};
	VR.instance = {};
	VR.methods = {};
	VR.clazz = {};
	
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
		outputScene:undefined,
		outputCamera: undefined,
		constructor: VR.clazz.Instance,
		initInstance: function(options){
			this.options = $.extend({}, {mode: 'MONO'}, options);
			this.container = this.options.el;
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
			this.targetEyeLeft = new THREE.WebGLRenderTarget(256, 256, {});
			switch (this.options.mode) {
				case 'SBS': {
					this.targetEyeRight = new THREE.WebGLRenderTarget(256, 256, {});
				} break;
				default: {
					this.eyeRight = nil;
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
			
			// Framework
			var width = 512;
			var height = 256;
			this.outputScene = new THREE.Scene();
			this.outputCamera = new THREE.OrthographicCamera( width / - 2, width / 2, height / 2, height / - 2, 1, 10 );
			this.outputScene.add(this.outputCamera);
		},
		start: function(){
			var that = this;
			requestAnimationFrame(function() {that.render()});
			this.render();
		},
		render: function() {
			
			this.renderer.clear();
			this.renderer.setViewport(0, 0, 256, 256);
			this.renderer.render(this.scene, this.perspective.left.camera, this.targetEyeLeft, true);
			switch (this.options.mode) {
				case 'SBS': {
					this.renderer.clear();
					this.renderer.setViewport(0, 0, 256, 256);
					this.renderer.render(this.scene, this.perspective.right.camera, this.targetEyeRight, true);
				} break;
			}
			
			this.renderer.setViewport(0, 0, 256, 256);
			
			this.renderer.setViewport(256, 0, 256, 256);
		}
	};
	
}());


$(function(){
	
	VR.instance = new VR.clazz.Instance({el:$('#webvr'), mode:'SBS'});

	VR.instance.start();
	
	//VR.methods.animate();
});