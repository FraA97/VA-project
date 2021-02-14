//ALL MENU CODE 
  //MenuCrimeSelection

//generate list of crimes reading dataset of crimes
//var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
var dataset_path = "datasets/dataset_crimes/dataset1219.csv"

d3.text("datasets/coefficienti.csv", function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);
    //data = data.sort(function(a,b){return b.Coeff_reato - a.Coeff_reato})   //sort according to coeff of danger
    list_crimes = data.map(function(d) { return d.Reati });
    var label = d3.select('#crimes')
                  .append('label')
                  .attr('for','selCrime')
                  .append('b')
                  .text('Select Crimes:');
    label.append('br')
    //label.style("padding","100px")

    var clearButton = d3.select('#crimes')
    .append('button')
    .attr('class','clearCrime button')
    .append('b')
    .text('Clear')
    .on('click',function(d){
      selected_crimes = []; //clear list of selected crimes  
      console.log(selected_crimes);
      computeColourScales(); //recompute 
      CRIMES = []
      draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
      //(valerio) //clear all crimes
      $('.selectCrimes').val(null).trigger('change'); //deselect crimes
    });
    var selAllButton = d3.select('#crimes')
    .append('button')
    .attr('class','selAllCrimes button')
    .append('b')
    .text('Select All')
    .on('click',function(d){
          selected_crimes = list_crimes; //add all crimes to the list
          computeColourScales(); //recompute 
          //(valerio) //select all crimes
          
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
          //(valerio) //select main crimes
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
           d3.select(this).style("font-size", 500)
           console.log(d)
           return d
          })
         .property('selected',function(d,i){
           if(i<16){
            selected_crimes.push(d);
            return true;
           } 
           else return false;
         });

  
  $(function()
  {
    $(".selectCrimes").select2(
    {
      closeOnSelect: false,
      minimumResultsForSearch: Infinity,
      //multiple: true
   // maximumSelectionLength: 16
    });
  });
  
  ////Selected a crime
  $('.selectCrimes').on('select2:select', function (e) {
    selected_crimes.push(e.params.data.id); //update list of selected crimes adding 
    selected_crimes = removeDuplicates(selected_crimes);//remove eventual duplicates
    computeColourScales(); //update computation of colours
    CRIMES = selected_crimes
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    //updateCrimeParCoord(e); (valerio [menu])
    
  });

  //Unselected a crime
  $('.selectCrimes').on('select2:unselect', function (e) {
    selected_crimes = selected_crimes.filter(el => el !=e.params.data.id);//update list of selected crimes removing 
    computeColourScales();
    CRIMES = selected_crimes
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    //updateCrimeParCoord(e); (valerio [menu])
  });
});

function crimeSize(){
  var crimes = d3.selectAll('.select2-selection__choice');
  crimes.each(function(d){
    var crime = d3.select(this).attr('title');//name of the crime
    d3.select(this).style('font-size',function(){
      //write the function for manage the font size of crime 'crime'
    })
  })
}