function(instance, properties, context) {
 

  //DEFINE SOME VARIABLES
  
  var drawn_value;
  var settings = [];
  var data_values = [];
  var data_category = [];
  var data_hex = [];
  var data_json;
  //var data_length;
  var google_data;
  var chart_data;
  var test_data;
  var publicSpreadsheetUrl;
  var data_title;
  var data_value;
  var bubble_data_obj = [], categoryCountData = [];
  var rollType;
  
  
  
  
  //DEFINE SOME FUNCTIONS
  

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
  
  function indexesOf(arr, target) {
    return arr.map(function (el, i) { return (el === target) ? i : null; })
              .filter(function (x) { return x !== null; });
  }

  function rollUp() {
    var len = data_category.length;
    var num = data_values.length;
    var sum;
    var average;
    var currentValue;
    var oldValue;
    var newValue;
    var listValues = [];

    //look for and rollup any repeated data
    for (var i=0;i<len;i++) {
      sum=0;

      var positions = indexesOf(data_category, data_category[i]);
      if (positions.length > 1) {
        for (var x=0;x<positions.length;x++) {
          newValue = data_values[positions[x]] + sum;
          sum = newValue;
          listValues[x] = data_values[positions[x]];
        }
        for (var x=positions.length -1; x > 0; x--) {
          data_category.splice(positions[x], 1);
          data_values.splice(positions[x], 1);
          if (instance.data.data_time_rollup != null ) timeRollup.splice(positions[x], 1);
        }
       if (rollType=="Average") {
         average = sum/positions.length;
         average = average.toFixed(2);
         data_values[positions[0]] = average;
       }

       if (rollType=="Sum") {
         data_values[positions[0]] = sum;
      }

       if (rollType=="Maximum") {
         data_values[positions[0]] = mymax(listValues);
         listValues = [];
       }

       if (rollType=="Minimum") {
         data_values[positions[0]] = mymin(listValues);
         listValues = [];
       }

      len = data_category.length;
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

  function arr_diff (a1, a2) {

      var a = [], diff = [];

      for (var i = 0; i < a1.length; i++) {
          a[a1[i]] = true;
      }

      for (var i = 0; i < a2.length; i++) {
          if (a[a2[i]]) {
              delete a[a2[i]];
          } else {
              a[a2[i]] = true;
          }
      }

      for (var k in a) {
          diff.push(k);
      }

      return diff;
  }

  function fixArrays() {
    var list = [];
        for (var j = 0; j < data_values.length; j++) 
            list.push({'category': data_category[j], 'value': data_values[j]});

          list = list.sort(function(a, b){
    var nA = a.category.toLowerCase();
    var nB = b.category.toLowerCase();

    if(nA < nB)
      return -1;
    else if(nA > nB)
      return 1;
   return 0;
  });

    for (var k = 0; k < list.length; k++) {

            data_values[k] = list[k].value;
            data_category[k] = list[k].category;         
        }
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


    //fetch Bubble internal database data from Element fields
      if (instance.data.category_count) {
        instance.data.bubble_data_length = properties.data_source_bubble_category.length();
        var category = properties.data_source_bubble_category.get(0,instance.data.bubble_data_length);
        categoryCountData = categoryCount(category);
        data_category = categoryCountData[0];
        data_values = categoryCountData[1];
      }

      else {
        instance.data.bubble_data_length = properties.data_source_bubble_value.length();
        data_values = properties.data_source_bubble_value.get(0,instance.data.bubble_data_length);
        data_category = properties.data_source_bubble_category.get(0,instance.data.bubble_data_length);
      }

      if (properties.color_hex_bubble != null) data_hex = fillArray(properties.color_hex_bubble.get(0,instance.data.bubble_data_length),data_category);
      rollType = "Sum";

      if (properties.data_merge_enabled) {
       rollUp();
       }


      //create object that merges Bubble data arrays together into single object

      function add(category, value, color) {
        var obj_category = instance.data.data_category_header;
        var obj_value = instance.data.data_values_header;
        var obj_hex = "color";
        var newDataLine = {[obj_category] : category, [obj_value] : value};
        if (properties.color_hex_bubble != null) newDataLine.color = color;
        bubble_data_obj.push(newDataLine);
      }

      for (i=0; i<data_category.length; i++) {
          add(data_category[i], data_values[i], data_hex[i]);
      }

  }

 
  
  //INIT CODE
  
  try {
    var test = properties.data_source_bubble_category.get(0,properties.data_source_bubble_category.length());
  }
  catch(err) {
    return;
  }    
  
  
  
  
  
  
//populate user field choices into Settings array
instance.data.data_source_select = properties.data_source_select;
instance.data.data_source_bubble_category = properties.data_source_bubble_category;
instance.data.data_source_bubble_value = properties.data_source_bubble_value;
instance.data.category_count = properties.category_count;
instance.data.data_source_google_url = properties.data_source_google_url;
instance.data.data_source_is_google_spreadsheet_sheet = properties.data_source_is_google_spreadsheet_sheet;
instance.data.data_source_is_google_spreadsheet_key = properties.data_source_is_google_spreadsheet_key; 
instance.data.data_category_header = properties.data_category_header;
instance.data.data_values_header = properties.data_values_header;
instance.data.data_decimal_places = properties.data_decimal_places;
instance.data.data_export_toggle = properties.data_export_toggle;
instance.data.label_outer_toggle = properties.label_outer_toggle;
instance.data.label_outer_distance = Number(properties.label_outer_distance);
instance.data.label_balloon_toggle = properties.label_balloon_toggle;
instance.data.colour_theme = properties.colour_theme;
instance.data.styling_donut_radius = properties.styling_donut_radius;
instance.data.styling_3d_depth = Number(properties.styling_3d_depth);
instance.data.styling_chart_angle = Number(properties.styling_chart_angle);
instance.data.styling_animation_type = properties.styling_animation_type;
instance.data.styling_animation_duration = Number(properties.styling_animation_duration);
instance.data.styling_animation_sequence = properties.styling_animation_sequence;
instance.data.styling_pulloutanimation_radius = properties.styling_pulloutanimation_radius;
instance.data.label_color = properties.label_color;


//LEGEND PROPERTIES
instance.data.legend_enabled = properties.legend_enabled;
instance.data.legend_position = properties.legend_position;

  
if (instance.data.data_source_select == "Google Sheets") {
   instance.data.color_hex_header = properties.color_hex_google;
}
  
if (instance.data.data_source_select == "Bubble") {
  if  (properties.color_hex_bubble!=null) {
    instance.data.color_hex_header = "color"; }
  else {
    instance.data.color_hex_header = null;
  }
}

//if (instance.data.color_hex_toggle == true) {instance.data.color_hex_value = "color"} else {instance.data.color_hex_value = null};
if (instance.data.styling_animation_type == "none") {
  instance.data.styling_animation_duration = 0;
  instance.data.styling_animation_type = "bounce";
}
  
if (instance.data.data_source_select == "Bubble") { 
  fn_bubble_data();
  instance.data.drawPie(settings, bubble_data_obj);  
} else if (instance.data.data_source_select == "Google Sheets") {
  console.log("off to draw chart");
  instance.data.drawPie(settings, bubble_data_obj);  
}
    
   


  
}