//url_regioni = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/General/datasets/dataset_mappa_italiana/mappa_italiana_regioni.json"
//url_province = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/General/datasets/dataset_mappa_italiana/mappa_italiana_provincie.json"
url_regioni = "./datasets/dataset_mappa_italiana/mappa_italiana_regioni.json"
url_province = "./datasets/dataset_mappa_italiana/mappa_italiana_provincie.json"
var countStroke=false;
function createMapReg(geojson) {
    var projection = d3.geoEquirectangular().fitSize([widthMap,(heightMap+200)*1.4],geojson).scale(0.01);
    
    var geoGenerator = d3.geoPath()
      .projection(projection);
  
    d3.select('#map')
        .attr('width', widthMap)
        //.attr('height',heightMap)
    var u = d3.select('#mapReg')
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
        return 'updateMapReg("regione",'+d.properties.COD_REG+');' +'add_delete_territory("'+d3.select(this).attr('name')+'");' //DONE (valerio)[on '' add function for manage click of a region---possible parameter = 'd3.select(this).attr('name') = nome della regione]]
      });
      
      if(count==0){
        zoom.scaleTo(d3.select("#map").transition().duration(600), 2.0);
        count+=1;
      } 
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
  var u = d3.select('#mapProv')
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
      return 'updateMapProv("'+d3.select(this).attr('id')+'");'+'add_delete_territory("'+d3.select(this).attr('name')+'");'
    })
    .on("mousemove", showTooltipProv);
    
}

function updateMapReg(r,i){  //apply transition + interaction
    var tot = '#'+r+i+''; //id of clicked region
    var reg = d3.select(tot).attr("name"); //name of clicked region
    //console.log(reg);
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
        d3.select("#selectAll").property('checked',false);//remove check when a territory is deselected
        
    }			
}	

function updateMapProv(p,i){  //apply transition + interaction
  var tot = '#'+p; //id of clicked region
  //console.log(tot);
  var prov = d3.select(tot).attr("name"); //name of clicked region
  //console.log(prov);
  
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
      d3.select("#selectAll").property('checked',false);//remove check when a territory is deselected
  }			
}	

var offsetL = d3.select("#content").offsetLeft+10;
var offsetT = d3.select("#content").offsetTop+10;

function showTooltipReg(d,flag) {

      if(flag==150){
        region = d;
        var height = d3.select('#map').style('height').slice(0, -2);
        var width = d3.select('#map').style('width').slice(0, -2);
        var mouse = [width,height]
      }
      else{
        region = d3.select(this);
        var mouse = d3.mouse(d3.select('#map').node())
                    .map( function(d) { return parseInt(d); } );
      }
      //console.log(region.attr("name"))
      //HIGHLIGTH PC PATH
      d3.select("#my_dataviz").selectAll('path').each(function(t){
        if (d3.select(this).attr("name") != null){
          if(region.attr("name").trim() == d3.select(this).attr("name").trim()){
            d3.select(this).raise().classed("active", true);
            d3.select(this).style("stroke", "#FF0000")
          }
          else{
            d3.select(this).style("stroke", "#0000CD")
          }
        }
      })
      //
      if(region.attr('clicked')=='0'){
        label = "<b>"+region.attr('name')+"</b>";
        tooltip.classed("hidden", false)
              .html(label)
              .attr("style", function(d){
                if(mouse[0]>= widthMap/2){ return "left:"+(mouse[0]-parseInt(tooltip.style('width').slice(0, -2))-20)+"px;top:"+(mouse[1]-10)+"px";}
                else return "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px";
              })
      }
      else{
        label="<center><b>"+region.attr('name')+"</b></center>"
                +"Num. Crimes: "+ Number(region.attr('sumDel')).toLocaleString() +"<br>"
                +"Num. Crimes each 10k citizen: "+ Number(Math.ceil(region.attr('sumDelPop')) ).toLocaleString() +"<br>"
                +"Region Area: "+ Number(region.attr('shape_area')/1000000).toLocaleString() +" km<sup>2</sup> "+"<br>"
                +"Region Population: "+ Number(region.attr('population')).toLocaleString() 
        tooltip.classed("hidden", false)
              .html(label)
             // .attr('font-size','10')
              .attr("style", function(d){
                if(mouse[0]>= widthMap/2){
                  if(flag==150) return "left:"+(mouse[0]-parseInt(tooltip.style('width').slice(0, -2))-10)+"px;top:"+(mouse[1]-parseInt(tooltip.style('height').slice(0, -2))-10 )+"px";
                  else return "left:"+(mouse[0]-parseInt(tooltip.style('width').slice(0, -2))-20)+"px;top:"+(mouse[1]-100)+"px";
                }
                else return "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px";
              });
      }
}

