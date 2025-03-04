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
    import { isEmpty,getWholeWordButLastLetter } from '$lib/stringutil/lib';
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
    // Datos para mostrar
    let servicios = $state([])
    let serviciosrow = $state([])
    let buscar = $state("")
    let isOpenFilter = $state(false)
    let totalServicios = $state(0)
    
    //Datos servicios
    let idserv = $state("")
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
    }
    function editar(){

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
            filter:`active=true && cab='${cab.id}'`
        })
        madres = recordsa.filter(a=>a.sexo == "H" || a.sexo == "F")
        padres = recordsa.filter(a=>a.sexo == "M")

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