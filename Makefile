FILES = src/jump.js\
		src/osmtiles.js\
		src/touchcontroller.js\
		src/mousecontroller.js\
		src/clickcontroller.js\
		src/attribution.js\
		src/coordinates.js\
		src/marker.js

jump:
	@@cat ${FILES} > jump.js

min: 
	@@curl --data-urlencode js_code@jump.js --data output_info=compiled_code http://closure-compiler.appspot.com/compile > jump.min.js
