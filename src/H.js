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

		//background
		self.svg.append("rect")
			.attr("width",self.settings.width)
			.attr("height",self.settings.height)
			.attr("class","background");
		
		
		//pairbases
		var pairbases = self.svg.insert("g").insert("g");
		pairbases.pos=0;
		
//		self.svg.append("clipPath")
//			.attr("id","clip_path").append("rect")
//			.attr("x", base_side*1.5)
//			.attr("y", base_side)
//			.attr("width",self.settings.width-(base_side*1.5))
//			.attr("height",base_side*3);
//
//		pairbases.attr("clip-path","url(#clip_path)");

		var pairbase = pairbases.selectAll(".pairbase")
			.data(self.alignment.alignment)
			.enter().insert("g")
				.attr("id", function (d,i){ return "pairbase_"+i;})
				.attr("class", "pairbase")
				.attr("transform", function (d,i){ return "translate("+((i+2) * base_side)+","+( 2 * base_side)+")" ; });

		
		
		var tracks = self.svg.selectAll(".track")
			.data(self.alignment.header.names)
				.enter().insert("g")
					.attr("id", function (d,i){ 
						return "track_"+i;})
					.attr("class", "track")
					.attr("transform", function (d,i){ return "translate(0,"+((i+2) * base_side)+")" ; });
	
		tracks.append("rect")
			.attr("x", 0)
			.attr("y", -0.7*base_side )
			.attr("width",base_side*1.5)
			.attr("height",base_side*1.2)
			.style("fill","white");
		tracks.append("rect")
			.attr("x", base_side*1.5)
			.attr("y", -0.5*base_side)
			.attr("width",self.settings.width-3)
			.attr("height",base_side)
			.style("opacity",0);
		
		var seq_names = tracks.append("text")
		.text(function (d,i){ return d;})
		.attr("class", "sequence_name");

		
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

