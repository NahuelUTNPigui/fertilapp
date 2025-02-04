<script>
    import { goto } from "$app/navigation";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import estilos from '$lib/stores/estilos';
    import estados from "$lib/stores/estados";
    import { createCaber } from '$lib/stores/cab.svelte';
    import categorias from "$lib/stores/categorias";
    import sexos from "$lib/stores/sexos";
    import {capitalize} from "$lib/stringutil/lib"
    import {guardarHistorial} from "$lib/historial/lib"
    import { isEmpty } from "$lib/stringutil/lib";
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    
    //lista testear
    let valor = $state("")
    let lista = [
        {id:1,nombre:"a"},
        {id:2,nombre:"b"},
        {id:3,nombre:"d"},
        {id:4,nombre:"c"},
    ]
    let etiqueta = $state("Test")
    //fin test

    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let caber = createCaber()
    let cab = caber.cab
    //Datos animales
    let animales = $state([])
    let animalesrows = $state([])
    let madres = $state([])
    let padres = $state([])
    //Filtros
    let buscar = $state("")
    let lote = $state("")
    let rodeo = $state("")
    let categoria = $state("")
    let sexo = $state("H")
    let estado = $state("")

    let lotes = $state([])
    let rodeos = $state([])
    let isOpenFilter = $state(false)

    //Seleccionados
    let selectanimales = $state([])
    let selecthashmap = $state({})
    let todos = $state(false)
    let algunos = $state(false)
    let ninguno = $state(true)

    //Datos inseminacion
    let fechainseminacion = $state("")
    let fechaparto = $state("")
    let pajuela = $state("")
    let padre = $state("")
    //validacion
    let malfecha = $state(false)
    let malpadre = $state(false)
    let botonhabilitado = $state(false)

    function clickFilter(){
        isOpenFilter = !isOpenFilter
    }

    function filterUpdate(){
        //Cuando filtro debo reiniciar la seleccion?
        selectanimales = []
        let lista = []
        for (const [key, value ] of Object.entries(selecthashmap)) {
            lista.push(key)
        }
        for(let i = 0;i<lista.length;i++){
            selecthashmap[lista[i]] = null
        }
        algunos = false
        todos = false
        ninguno = true
        animalesrows = madres
        if(buscar != ""){
            animalesrows = animalesrows.filter(a=>a.caravana.toLocaleLowerCase().includes(buscar.toLocaleLowerCase()))
        }
        if(sexo != ""){
            animalesrows = animalesrows.filter(a=>a.sexo == sexo)
        }
        if(rodeo != ""){
            animalesrows = animalesrows.filter(a=>a.rodeo == rodeo)
        }
        if(lote != ""){
            animalesrows = animalesrows.filter(a=>a.lote == lote)
        }
        if(categoria != ""){
            animalesrows = animalesrows.filter(a=>a.categoria == categoria)
        }
        if(estado != ""){
            animalesrows = animalesrows.filter(a=>a.prenada == estado)
        }

    }
    function ordenarNombre(lista){
        lista.sort((r1,r2)=>r1.nombre.toLocaleLowerCase()>r2.nombre.toLocaleLowerCase()?1:-1)
    }

    function clickAnimal(id){
        if(selecthashmap[id]){
            if(todos){
                todos = false
                algunos = true
            }
            selecthashmap[id] = null
        }
        else{
            if(ninguno){
                algunos = true
                ninguno =  false
            }
            let a = animalesrows.filter(an=>an.id==id)[0]
            selecthashmap[id] = {
                ...a,
                pajuela :"",
                padre:""
            }
        }
    }
    function clickTodos(){
        if(todos){
            todos = false
            ninguno = true
            algunos = false
            selecthashmap = {}
        }
        else if(ninguno){
            ninguno = false
            todos = true
            for(let i = 0;i<animalesrows.length;i++){
                let a = animalesrows[i]
                selecthashmap[animalesrows[i].id] = {
                    ...a,
                    pajuela :"",
                    padre:""
                }
            }
        }
        else if (algunos){
            selecthashmap = {}
            algunos = false
            todos = false
            ninguno = true
        }
        
    }
    async function getLotes(){
        const records = await pb.collection('lotes').getFullList({
            filter:`active = true && cab ~ '${cab.id}'`,
            sort: 'nombre',
        });
        lotes = records
        ordenarNombre(lotes)
    }
    async function getRodeos(){
        const records = await pb.collection('rodeos').getFullList({
            filter:`active = true && cab ~ '${cab.id}'`,
            sort: 'nombre',
        });
        rodeos = records
        //ordenarNombre(rodeos)
    }
    async function getAnimales(){
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && delete=false && cab='${cab.id}'`,
            expand:"rodeo,lote"
        })
        
        animales = recordsa
        animales.sort((a1,a2)=>a1.caravana>a2.caravana?1:-1)
        madres = animales.filter(a=>a.sexo == "H")
        padres = animales.filter(a=>a.sexo == "M")
        animalesrows = madres
    }
    function openNewModal(){
        if(ninguno){
            Swal.fire("Error inseminación","No hay animales seleccionados","error")
            return
        }
        selectanimales = []
        for (const [key, value ] of Object.entries(selecthashmap)) {
            
            selectanimales.push({
                ...value,
                padre:"",
                pajuela:""})
        }
        inseminacionMasiva.showModal()
    }
    function getEstadoName(est) {
        let estado = estados.filter(e=>e.id==est)[0]
        return estado.nombre
    }
    async function crearInseminacion() {
        if(fechainseminacion == ""){
            Swal.fire("Error inseminaciones","Debe seleccionar una fecha","error")
            return 
        }
        let errores = false
        for(let i = 0;i<selectanimales.length;i++){
            let inseminacion = selectanimales[i]
            let data = {
                cab:cab.id,
                animal: inseminacion.id,
                fechaparto: fechaparto +' 03:00:00',
                fechainseminacion: fechainseminacion + ' 03:00:00',
                active:true,
                padre:inseminacion.padre,
                pajuela:inseminacion.pajuela,
                categoria:inseminacion.categoria
            }
            try{
                const record = await pb.collection('inseminacion').create(data);
            }catch(err){
                console.error(err)
            }
        }
        if(errores){
            Swal.fire("Error inseminaciones","Hubo algun error en alguna inseminación","error")
        }
        else{
            Swal.fire("Éxito inseminaciones","Se lograron registrar todas las inseminaciones","success")
        }
        fechainseminacion = ""
        fechaparto = ""
        pajuela = ""
        padre = ""
        botonhabilitado = false
        malfecha = false
        malpadre = false
        selecthashmap = {}
        selectanimales = []

    }
    function getNombrePadre(){
        let p = padres.filter(item=>item.id == padre)[0]
        padre = p.id
        pajuela = p.caravana
        for(let i = 0;i<selectanimales.length;i++){
            selectanimales[i].padre = padre
        }
        onInput("PAJUELA")

    }
    function addDays(date, days) {
        var result = new Date(date);
        result.setDate(result.getDate() + days);
        return result;
    }
    function validarBoton(){
        botonhabilitado = true
        if(isEmpty(fechainseminacion)){
            botonhabilitado = false
        }
        if(isEmpty(pajuela)){
            botonhabilitado = false
            
        }
    }
    function onInput(campo){
        validarBoton()
        if(campo=="FECHA"){
            if(isEmpty(fechainseminacion)){
                malfecha = true
            }
            else{
                malfecha = false
                fechaparto = addDays(fechainseminacion, 280).toISOString().split("T")[0]
            }
        }
        if(campo=="PAJUELA"){
            if(isEmpty(pajuela)){
                malpadre = true
            }
            else{
                malfecha = false
                for(let i = 0;i<selectanimales.length;i++){
                    selectanimales[i].pajuela = pajuela
                }
            }
        }
    }
    onMount(async ()=>{
        await getAnimales()
        await getRodeos()
        await getLotes()
        
    })

</script>
<Navbarr>
    <!--<PredictSelect bind:valor={valor} lista={lista} etiqueta = {etiqueta}></PredictSelect>
    <span>{valor}</span>-->
    <div class="grid grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div>
            <h1 class="text-2xl">Inseminaciones</h1>
        </div>
        <div class="flex col-span-2 gap-1 justify-end">
            <button class={`btn btn-primary rounded-lg ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                <span  class="text-xl">{capitalize("nuevo")}</span>
            </button>
            <button
                onclick={()=>goto("/tactos/cab")}
                class={`
                    bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                    ${estilos.btnsecondary}
                    rounded-full
                    px-4 pt-2 pb-3
                `} 
                aria-label="volver"
            >
            <span  class="text-xl font-semibold ">Volver</span>
                
            </button>
        </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2  m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10" >
        <div class="w-11/12">
            <label class={`input input-bordered flex items-center gap-2 ${estilos.bgdark2}`}>
                <input type="text" class="grow" placeholder="Buscar..." bind:value={buscar} oninput={filterUpdate} />
            </label>
        </div>
    </div>
    <div class="w-11/12 m-1 mb-2 lg:mx-10 rounded-lg bg-transparent">
        <button 
            aria-label="Filtrar" 
            class="w-full"
            onclick={clickFilter}
        >
            <div class="flex justify-between items-center px-1">
                <h1 class="font-semibold text-lg py-2">Filtros</h1>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class={`h-5 w-5 transition-all duration-300 ${isOpenFilter? 'transform rotate-180':''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div> 
        </button>
        {#if isOpenFilter}
        <div transition:slide class="grid grid-cols-2 lg:grid-cols-4  m-1 gap-2 w-11/12" >
            <div>
                <label for = "rodeos" class="label">
                    <span class="label-text text-base">Rodeos</span>
                </label>
                <label class="input-group ">
                    <select 
                        class={`
                            select select-bordered w-full
                            rounded-md
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2}
                        `} 
                        bind:value={rodeo}
                        onchange={filterUpdate}
                    >
                            <option value="">Todos</option>
                            {#each rodeos as r}
                                <option value={r.id}>{r.nombre}</option>    
                            {/each}
                    </select>
                </label>
            </div>
            <div>
                <label for = "lotes" class="label">
                    <span class="label-text text-base">Lotes</span>
                </label>
                <label class="input-group ">
                    <select 
                        class={`
                            select select-bordered w-full
                            rounded-md
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2}
                        `} 
                        bind:value={lote}
                        onchange={filterUpdate}
                    >
                            <option value="">Todos</option>
                            {#each lotes as r}
                                <option value={r.id}>{r.nombre}</option>    
                            {/each}
                    </select>
                </label>
            </div>
            <div>
                <label for = "categorias" class="label">
                    <span class="label-text text-base">Categorias</span>
                </label>
                <label class="input-group ">
                    <select 
                        class={`
                            select select-bordered w-full
                            rounded-md
                            focus:outline-none 
                            focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2}
                        `} 
                        bind:value={categoria}
                        onchange={filterUpdate}
                    >
                            <option value="">Todos</option>
                            {#each categorias as r}
                                <option value={r.id}>{r.nombre}</option>    
                            {/each}
                    </select>
                </label>
            </div>
        </div>
        {/if}
    </div>
    <div class="w-full grid justify-items-center mx-1  lg:w-3/4 overflow-x-auto">
        <table class="table table-lg w-full " >
            <thead>
                <tr>
                    <th class="">
                        <button    
                            aria-label="Todos"
                            onclick={clickTodos}
                            class={`
                                text-base bg-transparent rounded-lg
                                px-3 py-3 text-base
                                ${estilos.secundario}
                            `}
                        >
                            {#if todos}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {/if}
                            {#if ninguno}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {/if}
                            {#if algunos}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>      
                            {/if}                        
                          
                        </button>
                    </th>
                    <th class="text-base ">Caravana</th>
                    <th class="text-base ">Estado</th>
                    <th class="text-base">Categoria</th>
                    <th class="text-base">Peso</th>
                    <th class="text-base">Rodeo</th>
                    <th class="text-base">Lote</th>
                    
                </tr>
            </thead>
            <tbody>
                {#each animalesrows as a}
                <tr>
                    <td class="">
                        <button
                            aria-label="fila"
                            onclick={()=>clickAnimal(a.id)}
                            class={`
                                font-medium bg-transparent rounded-lg
                                px-3 py-3 text-base
                                ${selecthashmap[a.id]?estilos.danger:estilos.primario}
                            `}
                        >
                            {#if selecthashmap[a.id]}
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>                                  
                            {:else}             
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                </svg>
                            {/if}
                        </button>
                    </td>
                    <td class="text-base">{a.caravana}</td>
                    <td class="text-base">{getEstadoName(a.prenada)}</td>
                    <td class="text-base">{a.categoria}</td>
                    <td class="text-base">{a.peso}</td>
                    <td class="text-base">{a.expand?.rodeo?.nombre||''}</td>
                    <td class="text-base">{a.expand?.lote?.nombre||''}</td>
                    
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
</Navbarr>
<dialog id="inseminacionMasiva" class="modal modal-middle rounded-xl">
    <div 
        class="
            modal-box w-11/12 max-w-6xl
            bg-gradient-to-br from-white to-gray-100 
            dark:from-gray-900 dark:to-gray-800
            "
    >
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
        </form>
        <h3 class="text-lg font-bold">Tactos múltiples</h3>
        <div class="grid grid-cols-2 gap-1">
            <div>
                <label for = "fechatacto" class="label">
                    <span class="label-text text-base">Fecha </span>
                </label>
                <label class="input-group ">
                    <input id ="fechatacto" type="date" max={HOY}  
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={fechainseminacion}
                        onchange={()=>onInput("FECHA")}
                    />
                    {#if malfecha}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe seleccionar la fecha del tacto</span>                    
                        </div>
                    {/if}
                </label>
            </div>
            <div>
                <label for = "fechatacto" class="label">
                    <span class="label-text text-base">Fecha </span>
                </label>
                <label class="input-group ">
                    <input id ="fechatacto" type="date" max={HOY}  
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        disabled
                        bind:value={fechaparto}
                        
                    />
                </label>
            </div>
            <div>
                <label for = "nombrepadre" class="label">
                    <span class="label-text text-base">Pajuela</span>
                </label>
                <label class="input-group">
                    <input 
                        id ="nombrepadre" 
                        type="text"  
                        class={`
                            input 
                            input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none 
                            focus:ring-2 focus:ring-green-500 
                            focus:border-green-500
                            w-full 
                            ${estilos.bgdark2} 
                        `}
                        bind:value={pajuela}
                        oninput={()=>onInput("PAJUELA")}
                    />
                    {#if malpadre}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe escribir el nombre del padre</span>                    
                        </div>
                    {/if}
                </label>
            </div>
            <div>
                <label for = "padre" class="label">
                    <span class="label-text text-base">Padre</span>
                </label>
                <label class="input-group ">
                    <select 
                        class={`
                            select select-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={padre}
                        onchange={getNombrePadre}
                    >
                        {#each padres as p}
                            <option value={p.id}>{p.caravana}</option>    
                        {/each}
                      </select>
                </label>
            </div>
        </div>
        <div class="w-full grid grid-cols-1 justify-items-start " >
            <div class="flex overflow-x-auto">
                <table class="table table-lg w-full" >
                    <thead>
                        <tr>
                            <th class="text-base px-0 lg:px-2">Caravana</th>
                            <th class="text-base px-2">Pajuela</th>
                            <th class="text-base px-1">Padre</th>
                        </tr>
                    </thead>
                    <tbody>
                        {#each selectanimales as a,i}
                            <tr>
                                <td class="text-base px-0 lg:px-2">{a.caravana}</td>
                                <td class="px-2">
                                    <input
                                        bind:value={selectanimales[i].pajuela}
                                        class={`
                                            h-12 w-30 lg:w-50 border border-gray-300 
                                            w-full
                                            rounded-md
                                            focus:outline-none focus:ring-2 
                                            focus:ring-green-500 
                                            focus:border-green-500
                                            ${estilos.bgdark2}
                                        `}
                                    />
                                </td>
                                <td class="px-1 ">
                                    <label class="input-group ">
                                        <select 
                                            class={`
                                                select select-bordered w-full
                                                rounded-md
                                                w-30 lg:w-50
                                                focus:outline-none focus:ring-2 
                                                focus:ring-green-500 
                                                focus:border-green-500
                                                ${estilos.bgdark2}
                                            `}
                                            bind:value={selectanimales[i].padre}
                                        >
                                                
                                            {#each padres as p}
                                                <option value={p.id}>{p.caravana}</option>
                                            {/each}
                                        </select>
                                    </label>
                                </td>
                            </tr>
                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
        <div class="modal-action justify-start ">
            <form method="dialog" >
                <button class="btn btn-success text-white" disabled={!botonhabilitado} onclick={crearInseminacion} >Guardar inseminaciones</button>
                <button class="btn btn-error text-white" >Cancelar</button>
            </form>
        </div>
    </div>
</dialog>