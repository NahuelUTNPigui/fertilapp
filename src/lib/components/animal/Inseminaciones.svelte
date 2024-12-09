<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import estilos from "$lib/stores/estilos";
    import PocketBase from 'pocketbase'
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let id = $state("")
    let inseminaciones = $state([])
    async function getInseminaciones(){
        const records = await pb.collection('inseminacion').getFullList({
            sort: '-created ',
            filter :`animal = '${id}' && active=true`,
            
        });
        inseminaciones = records
    }
    onMount(async ()=>{
        id = $page.params.slug
        await getInseminaciones()
    })
</script>
<div class="w-full flex justify-items-start gap-2">
    <div>
        <button
            aria-label="Expandir"
            
            class={`
                ${estilos.basico} ${estilos.chico} ${estilos.primario}
            `}
        >
            Expandir                
        </button>
    </div>
    <div>
        <button
            aria-label="Nuevo"
            
            class={`
                ${estilos.sinbordes} ${estilos.chico} ${estilos.primario}
            `}
        >
            + Nuevo
        </button>
    </div>
</div>
<div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4">
    {#if inseminaciones.length == 0}
        <p>No hay inseminaciones</p>
    {:else}
    <table class="table table-lg w-full" >
        <thead>
            <tr>
                <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Fecha parto</th>
                <th class="text-base mx-1 px-1">Pajuela</th>
            </tr>
        </thead>
        <tbody>
            {#each inseminaciones as i}
            <tr>
                <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{new Date(i.fechaparto).toLocaleDateString()}</td>
                <td class="text-base mx-1 px-1">
                    {`${i.pajuela}`}
                </td>
            </tr>
            {/each}
        </tbody>
    </table>
    {/if}
    
</div>