(function(){
	window.VR = window.VR || {};
	VR.utils = VR.utils || {};
	
	VR.utils.generateDistortionMesh = function(options){
		options = $.extend({}, {left: true, k1:0, k2: 0, quality: 16}, options);
		var lines, columns, leftEye, k1, k2, numVertices, numFaces, indexCount, center, x, y, geom, vertex = {x:0,y:0,z:0}, tIndex, bIndex, fIndex = 0, lx, hx, ly, hy;
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
				
				//console.log(vertex);
				
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
				tIndex =  ((y - 1) * (columns + 1)) + x;
				bIndex =  (y * (columns + 1)) + x;
				
				lx = (x * 1.0) / (columns * 1.0);
				hx = ((x + 1) * 1.0) / (columns * 1.0);
				ly = (y * 1.0) / (lines * 1.0);
				hy = ((y - 1) * 1.0) / (lines * 1.0);
				
				// Left face
				geom.faces.push( new THREE.Face3( bIndex, tIndex, tIndex + 1) );
				
				geom.faceVertexUvs[0].push([
					new THREE.Vector2(lx, ly),
					new THREE.Vector2(lx, hy),
					new THREE.Vector2(hx, hy)
				]);
				
				// Right Face
				geom.faces.push( new THREE.Face3( bIndex, tIndex + 1, bIndex + 1) );
				
				geom.faceVertexUvs[0].push([
					new THREE.Vector2(lx, ly),
					new THREE.Vector2(hx, hy),
					new THREE.Vector2(hx, ly)
				]);
			}
		}
	
		/*
		for (y=0; y<=lines - 1; y++) {
			for(x=0; x<=columns; x++){
				
				points[index].ux = (float)x/(float)columns;
				points[index].uy = (float)y/(float)lines;
				
				geometry.faceVertexUvs[(y * columns) + x].push([
					new THREE.Vector2(v1[components[0]], v1[components[1]]),
					new THREE.Vector2(v2[components[0]], v2[components[1]]),
					new THREE.Vector2(v3[components[0]], v3[components[1]])
				]);
			}
		}
		*/
		
		geom.uvsNeedUpdate = true;
		
		return geom;
	};
	
}());