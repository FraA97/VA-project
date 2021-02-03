function createMapReg(geojson) {
    var projection = d3.geoEquirectangular().fitSize([widthMap,(heightMap+200)*1.4],geojson).scale(0.01);
    
    var geoGenerator = d3.geoPath()
      .projection(projection);
  
    d3.select('#map')
        .attr('width', widthMap)
        .attr('height',heightMap)
    var u = d3.select('#content g.mapReg')
      .selectAll('path')
      .data(geojson.features);

    u.enter()
      .append('path')
      .attr('d',geoGenerator )
      .attr('id', function(d,i){
          return "regione"+d.properties.COD_REG;
      }) 
      .attr('class','greyReg')
      .attr('type','button')
      .attr('name',function(d){return d.properties.DEN_REG;})
      .attr('cod_reg',function(d){return d.properties.COD_REG;})
      .attr('shape_area',function(d){return d.properties.SHAPE_AREA;})
      .attr('shape_leng',function(d){return d.properties.SHAPE_LENG;})
      .attr('clicked',"0")
      .attr("onclick",function(d,i){
              return "updateMapReg('regione',"+d.properties.COD_REG+");" +'' //(valerio)[on '' add function for manage click of a region---possible parameter = 'd3.select(this).attr('name') = nome della regione]]
           });
}

function createMapProv(geojson) {
/*
  var mapboxAccessToken = "pk.eyJ1IjoiZnJhbmNlc2NvYXJ0IiwiYSI6ImNrazViMDFsNTAzcmoyb240b251b3V5Y3cifQ.bsA1I-KVGUcofP0B3a7dvg";
 const container = document.getElementById('map')
if(container) {
  var map = L.map('map').setView([37.8, -96], 4);
   L.tileLayer('https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=' + mapboxAccessToken, {
     id: 'mapbox/light-v9',
     tileSize: 512,
     zoomOffset: -1
   }).addTo(map);
   L.geoJson(geojson).addTo(map);
}
*/
  var projection = d3.geoEquirectangular().fitSize([widthMap,(heightMap+200)*1.4],geojson)
                                          .scale(0.01);
  
  var geoGenerator = d3.geoPath().projection(projection);

  d3.select('#map')
     // .attr('width', width)
      //.attr('height',height)
  var u = d3.select('#content g.mapProv')
    .selectAll('path')
    .data(geojson.features);

  u.enter()
    .append('path')
    .attr('d',geoGenerator)
    .attr('id', function(d){
        return "provincia"+d.properties.COD_PROV+"-"+"reg"+d.properties.COD_REG;
    }) 
    .attr('class','greyProv')
    .attr('type','button')
    .attr('name',function(d){
        if(d.properties.DEN_PROV=="-"){
          return d.properties.DEN_CM;
        }
        else{
          return d.properties.DEN_PROV;
        }
      
    })
    .attr('cod_reg',function(d){return d.properties.COD_REG;})
    .attr('cod_prov',function(d){return d.properties.COD_PROV;})
    .attr('shape_area',function(d){return d.properties.SHAPE_AREA;})
    .attr('shape_leng',function(d){return d.properties.SHAPE_LENG;})
  // .attr('population',0)
    .attr('clicked',"0")
    .attr("onclick",function(d,i){
      return "updateMapProv('"+d3.select(this).attr("id")+"');"+'' //(valerio)[on '' add function for manage click of a province---possible parameter = 'd3.select(this).attr('name') = nome della provincia]
    })
    .on(["mousemove" || "click"], showTooltipProv);
    if(count==0) zoom.scaleTo(d3.select("#map").transition().duration(600), 2.3);
    count+=1;
}

function updateMapReg(r,i){  //apply transition + interaction
    var tot = '#'+r+i+''; //id of clicked region
    var reg = d3.select(tot).attr("name"); //name of clicked region
    console.log(reg);
    if(d3.select(tot).attr("clicked") != 1){
      reComputeSumDel(reg,tot,1);
    }
    else{
        d3.select(tot)
            .style('fill',null)
            .attr('class', 'greyReg')
            .attr('sumDel',null)
            .attr('sumDelPop',null)
            .attr('population',null)
            .attr('clicked','0');
    }			
}	

function updateMapProv(p,i){  //apply transition + interaction
  var tot = '#'+p; //id of clicked region
  var prov = d3.select(tot).attr("name"); //name of clicked region
  console.log(prov);
  
  if(d3.select(tot).attr("clicked") != '1'){
    if(prov!="Sud Sardegna") reComputeSumDel(prov,tot,0);
    else d3.select(tot).attr('sumDel',"No Data")
                       .attr('sumDelPop',"No Data")
                       .attr('population',"No Data")
                       .attr('clicked','1')
  }
  else{
      d3.select(tot)
          .style('fill',null)
          .attr('class', 'white')
          .attr('sumDel',null)
          .attr('sumDelPop',null)
          .attr('population',null)
          .attr('clicked','0');
  }			
}	

