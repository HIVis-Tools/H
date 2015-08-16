var d3 = require('d3');
var $ = require('jquery');


var H =  {
	svg:null,
	alignment:null,
	settings:null,
	border:2,
	
	init: function(settings){
		var self = this;
		self.dispatcher = d3.dispatch("locationchange");
		self.settings = settings;
		if (typeof settings.id ==  "undefined") 	self.settings.id ="alignment";
		if (typeof settings.target ==  "undefined") self.settings.target ="#holder";
		self.svg = d3.select(settings.target).append("svg")
		    .attr("id", settings.id)
		    .attr("width", "100%")
		    .attr("height", "100%").append("g");
		d3.select(window).on('resize', self.redraw(self));
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
	base_side:0,
	draw: function(){
		var self = this;
		var first=self.alignment.header.alignment_start;
		var current_w= $(self.settings.target).width();
		var current_h= $(self.settings.target).height();
		self.base_side =current_h/2.2;

		//background
		self.svg.append("rect")
			.attr("width","100%")
			.attr("height","100%")
			.attr("class","background");
		
		
		//pairbases
		var pairbases = self.svg.insert("g")
			.insert("g")
			.attr("class","group_pb")
			.attr("drag_pos","0");
		self.pairbases= pairbases;
		pairbases.pos=0;
		
		var pairbase = pairbases.selectAll(".pairbase")
			.data(self.alignment.alignment)
			.enter().insert("g")
				.attr("id", function (d,i){ return "pairbase_"+i;})
				.attr("class", "pairbase")
				.attr("transform", function (d,i){
					return "translate("+((i+2) * self.base_side)+","+( 0.7*self.base_side)+")" ;
				});

		
		
		var tracks = self.svg.selectAll(".track")
			.data(self.alignment.header.names)
				.enter().insert("g")
					.attr("id", function (d,i){ 
						return "track_"+i;})
					.attr("class", "track")
					.attr("transform", function (d,i){ return "translate(0,"+((i+0.4) * self.base_side)+")" ; });
	
		tracks.append("rect")
			.attr("x", 0)
			.attr("y", -0.4*self.base_side )
			.attr("width",self.base_side*1.5)
			.attr("height",self.base_side*1.2)
			.style("fill","white");
		tracks.append("rect")
			.attr("x", self.base_side*1.5)
			.attr("y", -0.2*self.base_side)
			.attr("width","100%")
			.attr("height",self.base_side)
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
				.attr("x", function (d,i){ return (i+2) * self.base_side;})
				.attr("y", function (d,i){ return self.base_side*0.2 -5;})
				.attr("text-anchor","middle")
				.attr("class", "coordinate");
		
		
		pairbase.each(function(d,i){
			self.drawBases(d,i,self.base_side,self);
		});

		var drag = d3.behavior.drag().
			on("drag", function() {
				var limit =current_w-(self.alignment.alignment.length+2.5)*self.base_side;
				pairbases.pos = pairbases.attr("drag_pos")*1;
				if (d3.event!=null)
					pairbases.pos += d3.event.dx;
				if (pairbases.pos>0) pairbases.pos=0;
				if (pairbases.pos<limit) pairbases.pos=limit;
				pairbases.attr("drag_pos",pairbases.pos);

				pairbases.attr("transform", "translate(" + pairbases.pos + ",0)scale(1)");
				self.dispatcher.locationchange(pairbases.pos, Math.abs(100*pairbases.pos/limit));
			});
		self.drag=drag;
		self.svg.append("rect")
			.attr("class", "toucharea")
			.attr("width",current_w)
			.attr("height",2* self.base_side)
			.attr("x", 1.5*self.base_side)
			.attr("y", 0.5*self.base_side)
			.call(drag)
			.style("opacity",0);


	},
	drawBases: function(d,i,base_side,self){
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
		self.base_side = 60;
		var ch_per_line= $(self.settings.target).width()/(self.base_side/2.7);
		ch_per_line = ch_per_line - ch_per_line%10;
		if (self.currentView!="print"){
			self.move(0);
		}
		//Moving the whole pairbase
		d3.selectAll(".pairbase")
			.transition()
				.attr("transform", function (d,i){
					return "translate("+(self.base_side/2 +(i%ch_per_line)*self.base_side/3)+","+
											( 2 * self.base_side*Math.floor(i/ch_per_line)*0.7+self.base_side/2)+")" ;
				});

		d3.selectAll("g.track").style("visibility","hidden");
		//Move the base
		d3.selectAll(".bases_labels")
			.transition()
				.attr("transform", "translate("+(-0.3*self.base_side)+","+(-0.3*self.base_side)+")")
				.style("font-size", (self.base_side/3))
				.attr("x",function(d,i){
					var index =Math.floor(i/2)%ch_per_line;
					return (0.4*Math.floor(index/10)-0.125)*self.base_side;
				})
				.attr("y",function(d,i){
					var j = +d3.select(this).attr("line_number");
					return (j+0.125)*self.base_side - self.base_side*j/2;
				});

		//move the top coordinate
		d3.selectAll(".label_tl")
			.transition()
				.attr("transform", "translate(0,"+(-0.1*self.base_side)+")")
				.style("font-size", (self.base_side/8))
				.attr("x",function(d,i){
					var index =Math.floor(i/2)%ch_per_line;
					return (0.4*Math.floor(index/10)-0.4)*self.base_side;
				})
				.attr("y",function(d,i){
					var j = +d3.select(this).attr("line_number");
					return (j-0.3)*self.base_side -self.base_side*j/2;
				});

		//move the bottom coordinate
		d3.selectAll(".label_br")
			.transition()
				.attr("transform", "translate("+(-0.6*self.base_side)+","+(-0.45*self.base_side)+")")
				.style("font-size", (self.base_side/8))
				.attr("x",function(d,i){
					var index =Math.floor(i/2)%ch_per_line;
					return (0.4*Math.floor(index/10)+0.2)*self.base_side;
				})
				.attr("y",function(d,i){
					var j = +d3.select(this).attr("line_number");
					return (j+0.4)*self.base_side -self.base_side*j/2;
				});

		//resize the background
		d3.selectAll(".bases_bg")
			.transition()
				.style("opacity","0");


		self.currentView = "print";
	},
	toWebView: function(){
		var self = this;
		var current_h= $(self.settings.target).height();
		self.base_side =current_h/2.2;
//		if (self.currentView!="web"){
			//Moving the whole pairbase
			d3.selectAll(".pairbase")
				.transition()
					.attr("transform", function (d,i){
						return "translate("+((i+2) * self.base_side)+","+( 0.7*self.base_side)+")" ;
					});
			d3.selectAll("g.track").style("visibility",null);
			d3.selectAll(".bases_labels")
				.transition()
					.attr("transform", "translate(0,0)")
					.style("font-size", (self.base_side/2))
					.attr("x",function(d,i){
						return (-0.125)*self.base_side;
					})
					.attr("y",function(d,i){
						var j = +d3.select(this).attr("line_number");
						return (j+0.125)*self.base_side;
					});
			
			//move the top coordinate
			d3.selectAll(".label_tl")
			.transition()
				.attr("transform", "translate(0,0)")
				.style("font-size", (self.base_side/7))
				.attr("x",function(d,i){
					return (-0.4)*self.base_side;
				})
				.attr("y",function(d,i){
					var j = +d3.select(this).attr("line_number");
					return (j-0.3)*self.base_side;
				});


			//move the bottom coordinate
			d3.selectAll(".label_br")
				.transition()
					.attr("transform", "translate(0,0)")
					.style("font-size", (self.base_side/7))
					.attr("x",function(d,i){
						return (0.2)*self.base_side;
					})
					.attr("y",function(d,i){
						var j = +d3.select(this).attr("line_number");
						return (j+0.4)*self.base_side;
					});

			d3.selectAll(".bases_bg")
				.transition()
					.style("opacity","1");
			self.currentView = "web";
//		}
	},
	toggleView: function(){
		var self = this;
		if (self.currentView == "web"){
			self.pairbases.pos=0;
			self.drag.on("drag")();
			self.toPrintView();
		}else if (self.currentView == "print")
			self.toWebView();
	},
	redraw: function(self){
		return function(){
			if (self.currentView == "web"){
				self.toWebView();
			}else if (self.currentView == "print")
				self.toPrintView();
		};
	},
	move: function(per){
		var self = this;
		if (self.currentView == "web") {
			var pairbases = self.svg.selectAll(".group_pb");
			var current_w = $(self.settings.target).width();
			var limit = current_w - (self.alignment.alignment.length + 2.5) * self.base_side;
			var move =per*1*limit/100;
			pairbases.pos = move;
			pairbases.attr("drag_pos",pairbases.pos);
			pairbases.attr("transform", "translate(" + pairbases.pos + ",0)scale(1)");
		}
	}
};

module.exports = H;