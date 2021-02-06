//ALL MENU CODE 
  //MenuCrimeSelection

//generate list of crimes reading dataset of crimes
var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
var dataset_path = "../dataset1219.csv"

d3.text(dataset_path, function(raw) {
    var dsv = d3.dsvFormat(';');
    var data =dsv.parse(raw);
    var i = 0;
    for (const [key, value] of Object.entries(data[0])) {
      if(i>2 && i<35) list_crimes.push(key);
      i+=1;
    }
  
    var label = d3.select('#crimes')
                  .append('label')
                  .attr('for','selCrime')
                  .append('b')
                  .text('Select Crimes:');
    label.append('br')

   /* var button = d3.select('#crimes')
    .append('button')
    .attr('class','clearCrime button')
    .append('b')
    .text('clear');*/

    var select =d3.select('#crimes')
                  .append('select')
                  .attr('id', 'selCrime')
                  .attr('class','selectCrimes')
                  .property('multiple','multiple')
                  .style('width','400px')
                  
    var options = select.selectAll("option").data(list_crimes)
    //console.log(options)
    options.enter()
         .append('option')
         //.attr('class','cr')
         .property('value',function(d){ return d;})
         .text(function(d){return d;})
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
   // maximumSelectionLength: 16
    });
  });

  ////Selected a crime
  $('.selectCrimes').on('select2:select', function (e) {
    selected_crimes.push(e.params.data.id); //update list of selected crimes adding 
    selected_crimes = removeDuplicates(selected_crimes);//remove eventual duplicates
    computeColourScales(); //update computation of colours
    //updateCrimeParCoord(e); (valerio [menu])
    
  });

  //Unselected a crime
  $('.selectCrimes').on('select2:unselect', function (e) {
    selected_crimes = selected_crimes.filter(el => el !=e.params.data.id);//update list of selected crimes removing 
    computeColourScales();
    //updateCrimeParCoord(e); (valerio [menu])
  });
});