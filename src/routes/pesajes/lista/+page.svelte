<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Exportar from '$lib/components/Exportar.svelte';
    import PocketBase from 'pocketbase'
    import { slide } from 'svelte/transition';
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { createCaber } from '$lib/stores/cab.svelte';
    import {isEmpty} from "$lib/stringutil/lib"
    import estilos from '$lib/stores/estilos';
    import * as XLSX from "xlsx"
    let caber = createCaber()
    let cab = caber.cab
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let isOpenFilter = $state(false)
    //Datos filtrar
    let buscarcaravana = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")
    let pesajes = $state([])
    let pesajesrows = $state([])
    let filas = $state([])
    let columnas = $state([])
    let tablapesaje = $state({})
    //pesaje
    let idpesaje = $state("")
    let caravana = $state("")
    let fecha = $state("")
    let pesoanterior = $state("")
    let pesonuevo = $state("")
    function clickFilter(){
        isOpenFilter = !isOpenFilter
    }
    async function getPesajes(){
        const records = await pb.collection('pesaje').getFullList({
            sort: '-fecha',
            expand:"animal,animal.cab",
            filter:`animal.cab = '${cab.id}'`
        });
        pesajes = records
        
    }
    function filterUpdate(){
        filas = []
        columnas = []
        tablapesaje = {}
        pesajesrows = pesajes
        if(!isEmpty(buscarcaravana)){
            pesajesrows = pesajesrows.filter(p=>p.expand.animal.caravana.toLocaleLowerCase().includes(buscarcaravana.toLocaleLowerCase()))
        }
        if(!isEmpty(fechadesde)){
            pesajesrows = pesajesrows.filter(p=>p.fecha>=fechadesde)
        }
        if(!isEmpty(fechahasta)){
            pesajesrows = pesajesrows.filter(p=>p.fecha<=fechahasta)
        }
        procesarPesajes()
    }
    async function eliminar(){
        
        try{
            
            await pb.collection("pesaje").delete(idpesaje)
            await getPesajes()
            filterUpdate()
            detallePesaje.close()
        }
        catch(err){
            console.error(err)
            detallePesaje.close()
        }
    }
    function openDetalle(id){
        idpesaje = id
        let pesaje = pesajes.filter(p=>p.id==idpesaje)[0]
        caravana = pesaje.expand.animal.caravana
        fecha = pesaje.fecha.split(" ")[0]
        pesoanterior = pesaje.pesoanterior
        pesonuevo = pesaje.pesonuevo

        detallePesaje.showModal()
    }
    function prepararData(item){
        return {
            ANIMAL:item.expand.animal.caravana,
            FECHA:new Date(item.fecha).toISOString().split("T")[0],
            PESO_ANTERIO:item.pesoanterior,
            PESO_NUEVO:item.pesonuevo
        }
    }
    function exportarPesaje(){
        let csvdata = filas.map(f=>{
            let filaexcel = {
                ANIMAL:f
            }
            for(let i = 0;i<columnas.length;i++){
                
                let col = columnas[i]
                let fecha = new Date(col).toLocaleDateString()
                if(tablapesaje[col][f]){
                    filaexcel[fecha] = tablapesaje[col][f].pesonuevo  
                }
                else{
                    filaexcel[fecha] = "-"
                }
                
            }
            return filaexcel
        })
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([])
        ws['A1']={t:'s',v:"Pesajes",s:{}}
        const range = XLSX.utils.decode_range('A1:K1');
        ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
        XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A2' });
        XLSX.utils.book_append_sheet(wb, ws, "Pesajes");
        let confiltros = false
        let filtros = []
        if(confiltros){
            const wsFilter = XLSX.utils.aoa_to_sheet(filtros)
            XLSX.utils.book_append_sheet(wb, wsFilter, 'Filtros aplicados');
        }
        XLSX.writeFile(wb, `${"Pesajes".replace(/\//g, "-")}.xlsx`, { cellStyles: true });

    }
    function procesarPesajes(){
        let setanimales = new Set()
        let setfechas = new Set()
        tablapesaje = {}
        for(let i = 0;i<pesajesrows.length;i++){
            let p = pesajesrows[i]
            let caravana = p.expand.animal.caravana
            let fecha = p.fecha
            if(tablapesaje[fecha]){
                //Puede ocurrir que tenga 2 pesajes en el mismo dia?
                //En teoria si pero debe ser unerror, guardo el último
                if(tablapesaje[fecha][caravana]){
                    tablapesaje[fecha][caravana] = {
                        pesonuevo:p.pesonuevo,
                        pesoanterior:p.pesoanterior,
                        id:p.id
                    }
                }
                else{
                    tablapesaje[fecha][caravana] = {
                        pesonuevo:p.pesonuevo,
                        pesoanterior:p.pesoanterior,
                        id:p.id
                    }
                }
            }
            else{
                tablapesaje[fecha]={}
                tablapesaje[fecha][caravana] = {
                    pesonuevo:p.pesonuevo,
                    pesoanterior:p.pesoanterior,
                    id:p.id
                }
            }
            //Así recorro los animales
            setanimales.add(caravana)
            //Así recorro las fecha
            setfechas.add(fecha)
        }
        filas = Array.from(setanimales)
        columnas = Array.from(setfechas)
        columnas.sort((a,b)=>new Date(a)<new Date(b)?-1:1)
        
    }
    onMount(async ()=>{
        await getPesajes()
        filterUpdate()
    })
