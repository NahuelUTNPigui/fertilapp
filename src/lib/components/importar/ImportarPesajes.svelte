<script>
    import estilos from "$lib/stores/estilos";
    import * as XLSX from 'xlsx';
    import { createCaber } from '$lib/stores/cab.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from "svelte";
    let ruta = import.meta.env.VITE_RUTA
    let caber = createCaber()
    let cab = caber.cab
    

    const pb = new PocketBase(ruta);
    let filename = $state("")
    let wkbk = $state(null)
    function exportarTemplate(){
        let csvData = [{
            caravana:"AAA",
            peso:"0",
            sexo:"H/M",
            fecha:"DD/MM/AAAA"
        }].map(item=>({
            CARAVANA:item.caravana,
            PESO:item.peso,
            SEXO:item.sexo,
            FECHA:item.fecha
        }))
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(csvData);
        XLSX.utils.book_append_sheet(wb, ws, 'Pesajes');
        
        XLSX.writeFile(wb, 'Modelo pesajes.xlsx');
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

        let sheetpesajes = wkbk.Sheets.Pesajes
        if(!sheetpesajes){
            Swal.fire("Error","Debe subir un archivo válido","error")
        }
        
        let pesajes = []
        let pesajeshashmap = {}
        for (const [key, value ] of Object.entries(sheetpesajes)) {
            const firstLetter = key.charAt(0);  // Get the first character
            const tail = key.slice(1);
            if(key == "!ref" || key == "!margins" || tail == "1"){
                continue
            }
            if(pesajeshashmap[tail]){
                if(firstLetter=="A"){
                    pesajeshashmap[tail].caravana = value.v
                }
                if(firstLetter=="B"){
                    pesajeshashmap[tail].peso = value.v
                }
                if(firstLetter=="C"){
                    pesajeshashmap[tail].sexo = value.v
                }
                if(firstLetter=="D"){
                    pesajeshashmap[tail].fecha = new Date(value.w).toISOString().split("T")[0]
                }
                
            }
            else{
                pesajeshashmap[tail]={
                    caravana:'',peso:'',sexo:'',fecha:''
                }
                if(firstLetter=="A"){
                    pesajeshashmap[tail].caravana = value.v
                }
                if(firstLetter=="B"){
                    pesajeshashmap[tail].peso = value.v
                }
                if(firstLetter=="C"){
                    pesajeshashmap[tail].sexo = value.v 
                }
                if(firstLetter=="D"){
                    pesajeshashmap[tail].fecha = new Date(value.w).toISOString().split("T")[0]
                }                
            }
        }
        for (const [key, value ] of Object.entries(pesajeshashmap)) {
            pesajes.push(value)
        }
        for(let i = 0;i<pesajes.length;i++){
            let pe = pesajes[i]          

            let dataadd = {
                caravana:pe.caravana,
                active:true,
                delete:false,
                sexo:pe.sexo,
                peso:pe.peso,
                cab:cab.id,
                fecha:pe.fecha
            }

            let datamod = {
                caravana:pe.caravana,
                sexo:pe.sexo,
                peso:pe.peso,
                fecha:pe.fecha                    
            }

            try{
                const record = await pb.collection('pesajes').getFirstListItem(`
                    caravana="${an.caravana}" && cab='${cab.id}' && active = True`,
                {});
                await pb.collection('pesajes').update(record.id, datamod);

                
            }
            catch(err){
                
                await pb.collection('pesajes').create(dataadd);

            }
        }
        filename = ""
        wkbk = null
        Swal.fire("Éxito importar","Se lograron importar los datos","success")
        
    }
</script>
<div class="space-y-4 grid grid-cols-1 flex justify-center">
    <button
        class={`
            w-full
            ${estilos.basico} ${estilos.grande} ${estilos.secundario}
        `}
        onclick={exportarTemplate}
    >
       Descargar Plantilla
    </button>
    <div class={`
        w-full
        
    `}>
        <input 
            type="file"
            accept=".xlsx, .xls"  
            class="sr-only"
            id="pesaje-upload"
            onchange={(e)=>importarArchivo(e)}
        />
        <label
              for="pesaje-upload"
              class={`
                w-full flex items-center justify-center px-4 py-4 
                border border-green-300 dark:border-green-600 rounded-md shadow-sm text-lg
                font-medium text-green-700 dark:text-green-300 bg-transparent hover:bg-green-50 
                dark:hover:bg-gray-500 cursor-pointer
              `}
              
        >
              {filename ? filename : 'Seleccionar archivo'}
        </label>
    </div>
    <div class="flex justify-start">
        <button class="btn btn-success text-white" onclick={procesarArchivo} >Procesar</button>
    </div>

</div>