//		var zoom = d3.behavior.zoom().
//			scaleExtent([1,1]).
//			on("zoom", function() {
//				//console.log( d3.event.translate);
//				if (d3.event.translate[0]>0){
//					zoom.translate([0, d3.event.translate[1]]);
//					return;
//				}else if (d3.event.translate[0]<2.5*base_side-self.settings.width) {
//					zoom.translate([2.5*base_side-self.settings.width, d3.event.translate[1]]);
//					return;
//				}
//				pairbases.attr("transform", "translate(" + d3.event.translate[0] + ",0)scale(1)");
//				self.svg.selectAll("#clip_path").attr("transform", "translate(" + -d3.event.translate[0] + ",0)scale(1)");
//			});
		
		var drag = d3.behavior.drag().
			on("drag", function() {
				var limit =self.settings.width-(self.alignment.alignment.length+2.5)*base_side;
				pairbases.pos += d3.event.dx;
				if (pairbases.pos>0) pairbases.pos=0;
				if (pairbases.pos<limit) pairbases.pos=limit;

				pairbases.attr("transform", "translate(" + pairbases.pos + ",0)scale(1)");
			});
		self.svg.append("rect")
			.attr("width",self.settings.width)
			.attr("height",2* base_side)
			.attr("x", 1.5*base_side)
			.attr("y", 1.5*base_side)
			.call(drag)
			.style("opacity",0);


	},
	drawBases: function(d,i,self){
		var base_side =self.settings.height/4;
		var original_pos=[];
		self.settings.alignment_start;
		for (var j=0;j<d.length;j++){
			//group
			var g = d3.selectAll("#pairbase_"+i)
				.classed(
						(d[0]=="-" || d[1]=="-")?"gap": (d[0]==d[1])?"match":"mismatch"
				,true);
			//bases background
			g.append("rect")
				.attr("class", "bases_bg")
				.attr("x", -0.5*base_side+self.border)
				.attr("y", (j-0.5)*base_side+self.border)
				.attr("width",base_side- 2*self.border)
				.attr("height",base_side- 2*self.border);
			
			//labels
			g.append("text")
				.text( d[j])
				.attr("class", "bases_labels")
				.attr("x", (-0.125)*base_side)
				.attr("y", (j+0.125)*base_side)
				.attr("line_number", j)
				.style("font-size", (base_side/2));
			
			//top ;left coordinate
			g.append("text")
				.text( self.coordinates[i][j])
				.attr("class", "position_label label_tl")
				.attr("x", (-0.4)*base_side)
				.attr("y", (j-0.3)*base_side)
				.attr("line_number", j)
				.style("font-size", (base_side/7));
			
			//bottom right
			g.append("text")
				.text( self.coordinates[i][j==0?1:0])
				.attr("class", "position_label label_br")
				.attr("x", (0.2)*base_side)
				.attr("y", (j+0.4)*base_side)
				.attr("line_number", j)
				.style("font-size", (base_side/8));
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
	},
	currentView:"web",
	toPrintView: function(){
		var self = this;
		var base_side =self.settings.height/4;
		if (self.currentView!="print"){
			//Moving the whole pairbase
			d3.selectAll(".pairbase")
				.transition()
					.attr("transform", function (d,i){ return "translate("+(2*base_side +i*base_side/3)+","+( 2 * base_side)+")" ; });

			//Move the base
			d3.selectAll(".bases_labels")
				.transition()
					.attr("transform", "translate("+(-0.3*base_side)+","+(-0.3*base_side)+")")
					.style("font-size", (base_side/3))
					.attr("y",function(d,i){
						var j = +d3.select(this).attr("line_number");
						return (j+0.125)*base_side -base_side*j/3;
					});
			
			//move the top coordinate
			d3.selectAll(".label_tl")
				.transition()
					.attr("transform", "translate(0,"+(-0.1*base_side)+")")
					.style("font-size", (base_side/8))
					.attr("y",function(d,i){
						var j = +d3.select(this).attr("line_number");
						return (j-0.3)*base_side -base_side*j/3;
					});
			
			//move the bottom coordinate
			d3.selectAll(".label_br")
				.transition()
					.attr("transform", "translate("+(-0.6*base_side)+","+(-0.45*base_side)+")")
					.style("font-size", (base_side/8))
					.attr("y",function(d,i){
						var j = +d3.select(this).attr("line_number");
						return (j+0.4)*base_side -base_side*j/3;
					});
			
			//resize the background
			d3.selectAll(".bases_bg")
				.transition()
					.style("opacity","0");


			self.currentView = "print";
		}
	},
	toWebView: function(){
		var self = this;
		var base_side =self.settings.height/4;
		if (self.currentView!="web"){
			//Moving the whole pairbase
			d3.selectAll(".pairbase")
				.transition()
					.attr("transform", function (d,i){ return "translate("+((i+2) * base_side)+","+( 2 * base_side)+")" ; });


			d3.selectAll(".bases_labels")
				.transition()
					.attr("transform", "translate(0,0)")
					.style("font-size", (base_side/2))
					.attr("y",function(d,i){
						var j = +d3.select(this).attr("line_number");
						return (j+0.125)*base_side;
					});
			
			//move the top coordinate
			d3.selectAll(".label_tl")
			.transition()
				.attr("transform", "translate(0,0)")
				.style("font-size", (base_side/7))
				.attr("y",function(d,i){
					var j = +d3.select(this).attr("line_number");
					return (j-0.3)*base_side;
				});


			//move the top coordinate
			d3.selectAll(".label_br")
				.transition()
					.attr("transform", "translate(0,0)")
					.style("font-size", (base_side/7))
					.attr("y",function(d,i){
						var j = +d3.select(this).attr("line_number");
						return (j+0.4)*base_side;
					});

			d3.selectAll(".bases_bg")
				.transition()
					.style("opacity","1");
			self.currentView = "web";
		}
	},
	toggleView: function(){
		var self = this;
		if (self.currentView == "web")
			self.toPrintView();
		else if (self.currentView == "print")
			self.toWebView();
	}
};

module.exports = H;