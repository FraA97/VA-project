//set width and height of svg shape
var widthMap = 500,
    heightMap = 540;

var marginZoom = { top: -5, right: -5, bottom: -5, left: -5 }
var sumDelPop=0; //var for the sum of crimes divided population
var sumDel=0 //var for the sum of crimes
var colorProv = null; //province colour scale
var colorReg = null; //province colour scale
var numbers = []; //for set of numbers of delicts of each territory
var count = 0; //count number of swapping among maps 
var population=0;
var legC=0;

function updLeg(){if(legC==0) {legC+=1; return null;}
                  else  return updateLegend( split(d3.select('#mapReg').attr('minMax')) )}
(function(){
  var lastWidth = 0;
  function pollZoomFireEvent() {
    var widthNow = jQuery(window).width();
    if (lastWidth == widthNow) return;
    lastWidth = widthNow;
    // Length changed, user must have zoomed, invoke listeners.
    updLeg();
  }
  setInterval(pollZoomFireEvent, 100);
})();


//create leaflet container
var leafletCont= d3.select('#content').append('div').attr('class', 'leaflet-control-container')
                                      .append('div').attr('class','leaflet-top leaflet-left').attr('id','zoomLeaflet')
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

var slider = d3.select("#slide").append("p").attr('id',"pZoomBar").append("input")
                .datum({})
                .attr("type", "range")
                .attr('id','zoomBar')
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
                    .append('div').attr('id','checkAll').attr('class', 'leaflet-bar leaflet-control')
                    .text('Select All ')
                    .append('input')
                    .attr('type','checkbox').attr( 'id','selectAll')
                  
//manage events of selectAllProv
d3.select("#selectAll").on("change", selectAllTer)//select or unselect all reg/prov

var showDensity = d3.select('.leaflet-top')
                    .append('div').attr('id','showDensity').attr('class', 'leaflet-bar leaflet-control')
                    .text('P.D.')
                    .append('input')
                    .attr('type','checkbox').attr( 'id','popDensity');

d3.select("#popDensity").on("change", loadPopCircles);//show/hide density map
//---------------------------------------------------------------
//---------------------------------------------------------------


//MENU VARIABLES
var mdsComputationType = 0; //variable that contain the mdsComputationType of the moment: =0 =>coefficient of dangerous; =1 => weighted coeff; =2 => no coefficient
var visualization = '1'; //variable that contain the visualization type of the moment: =0 =>vis. for provinces; =1 => vis. for regions 
var computationType=0; //variable that contain the computationType of the moment: =0 =>number of crimes; =1 => num.crimes/population 
var selectedYears=["2019"]; //variable tha contain the years selected (start with all years selected))
var selected_crimes = []; //variable that contain crimes selected
var list_crimes = []; //list of all crimes retrieved from dataset (in 'manageCrimesSelection.js' file)
var selY=[[selectedYears],[selectedYears]];
var visibleLabel = false

//MENU CODE
d3.select('#legendCrimes').append('svg').attr('id','svgLegCr')

  function changeLabelMode (){
    visibleLabel = !visibleLabel
    if(visibleLabel){
      var t = d3.selectAll("#text")
      t.style("visibility", "visible")
      d3.selectAll(".mdsTooltip").style("display", "none");
    }
    else{
      var t = d3.selectAll("#text")
      t.style("visibility", "hidden")
      d3.selectAll(".mdsTooltip").style("display", "block");
    }            
  }

d3.select('#mdsComputation')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));
    mdsComputationType = newData;
    loadMdsComputationValue(newData);
    createMDS(visualization, computationType, mdsComputationType, selectedYears, visibleLabel, true);
    //draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)

});

//compute for number of crimes or num.crimes/population 
d3.select('#computationCrimes')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));//0 if choose only number of crimes or 1 if choose num_crimes/pop
    computationType=newData
    loadComputationMap(newData);
    createMDS(visualization, computationType, mdsComputationType, selectedYears, visibleLabel, true);
    //loadComputationParallelCoordinates(newData); (valerio [menu]) DONE
    if(newData == 0) changeAbsolute(false)
    else changeAbsolute(true)
});
computeColourScales();//compute colour scales considering only num crimes
//compute parCoord(); //(valerio [start function]) compute par. coord. considering only num crimes DONE

//visualize for region or province map
var changedVisualization = false;
d3.select('#visualization')
  .on('change', function() {
    var newData = eval(d3.select(this).property('value'));//0 if choose to vis. for province or 1 if choose to vis for regions
    visualization=newData; //variable that mantain value 0 or 1 (default setted to 0 => visualize for provinces)
    loadMap(newData);
    if(newData == 0){
      updateLegend( split(d3.select('#mapProv').attr('minMax')) );
    } 
    else{
      updateLegend( split(d3.select('#mapReg').attr('minMax') ) );
    } 
    REGIONS = changeKindOfTerritory(newData)
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    changedVisualization = true;
    createMDS(visualization, computationType, mdsComputationType, selectedYears, visibleLabel, false);
    //loadParallelCoordinates(newData); (valerio [menu]) (must load par. coord. with prov or reg) DONE
});

var running = false;
var timer;

d3.select("#range").style("opacity", "0");

d3.select('#play').on("click", function() {
		
  var duration = 2000,
    maxstep = 2019;
  
  if (running == true) {
    $("#play").html("Play MDS evolution");
    d3.select("#range").style("opacity", "0");
		running = false;
		clearInterval(timer);
    if($("#slider").val() == 2019){
      $("#slider").val(2012)
      $('#range').html(2012);
    }
  }
  else if (running == false) {
			
    $("#play").html("Pause");
    d3.select("#range").style("opacity", "1.0");
    
    sliderValue = $("#slider").val();
    createMDS(visualization, computationType,mdsComputationType, [sliderValue], visibleLabel, true);
    
    timer = setInterval( function(){
        if (sliderValue < maxstep){
          sliderValue++;
          $("#slider").val(sliderValue);
          $('#range').html(sliderValue);
        }
        createMDS(visualization, computationType,mdsComputationType, [sliderValue], visibleLabel, true);
    }, duration);
    running = true;    
  }
})

REGIONS = changeKindOfTerritory(visualization)
draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)//<------ first draw
loadMap(visualization);//Region map
//loadParallelCoordinates(newData); (valerio [start function]) DONE
createMDS(visualization, computationType,mdsComputationType, selectedYears, visibleLabel, true);
var t = d3.selectAll("#text")
  t.style("visibility", "hidden")
  d3.select("#regions").selectAll(".mdsTooltip").style("display", "block");
//Years (valerio=>function to implement is on 'updateSelectedYears' function) DONE
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

