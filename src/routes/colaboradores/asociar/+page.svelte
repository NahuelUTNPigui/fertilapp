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
    let usuarios = $state([])
    let colabs = $state([])
    let usuario = $state({
        username:"",
        email:"",
        id:""
    })
    let colab = $state({
        nombre:"",
        apellido:"",
        telefono:"",
        id:""
    })
    let mostarColab = $state(false)
    function sortByNombre(lista){
        if(lista.length==0){
            return lista
        }
        lista.sort((a,b)=>a.apellido<b.apellido?-1:1)


    }
    function clickColab(id){
        
        let c = colabs.filter(co=>co.id==id)[0]
        let us = usuarios.filter(u=>u.id==c.user)[0] 
        usuario.email = us.email
        usuario.username = us.username
        colab.nombre = c.nombre
        colab.apellido= c.apellido
        colab.id=id
        usuario.id=c.user
        mostarColab = true
        
    }
    function clickUsuario(id){
        usuario.id = id
        let us = usuarios.filter(u=>u.id==id)[0]
        
        usuario.email = us.email
        usuario.username = us.username
        colab.nombre = ""
        colab.apellido=""
        colab.telefono = ""
        colab.id=""
        
        modalNuevoAsociarColaborador.show()
    }
    async function getUsuarios() {
        const records = await pb.collection('users').getFullList({
            sort: '-username',
        });
        usuarios = records
        
    }
    async function getColabs() {
        const records = await pb.collection('colaboradores').getFullList({
            sort: '-apellido',
        });
        colabs = records
        
    }
    async function guardarColaborador(){
        let data ={
            existeColab:colab.id!="",
            colabid:colab.id,
            nombre:colab.nombre,
            apellido:colab.apellido,
            telefono:colab.telefono
        }
        try{
            if(data.existeColab){
                
                let estxcolabdata = {
                    colab:data.colabid,
                    cab:cab.id
                }
                const recordexc = await pb.collection('estxcolabs').create(estxcolabdata);
                let permisosdata={
                    estxcolab:recordexc.id,
                    permisos:""
                }
                await pb.collection('permisos').create(permisosdata);
            }
            else{
                let colabdata={
                    nombre:data.nombre,
                    apellido:data.apellido,
                    telefono:data.telefono,
                    user:usuario.id
                }
                const recordcolab = await pb.collection('colaboradores').create(colabdata);
                let estxcolabdata = {
                    colab:recordcolab.id,
                    cab:cab.id
                }
                const recordexc = await pb.collection('estxcolabs').create(estxcolabdata);
                let permisosdata={
                    estxcolab:recordexc.id,
                    permisos:""
                }
                await pb.collection('permisos').create(permisosdata);
            }
            
            goto("/establecimiento")   
        }
        catch(err){
            console.error(err)
        }
    }
    function volver(){
        goto("/establecimiento")
    }
    onMount(async ()=>{
        await getUsuarios()
        await getColabs()
    })
