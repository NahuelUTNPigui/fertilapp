<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase';
    import { slide } from 'svelte/transition';
    import Swal from "sweetalert2";
    import Chart from 'chart.js/auto';
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

    let ctx;
	let canvas;
    let chart

    let lotesrows = $state([])
    let lotes = $state([])
    let rodeosrows = $state([])
    let rodeos = $state([])
    let categoriasrows = $state([
        {nombre: "Vaca", total: 0, pesoProm: 0},
        {nombre: "Vaquillona", total: 0, pesoProm: 0},
        {nombre: "Ternero", total: 0, pesoProm: 0},
        {nombre: "Novillo", total: 0, pesoProm: 0},
        {nombre: "Torito", total: 0, pesoProm: 0},
        {nombre: "Toro", total: 0, pesoProm: 0}
    ])
    
    let categoriasrodeosrows = $state([])
    let categoriaslotesrows = $state([])

    function createChart(){
        ctx = canvas.getContext('2d');
        if (chart) {
            chart.destroy();
        }

        chart = new Chart(ctx, {
            type: "bar",
            data: {
                labels: [categoriasrows[0].nombre,
                categoriasrows[1].nombre,
                categoriasrows[2].nombre,
                categoriasrows[3].nombre,
                categoriasrows[4].nombre,
                categoriasrows[5].nombre],
                datasets: [
                    {
                        label: "Pesos promedios por categoria",
                        backgroundColor: "rgb(255, 99, 132)",
                        borderColor: "rgb(255, 99, 132)",
                        data: [categoriasrows[0].pesoProm,
                        categoriasrows[1].pesoProm,
                        categoriasrows[2].pesoProm,
                        categoriasrows[3].pesoProm,
                        categoriasrows[4].pesoProm,
                        categoriasrows[5].pesoProm
                        ]
                    }
                ]
            }            
        });
    }

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
        let pesoVaca = 0
        let pesoVaquillona = 0
        let pesoTernero = 0
        let pesoNovillo = 0
        let pesoTorito = 0
        let pesoToro = 0

        for (let i = 0; i < animales.length; i++) {
            total += 1
            if (animales[i].categoria == "vaca"){
                categoriasrows[0].total += 1
                pesoVaca += animales[i].peso
            }
            if (animales[i].categoria == "vaquillona"){
                categoriasrows[1].total += 1
                pesoVaquillona += animales[i].peso
            }
            if (animales[i].categoria == "ternero"){
                categoriasrows[2].total += 1
                pesoTernero += animales[i].peso
            }
            if (animales[i].categoria == "novillo"){
                categoriasrows[3].total += 1
                pesoNovillo += animales[i].peso
            }
            if (animales[i].categoria == "torito"){
                categoriasrows[4].total += 1
                pesoTorito += animales[i].peso
            }
            if (animales[i].categoria == "toro"){
                categoriasrows[5].total += 1
                pesoToro += animales[i].peso
            }
        }

        categoriasrows[0].pesoProm = Number((pesoVaca / categoriasrows[0].total).toFixed(2))
        categoriasrows[1].pesoProm = Number((pesoVaquillona / categoriasrows[1].total).toFixed(2))
        categoriasrows[2].pesoProm = Number((pesoTernero / categoriasrows[2].total).toFixed(2))
        categoriasrows[3].pesoProm = Number((pesoNovillo / categoriasrows[3].total).toFixed(2))
        categoriasrows[4].pesoProm = Number((pesoTorito / categoriasrows[4].total).toFixed(2))
        categoriasrows[5].pesoProm = Number((pesoToro / categoriasrows[5].total).toFixed(2))

        createChart()
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
                {nombre: "Vaca", total: 0, pesoProm: 0},
                {nombre: "Vaquillona", total: 0, pesoProm: 0},
                {nombre: "Ternero", total: 0, pesoProm: 0},
                {nombre: "Novillo", total: 0, pesoProm: 0},
                {nombre: "Torito", total: 0, pesoProm: 0},
                {nombre: "Toro", total: 0, pesoProm: 0}
            ]

            let pesoVaca = 0
            let pesoVaquillona = 0
            let pesoTernero = 0
            let pesoNovillo = 0
            let pesoTorito = 0
            let pesoToro = 0

            for (let j = 0;j<animales.length;j++){
                if (animales[j].categoria == "vaca" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[0].total += 1
                    pesoVaca += animales[j].peso
                }
                if (animales[j].categoria == "vaquillona" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[1].total += 1
                    pesoVaquillona += animales[j].peso
                }
                if (animales[j].categoria == "ternero" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[2].total += 1
                    pesoTernero += animales[j].peso
                }
                if (animales[j].categoria == "novillo" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[3].total += 1
                    pesoNovillo += animales[j].peso
                }
                if (animales[j].categoria == "torito" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[4].total += 1
                    pesoTorito += animales[j].peso
                }
                if (animales[j].categoria == "toro" && animales[j].lote == lotes[i].id){
                    lotes[i].categoriaslotes[5].total += 1
                    pesoToro += animales[j].peso
                }
            }

            lotes[i].categoriaslotes[0].pesoProm = Number((pesoVaca / lotes[i].categoriaslotes[0].total).toFixed(2))
            lotes[i].categoriaslotes[1].pesoProm = Number((pesoVaquillona / lotes[i].categoriaslotes[1].total).toFixed(2))
            lotes[i].categoriaslotes[2].pesoProm = Number((pesoTernero / lotes[i].categoriaslotes[2].total).toFixed(2))
            lotes[i].categoriaslotes[3].pesoProm = Number((pesoNovillo / lotes[i].categoriaslotes[3].total).toFixed(2))
            lotes[i].categoriaslotes[4].pesoProm = Number((pesoTorito / lotes[i].categoriaslotes[4].total).toFixed(2))
            lotes[i].categoriaslotes[5].pesoProm = Number((pesoToro / lotes[i].categoriaslotes[5].total).toFixed(2))
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
            opensFilterrodeos.push(false)
            let total = await getAnimalesTotalRodeos(rodeos[i].id)
            rodeos[i].total = total

            let pesoVaca = 0
            let pesoVaquillona = 0
            let pesoTernero = 0
            let pesoNovillo = 0
            let pesoTorito = 0
            let pesoToro = 0

            rodeos[i].categoriasrodeos = [
                {nombre: "Vaca", total: 0, pesoProm: 0},
                {nombre: "Vaquillona", total: 0, pesoProm: 0},
                {nombre: "Ternero", total: 0, pesoProm: 0},
                {nombre: "Novillo", total: 0, pesoProm: 0},
                {nombre: "Torito", total: 0, pesoProm: 0},
                {nombre: "Toro", total: 0, pesoProm: 0}
            ]

            for (let j = 0;j<animales.length;j++){
                if (animales[j].categoria == "vaca" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[0].total += 1
                    pesoVaca += animales[j].peso
                }
                if (animales[j].categoria == "vaquillona" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[1].total += 1
                    pesoVaquillona += animales[j].peso
                }
                if (animales[j].categoria == "ternero" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[2].total += 1
                    pesoTernero += animales[j].peso
                }
                if (animales[j].categoria == "novillo" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[3].total += 1
                    pesoNovillo += animales[j].peso
                }
                if (animales[j].categoria == "torito" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[4].total += 1
                    pesoTorito += animales[j].peso
                }
                if (animales[j].categoria == "toro" && animales[j].rodeo == rodeos[i].id){
                    rodeos[i].categoriasrodeos[5].total += 1
                    pesoToro += animales[j].peso
                }
            }

            rodeos[i].categoriasrodeos[0].pesoProm = Number((pesoVaca / rodeos[i].categoriasrodeos[0].total).toFixed(2))
            rodeos[i].categoriasrodeos[1].pesoProm = Number((pesoVaquillona / rodeos[i].categoriasrodeos[1].total).toFixed(2))
            rodeos[i].categoriasrodeos[2].pesoProm = Number((pesoTernero / rodeos[i].categoriasrodeos[2].total).toFixed(2))
            rodeos[i].categoriasrodeos[3].pesoProm = Number((pesoNovillo / rodeos[i].categoriasrodeos[3].total).toFixed(2))
            rodeos[i].categoriasrodeos[4].pesoProm = Number((pesoTorito / rodeos[i].categoriasrodeos[4].total).toFixed(2))
            rodeos[i].categoriasrodeos[5].pesoProm = Number((pesoToro / rodeos[i].categoriasrodeos[5].total).toFixed(2))
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
    function clickFilterrodeo(i){
        opensFilterrodeos[i] = !opensFilterrodeos[i]
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
    {#if generarReporte}
            <div class="overflow-x-auto">
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
        </div>
        
    {/if}
    {#if generarReporte}
        {#each categoriasrows as c}
            <table>
                <thead>
                    <tr>
                        <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Categoria</th>
                        <th class="text-base mx-1 px-1">Total</th>
                        <th class="text-base mx-1 px-1">Peso promedio</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10 border-b">{c.nombre}</td>
                        <td class="text-base mx-1 px-1 border-b">{c.total}</td>
                        <td class="text-base mx-1 px-1 border-b">{c.pesoProm}</td>
                    </tr>
                </tbody>
            </table>
        {/each}
        <div>
            <button
                aria-label="Evolucion"
                onclick={()=>chartpesaje.showModal()}
                class={`
                    ${estilos.sinbordes} ${estilos.chico} ${estilos.primario}
                `}
            >
                Mostrar grafico
            </button>
        </div>      
    {/if}
    {#if generarReportePersonalizado}
        {#if generarReporteRodeos}
            {#each rodeosrows as r, i}
                <table>
                    <thead>
                        <tr>
                            <th class="text-base justify-start">Nombre del rodeo</th>
                            <th class="text-base mx-1 px-1">Total</th>
                        </tr>
                    </thead>
                    <tbody>
                        <tr>
                            <td class="text-base border-b justify-start">
                                <button 
                                    aria-label="Filtrar" 
                                    class="w-full"
                                    onclick={()=>clickFilterrodeo(i)}
                                >
                                <div class="flex justify-between items-center px-1">
                                    <h1 class="font-semibold text-lg py-2">{r.nombre}</h1>
                                    <svg 
                                        xmlns="http://www.w3.org/2000/svg" 
                                        class={`size-6 transition-all duration-300 ${opensFilterrodeos[i]? 'transform rotate-180':''}`}
                                        fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                    </svg>
                                </div>            
                                </button>
                                {#if opensFilterrodeos[i]}
                                    <div transition:slide>
                                        {#each r.categoriasrodeos as cr}
                                            <table>
                                                <thead>
                                                    <tr>
                                                        <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Categoria</th>
                                                        <th class="text-base mx-1 px-1">Total</th>
                                                        <th class="text-base mx-1 px-1">Peso Promedio</th>
                                                    </tr>
                                                </thead>
                                                <tbody>
                                                    <tr>
                                                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10 border-b">{cr.nombre}</td>
                                                        <td class="text-base mx-1 px-1 border-b">{cr.total}</td>
                                                        <td class="text-base mx-1 px-1 border-b">{cr.pesoProm}</td>
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
                                                    <th class="text-base mx-1 px-1">Peso Promedio</th>
                                                </tr>
                                            </thead>
                                            <tbody>
                                                <tr>
                                                    <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10 border-b">{cl.nombre}</td>
                                                    <td class="text-base mx-1 px-1 border-b">{cl.total}</td>
                                                    <td class="text-base mx-1 px-1 border-b">{cl.pesoProm}</td>
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
    <dialog id="chartpesaje" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl ">
        <div 
            class="
                modal-box  max-w-5xl
                bg-gradient-to-br from-white to-gray-100 
                dark:from-gray-900 dark:to-gray-800
            "
        >
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
            </form> 
            <h3 class="text-lg font-bold">Pesos promedios</h3>  
            <div class="chart-container justify-items-center">
                <canvas class="" bind:this={canvas} >
                </canvas>
            </div>
            
            <div class="modal-action justify-start ">
                <button class="btn btn-error text-white" onclick={()=>chartpesaje.close()}>Cerrar</button>
            </div>
        </div>
    </dialog>
    <style>
    .chart-container {
        width: 800px;
        height:400px;
     }
    </style>
</Navbarr>