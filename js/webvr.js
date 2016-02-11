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
		
	});
	VR.clazz.Eye.prototype = $.extend({}, Object.create( THREE.Object3D.prototype ), {
		camera: undefined,
		init: function(){
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
		this.initHead($.extend({}, {ipd:62}, options));
	});
	VR.clazz.Head.prototype = $.extend({}, Object.create( THREE.Object3D.prototype ), {
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
	
	VR.clazz.Instance = (function(containerElement) {
		this.initInstance(containerElement);
	});
	
	VR.clazz.Instance.prototype = {
		container: undefined,
		scene: undefined,
		camera: undefined,
		renderer: undefined,
		cameras: undefined,
		perspective: undefined,
		constructor: VR.clazz.Instance,
		initInstance: function(containerElement){
			this.container = containerElement;
			this.scene = new THREE.Scene();
			this.camera = new THREE.PerspectiveCamera( 75, 1, 0.1, 1000 );
			this.renderer = new THREE.WebGLRenderer();
			this.cameras = {};
			
			this.renderer.setSize(1024, 1024);
			this.container.append(this.renderer.domElement );
			this.perspective = new VR.clazz.Head();
			this.cameras['main'] = this.perspective;
			this.scene.add(this.perspective);
		},
		start: function(){
			requestAnimationFrame(this.render);
			this.render();
		},
		render: function() {
			
		}
	};

/*	
	VR.methods.animate = (function(){
		requestAnimationFrame(VR.methods.animate);
		VR.methods.render(VR.instance);
	});
	
	VR.methods.render = (function(instance){
		
	});
	*/
	
}());


$(function(){
	
	VR.instance = new VR.clazz.Instance($('#webvr'));

	VR.instance.start();
	
	//VR.methods.animate();
});