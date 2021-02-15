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
            yDomain = [Math.min.apply(null, yPos),
                       Math.max.apply(null, yPos)],
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
                .range([h-padding, padding]),

            xAxis = d3.axisBottom(xScale)
                .ticks(params.xTicks || 7),

            yAxis = d3.axisLeft(yScale)
                .ticks(params.yTicks || 7);

        var svg = element.select("svg");
        if(svg.empty()){
            var svg = element.append("svg")
                    .attr("width", w)
                    .attr("height", h);
        }
        else{
            element.select("svg").selectAll("*").remove()
        }

        var clip = svg.append("defs").append("svg:clipPath")
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", w - (padding*0.8))       //asse di destra
            .attr("height", h - (padding*1.1))   //asse di sotto
            .attr("x", (padding*0.45))         //asse di sinistra
            .attr("y", (padding*0.7));         //asse di sopra
        
        svg.append("g")
            .attr("class", "axis")
            .attr("id", "xaxis")
            .attr("transform", "translate(0," + (h - padding + 2*pointRadius) + ")")
            .call(xAxis);

        svg.append("g")
            .attr("class", "axis")
            .attr("id", "yaxis")
            .attr("transform", "translate(" + (padding - 2*pointRadius) + ",0)")
            .call(yAxis);

        var brush = d3.brush()
            .on("brush", highlightBrushedCircles)
            .on("end", displayTable)

        var zoom = d3.zoom()
            .scaleExtent([.5, 25])
            .extent([[-padding, -padding], [width+padding, height+padding]])
            .on("zoom", zoomed);

        svg.append("g")
            .on("mousedown", function(){
            d3.selectAll(".brushed").attr("class", "non_brushed");
            d3.selectAll(".brushed_text").attr("class", "non_brushed");
            if(visualization==1){//INTERACTIONS WITH MAP
                var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return brushed_regions.includes(terName);  
                });
                id.style('stroke-width','0.5');
            }
            else{//INTERACTIONS WITH MAP
                var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                    var terName ='  '+ d3.select('#'+this['id']).attr('name');
                    return brushed_regions.includes(terName);  
                });
                id.style('stroke-width','0.5');
            }
            brushed_regions.forEach(function(d){
                d3.select("#my_dataviz").selectAll('path').each(function(t){
                  if (d3.select(this).attr("name") != null){
                    if(d.trim() == d3.select(this).attr("name").trim()){
                      d3.select(this).style("stroke", "#0000CD")
                      //console.log(d)
                    }
                  }
                })
              })
            brushed_regions =[]
            //brush zoom
            /*xScale.domain(xDomain);
            yScale.domain(yDomain);
            zooming();*/
            })
        .call(brush);
        //.call(zoom);

        //zoom over x axis
        svg.append("rect")
            .attr("width", w)
            .attr("height", h/2)
            .attr("y", h/1.3)            
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);

        //zoom over y axis
        /*svg.append("rect")
            .attr("width", h/3)
            .attr("height", h)
            .attr("x", 0)            
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);*/

        var nodes = svg.attr("clip-path", "url(#clip)")
            .selectAll("circle")
            .data(labels)
            .enter()
            .append("g");
        
        nodes.append("circle")
            .attr("r", pointRadius)
            .attr("cx", function(d, i) { return xScale(xPos[i]); })
            .attr("cy", function(d, i) { return yScale(yPos[i]); })
            .attr("class", "non_brushed");
        nodes.append("text")
            .attr("id", "text")
            .attr("text-anchor", "middle")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return xScale(xPos[i]); })
            .attr("y", function(d, i) { return yScale(yPos[i]) - 2 *pointRadius; })
            .attr("fill", "black")   // Font color
            .style("font", "14px times")  // Font size
            .attr("class", "non_brushed");
        
        /*nodes.attr("pointer-events", "all")
            .on('mouseover', function (d, i) {
                d3.select(this).select("text").transition()
                .duration('100')
                .style("font", "20px times")
                .attr("class", "brushed_text") 
                d3.select(this).raise().classed("active", true);
                console.log(xPos[i], yPos[i])
                console.log(xScale(xPos[i]), yScale(yPos[i]))
            })
            .on('mouseout', function (d, i) {
                d3.select(this).select("text").transition()
                .duration('200')
                //.attr("class", "non_brushed") 
                .style("font", "14px times");                               
                    
            })*/
        var brushed_regions=[]
        function highlightBrushedCircles() {

            if (d3.event.selection != null) {

                // revert circles to initial style
                nodes.selectAll("circle").attr("class", "non_brushed");

                var brush_coords = d3.brushSelection(this);

                // style brushed circles
                nodes.selectAll("circle").filter(function (){

                            var cx = d3.select(this).attr("cx"),
                                cy = d3.select(this).attr("cy");

                            return isBrushed(brush_coords, cx, cy);
                        })
                        .attr("class", "brushed");
                nodes.selectAll("#text").filter(function (){
                                var cx = d3.select(this).attr("x"),
                                cy = d3.select(this).attr("y");

                            return isBrushed(brush_coords, cx, cy);
                        })
                        .attr("class", "brushed_text");
            }
        }
        function displayTable() {
            var s = d3.event.selection
            if (!s){
                return;
            } 

            //brush zoom
            /*xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale));
            yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale));
            zooming();*/
            //clearing brush
            d3.select(this).call(brush.move, null);
            brushed_regions=[]

            var d_brushed =  d3.selectAll(".brushed").data();
            
            // populate array if one or more elements is brushed
            if (d_brushed.length > 0) {
                d_brushed.forEach(d_row => brushed_regions.push(d_row))
            }
            else{
                brushed_regions = []
            }
            if(visualization==1){//INTERACTIONS WITH MAP
                var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return brushed_regions.includes(terName);  
                });
                id.style('stroke-width','2');
            }
            else{//INTERACTIONS WITH MAP
                var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                    var terName = '  '+d3.select('#'+this['id']).attr('name');
                    //console.log(terName)
                    return brushed_regions.includes(terName);  
                });
                //console.log(id)
                id.style('stroke-width','1.5');
            }
            brushed_regions.forEach(function(d){
                d3.select("#my_dataviz").selectAll('path').each(function(t){
                  if (d3.select(this).attr("name") != null){
                    if(d.trim() == d3.select(this).attr("name").trim()){
                      d3.select(this).style("stroke", "#FF0000")
                      d3.select(this).raise().classed("active", true);
                      //console.log(d)
                    }
                  }
                })
              })
        }

        function isBrushed(brush_coords, cx, cy) {

            var x0 = brush_coords[0][0],
                x1 = brush_coords[1][0],
                y0 = brush_coords[0][1],
                y1 = brush_coords[1][1];

        return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1;
        }

        //zoom with brush

        function zooming() {

            var t = svg.transition().duration(750);
            svg.select("#xaxis").transition(t).call(xAxis);
            svg.select("#yaxis").transition(t).call(yAxis);
            svg.selectAll("circle").transition(t)
                .attr('cx', function(d,i) {return xScale(xPos[i])})
                .attr('cy', function(d,i) {return yScale(yPos[i])});
            svg.selectAll("#text").transition(t)                
                .attr("text-anchor", "middle")
                .attr('x', function(d,i) {return xScale(xPos[i])})
                .attr('y', function(d,i) {return yScale(yPos[i]) - 2 *pointRadius;});
        }

        /* zoom with mouse */
        function zoomed() {
            // create new scale ojects based on event
                var new_xScale = d3.event.transform.rescaleX(xScale);
                var new_yScale = d3.event.transform.rescaleY(yScale);
            // update axes
                svg.select("#xaxis").call(xAxis.scale(new_xScale));
                svg.select("#yaxis").call(yAxis.scale(new_yScale));
                svg.selectAll("circle")
                 .attr('cx', function(d,i) {return new_xScale(xPos[i])})
                 .attr('cy', function(d,i) {return new_yScale(yPos[i])});
                svg.selectAll("#text")                
                .attr("text-anchor", "middle")
                 .attr('x', function(d,i) {return new_xScale(xPos[i])})
                 .attr('y', function(d,i) {return new_yScale(yPos[i]) - 2 *pointRadius;});
            }
    };
}(window.mds = window.mds || {}));
