var d3 = require('d3');
var $ = require('jquery');


var H =  {
	svg:null,
	alignment:null,
	settings:null,
	border:2,
	
	init: function(settings){
		var self = this;
		self.settings = settings;
		self.svg = d3.select(settings.target).append("svg")
		    .attr("id", settings.id)
		    .attr("width", settings.width)
		    .attr("height", settings.height).append("g");
        return self;
	},
	load: function(alignment){
		var self = this;
		self.alignment=alignment;
		self.coordinates=[];
		var first=self.alignment.header.alignment_start;
		var previous=[];
		for (var j=0;j<self.alignment.alignment[0].length;j++){
			if (self.alignment.alignment[0][j]=="-")
				previous.push((first-1)+".a");
			else
				previous.push(first);
		}
		self.coordinates.push(previous);
		for (var i=1;i<self.alignment.alignment.length;i++){
			var current=[];
			for (var j=0;j<self.alignment.alignment[i].length;j++){
				
				if (self.alignment.alignment[i][j]=="-"){
					if (isNaN(previous[j])){
						var parts = previous[j].split(".");
						current.push(parts[0]+"."+self._nextLetter(parts[1]));
					}else
						current.push(previous[j]+".a");
				}else if (isNaN(previous[j])){
					var parts = previous[j].split(".");
					current.push(+parts[0]+1);
				}else
					current.push(previous[j]+1);
			}
			self.coordinates.push(current);
			previous=current;
		}
	},
	draw: function(){
		var self = this;
		var base_side =self.settings.height/4;
		var first=self.alignment.header.alignment_start;

		self.svg.append("rect")
			.attr("width",self.settings.width)
			.attr("height",self.settings.height)
			.attr("class","background");
		
		var tracks = self.svg.selectAll(".track")
			.data(self.alignment.header.names)
			.enter().insert("g")
				.attr("id", function (d,i){ return "track_"+i;})
				.attr("class", "track")
				.attr("transform", function (d,i){ return "translate(0,"+((i+2) * base_side)+")" ; });

		tracks.append("rect")
			.attr("x", base_side*1.5)
			.attr("y", -0.5*base_side)
			.attr("width",self.settings.width-3)
			.attr("height",base_side);
		
		var seq_names = tracks.append("text")
			.text(function (d,i){ return d;})
			.attr("class", "sequence_name");
		
		
		var pairbases = self.svg.insert("g").insert("g");
		
		self.svg.append("clipPath")
			.attr("id","clip_path").append("rect")
			.attr("x", base_side*1.5)
			.attr("y", base_side)
			.attr("width",self.settings.width-(base_side*1.5))
			.attr("height",base_side*3);

		pairbases.attr("clip-path","url(#clip_path)");

		var pairbase = pairbases.selectAll(".pairbase")
			.data(self.alignment.alignment)
			.enter().insert("g")
				.attr("id", function (d,i){ return "pairbase_"+i;})
				.attr("class", "pairbase")
				.attr("transform", function (d,i){ return "translate("+((i+2) * base_side)+","+( 2 * base_side)+")" ; });

		
		var aln_coordinates = pairbases.append("g")
			.attr("class", "track")
			.selectAll(".coordinate")
			.data(d3.range(first,first+self.alignment.alignment.length))
			.enter().append("text")
				.text(function (d,i){ return "-"+d+"-";})
				.attr("x", function (d,i){ return (i+2) * base_side;})
				.attr("y", function (d,i){ return base_side*1.5 -5;})
				.attr("text-anchor","middle")
				.attr("class", "coordinate");
		
		
		pairbase.each(function(d,i){
			self.drawBases(d,i,self);
		});
		
		function zoom() {
			//console.log( d3.event.translate);
			pairbases.attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(1)");
			self.svg.selectAll("#clip_path").attr("transform", "translate(" + -d3.event.translate[0] + ",0)scale(1)");
		}
		self.svg.append("rect")
			.attr("width",self.settings.width)
			.attr("height",self.settings.height)
			.call(d3.behavior.zoom().scaleExtent([0.3, 8]).on("zoom", zoom))
			.style("opacity",0);


	},
	drawBases: function(d,i,self){
		var base_side =self.settings.height/4;
		var original_pos=[];
		self.settings.alignment_start;
		for (var j=0;j<d.length;j++){
			var g = d3.selectAll("#pairbase_"+i)
				.classed(
						(d[0]=="-" || d[1]=="-")?"gap": (d[0]==d[1])?"match":"mismatch"
				,true);
			g.append("rect")
				.attr("x", -0.5*base_side+self.border)
				.attr("y", (j-0.5)*base_side+self.border)
				.attr("width",base_side- 2*self.border)
				.attr("height",base_side- 2*self.border);

			g.append("text")
				.text( d[j])
				.attr("class", "bases_labels")
				.attr("x", (-0.125)*base_side)
				.attr("y", (j+0.125)*base_side)
				.style("font-size", (base_side/2));
			
			g.append("text")
				.text( self.coordinates[i][j])
				.attr("class", "position_label")
				.attr("x", (-0.4)*base_side)
				.attr("y", (j-0.3)*base_side)
				.style("font-size", (base_side/7));
			
//			g.append("text")
//				.text( self.coordinates[i][j==0?1:0])
//				.attr("class", "position_label")
//				.attr("x", (0.2)*base_side)
//				.attr("y", (j+0.3)*base_side)
//				.style("font-size", (base_side/8));
		}
	},
	_nextLetter: function (s){
	    return s.replace(/([a-zA-Z])[^a-zA-Z]*$/, function(a){
	        var c= a.charCodeAt(0);
	        switch(c){
	            case 90: return 'A';
	            case 122: return 'a';
	            default: return String.fromCharCode(++c);
	        }
	    });
	}
};

module.exports = H;