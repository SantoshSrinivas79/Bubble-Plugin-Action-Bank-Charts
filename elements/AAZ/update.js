function(instance, properties, context) {


  
  
//DEFINE SOME VARIABLES
  
var bubbleDataValues;
var series_values = [];
var data_category = [];
var bubble_data_obj = [];
var sheetsu_data_obj = [];
var i;
var seriesMap = [];
var rollType = [];
var rollUpID;
var dataLen, week, month, year, weekStart;
var timeRollup = [];
var categoryCountData = [];
var rotate = false;

  
  
  
  
  
  
  
  
//DEFINE SOME FUNCTIONS
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
  
  
function extractAlpha(rgba) {

  if (rgba === null) return null;
  rgba = rgba.substring(5, rgba.length-1)
         .replace(/ /g, '')
         .split(',');
  
  return Number(rgba[3]);
}  
  
  
function loader() {
  
    
instance.data.divName = "graphdiv"+Math.round(Math.random()*1000000) + 1;
    var chart;
   var chartdiv;

    chartdiv = $('<div id="'+instance.data.divName+'" class="loader"><style>.loader{display: flex; align-items: center; height: '+properties.bubble.height+'px}</style><svg version="1.1" class="svg1" xmlns="http://www.w3.org/2000/svg" xmlns:xlink= "http://www.w3.org/1999/xlink" viewBox="0 0 40 40" enable-background="new 0 0 40 40" xml:space="preserve"><style>.svg1{display: block;width: 40px;height: 40px;margin: 0 auto;}</style><path opacity="0.2" fill="'+properties.loading_icon_color+'" d="M20.201,5.169c-8.254,0-14.946,6.692-14.946,14.946c0,8.255,6.692,14.946,14.946,14.946s14.946-6.691,14.946-14.946C35.146,11.861,28.455,5.169,20.201,5.169z M20.201,31.749c-6.425,0-11.634-5.208-11.634-11.634c0-6.425,5.209-11.634,11.634-11.634c6.425,0,11.633,5.209,11.633,11.634C31.834,26.541,26.626,31.749,20.201,31.749z"/><path fill="'+properties.loading_icon_color+'" d="M26.013,10.047l1.654-2.866c-2.198-1.272-4.743-2.012-7.466-2.012h0v3.312h0C22.32,8.481,24.301,9.057,26.013,10.047z"><animateTransform attributeType="xml" attributeName="transform" type="rotate" from="0 20 20" to="360 20 20" dur="0.5s" repeatCount="indefinite"></path></svg></div>');
    //chartdiv.css("width", "100%");
    //chartdiv.css("height", "100%");
    instance.canvas.append(chartdiv);  
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
  
function indexesOf(arr, target) {
  return arr.map(function (el, i) { return (el === target) ? i : null; })
            .filter(function (x) { return x !== null; });
}
  
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

        //get a total value for each category value
          for (var x=0;x<positions.length;x++) {

            newValue = series_values[t][positions[x]] + sum;
            sum = newValue;
            listValues[x] = series_values[t][positions[x]];
          }

        //delete the duplicate values from both the category and value series
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
  
  //create cumulative data

} 
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
    /*
    var a = [], diff = [];

    for (var i = 0; i < long.length; i++) {
        a[long[i]] = true;
    }

    for (var i = 0; i < short.length; i++) {
        if (a[short[i]]) {
            delete a[short[i]];
        } else {
            a[short[i]] = true;
        }
    }

    for (var k in a) {
        diff.push(k);
    }
	console.log("long: "+long);
    console.log("short: "+short);
    console.log("diff: "+diff);
    return diff; */
}
  
