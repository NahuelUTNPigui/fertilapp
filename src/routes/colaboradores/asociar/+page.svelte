<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Swal from 'sweetalert2'
    import PocketBase from 'pocketbase'
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import { createCaber } from "$lib/stores/cab.svelte";
    import permisos from '$lib/stores/permisos';
    import estilos from '$lib/stores/estilos';
    import CardBase from '$lib/components/CardBase.svelte';
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let caber = createCaber()
    let cab = caber.cab
    let tokencolab = $state("")
    
    function volver(){
        goto("/establecimiento")
    }
    async function asociar() {
        const resultList = await pb.collection('users').getList(1, 1, {
            filter: `codigo = '${tokencolab}'`,
            skipTotal:true
        });        
        if(resultList.items.length == 0){
            Swal.fire("Error colaborador","No existe un usuario con ese codigo","error")

        }
        let userid = resultList.items[0].id
        let nombre = resultList.items[0].nombre
        let apellido = resultList.items[0].apellido
        const resultcolab = await pb.collection('colaboradores').getList(1,1,{
            filter:`user = '${userid}'`,
            skipTotal:true
        })
        
        let existecolab = resultcolab.items.length == 0
        if(existecolab){
            try{    
                let colabid = resultcolab.items[0].id
                //Creo la asociación
                let dataestxcolab = {
                    cab:cab.id,
                    colab:colabid
                }
                const recordestxcolab = await pb.collection('estxcolabs').create(dataestxcolab);
                //Debo crear los permisos para el colaborador
                let datapermisos = {
                    estxcolab:recordestxcolab.id,
                    permisos:""
                }
                const recordpermisos = await pb.collection('permisos').create(datapermisos);
                Swal.fire("Éxito asociar","Se pudo asociar el usuario","success")
                tokencolab = ""
            }
            catch(err){
                console.error(err)
                Swal.fire("Error asociar","No se pudo asociar el usuario","error")
                tokencolab = ""
            }


        }
        else{
            try{
                //Debo crear el colaborador
                let data = {
                    nombre:nombre,
                    apellido:apellido,
                    user:userid,
                    telefono:"",
                    rol:""
                }
                const record = await pb.collection('colaboradores').create(data);
                //Creo la asociación
                let dataestxcolab = {
                    cab:cab.id,
                    colab:record.id
                }
                const recordestxcolab = await pb.collection('estxcolabs').create(dataestxcolab);
                //Debo crear los permisos para el colaborador
                let datapermisos = {
                    estxcolab:recordestxcolab.id,
                    permisos:""
                }
                const recordpermisos = await pb.collection('permisos').create(datapermisos);
                Swal.fire("Éxito asociar","Se pudo asociar el usuario","success")
                tokencolab = ""
            }   
            catch(err){
                console.error(err)
                Swal.fire("Error asociar","No se pudo asociar el usuario","error")
                tokencolab = ""

            }
        }
    }
    onMount(async ()=>{
        
        //await getUsuarios()
        //await getColabs()
    })
</script>
<Navbarr>
    <div class="mx-1 mt-1">
        <div>
            <button aria-label="volver" class={`btn ${estilos.btnsecondary}`} onclick={volver}>
                Volver         
            </button>
        </div>
    </div>
    <div class="min-h-screen flex items-start justify-center">
        <div
            class={`
                bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-8 w-full
                max-w-xl
            `}
        >
            <h2 class="text-xl font-bold text-green-700 dark:text-green-400 mb-6 text-start">Código de colaboración</h2>
            <div class="flex space-x-4">
                <input 
                    id ="token" 
                    type="text"  
                    class={`
                        input 
                        input-bordered 
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                        flex-grow
                        ${estilos.bgdark2}
                    `}
                    bind:value={tokencolab}
                />    
                <button class="mt-1 btn btn-success text-white text-xl " onclick={asociar} >Asociar</button>
            </div>
        </div>
    </div>    
</Navbarr>
