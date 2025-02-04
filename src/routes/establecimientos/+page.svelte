<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import estilos from '$lib/stores/estilos';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { goto } from "$app/navigation";
    
    import {createPer} from "$lib/stores/permisos.svelte"
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    let establecimientos = $state([])
    let totales = $state([])
    let usuarioid = $state("")
    //Guardar establecimiento 
    function irEstablecimiento(id){
        let caber = createCaber()
        let per = createPer()
        let est = establecimientos.filter(e=>e.id == id)[0]
        caber.setCab(est.nombre,est.id)
        per.setPer("0,1,2,3,4,5",usuarioid)
        goto("/")

    }
    function crearEstablecimiento() {
        goto("nuevo")
    }
    async function getTotalAnimales(cabid){
        const record = await pb.collection("animales").getList(1,2,{
            filter:`active=True && delete=false && cab='${cabid}'`,
        })
        return record.totalItems

    }
    onMount(async ()=>{
        let pb_json = JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.model.id
        const records = await pb.collection("cabs").getFullList({
            filter: `active = True && user = '${usuarioid}'` 

        })
        establecimientos = records
        for(let i = 0;i<establecimientos.length;i++){
            totales.push(await getTotalAnimales(establecimientos[i].id))
        }
    })
</script>
<Navbarr>
    <div class="grid grid-cols-3 mx-1 lg:mx-10 mt-2">
        <div>
            <h1 class="text-2xl font-bold text-green-700 dark:text-green-400 mb-6 ">Tus establecimientos</h1>
        </div>
        <div class="flex col-span-2 justify-end mt-2 lg:mt-0">
            <button class={`btn btn-primary rounded-lg ${estilos.btntext}`} data-theme="forest" onclick={crearEstablecimiento}>
                <span  class="text-xl">Nuevo</span>
            </button>
        </div>
    </div>
        <div class="grid grid-cols-1 gap-2">

        
        {#each establecimientos as e,i}
        <div class="flex items-center justify-center">
            <div 
                class={`
                        bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2 w-full 
                        max-w-5xl
                `}
            >
                <h1 class="text-2xl font-bold  mb-1 text-start p-2">{e.nombre}</h1>
                <div class="p-2 grid grid-cols-3 lg:grid-cols-6">

                    <span class="text-xl font-semibold text-start">Direccion:</span>

                    <span class="text-xl font-medium text-end">{e.direccion}</span>
                </div>
                <div class="p-2 grid grid-cols-3 lg:grid-cols-6">

                    <span class="text-xl font-semibold text-start">Animales:</span>

                    <span class="text-xl font-medium text-end">{totales[i]}</span>
                </div>
                <div class="p-2">
                    <button onclick={()=>irEstablecimiento(e.id)} class={`mt-3  hover:text-gray-500 dark:hover:text-gray-600 inline-flex items-center `}>Ir establecimiento
                        <svg fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"
                            stroke-width="2" class="w-4 h-4 ml-2" viewBox="0 0 24 24">
                            <path d="M5 12h14M12 5l7 7-7 7"></path>
                        </svg>
                    </button>
                </div>
                
                
            </div>
        </div>
        {/each}
    </div>
    

    

</Navbarr>