var offsetL = d3.select("#content").offsetLeft+10;
var offsetT = d3.select("#content").offsetTop+10;

function showTooltipReg(d) {
      region = d3.select(this)
      var mouse = d3.mouse(d3.select('#map').node())
                    .map( function(d) { return parseInt(d); } );
      if(region.attr('clicked')=='0'){
        label = "<b>"+d.properties.DEN_REG+"</b>";
        tooltip.classed("hidden", false)
              .attr("style", "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px")
              .html(label);
      }
      else{
        label="<center><b>"+d.properties.DEN_REG+"</b></center>"
                +"Num. Crimes: "+ Number(region.attr('sumDel')).toLocaleString() +"<br>"
                +"Region Area: "+ Number(region.attr('shape_area')/1000000).toLocaleString() +" km<sup>2</sup> "+"<br>"
                +"Region Population: "+ Number(region.attr('population')).toLocaleString() 
        tooltip.classed("hidden", false)
              .attr("style", "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px")
              .html(label);
      }
}

function showTooltipProv(d) { 
  province = d3.select(this);
  var nameReg=retrieveNameReg(province);
  var mouse = d3.mouse(d3.select('#map').node())
                .map( function(d) { return parseInt(d); } );
  if(province.attr('clicked')=='0'){
    if(d.properties.DEN_PROV=="-"){
      label = "<b>"+d.properties.DEN_CM+"</b>"+" ("+nameReg+")";
    }
    else{
      label = "<b>"+d.properties.DEN_PROV+ "</b>"+" ("+nameReg+")";
    } 
    tooltip.classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px")
          .html(label);
  }
  else{
    if(d.properties.DEN_PROV=="-"){
      label="<center><b>"+d.properties.DEN_CM+"</b> ("+nameReg+")</center>"
            +"Num. Crimes: "+ Number(province.attr('sumDel')).toLocaleString() +"<br>"
            +"Province Area: "+ Number(province.attr('shape_area')/1000000).toLocaleString() +" km<sup>2</sup> " + "<br>"
            +"Province Population: "+ Number(province.attr('population')).toLocaleString() 
    }
    else{
      label="<center><b>"+d.properties.DEN_PROV+"</b> ("+nameReg+")</center>"
            +"Num. Crimes: "+ Number(province.attr('sumDel')).toLocaleString() +"<br>"
            +"Province Area: "+ Number(province.attr('shape_area')/1000000).toLocaleString() +" km<sup>2</sup> " + "<br>"
            +"Province Population: "+ Number(province.attr('population')).toLocaleString() 
    }
    tooltip.classed("hidden", false)
          .attr("style", "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px")
          .html(label);
  }
}

function removeDuplicates(array) {
  return array.filter((a, b) => array.indexOf(a) === b);
}

function removeRegions(array) {
  x=[];
  x = array.filter(el => el.includes("      "));
  return x;
}

function removeProvinces(array) {
  x=[];
  x = array.filter(el => (el.startsWith("    ") && !el.startsWith("      ")));
  return x;
}

//load region map(newData=0) or province map (newData=1) 
function loadMap(newData){
  if(newData=="1"){ //load region map
    var mapReg = d3.json('./datasets/dataset_mappa_italiana/mappa_italiana_regioni.json', function(data) {
      //HIDE THE PROVINCE MAP
      d3.select("#content g.mapProv").attr('style',"visibility:hidden");
     
      var gReg = d3.select('#content g.mapReg')
      .selectAll('path')

      gReg.attr('class','greyOnlyReg')
        .on('mousemove',showTooltipReg)
        .on('mouseover',
          function(){
            if(d3.select(this).attr("clicked") != '1'){
              d3.select(this)
                .attr('class','white');
            }
          }
        )
        .on('mouseout',
              function(){
                if(d3.select(this).attr("clicked") != '1'){
                  d3.select(this)
                  .attr('class','greyOnlyReg');
                }
              tooltip.attr('style', null)
                  .classed("hidden", true)
                  .node().innerHTML = null;
              }
            );
     });

     d3.select("#selectAll").property('checked',false);//uncheck checkbox for select all territory
  }
  else{ //load province map
    if(count==0){
      var mapReg = d3.json('./datasets/dataset_mappa_italiana/mappa_italiana_regioni.json', function(data) {
        createMapReg(data);
      })
      var mapProv = d3.json('./datasets/dataset_mappa_italiana/mappa_italiana_provincie.json', function(data) {
        createMapProv(data);
      
        var g=d3.select('#content g.mapProv').selectAll('path')  
              .on('mouseover',
                function(){
                  if(d3.select(this).attr("clicked") != '1'){
                    d3.select(this)
                      .attr('class','white');
                  }
                }
              )  
              .on('mouseout',
                function(){
                  if(d3.select(this).attr("clicked") != '1'){
                    d3.select(this)
                    .attr('class','greyProv');
                  }
                tooltip.attr('style', null)
                    .classed("hidden", true)
                    .node().innerHTML = null;        
                }
              );  
      })
    }
    var gReg = d3.select('#content g.mapReg')
      .selectAll('path')

    gReg.attr('class','greyReg')
        .attr('style',null)
        .on('mousemove',null)
        .on('mouseover', null)
        .on('mouseout', null);
    //show province map
    d3.select("#content g.mapProv").attr('style',"visibility:visible");
  }
  return 0;
}

