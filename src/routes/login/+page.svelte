<script>
    import {enabled} from '$lib/stores/enabled'
    import {usuario} from '$lib/stores/usuario'
    import { createCaber } from '$lib/stores/cab.svelte';
    import {createPer} from "$lib/stores/permisos.svelte"
    import Swal from 'sweetalert2'
    import { goto } from '$app/navigation';
    import Oscuro from "$lib/components/OscuroLogin.svelte";
    import PocketBase from 'pocketbase'
    import { fade, fly } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    
    
    let ruta = import.meta.env.VITE_RUTA
    let usuarioname=''
    let contra = ''
    function isEmpty(str) {
        return (!str || str.length === 0 );
    }
    function nuevo(){
        goto("/user/new")
    }
    async function ingresar(){
        if(isEmpty(usuarioname)){
            Swal.fire('Error login', 'Nombre usuario vacio', 'error');
            return
        }
        if (isEmpty(contra)){
            Swal.fire('Error login', 'Contraseña vacia', 'error');
            return
        }
        
        const pb = new PocketBase(ruta);

        try{
            let caber = createCaber()
            let per = createPer()
            const authData = await pb.collection('users').authWithPassword(
                usuarioname,
                contra,
            );

            if(pb.authStore.isValid){
                if(pb.authStore.model.active){
                    
                    usuario.set(pb.authStore.token)
                    enabled.set("si")
                    // Cuando te logeas, deberia revisar si tenes una cabaña
                    
                    try{
                        const record = await pb.collection('cabs').getFirstListItem(`user='${authData.record.id}' && active=true`, {});
                        caber.setCab(record.nombre,record.id)
                        per.setPer("0,1,2,3,4,5",authData.record.id)
                    }
                    catch(err){
                        try{
                            const recordcab = await pb.collection('estxcolabs').getFirstListItem(`colab.user='${authData.record.id}'`, {
                                expand: 'colab,cab,colab.user',
                            })
                            const recordper = await pb.collection("permisos").getFirstListItem(`estxcolab='${recordcab.id}'`)
                            per.setPer(recordper.permisos,authData.record.id)
                            caber.setCab(recordcab.expand.cab.nombre,recordcab.expand.cab.id)
                            
                        }
                        catch(err){
                            caber.setDefault()
                            per.setDefault()
                        }
                        
                    }
                    goto('/')
                }
                else{
                    Swal.fire('Error login', 'El usuario esta eliminado', 'error');
                }
                
            }
            else{
                Swal.fire('Error login', 'Mal puestas las credenciales', 'error');
            }
        }
        catch(e){
            console.log(e)
            Swal.fire('Error login', 'No se puede logear, puede que esten mal escritas las credenciales', 'error');
        }
        
        
    }
    
    function keyEvent(e){
        if(e.code=="Enter"){
            if(usuarioname !="" && contra !=""){
                ingresar()
            }
        }
    }
</script>
<svelte:window on:keydown={keyEvent}></svelte:window>
<div class="min-h-screen bg-gradient-to-br from-green-400 to-green-700  dark:from-gray-900 dark:to-gray-800 p-4">
    <div class="flex justify-end m-10">
        <Oscuro></Oscuro>
    </div>
    <div class="flex items-center justify-center">
        <div 
            class="bg-white dark:bg-gray-800 rounded-lg shadow-2xl p-8 max-w-md w-full"
            in:fly="{{ y: 50, duration: 200, easing: quintOut }}"
            out:fade
        >
        
            <h1 class="text-3xl font-bold text-green-700 dark:text-green-400 mb-6 text-center">Bienvenido a Fertil</h1>
            <div class="space-y-6">
                <div>
                    <label for="username" 
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Email
                    </label>
                    <input 
                        type="username" 
                        id="username" 
                        bind:value={usuarioname} 
                        required 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
                <div>
                    <label for="password" 
                        
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Contraseña
                    </label>
                    <input 
                        type="password" 
                        id="password" 
                        bind:value={contra} 
                        required 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
                <div>
                    <button 
                        class="w-full bg-green-600 text-white rounded-md py-2 px-4 hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-offset-2 transition" 
                        onclick={ingresar}
                    >
                        Ingresar
                    </button>
                </div>
                
            </div>
            <!--<div class="mt-6 text-center">
                <a href="#" 
                    class="text-sm text-green-600 dark:text-green-400 hover:text-green-800 dark:hover:text-green-300 transition"
                >
                    ¿Olvidaste la contraseña?
                </a>
            </div>
            -->
            <div class="mt-8 border-t border-gray-200 pt-6 text-center">
                <p class="text-sm text-gray-600 dark:text-gray-400">
                    ¿No tienes una cuenta?
                    <a 
                        href="/user/new" 
                        class="font-medium text-green-600 dark:text-green-400  hover:text-green-800 dark:hover:text-green-300 transition"
                    >
                        Crear una
                    </a>
                </p>
            </div>

        </div>
    </div>
</div>