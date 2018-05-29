function(instance, properties, context) {
  
  //DEFINE SOME VARIABLES
  
  var name = [], data = [], category = [], fillColor = [], borderColor = [], opacity = [], graphType = [], categoryCountData, data_category = [], series_values = [], rollType = [], category_count = [], seriesMap = [], timeRollup = [], axis = [];

  var dataLen, week, month, year, weekStart;
;
  var heightScaler = 0.7;

  
  //DEFINE SOME FUNCTIONS

  
function createCanvas(){
  
      var chartCanvas = $('<canvas id="'+instance.data.chartCanvasName+'"></canvas>');
      chartCanvas.css("width", "100%");
      chartCanvas.css("height", "100%");
      instance.canvas.append(chartCanvas);
	
};
  
function removeDiv(){
  
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

  
  
  function addData(label,data,fillColor,borderColor,graphType,axis) { 
  	//Is passed the individual series settings includng the data compiles it into one object 
  	//before sending it back to be built into the chart object
    
    var dataset = {};
    dataset.label = label;
    dataset.data = data;
    dataset.yAxisID = axis;
    dataset.backgroundColor = fillColor;
    dataset.borderColor = borderColor;
    dataset.type = graphType;
    dataset.borderWidth = 2;
    dataset.lineTension = properties.bezier;
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
        series_values[x].push(0);
      }
  }

  
  
  
for (x=0;x<catLen;x++){
        var list = [];
      for (var j = 0; j < series_values[x].length; j++) 
          list.push({'category': data_category[x][j], 'value': series_values[x][j]});

      //2) sort:

      if (instance.data.category_date_formatting_enabled) {
      list = _.sortBy(list, function(o) { return moment(o.category, "MM-DD-YYYY"); });
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
      }
  
      //3) separate them back out:
 timeRollup[x] = [];
      
  for (var k = 0; k < list.length; k++) {

          	series_values[x][k] = list[k].value;
    		data_category[x][k] = list[k].category;
        
        if (instance.data.data_time_rollup != null ) {
            
           if (instance.data.data_time_rollup=="Week") {
              weekStart = moment(list[k].category, "MM-DD-YYYY").isoWeekday(1)._d;
              data_category[x][k] = moment(weekStart).format("MM-DD-YYYY");          
              week = moment(data_category[x][k], "MM-DD-YYYY").week().toString();
              month = moment(data_category[x][k], "MM-DD-YYYY").month().toString();
              year = moment(data_category[x][k], "MM-DD-YYYY").year().toString();
              timeRollup[x][k] = week+month+year;
            }
            
            if (instance.data.data_time_rollup=="Month") {
              week = moment(list[k].category, "MM-DD-YYYY").week().toString();
              month = moment(list[k].category, "MM-DD-YYYY").month().toString();
              year = moment(list[k].category, "MM-DD-YYYY").year().toString();
              timeRollup[x][k] = month+year;
              data_category[x][k] = list[k].category;
            }
            
            if (instance.data.data_time_rollup=="Year") {
              week = moment(list[k].category, "MM-DD-YYYY").week().toString();
              month = moment(list[k].category, "MM-DD-YYYY").month().toString();
              year = moment(list[k].category, "MM-DD-YYYY").year().toString();
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

    
    
        if (properties.inject_zero) {
      
          	function include(arr,obj) {
    			return (arr.indexOf(obj) != -1);
			}
          
          var tempLongCat = [];
          
      	for (var date in longCat) {
          tempLongCat[date] = moment(longCat[date],"MM-DD-YYYY");
        }
          
        var maxDate = moment.max(tempLongCat); 
        var minDate = moment.min(tempLongCat);
        var dateCount = minDate.clone().year()*365 + minDate.clone().dayOfYear();
        var lastDate = maxDate.clone().year()*365 + maxDate.clone().dayOfYear();
        var newDate = minDate.clone();
        var newDateArray = [];        

			for (var m = moment(minDate); m.isBefore(maxDate); m.add(1, 'days')) {
              var trueCount = 0;
              for (var dates in tempLongCat) {
               	if (moment(tempLongCat[dates]).isSame(m, 'day')) trueCount++;
              }
              if (trueCount === 0) newDateArray.push(m.format('MM-DD-YYYY').toString());
				}
          
          		longCat=longCat.concat(newDateArray);

    	}
    
    
 return longCat;
}

  function joinCategoryDates(category){
    
    joinCategory(category);
    
    
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
 
    var canvas = document.getElementById(instance.data.chartCanvasName);
    
    console.log('Bar Canvas: '+canvas);
  	//get category and series data

    //data settings
    
    instance.data.category_header = properties.category_header;  
    instance.data.category_date_formatting_enabled = properties.category_date_formatting_enabled;
    instance.data.data_time_rollup = properties.data_time_rollup;

    //series 1
  	name[0] = properties.series_1_data_header;
  	borderColor[0] = properties.series_1_line_color;
  	graphType[0] = properties.series_1_chart_type;
    category_count[0] = properties.series_1_category_count;

    fillColor[0] = canvas.getContext('2d').createLinearGradient(0,50,0,properties.bubble.height/heightScaler);
	fillColor[0].addColorStop(0, properties.series_1_fill_color_1);
	fillColor[0].addColorStop(1, properties.series_1_fill_color_2);
    
    //fillColor[0] = properties.series_1_fill_color_1;
    
    
    axis[0] = properties.series_1_axis;
    
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
	    
    
  	
    //series 2
    if (properties.series_2_enabled) {

		name[1] = properties.series_2_data_header;
  		borderColor[1] = properties.series_2_line_color;
  		graphType[1] = properties.series_2_chart_type;
        category_count[1] = properties.series_2_category_count;

        fillColor[1] = canvas.getContext('2d').createLinearGradient(0,50,0,properties.bubble.height/heightScaler);
        fillColor[1].addColorStop(0, properties.series_2_fill_color_1);
        fillColor[1].addColorStop(1, properties.series_2_fill_color_2);
      
        axis[1] = properties.series_2_axis;

      
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
    

    //series 3    
    if (properties.series_3_enabled) {

		name[2] = properties.series_3_data_header;
  		borderColor[2] = properties.series_3_line_color;
  		graphType[2] = properties.series_3_chart_type;
        category_count[2] = properties.series_3_category_count;

        fillColor[2] = canvas.getContext('2d').createLinearGradient(0,50,0,properties.bubble.height/heightScaler);
        fillColor[2].addColorStop(0, properties.series_3_fill_color_1);
        fillColor[2].addColorStop(1, properties.series_3_fill_color_2);
      
        axis[2] = properties.series_3_axis;

      
   	if (properties.series_3_category_count) {
      var category = properties.series_3_bubble_category.get(0,properties.series_3_bubble_category.length());
      categoryCountData = categoryCount(category);
      data_category[2] = categoryCountData[0];
      series_values[2] = categoryCountData[1];
      rollType[2] = properties.series_3_grouping_mode;

    } else {
       data_category[2] = properties.series_3_bubble_category.get(0,properties.series_3_bubble_category.length()); 
       series_values[2] = properties.series3_bubble_value.get(0,properties.series3_bubble_value.length());
       rollType[2] = properties.series_3_grouping_mode;
    }
    }// en
    

    
  //check if there are multiple lists of category data and set merging to TRUE if it is not already
  if (data_category.length>1 || properties.inject_zero) properties.data_merge_enabled=true;

    
  if (properties.data_merge_enabled) {
  	
      if (instance.data.data_time_rollup != null || data_category.length>1 || properties.inject_zero) fixArrays();

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
      tempData.push(addData(name[x],series_values[x],fillColor[x],borderColor[x],graphType[x],axis[x]));

    }
    instance.data.chartObj.data.datasets = tempData;
    console.log(tempData);

}
  
  function fn_loadProperties() {
      

    //set some basic propeties and define object
  	instance.data.chartObj.type = "bar";
    instance.data.chartObj.options = {
      responsive:true,
      maintainAspectRatio: false,
      title: {
        text: "Title"
      },
      legend: {
          display: properties.legend_enabled,
          position: properties.legend_position
        },
      elements : {
        point : {
          radius: 2,
          hitRadius: 2, 
          hoverRadius: 2,
          backgroundColor: "rgba(0,0,0,1)"
        } 
      },
      scales: {
          yAxes: [{
            type: "linear",
            position: "left",
            id: "left",
            display: properties.yaxis_show,
            ticks: {            
            }
          }],
          xAxes: [{
            ticks: {
                autoSkip:true,
            	source:'data',
              	maxTicksLimit:10
            },
           display: properties.xaxis_show
          }]
        }

    };

    
    if (properties.settings === "Time 1") {
            
      instance.data.chartObj.options.scales.xAxes[0].type = 'time';
      instance.data.chartObj.options.scales.xAxes[0].distribution = 'linear';
      instance.data.chartObj.options.scales.xAxes[0].unit = 'day';
      instance.data.chartObj.options.scales.xAxes[0].time = {parser: 'MM-DD-YYYY'};
      instance.data.chartObj.options.scales.xAxes[0].displayFormats = {day: 'MMM DD'};

    }
    
    if (properties.settings === "Time 2") {
            
      instance.data.chartObj.options.scales.xAxes[0].type = 'time';
      instance.data.chartObj.options.scales.xAxes[0].distribution = 'linear';
      instance.data.chartObj.options.scales.xAxes[0].unit = 'day';
      instance.data.chartObj.options.scales.xAxes[0].time = {
        //parser: 'MM-DD-YYYY',
      	max: moment(),
        min: moment().subtract(6,'days')
      };
      instance.data.chartObj.options.scales.xAxes[0].time.displayFormats = {
        day: 'MMM D',
      	hour: 'MMM D',
      	minute: 'MMM D'};

    }
    
        if (properties.settings === "Time 3") {
            
      instance.data.chartObj.options.scales.xAxes[0].type = 'time';
      instance.data.chartObj.options.scales.xAxes[0].distribution = 'linear';
      instance.data.chartObj.options.scales.xAxes[0].unit = 'week';
      instance.data.chartObj.options.scales.xAxes[0].time = {
        parser: 'MM-DD-YYYY',
      	max: moment().subtract(1,'days'),
        min: moment().subtract(properties.x_axis_min_time,'days')
      };
      instance.data.chartObj.options.scales.xAxes[0].ticks.stepSize = 2;      
      instance.data.chartObj.options.scales.xAxes[0].time.displayFormats = {
        day: 'MMM D',
      	hour: 'MMM D',
      	minute: 'MMM D'
      };
      instance.data.chartObj.options.scales.xAxes[0].gridLines = {
        display: false,
        color: "black"
      };

    }
    
    
    if (properties.settings === "Category 1") {
    	//instance.data.chartObj.options.scales.xAxes[0].barPercentage = 0.4;
      //instance.data.chartObj.options.plugins.datalabels.display = 'true';
    
    
    }
    
    if (properties.settings === "Category 2") {
    instance.data.chartObj.options.scales.xAxes[0].barPercentage = 1;
    instance.data.chartObj.options.scales.xAxes[0].ticks.autoSkip = false;
      //instance.data.chartObj.options.plugins.datalabels.display = 'true';
    
    
    }
      
    //switch date parsing on
    if (instance.data.category_date_formatting_enabled) {
      //instance.data.chartObj.options.scales.xAxes[0].type = "time";
    }
    
    
    //add right axis
    var rightAxisOn = axis.includes("right");
	if (rightAxisOn) {
      
      instance.data.chartObj.options.scales.yAxes[1] = {
        type: "linear",
        ticks: {},
        position: "right",
        id: "right",
        display: true
      };
      
    }
    
    if (!(properties.l_axis_min === null || properties.l_axis_min === "")) instance.data.chartObj.options.scales.yAxes[0].ticks.min = properties.l_axis_min;
    //if (!(properties.l_axis_min === null || properties.l_axis_min === "")) instance.data.chartObj.options.scales.yAxes[1].ticks.min = properties.l_axis_min;
    if (!(properties.l_axis_max === null || properties.l_axis_max === "")) instance.data.chartObj.options.scales.yAxes[0].ticks.max = properties.l_axis_max;

    
  }

  function fn_createChart() {   

    instance.data.count++;
    
    if (instance.data.status == "dataLoading_icon" && instance.data.chartVisible == false ) removeDiv();
    if (instance.data.count > 1) instance.data.resetCanvas();
    
    //create chart using object defined above
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