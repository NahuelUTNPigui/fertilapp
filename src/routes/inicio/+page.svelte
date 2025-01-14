<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Swal from 'sweetalert2'
    import PocketBase from 'pocketbase'
    import { createRoler } from '$lib/stores/defaultrol.svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { createCaber } from "$lib/stores/cab.svelte";
    import CardBase from '$lib/components/CardBase.svelte';
    import categorias from '$lib/stores/categorias';
    import sexos from '$lib/stores/sexos';
    import tipostacto from '$lib/stores/tipostacto';
    import tiposanimal from '$lib/stores/tiposanimal';
    import {guardarHistorial} from "$lib/historial/lib"
    import {isEmpty} from "$lib/stringutil/lib"
    import estilos from '$lib/stores/estilos';
    import estados from "$lib/stores/estados";
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    let usuarioid = $state("")
    let cab = $state({
        exist:false,
        nombre:"",
        id:""
    })
    let caber = createCaber()
    let modoedicion = false
    let animales = $state([])
    //Datos cabaña
    let classbutton = "w-full flex items-center justify-center space-x-4 bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 dark:bg-green-700 dark:hover:bg-green-600"
    //Tacto
    let fechatacto = $state("")
    let observaciontacto = $state("")
    let animaltacto = $state("")
    //Tipo animal
    let categoriatacto = $state("vaca")
    let prenadatacto = $state(0)
    //tipo tacto
    let tipotacto = $state("tacto")
    //Validaciones
    let malfechatacto = $state("")
    let malanimaltacto = $state("")
    let malvet = $state("")
    let botonhabilitadotacto=$state(false)
    //Nacimiento
    //Tratamiento
    //Inseminacion
    //Observacion
    async function getAnimales(){
        //Estaria joya que el animal venga con todos los chiches
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && cab='${cab.id}' && sexo='H'`,
            expand:"nacimiento"
        })
        animales = recordsa
        animales.sort((a1,a2)=>a1.caravana>a2.caravana?1:-1)
    }
    function openNewModalTacto(){ 
        fechatacto = ""
        observaciontacto =  ""
        animaltacto = ""
        categoriatacto = "vaca"
        prenadatacto = 0
        tipotacto = "tacto"
        botonhabilitadotacto = false
        malfechatacto = false
        malanimaltacto = false
        nuevoModalTacto.showModal()
    }
    async function guardarTacto(){
        try{
            let data = {
               fecha:fechatacto +" 03:00:00" ,
               observacion:observaciontacto,
               animal:animaltacto,
               categoria:categoriatacto,
               prenada:prenadatacto,
               tipo:tipostacto,
               nombreveterinario:"",
               cab:cab.id,
               active:true
            }
            const record = await pb.collection('tactos').create(data);
            await pb.collection('animales').update(animal,{
                prenada
            })
            await guardarHistorial(pb,animal)
            Swal.fire("Éxito guardar","Se pudo guardar el tacto","success")
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar el tacto","error")
        }
    }
    function validarBotonTacto(){
        botonhabilitadotacto = true
        if(isEmpty(animaltacto)){
            botonhabilitadotacto=false
        }
        if(isEmpty(fechatacto)){
            botonhabilitadotacto=false
        }
    }
    function onSelectAnimalTacto(){
        let a = animales.filter(an=>an.id==animaltacto)[0]
        categoriatacto = a.categoria
    }
    function oninputTacto(inputName){
        validarBotonTacto()
        if(inputName == "ANIMAL"){
            if(isEmpty(animaltacto)){
                malanimaltacto = true
            }
            else{
                malanimaltacto = false
                onSelectAnimalTacto()
            }
        }   
        if(inputName == "FECHA"){
            if(isEmpty(fechatacto)){
                malfechatacto = true
            }
            else{
                malfechatacto = false
            }
        }
    }
    onMount(async ()=>{
        
        cab = caber.cab
        let pb_json = await JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.model.id
        await getAnimales()
        
    })
 
</script>
<Navbarr>
    
    {#if cab.exist}
        <CardBase titulo="Bievenido a fertil" cardsize="max-w-5xl">
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <a class={classbutton}
                        href="/establecimiento"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                        </svg>
                        Ir a establecimiento
                    </a>
                </div>
                <div>
                    <button class={classbutton}
                    onclick={openNewModalTacto}
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
                        </svg>
                        
                        Nuevo tacto
                    </button> 
                </div>
                <div>
                    <button class={classbutton}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
                          </svg> 
                        Nuevo nacimiento
                    </button> 
                </div>
                <div>
                    <button class={classbutton}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M9.75 3.104v5.714a2.25 2.25 0 0 1-.659 1.591L5 14.5M9.75 3.104c-.251.023-.501.05-.75.082m.75-.082a24.301 24.301 0 0 1 4.5 0m0 0v5.714c0 .597.237 1.17.659 1.591L19.8 15.3M14.25 3.104c.251.023.501.05.75.082M19.8 15.3l-1.57.393A9.065 9.065 0 0 1 12 15a9.065 9.065 0 0 0-6.23-.693L5 14.5m14.8.8 1.402 1.402c1.232 1.232.65 3.318-1.067 3.611A48.309 48.309 0 0 1 12 21c-2.773 0-5.491-.235-8.135-.687-1.718-.293-2.3-2.379-1.067-3.61L5 14.5" />
                          </svg> 
                        Nuevo tratamiento
                    </button> 
                </div>
                <div>
                    <button class={classbutton}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15.362 5.214A8.252 8.252 0 0 1 12 21 8.25 8.25 0 0 1 6.038 7.047 8.287 8.287 0 0 0 9 9.601a8.983 8.983 0 0 1 3.361-6.867 8.21 8.21 0 0 0 3 2.48Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M12 18a3.75 3.75 0 0 0 .495-7.468 5.99 5.99 0 0 0-1.925 3.547 5.975 5.975 0 0 1-2.133-1.001A3.75 3.75 0 0 0 12 18Z" />
                          </svg>
                        Nueva inseminación
                    </button> 
                </div>
                <div>
                    <button class={classbutton}>
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-2">
                            <path stroke-linecap="round" stroke-linejoin="round" d="M2.036 12.322a1.012 1.012 0 0 1 0-.639C3.423 7.51 7.36 4.5 12 4.5c4.638 0 8.573 3.007 9.963 7.178.07.207.07.431 0 .639C20.577 16.49 16.64 19.5 12 19.5c-4.638 0-8.573-3.007-9.963-7.178Z" />
                            <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 1 1-6 0 3 3 0 0 1 6 0Z" />
                          </svg>
                        Nueva observacion
                    </button> 
                </div>
            </div>
        </CardBase>
    {:else}
        <CardBase titulo="Inicio">
            <div class="grid grid-cols-1 gap-6">
                <a class={classbutton}
                    href="/establecimiento"
                >
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6 mx-1">
                        <path stroke-linecap="round" stroke-linejoin="round" d="m21 7.5-2.25-1.313M21 7.5v2.25m0-2.25-2.25 1.313M3 7.5l2.25-1.313M3 7.5l2.25 1.313M3 7.5v2.25m9 3 2.25-1.313M12 12.75l-2.25-1.313M12 12.75V15m0 6.75 2.25-1.313M12 21.75V19.5m0 2.25-2.25-1.313m0-16.875L12 2.25l2.25 1.313M21 14.25v2.25l-2.25 1.313m-13.5 0L3 16.5v-2.25" />
                    </svg>
                    Crear establecimiento
                </a>
            </div>
        </CardBase>
    {/if}
</Navbarr>
<dialog id="nuevoModalTacto" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
    <div 
        class="
            modal-box w-11/12 max-w-xl
            bg-gradient-to-br from-white to-gray-100 
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
        </form>
        
        <h3 class="text-lg font-bold">Nuevo tacto</h3>  
        
        <div class="form-control">
            <label for = "animal" class="label">
                <span class="label-text text-base">Animal</span>
            </label>
            <label class="input-group ">
                <select 
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={animaltacto}
                    onchange={()=>oninputTacto("ANIMAL")}
                >
                    {#each animales as a}
                        <option value={a.id}>{a.caravana}</option>    
                    {/each}
                  </select>
            </label>
            <label for = "tipo" class="label">
                <span class="label-text text-base">Categoria</span>
            </label>
            <label class="input-group ">
                <select 
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={categoriatacto}
                >
                    {#each tiposanimal as t}
                        <option value={t.id}>{t.nombre}</option>    
                    {/each}
                  </select>
            </label>
            <div class="form-group">
                <label for = "prenada" class="label">
                    <span class="label-text text-base">Preñada</span>
                </label>
                <label class="input-group ">
                    <select 
                        class={`
                            select select-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2}
                        `} bind:value={prenadatacto}>
                        {#each estados as e}
                            <option value={e.id}>{e.nombre}</option>    
                        {/each}
                    </select>
                </label>
                <!--<div class="grid grid-cols-3">
                    {#each  estados as e}
                        <div>
                            <button
                                aria-label={`estado ${e.nombre}` }
                                onclick={()=>selectOption(e.id)}
                                class={`
                                    ${
                                        e.id==prenada?
                                        estilos.basicofill:
                                        estilos.basico} 

                                        ${estilos.medio} ${estilos.primario}
                                `}
                            >
                                    {e.nombre}
                            </button>
                            
                        </div>
                    {/each} 
                </div>
                -->
            </div>
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
                    bind:value={fechatacto}
                    onchange={()=>oninputTacto("FECHA")}
                />
                {#if malfechatacto}
                    <div class="label">
                        <span class="label-text-alt text-red-500">Debe seleccionar la fecha del tacto</span>                    
                    </div>
                {/if}
            </label>
            <label for = "tipo" class="label">
                <span class="label-text text-base">Tacto/Ecografia</span>
            </label>
            <label class="input-group ">
                <select 
                    class={`
                        select select-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                    bind:value={tipotacto}
                >
                    {#each tipostacto as t}
                        <option value={t.id}>{t.nombre}</option>    
                    {/each}
                  </select>
            </label>
            <div class="hidden">
            <label for = "vete" class="label">
                <span class="label-text text-base">Veterinario</span>
            </label>
            <label class="input-group">
                <input 
                    id ="vete" 
                    type="text"  
                    class={`
                        hidden
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `}
                />
            </label>
            </div>
            <label class="form-control">
                <div class="label">
                    <span class="label-text">Observacion</span>                    
                </div>
                <input 
                    id ="observacion" 
                    type="text"  
                    class={`
                        input 
                        input-bordered 
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        w-full
                        ${estilos.bgdark2}
                    `}
                    bind:value={observaciontacto}
                />
                <!--
                <textarea style="line-height: 1.3;" 
                    class={`
                        textarea textarea-bordered h-24
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    `} 
                    bind:value={n.observacion} placeholder=""
                ></textarea>
                -->
            </label>
            
            
        </div>
        <div class="modal-action justify-start ">
            <form method="dialog" >
              <!-- if there is a button, it will close the modal -->
              
                <button class="btn btn-success text-white" disabled='{!botonhabilitadotacto}' onclick={guardarTacto} >Guardar</button>
              
              
            </form>
        </div>
    </div>

</dialog>

