<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import estilos from '$lib/stores/estilos';
    import { createCaber } from '$lib/stores/cab.svelte';
    import {createPer} from "$lib/stores/permisos.svelte"
    import { getPermisosList } from '$lib/permisosutil/lib';
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    let caber = createCaber()
    let cab = caber.cab
    let per = createPer()
    let userpermisos = getPermisosList(per.per.permisos)

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
        if(userpermisos[1]){
            idlote = ""
        nombre = ""
        nuevoModal.showModal()
        }
        else{
            Swal.fire("Error lotes","No tienes permisos para guardar lotes","error")
        }
        
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
        <div class="flex col-span-2 gap-1 justify-end">
            <button class={` btn btn-primary rounded-lg ${estilos.btntext} px-2 mx-1`} data-theme="forest" onclick={()=>openNewModal()}>
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
    <div class="w-full grid grid-cols-1 justify-items-center mx-1 lg:mx-10 lg:w-3/4">
        <table class="table table-lg w-full " >
            <thead>
                <tr>
                    <th class="text-base ml-3 pl-3 mr-1 pr-1 border-b dark:border-gray-600">Nombre</th>
                    <th class="text-base mx-1 px-1 border-b dark:border-gray-600">Total</th>
                    
                </tr>
            </thead>
            <tbody>
                {#each lotesrows as r}
                    {#if r.total != 0 || mostrarVacios}                    
                    <tr onclick={()=>openEditModal(r.id)} class=" hover:bg-gray-200 dark:hover:bg-gray-900">
                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{r.nombre}</td>
                        <td class="text-base mx-1 px-1">{r.total}</td>
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
                    <button class="btn btn-neutral " onclick={cerrarModal}>Cerrar</button>
                </form>
            </div>
        </div>
    </dialog>
</Navbarr>