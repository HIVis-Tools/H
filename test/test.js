


var H = require('../src/H.js');
var $ = require('jquery');

var assert = require('chai').assert;

var settings = {
	width: 1000,
	height: 400,
	id: "alignment",
	target:"body"
};
var aln = {
	    "header": {
	        "names": ["ref","query"],
	        "starts": ["1","1"],
	        "alignment_start": 1
	    },
	    "alignment": [
	        ["A", "A"],
	        ["C", "C"],
	        ["C", "-"],
	        ["-", "T"],
	        ["G", "G"],
	        ["T", "-"],
	        ["A", "A"]
	    ]
	};
describe('H', function () {
	it('should create a SVG element', function () {
		var component = H.init(settings);
		assert.equal($("#"+settings.id).attr("width"), settings.width);
		$("#"+settings.id).remove();
	});
	
//	it('should load a sample alignment', function () {
//		var component = H.init(settings);
//		component.load(aln);
//		component.draw();
//		assert.equal($("#track_0 text").html(), aln.header.names[0]);
//		assert.equal($("#track_1 text").html(), aln.header.names[1]);
//	});
});