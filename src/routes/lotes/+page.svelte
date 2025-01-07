<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import estilos from '$lib/stores/estilos';
    import { createCaber } from '$lib/stores/cab.svelte';
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    let caber = createCaber()
    let cab = caber.cab

    //Datos para mostrar
    let lotes = $state([])
    let lotesrows = $state([])
    let buscar = $state("")
    let mostrarVacios =$state(true)


    //Guardar
    let idlote = $state("")
    let nombre = $state("")
    //validacciones
    let malnombre = $state(false)
    let botonhabilitado = $state(false)
    function ordenar(lista){
        lista.sort((r1,r2)=>r1.nombre.toLocaleLowerCase()>r2.nombre.toLocaleLowerCase()?1:-1)
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
            let total = await getAnimalesTotal(lotes[i].id)
            lotes[i].total = total
        }
    }
    function openNewModal(){
        idlote = ""
        nombre = ""
        nuevoModal.showModal()
    }
    async function guardar(){
        try{
            let data = {
                nombre,
                active:true,
                cab:cab.id
            }
            let record = await pb.collection('lotes').create(data);
            record.total = 0
            lotes.push(record)
            ordenar(lotes)
            filterUpdate()
            Swal.fire("Éxito guardar","Se pudo guardar el lote","success")
        }catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar el lote","error")
        }
    }
    function openEditModal(id){
        idlote = id
        let lote = lotes.filter(r=>r.id==idlote)[0]
        nombre = lote.nombre
    
        nuevoModal.showModal()
    }
    async function editar(id){
        
        try{
            let data = {
                nombre
            }
            const record = await pb.collection('lotes').update(idlote, data);
            let idx = lotes.findIndex(r=>r.id==idlote)
            let total = lotes[idx].total
            lotes[idx]=record
            lotes[idx].total = total
            ordenar(lotes)
            filterUpdate()
            Swal.fire("Éxito editar","Se pudo editar el lote","success")
        }
        catch(err){
            console.error(err)
            Swal.fire("Error editar","No se pudo editar el lote","error")
        }
        idlote = ""
        nombre = ""

    }
    async function eliminar(id){
        Swal.fire({
            title: 'Eliminar lote',
            text: '¿Seguro que deseas eliminar el lote?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then(async result => {
            if(result.value){
                idlote = id
                try{
                    let data = {
                        active : false
                    }
                    const record = await pb.collection('lotes').update(idlote, data);
                    lotes = lotes.filter(r=>r.id!=idlote)
                    ordenar(lotes)
                    filterUpdate()
                    //ver como hago para actualizar la lista
                    Swal.fire('Lote eliminada!', 'Se eliminó el lote correctamente.', 'success');
                }
                catch(e){
                    Swal.fire('Acción cancelada', 'No se pudo eliminar el lote', 'error');
                }
                idlote = ""
                nombre = ""
                
            }
        })
    }
    function filterUpdate(){
        lotesrows = lotes
        if(buscar != ""){
            lotesrows = lotesrows.filter(r=>r.nombre.toLocaleLowerCase().includes(buscar.toLocaleLowerCase()))
        }
    }
    function cerrarModal(){
        idlote = ""
        nombre = ""
        nuevoModal.close()
    }
    async function getAnimalesTotal(id){
        const results = await pb.collection('animales').getList(1, 10, {
            filter: `active = true && delete = false && lote='${id}'`,
        });
        return results.totalItems
    }
    onMount(async ()=>{
        await getLotes()
    })
    function isEmpty(str){
        return (!str || str.length === 0 );
    }
    function validarBoton(){
        botonhabilitado = true
        if(isEmpty(nombre)){
            botonhabilitado = false
        }

    }
    function oninput(){
        validarBoton()

        if(isEmpty(nombre)){
            malnombre = true
        }
        else{
            malnombre = false
        }
    }
