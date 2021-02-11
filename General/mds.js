(function(mds) {
    "use strict";
    /// given a matrix of distances between some points, returns the
    /// point coordinates that best approximate the distances using
    /// classic multidimensional scaling
    mds.classic = function(distances, dimensions) {
        dimensions = dimensions || 2;

        // square distances
        var M = numeric.mul(-0.5, numeric.pow(distances, 2));

        // double centre the rows/columns
        function mean(A) { return numeric.div(numeric.add.apply(null, A), A.length); }
        var rowMeans = mean(M),
            colMeans = mean(numeric.transpose(M)),
            totalMean = mean(rowMeans);

        for (var i = 0; i < M.length; ++i) {
            for (var j =0; j < M[0].length; ++j) {
                M[i][j] += totalMean - rowMeans[i] - colMeans[j];
            }
        }

        // take the SVD of the double centred matrix, and return the
        // points from it
        var ret = numeric.svd(M),
            eigenValues = numeric.sqrt(ret.S);
        return ret.U.map(function(row) {
            return numeric.mul(row, eigenValues).splice(0, dimensions);
        });
    };

    /// draws a scatter plot of points, useful for displaying the output
    /// from mds.classic etc
    mds.drawD3ScatterPlot = function(element, xPos, yPos, labels, params) {
        params = params || {};
        var padding = params.padding || 32,
            w = params.w || Math.min(720, document.documentElement.clientWidth - padding),
            h = params.h || w,
            xDomain = [Math.min.apply(null, xPos),
                       Math.max.apply(null, xPos)],
            yDomain = [Math.max.apply(null, yPos),
                       Math.min.apply(null, yPos)],
            pointRadius = params.pointRadius || 3;

        if (params.reverseX) {
            xDomain.reverse();
        }
        if (params.reverseY) {
            yDomain.reverse();
        }

        var xScale = d3.scaleLinear().
                domain(xDomain)
                .range([padding, w - padding]),

            yScale = d3.scaleLinear().
                domain(yDomain)
                .range([padding, h-padding]),

            xAxis = d3.axisBottom(xScale)
                .ticks(params.xTicks || 7),

            yAxis = d3.axisLeft(yScale)
                .ticks(params.yTicks || 7);

        var svg = element.append("svg")
                .attr("width", w)
                .attr("height", h);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(0," + (h - padding + 2*pointRadius) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("transform", "translate(" + (padding - 2*pointRadius) + ",0)")
            .call(yAxis);

        var nodes = svg.selectAll("circle")
            .data(labels)
            .enter()
            .append("g");
        
        nodes.append("circle")
            .attr("r", pointRadius)
            .attr("cx", function(d, i) { return xScale(xPos[i]); })
            .attr("cy", function(d, i) { return yScale(yPos[i]); })
            .attr("class", "non_brushed");

        nodes.append("text")
            .attr("text-anchor", "middle")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return xScale(xPos[i]); })
            .attr("y", function(d, i) { return yScale(yPos[i]) - 2 *pointRadius; })
            .attr("fill", "darkgrey")   // Font color
            .style("font", "14px times")  // Font size
            .attr("class", "non_brushed");

        /*nodes.on('mouseover', function (d, i) {
            d3.select(this).select("text").transition()
                 .duration('100')
                 .attr("fill", "black")
                .style("font", "20px times");
                d3.select(this).raise().classed("active", true);
            })
            .on('mouseout', function (d, i) {
                d3.select(this).select("text").transition()
                    .duration('200')
                    .attr("fill", "darkgrey")
                    .style("font", "14px times")
            })*/

        function highlightBrushedCircles() {

            if (d3.event.selection != null) {

                // revert circles to initial style
                nodes.selectAll("circle").attr("class", "non_brushed");
                nodes.selectAll("text").attr("class", "non_brushed");

                var brush_coords = d3.brushSelection(this);

                // style brushed circles
                nodes.selectAll("circle").filter(function (){

                            var cx = d3.select(this).attr("cx"),
                                cy = d3.select(this).attr("cy");

                            return isBrushed(brush_coords, cx, cy);
                        })
                        .attr("class", "brushed");
                nodes.filter(function (){

                    var cx = d3.select(this).select("circle").attr("cx"),
                        cy = d3.select(this).select("circle").attr("cy");

                    return isBrushed(brush_coords, cx, cy);
                })
                .selectAll("text").attr("class", "brushed_text");
            }
        }
        function displayTable() {

            if (!d3.event.selection) return;

            //clearing brush
            d3.select(this).call(brush.move, null);

            var d_brushed =  d3.selectAll(".brushed").data();
            var brushed_regions=[]

            // populate array if one or more elements is brushed
            if (d_brushed.length > 0) {
                d_brushed.forEach(d_row => brushed_regions.push(d_row))
            }
            else{
                brushed_regions = []
            }
            console.log(brushed_regions)
        }
        var brush = d3.brush()
                          .on("brush", highlightBrushedCircles)
                          .on("end", displayTable); 

        svg.append("g")
            .call(brush);

        function isBrushed(brush_coords, cx, cy) {

            var x0 = brush_coords[0][0],
                x1 = brush_coords[1][0],
                y0 = brush_coords[0][1],
                y1 = brush_coords[1][1];

        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
        }
    };
}(window.mds = window.mds || {}));