import { browser } from "$app/environment";


function reescalar(objeto) {
    objeto.total = 100
    objeto.animales /= 10
    objeto.nacimientos /= 10
    objeto.servicios /= 10
    objeto.tactos /= 10
    objeto.tratamientos /= 10
    objeto.movimientos /= 10
    objeto.pesajes /= 10
    objeto.observaciones /= 10
    objeto.rodeos /= 10
    objeto.lotes /= 10
    objeto.reportes /= 10
    objeto.importar /= 10
}
//pensar estregia de ordenamiento, y si el usuario quiere mantenerlo fijo y si quiere dejar alguna arriba
//el objeto seria 
/*
    {
        total:1,
        animales : 0,
        nacimientos:0,
        ..
    }
*/
export function createNavbarProxy(navkey, defaultobj) {
    function load() {
        if (browser) {
            const data = localStorage.getItem(storageKey);
        }
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                // Combinar con valores por defecto para asegurar que tenga todos los atributos
                const mergedData = { ...defaultObj, ...parsedData };
                // Guardar la versión combinada para futuras cargas
                localStorage.setItem(storageKey, JSON.stringify(mergedData));
                return mergedData;
            } catch (e) {
                console.error("Error parseando", storageKey, e);
                localStorage.setItem(storageKey, JSON.stringify(defaultObj));
                return structuredClone(defaultObj);
            }
        }
        else {
            localStorage.setItem(storageKey, JSON.stringify(defaultObj));
            return structuredClone(defaultObj);
        }
    }
    function save(obj) {
        localStorage.setItem(storageKey, JSON.stringify(obj));
    }
    function addPunto(navkey, defaultobj, seccion) {
        if (browser) {
            const data = localStorage.getItem(storageKey);
        }
        if (data) {
            try {
                const parsedData = JSON.parse(data);
                // Combinar con valores por defecto para asegurar que tenga todos los atributos
                let mergedData = { ...defaultObj, ...parsedData };
                mergedData.total += 1
                mergedData[seccion] += 1
                if(mergedData.total == 100){
                    reescalar(mergedData)
                }
                // Guardar la versión combinada para futuras cargas
                localStorage.setItem(storageKey, JSON.stringify(mergedData));
                return mergedData;
            } catch (e) {
                console.error("Error parseando", storageKey, e);
                localStorage.setItem(storageKey, JSON.stringify(defaultObj));
                return structuredClone(defaultObj);
            }
        }
        else {
            localStorage.setItem(storageKey, JSON.stringify(defaultObj));
            return structuredClone(defaultObj);
        }
    }
    return { navkey, load, savs }
}