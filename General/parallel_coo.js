//  -------------------------------------------parametri globali che l'utente puo cambiare
YEAR = [2019]
CMD_REGIONS = "except"
//REGIONS = ["Italia"]
REGIONS = []
CMD_CRIMES = "except"
//CRIMES = ["strage","omicidi","rapine"]
ABSOLUTE = false
CRIMES = []

//inizializzazione elementi del dom
//fill dropmenu degli anni 
var select = document.getElementById("year");
for (let i = 2012; i < 2020; i++) {
    var el = document.createElement("option");
    el.textContent = i;
    el.value = i;
   // select.appendChild(el);
}
/*select.value = YEAR
//absolute button
var abs = document.getElementById("absolute");
abs.textContent="absolute: " + ABSOLUTE
//cmd_region button
var abs = document.getElementById("cmd_region");
abs.textContent=CMD_REGIONS
//cmd_crime button
var abs = document.getElementById("cmd_crime");
abs.textContent=CMD_CRIMES*/
//-----------

// set the dimensions and margins of the graph
var margin = {top: 130, right: 10, bottom: 10, left: 0},
    width = 5000 - margin.left - margin.right,
    height = 400 - margin.top - margin.bottom;
// append the svg object to the body of the page
var sv = d3.select("#my_dataviz")
.append("svg")
    .attr("width", width +margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
.append("g")
    .attr("transform",
        "translate(" + margin.left + "," + margin.top + ")");


//quando cambio anno ridisegno l'intera parallel coord.
function changeYear(year){
    svg.selectAll("*").remove();
    if(!YEAR.includes(year)) YEAR.push(year)
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeAbsolute(flag){
    sv.selectAll("*").remove();
    ABSOLUTE = flag
    //document.getElementById("absolute").textContent="absolute: " + ABSOLUTE
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeCmdRegions(){
    sv.selectAll("*").remove();
    if(CMD_REGIONS == "only") CMD_REGIONS = "except"
    else{
    CMD_REGIONS = "only"
    }
    document.getElementById("cmd_region").textContent=CMD_REGIONS
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeRegions(region){
    if(!REGIONS.includes(region)){
    REGIONS.push(region.trim())
    }
    sv.selectAll("*").remove();
    REGIONS.forEach( function(r){
    if(CMD_REGIONS == "only") document.getElementById(r).style.color = "green"
    else{
        document.getElementById(r).style.color = "red"
    }
    })
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    console.log(REGIONS)
}
function changeCmdCrimes(){
    sv.selectAll("*").remove();
    if(CMD_CRIMES == "only") CMD_CRIMES = "except"
    else{
    CMD_CRIMES = "only"
    }
    document.getElementById("cmd_crime").textContent=CMD_CRIMES
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
}
function changeCrimes(crime){
    if(!CRIMES.includes(crime)){
    CRIMES.push(crime.trim())
    }
    sv.selectAll("*").remove();
    CRIMES.forEach( function(r){
    if(CMD_CRIMES == "only") document.getElementById(r).style.color = "green"
    else{
        document.getElementById(r).style.color = "red"
    }
    })
    draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)
    console.log(REGIONS)
}
//filtra il le P.c. con l'anno scelto dall'utente
function filterByYear(year,data){
    const data_filtered = []
    for (let i = 0; i < data.length; i++) {
        year.forEach(function(y){
            if(data[i].anno == ""+y) data_filtered.push(data[i])
        })
    }
    //console.log(data_filtered)
    return data_filtered
} 
//filtra in base al territorio, only fa solo le regioni passate, except fa tutte tranne quelle passate
function filterByRegion(kindOfTerr,command,regions,data){
    const indeces = []
    console.log("DIOCANEEEE")
    for (let i = 0; i < data.length; i++) {
    for (let r = 0; r < regions.length; r++) {
        if(data[i].territorio.trim() == regions[r].trim()){
        indeces.push(i)
        }
    }
    }
    data_filtered = []
    indeces.forEach(function(el,i) {
    if(command == "only"){
        data_filtered.push(data[el])
    }
    else if(command == "except"){
        data_filtered = data
        data_filtered.splice(el-i,1) 
    }
    });
    //console.log(data_filtered)
    return data_filtered
}

//filtra in base al crimie, only fa solo i crimini passati, except fa tutti tranni quelli passati
function filterByCrime(command,crimes,data){
    
    ////////d3.keys(data[0]) sono le classi ["territorio", "anno", "popolazione",..] della prima riga
    ///////d3.values(data[0]) sono i valori delle classi ["Italia", "2012", "59394207",..] della prima riga
    function filterCrimes(crime){
    if(command == "except"){
        if(crimes.includes(crime)) return false
        return true
    }
    else if(command == "only"){
        if(crimes.includes(crime)) return true
        return false
    }
    }
    
    dimensions = dimensions.filter(filterCrimes)
    //console.log(dimensions)
    
    return dimensions

}


//riempie la select con i nomi delle regioni/citta
function fillRegionSelect(dataset_path){
    d3.text(dataset_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
        var regioni=[]
        for (let i = 0; i < data.length; i++) {
            const region = data[i].territorio.trim();
            if(! regioni.includes(region)) {
            regioni.push(region)
            }
        }
        regioni.sort()
        console.log
        for (let i = 0; i < regioni.length; i++) {
            var el = document.createElement("option");
            region = regioni[i]
            el.textContent = region;
            el.value = region;
            el.id = region;
            document.getElementById("regions").appendChild(el);
            
        }
        })
}

//riempie la select con i nomi dei crimini
function fillCrimeSelect(dimensions){
    var crimes=[]
    dimensions.forEach(function(crime){
    crime = crime.trim()
    if(! crimes.includes(crime)) {
        crimes.push(crime)
    }
    })
    crimes.sort()
    for (let i = 0; i < crimes.length; i++) {
    var el = document.createElement("option");
    crime = crimes[i]
    el.textContent = crime;
    el.value = crime;
    el.id = crime;
    document.getElementById("crimes").appendChild(el);
    
    }
    
}
//per evitare il cross origin
//var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/Parallel%20coordinates/dataset1219.csv"
var dataset_path = "https://raw.githubusercontent.com/FrancescoArtibani97/VA-project/main/dataset1219.csv"
//fillRegionSelect(dataset_path)


function draw(year,command_regions,regions,command_crimes,crimes,isAbsolute) {
    const PCtooltip = d3.select('#PCtooltip');
    d3.text(dataset_path, function(raw) {//retrive sum of delicts
        var dsv = d3.dsvFormat(';');
        var data =dsv.parse(raw);
    
    //fillRegionSelect(data)
        
    data = filterByYear(year, data)
    //if(regions.length>0) data = filterByRegion(command_regions, regions, data)
    dimensions = d3.keys(data[0]).filter(function(d) { return d != "territorio" && d!= "totale" && d!="anno" && d!= "popolazione"})
    //fillCrimeSelect(dimensions)
    //dimensions = filterByCrime(command_crimes,crimes,data)


    //ogni asse verticale delle parallel coo. lo salvo dentro y 
    var y = {}
    for (i in dimensions) {
        var name = dimensions[i]
        y[name] = d3.scaleLinear()
        ///////d3.extent  returns the minimum and maximum value in an array, in this case i take from the dataset the i-th feature domain
        .domain( d3.extent(data, function(d) {
                
                if(!isAbsolute){
                return +d[name];
                }
                else{
                r = d[name]/d["popolazione"]
                return +r;
                }
            }))
        .range([height, 0]) ///general height of the graph
    }
    
    //asse x -> it find the best position for each Y axis
    x = d3.scalePoint() /////Ordinal ranges can be derived from continuous ranges: ex .domain(["A", "B", "C", "D"]) .range([0, 720]); ---> x("B") == 240
        .domain(dimensions)  ///.domain(["territorio", "anno", "popolazione",..])
        .range([0, (270-6*dimensions.length)*dimensions.length])///general width of the graph, varia a seconda di quanti crimini metti
        .padding(0.5);


    function path(d) {
        return d3.line()(dimensions.map(function(p) {
        //console.log(x(p))
        //p è il nome del crimine
        //y[p] e x sono le funzioni interpolatrici tra dominio e range, una per asse
        //d[p] è il valore del crimine nella riga d, tipo d = data[i] e p = omicidio, d[p] = 30
        if(!isAbsolute) return [x(p), y[p](d[p])]; 
        else{
            return [x(p), y[p](d[p]/d["popolazione"])]
        }
        }));
        /////per ogni riga del csv (d), per ogni feature assegno la sua x e le sue y
    }
    //PCtooltip management
    function drawTooltip(regione) {
        PCtooltip.html(regione) //Change the content of all PCtooltip elements:
        var d = document.getElementById('PCtooltip');
        PCtooltip.style('display', 'block');
        d.style.position = "absolute";
        d.style.left = event.clientX+'px';
        d.style.top = (event.clientY-420)+'px';
        //console.log(d.style.top)
    }
    function removeTooltip() {
        if (PCtooltip) PCtooltip.style('display', 'none');
    } 
    // Draw the lines

sv
    .selectAll("myPath")
    .data(data)
    .enter().append("path")
    .attr("d",  path) //The d attribute defines a path to be drawn.
    .style("fill", "none")
    .style("stroke", "#0000CD")
    .style("stroke-width", "3")
    .style("opacity", 0.5)
    .on("mouseover", function(d) {
    d3.select(this).style("stroke", "#FF0000")
    drawTooltip(d["territorio"])
    })                  
    .on("mouseout", function(d) {
    d3.select(this).style("stroke", "#0000CD")
    removeTooltip()
    });

// Draw the axis:
sv.selectAll("myAxis")
    // For each dimension of the dataset I add a 'g' element:
    .data(dimensions).enter()
    .append("g")
    // I translate this element to its right position on the x axis
    .attr("transform", function(d) { return "translate(" + x(d) + ")"; })
    // And I build the axis with the call function
    .each(function(d) { d3.select(this).call(d3.axisLeft().scale(y[d])); })
    // Add axis title
    .append("text")
    .style("text-anchor", "start")
    .attr("transform", "rotate(-15)")
    .attr("y", -9)
    .text(function(d) {return d; })
    .style("fill", "black")
    



    })        
}
//draw(YEAR,CMD_REGIONS,REGIONS,CMD_CRIMES,CRIMES,ABSOLUTE)//<------ first draw
