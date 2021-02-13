    /* //------ OLD PC IMPLEMENTATION
    svg_PC
        .selectAll("myPath")
        .data(data)
        .enter().append("path")
        .attr("d",  path) //The d attribute defines a path to be drawn.
        .style("fill", "none")
        .style("stroke", "#0000CD")
        .style("stroke-width", "3")
        .style("opacity", 0.5)
        .attr("name",function(d){
            return d["territorio"]})
        .on("mouseover", function(d) {
            d3.select(this).raise().classed("active", true);
            d3.select(this).style("stroke", "#FF0000")
            drawTooltip(d["territorio"],d["anno"])
            name =d['territorio'].trim()
            if(visualization==0){
                var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
                showTooltipProv(id,1);
            }
            else{
                var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
                showTooltipReg(id,1)
            }
        
            //currentColour= id.style('stroke-width')
            id.style('stroke-width','2')
            
        })                
        .on("mouseout", function(d) {
            d3.select(this).style("stroke", "#0000CD")
            removeTooltip()
            name =d['territorio'].trim()
            if(visualization==0){
                var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
            }
            else{
                var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
            }
            id.style('stroke-width','0.5');
        })
        

    // Draw the axis:
    svg_PC.selectAll("myAxis")
        // For each dimension of the dataset I add a 'g' element:
        .data(dimensions).enter()
        .append("g")
        // I translate this element to its right position on the x axis
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        // And I build the axis with the call function
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        
        // Add axis title
        .append("text")
        .style("text-anchor", "start")
        .attr("transform", "rotate(-7)")
        .attr("y", -9)
        .text(function(d) {
            d3.select(this).style("font-size", 10)
            if(d.length > 23) {
                //d3.select(this).attr("transform", "rotate(-5)")
                return d.substring(0,22)
            }
            return d; })
        .on("mouseover", function(d) {
            d3.select(this).text(d)
            //if(d.length > 23) document.getElementById("par-coord").style.border = 'none'
            })
        .on("mouseout", function(d) {
            if(d.length > 23) d3.select(this).text(d.substring(0,22))
            //document.getElementById("par-coord").style.border = '3px solid black'
            })
        .on("click",function(d){
            //CRIMES.splice(CRIMES.indexOf(d),1)
            //draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
            CRIMES.splice(CRIMES.indexOf(d),1)
            $('.selectCrimes').val(CRIMES).trigger('change');
            draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
            computeColourScales()
        })
        .style("fill", "black")
        */
       
       
       
       //draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)//<------ first draw
       
        






//OLD CLICK FUNCTION
/* .on("click", function(d) {//when clicked, the territory is removed
    REGIONS = REGIONS.filter(n => n!=d["territorio"].trim())
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    removeTooltip()
    name =d['territorio'].trim()
    if(visualization==0){
        var id =d3.select('#mapProv').selectAll('path').filter(function(d){
            var terName = d3.select('#'+this['id']).attr('name');
            return terName == name;  
          });
        updateMapProv(id.attr('id'));
        id.attr('class','greyProv')
    }
    else{
        var id =d3.select('#mapReg').selectAll('path').filter(function(d){
            var terName = d3.select('#'+this['id']).attr('name');
            return terName == name;  
          });
        console.log(id)
        updateMapReg(id.attr('id'),'');
        id.attr('class','greyOnlyReg')
    }
}); */