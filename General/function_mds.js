//var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
var dataset_path = "datasets/dataset_crimes/dataset1219.csv"
function createMDS(vis, pop, coeff, year, labelmode, visibleLabel, evolutionMode){

  d3.text(dataset_path, function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);

    var filteredData = data.filter(function(d,i){ return d.territorio.match(/    /) })      //eliminate macro regions
    var regions = filteredData.filter(function(d,i){
      if(vis==0){
        return d.territorio.match(/      /)                                                //eliminate regions
      }
      else{
        if(d.territorio.match(/      /)){return false}                                     //eliminate provinces
        return true;
      }
    });
    if(pop==0){
      regions.forEach( d => delete d.popolazione);                                        //eliminate column popolazione
    }
    regions.forEach( d => delete d.totale);                                               //eliminate column totale
    //var coeff_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/coefficienti.csv"
    var coeff_path = "datasets/coefficienti.csv"
    d3.text(coeff_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';')
        var dataCoeff =dsv.parse(raw)
      //---------------------------------------------Computing  default dissimilarity matrix------------------------------------------------
      
      var m = chooseCharacteristic(pop, dataCoeff, regions, coeff, year)

      //---------------------------------------------Visualization------------------------------------------------
      plotMds(m, labelmode, visibleLabel, evolutionMode)
      
    });

  })
}

function plotMds(matrix, labelmode, visibleLabel, evolutionMode){
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
        labelmode : labelmode,
        evolutionMode: evolutionMode
    });
}



function chooseCharacteristic(pop, dataCoeff, regions, c, year){
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
  size = regions.filter(function(d){ return d.anno == "2019"});             //establish size of dissimilarity matrix
  for(var i=0; i< size.length; i++) {
    dissM[i] = [];
    for(var j=0; j< size.length; j++) {
      dissM[i][j] = 0;
    }
  }

  year.forEach(function(y){
    var anno = regions.filter(function(d){ return d.anno == y });

    if(pop==1){
      var popolazione = anno.map(function(d){ return d.popolazione});     //take population values and eliminate them from dataset
      anno.forEach( d => delete d.popolazione);
    }

    labels = anno.map(function(d){ return d.territorio});
    for (var i = 0; i < labels.length; i++){                    //manipulating labels
        labels[i]=labels[i].trim();
    }

    anno.forEach( d => delete d.territorio);
    anno.forEach( d => delete d.anno);

    var annoC = []                                //year matrix with coefficient

    for (var i = 0; i < anno.length; i++){
      annoC[i] = []
      for(var cr in anno[i]){
        annoC[i].push(anno[i][cr])
      }
    }
    if(pop==1){
      for (var i = 0; i < anno.length; i++){
        for(var j=0; j < coeff.length; j++){
          value = annoC[i][j] / popolazione[i] *10000                //weigthing over population
          annoC[i][j] = value
        }
      }
    }
    for (var i = 0; i < anno.length; i++){
      for(var j=0; j < coeff.length; j++){
        value = annoC[i][j] * coeff[j]                //applying coefficient
        annoC[i][j] = value
      }
    }
    var dissMy = [];                                 //dissimilarity matrix for that year y
    for (var i = 0; i < anno.length; i++){
      dissMy[i] = [];
      for(var j=0; j < anno.length; j++){          
        dissMy[i][j] = ~~(euclidean_distance(annoC[i],annoC[j]));
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

(function(){
  var lastWidth = 0;
  function pollZoomFireEvent() {
    var widthNow = jQuery(window).width();
    if (lastWidth == widthNow) return;
    lastWidth = widthNow;
    d3.select("#regions").selectAll("*").remove()
    createMDS(visualization, computationType, mdsComputationType, selectedYears, false, visibleLabel, false)
  }
  setInterval(pollZoomFireEvent, 100);
})();
