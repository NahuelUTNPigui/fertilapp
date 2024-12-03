<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import estilos from "$lib/stores/estilos";
    import PocketBase from 'pocketbase'
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let {cabid} = $props()
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let buscar = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")
    let pariciones = $state([])
    let paricionesrows = $state([])
    let id = $state("")
    
    async function getPariciones(){
        const recordsn = await pb.collection("nacimientosall").getFullList({
            filter:`(padre~'${id}' || madre ~ '${id}') && cab='${cabid}' `,
            sort:"-fecha"
        })
        pariciones = recordsn
        paricionesrows = pariciones
    }
    onMount(async ()=>{
        id = $page.params.slug
        //fechadesde = DESDE.toISOString().split("T")[0]
        //fechahasta = HASTA.toISOString().split("T")[0]
        
        await getPariciones()
        filterUpdate()
    })
    function filterUpdate(){
        paricionesrows = pariciones
        if(buscar != ""){
            paricionesrows = paricionesrows.filter(n=>n.expand.animal.caravana.startsWith(buscar))
        }
        if(fechadesde != ""){
            paricionesrows = paricionesrows.filter(t=>t.fecha>=fechadesde)
        }
        if(fechahasta != ""){
            paricionesrows = paricionesrows.filter(t=>t.fecha<=fechahasta)
        }
    }
    
</script>
<div class="p-2">
    <!--
    <div class="grid grid-cols-2 lg:grid-cols-3 mx-1 lg:mx-10 mb-2 lg:mb-3 gap-2" >
        <div class="">
            <label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-first-name">
              Fecha desde
            </label>
            <input id ="fechadesde" type="date"  
                class={`
                    input input-bordered
                    w-full
                    ${estilos.bgdark2}
                `} 
                bind:value={fechadesde} onchange={filterUpdate}
            />
        </div>
        <div class="">
            <label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-first-name">
              Fecha Hasta
            </label>
            <input id ="fechadesde" type="date"  
                class={`
                    input input-bordered
                    w-full
                    ${estilos.bgdark2}
                `} 
                bind:value={fechahasta} onchange={filterUpdate}
            />
        </div>
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2 m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10" >
        <div class="w-11/12">
            <label 
                class={`
                    input input-bordered flex items-center gap-2
                    ${estilos.bgdark2}
                `}
            >
                <input type="text" class="grow" placeholder="Buscar..." bind:value={buscar} oninput={filterUpdate} />
            </label>
        </div>
    </div>
    -->
    <div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Fecha</th>
                    <th class="text-base mx-1 px-1">Caravana</th>
                    
                </tr>
            </thead>
            <tbody>
                {#each paricionesrows as n}
                    <tr>
                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{new Date(n.fecha).toLocaleDateString()}</td>
                        <td class="text-base mx-1 px-1">
                            {`${n.caravana}`}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</div>
