<script>
    import { goto } from '$app/navigation';   
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Exportar from '$lib/components/Exportar.svelte';
    import PocketBase from 'pocketbase'
    import { slide } from 'svelte/transition';
    import Swal from 'sweetalert2';
    import sexos from '$lib/stores/sexos';
    import { onMount } from 'svelte';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createUserer } from '$lib/stores/user.svelte';
    import tiposanimal from '$lib/stores/tiposanimal';
    import permisos from "$lib/stores/permisos";
    import estilos from '$lib/stores/estilos';
    import { guardarHistorial } from '$lib/historial/lib';
    import { isEmpty,getWholeWordButLastLetter,addDays } from '$lib/stringutil/lib';
    import MultipleToros from "$lib/components/MultipleToros.svelte";
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let caber = createCaber()
    let userer = createUserer()
    let cab = caber.cab
    let usuarioid = userer.userid
    let caravana = $state("")
    let cargado = $state(false)
    // Datos para mostrar
    let servicios = $state([])
    let serviciosrow = $state([])
    let buscar = $state("")
    let isOpenFilter = $state(false)
    let totalServicios = $state(0)
    
    //Datos servicios
    let idserv = $state("")
    let padreslist = $state([])
    let padresserv = $state("")
    let pajuelasserv = $state("")
    //Seria la fecha del parto
    let fechaparto = $state("")
    let fechadesdeserv = $state("")
    let fechahastaserv = $state("")
    let madre = $state("")
    let observacion = $state("")
    //Filtro de serv
    let fechaservhastafiltro = $state("")
    let fechaservdesdefiltro = $state("")
    let fechapartodesde = $state("")
    let fechapartohasta = $state("")
    let buscarpadre = $state("")
    let madres = $state([])
    let padres = $state([])
    let idanimal = $state("")
    //Validaciones
    let botonhabilitado = $state(true)
    //No se que poner
    function clickFilter(){
        isOpenFilter = !isOpenFilter
    }
    function openEditModal(id){
        idserv = id
        let ser = servicios.filter(s=>s.id == id)[0]
        if(ser){
            madre = ser.madre
            fechadesdeserv = ser.fechadesde.split(" ")[0]
            fechahastaserv = ser.fechahasta.split(" ")[0]
            fechaparto = ser.fechaparto.split(" ")[0]
            observacion = ser.observacion
            padreslist = ser.padres.split(",")
            nuevoModal.showModal()
        }
    }
    async function editar(){
        try{
            let dataser = {
                fechadesde : fechadesdeserv + " 03:00:00",
                fechaparto: fechaparto + " 03:00:00",
                observacion: observacion,
                madre:madre,
                padres:padreslist.join()
            }
            if(fechahastaserv != ""){
                dataser.fechahasta = fechahastaserv + " 03:00:00"
            }
            await pb.collection("servicios").update(idserv,dataser)
            await getServicios()
            filterUpdate()
        }
        catch(err){
            console.error(err)
        }
    }
    async function eliminar(id){
        try{
            await pb.collection("servicios").update(id,{active:false})
            await getServicios()
        }
        catch(err){
            console.error(err)
        }
    }
    function cerrarModal(){
        madre = ser.madre
        fechadesdeserv = ""
        fechahastaserv = ""
        fechaparto = ""
        observacion = ""
        padreslist = ""
        nuevoModal.close()
    }
    async function getServicios(){
        const records = await pb.collection('servicios').getFullList({
            sort: '-fechadesde ',
            filter :`cab = '${cab.id}' && active = true`,
            expand:"madre"
        });
        servicios = records
    }
    async function getAnimales(){
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && cab='${cab.id}' && delete=False`
        })
        madres = recordsa.filter(a=>a.sexo == "H" || a.sexo == "F")
        padres = recordsa.filter(a=>a.sexo == "M")
        cargado = true

    }
    function validarBoton(){
    }
    function filterUpdate(){
        serviciosrow = servicios
        totalServicios = serviciosrow.length
    }
    function prepararData(){

    }
    function getNombrePadres(p_padres){
        let ids = p_padres.split(",")
        
        let nombres = ids.reduce(
            (acc,valor)=>padres.filter(p=>p.id==valor)[0].caravana + " , " +acc,
            ""
        )

        return getWholeWordButLastLetter(nombres)

    }
    onMount(async ()=>{
        await getAnimales()
        await getServicios()
        filterUpdate()
    })
</script>
<Navbarr>
    <div class="grid grid-cols-1 lg:grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div>
            <h1 class="text-2xl">Servicios</h1>
        </div>
        <div class="flex col-span-2 gap-1 justify-start lg:justify-end">
            <div>
                <button class={`btn btn-primary rounded-lg ${estilos.btntext}`} data-theme="forest" onclick={()=>goto("/servicios/movimiento")}>
                    <span  class="text-lg">Nuevos</span>
                </button>
            </div>
            <div>
                <Exportar
                    titulo={"Servicios"}
                    filtros={[]}
                    confiltros={false}
                    data = {serviciosrow}
                    {prepararData}
                />
            </div>
        </div>
    </div>
    <div class="grid grid-cols-1 m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10 w-11/12" >
        <div class="w-full lg:w-1/2">
            <label 
                class={`
                    input 
                    input-bordered 
                    flex 
                    items-center gap-2
                    ${estilos.bgdark2}
                `}
            >
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
        <div>
            <span class = "text-lg mx-1">Total de servicios encontrados: {totalServicios}</span>
        </div>
        {#if isOpenFilter}
            <div transition:slide>
                <div class="grid grid-cols-2 lg:grid-cols-4" >
                    <div class="">
                        <label class="block tracking-wide text-base font-medium mb-2" for="grid-first-name">
                        Servicio desde
                        </label>
                        <input id ="fechainseminaciondesde" type="date"  
                            class={`
                                input input-bordered
                                ${estilos.bgdark2}
                            `} 
                            bind:value={fechaservdesdefiltro} onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label class="block tracking-wide text-base font-medium mb-2" for="grid-first-name">
                            Servicio hasta
                        </label>
                        <input id ="fechainseminacionhasta" type="date"  
                            class={`
                                input input-bordered
                                ${estilos.bgdark2}
                            `} 
                            bind:value={fechaservhastafiltro} onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label class="block tracking-wide text-base font-medium mb-2" for="grid-first-name">
                        Parto desde
                        </label>
                        <input id ="fechainseminaciondesde" type="date"  
                            class={`
                                input input-bordered
                                ${estilos.bgdark2}
                            `} 
                            bind:value={fechapartodesde} onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label class="block tracking-wide text-base font-medium mb-2" for="grid-first-name">
                            Parto hasta
                        </label>
                        <input id ="fechainseminacionhasta" type="date"  
                            class={`
                                input input-bordered
                                ${estilos.bgdark2}
                            `} 
                            bind:value={fechapartohasta} onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
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
                                bind:value={buscarpadre}
                                oninput={filterUpdate}
                            />
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th class="text-base ml-3 pl-3 mr-1 pr-1 border-b dark:border-gray-600">Fecha desde</th>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Fecha Hasta</th>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Fecha Parto</th>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Madre</th>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Padres</th>
                </tr>
            </thead>
            <tbody>
                {#each serviciosrow as s}
                <tr class="hover:bg-gray-200 dark:hover:bg-gray-900" onclick={()=>openEditModal(s.id)}>
                    <td class="text-base ml-3 pl-3 mr-1 pr-1 border-b dark:border-gray-600">{s.fechadesde?new Date(s.fechadesde).toLocaleDateString():""}</td>
                    <td class="text-base mx-1 px-1 border-b dark:border-gray-600">{s.fechahasta?new Date(s.fechahasta).toLocaleDateString():""}</td>
                    <td class="text-base mx-1 px-1 border-b dark:border-gray-600">{s.fechaparto?new Date(s.fechaparto).toLocaleDateString():"   "}</td>
                    <td class="text-base mx-1 px-1 border-b dark:border-gray-600">{`${s.expand.madre.caravana}`}</td>
                    <td class="text-base mx-1 px-1 border-b dark:border-gray-600">{getNombrePadres(s.padres)}</td>
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
</Navbarr>
<dialog id="nuevoModal" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
    <div class="
        modal-box w-11/12 max-w-xl
        bg-gradient-to-br from-white to-gray-100 
        dark:from-gray-900 dark:to-gray-800
    "
    >
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
        </form>
        <h3 class="text-lg font-bold">Ver servicio</h3>  
        <div class="form-control">
            <label for = "nombre" class="label">
                <span class="label-text text-base">Madre</span>
            </label>
            <label class="input-group ">
                <select 
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={madre}
                    
                >
                    
                    {#each madres as a}
                        <option value={a.id}>{a.caravana}</option>    
                    {/each}
                </select>
            </label>
            <label for = "nombre" class="label">
                <span class="label-text text-base">Fecha desde</span>
            </label>
            <label class="input-group ">
                <input id ="fecha" type="date" 
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `} 
                    bind:value={fechadesdeserv}
                    s
                />
                
            </label>
            <label for = "nombre" class="label">
                <span class="label-text text-base">Fecha hasta</span>
            </label>
            <label class="input-group ">
                <input id ="fecha" type="date" 
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `} 
                    bind:value={fechahastaserv}
                    
                />
                
            </label>
            <label for = "nombre" class="label">
                <span class="label-text text-base">Fecha parto</span>
            </label>
            <label class="input-group ">
                <input id ="fecha" type="date" 
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `} 
                    bind:value={fechaparto}
                />
            </label>
            <label for = "nombre" class="label">
                <span class="label-text text-base">Padres</span>
            </label>
            <label class="input-group ">
                {#if cargado}
                    <MultipleToros toros={padres} bind:valor={padresserv} bind:listavalores={padreslist} />
                    
                {/if}
            </label>
            
            <label class="form-control">
                <div class="label">
                    <span class="label-text">Observacion</span>                    
                </div>
                <input 
                    id ="observacion" 
                    type="text"  
                    class={`
                        input 
                        input-bordered 
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                    bind:value={observacion}
                />
            </label>
            

        </div>
        <div class="modal-action justify-start ">
            <form method="dialog" >
                <button class="btn btn-success text-white" disabled='{!botonhabilitado}' onclick={editar} >Editar</button>
                <button class="btn btn-error text-white" onclick={()=>eliminar(idserv)}>Eliminar</button>
                <button class="btn btn-neutral " onclick={cerrarModal}>Cerrar</button>
            </form>
        </div>
    </div>
</dialog>