</script>
<Navbarr>
    <div class="grid grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div>
            <h1 class="text-2xl">Lote</h1>
        </div>
        <div>
            <button class={`btn btn-primary ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                <span  class="text-xl">Nuevo</span>
            </button>
        </div>
    </div>
    <div class="grid grid-cols-3 lg:grid-cols-4 m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10" >
        <div class="col-span-2">
            <label class={`input input-bordered flex items-center gap-2 ${estilos.bgdark2}`}>
                <input type="text" class="grow" placeholder="Buscar..." bind:value={buscar} oninput={filterUpdate} />
            </label>
        </div>
        <div>
            <div class="form-control ">
                <label class="label cursor-pointer flex justify-start gap-2">
                  <span class="label-text text-lg">Vacios</span>
                  <input type="checkbox" class="checkbox" bind:checked={mostrarVacios}/>
                </label>
            </div>
        </div>
    </div>
    <!--<div class="grid grid-cols-1 lg:grid-cols-1  m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10" >
        <div class="w-11/12 lg:w-1/2">
            <label class={`input input-bordered flex items-center gap-2 ${estilos.bgdark2}`}>
                <input type="text" class="grow" placeholder="Buscar..." bind:value={buscar} oninput={filterUpdate} />
            </label>
        </div>
        <div class="w-11/12 lg:w-1/2">
            <button class={`w-full btn flex btn-primary ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                <span  class="text-xl">Nuevo Lote</span>
            </button>
        </div>
        <div>
            <span class="text-base">Mostrar lotes vacios</span>
            <br>
            <input type="checkbox" class="toggle"bind:checked={mostrarVacios}/>
        </div>
    </div>-->
    <div class="w-full grid grid-cols-1 justify-items-center mx-1 lg:mx-10 lg:w-3/4">
        <table class="table table-lg w-full " >
            <thead>
                <tr>
                    <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Nombre</th>
                    <th class="text-base mx-1 px-1">Total</th>
                    <!--<th class="text-base mx-1 px-1">Acciones</th>-->
                </tr>
            </thead>
            <tbody>
                {#each lotesrows as r}
                    {#if r.total != 0 || mostrarVacios}                    
                    <tr onclick={()=>openEditModal(r.id)}>
                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{r.nombre}</td>
                        <td class="text-base mx-1 px-1">{r.total}</td>
                        <!--<td class="flex gap-2 text-base mx-1 px-1">
                            <div class="tooltip" data-tip="Editar">
                                <button aria-label="Editar" onclick={()=>openEditModal(r.id)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                                  </svg>
                                </button>
                            </div>
                            <div class="tooltip" data-tip="Eliminar">
                                <button aria-label="Eliminar" onclick={()=>eliminar(r.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>                              
                                </button>
                            </div>
                        </td>-->
                    </tr>
                    {/if}
                {/each}
            </tbody>
        </table>
    </div>
    <dialog id="nuevoModal" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
        <div 
            class="
                modal-box w-11/12 max-w-xl
                bg-gradient-to-br from-white to-gray-100 
                dark:from-gray-900 dark:to-gray-800
            ">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
            </form>
            {#if idlote == ""}
                <h3 class="text-lg font-bold">Nuevo Lote</h3>  
            {:else}
                <h3 class="text-lg font-bold">Ver Lote</h3>  
            {/if}
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
                        bind:value={nombre}
                        oninput={oninput}
                    />
                    {#if malnombre}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe escribir el nombre del lote</span>                    
                        </div>
                    {/if}
                </label>
            </div>
            <div class="modal-action justify-start">
                <form method="dialog" >
                    <!-- if there is a button, it will close the modal -->
                    {#if idlote==""}
                        <button class="btn btn-success text-white" disabled='{!botonhabilitado}' onclick={guardar} >Guardar</button>  
                    {:else}
                        <button class="btn btn-success text-white" disabled='{!botonhabilitado}' onclick={editar} >Editar</button>  
                        <button class="btn btn-error text-white" onclick={()=>eliminar(idlote)}>Cancelar</button>
                    {/if}
                </form>
            </div>
        </div>
    </dialog>
</Navbarr>