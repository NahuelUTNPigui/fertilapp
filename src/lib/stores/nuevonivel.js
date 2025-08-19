import { browser } from "$app/environment"
let defaultnuevonivel = {
    nivel:0
}
export const nuevonivel = {
    get nuevonivelstate(){

        if(browser){
            return JSON.parse(localStorage.getItem("nuevonivel"))||defaultper
        }
        else{
            return defaultnuevonivel
        }
        
    },
    setNivel(nivel){
        if(browser){
            let nuevonivel = {
                nivel
            }
            localStorage.setItem("nuevonivel",JSON.stringify(nuevonivel))
        }
    }
}