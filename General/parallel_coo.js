var xMousePos = 0;
var yMousePos = 0;
var lastScrolledLeft = 0;
var lastScrolledTop = 0;
var foreground;
var background;
var brushed_points = [];
var dragging = {};

//  -------------------------------------------parametri globali che l'utente puo cambiare
YEAR = [2019]
CMD_REGIONS = "only"
REGIONS = []
KIND_OF_TERRITORY = "region"
CMD_CRIMES = "only"
ABSOLUTE = false
CRIMES = []
MDS_PC_LOCK = false
//per evitare il cross origin
var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/General/datasets/dataset_crimes/dataset1219.csv"
//var dataset_path = "datasets/dataset_crimes/dataset1219.csv"
//inizializzazione elementi del dom
//fill dropmenu degli anni 
var select = document.getElementById("year");
for (let i = 2012; i < 2020; i++) {
    var el = document.createElement("option");
    el.textContent = i;
    el.value = i;
   // select.appendChild(el);
}


// set the dimensions and margins of the graph
var margin = {top: 50, right: 15, bottom: 15, left: 0},
    width = document.getElementById("my_dataviz").clientWidth+ margin.left + margin.right 
    height = document.getElementById("my_dataviz").clientHeight - margin.top - margin.bottom;
// append the svg_PC object to the body of the page
var svg_pc = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width +margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
var svg_PC = svg_pc.append("g")
                .attr("transform",
                    "translate(" + margin.left + "," + margin.top + ")");


