(function(){
	window.VR = window.VR || {};
	VR.utils = VR.utils || {};
	
	VR.utils.generateDistortionMesh = function(options){
		options = $.extend({}, {left: true, k1:0, k2: 0, quality: 16}, options);
		var lines, columns, leftEye, k1, k2, numVertices, numFaces, indexCount, center, x, y, geom, vertex = {x:0,y:0,z:0}, tIndex, bIndex;
		k1 = options.k1;
		k2 = options.k2;
		leftEye = options.left === true;
		columns = lines = options.quality;
		// Numbers Stuff
		numVertices = (lines + 1) * (columns + 1);
		numFaces = lines * columns;
		indexCount = numFaces * 6;
		center = {x:0, y:0};
		
		geom = new THREE.Geometry();
	
		for (y=0; y<=lines; y++) {
			for(x=0; x<=columns; x++){
				var index = y*(lines+1)+x;
				
				var rSqr = Math.pow(center.x-((x* 1.0)/(columns * 1.0)),2) + Math.pow (center.y-((y * 1.0)/(lines * 1.0)),2);
				var rMod = 1+k1*rSqr+k2*rSqr*rSqr;
				
				vertex.x = ((x * 1.0)/(columns * 1.0) - center.x)/(rMod * 1.0) + center.x - 0.5;
				vertex.y = ((y * 1.0)/(lines * 1.0) - center.y)/(rMod * 1.0) + center.y - 0.5;
				
				console.log(vertex);
				
				geom.vertices.push(new THREE.Vector3(vertex.x,vertex.y,vertex.z));
				
			/*
            points[index].x = vertex.x;
            points[index].y = vertex.y;
            points[index].z = 0;
            
            points[index].ux = (float)x/(float)columns;
            points[index].uy = (float)y/(float)lines;
            
            if(x<_columns && y<lines){
                for(int v=0; v < 6; v++){
                    indexes[numQuad*6+v] = index + ((v>=2 && v!=3) ? _columns : 0) + ((v==0) ? 0 : (v/5)+1);
                }
                numQuad++;
            }*/
			}
		}
	
		for (y=1; y<=lines; y++) {
			for(x=0; x < columns; x++){
				tIndex =  ((y - 1) * columns) + x;
				bIndex =  (y * columns) + x;
				// Left face
				geom.faces.push( new THREE.Face3( bIndex, tIndex, tIndex + 1) );
				// Right Face
				geom.faces.push( new THREE.Face3( bIndex, tIndex + 1, bIndex + 1) );
			}
		}
	
	
		for (y=0; y<=lines; y++) {
			for(x=0; x<=columns; x++){
				
			}
		}
	};
	
}());