<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Swal from 'sweetalert2'
    import PocketBase from 'pocketbase'
    import { createRoler } from '$lib/stores/defaultrol.svelte';
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { createCaber } from "$lib/stores/cab.svelte";
    import CardBase from '$lib/components/CardBase.svelte';
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let usuarioid = ""
    let cab ={
        exist:false,
        nombre:"",
        id:""
    }
    let caber = createCaber()
    let modoedicion = false
    //Datos cabaña
    let nombre = ""
    let direccion = ""
    let contacto = ""
    async function getCabaña(){
        try{
            const record = await pb.collection('cabs').getFirstListItem(`user='${usuarioid}' && active=true`, {});
            nombre = record.nombre
            direccion = record.direccion
            contacto = record.contacto
            caber.setCab(record.nombre,record.id)
        }
        catch(err){
            caber.setDefault()
            nombre = ""
            direccion = ""
            contacto = ""
            goto("/")
        }
        
    }
    async function guardarCabaña(){
        const data = {
            nombre,
            direccion,
            user: usuarioid,
            active: true,
            contacto
        };

        try{
            const record = await pb.collection('cabs').create(data);
            Swal.fire("Exito guadar","Se pudo guardar la cabaña con éxito","success")
            caber.setCab(nombre,record.id)
            goto("/")
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar la cabaña","error")
        }
        
    }
    async function editarCabaña(){
        const data = {
            nombre,
            direccion,
            contacto
        };
        try{
            const record = await pb.collection('cabs').update(cab.id, data);
            Swal.fire("Exito modificar","Se pudo modificar la cabaña con éxito","success")
            caber.setCab(nombre,cab.id)
            
        }
        catch(err){
            console.error(err)
            Swal.fire("Error modificar","No se pudo modificar la cabaña con éxito","error")
        }
    }
    onMount(async ()=>{
        
        cab = caber.cab
        let pb_json = await JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.model.id
        if(cab.exist){
           await getCabaña()
        }
    })
 
</script>
<Navbarr>

    {#if cab.exist}
        <CardBase titulo="Bievenido a fertil" cardsize="max-w-5xl">
            <div class="space-y-6">
                <div>
                    <label for="nombre" 
                        class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1`}
                    >
                        Nombre:
                    </label>
                    {#if !modoedicion}
                        <label for="nombre" 
                            class={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            {nombre}
                        </label>
                    {:else}
                        <input 
                            type="text" 
                            id="nombre"
                            disabled={!modoedicion}
                            bind:value={nombre} 
                            required 
                            class={`
                                w-full px-3 py-2 border rounded-md shadow-sm
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                transition duration-150 ease-in-out
                                ${
                                modoedicion
                                    ? 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }
                            `}
                        />
                    {/if}
                </div>
                <div>
                    <label for="direccion" 
                        class="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Dirección
                    </label>
                    {#if !modoedicion}
                        <label for="direccion" 
                            class={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            {direccion}
                        </label>
                    {:else}
                        <input 
                            type="text" 
                            id="direccion"
                            disabled={!modoedicion}
                            bind:value={direccion} 
                            required 
                            class={`
                                w-full px-3 py-2 border rounded-md shadow-sm
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                transition duration-150 ease-in-out
                                ${
                                modoedicion
                                    ? 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }
                            `}
                        />
                    {/if}
                </div>
                <div>
                    <label for="contacto" 
                        class="block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Contacto
                    </label>
                    {#if !modoedicion}
                        <label for="contacto" 
                            class={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`}
                        >
                            {contacto}
                        </label>
                    {:else}
                        <input 
                            type="text" 
                            id="contacto"
                            disabled={!modoedicion}
                            bind:value={contacto} 
                            required 
                            class={`
                                w-full px-3 py-2 border rounded-md shadow-sm
                                focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                                transition duration-150 ease-in-out
                                ${
                                modoedicion
                                    ? 'border-gray-300 dark:border-gray-600 dark:bg-gray-700 text-gray-900 dark:text-gray-100'
                                    : 'bg-gray-100 dark:bg-gray-600 text-gray-500 dark:text-gray-400 cursor-not-allowed'
                                }
                            `}
                        />
                    {/if}
                    
                </div>
            </div>
            <div class="mt-8 flex justify-end">
                {#if  !modoedicion}
                    <button
                        onclick={()=>modoedicion=true}
                        class=" 
                            btn px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md 
                            text-white font-bold font-lg focus:outline-none 
                            focus:ring-2 focus:ring-offset-2 focus:ring-green-500
                        "
                    >
                        Editar cabaña
                    </button>    
                {:else}
                    <button 
                        onclick={()=>modoedicion=false}
                        class="
                            btn btn-error 
                            text-white 
                            font-bold font-lg
                        "
                    >

                        Cancelar
                    </button>   
                    <button

                        onclick={async ()=>{modoedicion=false;await editarCabaña()}}
                        class="btn px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-bold font-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                        >
                        Guardar
                    </button>    
                {/if}
                
            </div>
        </CardBase>
    {:else}
        <CardBase titulo="Registra tu cabaña">
            <div class="space-y-4">
                
                <div>
                    <label for="nombre" 
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Nombre
                    </label>
                    <input 
                        type="nombre" 
                        id="nombre"
                        
                        bind:value={nombre} 
                        required 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
                <div>
                    <label for="direccion" 
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Dirección
                    </label>
                    <input 
                        type="direccion" 
                        id="direccion"
                        
                        bind:value={direccion} 
                        required 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
                <div>
                    <label for="contacto" 
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Contacto
                    </label>
                    <input 
                        type="contacto" 
                        id="contacto"
                        
                        bind:value={contacto} 
                        required 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>

            </div>
            <div class="mt-8 flex justify-end">
                <button
                    onclick={guardarCabaña}
                    class="
                        btn px-6 py-2 
                        bg-green-600 hover:bg-green-700 
                        rounded-md text-white font-bold text-lg 
                        focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-green-500
                    "
                >
                  Guardar cabaña
                </button>
            </div>
        </CardBase>
    {/if}
</Navbarr>

