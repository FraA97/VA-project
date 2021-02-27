//var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
var dataset_path = "datasets/dataset_crimes/dataset1219.csv"
function createMDS(vis, pop, coeff, year, visibleLabel, evolutionMode){

  d3.text(dataset_path, function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);

    var filteredData = data.filter(function(d,i){ return d.territory.match(/    /) })      //eliminate macro regions
    var regions = filteredData.filter(function(d,i){
      if(vis==0){
        return d.territory.match(/      /)                                                //eliminate regions
      }
      else{
        if(d.territory.match(/      /)){return false}                                     //eliminate provinces
        return true;
      }
    });
    if(pop==0){
      regions.forEach( d => delete d.population);                                        //eliminate column population
    }
    regions.forEach( d => delete d.total);                                               //eliminate column total
    //var coeff_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/coefficienti.csv"
    var coeff_path = "datasets/coefficienti.csv"
    d3.text(coeff_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';')
        var dataCoeff =dsv.parse(raw)
      //---------------------------------------------Computing  default dissimilarity matrix------------------------------------------------
      
      var m = chooseCharacteristic(pop, dataCoeff, regions, coeff, year)

      //---------------------------------------------Visualization------------------------------------------------
      plotMds(m, visibleLabel, evolutionMode)
      
    });

  })
}

function plotMds(matrix, visibleLabel, evolutionMode){
  var locationCoordinates = numeric.transpose(classic(matrix));               //mds computation

    drawD3ScatterPlot(d3.select("#regions"),                                  //mds plot
    locationCoordinates[0],
    locationCoordinates[1],
    labels,
    {
        w : document.getElementById("regions").clientWidth,
        h : document.getElementById("regions").clientHeight,
        padding : 60,
        reverseX : false,
        reverseY : false,
        visibleLabel : visibleLabel,
        evolutionMode: evolutionMode
    });
}



function chooseCharacteristic(pop, dataCoeff, regions, c, years){
  if(c == 0){
      coeff = dataCoeff.map(function(d) { return d.Coeff_reato });            //select only this specific column
  }
  else if(c == 1){
      coeff = dataCoeff.map(function(d) { return d.Coeff_tot_reati });
  }
  else{
      coeff = dataCoeff.map(function(d) { return d.No_coeff });
  }

  var dissM= [];
  size = regions.filter(function(d){ return d.year == "2019"});             //establish size of dissimilarity matrix
  for(var i=0; i< size.length; i++) {
    dissM[i] = [];
    for(var j=0; j< size.length; j++) {
      dissM[i][j] = 0;
    }
  }

  years.forEach(function(y){
    var year = regions.filter(function(d){ return d.year == y });

    if(pop==1){
      var population = year.map(function(d){ return d.population});     //take population values and eliminate them from dataset
      year.forEach( d => delete d.population);
    }

    labels = year.map(function(d){ return d.territory});
    for (var i = 0; i < labels.length; i++){                    //manipulating labels
        labels[i]=labels[i].trim();
    }

    year.forEach( d => delete d.territory);
    year.forEach( d => delete d.year);

    var yearC = []                                //year matrix with coefficient

    for (var i = 0; i < year.length; i++){
      yearC[i] = []
      for(var cr in year[i]){
        yearC[i].push(year[i][cr])
      }
    }
    if(pop==1){
      for (var i = 0; i < year.length; i++){
        for(var j=0; j < coeff.length; j++){
          value = yearC[i][j] / population[i] *10000                //weigthing over population
          yearC[i][j] = value
        }
      }
    }
    for (var i = 0; i < year.length; i++){
      for(var j=0; j < coeff.length; j++){
        value = yearC[i][j] * coeff[j]                //applying coefficient
        yearC[i][j] = value
      }
    }
    var dissMy = [];                                 //dissimilarity matrix for that year y
    for (var i = 0; i < year.length; i++){
      dissMy[i] = [];
      for(var j=0; j < year.length; j++){          
        dissMy[i][j] = ~~(euclidean_distance(yearC[i],yearC[j]));
        value =  dissM[i][j]
        value = value + dissMy[i][j]
        dissM[i][j] = value                           //total dissimilarity matrix
      }
    }
  });
  return dissM
  
}

function euclidean_distance(ar1,ar2){
  var dis = 0
  for(var i = 0; i < ar1.length; i++){
      dis = dis + Math.pow(ar1[i]-ar2[i],2)
  }
  return Math.sqrt(dis)
}

function eliminate_add_points_mds(area){
  d3.select("#regions").selectAll("g").each(function(d){
    if( area == d){
      if(d3.select(this).style("display")== "none"){
        d3.select(this).style("display", "block")
      }
      else d3.select(this).style("display", "none")
    }
  })
}

function eliminate_others_mds_point(areas){
  d3.select("#regions").selectAll("g").each(function(d){
    if(d!=null){
      if(areas.includes(d)){
          d3.select(this).style("display", "block")
        }
      else if(d3.select(this).attr("class")!="tick") d3.select(this).style("display", "none")
    }
  })
}

(function(){
  var lastWidth = 0;
  function pollZoomFireEvent() {
    var widthNow = jQuery(window).width();
    if (lastWidth == widthNow) return;
    lastWidth = widthNow;
    d3.select("#regions").selectAll("*").remove()
    createMDS(visualization, computationType, mdsComputationType, selectedYears, visibleLabel, false)
  }
  setInterval(pollZoomFireEvent, 100);
})();
