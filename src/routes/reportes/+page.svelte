<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase';
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import estilos from '$lib/stores/estilos';
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    let caber = createCaber()
    let cab = caber.cab

    let generarReporteRodeos = $state(false)
    let generarReporteLotes = $state(false)
    let generarReporte = $state(false)

    let lotesrows = $state([])
    let lotes = $state([])
    let rodeosrows = $state([])
    let rodeos = $state([])
    
    function openNewModal(){
        nuevoModal.showModal()
    }

    function ordenar(lista){
        lista.sort((r1,r2)=>r1.nombre.toLocaleLowerCase()>r2.nombre.toLocaleLowerCase()?1:-1)
    }

    async function getLotes(){
        
        const records = await pb.collection('lotes').getFullList({
            filter:`active=True && cab='${cab.id}'`,
            sort: 'nombre',
        });
        lotes = records
        ordenar(lotes)
        lotesrows = lotes
        for(let i = 0;i<lotes.length;i++){
            let total = await getAnimalesTotal(lotes[i].id)
            lotes[i].total = total
        }
    }

    async function getRodeos(){
        const records = await pb.collection('rodeos').getFullList({
            filter:`active=true && cab='${cab.id}'`,
            sort: 'nombre',
        });
        rodeos = records
        ordenar(rodeos)
        rodeosrows = rodeos
        for(let i = 0;i<rodeos.length;i++){
            let total = await getAnimalesTotal(rodeos[i].id)
            rodeos[i].total = total
        }
    }

    async function getAnimalesTotal(id){
        const results = await pb.collection('animales').getList(1, 10, {
            filter: `active = true && delete = false && rodeo='${id}'`,
        });
        return results.totalItems
    }

    onMount(async ()=>{
        await getLotes()
        await getRodeos()
    })

</script>
<Navbarr>
    <div class="w-full grid justify-items-left mx-1 lg:mx-10 mt-1">
        <h1 class="text-2xl">Reportes</h1>  
    </div>
    <div class="grid grid-cols-1 gap-1 lg:grid-cols-3 mb-2 mt-1 mx-1 lg:mx-10" >
        <div >
            <button class={`w-full btn flex btn-primary ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                <span  class="text-xl">Nuevo reporte</span>
            </button>
        </div>
    </div>
    <dialog id="nuevoModal" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
        <div class="
        modal-box w-11/12 max-w-xl
        bg-gradient-to-br from-white to-gray-100 
        dark:from-gray-900 dark:to-gray-800
        ">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
            </form>
            <h3 class="text-lg font-bold">Nuevo reporte</h3>
            <div class="form-control">
                <label for = "rodeo" class="label cursor-pointer flex justify-start gap-2">
                    <span class="label-text text-base">Mostrar rodeos</span>
                </label>
                <input type="checkbox" class="checkbox" name="rodeo" bind:checked={generarReporteRodeos}>
                <label for = "lote" class="label cursor-pointer flex justify-start gap-2">
                    <span class="label-text text-base">Mostrar lotes</span>
                </label>
                <input type="checkbox" class="checkbox" name="lote" bind:checked={generarReporteLotes}>
            </div>
            <div class="modal-action justify-start">
                <form method="dialog" >
                    <button class="btn btn-success text-white" onclick={generarReporte = true}>Generar reporte</button>
                </form>
            </div>
        </div>
    </dialog>
    {#if generarReporte}
        {#each rodeosrows as r}
            <table>
                <thead>
                    <tr>
                        <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Nombre de rodeo: {r.nombre}</th>
                        <th class="text-base mx-1 px-1">Caravana</th>
                        <th class="text-base mx-1 px-1">Sexo</th>
                        <th class="text-base mx-1 px-1">Categoria</th>
                        <th class="text-base mx-1 px-1">Peso</th>
                        <th class="text-base mx-1 px-1">Estado</th>
                        <th class="text-base mx-1 px-1">Edad</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        
                    </tr>
                </tbody>
            </table>
        {/each}
    {/if}
</Navbarr>