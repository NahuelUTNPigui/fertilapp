<script>
    import estilos from "$lib/stores/estilos";
    import * as XLSX from 'xlsx';
    import { createCaber } from '$lib/stores/cab.svelte';
    import PocketBase from 'pocketbase';
    import Swal from 'sweetalert2';
    import { onMount } from "svelte";
    import { guardarHistorial } from "$lib/historial/lib";
    import { goto } from "$app/navigation";
    import categorias from "$lib/stores/categorias";
    let {animales=$bindable([]),tactos=$bindable([])} = $props()
    let ruta = import.meta.env.VITE_RUTA
    let pre = import.meta.env.VITE_PRE
    let caber = createCaber()
    let cab = caber.cab
    

    const pb = new PocketBase(ruta);
    let filename = $state("")
    let wkbk = $state(null)
    let loading = $state(false)
    function exportarTemplate2(){
        goto(`${ruta}/Modelo tactos.xlsx`)
    }
    function exportarTemplate(){
        let csvData = [{
            fecha:"MM/DD/AAAA",
            caravana:"AAA",
            prenada:"preñada/dudosa/vacia/servicio",
            tipo:"eco/tacto",
            observacion:"",
            categoria:""
        }].map(item=>({
            FECHA: item.fecha,
            CARAVANA: item.caravana,
            PREÑADA: item.prenada,
            TIPO_TACTO: item.tipo,
            OBSERVACION: item.observacion,
            CATEGORIA:item.categoria
            
        }))
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(csvData);
        XLSX.utils.book_append_sheet(wb, ws, 'Tactos');
        
        XLSX.writeFile(wb, 'Modelo tactos.xlsx');
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

        let sheettactos = wkbk.Sheets.Tactos
        if(!sheettactos){
            Swal.fire("Error","Debe subir un archivo válido","error")
        }
        
        let tactos = []
        let tactoshashmap = {}
        loading = true
        for (const [key, value ] of Object.entries(sheettactos)) {
            const firstLetter = key.charAt(0);  // Get the first character
            const tail = key.slice(1);
            if(key == "!ref" || key == "!margins" || tail == "1"){
                continue
            }
            if(tactoshashmap[tail]){
                if(firstLetter=="A"){
                    tactoshashmap[tail].fecha = value.w?new Date(value.w):""
                }
                if(firstLetter=="B"){
                    tactoshashmap[tail].caravana = value.v
                }
                if(firstLetter=="C"){
                    let estado = value.v.toLocaleLowerCase()
                    if (estado == "preñada"){
                        tactoshashmap[tail].prenada = 2
                    }
                    else if(estado == "dudosa"){
                        tactoshashmap[tail].prenada = 1
                    }
                    else if(estado == "servicio"){
                        tactoshashmap[tail].prenada = 3
                    }
                    else{
                        tactoshashmap[tail].prenada = 0
                    }
                }
                if(firstLetter=="D"){
                    tactoshashmap[tail].tipo = value.v.toLowerCase()
                }
                if(firstLetter=="E"){
                    tactoshashmap[tail].observacion = value.v
                }
                if(firstLetter=="F"){
                    tactoshashmap[tail].categoria = value.v
                }
                
            }
            else{
                tactoshashmap[tail]={
                    fecha:"", observacion:"", caravana:"", categoria:"", prenada:"", tipo:"", nombreveterinario:""
                }
                if(firstLetter=="A"){
                    tactoshashmap[tail].fecha = value.w?new Date(value.w):""
                }
                
                if(firstLetter=="B"){
                    tactoshashmap[tail].caravana = value.v
                }
                
                if(firstLetter=="C"){
                    let estado = value.v.toLocaleLowerCase()
                    if (estado == "preñada"){
                        tactoshashmap[tail].prenada = 2
                    }
                    else if(estado == "dudosa"){
                        tactoshashmap[tail].prenada = 1
                    }
                    else if(estado == "servicio"){
                        tactoshashmap[tail].prenada = 3
                    }
                    else{
                        tactoshashmap[tail].prenada = 0
                    }
                }
                if(firstLetter=="D"){
                    tactoshashmap[tail].tipo = value.v.toLowerCase()
                }
                if(firstLetter=="E"){
                    tactoshashmap[tail].observacion = value.v
                }
                if(firstLetter=="F"){
                    tactoshashmap[tail].categoria = value.v
                }
                
            }
        }
        for (const [key, value ] of Object.entries(tactoshashmap)) {
            if(value.caravana != "" && value.fecha != "" && value.tipo != ""){
                tactos.push(value)
            }
            
        }
        let errores = false
        for(let i = 0;i<tactos.length;i++){
            let ta = tactos[i]
            //let categoria = categorias.filter(c=>c.id==an.categoria || c.nombre==an.categoria)[0]
            let ans = animales.filter(a=>a.caravana==ta.caravana)
            if(ans.length == 0){
                continue
            }
            let an = ans[0]
            if(an.sexo == "M"){
                continue
            }
            let dataadd = {
                fecha: "",
                active: true,
                observacion: ta.observacion,
                animal: an.id,
                categoria: an.categoria,
                prenada: ta.prenada,
                tipo: ta.tipo,
                cab: cab.id
            }

            let datamod = {
                observacion: ta.observacion,
                prenada: ta.prenada,
                tipo: ta.tipo,   
            }
            
            try{
                let tidx = tactos.filter(t=>t.fecha == fecha && animal==an.id  )
                if(tidx == -1){
                    await pb.collection('tactos').create(dataadd);
                }
                else{
                    await pb.collection('tactos').update(tactos[tidx].id, datamod);         
                }
            }
            catch(err){
                console.error(err)
                errores = true
                continue
            }
            
            
        }
        if(errores){
            Swal.fire("Error importar","Hubo algún tacto con error","error")
        }
        else{
            Swal.fire("Éxito importar","Se lograron importar los datos","success")
        }
        filename = ""
        wkbk = null
        loading = false
        tactos = await pb.collection('tactos').getFullList({
            filter:`active = true && cab ='${cab.id}'`
        })
    }
</script>
<div class="space-y-4 grid grid-cols-1 flex justify-center">
    <a
        class={`
            w-full text-center
            ${estilos.basico} ${estilos.grande} ${estilos.secundario}
        `}
        href={`${pre}/Importar tactos.xlsx`}
        download="/Importar tactos.xlsx"
        
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
            id="tactos-upload"
            onchange={(e)=>importarArchivo(e)}
        />
        <label
              for="tactos-upload"
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