function fixArrays() {
    var longCat = joinCategory(data_category);
    var catLen = data_category.length;
    var serLen = series_values.length;
  
  	for (var x=0;x<catLen;x++){
      
      var oldLen = data_category[x].length;
      //console.log("Old Category:" + data_category[x]);
      //console.log("Difference:" + arr_diff(longCat,data_category[x]));

      data_category[x] = data_category[x].concat(arr_diff(longCat,data_category[x]));
      
      var newLen = data_category[x].length;
      console.log("New Category:" + data_category[x]);
      
      for (var y=oldLen+1;y<=newLen;y++){
        series_values[x].push(null);
      }
  console.log("New Values:" + series_values[x]);
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
function joinCategory(category){
var longCat = [];
  for (var x=0;x<category.length;x++){
  longCat = longCat.concat(category[x]);
    
  }
 return longCat;
}

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
  
  
function fn_bubble_data() {
  
	
  	//get category and series data
  	//series 1
    if (instance.data.series_1_category_count) {
      
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
	if (instance.data.series_2_enabled) {
   if (instance.data.series_2_category_count) {
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
if (instance.data.series_3_enabled) {data_category[2] = properties.series_3_bubble_category.get(0,properties.series_3_bubble_category.length()); 
                                         series_values[2] = properties.series3_bubble_value.get(0,properties.series3_bubble_value.length());
                                    rollType[2] = properties.series_3_grouping_mode;
                                    }
  
  	//series 4
if (instance.data.series_4_enabled) {data_category[3] = properties.series_4_bubble_category.get(0,properties.series_4_bubble_category.length()); 
                                         series_values[3] = properties.series4_bubble_value.get(0,properties.series4_bubble_value.length());
                                    rollType[3] = properties.series_4_grouping_mode;
                                    }    
  
  	//series 5
if (instance.data.series_5_enabled) {data_category[4] = properties.series_5_bubble_category.get(0,properties.series_5_bubble_category.length()); 
                                         series_values[4] = properties.series5_bubble_value.get(0,properties.series5_bubble_value.length());
                                    rollType[4] = properties.series_5_grouping_mode;
                                    }  
  
  	//series 6
if (instance.data.series_6_enabled) {data_category[5] = properties.series_6_bubble_category.get(0,properties.series_6_bubble_category.length()); 
                                         series_values[5] = properties.series6_bubble_value.get(0,properties.series6_bubble_value.length());
                                    rollType[5] = properties.series_6_grouping_mode;
                                    }  
  
  	//series 7
if (instance.data.series_7_enabled) {data_category[6] = properties.series_7_bubble_category.get(0,properties.series_7_bubble_category.length()); 
                                         series_values[6] = properties.series7_bubble_value.get(0,properties.series7_bubble_value.length());
                                    rollType[6] = properties.series_7_grouping_mode;
                                    }  
  
  	//series 8
if (instance.data.series_8_enabled) {data_category[7] = properties.series_8_bubble_category.get(0,properties.series_8_bubble_category.length()); 
                                         series_values[7] = properties.series8_bubble_value.get(0,properties.series8_bubble_value.length());
                                    rollType[7] = properties.series_8_grouping_mode;
                                    }  
  
  
//check if there are multiple lists of category data and set merging to TRUE if it is not already
  if (data_category.length>1) properties.data_merge_enabled=true;

  if (properties.data_merge_enabled) {
  	
      if (instance.data.data_time_rollup != null || data_category.length>1) fixArrays();

      for (var r=0;r<data_category.length;r++){
          rollUp(r);
      }
    

    } //if (properties.data_merge_enabled)
  	

    //create object that merges Bubble data arrays together into single object
    
var category = data_category[0];
var obj_hex_1 = "bubble_color1";
var obj_hex_2 = "bubble_color2";
var hex_color_data_1 = [];
var hex_color_data_2 = [];
    
if (properties.series_1_bubble_color_field!= null) {
  hex_color_data_1 = fillArray(properties.series_1_bubble_color_field.get(0,properties.series_1_bubble_color_field.length()),category);
  instance.data.series_1_color_field = obj_hex_1;
}
  
if (properties.series_2_bubble_color_field!= null) {
  hex_color_data_2 = fillArray(properties.series_2_bubble_color_field.get(0,properties.series_2_bubble_color_field.length()),category);
  instance.data.series_2_color_field = obj_hex_2;
}


  
  for (var i = 0; i < category.length; i++) {    

      	var newSeries = {
      		[instance.data.category_header] : category[i],
      		[instance.data.series_1_data_header] : series_values[0][i]
          	
    	}; //var newSeries
  		    
      	if (instance.data.series_2_enabled) newSeries[instance.data.series_2_data_header] = series_values[1][i];
      	if (instance.data.series_3_enabled) newSeries[instance.data.series_3_data_header] = series_values[2][i];
      	if (instance.data.series_4_enabled) newSeries[instance.data.series_4_data_header] = series_values[3][i];
        if (instance.data.series_5_enabled) newSeries[instance.data.series_5_data_header] = series_values[4][i];
        if (instance.data.series_6_enabled) newSeries[instance.data.series_6_data_header] = series_values[5][i];
        if (instance.data.series_7_enabled) newSeries[instance.data.series_7_data_header] = series_values[6][i];
        if (instance.data.series_8_enabled) newSeries[instance.data.series_8_data_header] = series_values[7][i];
        if (properties.series_1_bubble_color_field!= null) newSeries[obj_hex_1] = hex_color_data_1[i];
        if (properties.series_2_bubble_color_field!= null) newSeries[obj_hex_2] = hex_color_data_2[i];

      
  		
      	bubble_data_obj.push(newSeries);
    }


  instance.data.drawPie(seriesMap, bubble_data_obj);

}
  

  
  
//INIT CODE  
  
  
  //check for errors
  
if (instance.data.data_select_data_source == "Bubble") {
 if (instance.data.count == false && properties.loading_icon == true) {
  instance.data.count = true;
  loader();
}   
  
  try {
   var test = properties.series_1_bubble_category.get(0,properties.series_1_bubble_category.length());
  }
  catch(err) {
    return;
  }
  
}
  //loading icon
instance.data.loading_icon = properties.loading_icon;


  
  
  
  
  
  
  
//GENERAL PROPERTIES
instance.data.data_select_data_source = properties.data_select_data_source;  
instance.data.data_source_is_google_spreadsheet_key = properties.data_source_is_google_spreadsheet_key; 
instance.data.data_source_is_google_spreadsheet_sheet = properties.data_source_is_google_spreadsheet_sheet;
if (properties.data_merge_enabled && properties.category_date_formatting_enabled) instance.data.data_time_rollup = properties.data_time_rollup;

instance.data.chart_color_overall_theme = properties.chart_color_overall_theme; 
instance.data.data_export_available = properties.data_export_available;
instance.data.balloon_text = properties.balloon_text;
instance.data.interval_refresh_enabled = properties.interval_refresh_enabled;
instance.data.interval = properties.interval_refresh * 1000;
instance.data.styling_animation_type = properties.styling_animation_type;
instance.data.styling_animation_duration = Number(properties.styling_animation_duration);
instance.data.styling_animation_sequence = properties.styling_animation_sequence;
instance.data.styling_3d_depth = properties.styling_3d_depth;
instance.data.styling_3d_angle = properties.styling_3d_angle;
instance.data.data_decimal_places = properties.data_decimal_places;

  
if (properties.chart_rotate == "Vertical") {
instance.data.chart_rotate = false;
} 
  else {
instance.data.chart_rotate = true;
}
  
if (instance.data.styling_animation_type == "none") {
  instance.data.styling_animation_duration = 0;
  instance.data.styling_animation_type = "bounce";
}


//LEFT AXIS PROPERITES
instance.data.value_axis_position_in_chart = properties.value_axis_position_in_chart; 
instance.data.value_axis_minimum = properties.value_axis_minimum;
instance.data.value_axis_maximum = properties.value_axis_maximum;

instance.data.value_axis_labels_enabled = properties.value_axis_labels_enabled; 
instance.data.value_axis_labels_color = properties.value_axis_labels_color; 
instance.data.value_axis_labels_unit_label = properties.value_axis_labels_unit_label;  
instance.data.value_axis_labels_unit_position = properties.value_axis_labels_unit_position; 
instance.data.value_axis_distance_offset = properties.value_axis_distance_offset;   
instance.data.value_axis_axis_line_color = properties.value_axis_axis_line_color;   
instance.data.value_axis_axis_line_thickness = properties.value_axis_axis_line_thickness;   
instance.data.value_axis_axis_line_opacity = Number(extractAlpha(properties.value_axis_axis_line_color));   
instance.data.value_axis_grid_line_color = properties.value_axis_grid_line_color; 
instance.data.value_axis_grid_line_thickness = properties.value_axis_grid_line_thickness;   
instance.data.value_axis_grid_line_opacity = Number(extractAlpha(properties.value_axis_grid_line_color));  
instance.data.value_axis_grid_line_dash_length = properties.value_axis_grid_line_dash_length;  
instance.data.value_axis_alternate_fill_color = properties.value_axis_alternate_fill_color;   
instance.data.value_axis_alternate_fill_opacity = Number(extractAlpha(properties.value_axis_alternate_fill_color));
instance.data.chart_stacking_mode = properties.chart_stacking_mode;

//RIGHT AXIS PROPERTIES
instance.data.value_axis_right_line_color = properties.value_axis_right_line_color;
instance.data.value_axis_right_labels_unit_label = properties.value_axis_right_labels_unit_label;  
instance.data.value_axis_right_labels_unit_position = properties.value_axis_right_labels_unit_position; 

//CATEGORY PROPERTIES
instance.data.category_header = properties.category_header;  
instance.data.category_date_formatting_enabled = properties.category_date_formatting_enabled;
instance.data.category_axis_distance_offset = properties.category_axis_distance_offset;
instance.data.category_axis_labels_color = properties.category_axis_labels_color;
instance.data.category_axis_labels_enabled = properties.category_axis_labels_enabled;
instance.data.category_axis_label_rotation = properties.category_axis_label_rotation;
instance.data.category_axis_axis_line_color = properties.category_axis_axis_line_color; 
instance.data.category_axis_axis_line_thickness = properties.category_axis_axis_line_thickness; 
instance.data.category_axis_axis_line_opacity = extractAlpha(properties.category_axis_axis_line_color); 
instance.data.category_axis_grid_line_color = properties.category_axis_grid_line_color; 
instance.data.category_axis_grid_line_thickness = properties.category_axis_grid_line_thickness; 
instance.data.category_axis_grid_line_opacity = Number(extractAlpha(properties.category_axis_grid_line_color)); 
instance.data.category_axis_grid_line_dash_length = properties.category_axis_grid_line_dash_length; 
instance.data.category_axis_alternate_fill_color = properties.category_axis_alternate_fill_color; 
instance.data.category_axis_alternate_fill_opacity = Number(extractAlpha(properties.category_axis_alternate_fill_color)); 
instance.data.category_axis_position = properties.category_axis_position;
  if (properties.series_1_chart_type === "line") instance.data.category_axis_startOnZero = true;
  else instance.data.category_axis_startOnZero = false;
  

  //SERIES 1 PROPERTIES
instance.data.series_1_category_count = properties.series_1_category_count;
instance.data.series_1_data_header = properties.series_1_data_header; 
instance.data.series_1_axis_to_plot_series_on = properties.series_1_axis_to_plot_series_on; 
instance.data.series_1_chart_type = properties.series_1_chart_type; 
instance.data.series_1_fill_color = properties.series_1_fill_color; 
instance.data.series_1_fill_opacity = Number(extractAlpha(instance.data.series_1_fill_color));

 
if (instance.data.data_select_data_source == "Google Sheets" && properties.series_1_color_field!=null) instance.data.series_1_color_field = properties.series_1_color_field;
  
instance.data.series_1_line_dash_length = properties.series_1_line_dash_length; 
instance.data.series_1_line_color = properties.series_1_line_color; 
instance.data.series_1_line_opacity = Number(extractAlpha(instance.data.series_1_line_color)); 
instance.data.series_1_line_thickness = properties.series_1_line_thickness; 
instance.data.series_1_bullet_type = properties.series_1_bullet_type; 
instance.data.series_1_bullet_size = properties.series_1_bullet_size; 
instance.data.series_1_label_balloon_enabled = properties.series_1_label_balloon_enabled;
seriesMap.push(1);
  
  //SERIES 2 PROPERTIES
  instance.data.series_2_category_count = properties.series_2_category_count;
  instance.data.series_2_enabled = properties.series_2_enabled;  
  if (instance.data.series_2_enabled) {
  	instance.data.series_2_data_header = properties.series_2_data_header;
    instance.data.series_2_axis_to_plot_series_on = properties.series_2_axis_to_plot_series_on; 
	instance.data.series_2_chart_type = properties.series_2_chart_type; 
	instance.data.series_2_fill_color = properties.series_2_fill_color; 
	instance.data.series_2_fill_opacity = Number(extractAlpha(instance.data.series_2_fill_color)); 
	if (instance.data.data_select_data_source == "Google Sheets" || properties.series_2_color_field!=null) instance.data.series_2_color_field = properties.series_2_color_field;
  	instance.data.series_2_line_dash_length = properties.series_2_line_dash_length; 
  	instance.data.series_2_line_color = properties.series_2_line_color;
  	instance.data.series_2_line_opacity = Number(extractAlpha(instance.data.series_2_line_color)); 
  	instance.data.series_2_line_thickness = properties.series_2_line_thickness; 
  	instance.data.series_2_bullet_type = properties.series_2_bullet_type; 
  	instance.data.series_2_bullet_size = properties.series_2_bullet_size; 
  	instance.data.series_2_label_balloon_enabled = properties.series_2_label_balloon_enabled;
    seriesMap.push(1);
  } else seriesMap.push(0);
  
  //ADD OTHER SERIES PROPERTIES
	
  
  //SERIES 3
  if (properties.series_3_enabled) {
    
      instance.data.series_3_enabled = properties.series_3_enabled;
      instance.data.series_3_data_header = properties.series_3_data_header;
      instance.data.series_3_line_color = properties.series_3_line_color;
      instance.data.series_3_line_opacity = Number(extractAlpha(instance.data.series_3_line_color)); 
      instance.data.series_3_fill_color = properties.series_3_fill_color;
      instance.data.series_3_fill_opacity = Number(extractAlpha(instance.data.series_3_fill_color)); 
      instance.data.series_3_settings = properties.series_3_settings;
      instance.data.series_3_axis_to_plot_series_on = properties.series_3_axis_to_plot_series_on;
      instance.data.newSeriesCount++;
      seriesMap.push(1);
    
  } 
  else {
    instance.data.series_3_enabled = false;
    seriesMap.push(0);
  }
  
  //SERIES 4
	if (properties.series_4_enabled) {

      instance.data.series_4_enabled = properties.series_4_enabled;
      instance.data.series_4_data_header = properties.series_4_data_header;
      instance.data.series_4_line_color = properties.series_4_line_color;
      instance.data.series_4_line_opacity = Number(extractAlpha(instance.data.series_4_line_color)); 
      instance.data.series_4_fill_color = properties.series_4_fill_color;
      instance.data.series_4_fill_opacity = Number(extractAlpha(instance.data.series_4_fill_color));   
      instance.data.series_4_settings = properties.series_4_settings;
      instance.data.series_4_axis_to_plot_series_on = properties.series_4_axis_to_plot_series_on;
      instance.data.newSeriesCount++;
      seriesMap.push(1);
      
  } else {
    instance.data.series_4_enabled = false; 
    seriesMap.push(0);
  }
  
  
  //SERIES 5
	if (properties.series_5_enabled) {
      
      instance.data.series_5_enabled = properties.series_5_enabled;
      instance.data.series_5_data_header = properties.series_5_data_header;
      instance.data.series_5_line_color = properties.series_5_line_color;
      instance.data.series_5_line_opacity = Number(extractAlpha(instance.data.series_5_line_color)); 
      instance.data.series_5_fill_color = properties.series_5_fill_color;
      instance.data.series_5_fill_opacity = Number(extractAlpha(instance.data.series_5_fill_color)); 
      instance.data.series_5_settings = properties.series_5_settings;
      instance.data.series_5_axis_to_plot_series_on = properties.series_5_axis_to_plot_series_on;
      instance.data.newSeriesCount++;
  	  seriesMap.push(1);
  } 
  
  else {
    instance.data.series_5_enabled = false; 
    seriesMap.push(0);
  }
  
  //SERIES 6
	if (properties.series_6_enabled) {
      
      instance.data.series_6_enabled = properties.series_6_enabled;
      instance.data.series_6_data_header = properties.series_6_data_header;
      instance.data.series_6_line_color = properties.series_6_line_color;
      instance.data.series_6_line_opacity = Number(extractAlpha(instance.data.series_6_line_color)); 
      instance.data.series_6_fill_color = properties.series_6_fill_color;
      instance.data.series_6_fill_opacity = Number(extractAlpha(instance.data.series_6_fill_color)); 

      instance.data.series_6_settings = properties.series_6_settings;
      instance.data.series_6_axis_to_plot_series_on = properties.series_6_axis_to_plot_series_on;
      instance.data.newSeriesCount++;
      seriesMap.push(1);
  } 
  
  else {
    instance.data.series_6_enabled = false; 
    seriesMap.push(0);
  }
  
  //SERIES 7
	if (properties.series_7_enabled) {
      
      instance.data.series_7_enabled = properties.series_7_enabled;
      instance.data.series_7_data_header = properties.series_7_data_header;
      instance.data.series_7_line_color = properties.series_7_line_color;
      instance.data.series_7_line_opacity = Number(extractAlpha(instance.data.series_7_line_color)); 
      instance.data.series_7_fill_color = properties.series_7_fill_color;
      instance.data.series_7_fill_opacity = Number(extractAlpha(instance.data.series_7_fill_color));
      instance.data.series_7_settings = properties.series_7_settings;
      instance.data.series_7_axis_to_plot_series_on = properties.series_7_axis_to_plot_series_on;
      instance.data.newSeriesCount++;
      seriesMap.push(1);
  } 
  
  else {
    instance.data.series_7_enabled = false;
    seriesMap.push(0);
  }
  
  //SERIES 8
	if (properties.series_8_enabled) {
      
      instance.data.series_8_enabled = properties.series_8_enabled;
      instance.data.series_8_data_header = properties.series_8_data_header;
      instance.data.series_8_line_color = properties.series_8_line_color;
      instance.data.series_8_line_opacity = Number(extractAlpha(instance.data.series_8_line_color)); 
      instance.data.series_8_fill_color = properties.series_8_fill_color;
      instance.data.series_8_fill_opacity = Number(extractAlpha(instance.data.series_8_fill_color)); 
      instance.data.series_8_settings = properties.series_8_settings;
      instance.data.series_8_axis_to_plot_series_on = properties.series_8_axis_to_plot_series_on;
      instance.data.newSeriesCount++;
      seriesMap.push(1);
  } 
  
  else {
    instance.data.series_8_enabled = false;
    seriesMap.push(0);
  }
  
//SCROLLBAR PROPERTIES
if (properties.scrollbar_enabled) {
  instance.data.scrollbar_enabled = properties.scrollbar_enabled;
  instance.data.scrollbar_height = Number(properties.scrollbar_height);
  instance.data.scrollbar_offset = Number(properties.scrollbar_offset);
  instance.data.scrollbar_series = properties.scrollbar_series;
  if (properties.scrollbar_position=="Below chart") {instance.data.scrollbar_position=false;} else {instance.data.scrollbar_position=true;}
}

//CURSOR PROPERTIES
instance.data.cursor_enabled = properties.cursor_enabled;
instance.data.cursor_color = properties.cursor_color;
instance.data.cursor_opacity = properties.cursor_opacity;


//LEGEND PROPERTIES
instance.data.legend_enabled = properties.legend_enabled;
instance.data.legend_position = properties.legend_position;
instance.data.legend_rollover = Number(properties.legend_rollover);
  
console.log("about to check");
if (instance.data.data_select_data_source == "Bubble") {console.log("Bubble"); fn_bubble_data()};
if (instance.data.data_select_data_source == "Google Sheets") {console.log("Google"); instance.data.drawPie(seriesMap, bubble_data_obj, sheetsu_data_obj);}
  
//if (instance.data.series_2_enabled) newSeriesCount();
  
  
 
  
  
}