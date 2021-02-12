//var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
var dataset_path = "datasets/dataset_crimes/dataset1219.csv"
function createMDS(coeff, year){
  //d3.select("#regions").selectAll("*").remove()

  d3.text(dataset_path, function(raw) {//retrive sum of delicts
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);

    var filteredData = data.filter(function(d,i){ return d.territorio.match(/    /) })      //eliminate macro regions
    var regions = filteredData.filter(function(d,i){
      if(d.territorio.match(/      /)){return false}                                    //eliminate provinces
      return true;
    });
    regions.forEach( d => delete d.popolazione);                            //eliminate column popolazione
    regions.forEach( d => delete d.totale);                                 //eliminate column totale
    regions.forEach( d => delete d['altri delitti']);                       //eliminate column altri delitti
    //var coeff_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/coefficienti.csv"
    var coeff_path = "datasets/coefficienti.csv"
    d3.text(coeff_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(',')
        var dataCoeff =dsv.parse(raw)
      //---------------------------------------------Computing  default dissimilarity matrix------------------------------------------------
      
      var m = chooseCharacteristic(dataCoeff, regions, coeff, year)

      //---------------------------------------------Visualization------------------------------------------------
      plotMds(m)
      
    });

  })
}

function plotMds(matrix){
  var regionsPosition = numeric.transpose(mds.classic(matrix));
    var w = Math.min(720, document.documentElement.clientWidth - 20), 
    h = w /2;

    mds.drawD3ScatterPlot(d3.select("#regions"),
    regionsPosition[0],
    regionsPosition[1],
    labels,
    {
        w :  Math.min(720, document.documentElement.clientWidth - 20),
        h : w /2,
        padding : 60,
        reverseX : false,
        reverseY : false,
    });
}



function chooseCharacteristic(dataCoeff, regions, c, year){
  if(c == 0){
      coeff = dataCoeff.map(function(d) { return d.Coeff_reato });   //select only this specific column
  }
  else if(c == 1){
      coeff = dataCoeff.map(function(d) { return d.Coeff_tot_reati });
  }
  else{
      coeff = dataCoeff.map(function(d) { return d.No_coeff });
  }

  var dissM= [];
  for(var i=0; i< 20; i++) {
    dissM[i] = [];
    for(var j=0; j< 20; j++) {
      dissM[i][j] = 0;
    }
  }

  year.forEach(function(y){
    var anno = regions.filter(function(d){ return d.anno == y });

    labels = anno.map(function(d){ return d.territorio});
    for (var i = 0; i < labels.length; i++){                    //manipulating labels
        labels[i]=labels[i].replace("    ", "")
    }

    anno.forEach( d => delete d.territorio);
    anno.forEach( d => delete d.anno);

    var annoC = []                                //year with coefficient

    for (var i = 0; i < anno.length; i++){
      annoC[i] = []
      for(var cr in anno[i]){
        annoC[i].push(anno[i][cr])
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

