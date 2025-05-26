<script>
    import estilos from "$lib/stores/estilos";
    import * as XLSX from 'xlsx';
    import { createCaber } from '$lib/stores/cab.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from "svelte";
    import cuentas from '$lib/stores/cuentas';
    import categorias from "$lib/stores/categorias";
    import{verificarNivelCantidad} from "$lib/permisosutil/lib"
    import { goto } from "$app/navigation";
    let {
        animales=$bindable([]),
        animalesusuario=$bindable(0),
        getAnimalesUser,
        lotes =$bindable([]),
        rodeos = $bindable([]),
        nacimientos = $bindable([])
    } = $props()
    let ruta = import.meta.env.VITE_RUTA
    let pre = import.meta.env.VITE_PRE
    let caber = createCaber()
    let cab = caber.cab
    let usuarioid = $state("")
    let loading = $state(false)

    const pb = new PocketBase(ruta);
    let filename = $state("")
    let wkbk = $state(null)
    function exportarTemplate2(){
        goto(`${ruta}/Modelo nacimientos.xlsx`)
    }
    function exportarTemplate(){
        let csvData = [{
            caravana:"AAA",
            peso:"0",
            sexo:"H/M",
            rodeo:"",
            lote:"",
            fechanacimiento:"MM/DD/AAAA",
            nombremadre:"",
            nombrepadre:"",
            observaciones:"",
            categoria:""
        }].map(item=>({
            CARAVANA: item.caravana,
            PESO: item.peso,
            SEXO: item.sexo,
            RODEO: item.rodeo,
            LOTE: item.lote,
            FECHANACIMIENTO: item.fechanacimiento,
            CARAVANA_MADRE: item.nombremadre,
            CARAVANA_PADRE: item.nombrepadre,
            OBSERVACIONES:item.observaciones,
            CATEGORIA:item.categoria
        }))
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.json_to_sheet(csvData);
        XLSX.utils.book_append_sheet(wb, ws, 'Animales');
        
        XLSX.writeFile(wb, 'Modelo nacimientos.xlsx');
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

        let sheetanimales = wkbk.Sheets.Animales
        if(!sheetanimales){
            Swal.fire("Error","Debe subir un archivo válido","error")
        }
        let user = await pb.collection("users").getOne(usuarioid)
        
        let nivel  = cuentas.filter(c=>c.nivel == user.nivel)[0]
        let nacimientosimportar = []
        let animaleshashmap = {}
        loading = true
        for (const [key, value ] of Object.entries(sheetanimales)) {
            const firstLetter = key.charAt(0);  // Get the first character
            const tail = key.slice(1);
            if(key == "!ref" || key == "!margins" || tail == "1"){
                continue
            }
            if(animaleshashmap[tail]){
                if(firstLetter=="A"){
                    animaleshashmap[tail].caravana = value.v
                }
                if(firstLetter=="B"){
                    animaleshashmap[tail].peso = value.v
                }
                if(firstLetter=="C"){
                    animaleshashmap[tail].sexo = value.v
                }
                if(firstLetter=="D"){
                    animaleshashmap[tail].rodeo = value.v
                }
                if(firstLetter=="E"){
                    animaleshashmap[tail].lote = value.v
                }
                if(firstLetter=="F"){
                    animaleshashmap[tail].fechanacimiento = value.w?new Date(value.w):""
                }
                if(firstLetter=="G"){
                    animaleshashmap[tail].nombremadre = value.v
                }
                if(firstLetter=="H"){
                    animaleshashmap[tail].nombrepadre = value.v
                }
                if(firstLetter=="I"){
                    animaleshashmap[tail].observaciones = value.v
                }
                if(firstLetter=="J"){
                    animaleshashmap[tail].categoria = value.v
                }
            }
            else{
                animaleshashmap[tail]={
                    caravana:'',peso:'',sexo:'',rodeo:'',lote:"",fechanacimiento:"",nombremadre:"",nombrepadre:"",observaciones:""
                }
                if(firstLetter=="A"){
                    animaleshashmap[tail].caravana = value.v
                }
                if(firstLetter=="B"){
                    animaleshashmap[tail].peso = value.v
                }
                if(firstLetter=="C"){
                    animaleshashmap[tail].sexo = value.v
                }
                if(firstLetter=="D"){
                    animaleshashmap[tail].rodeo = value.v
                }
                if(firstLetter=="E"){
                    animaleshashmap[tail].lote = value.v
                }
                if(firstLetter=="F"){
                    animaleshashmap[tail].fechanacimiento = value.w?new Date(value.w):""
                }
                if(firstLetter=="G"){
                    animaleshashmap[tail].nombremadre = value.v
                }
                if(firstLetter=="H"){
                    animaleshashmap[tail].nombrepadre = value.v
                }
                if(firstLetter=="I"){
                    animaleshashmap[tail].observaciones = value.v
                }          
                if(firstLetter=="J"){
                    animaleshashmap[tail].categoria = value.v
                }
            }
        }
        let nuevoanimales = 0
        let errornuevoanimales = false
        for (const [key, value ] of Object.entries(animaleshashmap)) {
            nacimientosimportar.push(value)
            let conocido = animales.filter(a=>a.caravana == value.caravana).length == 0
            if(!conocido ){
                nuevoanimales += 1
            }
        }
        let verificar = await verificarNivelCantidad(cab.id,nuevoanimales)
        if(!verificar){
            errornuevoanimales = true
            filename = ""
            loading = false
            wkbk = null
            Swal.fire("Error importar","No tienes el plan para agregar mas animales","error")
            return 
            
        }
        let errores = false
        for(let i = 0;i<nacimientosimportar.length;i++){
            let an = nacimientosimportar[i]
            let conlote = false
            let id_lote = lotes.findIndex(l=>l.nombre==an.lote)
            let id_rodeo = rodeos.findIndex(r=>r.nombre==an.rodeo)
            let id_categoria = categorias.findIndex(c=>c.id==an.categoria || c.nombre==an.categoria)
            let padre = animales.filter(p=>p.caravana==an.nombrepadre)
            let madre = animales.filter(m=>m.caravana==an.nombremadre)
            
            let s_fecha = an.fechanacimiento.toISOString().split("T")[0]+ " 03:00:00"
            if(an.nombremadre != "" && an.fechanacimiento != "" && madre.length>0){
                
                //data nacimiento cuando existe
                let datanacimiento = {
                    fecha:s_fecha,
                    madre:madre[0].id,
                    nombremadre:madre[0].caravana,
                    nombrepadre: padre.length>0?padre[0].caravana:an.nombrepadre,
                    observacion:an.observaciones,
                    cab:cab.id
                }
                if(padre.length>0){
                    datanacimiento.padre=padre[0].id
                }
                try{
                    // Me  fijo si existe el nacimiento
                    let idx_nacimiento = nacimientos.findIndex(na=>na.madre == an.madre && na.fechanacimiento == s_fecha)
                    let idnac = ""
                    if(idx_nacimiento != -1){
                        let nacimiento =  nacimientos[idx_nacimiento]
                        idnac = nacimiento.id
                        await pb.collection('nacimientos').update(idnac,datanacimiento)
                    }
                    else{
                        const recordnacimiento = await pb.collection('nacimientos').create(datanacimiento)
                        idnac = recordnacimiento.id
                    }
                    //Quiero crear un animal y asociarle un nacimiento o asociarle un nacimiento a un animal que existe
                    if (caravana != ""){
                        let dataadd = {
                            caravana:an.caravana,
                            active:true,
                            delete:false,
                            sexo:an.sexo,
                            peso:an.peso,
                            fechanacimiento: an.fechanacimiento?s_fecha:"",
                            nombremadre:madre.length>0?madre[0].caravana:an.nombremadre,
                            nombrepadre: padre.length>0?padre[0].caravana:an.nombrepadre,
                            cab:cab.id
                        }
                        if(id_lote != -1){
                            dataadd.lote = lotes[id_lote]
                        }
                        if(id_rodeo != -1){
                            dataadd.rodeo = rodeos[id_rodeo]
                        }
                        if(id_categoria !=-1){
                            dataadd.categoria = categorias[id_categoria]
                        }
                        //me fijo si existe el animal
                        let id_animal = animales.findIndex(a=>a.caravana == an.caravana)
                        if(id_animal != -1){
                            let a = animales[id_animal]
                            //como existe tan solo le asocio el nacimiento
                            await pb.collection('animales').update(a.id, {nacimiento:idnac});
                        }
                        else{
                            dataadd.nacimiento = id_nac
                            const recordanimal = await pb.collection('animales').create(dataadd);
                        }

                    }
                }
                catch(err){
                    errores = true
                }
            }
        }
        filename = ""
        loading = false
        wkbk = null
        
        Swal.fire("Éxito importar","Se lograron importar los datos","success")
        
    }
    onMount(async ()=>{
        let pb_json =  JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.record.id
    })
</script>
<div class="space-y-4 grid grid-cols-1 flex justify-center">
    <a
        class={`
            w-full
            text-center
            ${estilos.basico} ${estilos.grande} ${estilos.secundario}
        `}
        href={`${pre}/Importar nacimientos.xlsx`}
        download="Importar nacimientos.xlsx"
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
            id="nacimiento-upload"
            onchange={(e)=>importarArchivo(e)}
        />
        <label
              for="nacimiento-upload"
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
