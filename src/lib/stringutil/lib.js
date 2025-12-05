import sexos from "$lib/stores/sexos";
export function isEmpty(str){
    return (!str || str.length === 0 );
}
export function capitalize(s) {
 return (s && String(s[0]).toUpperCase() + String(s).slice(1)) || ""
}
export function addDays(date, days) {
    var result = new Date(date);
    result.setDate(result.getDate() + days);
    return result;
}
export function randomString(len, an) {
    an = an && an.toLowerCase();
    var str = "",
        i = 0,
        min = an == "a" ? 10 : 0,
        max = an == "n" ? 10 : 62;
    for (; i++ < len;) {
        var r = Math.random() * (max - min) + min << 0;
        str += String.fromCharCode(r += r > 9 ? r < 36 ? 55 : 61 : 48);
    }
    return str;
}
export function getWholeWordButLastLetter(word){
    let newword = word.slice(0,word.length - 2)
    return newword
}
export function getSexoNombre(s){
    let sex = sexos.filter(se=>se.id == s)[0]
    if(sex){
        return sex.nombre
    }
    else{
        return ""
    }
    
}
export function shorterWord(cadena){
    let maxLongitud = 15
    let sufijo = "..."
    return cadena.length > maxLongitud 
    ? cadena.substring(0, maxLongitud) + sufijo
    : cadena;
}
export function diasEntreFechas(startDate, endDate) {
  const date1 = new Date(startDate);
  const date2 = new Date(endDate);

  const time1 = date1.getTime();
  const time2 = date2.getTime();

  const differenceInMilliseconds = Math.abs(time2 - time1); // Use Math.abs for absolute difference

  const millisecondsPerDay = 1000 * 60 * 60 * 24;
  const daysDifference = Math.round(differenceInMilliseconds / millisecondsPerDay);

  return daysDifference;
}