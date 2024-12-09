<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import estilos from "$lib/stores/estilos";
    import PocketBase from 'pocketbase'
    import tipostacto from '$lib/stores/tipostacto';
    import tiposanimal from '$lib/stores/tiposanimal';
    import pp from '$lib/stores/pp';
    import categorias from "$lib/stores/categorias";
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let buscar = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")
    let tactos=$state([])
    let id = $state("")
    let {cabid} = $props()
    //Datos tacto
    let tacto = $state(null)
    let idtacto = $state("")
    let fecha = $state("")
    let observacion = $state("")
    let animal = $state("")
    //Tipo animal
    let categoria = $state("vaca")
    let prenada = $state(false)
    let pppc = $state("PP")
    //tipo tacto
    let tipo = $state("tacto")
    let nombreveterinario = $state("")
    function openNewModal(){
        fecha = ""
        observacion =  ""
        animal = ""
        categoria = "vaca"
        prenada = false
        pppc = "PP"
        tipo = "tacto"
        nombreveterinario = ""
        nuevoTacto.showModal()

    }
    async function guardarTacto(){
        try{
            let data = {
               fecha:fecha +" 03:00:00" ,
               observacion,
               animal:id,
               categoria,
               prenada,
               pp:pppc,
               tipo,
               nombreveterinario,
               user:usuarioid,
               cab:cabid,
               active:true
            }
            const record = await pb.collection('tactos').create(data);
            tactos.push(record)
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar el tacto","error")
        }
    }
    function getTipoNombre(tipo){
        return tipostacto.filter(t=>t.id==tipo)[0].nombre
    }
    function getCategoriaNombre(cat){
        return tiposanimal.filter(c=>c.id==cat)[0].nombre
    }
    async function getTactos(){
        const recordst = await pb.collection('tactos').getFullList({
            filter:`animal='${id}'`,
            sort: '-created'
        });
        tactos = recordst
        
    }
    
    onMount(async ()=>{
        id = $page.params.slug
        await getTactos()
    })

</script>
<div class="w-full flex justify-items-start gap-2">
    <div>
        <button
            aria-label="Expandir"
            onclick={()=>expandirTacto.showModal()}
            class={`
                ${estilos.basico} ${estilos.chico} ${estilos.primario}
                ${tactos.length == 0?estilos.deshabilitado:""}
            `}
            disabled = {tactos.length == 0}
        >
            Expandir                
        </button>
    </div>
    <div>
        <button
            aria-label="Nuevo"
            onclick={openNewModal}
            class={`
                ${estilos.sinbordes} ${estilos.chico} ${estilos.primario}
            `}
        >
            + Nuevo
        </button>
    </div>
</div>
<div class="w-full grid justify-items-center mx-1 lg:w-3/4 overflow-x-auto">
    {#if tactos.length == 0}
        <p class="mt-5 text-lg">No tiene tactos</p>
    {:else}
    <table class="table table-lg " >
        <thead>
            <tr>
                <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Fecha</th>
                <th class="text-base mx-1 px-1"  >Observacion</th>
                <th class="text-base mx-1 px-1"  >Categoria</th>
                <th class="text-base mx-1 px-1"  >Preñada</th>
                <th class="text-base mx-1 px-1"  >PP/PC</th>
                <th class="text-base mx-1 px-1"  >Tipo</th>
            </tr>
        </thead>
        <tbody>
            {#each tactos as t}
                <tr>
                    <td class="text-base">
                        {`${new Date(t.fecha).toLocaleDateString()}`}
                    </td>
                    <td class="text-base mx-1 px-1">
                        {`${t.observacion}`}
                    </td>
                    <td class="text-base mx-1 px-1">
                        {`${getCategoriaNombre(t.categoria)}`}
                    </td>
                    <td class="text-base mx-1 px-1">
                        {`${t.prenada?"Si":"No"}`}
                    </td>
                    <td class="text-base mx-1 px-1">
                        {`${t.pp.toUpperCase()}`}
                    </td>
                    <td class="text-base mx-1 px-1">
                        {`${getTipoNombre(t.tipo)}`}
                    </td>
                </tr>
                
            {/each}
        </tbody>
    </table>
    {/if}
</div>
<dialog id="expandirTacto" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
    <div
        class="
            modal-box w-11/12  max-w-5xl
            bg-gradient-to-br from-white to-gray-100 
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
        </form>
        <h3 class="text-lg font-bold">Tactos</h3>  
        <div class="form-control">
            <table class="table table-lg " >
                <thead>
                    <tr>
                        <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Fecha</th>
                        <th class="text-base mx-1 px-1"  >Observacion</th>
                        <th class="text-base mx-1 px-1"  >Categoria</th>
                        <th class="text-base mx-1 px-1"  >Preñada</th>
                        <th class="text-base mx-1 px-1"  >PP/PC</th>
                        <th class="text-base mx-1 px-1"  >Tipo</th>
                    </tr>
                </thead>
                <tbody>
                    {#each tactos as t}
                        <tr>
                            <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">
                                {`${new Date(t.fecha).toLocaleDateString()}`}
                            </td>
                            <td class="text-base mx-1 px-1">
                                {`${t.observacion}`}
                            </td>
                            <td class="text-base mx-1 px-1">
                                {`${getCategoriaNombre(t.categoria)}`}
                            </td>
                            <td class="text-base mx-1 px-1">
                                {`${t.prenada?"Si":"No"}`}
                            </td>
                            <td class="text-base mx-1 px-1">
                                {`${t.pp.toUpperCase()}`}
                            </td>
                            <td class="text-base mx-1 px-1">
                                {`${getTipoNombre(t.tipo)}`}
                            </td>
                        </tr>
                        
                    {/each}
                </tbody>
            </table>
        </div>
        <div class="modal-action justify-start ">
            <button class={`${estilos.basico} ${estilos.medio} ${estilos.secundario}`} onclick={()=>expandirTacto.close()}>Cerrar</button>
        </div>
    </div>
</dialog>


