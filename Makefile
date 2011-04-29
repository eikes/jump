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