function loadComputationMap(value){ 
  if(value=="0"){ //compute color of prov-reg considering only "number of crimes"
    computationType=0; //considering only "number of crimes"
    computeColourScales();
  }
  else{ //compute color of prov-reg considering  "number of crimes/population"
    computationType=1; //considering  "number of crimes/population"
    computeColourScales();
  }
return 0;
}

function computeColourScales(){
  //PROVINCES
  //save all possible values of provinces crimes (seeing the specific query )
  var list_provinces=[]
  d3.text("./datasets/dataset_crimes/dataset1219.csv", function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);
    regions = d3.nest() //create dictionary on regions name
            .key(function(d) {
                list_provinces.push(d.territorio); //retrive all teritory from dataset 
                return d.territorio; })
            .entries(stocks = data);    
    
    list_provinces = removeRegions(removeDuplicates(list_provinces)); //remove duplicates and regions and macro-areas
    
    numbers=[];
    regions.forEach(function (s){
        if(list_provinces.includes(s.key)){
          
            s.values.forEach(function(d) { 
              sumDel = d3.sum(s.values, function(d){ //filter per year and crime types
                if(selectedYears.includes(d.anno)){//FILTER YEARS
                  tot_selected_crimes_per_year=0;

                  if(selected_crimes.length==0){ //if array of crimes is empty then select all crimes
                  return d.totale;
                  }
                  else{ //if some crimes are been selected
                    for (const [key, value] of Object.entries(d)) {
                      if(selected_crimes.includes(key)){ //"selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
                          tot_selected_crimes_per_year+=parseInt(value);
                      }
                    }
                    return tot_selected_crimes_per_year;
                  }
                }
              })

              sumDelPop = d3.sum(s.values, function(d){ //filter per year and crime types
                if(selectedYears.includes(d.anno)){//FILTER YEARS
                  tot_selected_crimes_per_year=0;

                  if(selected_crimes.length==0){ //if array of crimes is empty then select all crimes
                    return d.totale/d.popolazione;
                  }
                  else{ //if some crimes are been selected
                    for (const [key, value] of Object.entries(d)) {
                      if(selected_crimes.includes(key)){ //"selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
                        tot_selected_crimes_per_year+=parseInt(value);
                      }
                    }
                    return tot_selected_crimes_per_year/d.popolazione;
                  }
                }
              })
            })
            
            //number of crimes
            if(computationType==0 ){
                numbers.push(sumDel);
            }
            //number of crimes/region population
            else {
              numbers.push(sumDelPop);
            }
            sumDel=0;
            sumDelPop=0;
        }
    })

    var minMax=d3.extent(numbers);
    colorProv = d3.scaleQuantile()
                  .domain([minMax[0], minMax[1]]) //select min an max of retrived values
                  .range(['#ffffb2',
                          '#fecc5c',
                          '#fd8d3c',
                          '#f03b20',
                          '#bd0026']);
    updateClickedProv();
  });

  //REGIONS
  //save all possible values of regions delicts (seeing the specific query )
  var list_regions=[];
  d3.text("./datasets/dataset_crimes/dataset1219.csv", function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);
      
    regions = d3.nest() //create dictionary on regions name
            .key(function(d) {
                list_regions.push(d.territorio); //retrive all territory from dataset 
                return d.territorio; })
            .entries(stocks = data);    
    
    list_regions = removeProvinces(removeDuplicates(list_regions)); //remove duplicates and regions and macro-areas
    console.log(list_regions);
   
    numbers=[];
    regions.forEach(function (s){
        if(list_regions.includes(s.key)){
        
            s.values.forEach(function(d) { 
                 sumDel = d3.sum(s.values, function(d){ //filter per year and crime types
                    if(selectedYears.includes(d.anno)){//FILTER YEARS
                      tot_selected_crimes_per_year=0;
                      if(selected_crimes.length==0){ //if array of crimes is empty then select all crimes
                        return d.totale;
                      }
                      else{ //if some crimes are been selected
                        for (const [key, value] of Object.entries(d)) {
                            if(selected_crimes.includes(key)){ ////FILTER CRIMES. "selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
                                tot_selected_crimes_per_year+=parseInt(value);            
                            }
                        }
                        return tot_selected_crimes_per_year;
                      }
                    }
                  })
                  sumDelPop = d3.sum(s.values, function(d){ //filter per year and crime types
                    if(selectedYears.includes(d.anno)){//FILTER YEARS
                      tot_selected_crimes_per_year=0;
                      if(selected_crimes.length==0){ //if array of crimes is empty then select all crimes
                        return d.totale/d.popolazione;
                      }
                      else{ //if some crimes are been selected
                        for (const [key, value] of Object.entries(d)) {
                            if(selected_crimes.includes(key)){ //FILTER CRIMES "selected_crimes" is the array that contain all crimes sElected by user (by default it start with all crimes)
                                tot_selected_crimes_per_year+=parseInt(value);
                            }
                        }
                        return tot_selected_crimes_per_year/d.popolazione;
                      }
                    }
                  })
                  
                //number of crimes
                if(computationType==0 ){
                    numbers.push(sumDel);  
                }
                //number of crimes/region population
                else {
                  numbers.push(sumDelPop);
                }
                sumDel=0;
                sumDelPop=0;
         })
        }
    });
    var minMax=d3.extent(numbers);
    colorReg = d3.scaleQuantile()
              .domain([minMax[0], minMax[1]]) //select min an max of retrived values
              .range(['#ffffb2',
                      '#fecc5c',
                      '#fd8d3c',
                      '#f03b20',
                      '#bd0026']);
    updateClickedReg()
  }); 
}

