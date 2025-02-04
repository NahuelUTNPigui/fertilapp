<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Swal from 'sweetalert2'
    import PocketBase from 'pocketbase'
    import { onMount } from 'svelte';
    import { goto }  from '$app/navigation';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createDarker } from "$lib/stores/dark.svelte";
    import CardBase from '$lib/components/CardBase.svelte';
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let usuarioid = $state("")
    let username = $state("")
    let usermail = $state("")
    let darker = createDarker()
    let modoedicion = $state(false)

    let cab = $state({
        exist:false,
        nombre:"",
        id:""
    })

    async function editarUsuario(){
        const data = {
            username
        };
        try{
            const record = await pb.collection("users").update(usuarioid, data);
            Swal.fire("Exito modificar","Se pudo modificar el usuario con éxito","success")
            
        }
        catch(err){
            console.error(err)
            Swal.fire("Error modificar","No se pudo modificar el usuario con éxito","error")
        }
    }
    
    onMount(async ()=>{
        let caber = createCaber()
        let pb_json = JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.model.id
        usermail = pb_json.model.email
        username = pb_json.model.username
        let light = !darker.dark
        cab = caber.cab
    })
</script>
<Navbarr>
    <CardBase titulo="Datos usuario" cardsize="max-w-5xl">
        <div class="space-y-6">
            <div>
                <label for="nombre" 
                    class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1`}
                >
                    Nombre de usuario:
                </label>
                {#if !modoedicion}
                    <label for="nombre" 
                        class={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`}
                    >
                        {username}
                    </label>
                {:else}
                    <input 
                        type="text" 
                        id="nombre"
                        disabled={!modoedicion}
                        bind:value={username} 
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
                <label for="mail" 
                    class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1`}
                >
                    Mail:
                </label>
                <label for="mail" 
                    class={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`}
                >
                    {usermail}
                </label>
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
                    Editar usuario
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

                    onclick={async ()=>{modoedicion=false;await editarUsuario()}}
                    class="btn px-6 py-2 bg-green-600 hover:bg-green-700 rounded-md text-white font-bold font-lg focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-green-500"
                    >
                    Guardar
                </button>    
            {/if}
        </div>
    </CardBase>
</Navbarr>