//quando cambio year ridisegno l'intera parallel coord.
function changeYear(year){
    svg_PC.selectAll("*").remove();
    if(!YEAR.includes(year)) YEAR.push(year)
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeAbsolute(flag){
    svg_PC.selectAll("*").remove();
    ABSOLUTE = flag
    //document.getElementById("absolute").textContent="absolute: " + ABSOLUTE
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeCmdRegions(cmd){
    svg_PC.selectAll("*").remove();
    CMD_REGIONS = cmd
    //document.getElementById("cmd_region").textContent=CMD_REGIONS
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeKindOfTerritory(newData){
    REGIONS = []
    d3.text(dataset_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
        for (let i = 0; i < data.length; i++) {
            length_name=  (data[i].territory.substring(0,7).match(/\s/g) || []).length //conta i white spaces: 6 provincie,4regioni, 2macroregioni,0 Italia
            if(newData == 0 && length_name == 6 && !REGIONS.includes(data[i].territory.trim())){//provinces
                REGIONS.push(data[i].territory.trim())
                KIND_OF_TERRITORY = "prov"
            }
            if(newData == 1 && length_name == 4 && !REGIONS.includes(data[i].territory.trim())){//regions
                REGIONS.push(data[i].territory.trim())
                KIND_OF_TERRITORY = "region"
            }
        }
    })
    return REGIONS
}
function add_delete_territory(territory){ //when user click on a territory in a map it will be added or deleted from regions
    if(REGIONS.includes(territory.trim())) {
        REGIONS.splice(REGIONS.indexOf(territory.trim()), 1);
    }
    else REGIONS.push(territory)
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeCmdCrimes(){
    sv.selectAll("*").remove();
    if(CMD_CRIMES == "only") CMD_CRIMES = "except"
    else{
    CMD_CRIMES = "only"
    }
    document.getElementById("cmd_crime").textContent=CMD_CRIMES
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeCrimes(crime){
    if(!CRIMES.includes(crime)){
    CRIMES.push(crime.trim())
    }
    sv.selectAll("*").remove();
    CRIMES.forEach( function(r){
    if(CMD_CRIMES == "only") document.getElementById(r).style.color = "green"
    else{
        document.getElementById(r).style.color = "red"
    }
    })
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
//filtra il le P.c. con l'year scelto dall'utente
function filterByYear(year,data){
    const data_filtered = []
    for (let i = 0; i < data.length; i++) {
        year.forEach(function(y){
            if(data[i].year == ""+y) data_filtered.push(data[i])
        })
    }
    return data_filtered
} 
//filtra in base al territory, only fa solo le regioni passate, except fa tutte tranne quelle passate
function filterByRegion(command,regions,data,kindOfTerr){    
    list_all_territories = []
    for (let i = 0; i < data.length; i++) {
        length_name =  (data[i].territory.substring(0,7).match(/\s/g) || []).length
        if(kindOfTerr == "prov" && length_name == 6){
            list_all_territories.push(data[i])
        }
        if(kindOfTerr == "region" && length_name == 4){
            list_all_territories.push(data[i])
        }
    }
    data_filtered = []
    for (let i = 0; i < list_all_territories.length; i++) {
        const terr = list_all_territories[i];
        for (let r = 0; r < regions.length; r++) {
            if(terr.territory.trim() == regions[r].trim()){
                data_filtered.push(terr)
            }
        }
    }
    if(command == "only") return data_filtered
    else if(command == "except") return list_all_territories.filter(n => !data_filtered.includes(n)) 
    
    
}

//filtra in base al crimie, only fa solo i crimini passati, except fa tutti tranni quelli passati
function filterByCrime(command,crimes,data){
    
    ////////d3.keys(data[0]) sono le classi ["territory", "year", "population",..] della prima riga
    ///////d3.values(data[0]) sono i valori delle classi ["Italia", "2012", "59394207",..] della prima riga
    function filterCrimes(crime){
    if(command == "except"){
        if(crimes.includes(crime)) return false
        return true
    }
    else if(command == "only"){
        if(crimes.includes(crime)) return true
        return false
    }
    }
    
    dimensions = dimensions.filter(filterCrimes)    
    return dimensions

}


//riempie la select con i nomi delle regioni/citta
function fillRegionSelect(dataset_path){
    d3.text(dataset_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
        var regioni=[]
        for (let i = 0; i < data.length; i++) {
            const region = data[i].territory.trim();
            if(! regioni.includes(region)) {
            regioni.push(region)
            }
        }
        regioni.sort()
        for (let i = 0; i < regioni.length; i++) {
            var el = document.createElement("option");
            region = regioni[i]
            el.textContent = region;
            el.value = region;
            el.id = region;
            document.getElementById("regions").appendChild(el);
            
        }
        })
}

//riempie la select con i nomi dei crimini
function fillCrimeSelect(dimensions){
    var crimes=[]
    dimensions.forEach(function(crime){
    crime = crime.trim()
    if(! crimes.includes(crime)) {
        crimes.push(crime)
    }
    })
    crimes.sort()
    for (let i = 0; i < crimes.length; i++) {
    var el = document.createElement("option");
    crime = crimes[i]
    el.textContent = crime;
    el.value = crime;
    el.id = crime;
    document.getElementById("crimes").appendChild(el);
    
    }
    
}

//fillRegionSelect(dataset_path)


function draw(year,command_regions,regions,command_crimes,crimes,isAbsolute) {
    dragging = {}
    //clean and retrieve measuremenets
    d3.select("#my_dataviz").selectAll("*").remove();
    margin = {top: 50, right: 15, bottom: 15, left: 0},
    width = document.getElementById("my_dataviz").clientWidth+ margin.left + margin.right
    height = document.getElementById("my_dataviz").clientHeight - margin.top - margin.bottom;
    svg_pc = d3.select("#my_dataviz")
            .append("svg")
            .attr("width", width +margin.left + margin.right)
            .attr("height", height + margin.top + margin.bottom)
            

    //eliminate pc brush on mds
    d3.select("#regions").selectAll(".pc_brushed").each(function(d){        
            d3.select(this).classed("pc_brushed", false);
    })
    d3.select('#mapReg').selectAll('path').style('opacity','1');
    d3.select('#mapProv').selectAll('path').style('opacity','1');
    
    svg_PC = svg_pc.append("g")
                    .attr("transform",
                        "translate(" + margin.left + "," + margin.top + ")");
    const PCtooltip = d3.select('#PCtooltip');
    d3.text(dataset_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
    
    //fillRegionSelect(data)
        
    data = filterByYear(year, data)
    if(regions.length>0) data = filterByRegion(command_regions, regions, data,KIND_OF_TERRITORY)
    dimensions = d3.keys(data[0]).filter(function(d) { return d != "territory" && d!= "total" && d!="year" && d!= "population"})
    //fillCrimeSelect(dimensions)
    dimensions = filterByCrime(command_crimes,crimes,data)

    //ogni asse verticale delle parallel coo. lo salvo dentro y 
    var y = {}
    for (i in dimensions) {
        var name = dimensions[i]
        y[name] = d3.scaleLinear()
        //d3.extent  returns the minimum and maximum value in an array, in this case i take from the dataset the i-th feature domain
        .domain( d3.extent(data, function(d) {
                
                if(!isAbsolute){
                return +d[name];
                }
                else{
                r = (d[name]/d["population"])*10000
                return +r;
                }
            }))
        .range([height, 0]) ///general height of the graph
    }
    
    //asse x -> it find the best position for each Y axis
    right_pad = 0
    last_crime = Object.keys(y)[Object.keys(y).length-1]
    if(last_crime != null && last_crime.length > 11) right_pad = 2.5*last_crime.length
    x = d3.scalePoint() //Ordinal ranges can be derived from continuous ranges: ex .domain(["A", "B", "C", "D"]) .range([0, 720]); ---> x("B") == 240
        .domain(dimensions)  ///.domain(["territory", "year", "population",..])
        .range([0, document.getElementById("my_dataviz").clientWidth-margin.right-right_pad])
        //.range([0, Math.min(document.getElementById("my_dataviz").clientWidth-margin.right,99*dimensions.length)])///general width of the graph, varia a seconda di quanti crimini metti
        .padding(0.5);
        //.range([0, (350-11*dimensions.length)*dimensions.length])///general width of the graph, varia a seconda di quanti crimini metti

    function path(d) {
        return d3.line()(dimensions.map(function(p) {
        //p è il nome del crimine
        //y[p] e x sono le funzioni interpolatrici tra dominio e range, una per asse
        //d[p] è il valore del crimine nella riga d, tipo d = data[i] e p = omicidio, d[p] = 30
        if(!isAbsolute) return [x(p), y[p](d[p])]; 
        else{
            return [x(p), y[p](  (d[p]/d["population"]) *10000)]
        }
        }));
        /////per ogni riga del csv (d), per ogni feature assegno la sua x e le sue y
    }
    
    // Draw the lines
    //BRUSH
    // Add grey background lines for context.
    background = svg_PC.append("g")
        .attr("class", "background")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("stroke", "grey")
        .style("stroke-width", "1.5")
        .style("opacity", 0.5);

    // Add blue foreground lines for focus.
    foreground = svg_PC.append("g")
        .attr("class", "foreground")
        .selectAll("path")
        .data(data)
        .enter().append("path")
        .attr("d", path)
        .style("stroke", function(d){
            d3.select(this).raise().classed("active", true);
            if (brushed_points.includes(d["territory"].trim()) ) return "#d7191c"
            return "#2c7bb6"
        })
        .style("stroke-width", "1.5")
        .style("opacity", 0.9);
    //each
    var overed
    foreground.attr("name",function(d){return d["territory"]})
        .on("mouseover", function(d) {
            
            if(MDS_PC_LOCK){
                overed = d3.select(this).attr("name").trim()
            }
            d3.select(this).raise().classed("active", true);
            d3.select("#my_dataviz").selectAll('path').each(function(t){
                if (d3.select(this).attr("name") != null){
                    if(d["territory"].trim() == d3.select(this).attr("name").trim()){
                        d3.select(this).raise().classed("active", true);
                        d3.select(this).style("stroke", "#d7191c")
                    }
                }
            })
            //d3.select(this).style("stroke", "#d7191c")
            //drawTooltip
            var text = d["territory"]
            if(YEAR.length>1) text += " " + d["year"] //Change the content of all tooltip elements:
            var mtooltip = d3.selectAll('#par-coord').append("div")
                .html(text)
                .attr("class", "PCtooltip")
                .style('display', 'block')
                .style("position","absolute")
                .style("left", (d3.mouse(this)[0]) + "px")
                .style("top", (d3.mouse(this)[1]+5) + "px");
            name =d['territory'].trim();
            if(visualization==0){
                var id =d3.select('#mapProv').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    
                    return terName == name;  
                });
                showTooltipProv(id,150);
                d3.select("#my_dataviz").selectAll('path').each(function(t){
                    d3.select(this).style("stroke-width", "1.5")
                })
            }
            else{
                var id =d3.select('#mapReg').selectAll('path').filter(function(d){
                    var terName = d3.select('#'+this['id']).attr('name');
                    return terName == name;  
                });
                showTooltipReg(id,150);
                d3.select("#my_dataviz").selectAll('path').each(function(t){
                    d3.select(this).style("stroke-width", "1.5")
                })
            }
            brushed_p=[];
            d3.selectAll('.brushed').each(function(d){
                brushed_p.push(d)
            })
            if(brushed_p.length==0){
                if(visualization==0) id.style('stroke-width','1.5');
                else id.style('stroke-width','2');
            } 
            else if(brushed_p.includes(id.attr('name') ) ){
                oldSt=id.style('stroke');
                id.style('stroke','blue');
            }
            else{
                id.style('stroke-width','1.5');
            }
    
            //HIGHLIGTH MDS POINTS
            d3.select("#regions").selectAll("circle").each(function(d){
                if(name == d){
                    d3.select(this).raise().classed("active", true);
                    d3.select(this).attr("id", "coordination").attr("r","4")
                }
            })
        })                
        .on("mouseout", function(d) {
            
            
            //removeTooltip
            d3.selectAll('.PCtooltip').style('display', 'none')
            name =d['territory'].trim()
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
            brushed_p=[];
            d3.selectAll('.brushed').each(function(d){
                brushed_p.push(d.trim())
            })
            if(brushed_p.length==0) id.style('stroke-width','0.5');
            if(brushed_p.includes(id.attr('name').trim() ) ){
                id.style('stroke',oldSt);
            }
            else{
                id.style('stroke-width','0.5');
            }
            d3.select("#my_dataviz").selectAll('path').each(function(t){
                if( d3.select(this).attr("name") != null){
                    if ( (MDS_PC_LOCK && !brushed_p.includes(overed) && d3.select(this).attr("name").trim() == overed)|| (!MDS_PC_LOCK )){
                        d3.select(this).style("stroke", "#2c7bb6")
                    }
                }
            })
            
            //DE-HIGHLIGTH MDS POINTS
            d3.select("#regions").selectAll("svg").selectAll("#coordination").each(function(d){
                d3.select(this).attr("id", "null").attr("r","3")
            })
            
           
            
        })
        .on("click", function(d) {
            MDS_PC_LOCK = false
            d3.select("#my_dataviz").selectAll('path').each(function(t){
                if (d3.select(this).attr("name") != null){
                  d3.select(this).style("stroke", "#2c7bb6")
                }
            })
            d3.select(this).raise().classed("active", true);
            d3.select(this).style("stroke", "#d7191c")
        })

     // Add a group element for each dimension.
     const g = svg_PC.selectAll(".dimension")
        .data(dimensions)
        .enter().append("g")
        .attr("class", "dimension")
        .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
        .call(d3.drag()
        .subject(function(d) { return {x: x(d)}; })
        .on("start", function(d) {
          dragging[d] = x(d);
          background.attr("visibility", "hidden");
        })
        .on("drag", function(d) {
          dragging[d] = Math.min(width, Math.max(0, d3.event.x));
          foreground.attr("d", path);
          dimensions.sort(function(a, b) { return position(a) - position(b); });
          x.domain(dimensions);
          g.attr("transform", function(d) { return "translate(" + position(d) + ")"; })
        })
        .on("end", function(d) {
          delete dragging[d];
          transition(d3.select(this)).attr("transform", "translate(" + x(d) + ")");
          transition(foreground).attr("d", path);
          background
              .attr("d", path)
            .transition()
              .delay(1000)
              .duration(0)
              .attr("visibility", null);
        }));
    
    // Add an axis and title.
   
    g.append("g")
        .attr("class", "axis")
        .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
        .append("text")
        .style("text-anchor", "start")
        .attr("transform", "rotate(-7)")
        .attr("y", -9)
        .text(function(d) {
            d3.select(this).style("font-size", 10)
            if(d.length > 30) {
                //d3.select(this).attr("transform", "rotate(-5)")
                return d.substring(0,29)
            }
            return d; })
        .on("mouseover", function(d) {
            d3.select(this).text(d)
            //if(d.length > 23) document.getElementById("par-coord").style.border = 'none'
            })
        .on("mouseout", function(d) {
            if(d.length > 30) d3.select(this).text(d.substring(0,29))
            //document.getElementById("par-coord").style.border = '3px solid black'
            })
        /* .on("click",function(d){
            //CRIMES.splice(CRIMES.indexOf(d),1)
            //draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
            CRIMES.splice(CRIMES.indexOf(d),1)
            $('.selectCrimes').val(CRIMES).trigger('change');
            draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
            computeColourScales()
        }) */
        .style("fill", "black")
        // Add and store a brush for each axis.
    g.append("g")
        .attr("class", "brush")
        .each(function(d) { 
            d3.select(this).call(y[d].brush = d3.brushY()
                    .extent([[-10,0], [10,height]])
                    .on("brush", brush)           
                    .on("end", brush_end)
                )
        })
        .selectAll("rect")
        .attr("x", -8)
        .attr("width", 16);
        function brush_end(){
            var brushedTerr= brush();
            var ter =[]
            brushedTerr.forEach( n => ter.push(n.territory.trim()) )
            if(visualization==0){
                var idNotBrush =d3.select('#mapProv').selectAll('path').filter(function(d){
                    return !ter.includes( d3.select('#'+this['id']).attr('name') );
                });
                var idBrush =d3.select('#mapProv').selectAll('path').filter(function(d){
                     return ter.includes( d3.select('#'+this['id']).attr('name') );
                });
           }
           else{
               var idNotBrush =d3.select('#mapReg').selectAll('path').filter(function(d){
                   return !ter.includes( d3.select('#'+this['id']).attr('name') );
               });
               var idBrush =d3.select('#mapReg').selectAll('path').filter(function(d){
                    return ter.includes( d3.select('#'+this['id']).attr('name') );
               });
           }      
           idNotBrush.style('opacity','0.5');
           idBrush.style('opacity','1');

           d3.select("#regions").selectAll("circle").each(function(d){
            if(!ter.includes(d)){
                d3.select(this).classed("pc_brushed", true)
            }
            if(ter.includes(d)){
                d3.select(this).classed("pc_brushed", false);
            }
        })    
        }
        function brush() {  
            var actives = [];
            svg_pc.selectAll(".brush")
              .filter(function(d) {
                    y[d].brushSelectionValue = d3.brushSelection(this);
                    return d3.brushSelection(this);
              })    
              .each(function(d) {
                  // Get extents of brush along each active selection axis (the Y axes)
                    actives.push({
                        dimension: d,
                        extent: d3.brushSelection(this).map(y[d].invert)
                    });
              });
            svg_pc.selectAll(".selection").style("fill","yellow")
            svg_pc.selectAll(".selection").style("stroke","black")
            var selected = [];
            // Update foreground to only display selected values
            foreground.style("display", function(d) {
                let isActive = actives.every(function(active) {
                    var result
                    if(!isAbsolute){
                        result = active.extent[1] <= d[active.dimension] && d[active.dimension] <= active.extent[0];
                    }
                    else{
                        result = active.extent[1] <= (d[active.dimension]/d["population"])*10000 && (d[active.dimension]/d["population"])*10000 <= active.extent[0];
                    }
                    return result;
                });
                // Only render rows that are active across all selectors
                if(isActive) selected.push(d);
                return (isActive) ? null : "none";
            });
            return selected
        }
    })        
}
function updLeg(){if(legC==0) {legC+=1; return null;}
                  else  return updateLegend( split(d3.select('#mapReg').attr('minMax')) )}
(function(){
  var lastWidth = 0;
  function pollZoomFireEvent() {
    var widthNow = jQuery(window).width();
    if (lastWidth == widthNow) return;
    lastWidth = widthNow;
    // Length changed, user must have zoomed, invoke listeners.
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
  }
  setInterval(pollZoomFireEvent, 100);
})();

//?!! ARROW
function yearPP(){
    to_b_ckd = []
    i = 0
    j = 1
    d3.selectAll(".yearCheckbox").each(function(){
        if(d3.select(this).property("checked") && d3.select(this).attr("id") != "tot"){
            c_y = d3.select(this).attr("id")
            while(d3.select('[id="'+c_y+'"]').property("checked")){
                c_y++
                if(to_b_ckd.includes(c_y)) {
                    c_y+=j
                    j++
                }
                if(c_y >= 2020) {
                    c_y = 2012 +i
                    i++
                }
            }
            to_b_ckd.push(c_y)
            d3.select(this).property("checked",false)
        } 
    })
    to_b_ckd.forEach(function(y){
        d3.select('[id="'+y+'"]').property("checked",true)
    })
    YEAR = to_b_ckd
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    selectedYears = to_b_ckd.map(String)
    createMDS(visualization, computationType, mdsComputationType, YEAR, visibleLabel, true)
    computeColourScales()
}

function yearMM(){
    to_b_ckd = []
    i = 0
    j = 0
    reversed_items=[]
    d3.selectAll(".yearCheckbox").each(function(){
        reversed_items.push(d3.select(this))
    })
    reversed_items = reversed_items.reverse()
    reversed_items.forEach(function(e){
        if(e.property("checked") && e.attr("id") != "tot"){
            c_y = e.attr("id")
            while(d3.select('[id="'+c_y+'"]').property("checked")){
                c_y--
                if(to_b_ckd.includes(c_y)) {
                    j++
                    c_y-=j
                }
                if(c_y < 2012) {
                    c_y = 2019 -i
                    i++
                }
            }
            to_b_ckd.push(c_y)
            e.property("checked",false)
        } 
    })
    to_b_ckd.forEach(function(y){
        d3.select('[id="'+y+'"]').property("checked",true)
    })
    YEAR = to_b_ckd
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    selectedYears = to_b_ckd.map(String)
    createMDS(visualization, computationType, mdsComputationType, YEAR, visibleLabel, true)
    computeColourScales() 
}
function position(d) {
    var v = dragging[d];
    return v == null ? x(d) : v;
  }
  
  function transition(g) {
    return g.transition().duration(500);
  }