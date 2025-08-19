const RUTADOLAR = "https://api.bluelytics.com.ar/v2/latest"
export async function getDolarPrice(){
    let res = await fetch(RUTADOLAR)
    let data = await res.json()
    return data.oficial.value_avg
}