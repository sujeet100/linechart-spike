var baseWidth = 700;
var baseHeight = 360;
var margins = [20, 20, 20, 20];
var width = baseWidth - margins[1] - margins[3];
var height = baseHeight - margins[0] - margins[2];
var viewBox = [0, 0, 800, 500];
var plotMargin = 0.8;
var toolTipH = 30;
var toolTipW = 100;
var toolTipTextMarginLeft = 20;
var toolTipTextMarginTop = 20;
var averageLinePosition = '150 300';
var defaultMarkerRadius = 6;
var markerRadiusOnHover = 8;
var outerMarkerRadius = 12;
var markerColor = "#0F254B";
var markerColorOnHover = "#228BC5";

var months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sept", "Oct", "Nov", "Dec"];

var getInternetExplorerVersion = function () {
    // Returns the version of Internet Explorer or a -1
    // (indicating the use of another browser).

    var rv = -1; // Return value assumes failure.
    if (navigator.appName == 'Microsoft Internet Explorer') {
        var ua = navigator.userAgent;
        var re = new RegExp("MSIE ([0-9]{1,}[\.0-9]{0,})");
        if (re.exec(ua) != null)
            rv = parseFloat(RegExp.$1);
    }
    return rv;
}

var isIE8 = isIE8 || (getInternetExplorerVersion() == 8.0);

var getMonth = function (d) {
    var date = new Date(d.date);
    return date.getMonth();
};

var scales = function (data) {

    //To get max and min date. This will assume that the data is sorted
    var minDate = getMonth(data[0]);
    var maxDate = getMonth(data[data.length - 1]);

    // X scale will fit all values from data[] within pixels 0-width
    this.x = d3.scale.linear().domain([minDate + 1, maxDate]).range([0, width]);

    var minAmount = d3.min(data, function (d) {
        return d.billAmount;
    });
    var maxAmount = d3.max(data, function (d) {
        return d.billAmount;
    });

    var range = maxAmount - minAmount;

    // Y scale will fit values from data[] within pixels height-0
    this.y = d3.scale.linear().domain([minAmount - plotMargin * range, maxAmount + plotMargin * range]).range([height, 0]);
};

var drawChart = function (data) {
    var axis = new scales(data);

    var getX = function (d) {
        return axis.x(getMonth(d));
    };

    var getY = function (d) {
        return axis.y(d.billAmount);
    };

    var mean = d3.mean(data, function (d) {
        return d.billAmount;
    });

    // create a line function that can convert data[] into x and y points
    var line = d3.svg.line()
        // assign the X function to plot our line as we wish
        .x(getX)
        .y(getY);

    var toolTip = new(function () {
        var showToolTip = function (bill, toolTipX, toolTipY) {
            d3.select(".tip")
                .attr("transform", "translate(" + toolTipX + "," + toolTipY + ")")
                .attr("visibility", "visible");

            d3.select(".tip-text")
                .attr("transform", "translate(" + (toolTipX + toolTipTextMarginLeft) + "," + (toolTipY + toolTipTextMarginTop) + ")")
                .text("$" + bill.billAmount)
                .attr("visibility", "visible");
        };

        this.create = function () {
            graph.append("rect")
                .attr("class", "tip")
                .attr("width", toolTipW)
                .attr("height", toolTipH)
                .attr("visibility", "hidden");

            graph.append("text")
                .attr("class", "tip-text")
                .attr("visibility", "hidden");
        };

        this.showData = function (bill) {
            var toolTipX = getX(bill) - toolTipW / 2;
            var toolTipY = getY(bill) - toolTipH - outerMarkerRadius * 2;
            if (isIE8) {
                create();
            }
            showToolTip(bill, toolTipX, toolTipY);
        };

        this.hideData = function () {
            d3.select(".tip").attr("visibility", "hidden");
            d3.select(".tip-text").attr("visibility", "hidden");
            if (isIE8) {
                d3.select(".tip").remove();
                d3.select(".tip-text").remove();
            }
        };
    })();

    // Add an SVG element with the desired dimensions and margin.
    var graph = d3.select("#chart")
        .append("svg")
        .attr("preserveAspectRatio", "xMinYMin meet")
        .attr("viewBox", viewBox.join(" "))
        .append("g")
        .attr("transform", "translate(" + margins[3] + "," + margins[0] + ")");

    if (isIE8) {
        d3.select("svg")
            .attr("width", viewBox[2])
            .attr("height", viewBox[3]);
    }

    // create xAxis
    var xAxis = d3.svg.axis().scale(axis.x).tickFormat(function (d) {
        return months[d];
    }).tickSize(0);

    // Add the x-axis.
    graph.append("g")
        .attr("class", "x axis")
        .attr("transform", "translate(0," + height + ")")
        .call(xAxis);

    // create left yAxis
    var yAxisLeft = d3.svg.axis().scale(axis.y).orient("left").tickSize(0);

    // Add the y-axis to the left
    graph.append("svg:g")
        .attr("class", "y axis")
        .attr("transform", "translate(0,0)")
        .call(yAxisLeft);

    //mean line
    graph.append("line")
        .attr("class", "average-line")
        .attr("x1", 0)
        .attr("y1", axis.y(mean))
        .attr("x2", width)
        .attr("y2", axis.y(mean));

    // Add the line by appending an svg:path element with the data line we created above
    // do this AFTER the axes above so that the line is above the tick-lines
    graph.append("svg:path").attr("d", line(data));

    graph.append("svg:text")
        .attr("x", 100)
        .attr("y", 100)
        .attr("dy", ".1em")
        .attr("transform", "translate(" + averageLinePosition + ")")
        .text("Average Bill Value");

    //markers
    graph
        .selectAll("circle")
        .data(data)
        .enter()
        .append("circle")
        .attr("r", defaultMarkerRadius)
        .attr("cx", getX)
        .attr("cy", getY)
        .on("mouseenter", function (bill) {
            toolTip.showData(bill);

            //change radius and color of marker
            d3.select(this)
                .attr("r", markerRadiusOnHover)
                .attr("fill", markerColorOnHover);

            //add an outer circle to marker
            graph.append("circle")
                .attr("r", outerMarkerRadius)
                .attr("cx", d3.select(this).attr("cx"))
                .attr("cy", d3.select(this).attr("cy"))
                .attr("class", "outer")
                .attr("fill", markerColorOnHover)
                .attr('fill-opacity', 0.5)
                .attr("pointer-events", "none") //disable pointer events for outer circle
        })
        .on("mouseleave", function () {
            toolTip.hideData();
            d3.select(this).attr("r", defaultMarkerRadius).attr("fill", markerColor);
            d3.select("circle.outer").remove()
        });

    if (!isIE8) {
        toolTip.create();
    }
}


var draw = function () {
    var data = [{
            'date': "2012/10/01",
            'billAmount': 27.4
         },
        {
            'date': "2012/09/01",
            'billAmount': 25
         },
        {
            'date': "2012/08/01",
            'billAmount': 26.66
         },
        {
            'date': "2012/07/01",
            'billAmount': 32
         },
        {
            'date': "2012/06/01",
            'billAmount': 25.8
         },
        {
            'date': "2012/05/01",
            'billAmount': 23.8
         }];
    drawChart(data);
}
