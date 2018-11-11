function(instance, properties, context) {


function pad(value) {
    return value < 10 ? '0' + value : value;
}
function createOffset(date) {
    var sign = (date.getTimezoneOffset() > 0) ? "-" : "+";
    var offset = Math.abs(date.getTimezoneOffset());
    var hours = pad(Math.floor(offset / 60));
    return Number(sign+hours);
}
  
instance.publishState('offset',createOffset(properties.date));


}