function classic(distances, dimensions) {
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

var brushing = false;
var brushed_points=[]

/// draws a scatter plot of points, useful for displaying the output
/// from mds.classic etc
function drawD3ScatterPlot(element, xPos, yPos, labels, params) {
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
            .ticks(5);


    var svg = element.select("svg");
    if(svg.empty()){
        var svg = element.append("svg")                 //append svg only if there isn't
                .attr("width", w)
                .attr("height", h);
    }
    else{
        if(!params.evolutionMode){
            element.select("svg").selectAll("*").remove()
        }        
    }    
    var t = svg.transition().duration(1500);
    if(!params.evolutionMode){
        element.selectAll(".mdsTooltip").remove()

        var clip = svg.append("defs").append("svg:clipPath")        //out of this region the points will be cancelled (for zoom)
            .attr("id", "clip")
            .append("svg:rect")
            .attr("width", w - (padding*0.8))       //asse di destra
            .attr("height", h - (padding*1.1))   //asse di sotto
            .attr("x", (padding*0.2))         //asse di sinistra
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
            .on("end", displayLocation)

        svg.append("g")
            .attr("class", "mdsbrush")
            .on("mousedown", function(){      
            MDS_PC_LOCK = false                                     //eliminate brush
            brushing = false;
            d3.selectAll(".brushed").classed("brushed", false);
            d3.selectAll("#text").style("opacity", "0.5");
            if(visualization==1){//INTERACTIONS WITH MAP
                var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return brushed_points.includes(terName);  
                });
                id.style('stroke-width','0.5');
            }
            else{//INTERACTIONS WITH MAP
                var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                    var terName =d3.select('#'+this['id']).attr('name');
                    return brushed_points.includes(terName);  
                });
                id.style('stroke-width','0.5');
            }
            brushed_points.forEach(function(d){
                d3.select("#my_dataviz").selectAll('path').each(function(t){
                    if (d3.select(this).attr("name") != null){
                        if(d.trim() == d3.select(this).attr("name").trim()){
                            d3.select(this).style("stroke", "#2c7bb6")
                        }
                    }
                })
            })
            brushed_points =[]
            //brush zoom
            /*xScale.domain(xDomain);
            yScale.domain(yDomain);
            redraw();*/
            })
        .call(brush);

        var zoom = d3.zoom()
            .scaleExtent([.5, 25])
            .extent([[-padding, -padding], [w+padding, h+padding]])
            .on("zoom", zoomed);

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

        var mtooltip = element.append("div")
            .attr("class", "mdsTooltip")
            .style("opacity", 0);

        var nodes = svg.attr("clip-path", "url(#clip)")
            .selectAll("circle")
            .data(labels)
            .enter()
            .append("g");
        
        nodes.style("display","block")
            .attr("class", "dot")
            .append("circle")
            .attr("r", pointRadius)
            .attr("cx", function(d, i) { return xScale(xPos[i]); })
            .attr("cy", function(d, i) { return yScale(yPos[i]); })
            .on("mouseover", function(d) {
                mtooltip.transition()
                    .duration(200)
                    .style("opacity", .9);
                mtooltip.html(d)
                    .style("left", (d3.mouse(this)[0]) + "px")
                    .style("top", (d3.mouse(this)[1]-25) + "px");
                if(visualization==1){//INTERACTIONS WITH MAP
                    var id =d3.select('#mapReg').selectAll('path').filter(function(t){
                        var terName = d3.select('#'+this['id']).attr('name');
                        return terName==d;  
                    });
                    id.style('stroke-width','2');
                    showTooltipReg(id,150);
                }
                else{//INTERACTIONS WITH MAP
                    var id =d3.select('#mapProv').selectAll('path').filter(function(t){
                        var terName = d3.select('#'+this['id']).attr('name');
                        return terName==d;  
                    });
                    id.style('stroke-width','1.5');
                    showTooltipProv(id,150);
                }
                if(d3.select(this).classed("brushed")==true && d3.select(this).style('fill')!='rgb(211, 211, 211)'){
                    oldSt=id.style('stroke');
                    id.style('stroke','blue');
                }

                if(!brushing){
                    d3.select("#my_dataviz").selectAll('path').each(function(t){
                        if (d3.select(this).attr("name") != null){
                            if(d.trim() == d3.select(this).attr("name").trim()){
                                d3.select(this).style("stroke", "#d7191c")
                                d3.select(this).style("stroke-width", "3")
                                d3.select(this).raise().classed("active", true);
                            }
                        }
                    })
                }
                else{
                    d3.select("#my_dataviz").selectAll('path').each(function(t){
                        if (d3.select(this).attr("name") != null){
                            if(d.trim() == d3.select(this).attr("name").trim()){
                                d3.select(this).style("stroke-width", "3")
                                d3.select(this).raise().classed("active", true);
                            }
                        }
                    })
                }
                d3.select(this).attr("id", null).attr("r","3")
                        
            })
            .on("mouseout", function(d) {
                mtooltip.transition()
                    .duration(500)
                    .style("opacity", 0);
                if(d3.select(this).classed("brushed")== true){
                    if(visualization==1){//INTERACTIONS WITH MAP
                        var id =d3.select('#mapReg').selectAll('path').filter(function(t){
                            var terName = d3.select('#'+this['id']).attr('name');
                            return terName==d;
                        });
                        id.style('stroke',oldSt);
                    }
                    else{//INTERACTIONS WITH MAP
                        var id =d3.select('#mapProv').selectAll('path').filter(function(t){
                            var terName = d3.select('#'+this['id']).attr('name');
                            return terName==d;  
                        });
                        id.style('stroke', oldSt);
                    }
                }
                if(d3.select(this).classed("brushed")!= true ||d3.select(this).style('fill')=='rgb(211, 211, 211)'){
                    if(visualization==1){//INTERACTIONS WITH MAP
                        var id =d3.select('#mapReg').selectAll('path').filter(function(t){
                            var terName = d3.select('#'+this['id']).attr('name');
                            return terName==d;
                        });
                        id.style('stroke-width','0.5');
                    }
                    else{//INTERACTIONS WITH MAP
                        var id =d3.select('#mapProv').selectAll('path').filter(function(t){
                            var terName = d3.select('#'+this['id']).attr('name');
                            return terName==d;  
                        });
                        id.style('stroke-width','0.5');
                    }
                    d3.select("#my_dataviz").selectAll('path').each(function(t){
                        if (d3.select(this).attr("name") != null){
                            if(d.trim() == d3.select(this).attr("name").trim()){
                                d3.select(this).style("stroke", "#2c7bb6");
                                
                            }
                        }
                        
                    })
                }          
                d3.select("#my_dataviz").selectAll('path').each(function(t){
                    d3.select(this).style('stroke-width','1.5');
                })      
            });

        

        nodes.append("text")
            .attr("id", "text")
            .attr("text-anchor", "middle")
            .text(function(d) { return d; })
            .attr("x", function(d, i) { return xScale(xPos[i]); })
            .attr("y", function(d, i) { return yScale(yPos[i]) - 2 *pointRadius; })
            .attr("fill", "black")   // Font color
            .style("font", "14px times")  // Font size
            .style("visibility", "hidden")

        if(!brushing || changedVisualization){
            d3.selectAll("circle").classed("brushed", false)
            MDS_PC_LOCK = false;
            brushed_points = []
            d3.select("#my_dataviz").selectAll('path').each(function(t){
                if (d3.select(this).attr("name") != null){
                    d3.select(this).style("stroke", "#2c7bb6")
                }
            })
            
            changedVisualization = false;
        }
        else{
            d3.selectAll("circle").each(function(d){
                if(brushed_points.includes(d3.select(this).data()[0])){
                    d3.select(this).classed("brushed", true)
                }
                else{
                    d3.select(this).classed("brushed", false)
                }
            })
            d3.selectAll("#text").each(function(d){
                if(brushed_points.includes(d3.select(this).data()[0])){
                    d3.select(this).style("opacity", "1");
                }
                else{
                    d3.select(this).style("opacity", "0.5");
                }
            })
        }

        if(params.visibleLabel){                                            //remeber last label mode asked 
            var t = d3.selectAll("#text")
            t.style("visibility", "visible")
            element.selectAll(".mdsTooltip").style("display", "none");
        }

    }
    else{
        redraw();
        var zoom = d3.zoom()
            .scaleExtent([.5, 25])
            .extent([[-padding, -padding], [w+padding, h+padding]])
            .on("zoom", zoomed);

        //zoom over x axis
        svg.append("rect")
            .attr("width", w)
            .attr("height", h/2)
            .attr("y", h/1.3)            
            .style("fill", "none")
            .style("pointer-events", "all")
            .call(zoom);
    }
        
    function highlightBrushedCircles() {

        if (d3.event.selection != null) {

            // revert circles to initial style
            nodes.selectAll("circle").classed("brushed", false);
            nodes.selectAll("#text").style("opacity", "0.5");

            var brush_coords = d3.brushSelection(this);

            // style brushed circles
            nodes.selectAll("circle").filter(function (){

                        var cx = d3.select(this).attr("cx"),
                            cy = d3.select(this).attr("cy");

                        return isBrushed(brush_coords, cx, cy);
                    })
                    .classed("brushed", true);
            nodes.selectAll("#text").filter(function (){
                            var cx = d3.select(this).attr("x"),
                            cy = d3.select(this).attr("y");

                        return isBrushed(brush_coords, cx, cy);
                    })
                    .style("opacity", "1.0");

            element.selectAll(".dot").each(function(d){
                if(d3.select(this).style("display")=="none" && d3.select(this).select("circle").classed("brushed")==true){
                    d3.select(this).select("circle").classed("brushed", false)
                }
            })
            element.selectAll(".brushed").each(function(d){
                if(d3.select(this).style('fill')=='rgb(211, 211, 211)')
                d3.select(this).classed("brushed", false)
            })
        }
    }
    function displayLocation() {
        var s = d3.event.selection
        if (!s){
            return;
        } 

        //brush zoom
        /*xScale.domain([s[0][0], s[1][0]].map(xScale.invert, xScale));
        yScale.domain([s[1][1], s[0][1]].map(yScale.invert, yScale));
        redraw();*/
        //clearing brush
        d3.select(this).call(brush.move, null);
        brushed_points=[]
        brushing = true;

        var d_brushed =  d3.selectAll(".brushed").data();
        
        // populate array if one or more elements is brushed
        if (d_brushed.length > 0) {
            d_brushed.forEach(d_row => brushed_points.push(d_row))
        }
        else{
            brushed_points = []
        }
        if(visualization==1){//INTERACTIONS WITH MAP
            var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                var terName = d3.select('#'+this['id']).attr('name');
                return brushed_points.includes(terName);  
            });
            id.style('stroke-width','2');
        }
        else{//INTERACTIONS WITH MAP
            var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                var terName = d3.select('#'+this['id']).attr('name');
                return brushed_points.includes(terName);  
            });
            id.style('stroke-width','1.5');
        }
        //INTERACTIONS WITH PC
        MDS_PC_LOCK = true
        brushed_points.forEach(function(d){
            d3.select("#my_dataviz").selectAll('path').each(function(t){
                if (d3.select(this).attr("name") != null){
                if(d.trim() == d3.select(this).attr("name").trim()){
                    d3.select(this).style("stroke", "#d7191c")
                    d3.select(this).raise().classed("active", true);
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

    function redraw() {
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
