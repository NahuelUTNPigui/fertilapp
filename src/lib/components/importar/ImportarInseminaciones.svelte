<script>
    import estilos from "$lib/stores/estilos";
    import * as XLSX from 'xlsx';
    import { createCaber } from '$lib/stores/cab.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from "svelte";
    import {guardarHistorial} from "$lib/historial/lib"
    import {addDays} from "$lib/stringutil/lib"
    import { goto } from "$app/navigation";
    let {animales = $bindable([]),inseminaciones = $bindable([])} = $props()
    let ruta = import.meta.env.VITE_RUTA
    let pre = import.meta.env.VITE_PRE
    let caber = createCaber()
    let cab = caber.cab


    const pb = new PocketBase(ruta);
    let filename = $state("")
    let wkbk = $state(null)
    let loading = $state(false)

    function exportarTemplate2(){
        goto(`${ruta}/Modelo inseminaciones.xlsx`)
    }
    function exportarTemplate(){
        let csvData = [{
            madre:"AAA",
            pajuela:"AAA",
            fecha:"MM/DD/AAAA",
            observacion:""

        }].map(item=>({
            MADRE:item.madre,
            PAJUELA:item.pajuela,
            FECHA:item.fecha,
            OBSERVACION:item.observacion
        }))
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(csvData);
        XLSX.utils.book_append_sheet(wb, ws, 'Inseminaciones');
        
        XLSX.writeFile(wb, 'Modelo inseminaciones.xlsx');
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

        let sheetins = wkbk.Sheets.Inseminaciones
        if(!sheetins){
            Swal.fire("Error","Debe subir un archivo válido","error")
        }
        let inseminacionesimportar = []
        let inshash = {}
        loading = true
        for (const [key, value ] of Object.entries(sheetins)) {
            const firstLetter = key.charAt(0);  // Get the first character
            const tail = key.slice(1);
            if(key == "!ref" || key == "!margins" || tail == "1"){
                continue
            }
            if(inshash[tail]){
                if(firstLetter=="A"){
                    inshash[tail].madre = value.v
                }
                if(firstLetter=="B"){
                    inshash[tail].pajuela = value.v
                }
                if(firstLetter=="C"){
                    inshash[tail].fecha = value.w?new Date(value.w):""
                }
                if(firstLetter=="D"){
                    inshash[tail].observacion = value.v
                }
            }
            else{
                inshash[tail] = {
                    madre:"",pajuela:"",fecha:"",observacion:""
                }
                if(firstLetter=="A"){
                    inshash[tail].madre = value.v
                }
                if(firstLetter=="B"){
                    inshash[tail].pajuela = value.v
                }
                if(firstLetter=="C"){
                    inshash[tail].fecha = value.w?new Date(value.w):""
                }
                if(firstLetter=="D"){
                    inshash[tail].observacion = value.v
                }
            }
        }
        for (const [key, value ] of Object.entries(inshash)) {
            inseminacionesimportar.push(value)
        }
        errores = false
        for(let i = 0;i<inseminacionesimportar.length;i++){
            let ins = inseminacionesimportar[i]
            let m_idx = animales.findIndex(m=>m.caravana == ins.madre)
            if(ins.madre != "" && ins.fecha != "" && ins.pajuela !="" && m_idx != -1){
                let madre = animales[m_idx]
                let s_fecha =ins.fecha.toISOString().split("T")[0]+" 03:00:00"
                let i_idx = inseminaciones.findIndex(inseminacion => inseminacion.madre == madre.caravana && inseminacion.pajuela == ins.pajuela && ins.fecha == s_fecha)
                let p_idx = animales.findIndex(p=>p.caravana == ins.pajuela)
                let padre = {id:"",pajuela:ins.pajuela}
                if(p_idx =! -1){
                    padre.id = animales[p_idx].id
                }
                let datains = {
                    animal:madre.id,
                    categoria:madre.categoria,
                    pajuela:ins.pajuela,
                    padre:padre.id,
                    fechaparto:addDays(ins.fecha,280).toISOString().split("T")[0]+" 03:00:00",
                    fechainseminacion:s_fecha,
                    active:true,
                    cab:cab.id,
                    observacion:ins.observacion
                }
                try{
                    if(i_idx != -1){
                        await pb.collection("inseminacion").create(datains)
                    }
                    else{
                        await pb.collection("inseminacion").update(inseminaciones[i_idx],datains)
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
            Swal.fire("Error importar","Hubo alguna inseminación con errores ","error")
        }
        else{
            Swal.fire("Éxito importar","Se lograron importar los datos","success")
        }
        
    }

</script>
<div class="space-y-4 grid grid-cols-1 flex justify-center">
    <a
        class={`
            w-full
            text-center
            ${estilos.basico} ${estilos.grande} ${estilos.secundario}
        `}
        href={`${pre}/Importar inseminaciones.xlsx`}
        download="Importar inseminaciones.xlsx"
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