function showTooltipProv(d,flag) { 
  if(flag==150){
    province = d;
    var height = d3.select('#map').style('height').slice(0, -2);
    var width = d3.select('#map').style('width').slice(0, -2);
    var mouse = [width,height]
  }
  else{
    province = d3.select(this);
    var mouse = d3.mouse(d3.select('#map').node())
                .map( function(d) { return parseInt(d); } );
  }
  var nameReg=retrieveNameReg(province);
  //console.log(region.attr("name"))
      //HIGHLIGTH PC PATH
      d3.select("#my_dataviz").selectAll('path').each(function(t){
        if (d3.select(this).attr("name") != null){
          if(province.attr("name").trim() == d3.select(this).attr("name").trim()){
            d3.select(this).raise().classed("active", true);
            d3.select(this).style("stroke", "#FF0000")
          }
          else{
            d3.select(this).style("stroke", "#0000CD")
          }
        }
      })
      //
  if(province.attr('clicked')=='0'){
    label = "<b>"+province.attr('name')+ "</b>"+" ("+nameReg+")";
  
    tooltip.classed("hidden", false)
          //.attr("style", "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px")
          .html(label)
          .attr("style", function(d){
            if(mouse[0]>= widthMap/2){ 
             return "left:"+(mouse[0]-parseInt(tooltip.style('width').slice(0, -2))-20)+"px;top:"+(mouse[1]-10)+"px";
            }
            else return "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px";
          });
  }
  else{    
    label="<center><b>"+province.attr('name')+"</b> ("+nameReg+")</center>"
                +"Num. Crimes: "+ Number(province.attr('sumDel')).toLocaleString() +"<br>"
                +"Num. Crimes each 10k citizen: "+ Number(Math.ceil(province.attr('sumDelPop')) ).toLocaleString() +"<br>"
                +"Province Area: "+ Number(province.attr('shape_area')/1000000).toLocaleString() +" km<sup>2</sup> " + "<br>"
                +"Province Population: "+ Number(province.attr('population')).toLocaleString();

    tooltip.classed("hidden", false)
          //.attr("style", "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px")
          .html(label)
          .attr("style", function(d){
            if(mouse[0]>= widthMap/2){ 
              if(flag==150)return "left:"+(mouse[0]-parseInt(tooltip.style('width').slice(0, -2))-10)+"px;top:"+(mouse[1]-parseInt(tooltip.style('height').slice(0, -2))-10 )+"px";
              else return "left:"+(mouse[0]-parseInt(tooltip.style('width').slice(0, -2))-20)+"px;top:"+(mouse[1]-10)+"px";
            }
            else return "left:"+(mouse[0]+20)+"px;top:"+(mouse[1]-10)+"px";
          });
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

//load region map(newData=1) or province map (newData=0) 
function loadMap(newData){
  if(newData=="1"){ //load region map
    //url_regioni = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/General/datasets/dataset_mappa_italiana/mappa_italiana_regioni.json"
      var mapReg = d3.json(url_regioni, function(data) {
        if(count==0){
          createMapReg(data);
          d3.select("#selectAll").property('checked',true);//check checkbox for select all regions       
        } 
        else count+=1;
        d3.select("#selectAll").property('checked',true);//check checkbox for select all territory
        selectAllTer(); 
      
        var gReg = d3.select('#mapReg')
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
                function(region){
                  if(d3.select(this).attr("clicked") != '1'){
                    d3.select(this)
                    .attr('class','greyOnlyReg');
                  }
                  tooltip.attr('style', null)
                    .classed("hidden", true)
                    .node().innerHTML = null;
                    //DE-HIGHLIGTH PC PATH
                    d3.select("#my_dataviz").selectAll('path').each(function(t){
                      if (d3.select(this).attr("name") != null){
                          d3.select(this).style("stroke", "#0000CD")
                      }
                    })
                }
              );
      });      
      //HIDE THE PROVINCE MAP
      d3.select("#mapProv").attr('style',"visibility:hidden"); 
  }
  else{ //load province map
    if(count==1){
      //url_regioni = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/General/datasets/dataset_mappa_italiana/mappa_italiana_regioni.json"
      //url_province = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/General/datasets/dataset_mappa_italiana/mappa_italiana_provincie.json"

      var mapProv = d3.json(url_province, function(data) {
        createMapProv(data);
      
        var g=d3.select('#mapProv').selectAll('path')  
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
                    //DE-HIGHLIGTH PC PATH
                  d3.select("#my_dataviz").selectAll('path').each(function(t){
                    if (d3.select(this).attr("name") != null){
                        d3.select(this).style("stroke", "#0000CD")
                    }
                  })    
                }
              );
              d3.select("#selectAll").property('checked',true);//check checkbox for select all territory
              selectAllTer();  
      })
    }
    else d3.select("#selectAll").property('checked',false);

    var gReg = d3.select('#mapReg')
      .selectAll('path')

    gReg.attr('class','greyReg')
        .attr('style',null)
        .attr('clicked','0')
        .on('mousemove',null)
        .on('mouseover', null)
        .on('mouseout', null);
    //show province map
    d3.select("#mapProv").attr('style',"visibility:visible")
    d3.select('#mapProv').selectAll('path').style('stroke','#746E6E');//on change of vis. are resetted the strokes of provinces
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
  d3.text(dataset_path, function(raw) {
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
                  return 0;
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
                    return 0;
                  }
                  else{ //if some crimes are been selected
                    for (const [key, value] of Object.entries(d)) {
                      if(selected_crimes.includes(key)){ //"selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
                        tot_selected_crimes_per_year+=parseInt(value);
                      }
                    }
                    return (tot_selected_crimes_per_year/d.popolazione)*10000;
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
    if(visualization=='0'){
      updateLegend(minMax); //update the legend of map
    } 
    d3.select('#mapProv').attr('minMax',minMax);
    colorProv = d3.scaleQuantile()
                  .domain([minMax[0], minMax[1]]) //select min an max of retrived values
                  .range(['#ffffb2',
                          '#fecc5c',
                          '#fd8d3c',
                          '#f03b20',
                          '#bd0026']);
    updateClickedProv();
    CRIMES = selected_crimes
  });

  //REGIONS
  //save all possible values of regions delicts (seeing the specific query )
  var list_regions=[];
  d3.text(dataset_path, function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);
      
    regions = d3.nest() //create dictionary on regions name
            .key(function(d) {
                list_regions.push(d.territorio); //retrive all territory from dataset 
                return d.territorio; })
            .entries(stocks = data);    
    
    list_regions = removeProvinces(removeDuplicates(list_regions)); //remove duplicates and regions and macro-areas
    //console.log(list_regions);
   
    numbers=[];
    regions.forEach(function (s){
        if(list_regions.includes(s.key)){
        
            s.values.forEach(function(d) { 
                 sumDel = d3.sum(s.values, function(d){ //filter per year and crime types
                    if(selectedYears.includes(d.anno)){//FILTER YEARS
                      tot_selected_crimes_per_year=0;
                      if(selected_crimes.length==0){ //if array of crimes is empty then select all crimes
                        return 0;
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
                        return 0;
                      }
                      else{ //if some crimes are been selected
                        for (const [key, value] of Object.entries(d)) {
                            if(selected_crimes.includes(key)){ //FILTER CRIMES "selected_crimes" is the array that contain all crimes sElected by user (by default it start with all crimes)
                                tot_selected_crimes_per_year+=parseInt(value);
                            }
                        }
                        return (tot_selected_crimes_per_year/d.popolazione)*10000; //num crimes each 10000 inhabitants
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
    if(visualization=='1') updateLegend(minMax); //update the legend of map
    d3.select('#mapReg').attr('minMax',minMax);
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
          var gReg = d3.select('#mapReg').selectAll('path')
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
  var gProv = d3.select('#mapProv').selectAll('path')
  .filter(function(d){
    //console.log(d3.select('#'+this['id']).attr('clicked'));
    return d3.select('#'+this['id']).attr('clicked')=='1';
  });
  //console.log(gProv)
  gProv.each(function(d){
    var prov = d3.select(this);
    reComputeSumDel(prov.attr('name'),"#"+prov.attr('id'),0);
  })
}

function updateSelectedYears(){ //change value of list of selected years
  //manage select all years checkbox
  var selectedC=d3.select(this);
  selY[0]=selY[1];
  if(selectedC.attr('id')=='tot'){
    if(selectedC.property('checked') == true){
      d3.selectAll(".yearCheckbox").property('checked',true);
      selectedYears.push("2012","2013","2014","2015","2016","2017","2018","2019");
      selectedYears = removeDuplicates(selectedYears);
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
  selY[1]=selectedYears;
  console.log(selY)
  computeColourScales(); //for map 
  YEAR = selectedYears
  draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
  createMDS(visualization, computationType, coeff_value, selectedYears)
}
var coeff_value = 0;
function loadMdsComputationValue(value){
  coeff_value = value
  return coeff_value;
}


function reComputeSumDel(territory,id,typeOfTer){ //typeOfTer=0 if function called for prov, else =1
  //read from dataset of delicts[FUNCTION]
  d3.text(dataset_path, function(raw) {
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
                return 0;
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
                return 0;
              }
              else{ //if some crimes are been selected
                for (const [key, value] of Object.entries(d)) {
                  if(selected_crimes.includes(key)){ //"selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
                      tot_selected_crimes_per_year+=parseInt(value);
                  }
                }
                return (tot_selected_crimes_per_year/d.popolazione)*10000;
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
          var oldFill= d3.select(id).style('fill');
          //console.log(oldFill)
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
          
          if(oldFill!='rgb(221, 221, 221)' && oldFill!='rgb(255, 255, 255)' && (selY[1].length>0 && selY[0].length>0) && d3.select(id).style('fill') != oldFill){
            d3.select(id).style('stroke','#007f5f')
          }
          else{
            if(visualization==0) d3.select(id).style('stroke','#746E6E');
            else d3.select(id).style('stroke','#000000');
          } 
          
            if(visualization=="0" ) {
              var gReg = d3.select('#mapReg')
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
  var region = d3.select('#mapReg').selectAll('path').filter(function(d){
    return this['id'] == reg;
  })
  return region.attr('name');
}

function selectAllTer(){
  REGIONS = changeKindOfTerritory(visualization)
  var elem = d3.select("#selectAll");
  if(elem.property('checked') == true){ //select all territory
    changeCmdRegions("only")
    if(visualization =='0'){ 
      d3.select('#mapProv').selectAll('path')
        .each(function(d){
          var ter = d3.select(this)
          if(ter.attr('clicked')=='0'){ //for each territory not clicked =>click it
            updateMapProv(ter.attr("id"));
          }
        })
    }
    if(visualization =='1'){ 
      d3.select('#mapReg').selectAll('path')
        .each(function(d){
          var ter = d3.select(this)
          if(ter.attr('clicked')=='0'){
            updateMapReg(ter.attr("id"),'');
          }
        })
    }
  }
  else{ //unselect all territory
    changeCmdRegions("except")
    if(visualization =='0'){
      d3.select('#mapProv').selectAll('path')
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
      d3.select('#mapReg').selectAll('path')
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
  //console.log(CMD_REGIONS)
}

function updateLegend(minMax){ //update the legend of map
  var rangeLeg=(minMax[1]-minMax[0])/5;
  var keys =[];
  if(computationType==0) var label =['NUMBER OF CRIMES'];
  else var label =['N. CRIMES by 10k citizen'];
  for(i=0; i<5;i++){
    var minvalue= minMax[0]+ (i*rangeLeg);
    var maxvalue= minvalue+rangeLeg;
    var str = '<'+Number(Math.ceil(minvalue.toFixed(3)) ).toLocaleString()+'-'+Number(Math.ceil(maxvalue.toFixed(3)) ).toLocaleString()+'>'
    keys.push(str);
  }
  
  var legend = d3.select("#legendMap")//.style('font-family','verdana')
  legend.selectAll('g text').remove();
  legend.selectAll('g rect').remove();
  
  var color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']);

  var colorStroke=['#000000','#007F5F']

  var size = 15
  var height = d3.select('#map').style('height').slice(0, -2);
  heightLegend=165;
  startYlegend=height-heightLegend
  legend.selectAll('rec').data(["a"]).enter().append('rect')
        .attr('id',"recLegendMap")
        .attr("x",0)
        .attr("y",startYlegend) 
        .attr("width", widthMap/3 +20 )
        .attr("height",heightLegend)
        .attr("rx","12")
        .style('stroke','');
         
  legend.append('text')
          .attr("stroke","#000000")
        .attr("stroke-width",'0.5')
        .attr("x", function(d){ if(label =="NUMBER OF CRIMES") return size ;
                                else return  5;})
        .attr("y",startYlegend+size) 
        .style("fill", '#000000')
        .text(label)
        .style('font-size','12px')
  
  legend.selectAll("mydots")
    .data(keys)
    .enter()
    .append("rect")
      .attr("x", 5)
      .attr("y", function(d,i){ return startYlegend+20 + i*(size+5)}) // 100 is where the first dot appears. 25 is the distance between dots
      .attr("width", size)
      .attr("height", size)
      .style("fill", function(d){ return color(d)})
      .style('stroke','#000000')
      .on('mouseover',highlightTer)
      .on('mouseout',unlightTer)
      .on('click',clickTer)
  legend.selectAll("mylabels") // Add one dot in the legend for each name
      .data(keys)
      .enter()
      .append("text")
        .attr("stroke",function(d){ if(d.includes('NUM. CRIMES')) return "#000000";
        else return color(d)})
        .attr("stroke-width",'0.2')
        .attr("x", 10 + size)
        .attr("y", function(d,i){ return startYlegend+20 + i*(size+5) + (size/2)}) // 100 is where the first dot appears. 25 is the distance between dots
        .style("fill", '#000000')
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style('font-size','12px');
/////////////////////////////////////////////////

  legend.append('text')
    .attr("stroke","#000000")
    .attr("stroke-width",'0.5')
    .attr("x", 10)
    .attr("y", startYlegend+130)
    .style("fill", '#000000')
    .text("TERRITORY STROKES")
    .style('font-size','12px');

  legend.selectAll('mylines')
    .data(colorStroke)
    .enter()
    .append('line')
      .attr("x1", 5)
      .attr("y1", function(d,i){return startYlegend+140 +(i*15); })
      .attr("x2", 25  )
      .attr("y2", function(d,i){return startYlegend+140 +(i*15); })
      .style('stroke',function(d){return d})
      .style('stroke-width',5)
      .style('fill',function(d){return d})
      .on('mouseover',highlightTer)
      .on('mouseout',unlightTer)
      .on('click',clickTer);
  
      legend.selectAll('mylinesLabels')
      .data(colorStroke)
      .enter()
      .append('text')
        .attr("x", 30)
        .attr("y", function(d,i){return startYlegend+140 +(i*15); })
        .text(function(d){if(d=="#000000")return 'color Terr unchanged';else return 'color Territory changed'})
        .style("alignment-baseline", "middle")
        .style("fill", function(d){return d})
        .style('stroke',function(d){return d})
        .style('stroke-width',0.3)
        .style('font-size','12px');
    
/////////////////////////////////

}

function split(string){ //from a list of string to a list of Float
  list= string.split(',');
  list =[parseFloat(list[0]), parseFloat(list[1] )]
  return list;
}

function highlightTer(){ //mouseover on legend rectangles
  var rect = d3.select(this);
  var color = rect.style('fill');
  //if(color=="rgb(116, 110, 110)") color ="rgb(0, 0, 0)";
  console.log(color)
  if(visualization=='0'){
    if(color =="rgb(0, 0, 0)") color="rgb(116, 110, 110)";
    var mapTer=d3.select('#mapProv').selectAll('path').filter(function(d){
      if(rect.style('stroke-width')!=5) var terFill = d3.select('#'+this['id']).style('fill');
      else var terFill = d3.select('#'+this['id']).style('stroke');
      return terFill == color;  
    });
    mapTer.style('stroke-width','1.5')
  } 
  else{
    var mapTer=d3.select('#mapReg').selectAll('path').filter(function(d){
      if(rect.style('stroke-width')!=5) var terFill = d3.select('#'+this['id']).style('fill');
      else var terFill = d3.select('#'+this['id']).style('stroke');
      return terFill == color;  
    });
    mapTer.style('stroke-width','2')
  }

  var names=[]
  mapTer.each(function(d){names.push(d3.select('#'+this['id']).attr('name'));return 0;})
  names.forEach(function(d){
    d3.select("#my_dataviz").selectAll('path').each(function(t){
      if (d3.select(this).attr("name") != null){
        if(d.trim() == d3.select(this).attr("name").trim()){
          d3.select(this).raise().classed("active", true);
          d3.select(this).style("stroke", "#FF0000")
        }
      }
    })
  })
}

function unlightTer(){ //mouseout on legend rectangles
  if(visualization=='0'){
    var mapTer=d3.select('#mapProv').selectAll('path').filter(function(d){
      var terFill = d3.select('#'+this['id']).style('stroke-width');
      return terFill == '1.5';  
    });
  } 
  else{
    var mapTer=d3.select('#mapReg').selectAll('path').filter(function(d){
      var terFill = d3.select('#'+this['id']).style('stroke-width');
      return terFill == '2';  
    });
  } 
  mapTer.style('stroke-width','0.5');
  var names=[]
  mapTer.each(function(d){names.push(d3.select('#'+this['id']).attr('name'));return 0;})
  names.forEach(function(d){
    d3.select("#my_dataviz").selectAll('path').each(function(t){
      if (d3.select(this).attr("name") != null){
        if(d.trim() == d3.select(this).attr("name").trim()){
          d3.select(this).style("stroke", "#0000CD")
        }
      }
    })
  }) 
}

function clickTer(){ //click on legend rectangles
  if(visualization=='0'){
    var mapTer=d3.select('#mapProv').selectAll('path').filter(function(d){
      var terFill = d3.select('#'+this['id']).style('stroke-width');
      return terFill == '1.5';  
    });
    var mapBadTer=d3.select('#mapProv').selectAll('path').filter(function(d){
      var terFill = d3.select('#'+this['id']).style('stroke-width');
      return terFill != '1.5';  
    });
  }
  else{
    var mapTer=d3.select('#mapReg').selectAll('path').filter(function(d){
      var terFill = d3.select('#'+this['id']).style('stroke-width');
      return terFill == '2';  
    });
    var mapBadTer=d3.select('#mapReg').selectAll('path').filter(function(d){
      var terFill = d3.select('#'+this['id']).style('stroke-width');
      return terFill != '2';  
    });
  }
  
  mapTer.attr('clicked','1');
  mapBadTer.attr('clicked','0')
          .style('fill',null)
          .attr('class',function(d){
            if(visualization=='0')  return 'greyProv';
            else return 'greyOnlyReg';
          });
   //valerio (mapTer contiene tutti i territori che devono rimanere selezionati)
  var names=[]
  mapTer.each(function(d){names.push(d3.select('#'+this['id']).attr('name'));return 0;})
  REGIONS = names
  draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)

  d3.select("#selectAll").property('checked',false);

  if(visualization=='0')  updateClickedProv();
  else  updateClickedReg();
}
//////////////////////////////////////////////////////////////////////////////////////////////////////////
