<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import estilos from "$lib/stores/estilos";
    import PocketBase from 'pocketbase'
    import categorias from "$lib/stores/categorias";
    let{cabid,categoria} = $props()
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]

    let id = $state("")
    //Nuevo tratamiento
    let tratamientos = $state([])
    let tipotratamientos = $state([])
    let fecha = $state("")
    let tipo = $state("")
    let observacion = $state("")
    //Detalle tratamiento
    let idtratamiento  = $state("")
    let caravana = $state("")
    function openEditModal(id){
        idtratamiento = id

        let tratamiento = tratamientos.filter(t=>t.id==id)[0]
        
        fecha = tratamiento.fecha.split(" ")[0]
        
        

        tipo = tratamiento.tipo
        categoria = tratamiento.categoria
        observacion = tratamiento.observacion
        
        editModal.showModal()

    }
    function cerrarModal(){
        idtratamiento = ""
        fecha = ""
        tipo = ""
        categoria = ""
        
    }
    async function getTiposTratamientos(){
        const records = await pb.collection('tipotratamientos').getFullList({
            filter : `(cab='${cabid}' || generico = true) && active = true`,
            sort: '-nombre',
        });
        tipotratamientos = records
        tipotratamientos.sort((tp1,tp2)=>tp1.nombre>tp2.nombre?1:-1)
    }
    async function getTratamientos(){
        const records = await pb.collection('tratamientos').getFullList({
            sort: '-fecha ',
            filter :`animal = '${id}' && active=true`,
            expand:"tipo"
            
        });
        tratamientos = records
    }
    function openNewModal(){
        tipo = ""
        fecha = ""
        nuevoTratamiento.showModal()
    }

    async function guardarTratamiento(){
        try{
            let data = {
                animal:id,
                categoria,
                tipo,
                fecha:fecha +" 03:00:00",
                active : true,
                observacion,
                cab:cabid
            }
            
            const  record = await pb.collection("tratamientos").create(data)
            await getTratamientos()
        }
        catch(err){
            console.error(err)
        }
    }
    onMount(async ()=>{
        id = $page.params.slug
        await getTratamientos()
        await getTiposTratamientos()
    })
</script>
<div class="w-full flex justify-items-start gap-2">
    <div>
        <button
            aria-label="Nuevo"
            onclick={()=>openNewModal()}
            class={`
                ${estilos.sinbordes} ${estilos.chico} ${estilos.primario}
            `}
        >
            Nuevo
        </button>
    </div>
</div>
<div class="w-full flex justify-items-center lg:w-3/4 overflow-x-auto">
    {#if tratamientos.length == 0}
        <p class="mt-5 text-lg">No hay tratamientos</p>
    {:else}
        <div class="hidden w-full md:grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto">
            <table class="table table-lg" >
                <thead>
                    <tr>
                        <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Fecha</th>
                        <th class="text-base mx-1 px-1">Tratamiento</th>
                        <th class="text-base mx-1 px-1">Categoria</th>
                    </tr>
                </thead>
                <tbody>
                    {#each tratamientos as t}
                        <tr onclick={()=>openEditModal(t.id)} class=" hover:bg-gray-200 dark:hover:bg-gray-900">
                            <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{new Date(t.fecha).toLocaleDateString()}</td>
                            <td class="text-base mx-1 px-1">
                                {t.expand.tipo.nombre}
                            </td>
                            <td class="text-base mx-1 px-1">{t.categoria}</td>

                        </tr>
                    {/each}
                </tbody>
            </table>
        </div> 
        <div class="block w-full md:hidden justify-items-center mx-1">
            {#each tratamientos as t}
            <div class="card  w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900">
                <button onclick={()=>openEditModal(t.id)}>
                    <div class="block p-4">
                        <div class="grid grid-cols-2 gap-y-2">
                            <div class="flex items-start">
                                <span >Fecha:</span> 
                                <span class="mx-1 font-semibold">
                                    {new Date(t.fecha).toLocaleDateString()}
                                </span>
                                
                            </div>
                            <div class="flex items-start">
                                <span >Tipo:</span> 
                                <span class="mx-1 font-semibold">
                                    {`${t.expand.tipo.nombre}`}
                                </span>
                            </div>
                            <div class="col-span-2 flex items-start">
                                <span >{`${t.observacion}`}</span> 
                                
                            </div>
                        </div>
                    </div>
                </button>
            </div>
            {/each}
        </div>      
    {/if}
</div>
<dialog id="nuevoTratamiento" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
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
        <h3 class="text-lg font-bold">Nueva tratamiento</h3>  
        <div class="form-control">
            <label for = "fecha" class="label">
                <span class="label-text text-base">Fecha</span>
            </label>
            <label class="input-group ">
                <input id ="fecha" type="date" max={HOY}  
                    class={`
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={fecha}
                />
            </label>
            <label for = "tipo" class="label">
                <span class="label-text text-base">Tipo tratamiento</span>
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
                    bind:value={tipo}
                >
                    {#each tipotratamientos as t}
                        <option value={t.id}>{t.nombre}</option>    
                    {/each}
                  </select>
            </label>
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
                bind:value={observacion}
            />
        </div>
        <div class="modal-action justify-start ">
            <form method="dialog">
                <button class="btn btn-success text-white" onclick={guardarTratamiento} >Guardar</button>
                <button class="btn btn-error text-white">Cancelar</button>
            </form>
        </div>
    </div>
</dialog>
<dialog id="editModal" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
    <div class="
            modal-box w-11/12 max-w-3xl
            bg-gradient-to-br from-white to-gray-100 
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
        </form>
        <h3 class="text-lg font-bold">Ver tratamiento</h3>  
        <div class="form-control">
            <label for = "fecha" class="label">
                <span class="label-text text-base">Fecha</span>
            </label>
            <label class="input-group ">
                <input id ="fecha" type="date" max={HOY}  
                    class={`
                        input input-bordered w-full
                        border border-gray-300 rounded-md
                        focus:outline-none focus:ring-2 
                        focus:ring-green-500 
                        focus:border-green-500
                        ${estilos.bgdark2} 
                    `}
                    bind:value={fecha}
                    onchange={()=>oninput("FECHA")}
                />

            </label>
            <label for = "categoria" class="label">
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
                    bind:value={categoria} read
                    onchange={()=>oninput("CATEGORIA")}
                >
                    {#each categorias as c}
                        <option value={c.id}>{c.nombre}</option>    
                    {/each}
                </select>

            </label>
            
            <label for = "tipo" class="label">
                <span class="label-text text-base">Tipo tratamiento</span>
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
                    bind:value={tipo}
                    onchange={()=>oninput("TIPO")}
                >
                    {#each tipotratamientos as t}
                        <option value={t.id}>{t.nombre}</option>    
                    {/each}
                </select>
            </label>
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
                    bind:value={observacion}
                />
            </label>

        </div>
        <div class="modal-action justify-start ">
            <form method="dialog" >
              <!-- if there is a button, it will close the modal -->
              
              <button class="btn btn-neutral " onclick={cerrarModal}>Cerrar</button>
              
            </form>
        </div>
    </div>

</dialog>