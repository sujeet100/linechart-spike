 var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];
 var DEFAULT_CIRCLE_RADIUS = 6;
 var CIRCLE_RADIUS_ON_HOVER = 8;
 var OUTER_CIRCLE_RADIUS = 12;
 var MARKER_COLOR = "#0F254B";
 var MARKER_COLOR_ON_HOVER="#228BC5"
 var plotMargin=0.8;


function getDate(d) {
 var dt = new Date(d.date);
 dt.setHours(0);
 dt.setMinutes(0);
 dt.setSeconds(0);
 dt.setMilliseconds(0);
 return dt;
 }


function showDataInTooltip(obj, d, x ,y) {
	 var tip = d3.select(".tip");
	 tip.style("left", (x+100) + "px" );
	 tip.style("top", (y-175) + "px");
	 $(".tip").html(d);
	 $(".tip").show();
 }
 
function hideDataInTooltip() {
 $(".tip").hide();
 }
 
var drawChart = function(data) {
 // define dimensions of graph
 var m = [20, 40, 20, 100]; // margins
 var w = 700 - m[1] - m[3]; // width
 var h = 360 - m[0] - m[2]; // height
 
data.sort(function(a, b) {
	 var d1 = getDate(a);
	 var d2 = getDate(b);
	 if (d1 == d2) return 0;
	 if (d1 > d2) return 1;
	 return -1;
 });
 
// get max and min dates - this assumes data is sorted
 var minDate = getDate(data[0]);
 var maxDate = getDate(data[data.length-1]);
 
 var x = d3.scale.linear().domain([new Date(minDate.setDate(0)).getMonth(), maxDate.getMonth()]).range([0, w]);
 
// X scale will fit all values from data[] within pixels 0-w
 //var x = d3.scale.linear().domain([0, data.length]).range([0, w]);
 // Y scale will fit values from 0-10 within pixels h-0 (Note the inverted domain for the y-scale: bigger is up!)
 var minAmount = d3.min(data,function(d) { return d.billAmount; });
 var maxAmount = d3.max(data, function(d) { return d.billAmount; });
 var mean = d3.mean(data, function(d) { return d.billAmount; })
 var range = maxAmount -  minAmount;
 var y = d3.scale.linear().domain([minAmount-plotMargin*range, maxAmount+plotMargin*range]).range([h, 0]);
 
// create a line function that can convert data[] into x and y points
 var line = d3.svg.line()
 // assign the X function to plot our line as we wish
 .x(function(d, i) {
 // return the X coordinate where we want to plot this datapoint
 return x(getDate(d).getMonth()); //x(i);
 })
 .y(function(d) {
 // return the Y coordinate where we want to plot this datapoint
 return y(d.billAmount);
 });
 
 function xx(e) { return x(getDate(e).getMonth()); };
 function yy(e) { return y(e.billAmount); };
 
 
// Add an SVG element with the desired dimensions and margin.
 var graph = d3.select("#chart").append("svg")
 .attr("preserveAspectRatio","xMinYMin meet")
 .attr("viewBox","0 0 800 960")
 .attr("width","800")
 .attr("height","960")
 .append("g")
 .attr("transform", "translate(" + m[3] + "," + m[0] + ")");
 
// create yAxis
 var xAxis = d3.svg.axis().scale(x).ticks(10).tickFormat(function(d){
 	return months[d];
 });

 // Add the x-axis.
 graph.append("g")
 .attr("class", "x axis")
 .attr("transform", "translate(0," + h + ")")
 .call(xAxis);
 
// create left yAxis
 var yAxisLeft = d3.svg.axis().scale(y).ticks(10).orient("left").tickSize(0);
 
 // Add the y-axis to the left
 graph.append("svg:g")
 .attr("class", "y axis")
 .attr("transform", "translate(0,0)")
 .call(yAxisLeft);
 

//mean line
 graph.append("line")
 	.attr("class", "average-line")
 	.attr("x1", 0)
 	.attr("y1", y(mean))
 	.attr("x2", w)
 	.attr("y2", y(mean))
 	.attr("stroke-width", 1)
    .attr("stroke", "steelblue");


// Add the line by appending an svg:path element with the data line we created above
 // do this AFTER the axes above so that the line is above the tick-lines
 graph.append("svg:path").attr("d", line(data));
 graph.append("svg:text")
 .attr("x", -200)
 .attr("y", -90)
 .attr("dy", ".1em")
 .attr("transform", "rotate(-90)")
 .text("Bill");


 //markers
 graph
 .selectAll("circle")
 .data(data)
 .enter().append("circle")
 .attr("r", DEFAULT_CIRCLE_RADIUS)
 .attr("cx", xx)
 .attr("cy", yy)
 .attr("fill",MARKER_COLOR)
 .on("mouseenter", function(d) { 
 	showDataInTooltip(this, "&pound;"+d.billAmount, xx(d), yy(d));
 	
 	//change radius and color of marker
 	d3.select(this)
 	.attr("r", CIRCLE_RADIUS_ON_HOVER)
 	.attr("fill",MARKER_COLOR_ON_HOVER);
 	
 	//add an outer circle to marker
 	graph.append("circle") 
 	 .attr("r", OUTER_CIRCLE_RADIUS)
	 .attr("cx", d3.select(this).attr("cx"))
	 .attr("class","outer")
	 .attr("fill", MARKER_COLOR_ON_HOVER)
	 .attr('fill-opacity', 0.5)
	 .attr("cy", d3.select(this).attr("cy"))
	 .attr("pointer-events", "none") //disable pointer events for outer circle
})
 .on("mouseleave", function(){
 	hideDataInTooltip();
 	d3.select(this).attr("r", DEFAULT_CIRCLE_RADIUS).attr("fill",MARKER_COLOR);
 	d3.select("circle.outer").remove() 
 });
 //tooltip container
 $("#chart").append("<div class='tip' style='display:none;'>Test</div>");
 }
 
var draw = function() {
 var data = [ {'date': "2012/10/01", 'billAmount': 27.4},
  {'date': "2012/09/01", 'billAmount': 25},
   {'date': "2012/08/01", 'billAmount': 26.66},
    {'date': "2012/07/01", 'billAmount': 32},
     {'date': "2012/06/01", 'billAmount': 25.8},
     {'date': "2012/05/01", 'billAmount': 23.8}];
 drawChart(data);
 }