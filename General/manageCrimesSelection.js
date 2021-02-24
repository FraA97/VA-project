//ALL MENU CODE 
  //MenuCrimeSelection

//generate list of crimes reading dataset of crimes
//var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
var dataset_path = "datasets/dataset_crimes/dataset1219.csv"
diz_selected_crimes={}
colorCrime= null;
d3.text("datasets/coefficienti.csv", function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);
    //data = data.sort(function(a,b){return b.Coeff_reato - a.Coeff_reato})   //sort according to coeff of danger
    list_crimes = data.map(function(d) { return d.Reati });
    var label = d3.select('#crimes')
                  .append('label')
                  .attr('for','selCrime')
                  .append('b')
                  .text('Select Crimes: ')
                  .style('margin-left','5px');
   // label.append('br')
    //label.style("padding","100px")

    var clearButton = d3.select('#crimes')
    .append('button')
    .attr('class','clearCrime button')
    .append('b')
    .text('Clear')
    .on('click',function(d){
      var crimes = d3.selectAll('.select2-selection__choice');
      crimes.each(function(d){
        d3.select(this).transition().style('font-size','0%').duration(300);
        setTimeout(() => {  $('.selectCrimes').val(null).trigger('change'); }, 500); //deselect crimes
      })
      selected_crimes = []; //clear list of selected crimes  
      computeColourScales(); //recompute 
      CRIMES = []
      draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
     // $('.selectCrimes').val(null).trigger('change'); //deselect crimes
    });
    var selAllButton = d3.select('#crimes')
    .append('button')
    .attr('class','selAllCrimes button')
    .append('b')
    .text('Select All')
    .on('click',function(d){
          selected_crimes = list_crimes; //add all crimes to the list
          computeColourScales(); //recompute 
          
          $('.selectCrimes').val(list_crimes).trigger('change');
          CRIMES = selected_crimes
          draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    });
    var mainCrButton = d3.select('#crimes')
    .append('button')
    .attr('class','mainCrimes button')
    .append('b')
    .text('Main Crimes')
    .on('click',function(d){
          selected_crimes = list_crimes.slice(0,16); //add all crimes to the list
          computeColourScales(); //recompute 
          CRIMES = selected_crimes
          draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
          $('.selectCrimes').val(selected_crimes).trigger('change');
    });
    d3.select('#crimes').append('br')
    var select =d3.select('#crimes')
                  .append('select')
                  .attr('id', 'selCrime')
                  .attr('class','selectCrimes')
                  .property('multiple','multiple')
                  // .style="width: 75%
                  .style('width','100%')
    //$.fn.select2.defaults.set("theme", "classic");
                  

    var options = select.selectAll("option").data(list_crimes)
    //console.log(options)
    options.enter()
         .append('option')
         //.attr('class','cr')
         .property('value',function(d){ return d;})
         //.text(function(d){return d;})
         .text(function(d) {
           return d
          })
         .property('selected',function(d,i){
           if(i<16){
            selected_crimes.push(d);
            return true;
           } 
           else return false;
         });
    
         d3.select('#crimes').append('div').attr('id','scrollBar');
    
  
  $(function()
  {
    $(".selectCrimes").select2(
    {
      closeOnSelect: false,
      openOnDeselect:false,
      minimumResultsForSearch: Infinity,
      scrollAfterSelect:false,
      dropdownParent: $('#scrollBar'),
      //multiple: true
   // maximumSelectionLength: 16
    });
  });
  
  ////Selected a crime
  $('.selectCrimes').on('select2:select', function (e) {
    selected_crimes.push(e.params.data.id); //update list of selected crimes adding crime delected
    selected_crimes = removeDuplicates(selected_crimes);//remove eventual duplicates
    computeColourScales(); //update computation of colours
    CRIMES = selected_crimes;
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE);    
  });

  //Unselected a crime
  $('.selectCrimes').on('select2:unselect', function (e) {
    selected_crimes = selected_crimes.filter(el => el !=e.params.data.id);//update list of selected crimes removing 
    computeColourScales();
    CRIMES = selected_crimes;
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE);
  });
});

