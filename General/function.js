var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
d3.text(dataset_path, function(raw) {//retrive sum of delicts
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);

    filteredData = data.filter(function(d,i){ return d.territorio.match(/    /) })      //eliminate macro regions
    regions = filteredData.filter(function(d,i){
      if(d.territorio.match(/      /)){return false}                                    //eliminate provinces
      return true;
    });
    regions.forEach( d => delete d.popolazione);                            //eliminate column popolazione
    regions.forEach( d => delete d.totale);                                 //eliminate column totale
    regions.forEach( d => delete d['altri delitti']);                       //eliminate column altri delitti

    d3.text("../coefficienti.csv", function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(',');
        var dataCoeff =dsv.parse(raw);
      //---------------------------------------------Computing  default dissimilarity matrix------------------------------------------------
      
      var m = chooseCharacteristic(dataCoeff, regions, 1, 2019)

      //---------------------------------------------Visualization------------------------------------------------
      
      plotMds(m)

    });

  })

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
    if(c == 1){
        coeff = dataCoeff.map(function(d) { return d.Coeff_reato });   //select only this specific column
    }
    else{
        coeff = dataCoeff.map(function(d) { return d.Coeff_tot_reati });
    }

    anno = regions.filter(function(d){ return d.anno == year });
    labels = anno.map(function(d){ return d.territorio});
    for (var i = 0; i < labels.length; i++){                    //manipulating labels
        labels[i]=labels[i].replace("    ", "")
        labels[i] = labels[i].replace(" / Vallée d'Aoste","")
        labels[i] = labels[i].replace(" / Südtirol","")
        labels[i] = labels[i].replace(" / Bozen","")
    }

    anno.forEach( d => delete d.territorio);
    anno.forEach( d => delete d.anno);

    var avg = [];                                        //creating weighted avarage of crime for each region
    var denominator = d3.sum(coeff)
    
    for (var i = 0; i < anno.length; i++) {
        var crimes=[];
        var nominator = 0;
        for (var cr in anno[i]){
          crimes.push(anno[i][cr])
        }
        for(var j=0; j< crimes.length; j++){
          nominator += crimes[j]*coeff[j]
        }
        avg[i]=nominator/denominator
    }
    var dissM = [];
    for(var i=0; i< avg.length; i++) {
    dissM[i] = [];
        for(var j=0; j< avg.length; j++) {
        dissM[i][j] = ~~(Math.abs(avg[i]-avg[j]));
        }
    }
    return dissM
  }
