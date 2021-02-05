//set width and height of svg shape
var widthMap = 500,
    heightMap = 575;

var marginZoom = { top: -5, right: -5, bottom: -5, left: -5 }

var sumDelPop=0; //var for the sum of crimes divided population
var sumDel=0 //var for the sum of crimes
var colorProv = null; //province colour scale
var colorReg = null; //province colour scale
var numbers = []; //for set of numbers of delicts of each territory
var list_crimes = []; //list of all crimes retrieved from dataset (in 'manageCrimesSelection.js' file)
var count = 0; //count number of swapping among maps 
var population=0;





//create leaflet container
var leafletCont= d3.select('#content').append('div').attr('class', 'leaflet-control-container')
                                      .append('div').attr('class','leaflet-top leaflet-left')
                                      .append('div').attr('id','slide').attr('class','leaflet-control-zoom leaflet-bar leaflet-control leaflet-zoom-anim')


//zoom 
let container = d3.selectAll("#content g.map");

var zoom = d3.zoom()
                .scaleExtent([1, 10])
                .on("zoom", zoomed);

var drag = d3.drag()
                .subject(function (d) { return d; })
                .on("start", dragstarted)
                .on("drag", dragged)
                .on("end", dragended);

var slider = d3.select("#slide").append("p").append("input")
                .datum({})
                .attr("type", "range")
                .attr("value", zoom.scaleExtent()[0])
                .attr("min", zoom.scaleExtent()[0])
                .attr("max", zoom.scaleExtent()[1])
                .attr("step", (zoom.scaleExtent()[1] - zoom.scaleExtent()[0]) / 100)
                .on("input", slided);

var svg = d3.select("#map")
            .attr("transform", "translate(" + marginZoom.left + "," + marginZoom.right + ")")
            .call(zoom);

function zoomed() {
      const currentTransform = d3.event.transform;
      container.attr("transform", currentTransform);
      slider.property("value", currentTransform.k);
}
function dragstarted(d) {
      d3.event.sourceEvent.stopPropagation();
      d3.select(this).classed("dragging", true);
}
function dragged(d) {
      d3.select(this).attr("cx", d.x = d3.event.x).attr("cy", d.y = d3.event.y);
}
function dragended(d) {
      d3.select(this).classed("dragging", false);
}
function slided(d) {
      zoom.scaleTo(d3.select("#map"), d3.select(this).property("value"));
}

//tooltip defined for show name of region when arrive the mouse
var tooltip = d3.select("#content")
     .append("div")
     .attr("class", "tooltip hidden")
     .attr("id","tooltipMap");
 
var selectAllProv = d3.select('.leaflet-top')
                    //.append('div').attr('class','leaflet-control-container')
                    //.append('div').attr('class','leaflet-up leaflet-left')
                    .append('div').attr('id','checkAll').attr('class', 'leaflet-bar leaflet-control')
                    .text('Select All ')
                    .append('input')
                    .attr('type','checkbox').attr( 'id','selectAll')
                  
//manage events of selectAllProv
d3.select("#selectAll").on("change", selectAllTer); //select or unselect all reg/prov

/*
//LEGEND MAP
// select the svg area
var legend = d3.select("#legendMap")

// create a list of keys
var keys = ["A", "B", "C", "D", "E"]

// Usually you have a color scale in your chart already
var color = d3.scaleOrdinal()
  .domain(keys)
  .range(['#ffffb2',
  '#fecc5c',
  '#fd8d3c',
  '#f03b20',
  '#bd0026']);

// Add one dot in the legend for each name.
var size = 20
legend.selectAll("mydots")
  .data(keys)
  .enter()
  .append("rect")
    .attr("x", 15)
    .attr("y", function(d,i){ return 415 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
    .attr("width", size)
    .attr("height", size)
    .style("fill", function(d){ return color(d)})

// Add one dot in the legend for each name.
legend.selectAll("mylabels")
  .data(keys)
  .enter()
  .append("text")
    .attr("x", 15 + size*1.2)
    .attr("y", function(d,i){ return 415+ i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
    .style("fill", function(d){ return color(d)})
    .text(function(d){ return d})
    .attr("text-anchor", "left")
    .style("alignment-baseline", "middle")

*/



//---------------------------------------------------------------
//---------------------------------------------------------------


//MENU VARIABLES
var visualization = '1'; //variable that contain the visualization type of the moment: =0 =>vis. for provinces; =1 => vis. for regions 
var computationType=0; //variable that contain the computationType of the moment: =0 =>number of crimes; =1 => num.crimes/population 
var selectedYears=["2019"]; //variable tha contain the years selected (start with all years selected))
var selected_crimes = []; //variable that contain crimes selected

//MENU CODE

//compute for number of crimes or num.crimes/population 
d3.select('#computationCrimes')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));//0 if choose only number of crimes or 1 if choose num_crimes/pop
    loadComputationMap(newData);
    //loadComputationParallelCoordinates(newData); (valerio [menu]) DONE
    if(newData == 0) changeAbsolute(false)
    else changeAbsolute(true)
});
computeColourScales();//compute colour scales considering only num crimes
//compute parCoord(); //(valerio [start function]) compute par. coord. considering only num crimes

//visualize for region or province map
d3.select('#visualization')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));//0 if choose to vis. for province or 1 if choose to vis for regions
    visualization=newData; //variable that mantain value 0 or 1 (default setted to 0 => visualize for provinces)
    loadMap(newData);
    if(newData == 0){
      updateLegend( split(d3.select('#mapProv').attr('minMax')) );
      filterByRegion("provinces");
    } 
    else{
      updateLegend( split(d3.select('#mapReg').attr('minMax') ) );
      filterByRegion("region");
    } 
    //loadParallelCoordinates(newData); (valerio [menu]) (must load par. coord. with prov or reg)
});
//console.log(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
draw(YEAR,"only",REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)//<------ first draw
loadMap(visualization);//Region map
//loadParallelCoordinates(newData); (valerio [start function])

//Years (valerio=>function to implement is on 'updateSelectedYears' function)
d3.selectAll(".yearCheckbox").on("change",updateSelectedYears); //update list of selected years ('selectedYears') + map

d3.selectAll(".yearCheckbox").property('checked',false);//start with only 1 year selected

document.getElementById("2019").checked = true  
//manage years checkboxes
var expanded = false;
function showCheckboxes() {
  var checkboxes = d3.select("#yearCheckboxes");
  if (!expanded) {
    checkboxes.node().style.display = "block";
    expanded = true;
  } else {
    checkboxes.node().style.display = "none";
    expanded = false;
  }
}


