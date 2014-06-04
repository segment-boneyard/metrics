build: component.json $(shell find lib/*/*)
	component build
	myth build/build.css build/build.css
	minify build/build.css > build/build.min.css
	minify build/build.js > build/build.min.js

watch:
	watch make build > /dev/null

server:
	serve