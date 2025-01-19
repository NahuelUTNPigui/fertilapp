<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase';
    import { slide } from 'svelte/transition';
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
    let generarReportePersonalizado =$state(false)
    let opensFilterlotes = $state([])
    let opensFilterrodeos = $state([])
    let animales = $state([])
    let total = $state(0)

    let lotesrows = $state([])
    let lotes = $state([])
    let rodeosrows = $state([])
    let rodeos = $state([])
    let categoriasrows = $state([
        {nombre: "Vaca", total: 0},
        {nombre: "Vaquillona", total: 0},
        {nombre: "Ternero", total: 0},
        {nombre: "Novillo", total: 0},
        {nombre: "Torito", total: 0},
        {nombre: "Toro", total: 0}
    ])
    
    let categoriasrodeosrows = $state([])
    let categoriaslotesrows = $state([])

    function openNewModal(){
        nuevoModal.showModal()
        generarReporte = false
        generarReportePersonalizado = false
        generarReporteLotes = false
        generarReporteRodeos = false
    }

    function ordenar(lista){
        lista.sort((r1,r2)=>r1.nombre.toLocaleLowerCase()>r2.nombre.toLocaleLowerCase()?1:-1)
    }

    async function getCategoriasRows(){

        for (let i = 0; i < animales.length; i++) {
            total += 1
            if (animales[i].categoria == "vaca"){
                categoriasrows[0].total += 1
            }
            if (animales[i].categoria == "vaquillona"){
                categoriasrows[1].total += 1
            }
            if (animales[i].categoria == "ternero"){
                categoriasrows[2].total += 1
            }
            if (animales[i].categoria == "novillo"){
                categoriasrows[3].total += 1
            }
            if (animales[i].categoria == "torito"){
                categoriasrows[4].total += 1
            }
            if (animales[i].categoria == "toro"){
                categoriasrows[5].total += 1
            }
        }
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
            opensFilterlotes.push(false)
            let total = await getAnimalesTotalLotes(lotes[i].id)
            lotes[i].total = total

            lotes[i].categoriaslotes = [                
                {nombre: "Vaca", total: 0},
                {nombre: "Vaquillona", total: 0},
                {nombre: "Ternero", total: 0},
                {nombre: "Novillo", total: 0},
                {nombre: "Torito", total: 0},
                {nombre: "Toro", total: 0}
            ]

            for (let j = 0;j<animales.length;j++){
                if (animales[j].categoria == "vaca" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[0].total += 1
                }
                if (animales[j].categoria == "vaquillona" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[1].total += 1
                }
                if (animales[j].categoria == "ternero" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[2].total += 1
                }
                if (animales[j].categoria == "novillo" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[3].total += 1
                }
                if (animales[j].categoria == "torito" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[4].total += 1
                }
                if (animales[j].categoria == "toro" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[5].total += 1
                }
            }
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
            let total = await getAnimalesTotalRodeos(rodeos[i].id)
            rodeos[i].total = total

            rodeos[i].categoriasrodeos = [
                {nombre: "Vaca", total: 0},
                {nombre: "Vaquillona", total: 0},
                {nombre: "Ternero", total: 0},
                {nombre: "Novillo", total: 0},
                {nombre: "Torito", total: 0},
                {nombre: "Toro", total: 0}
            ]

            for (let j = 0;j<animales.length;j++){
                if (animales[j].categoria == "vaca" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[0].total += 1    
                }
                if (animales[j].categoria == "vaquillona" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[1].total += 1
                }
                if (animales[j].categoria == "ternero" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[2].total += 1
                }
                if (animales[j].categoria == "novillo" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[3].total += 1
                }
                if (animales[j].categoria == "torito" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[4].total += 1
                }
                if (animales[j].categoria == "toro" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[5].total += 1
                }
            }
        }        
    }

    async function getAnimales() {
        const record = await pb.collection('animales').getFullList({
            filter: `active = true && delete = false && cab = '${cab.id}'`
        })

        animales = record
    }

    async function getAnimalesTotalRodeos(id){
        const results = await pb.collection('animales').getList(1, 10, {
            filter: `active = true && delete = false && rodeo='${id}'`,
        });
        return results.totalItems
    }

    async function getAnimalesTotalLotes(id){
        const results = await pb.collection('animales').getList(1, 10, {
            filter: `active = true && delete = false && lote='${id}'`,
        });
        return results.totalItems
    }

    onMount(async ()=>{
        await getAnimales()
        await getLotes()
        await getRodeos()
        await getCategoriasRows()
    })
    
    let isOpenFilter = $state(false)
    function clickFilter(){
        isOpenFilter = !isOpenFilter
    }
    function clickFilterlote(i){
        opensFilterlotes[i] = !opensFilterlotes[i]
    }
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
                    <span class="label-text text-base">Mostrar por rodeos</span>
                </label>
                <input type="checkbox" class="checkbox" name="rodeo" bind:checked={generarReporteRodeos}>
                <label for = "lote" class="label cursor-pointer flex justify-start gap-2">
                    <span class="label-text text-base">Mostrar por lotes</span>
                </label>
                <input type="checkbox" class="checkbox" name="lote" bind:checked={generarReporteLotes}>
            </div>
            <div class="modal-action justify-start">
                <form method="dialog" >
                    <button class="btn btn-success text-white" disabled='{!generarReporteLotes && !generarReporteRodeos}' onclick={()=>generarReportePersonalizado = true}>Generar reporte</button>
                    <button class="btn btn-success text-white justify-end" disabled='{generarReporteLotes || generarReporteRodeos}' onclick={()=>generarReporte = true}>Generar reporte general</button>
                </form>
            </div>
        </div>
    </dialog>
    <!--
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
    -->
    {#if generarReporte}
            <div class="overflow-x-auto">
            <table>
                <thead>
                    <tr>
                        <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Establecimiento</th>
                        <th class="text-base mx-1 px-1">Total</th>
                        {#each categoriasrows as c}
                            <th class="text-base mx-1 px-1">{c.nombre}</th>
                        {/each}          
                        
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10 border-b">{cab.nombre}</td>
                        <td class="text-base mx-1 px-1 border-b">{total}</td>
                        {#each categoriasrows as c}
                            <th class="text-base mx-1 px-1 border-b">{c.total}</th>
                        {/each}
                    </tr>
                </tbody>
            </table>
            </div>
           
    {/if}
    {#if generarReportePersonalizado}
        {#if generarReporteRodeos}
            {#each rodeosrows as r}
                <table>
                    <thead>
                        <tr>
                            <th class="text-base justify-start">Nombre del rodeo</th>
                            <th class="text-base mx-1 px-1">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-base  border-b justify-start">
                                <button 
                                    aria-label="Filtrar" 
                                    class="w-full"
                                    onclick={clickFilter}
                                >
                                <div class="flex justify-between items-center px-1">
                                    <h1 class="font-semibold text-lg py-2">{r.nombre}</h1>
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        class={`size-6 transition-all duration-300 ${isOpenFilter? 'transform rotate-180':''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>            
                                </button>
                                {#if isOpenFilter}
                                    <div transition:slide>
                                        {#each r.categoriasrodeos as cr}
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Categoria</th>
                                                        <th class="text-base mx-1 px-1">Total</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10 border-b">{cr.nombre}</td>
                                                        <td class="text-base mx-1 px-1 border-b">{cr.total}</td>
                                                    </tr>
                                                </tbody>
                                            </table>
                                        {/each}
                                    </div>
                                {/if}
                            </td>
                            <td class="text-base mx-1 px-1 border-b">{r.total}</td>
                        </tr>
                    </tbody>
                </table>
            {/each}
        {/if}
        {#if generarReporteLotes}
            {#each lotesrows as l,i}
                <table>
                    <thead>
                        <tr>
                            <th class="text-base ml-3 pl-3 mr-1 pr-1 justify-start">Nombre del lote</th>
                            <th class="text-base mx-1 px-1">Total</th>

                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10 border-b justify-start">
                                <button 
                                    aria-label="Filtrar" 
                                    class="w-full"
                                    onclick={()=>clickFilterlote(i)}
                                >
                                <div class="flex justify-between items-center px-1">
                                    <h1 class="font-semibold text-lg py-2">{l.nombre}</h1>
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        class={`size-6 transition-all duration-300 ${opensFilterlotes[i]? 'transform rotate-180':''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>            
                                </button>
                                {#if opensFilterlotes[i]}
                                    <div transition:slide>
                                    {#each l.categoriaslotes as cl}
                                        <table >
                                            <thead>
                                                <tr>
                                                    <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Categoria</th>
                                                    <th class="text-base mx-1 px-1">Total</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10 border-b">{cl.nombre}</td>
                                                    <td class="text-base mx-1 px-1 border-b">{cl.total}</td>
                                                </tr>
                                            </tbody>
                                        </table>
                                    {/each}
                                    </div>
                                {/if}
                            </td>
                            <td class="text-base mx-1 px-1 border-b">{l.total}</td>
                        </tr>
                    </tbody>
                </table>
            {/each}
        {/if}
    {/if}
</Navbarr>