function crimeSize(){
  var crimes = d3.selectAll('.select2-selection__choice');
    crimes.each(function(d,i){
      colorCr(d3.select(this));
    }).call(fu);
  
}
function fu(){
   oldCrime='small';
}
var oldCrime='big';
function colorCr(crime){
  d3.text(dataset_path, function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);

  var italia = d3.nest() //create dictionary on regions name
              .key(function(d) { 
                  if(d.territorio=='Italia') return d.territorio; })
              .entries(stocks = data);      

    diz_selected_crimes={}
    for(i=0; i<selected_crimes.length;i++){//initialize all crimes to 0
      diz_selected_crimes[selected_crimes[i]]=0;
    }

    italia[0].values.forEach(function(d) { 
      if(selectedYears.includes(d.anno)){
        for (const [key, value] of Object.entries(d)) {
          if(selected_crimes.includes(key)){ //"selected_crimes" is the array that contain all crimes slected by user (by default it start with all crimes)
            diz_selected_crimes[key]+=parseInt(value);
          }
        }
      }
    })
    var numbers=[]
    for (var prop in diz_selected_crimes) {
      numbers.push(diz_selected_crimes[prop]);
    }
    var minMax= d3.extent(numbers)
    colorCrime = d3.scaleQuantile()
            .domain([minMax[0], minMax[1]]) //select min an max of retrived values
            .range(['#ffffb2',
            '#fecc5c',
            '#fd8d3c',
            '#f03b20',
            '#bd0026']);
    
    var crimeName = crime.attr('title');//name of the crime
    crime/*.transition()*/.style('border','3.5px solid '+colorCrime(diz_selected_crimes[crimeName]))/*.duration(1000)*/;
    updateLegCr(minMax);

      crime.style('font-size',function(){
        if(selectedYears.length==0 ) return '60%';
        if(parseFloat( d3.select('.select2-selection--multiple').style('height').slice(0,-2) )< (parseFloat( d3.select('#crimes').style('height').slice(0,-2))/1.3) ||oldCrime=='big' ){
          oldcrime='big';
          if(crime.style('border')== '3.5px solid rgb(255, 255, 178)'){ return '70%';}
          else if(crime.style('border')== '3.5px solid rgb(254, 204, 92)'){ return '80%';}
          else if(crime.style('border')== '3.5px solid rgb(253, 141, 60)'){ return '90%';}
          else if(crime.style('border')== '3.5px solid rgb(240, 59, 32)'){  return '100%';}
          else return '110%';
        }
        else{
            oldcrime='small';
            if(crime.style('border')== '3.5px solid rgb(255, 255, 178)'){   return '60%';}
            else if(crime.style('border')== '3.5px solid rgb(254, 204, 92)'){ return '70%';}
            else if(crime.style('border')== '3.5px solid rgb(253, 141, 60)'){  return '80%';}
            else if(crime.style('border')== '3.5px solid rgb(240, 59, 32)'){  return '90%';}
            else return '100%';
        }
      })
  })  
}

