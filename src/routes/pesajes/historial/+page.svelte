<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Exportar from '$lib/components/Exportar.svelte';
    import PocketBase from 'pocketbase'
    import { slide } from 'svelte/transition';
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createUserer } from '$lib/stores/user.svelte';
    import estilos from '$lib/stores/estilos';
    import {shorterWord} from "$lib/stringutil/lib"
    import * as XLSX from "xlsx"
    import {isEmpty} from "$lib/stringutil/lib"
    let caber = createCaber()
    let cab = caber.cab
    let ruta = import.meta.env.VITE_RUTA
    let pre = import.meta.env.VITE_PRE
    const pb = new PocketBase(ruta);

    //Editar
    let caravana  = $state("")
    let pesonuevo = $state(0)
    let pesoanterior = $state(0)
    let fecha = $state("")
    let idpesaje = $state("")
    //Datos filtrar
    let buscarcaravana = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")
    let pesajes = $state([])
    let pesajesrows = $state([])

    //open filter
    let isOpenFilter = $state(false)
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
        
    }
    async function editarPesaje() {
        try{
            let data = {
                fecha:new Date(fecha).toISOString().split("T")[0]+" 03:00:00",
                pesonuevo
            }
            await pb.collection("pesaje").update(idpesaje,data)
            await getPesajes()
            filterUpdate()
            Swal.fire("Éxito editar pesaje","Se pudo editar el pesaje","success")
        }   
        catch(err){
            console.error(err)
            Swal.fire("Error editar pesaje","No se pudo editar el pesaje","error")
        }
        detallePesaje.close()

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
    onMount(async ()=>{
        await getPesajes()
        filterUpdate()
    })
</script>
<Navbarr>
    <div class="grid grid-cols-1  lg:grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div>
            <h1 class="text-2xl col-span-2 lg:col-span-1">Pesajes</h1>  
        </div>
        <div class="flex col-span-2 gap-1 justify-end">
            <div>
                <a class={`
                    btn 
                    bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                    ${estilos.btnsecondary}`} 
                    href={pre+"/pesajes"}

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
        <div>
            <span class = "text-lg my-1">Total de pesajes encontrados: {pesajesrows.length}</span>
        </div>
        {#if isOpenFilter}
            <div transition:slide>
                <div class="grid grid-cols-1 lg:grid-cols-3 mb-2 lg:mb-3 gap-1" >
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
    <!--Tabla de pesajes sin ordenar-->
    <div class="hidden w-full md:grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th 
                        
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        Fecha
                    </th>
                    <th 
                        
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        Animal
                    </th>
                    <th 
                        
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        Peso anterior
                    </th>
                    <th 
                        
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        Peso nuevo
                    </th>
                </tr>
            </thead>
            <tbody>
                {#each pesajesrows as p}
                <tr onclick={()=>openDetalle(p.id)} class="hover:bg-gray-200 dark:hover:bg-gray-900">
                        <td 
                            
                            class="text-base p-3 border-b dark:border-gray-600  "
                        >
                            {new Date(p.fecha).toLocaleDateString()}
                        </td>
                        <td 
                            
                            class="text-base p-3 border-b dark:border-gray-600 "
                        >
                            {shorterWord(p.expand.animal.caravana)}
                        </td>
                        <td 
                            
                            class="text-base p-3 border-b dark:border-gray-600 "
                        >
                            {p.pesoanterior}
                        </td>
                        <td 
                            
                            class="text-base p-3 border-b dark:border-gray-600 "
                        >
                            {p.pesonuevo}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <!--Lista de pesajes sin ordenar-->
    <div class="block w-full md:hidden justify-items-center mx-1">
        {#each pesajesrows as p}
        <div class="card  w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900">
            <button onclick={()=>openDetalle(p.id)}>
                <div class="block p-4">
                    <div class="grid grid-cols-2 gap-y-2">
                        <div class="flex items-start">
                            <span >Fecha:</span> 
                            <span class="mx-1 font-semibold">
                                {new Date(p.fecha).toLocaleDateString()}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span >Caravana:</span> 
                            <span class="mx-1 font-semibold">
                                {`${p.expand.animal.caravana}`}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span >Peso anterior:</span> 
                            <span class="mx-1 font-semibold">
                                {`${p.pesoanterior}`}
                            </span>
                        </div>
                        <div class="flex items-start">
                            <span >Peso nuevo:</span> 
                            <span class="mx-1 font-semibold">
                                {`${p.pesonuevo}`}
                            </span>
                        </div>
                    </div>
                </div>
            </button>
        </div>
        {/each}
    </div>
</Navbarr>
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
                            bind:value={fecha}
                        />
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
                    <input 
                        id ="pesonuevo" 
                        type="number"  
                        
                        class={`
                            input 
                            input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                            w-full
                            ${estilos.bgdark2}
                        `}
                        bind:value={pesonuevo}
                    />
                </div>
            </div>
        </div>
        <div class="modal-action justify-start ">
                <button class="btn btn-success text-white"  onclick={editarPesaje} >Editar</button>
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