</script>
<Navbarr>
    <div class="grid grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div>
            <h1 class="text-2xl">Historia pesajes</h1>  
        </div>
        <div class="flex col-span-2 gap-1 justify-end">
            
            <div>
                <button
                    onclick={exportarPesaje}
                    class={`
                        bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                        ${estilos.btnsecondary}
                        rounded-full
                        px-4 pt-2 pb-3
                    `} 
                    aria-label="Exportar"
                >
                    <span  class="text-xl font-semibold ">Exportar</span>
                    
                </button>
            </div>
            <div>
                <a class={`
                    btn 
                    bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                    ${estilos.btnsecondary}`} 
                    href="/pesajes"

                >
                    <span  class="text-xl font-semibold ">Volver</span>
                </a>
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
                <input type="text" class="grow" placeholder="Buscar..." bind:value={buscarcaravana} oninput={filterUpdate} />
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
            <div transition:slide>
                <div class="grid grid-cols-2 lg:grid-cols-3 mb-2 lg:mb-3 gap-1" >
                    <div class="">
                        <label class="block tracking-wide  mb-2" for="grid-first-name">
                          Fecha desde
                        </label>
                        <input id ="fechadesde" type="date"  
                            class={`
                                input input-bordered
                                ${estilos.bgdark2}
                            `} 
                            bind:value={fechadesde} onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label class="block tracking-wide mb-2" for="grid-first-name">
                          Fecha Hasta
                        </label>
                        <input id ="fechadesde" type="date"  
                            class={`
                                input input-bordered
                                ${estilos.bgdark2}
                            `} 
                            bind:value={fechahasta} onchange={filterUpdate}
                        />
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Animal</th>
                    {#each columnas as c}
                        <th class="text-base mx-1 px-1 border-b dark:border-gray-600">{new Date(c).toLocaleDateString()}</th>
                    {/each}
                </tr>
            </thead>
            <tbody>
                {#each filas as f}
                <tr>
                    
                        <td class="text-base mx-1 px-1">
                            {f}
                        </td>
                        {#each columnas as c}
                            {#if tablapesaje[c][f]}
                                <td onclick={()=>openDetalle(tablapesaje[c][f].id)} class="cursor-pointer text-base mx-1 px-1 hover:bg-gray-200 dark:hover:bg-gray-900">
                                    {tablapesaje[c][f].pesonuevo}
                                </td>
                            {:else}
                                <td class="text-base mx-1 px-1">
                                    {"-"}
                                </td>
                            {/if}
                        {/each}
                    
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="hidden w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th class="text-base ml-3 pl-3 mr-1 pr-1 border-b dark:border-gray-600">Fecha</th>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Caravana</th>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Peso anterior</th>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Peso nuevo</th>
                    
                </tr>
            </thead>
            <tbody>
                {#each pesajesrows as p}
                    <tr onclick={()=>openDetalle(p.id)} class="hover:bg-gray-200 dark:hover:bg-gray-900">
                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{new Date(p.fecha).toLocaleDateString()}</td>
                        <td class="text-base mx-1 px-1">
                            {p.expand.animal.caravana}
                        </td>
                        <td class="text-base mx-1 px-1">
                            {p.pesoanterior}
                        </td>
                        <td class="text-base mx-1 px-1">
                            {p.pesonuevo}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <dialog id="detallePesaje" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
        <div class="
            modal-box w-11/12 max-w-xl
            bg-gradient-to-br from-white to-gray-100 
            dark:from-gray-900 dark:to-gray-800 
            "
        >
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
            </form>
            <h3 class="text-lg font-bold">Ver pesaje</h3>  
            <div class="form-control">
                <div class="grid grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
                    <div class="mb-1 lg:mb-0">
                        <label for = "caravana" class="label">
                            <span class="label-text text-base">Caravana</span>
                        </label>
                        <label for="caravana" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {caravana}
                        </label>
                    </div>
                    <div class="mb-1 lg:mb-0">
                        <label for = "caravana" class="label">
                            <span class="label-text text-base">Fecha</span>
                        </label>
                        <label for="caravana" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {fecha}
                        </label>
                    </div>
                    <div class="mb-1 lg:mb-0">
                        <label for = "pesoanterior" class="label">
                            <span class="label-text text-base">Peso anterior(KG)</span>
                        </label>
                        <label for="pesoanterior" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {pesoanterior}
                        </label>
                    </div>
                    <div class="mb-1 lg:mb-0">
                        <label for = "pesonuevo" class="label">
                            <span class="label-text text-base">Peso nuevo(KG)</span>
                        </label>
                        <label for="pesonuevo" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {pesonuevo}
                        </label>
                    </div>
                </div>
            </div>
            <div class="modal-action justify-start ">
                
                    <button class="btn btn-error text-white" onclick={eliminar}>Eliminar</button>
                    <button class={`
                        btn 
                        bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                        ${estilos.btnsecondary}`} 
                        onclick={()=>detallePesaje.close()}

                    >Cerrar</button>
                
            </div>
        </div>
    </dialog>
</Navbarr>