function updateLegCr(minMax){ //update the legend of map
  
  //CRIME SELECTION 
  //crimeSize();
  var rangeLeg=(minMax[1]-minMax[0])/5;
  var keys =[];
  
  var label =['RECURRENCE RATE'];
  
  for(i=0; i<5;i++){
    var minvalue= minMax[0]+ (i*rangeLeg);
    var maxvalue= minvalue+rangeLeg;
  //  if(computationType==0 || maxvalue>5)var str = '<'+Number(Math.ceil(minvalue.toFixed(3)) ).toLocaleString()+'-'+Number(Math.ceil(maxvalue.toFixed(3)) ).toLocaleString()+'>'
    if(i==0){ var str1 = '<'+Number(Math.ceil(minvalue)).toLocaleString()+'>'; keys.push(str1);}
    var str2 = '<'+Number(Math.ceil(maxvalue) ).toLocaleString()+'>'
    keys.push(str2);
  }
 // console.log(keys)
  
  var legendCr = d3.select("#svgLegCr")//.style('font-family','verdana')
  legendCr.selectAll('text').remove();
  legendCr.selectAll('rect').remove();
  legendCr.selectAll('line').remove();
  if(minMax[1]==0 || minMax[0]==minMax[1]){
    var color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#bd0026','#bd0026','#bd0026','#bd0026','#bd0026']);
  }
  else{
    var color = d3.scaleOrdinal()
    .domain(keys)
    .range(['#ffffb2','#fecc5c','#fd8d3c','#f03b20','#bd0026']);
  }
  
  var size = 14
  var heightLegendCr = d3.select('#svgLegCr').style('height').slice(0, -2);
  var widthLegendCr = d3.select('#svgLegCr').style('width').slice(0, -2);
  
  legendCr.selectAll('rec').data(["a"]).enter().append('rect')
        .attr('id',"recLegendCr")
        .attr("x",0)
        .attr("y",0) 
        .attr("width", widthLegendCr)
        .attr("height",heightLegendCr)
        .attr("rx","12")
        .style('stroke','');
 
  legendCr.append('text')
          .attr("stroke","#000000")
        .attr("stroke-width",'0.5')
        .attr("x", widthLegendCr/3)
        .attr("y",size+2) 
        .style("fill", '#000000')
        .text(label)
        .style('font-size','12px')
 
  legendCr.selectAll("mylines")
        .data(keys)
        .enter()
        .append("line")
          .attr("x1", function(d,i){ 
            if(i==0) return 20 +(i*((widthLegendCr-30)/5 ))
            else return 20 +(i*((widthLegendCr-30)/5 ) )
          })
          .attr("y1", size*3)
          .attr("x2", function(d,i){ return (widthLegendCr-30)/5 +10 +(i* ((widthLegendCr-30)/5))})
          .attr("y2", size*3)
          .style('stroke','black')
          .style('stroke-width',function(d,i){
            if(i<5) return 7.5 +i;
            else return 0;
          } ) ;

  legendCr.selectAll("mylines")
    .data(keys)
    .enter()
    .append("line")
      .attr("x1", function(d,i){ 
        if(i==0) return 20 +(i*((widthLegendCr-30)/5 ))
        else return 20 +(i*((widthLegendCr-30)/5 ) )
      })
      .attr("y1", size*3)
      .attr("x2", function(d,i){ return (widthLegendCr-30)/5 +10 +(i* ((widthLegendCr-30)/5))})
      .attr("y2", size*3)
      .style('stroke',function(d){ return color(d)})
      .style('stroke-width',function(d,i){
        if(i<5) return 7 +i;
        else return 0;
      } )    
      .on('mouseover',highlightCr)
      .on('mouseout',unlightCr)
      .on('click',clickCr);

  legendCr.selectAll("mylabels") // Add one dot in the legend for each name
      .data(keys)
      .enter()
      .append("text")
        .attr("stroke", function(d){ return color(d)})
        .attr("stroke-width",'0.09')
        .attr("x", function(d,i){ 
          return  i*(70)})
          // return  (i* (widthLegendCr/6))} )
        .attr("y",function(d,i){
          if(i%2==0) return size*4;
          else return size*2;
        } ) 
        .style("fill", '#000000')
        .text(function(d){ return d})
        .attr("text-anchor", "left")
        .style("alignment-baseline", "middle")
        .style('font-size','12px');
}

function highlightCr(){ //mouseover on legend crimes
  var line = d3.select(this);
  var color = line.style('stroke');
  var crimes = d3.selectAll('.select2-selection__choice');
  crimes.each(function(d,i){
      var crimeCol = d3.select(this).style('border').slice(9,-1) +')';
      if(crimeCol.includes(color)){
        d3.select(this).style('-webkit-text-stroke-width','0.8px');
        d3.select(this).style('-webkit-text-stroke-color','black');
        d3.select(this).style('border','4px solid '+color);
        //d3.select(this).style('font-weight','bold');
        
      }  
  })
}
function unlightCr(){ //mouseout on legend crimes
  var line = d3.select(this);
  var color = line.style('stroke');
  var crimes = d3.selectAll('.select2-selection__choice');
  crimes.each(function(d,i){
      var crimeStr = d3.select(this).style('-webkit-text-stroke-width').slice(0,-2);
      if(crimeStr.includes('0.8')){
        d3.select(this).style('-webkit-text-stroke-width',null);
        d3.select(this).style('border','3.5px solid '+color);
      }  
  })
}

function clickCr(){ //click on legend crimes
  var line = d3.select(this);
  var color = line.style('stroke');
  var crimes = d3.selectAll('.select2-selection__choice');
  var corrCr=[];
  crimes.each(function(d,i){
      var crimeStr = d3.select(this).style('-webkit-text-stroke-width').slice(0,-2);
      console.log(typeof(crimeStr))
      if(crimeStr=='0.8') corrCr.push( d3.select(this).node().outerText.slice(2,) );
  })
  selected_crimes = corrCr; //add all crimes to the list
          computeColourScales(); //recompute 
          CRIMES = selected_crimes
          draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
          $('.selectCrimes').val(selected_crimes).trigger('change');
 }

