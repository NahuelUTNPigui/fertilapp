<script>
    import { onMount } from "svelte";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Mp from "$lib/components/mercadopago/Mp.svelte";
    import PocketBase from 'pocketbase'
    import Swal from "sweetalert2";
    import { dolar } from "$lib/stores/dolarprecio.svelte";

    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);

    const niveles = [
        {
            nivel:0,precio:0,
            nombre:"Gratuito",
            descripcion:"Ideal para empezar con el establecimiento",
            items:[
                {nombre:"1 establecimientos"},
                {nombre:"3 usuarios"},
                {nombre:"50 animales"}
            ]
        },
        {
            nivel:1,precio:20,
            nombre:"Inicio",
            descripcion:"Ideal para pequeños establecimientos",
            items:[
                {nombre:"1 establecimiento"},
                {nombre:"3 usuarios"},
                {nombre:"50 a 250 animales"}
            ]
        },
        {
            nivel:2,precio:35,
            nombre:"Intermedio",
            descripcion:"Ideal para establecimientos mediano",
            items:[
                {nombre:"2 establecimientos"},
                {nombre:"5 usuarios"},
                {nombre:"251 a 500 animales"}
            ]
        },
        {
            nivel:3,precio:65,
            nombre:"Avanzado",
            descripcion:"Ideal para establecimientos con muchos animales",
            items:[
                {nombre:"3 establecimientos"},
                {nombre:"5 usuarios"},
                {nombre:"501 a 1000 animales"}
            ]
        },
        {
            nivel:4,precio:110,
            nombre:"Ilimitado",
            descripcion:"Pensado para grandes establecimientos",
            items:[
                {nombre:"Establecimientos ilimitados"},
                {nombre:"Usuarios ilimitados"},
                {nombre:"Animales ilimitados"}
            ]
        },    
    ]
    let nivel = $state(0)
    let usuarioid = $state("")
    onMount(async ()=>{
        try{
            dolar.updateDolar()
        }
        catch(err){
            console.error(err)
        }
        
        
        let pb_json = JSON.parse(localStorage.getItem('pocketbase_auth'))
        
        usuarioid =  pb_json.record.id
        
        const record = await pb.collection('users').getOne(usuarioid);
        nivel = record.nivel
    })
    
</script>

<Navbarr>
    <div class="min-h-screen font-sans ">

        <div class="container mx-auto px-4 py-16">
            <div class="text-center mb-16">
                <h1 class="
                    text-4xl md:text-5xl 
                    font-extrabold mb-4 
                    
                    "
                >
                    Elige el plan mas adecuado
                </h1>
                

            </div>
            
            <div 
                class="
                    grid grid-cols-1
                    lg:grid-cols-3 gap-6 
                    max-w-7xl mx-auto"
            >
                
                {#each niveles as n}
                <div 
                    class="
                        hover-scale overflow-hidden 
                        rounded-2xl shadow-lg
                        bg-gray-100 dark:bg-gray-800
                    "
                >
                    {#if nivel == n.nivel}
                    <div class="">
                        <div 
                            class="
                                text-white text-xs font-bold 
                                uppercase tracking-wider py-1 text-center 
                                bg-green-500 dark:bg-green-600
                            "
                        >
                            Elegido
                        </div>
                      </div>
                    {/if}
                    <div 
                        class="
                            p-6
                            bg-gray-50 dark:bg-gray-700 
                        "
                    >
                        <h3
                            class="text-xl font-bold "
                        >
                            {n.nombre}
                        </h3>
                        <div class="mt-4 flex items-baseline">
                            <span class="text-3xl font-extrabold " >
                                ${n.precio}*/mes
                            </span>
                        </div>
                        <p class="mt-2 text-sm  text-gray-500 dark:text-gray-40" >
                            {n.descripcion}
                        </p>
                    </div>
                    <div class="p-6 space-y-4">
                        <ul class="space-y-3">
                            {#each n.items as it}
                            <li class="flex items-start">
                                <svg class="h-5 w-5 mt-0.5 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"></path>
                                </svg>
                                <span class="ml-3 " >{it.nombre}</span>
                            </li>
                            {/each}
                            
                        </ul>
                        {#if nivel != n.nivel}
                            <button 
                                class="
                                    hidden
                                    w-full mt-6 font-medium py-3 
                                    rounded-lg 
                                    bg-green-100 text-green-600 hover:bg-green-200
                                    dark:bg-green-700 dark:text-white dark:hover:bg-green-600
                                "
                                onclick={()=>cambiarPlan(n.nivel)}

                            >
                                Elige nivel {n.nivel}
                            </button>
                            <Mp nivel={n.nivel} {pb} {usuarioid} bind:nivel_actual={nivel}></Mp>
                        {/if}
                    </div>
                </div>
                {/each}
                  
            </div>
            <div class="flex items-center">
                <span class="text-md font-semibold">*Valores expresados en dólares americanos.</span> 
            </div>
            
        </div>
        
    </div>
    
</Navbarr>

<style>
    @keyframes pulse-green {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(16, 185, 129, 0.7);
      }
      50% {
        box-shadow: 0 0 0 15px rgba(16, 185, 129, 0);
      }
    }
    @keyframes pulse-green-dark {
      0%, 100% {
        box-shadow: 0 0 0 0 rgba(5, 150, 105, 0.7);
      }
      50% {
        box-shadow: 0 0 0 15px rgba(5, 150, 105, 0);
      }
    }
    
    .hover-scale {
      transition: transform 0.3s ease;
    }
    .hover-scale:hover {
      transform: scale(1.03);
    }
    
</style>
