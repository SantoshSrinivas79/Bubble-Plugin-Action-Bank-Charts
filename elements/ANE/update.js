function(instance, properties, context) {
  
  //DEFINE SOME VARIABLES
  
  var name = [], data = [], category = [], fillColor = [], borderColor = [], graphType = [], categoryCountData, data_category = [], series_values = [], rollType = [], category_count = [], seriesMap = [], timeRollup = [], tempData = [];
;

  var dataLen, week, month, year, weekStart;
  var timeFormat = 'MM/DD/YYYY';

  
  //INIT CODE

  try {
   var test = properties.category_data.get(0,properties.category_data.length());
  }
  catch(err) {
    return;
  }  
  
  
  
  
  
  //DEFINE SOME FUNCTIONS
  
  function addData(label,data) { 
  	//Is passed the individual series settings includng the data compiles it into one object 
  	//before sending it back to be built into the chart object
    
    var dataset = {};
    dataset.label = label;
    dataset.data = data;
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
  
  //unchecked
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
  	console.log(len);
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
         console.log(listValues);

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
}
  
  //unchecked
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
  
  //unchecked
  function arr_diff (long, short) {
    return long.filter(function(i) {return short.indexOf(i) < 0;});

}
  
  //unchecked
  function fixArrays() {
    var longCat = joinCategory(data_category);
    //console.log("longCat:" + longCat);
    var catLen = data_category.length;
    var serLen = series_values.length;
  
  	for (var x=0;x<catLen;x++){
      
      var oldLen = data_category[x].length;
      console.log("Old Category:" + data_category[x]);
      //console.log("Difference:" + arr_diff(longCat,data_category[x]));

      data_category[x] = data_category[x].concat(arr_diff(longCat,data_category[x]));
      //data_category[x] = data_category[x].concat(longCat.diff(data_category[x]));
      
      var newLen = data_category[x].length;
      console.log("New Category:" + data_category[x]);
      
      for (var y=oldLen+1;y<=newLen;y++){
        series_values[x].push(null);
      }
  //console.log("New Values:" + series_values[x]);
  }

  
  
  
for (x=0;x<catLen;x++){
        var list = [];
      for (var j = 0; j < series_values[x].length; j++) 
          list.push({'category': data_category[x][j], 'value': series_values[x][j]});

      //2) sort:

      if (instance.data.category_date_formatting_enabled) {
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
      }
  
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
    
    var canvas = document.getElementById(instance.data.canvas);
  
    fillColor[0] = canvas.getContext('2d').createLinearGradient(0, 0, 0, properties.bubble.height/0.7);
	fillColor[0].addColorStop(0, properties.fill_color_1a);
	fillColor[0].addColorStop(1, properties.fill_color_1b);
    
    
    instance.data.category_header = properties.category_header;  

  	name[0] = properties.data_header;
    
    //data settings
    category_count[0] = properties.category_count;
    
    
    
    if (properties.category_count) {
      var category = properties.category_data.get(0,properties.category_data.length());
      categoryCountData = categoryCount(category);
      data_category[0] = categoryCountData[0];
      series_values[0] = categoryCountData[1];
      rollType[0] = properties.series_1_grouping_mode;
    } else {
       data_category[0] = properties.category_data.get(0,properties.category_data.length()); 
       series_values[0] = properties.series_data.get(0,properties.series_data.length());
       rollType[0] = properties.grouping_mode;
    }
	    
  

  if (properties.data_merge_enabled) rollUp(0);

  	
    //create object that merges Bubble data arrays together into single object
    
    category = data_category[0];
    console.log(category);

    
    //COMPILE INTO FINAL CHART OBJECT

   
    tempData.push(addData(name[0],series_values[0]));
	
}
  
	function fn_loadProperties() {
      
    instance.data.chartObj = {
      type: "pie",
      data: {
        labels: data_category[0]
      },
      options: {
      	responsive:true,
      	maintainAspectRatio: false,
        plugins: {
        	pieceLabel: {
          		mode: 'value'
        	},
          	datalabels: {
				borderColor: 'white',
				borderRadius: 25,
				borderWidth: 1,
				color: 'white',
				display: function(context) {
					var dataset = context.dataset;
					var count = dataset.data.length;
					var value = dataset.data[context.dataIndex];
					return value > count * 1.5;
				},
				font: {
					weight: 'bold'
				},
				formatter: Math.round	   
      		}
        },
        tooltips: {
    		enabled: false,
        },
        cutoutPercentage: properties.cutoutpercentage,
        segmentShowStroke: true,
        elements : {
          arc : {
            borderWidth : properties.segment_stroke
          }
        },

        legend: {
          display: properties.legend_enabled,
          position: properties.legend_position,
        }
      }
    
    };
     
    
    if (properties.data_source_select === "Bubble") {
      
      instance.data.chartObj.data.datasets = tempData;
      
      instance.data.colorArray = [fillColor[0], properties.fill_color_2a, properties.fill_color_3a, properties.fill_color_4a, properties.fill_color_5a, properties.fill_color_6a];
      
      instance.data.colorArray = fillArray(instance.data.colorArray,data_category[0]);

      instance.data.chartObj.data.datasets[0].backgroundColor = instance.data.colorArray;
      instance.data.chartObj.data.datasets[0].hoverBackgroundColor = instance.data.colorArray;
      
    }


      
          
  }
  
  function createChart() {

    instance.data.count++;
    console.log(instance.data.count);
    if (instance.data.count === 1) var myChart = new Chart(instance.data.canvas, instance.data.chartObj);
    if (instance.data.count > 1) {
      instance.data.resetCanvas();
      var myChart = new Chart(instance.data.canvas, instance.data.chartObj);
    }
    console.log(instance.canvas);
    instance.publishState("loaded",true);
    console.log("pie height: "+properties.bubble.height);
    console.log("pie width: "+properties.bubble.width);    


    //create chart using object defined above
    


    
  }
    
  fn_bubble_data();
  
  fn_loadProperties();
  
  createChart();
  





}