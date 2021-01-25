//set width and height of svg shape
var width = 700,
    height = 900;
    var margin = { top: -5, right: -5, bottom: -5, left: -5 }
//set scale of colours
var nameRegions = ["Trentino Alto Adige / Südtirol","Piemonte","Valle d'Aosta / Vallée d'Aoste","Liguria","Lombardia","Veneto","Friuli-Venezia Giulia",
                    "Emilia-Romagna","Toscana","Umbria","Marche","Lazio","Abruzzo","Molise","Campania","Puglia","Basilicata","Calabria","Sicilia","Sardegna"]

var nameProvinces =[];
var sumDel = 0; //var for the sum of delicts on the clicked region
var color = null;
var numbers = [];
var reg_population = {};
var density_crime = 0;
var selected_crimes = ['strage'];

//retrive population data of provinces and save on a dictionary
d3.csv("./datasets/dataset_popolazione_italiana/popolazione_italiana(prov+reg).csv", function(data) {
  for (let index = 0; index < data.length; index++) {
      reg_population[data[index].Territorio]=data[index].Value;
  }
  console.log(reg_population)
})

//zoom variables
let container = d3.selectAll("svg g");

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

    var svg = d3.selectAll("svg")
            .attr("transform", "translate(" + margin.left + "," + margin.right + ")")
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
      zoom.scaleTo(d3.select("svg"), d3.select(this).property("value"));
    }
//zoom();





/*
//save all possible values of regions delicts (seeing the specific query )
d3.csv("./dataset_delitti/target.csv", function(data) {
      regions = d3.nest() //create dictionary on regions name
               .key(function(d) { return d.Region; })
               .entries(stocks = data);      

      regions.forEach(function (s){
          if(nameRegions.includes(s.key)){
              s.values.forEach(function(d) { 
                    sumDel = d3.sum(s.values, function(d){ //filter per year and crime types
                                            //es:   if(d.Year == "2011" & d.Code == "CULPINJU")
                                              return d.Value;})}
              )
              
              //number of crimes
              if(d3.select("#computation").node().value== "0" || d3.select("#computation").node().value== "1" ){
                  numbers.push(sumDel);
              }
              //number of crimes/region population
              else if(d3.select("#computation").node().value == "2"){
                numbers.push(sumDel/reg_population[s.key]);
              }
              //number of crimes/region area
              else{
                
              }
            
              sumDel=0;
          }
          
      })

      console.log(numbers)
      color = d3.scaleLinear()
                .domain(d3.extent(numbers)) //select min an max of retrived values
                .range(["yellow","red"]);
                //"#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"
});
*/

//PROVINCES
//save all possible values of provinces crimes (seeing the specific query )
var list_provinces=[]
d3.csv("./datasets/dataset_delitti/10_years_dat.csv", function(data) {
  regions = d3.nest() //create dictionary on regions name
           .key(function(d) {
              list_provinces.push(d.Territorio); //retrive all teritory from dataset 
              return d.Territorio; })
           .entries(stocks = data);    
  

  list_provinces = removeRegions(removeDuplicates(list_provinces)); //remove duplicates and regions and macro-areas
  

  regions.forEach(function (s){
      if(list_provinces.includes(s.key)){
        
          s.values.forEach(function(d) { 
            //console.log(d);
                sumDel = d3.sum(s.values, function(d){ //filter per year and crime types
                                        //es:   if(d.Year == "2011" & d.Code == "CULPINJU")
                    tot_selected_crimes_per_year=0;
                    //console.log(d);
                  
                    if(selected_crimes.length==0){ //if array of crimes is empty then select all crimes
                        return d.totale;
                    }
                    else{ //if some crimes are been selected
                      for (const [key, value] of Object.entries(d)) {
                          if(selected_crimes.includes(key)){ //"selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
                              tot_selected_crimes_per_year+=value;
                          }
                      }
                      return tot_selected_crimes_per_year;
                    }
                })
          })
          
          //number of crimes
          if(d3.select("#computation").node().value== "0" || d3.select("#computation").node().value== "1" ){
              numbers.push(sumDel);
            //  console.log(sumDel);
          }

          
          //number of crimes/region population
          else if(d3.select("#computation").node().value == "2"){
            numbers.push(sumDel/reg_population[s.key.trim()]);
          }
          //number of crimes/region area
          else{
            
          }
        
          sumDel=0;
      }
      
  })

  console.log(numbers)
  color = d3.scaleLinear()
            .domain(d3.extent(numbers)) //select min an max of retrived values
            .range(["yellow","red"]);
            //"#ffffcc","#ffeda0","#fed976","#feb24c","#fd8d3c","#fc4e2a","#e31a1c","#bd0026","#800026"

});
    


//tooltip defined for show name of region when arrive the mouse
var tooltip = d3.select("#content")
     .append("div")
     .attr("class", "tooltip hidden")
     .attr("id","tooltip");
 


var mapProv = d3.json('./datasets/dataset_mappa_italiana/mappa_italiana_provincie.json', function(data) {
      createMapProv(data);
    
      var g=d3.select('#content g.mapProv');
      g.selectAll('path')  
            .on('mouseover',
              function(){
                if(d3.select(this).attr("clicked") != 1){
                  d3.select(this)
                    .attr('class','white');
                }
              }
            );
    
      var g=d3.select('#content g.mapProv');
      g.selectAll('path')  
            .on('mouseout',
              function(){
                if(d3.select(this).attr("clicked") != 1){
                  d3.select(this)
                  .attr('class','greyProv');
                }
              tooltip.attr('style', null)
                  .classed("hidden", true)
                  .node().innerHTML = null;
              
              }
            );
    
})





var mapReg = d3.json('./datasets/dataset_mappa_italiana/mappa_italiana_regioni.json', function(data) {
  createMapReg(data);
/*
  var g=d3.select('#content g.mapReg');
  g.selectAll('path')  
        .on('mouseover',
          function(){
            if(d3.select(this).attr("clicked") != 1){
              d3.select(this)
                .attr('class','white');
            }
          }
        );

  var g=d3.select('#content g.mapReg');
  g.selectAll('path')  
        .on('mouseout',
          function(){
            if(d3.select(this).attr("clicked") != 1){
              d3.select(this)
              .attr('class','greyReg');
            }
          tooltip.attr('style', null)
              .classed("hidden", true)
              .node().innerHTML = null;
          
          }
        );
*/
})