function updateClickedReg(){
          //update clicked regions
          var gReg = d3.select('#content g.mapReg').selectAll('path')
          .filter(function(d){
            //console.log(d3.select('#'+this['id']).attr('clicked'));
            return d3.select('#'+this['id']).attr('clicked')=='1';
          });

          gReg.each(function(d){
            var reg = d3.select(this);
            reComputeSumDel(reg.attr('name'),"#"+reg.attr('id'),1);
          })
}

function updateClickedProv(){
  //update selected reg-prov with the new colour (select them looking attribute "clicked")
  var gProv = d3.select('#content g.mapProv').selectAll('path')
  .filter(function(d){
    //console.log(d3.select('#'+this['id']).attr('clicked'));
    return d3.select('#'+this['id']).attr('clicked')=='1';
  });
  console.log(gProv)
  gProv.each(function(d){
    var prov = d3.select(this);
    reComputeSumDel(prov.attr('name'),"#"+prov.attr('id'),0);
  })
}

function updateSelectedYears(){ //change value of list of selected years
  //manage select all years checkbox
  var selectedC=d3.select(this);
  if(selectedC.attr('id')=='tot'){
    if(selectedC.property('checked') == true){
      d3.selectAll(".yearCheckbox").property('checked',true);
      selectedYears.push("2012","2013","2014","2015","2016","2017","2018","2019");
      selectedYears = removeDuplicates(selectedYears);
      console.log(selectedYears);
    }
    else{
      d3.selectAll(".yearCheckbox").property('checked',false);
      selectedYears = [];
    } 
  }
  else{ //manage all other years
    //TO DO// console.log(d3.select(this).attr('id'));
    if(selectedC.property('checked') == true){
      selectedYears.push(selectedC.attr('id'));//add checked
      selectedYears = removeDuplicates(selectedYears);
      console.log(selectedYears);
    }
    else{
      d3.select('#tot').property('checked',false);
      selectedYears = selectedYears.filter(function(value){ //remove unchecked year
        return value != selectedC.attr('id');
      });
      console.log(selectedYears)
      console.log(selectedC.attr('id'))
    } 
  }
  computeColourScales(); //for map 
  //updateYearsParCoord(); (valerio [menu]) la funzione nelle righe sopra cambia la lista 'selectedYears' che contiene gli anni selezionati in ogni momento
 
}