</script>
<Navbarr>
    <div class="mx-9 mt-1">
        <div>
            <button aria-label="volver" class={`btn ${estilos.btnsecondary}`} onclick={volver}>
                Volver         
            </button>
        </div>
    </div>
    <div class="bg-transparent p-2">
        <div class="flex items-center justify-center">
            <div 
                class={`
                    bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2 w-full 
                    max-w-5xl
                `}
            >
                <h1 class="text-2xl font-bold text-green-700 dark:text-green-400 mb-3 text-start">Datos</h1>
                <div class="grid grid-cols-3">
                    {#if usuario.id !=""}
                    <div>
                        <label for = "usuario" class="label">
                            <span class="label-text text-base">Usuario</span>
                        </label>
                        <label for="nombre" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {usuario.username}
                        </label>
                    </div>
                    <div class="col-span-2">
                        <label for = "usuario" class="label ">
                            <span class="label-text text-base">Correo</span>
                        </label>
                        <label for="nombre" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {usuario.email}
                        </label>
                    </div>
                    
                    <div>
                        <label for = "nombre" class="label">
                            <span class="label-text text-base">Nombre</span>
                        </label>
                        <label for="nombre" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {colab.nombre}
                        </label>
                    </div>
                    <div>
                        <label for = "apellido" class="label">
                            <span class="label-text text-base">Apellido</span>
                        </label>
                        <label for="nombre" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {colab.apellido}
                        </label>
                    </div>
                    <div>
                        <label for = "telefono" class="label">
                            <span class="label-text text-base">Telefono</span>
                        </label>
                        <label for="telefono" 
                            class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-1`}
                        >
                            {colab.telefono}
                        </label>
                    </div>
                    <div>
                        <div>
                            <button class={estilos.mediumsolidgreen}
                            onclick={guardarColaborador}
                            >
                                Guardar
                            </button>
                        </div>
                    </div>
                    {/if}
                </div>
            </div>
        </div>
    </div>
    <div role="tablist" class="tabs tabs-lifted">
        <input type="radio" name="my_tabs_2" role="tab" class="tab" aria-label="Usuarios" />
        <div role="tabpanel" class="tab-content bg-transparent border-base-300 rounded-box p-6">
            <div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto">
                <table class="table table-lg w-full" >
                    <thead>
                        <tr>
                            <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Usuario</th>
                            <th class="text-base mx-1 px-1">Correo</th>
                        </tr>
            
                    </thead>
                    <tbody>
                        {#each usuarios as u}
                            <tr class=" hover:bg-gray-200 dark:hover:bg-gray-900" onclick={()=>clickUsuario(u.id)}>
                                <td class="text-base ml-3 pl-3 mr-1 pr-1">
                                    {u.username}
                                </td>
                                <th class="text-base mx-1 px-1">{u.email}</th>
                            </tr>

                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
      
        <input
          type="radio"
          name="my_tabs_2"
          role="tab"
          class="tab"
          aria-label="Colaboradores"
          checked="checked" />
        <div role="tabpanel" class="tab-content bg-transparent border-base-300 rounded-box p-6">
            <div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto">
                <table class="table table-lg w-full" >
                    <thead>
                        <tr>
                            <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Apellido</th>
                            <th class="text-base mx-1 px-1">Nombre</th>
                        </tr>
            
                    </thead>
                    <tbody>
                        {#each colabs as c}
                            <tr class=" hover:bg-gray-200 dark:hover:bg-gray-900" onclick={()=>clickColab(c.id)}>
                                <td class="text-base ml-3 pl-3 mr-1 pr-1">
                                    {c.apellido}
                                </td>
                                <th class="text-base mx-1 px-1">{c.nombre}</th>
                            </tr>

                        {/each}
                    </tbody>
                </table>
            </div>
        </div>
      
        
      </div>
</Navbarr>
<dialog id="modalNuevoAsociarColaborador" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
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
        <h3 class="text-lg font-bold">Nueva colaborador</h3>  
        <div class="form-control">
            <label for = "nombre" class="label">
                <span class="label-text text-base">Nombre</span>
            </label>
            <label class="input-group">
                <input id ="nombre" type="text"  
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}   
                    `}
                    bind:value={colab.nombre}
                    
                />
            </label>
            <label for = "ape" class="label">
                <span class="label-text text-base">Apellido</span>
            </label>
            <label class="input-group">
                <input id ="ape" type="text"  
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}   
                    `}
                    bind:value={colab.apellido}
                    
                />
            </label>
            <label for = "tel" class="label">
                <span class="label-text text-base">Teléfono</span>
            </label>
            <label class="input-group">
                <input id ="tel" type="text"  
                    class={`
                        input input-bordered 
                        w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2}   
                    `}
                    bind:value={colab.telefono}
                />
            </label>
        </div>
        
        
    </div>
</dialog>