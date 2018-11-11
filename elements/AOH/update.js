function(instance, properties, context) {
  
  //DEFINE SOME VARIABLES
  
  var name = [], data = [], category = [], fillColor = [], borderColor = [], opacity = [], graphType = [], categoryCountData, data_category = [], series_values = [], rollType = [], category_count = [], seriesMap = [], timeRollup = [], axis = [], indexLabels = [];

  var dataLen, week, month, year, weekStart, chartdiv;

  var timeFormat = 'MM/DD/YYYY';

  
  //DEFINE SOME FUNCTIONS

  function createLabels(labels){
    
    var index = 1;
    
    for (var items in labels) {
      indexLabels.push(index);
      index++;
    }
    
    return indexLabels;
    
  }
  
function createCanvas(){
  
      var chartCanvas = $('<canvas id="'+instance.data.chartCanvasName+'"></canvas>');
      chartCanvas.css("width", "100%");
      chartCanvas.css("height", "100%");
      instance.canvas.append(chartCanvas);
	
};
  
function resetCanvas(){
  
  	  var element = document.getElementById(instance.data.loaderDivName);
	  element.parentNode.removeChild(element);  
  
}
  
  
function loader() {

   var chart;

   var loaderDiv = $('<div id="'+instance.data.loaderDivName+'" class="loader"><style>.loader{display: flex; align-items: center; height: '+properties.bubble.height+'px}</style><svg version="1.1" class="svg1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve"><style>.svg1{display: block;width: 40px;height: 40px;margin: 0 auto;}</style><path opacity="0.2" fill="'+properties.loading_icon_color+'" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/><path fill="'+properties.loading_icon_color+'" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0C22.32,8.481,24.301,9.057,26.013,10.047z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.5s" repeatCount="indefinite"></path></svg></div>');
    //chartdiv.css("width", "100%");
    //chartdiv.css("height", "100%");
    instance.canvas.append(loaderDiv);  
  }

  
  
  function addData(label,data,fillColor,borderColor) { 
  	//Is passed the individual series settings includng the data compiles it into one object 
  	//before sending it back to be built into the chart object
    var dataset = {};
    dataset.label = label;
    dataset.data = data;
    dataset.fill = true;
    dataset.backgroundColor = fillColor;
    dataset.borderColor = borderColor;
    dataset.borderWidth = 2;
	dataset.pointBackgroundColor = "transparent";
	dataset.pointBorderColor = "transparent";
	dataset.pointHoverBackgroundColor = "transparent";
	dataset.pointHoverBorderColor = "transparent";   
    dataset.pointHitRadius = 50;      

    
    return dataset;
  }

  function mymax(a){
    var m = -Infinity, i = 0, n = a.length;

    for (; i != n; ++i) {
        if (a[i] > m) {
            m = a[i];
        }
    }

    return m;
}
  
  function mymin(a){
    var m = -Infinity, i = 0, n = a.length;

    for (; i != n; ++i) {
        if (a[i] < m) {
            m = a[i];
        }
    }

    return m;
}
  
  function newRgba(color, opacity) {
    var rgba = color.substring(5, color.length-1)
           .replace(/ /g, '')
           .split(',');
    if (opacity != null) rgba[3] = opacity;
    var rgbaString = "rgba("+rgba[0]+","+rgba[1]+","+rgba[2]+","+rgba[3]+")";
    return rgbaString;
  }

  
  function categoryCount(arr) {
  var a = [], b = [], prev;

    arr.sort();
    for ( var i = 0; i < arr.length; i++ ) {
        if ( arr[i] !== prev ) {
            a.push(arr[i]);
            b.push(1);
        } else {
            b[b.length-1]++;
        }
        prev = arr[i];
    }


    return [a, b];
}  

  //unchecked
  function indexesOf(arr, target) {
  return arr.map(function (el, i) { return (el === target) ? i : null; })
            .filter(function (x) { return x !== null; });
}

  //unchecked
  function rollUp(t) {
    var len = data_category[t].length;
    var num = series_values[t].length;
    var sum;
    var average;
    var currentValue;
    var oldValue;
  	var newValue;
	var listValues = [];
  	var positions = [];

  
  //look for and rollup any repeated data
    for (var i=0;i<len;i++) {
      
      sum=0;
      listValues = [];
      positions = [];
      
      if (instance.data.data_time_rollup != null) {
        positions = indexesOf(timeRollup[t], timeRollup[t][i]);
       }
      
      else positions = indexesOf(data_category[t], data_category[t][i]);

      if (positions.length > 1) {

          for (var x=0;x<positions.length;x++) {

            newValue = series_values[t][positions[x]] + sum;
            sum = newValue;
            listValues[x] = series_values[t][positions[x]];
          }

        for (var x=positions.length -1; x > 0; x--) {
          data_category[t].splice(positions[x], 1);
          series_values[t].splice(positions[x], 1);
          if (instance.data.data_time_rollup != null ) timeRollup[t].splice(positions[x], 1);
        }
        
       if (rollType[t]=="Average") {
         average = sum/positions.length;
         average = average.toFixed(2);
         series_values[t][positions[0]] = average;

       }

       if (rollType[t]=="Sum") {
         series_values[t][positions[0]] = sum;
      }
    
       if (rollType[t]=="Maximum") {
         series_values[t][positions[0]] = mymax(listValues);
       }

       if (rollType[t]=="Minimum") {
         series_values[t][positions[0]] = mymin(listValues);
       }

    len = data_category[t].length;
  }
  

} 
      //create cumulative data
    if (rollType[t]=="Cumulative") {
  num = series_values[t].length;  
  for (var j=1;j<num;j++) {
        oldValue = series_values[t][j-1];
        currentValue = series_values[t][j];
        newValue = oldValue + currentValue;
        series_values[t][j] = newValue;
     }
   }
}
  
  function makeArray(category, series) {
  var seriesCount = category.length;
  var arr = [];
  var item = [];
  for (var x=0;x<seriesCount;x++) {
    item = [category[x], series[x]];
    arr.push(item);
}
  return arr;
}
  
  function arr_diff (long, short) {

    return long.filter(function(i) {return short.indexOf(i) < 0;});
    
}
  
  function fixArrays() {
    var longCat = joinCategory(data_category);
    var catLen = data_category.length;
    var serLen = series_values.length;
  
  	for (var x=0;x<catLen;x++){
      
      var oldLen = data_category[x].length;


      data_category[x] = data_category[x].concat(arr_diff(longCat,data_category[x]));
      
      var newLen = data_category[x].length;
      
      for (var y=oldLen+1;y<=newLen;y++){
        series_values[x].push(null);
      }
  }

  
  
  
for (x=0;x<catLen;x++){
        var list = [];
      for (var j = 0; j < series_values[x].length; j++) 
          list.push({'category': data_category[x][j], 'value': series_values[x][j]});

      //2) sort:

      /*if (instance.data.category_date_formatting_enabled) {
      list = _.sortBy(list, function(o) { return new moment(o.category); });
      }
      else {
        list = list.sort(function(a, b)
{
  var nA = a.category.toLowerCase();
  var nB = b.category.toLowerCase();

  if(nA < nB)
    return -1;
  else if(nA > nB)
    return 1;
 return 0;
});
      }*/
  
      //3) separate them back out:
 timeRollup[x] = [];
      
  for (var k = 0; k < list.length; k++) {

          	series_values[x][k] = list[k].value;
    		data_category[x][k] = list[k].category;
        
        if (instance.data.data_time_rollup != null ) {
            
           if (instance.data.data_time_rollup=="Week") {
              weekStart = moment(list[k].category, "YYYY MM DD").isoWeekday(1)._d;
              data_category[x][k] = moment(weekStart).format("YYYY MM DD");          
              week = moment(data_category[x][k], "YYYY MM DD").week().toString();
              month = moment(data_category[x][k], "YYYY MM DD").month().toString();
              year = moment(data_category[x][k], "YYYY MM DD").year().toString();
              timeRollup[x][k] = week+month+year;
            }
            
            if (instance.data.data_time_rollup=="Month") {
              week = moment(list[k].category, "YYYY MM DD").week().toString();
              month = moment(list[k].category, "YYYY MM DD").month().toString();
              year = moment(list[k].category, "YYYY MM DD").year().toString();
              timeRollup[x][k] = month+year;
              data_category[x][k] = list[k].category;
            }
            
            if (instance.data.data_time_rollup=="Year") {
              week = moment(list[k].category, "YYYY MM DD").week().toString();
              month = moment(list[k].category, "YYYY MM DD").month().toString();
              year = moment(list[k].category, "YYYY MM DD").year().toString();
              timeRollup[x][k] = year;
              data_category[x][k] = list[k].category;
            }
              
          
      }
        
      }
}
}


  //Joins together all of the category lists into one long list  
  //unchecked
  function joinCategory(category){
var longCat = [];
  for (var x=0;x<category.length;x++){
  longCat = longCat.concat(category[x]);
    
  }
 return longCat;
}

  //unchecked  
	function fillArray(small, large) {
  var arr = [];
  var small_len = small.length;
  var large_len = large.length;
  if (small_len >= large_len) return small;
  var count;
  for (var i = 0; i < large_len;) {
    for (var j=0;j < small_len;j++) {
      arr.push(small[j]);
      i++;
      if (i>=large_len) break;
    }
  }
  return arr;
}
  

  //unchecked
  function fn_bubble_data() {
  
    
  	//get category and series data

    //data settings
	var canvas = document.getElementById(instance.data.chartCanvasName);
    instance.data.category_header = "label";
    instance.data.tooltips = properties.category_header.get(0,properties.category_header.length());

    
    //series 1
  	name[0] = properties.series_1_data_header;
  	borderColor[0] = properties.series_1_line_color;
    category_count[0] = properties.series_1_category_count;
    
    fillColor[0] = canvas.getContext('2d').createLinearGradient(100, 20, 0, 150);
	fillColor[0].addColorStop(0, properties.series_1_fill_color_1);
	fillColor[0].addColorStop(1, properties.series_1_fill_color_2);

    
    if (properties.series_1_category_count) {
      var category = properties.series_1_bubble_category.get(0,properties.series_1_bubble_category.length());
      categoryCountData = categoryCount(category);
      data_category[0] = categoryCountData[0];
      series_values[0] = categoryCountData[1];
      rollType[0] = properties.series_1_grouping_mode;
    } else {
       data_category[0] = properties.series_1_bubble_category.get(0,properties.series_1_bubble_category.length()); 
       series_values[0] = properties.series1_bubble_value.get(0,properties.series1_bubble_value.length());
       rollType[0] = properties.series_1_grouping_mode;
    }
	    
    
  	
    //SERIES 2
    if (properties.series_2_enabled) {

		name[1] = properties.series_2_data_header;
  		borderColor[1] = properties.series_2_line_color;
        category_count[1] = properties.series_2_category_count;

		fillColor[1] = canvas.getContext('2d').createLinearGradient(100, 20, 0, 150);
        fillColor[1].addColorStop(0, properties.series_2_fill_color_1);
        fillColor[1].addColorStop(1, properties.series_2_fill_color_2);      
      

      
   	if (properties.series_2_category_count) {
      var category = properties.series_2_bubble_category.get(0,properties.series_2_bubble_category.length());
      categoryCountData = categoryCount(category);
      data_category[1] = categoryCountData[0];
      series_values[1] = categoryCountData[1];

      rollType[1] = properties.series_2_grouping_mode;

    } else {
       data_category[1] = properties.series_2_bubble_category.get(0,properties.series_2_bubble_category.length()); 
       series_values[1] = properties.series2_bubble_value.get(0,properties.series2_bubble_value.length());
       rollType[1] = properties.series_2_grouping_mode;
    }
    }

    
    //SERIES 3
    if (properties.series_3_enabled) {

		name[2] = properties.series_3_data_header;
  		borderColor[2] = properties.series_3_line_color;
        category_count[2] = properties.series_3_category_count;

		fillColor[2] = canvas.getContext('2d').createLinearGradient(100, 20, 0, 150);
        fillColor[2].addColorStop(0, properties.series_3_fill_color_1);
        fillColor[2].addColorStop(1, properties.series_3_fill_color_2);   
      

      
   	if (properties.series_3_category_count) {
      var category = properties.series_3_bubble_category.get(0,properties.series_3_bubble_category.length());
      categoryCountData = categoryCount(category);
      data_category[2] = categoryCountData[0];
      series_values[2] = categoryCountData[1];

      rollType[1] = properties.series_3_grouping_mode;

    } else {
       data_category[2] = properties.series_3_bubble_category.get(0,properties.series_3_bubble_category.length()); 
       series_values[2] = properties.series3_bubble_value.get(0,properties.series3_bubble_value.length());
       rollType[2] = properties.series_3_grouping_mode;
    }
    }
    
  //check if there are multiple lists of category data and set merging to TRUE if it is not already
  if (data_category.length>1) properties.data_merge_enabled=true;

    
  if (properties.data_merge_enabled) {
  	
      if (data_category.length>1) fixArrays();

      for (var r=0;r<data_category.length;r++){
          rollUp(r);
      }

    } //if (properties.data_merge_enabled)
  	

    //create object that merges Bubble data arrays together into single object
    

    var category = data_category[0];

  
    //COMPILE INTO FINAL CHART OBJECT

    var tempData = [];
    instance.data.chartObj = {
      
      data: {
        labels: category
      }  
    };

    
    //enable date

    var len = data_category.length;
    
    for (var x=0;x<len;x++) {
      tempData.push(addData(name[x],series_values[x],fillColor[x],borderColor[x]));
     
    }
    
    instance.data.chartObj.data.datasets = tempData;
    
	

}
  
  function fn_loadProperties() {

    var shadowed = {
	beforeDatasetsDraw: function(chart, options) {
    chart.ctx.shadowColor = 'rgba(0, 0, 0, 0.25)';
    chart.ctx.shadowBlur = 40;
  },
  afterDatasetsDraw: function(chart, options) {
  	chart.ctx.shadowColor = 'rgba(0, 0, 0, 0)';
    chart.ctx.shadowBlur = 0;
  }
};

    //set some basic propeties and define object
  	instance.data.chartObj.type = "radar";
    instance.data.chartObj.data.labels = createLabels(data_category[0]);
    instance.data.chartObj.options = {

    	legend: {
      	display: false,
      },
      responsive:true,
      maintainAspectRatio: false,
      tooltips: {
      	enabled: false,
        custom: function(tooltip) {
          if (tooltip.body) {
            	instance.publishState("tooltip-body", "block");
              if (tooltip.body[0].lines && tooltip.body[0].lines[0]) {
                var ref = tooltip.dataPoints[0].index+1
                var tooltipLabel = ref+": "+instance.data.tooltips[tooltip.dataPoints[0].index];
                
                instance.publishState("tooltip-body", tooltipLabel);
                instance.publishState("tooltip-index", ref);
                if (series_values[0][tooltip.dataPoints[0].index]!=null) instance.publishState("tooltip-series-1", series_values[0][tooltip.dataPoints[0].index]);
                else instance.publishState("tooltip-series-1",0);
                if (series_values[1][tooltip.dataPoints[0].index]!=null) instance.publishState("tooltip-series-2", series_values[1][tooltip.dataPoints[0].index]);
                else instance.publishState("tooltip-series-2",0);
                if (series_values[2][tooltip.dataPoints[0].index]!=null) instance.publishState("tooltip-series-3", series_values[2][tooltip.dataPoints[0].index]);
                else instance.publishState("tooltip-series-3",0);
              }
            }
        },
      },
      gridLines: {
        display: false,
        color: 'white'
      },

      scale: {
        pointLabels: {
        }, 
        ticks: {
			
          min: 0,
           max: properties.max,
           stepSize: properties.step,
           display: false,
           
         }
      },

    plugins: [shadowed]
};
    

}

  function fn_createChart() {   
        
     instance.data.count++; 
        if (instance.data.status == "dataLoading_icon" && instance.data.chartVisible == false ) resetCanvas();
   		if (instance.data.count > 1) instance.data.resetCanvas();
    

    
    
    //create chart using object defined above
       var fontColor = 'rgba(108,114,124,1)';
var lineColor = 'rgba(108,114,124,1)';

Chart.defaults.global.defaultFontSize = 13;

Chart.defaults.global.defaultFontColor = fontColor;
Chart.defaults.scale.gridLines.color = lineColor;
    
    if (properties.label_toggle == false) {
     
      instance.data.chartObj.options.scale.pointLabels = {
        callback: function(pointLabel, index, labels) {
     	pointLabel = '';  
        return pointLabel;
            } 
      }
      
    }
    
    instance.data.myChart = new Chart(instance.data.chartCanvasName, instance.data.chartObj);
    instance.data.chartVisible = true;
	instance.publishState("loaded",true);


   
  }
    
    
  
  

  //INIT CODE

if (properties.data_select_data_source == "Bubble") {
  
 if (instance.data.status == "dataLoading" && properties.loading_icon == true) {
   
  loader();
  createCanvas();
  instance.data.status = "dataLoading_icon";

}   
  
  else createCanvas();
  
try {
   var test = properties.series_1_bubble_category.get(0,properties.series_1_bubble_category.length());
  }
  catch(err) {
    return;
  }
  
}
  
  if (properties.series_1_bubble_category.length() === 0) return;
  
  
  if (instance.data.chartVisible == true) {
    
    fn_createChart();
  }
  
  

  
  
  	fn_bubble_data();

	fn_loadProperties();

  	fn_createChart();




}