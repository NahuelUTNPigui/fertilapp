<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import estilos from "$lib/stores/estilos";
    import PocketBase from 'pocketbase'
    import {isEmpty} from "$lib/stringutil/lib"
    let ruta = import.meta.env.VITE_RUTA
    const HOY = new Date().toISOString().split("T")[0]
    const pb = new PocketBase(ruta);
    let {pesoanterior,caravana} = $props()

    let id = $state("")
    //Pesajes
    let pesajes = $state([])
    let fecha = $state("")
    let pesonuevo = $state("")
    //Validaciones
    let malfecha = $state(false)
    let malpeso = $state(false)
    let botonhabilitado = $state(false)
    async function guardarPesaje(){

        let data ={
            fecha:fecha+" 03:00:00",
            animal:id,
            pesoanterior,
            pesonuevo
        }
        let dataupdate={
            peso:pesonuevo
        }
        try{
            
            await pb.collection("pesaje").create(data)
            await pb.collection("animales").update(id,dataupdate)

            await getPesajes()
            nuevoPesaje.close()
        }
        catch(err){
            console.error(err)
            nuevoPesaje.close()
        }
    }
    async function getPesajes(){
        pesajes = await pb.collection("pesaje").getFullList({
            filter:`animal='${id}'`,
            sort:"-fecha"
        })
    }
    function openNewModal(){
        malfecha = false
        malpeso = false
        botonhabilitado = false
        pesonuevo = ""
        fecha = ""
        nuevoPesaje.showModal()
    }
    onMount(async ()=>{
        id = $page.params.slug
        await getPesajes()
    })
    function validarBoton(){
        botonhabilitado = true
        if(isEmpty(pesonuevo)){
            botonhabilitado = false
        }
        if(isEmpty(fecha)){
            botonhabilitado = false
        }
        
    }
    function onchange(campo){
        validarBoton()
        if(campo == "FECHA"){
            if(isEmpty(fecha)){
                malfecha = true
            }
            else{
                malfecha = false
            }
        }
        if(campo == "PESO"){
            if(isEmpty(pesonuevo)){
                malpeso = true
            }
            else{
                malpeso = false
            }
        }
    }
</script>
<div class="w-full flex justify-items-start gap-2">
    <div>
        <button
            aria-label="Nuevo"
            onclick={openNewModal}
            class={`
                ${estilos.sinbordes} ${estilos.chico} ${estilos.primario}
            `}
        >
            Nuevo
        </button>
    </div>
</div>
<div class="w-full flex justify-items-center mx-1 lg:w-3/4 overflow-x-auto">
    {#if pesajes.length == 0}
        <p class="mt-5 text-lg ">No hay pesajes</p>
    {:else}
        <table class="table table-lg" >
            <thead>
                <tr>
                    <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Fecha</th>
                    <th class="text-base mx-1 px-1">Peso anterior</th>
                    <th class="text-base mx-1 px-1">Peso nuevo</th>
                </tr>
            </thead>
            <tbody>
                {#each pesajes as p}
                    <tr>
                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{new Date(p.fecha).toLocaleDateString()}</td>
                        <td class="text-base mx-1 px-1">
                            {`${p.pesoanterior}`}
                        </td>
                        <td class="text-base mx-1 px-1">
                            {`${p.pesonuevo}`}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>
<dialog id="nuevoPesaje" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
    <div 
        class="
            modal-box w-11/12 max-w-5xl
            bg-gradient-to-br from-white to-gray-100 
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
        </form>
        <h3 class="text-lg font-bold">Nuevo pesaje - {caravana}</h3>  
        <div class="form-control">
            <label for = "fecha" class="label">
                <span class="label-text text-base">Fecha </span>
            </label>
            <label class="input-group ">
                <input id ="fecha" type="date" max={HOY}  
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
                    onchange={()=>onchange("FECHA")}
                />
                {#if malfecha}
                    <div class="label">
                        <span class="label-text-alt text-red-500">Debe seleccionar la fecha del pesaje</span>                    
                    </div>
                {/if}
            </label>
            <div class="label">
                <span class="label-text">Peso anterior</span>                    
            </div>
            <input 
                id ="pesoanterior" 
                type="number"  
                disabled
                class={`
                    disabled
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    w-full
                    ${estilos.bgdark2}
                `}
                bind:value={pesoanterior}
                
            />
            <div class="label">
                <span class="label-text">Peso nuevo</span>                    
            </div>
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
                oninput={()=>onchange("PESO")}
            />
            {#if malpeso}
                <div class="label">
                    <span class="label-text-alt text-red-500">Debe escribir el peso</span>                    
                </div>
            {/if}
        </div>
        <div class="modal-action justify-start ">
            <button class="btn btn-success text-white" disabled='{!botonhabilitado}' onclick={guardarPesaje} >Guardar</button>
            <button class="btn btn-error text-white" onclick={()=>nuevoPesaje.close()}>Cancelar</button>
        </div>
    </div>
</dialog>