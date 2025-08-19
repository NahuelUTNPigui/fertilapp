import { getDolarPrice } from "./dolar"
let dolarstate = $state({
    precio:0.0
})
export const dolar = {
    get dolarstate(){
        return dolarstate
    },
    setDolar(precio){
        dolarstate={precio}
    },
    async updateDolar(){
        let precio = await getDolarPrice()
        dolarstate = {
            precio
        }
    }
}

