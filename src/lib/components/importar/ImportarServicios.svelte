<script>
    import estilos from "$lib/stores/estilos";
    import * as XLSX from 'xlsx';
    import { createCaber } from '$lib/stores/cab.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from "svelte";
    import {guardarHistorial} from "$lib/historial/lib"
    import {addDays} from "$lib/stringutil/lib"
    import categorias from "$lib/stores/categorias";
    import { goto } from "$app/navigation";
    let {
        animales=$bindable([]),
        servicios=$bindable([])
    } = $props()
    let ruta = import.meta.env.VITE_RUTA
    let pre = import.meta.env.VITE_PRE
    let caber = createCaber()
    let cab = caber.cab

    const pb = new PocketBase(ruta);
    let filename = $state("")
    let wkbk = $state(null)
    let loading = $state(false)
    function exportarTemplate2(){
        goto(`${ruta}/Modelo servicios.xlsx`)
    }
    function exportarTemplate(){
        let csvData = [{
            madre:"AAA",
            fechadesde:"MM/DD/AAAA",
            fechahasta:"MM/DD/AAAA",
            padres:"AAA,BBB,CCC",
            observacion:"",
            categoria:""

        }].map(item=>({
            MADRE:item.madre,
            FECHA_DESDE:item.fechadesde,
            FECHA_HASTA:item.fechahasta,
            PADRES:item.padres,
            OBSERVACION:item.observacion,
            CATEGORIA:item.categoria
        }))
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(csvData);
        XLSX.utils.book_append_sheet(wb, ws, 'Servicios');
        
        XLSX.writeFile(wb, 'Modelo servicios.xlsx');
    }
    function importarArchivo(event){
        let file = event.target.files[0];
        
        filename = file.name
        
        const reader = new FileReader();
        reader.onload = (e) => {
            const workbook = XLSX.read(e.target.result, { type: 'binary' });
            wkbk = workbook
            
        };
        reader.readAsBinaryString(file);
    }
    async function procesarArchivo(){
        if(filename == ""){
            Swal.fire("Error","Seleccione un archivo","error")
        }

        //Que pasa si le cambia el nombre a la pestaña
        let sheetiser = wkbk.Sheets.Servicios
        if(!sheetiser){
            Swal.fire("Error","Debe subir un archivo válido","error")
        }
        let serviciosimportar = []
        let serhash = {}
        loading = true
        let errores = false
        for (const [key, value ] of Object.entries(sheetiser)) {
            const firstLetter = key.charAt(0);  // Get the first character
            const tail = key.slice(1);
            if(key == "!ref" || key == "!margins" || tail == "1"){
                continue
            }
            if(serhash[tail]){
                //madre
                if(firstLetter=="A"){
                    serhash[tail].madre = value.v
                }
                //fecha desde
                if(firstLetter=="B"){
                    serhash[tail].fechadesde = value.w?new Date(value.w):""
                }
                //fecha hasta
                if(firstLetter=="C"){
                    serhash[tail].fechahasta = value.w?new Date(value.w):""
                }
                //padres
                if(firstLetter=="D"){
                    serhash[tail].padres = value.v
                }
                //observacion
                if(firstLetter=="E"){
                    serhash[tail].observacion = value.v
                }
                //categoria
                if(firstLetter=="F"){
                    serhash[tail].categoria = value.v
                }
            }
            else{
                serhash[tail] = {
                    madre:"",fechadesde:"",fechahasta:"",padres:"",observacion:"",categoria:""
                }
                //madre
                if(firstLetter=="A"){
                    serhash[tail].madre = value.v
                }
                //fecha desde
                if(firstLetter=="B"){   
                    serhash[tail].fechadesde = value.w?new Date(value.w):""
                }
                //fecha hasta
                if(firstLetter=="C"){
                    serhash[tail].fechahasta = value.w?new Date(value.w):""
                }
                //padres
                if(firstLetter=="D"){
                    serhash[tail].padres = value.v
                }
                //observacion
                if(firstLetter=="E"){
                    serhash[tail].observacion = value.v
                }
                //categoria
                if(firstLetter=="F"){
                    serhash[tail].categoria = value.v
                }
            }
        }
        for (const [key, value ] of Object.entries(serhash)) {
            serviciosimportar.push(value)
        }
        for(let i = 0;i<serviciosimportar.length;i++){
            let ser = serviciosimportar[i]
            let i_madre = animales.findIndex(a=>a.sexo == "H" && a.caravana == ser.madre)
            let padreslista = ser.padres.split(",")
            let padres = padreslista.map(p=>{
                let padre = ""
                for(let i=0;i<animales.length;i++){
                    if(animales[i].sexo == "M" && animales[i].caravana==p){
                        return animales[i].id
                    }
                }
                return padre
            })
            padres = padres.filter(p=>p!="")
            if(ser.madre != "" && ser.fechadesde != "" && ser.padres !="" && i_madre != -1 && padres.length > 0){
                let madre = animales[i_madre]
                let padre = padres.join()
                let s_fecha = ser.fechadesde.toISOString().split("T")[0] + " 03:00:00"
                let dataser = {
                    fechadesde : s_fecha,
                    fechaparto: addDays(ser.fechadesde.toISOString().split("T")[0],280).toISOString().split("T")[0]+" 03:00:00",
                    observacion: ser.observacion,
                    madre:madre,
                    padres:padre,
                    active:true,
                    cab:cab.id
                }
                if(ser.fechahasta != ""){
                    dataser.fechahasta = ser.fechahasta.toISOString().split("T")[0] + " 03:00:00"
                }   
                if(categoria){
                    dataser.categoria = categoria.id
                }
                try{
                    let s_idx = servicios.findIndex(serv=> serv.madre ==  madre && s_fecha == serv.fechadesde && serv.padres == padres)
                    if(s_idx == -1){
                        await pb.collection("servicios").create(dataser)
                    }
                    else{
                        await pb.collection("servicios").update(servicios[s_idx].id,dataser)
                    }
                }
                catch(err){
                    errores = true
                }
                
            }

                
        }
        filename = ""
        wkbk = null
        loading = false
        if(errores){
            Swal.fire("Error servicios","Hubo algun error en algun servico","error")
        }
        else{
            Swal.fire("Éxito servicios","Se lograron registrar todos los servicios","success")
        }
    }
</script>
<div class="space-y-4 grid grid-cols-1 flex justify-center">
    <a
        class={`
            w-full
            ${estilos.basico} ${estilos.grande} ${estilos.secundario}
        `}
        href={`${pre}/Importar servicios.xlsx`}
        download="Importar servicios.xlsx"
    >
        Descargar Plantilla
    </a>
    <div class={`
        w-full
        
    `}>
        <input 
            type="file"
            accept=".xlsx, .xls"  
            class="sr-only"
            id="inseminacion-upload"
            onchange={(e)=>importarArchivo(e)}
        />
        <label
            for="inseminacion-upload"
            class={`
                w-full flex items-center justify-center px-4 py-4 
                border border-green-300 dark:border-green-600 rounded-md shadow-sm text-lg
                font-medium text-green-700 dark:text-green-300 bg-transparent hover:bg-green-50 
                dark:hover:bg-gray-500 cursor-pointer
            `}
            
        >
        {#if loading}
            <span class="loading loading-spinner loading-xl"></span>
        {:else}
            {filename ? filename : 'Seleccionar archivo'}
        {/if}
        </label>
    </div>
    <div class="flex justify-start">
        <button class="btn btn-success text-white" onclick={procesarArchivo} >Procesar</button>
    </div>
</div>