function reComputeSumDel(territory,id,typeOfTer){ //typeOfTer=0 if function called for prov, else =1
  //read from dataset of delicts[FUNCTION]
  d3.text("./datasets/dataset_crimes/dataset1219.csv", function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
        regions = d3.nest() //create dictionary on regions name
                .key(function(d) { 
                    if(d.territorio.trim().startsWith(territory)) return d.territorio; })
                .entries(stocks = data);      
        sumDel=0;
        sumDelPop=0;

        regions[1].values.forEach(function(d) { 
          sumDel = d3.sum(regions[1].values, function(d){ //filter per year and crime types
            if(selectedYears.includes(d.anno)){//FILTER YEARS
              tot_selected_crimes_per_year=0;

              if(selected_crimes.length==0){ //if array of crimes is empty then select all crimes
                return d.totale;
              }
              else{ //if some crimes are been selected
                for (const [key, value] of Object.entries(d)) {
                  if(selected_crimes.includes(key)){ //"selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
                    tot_selected_crimes_per_year+=parseInt(value);
                  }
                }
                return tot_selected_crimes_per_year;
              }
            }
          })

          sumDelPop = d3.sum(regions[1].values, function(d){ //filter per year and crime types
            if(selectedYears.includes(d.anno)){//FILTER YEARS
              tot_selected_crimes_per_year=0;
              if(selected_crimes.length==0){ //if array of crimes is empty then select all crimes
                return d.totale/d.popolazione;
              }
              else{ //if some crimes are been selected
                for (const [key, value] of Object.entries(d)) {
                  if(selected_crimes.includes(key)){ //"selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
                      tot_selected_crimes_per_year+=parseInt(value);
                  }
                }
                return tot_selected_crimes_per_year/d.popolazione;
              }
            }
          })

          population=0;
          i=0;
          population = d3.sum(regions[1].values, function(d){ //filter per year and crime types
            if(selectedYears.includes(d.anno)){//FILTER YEARS
              return d.popolazione
            }
          })   
        })
        
          d3.select(id)
            //interaction with dataset:
            .style("fill", function(){
              if (computationType==0){
                if(typeOfTer==0) return colorProv(sumDel);
                else return  colorReg(sumDel);
              } 
              else{
                if(typeOfTer==0) return colorProv(sumDelPop);
                else return colorReg(sumDelPop);
              }
            })
            .attr('clicked','1')
            .attr('sumDel',sumDel)
            .attr('sumDelPop',sumDelPop)
            .attr('population',population/selectedYears.length);
          
            if(visualization=="0" ) {
              var gReg = d3.select('#content g.mapReg')
              .selectAll('path');
        
              gReg.attr('class','greyReg')
                  .style('fill',null);
            }
  });
}

function retrieveNameReg(prov){
  var reg = prov.attr('id').split('g');
  reg=reg[1];
  reg= 'regione'+reg;
  var region = d3.select('#content g.mapReg').selectAll('path').filter(function(d){
    return this['id'] == reg;
  })
  return region.attr('name');
}

function selectAllTer(){
  var elem = d3.select(this);
  if(elem.property('checked') == true){ //select all territory
    if(visualization =='0'){ 
      d3.select('#content g.mapProv').selectAll('path')
        .each(function(d){
          var ter = d3.select(this)
          if(ter.attr('clicked')=='0'){ //for each territory not clicked =>click it
            updateMapProv(ter.attr("id"));
          }
        })
    }
    if(visualization =='1'){ 
      d3.select('#content g.mapReg').selectAll('path')
        .each(function(d){
          var ter = d3.select(this)
          if(ter.attr('clicked')=='0'){
            updateMapReg(ter.attr("id"),'');
          }
        })
    }
  }
  else{ //unselect all territory
    if(visualization =='0'){
      d3.select('#content g.mapProv').selectAll('path')
        .each(function(d){
          var ter = d3.select(this)
          if(ter.attr('clicked')=='1'){
            ter
            .style('fill',null)
            .attr('class', 'greyProv')
            .attr('sumDel',null)
            .attr('sumDelPop',null)
            .attr('population',null)
            .attr('clicked','0');
          }
        })
    }
    if(visualization =='1'){
      d3.select('#content g.mapReg').selectAll('path')
        .each(function(d){
          var ter = d3.select(this)
          if(ter.attr('clicked')=='1'){
            ter
            .style('fill',null)
            .attr('class', 'greyOnlyReg')
            .attr('sumDel',null)
            .attr('sumDelPop',null)
            .attr('population',null)
            .attr('clicked','0');
          }
        })
    }
  }
}