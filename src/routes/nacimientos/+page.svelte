<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import sexos from '$lib/stores/sexos';
    import estilos from '$lib/stores/estilos';
    import { createCaber } from '$lib/stores/cab.svelte';
    let caber = createCaber()
    let cab = caber.cab
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let usuarioid = $state("")
    //Datos filtrar
    let nacimientos = $state([])
    let nacimientosrow = $state([])
    let buscar = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")
    //Datos nacimiento
    let nacimiento = $state(null)
    let idnacimiento = $state("")
    let caravana = $state("")
    let sexo = $state("")
    let padre = $state("")
    let madre = $state("")
    let peso = $state("")
    let nombremadre = $state("")
    let nombrepadre = $state("")
    let fecha = $state("")
    let madres = $state([])
    let padres = $state([])
    let observacion = $state("")
    //Validacion
    let malmadre = $state(false)
    let malpadre = $state(false)
    let malfecha = $state(false)
    function isEmpty(str){
        return (!str || str.length === 0 );
    }
    async function getAnimales(){
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && cab='${cab.id}'`,
            expand:"nacimiento"
        })
        madres = recordsa.filter(a=>a.sexo == "H" || a.sexo == "F")
        padres = recordsa.filter(a=>a.sexo == "M")
    }
    async function getNacimientos(){
        const recordsn = await pb.collection("nacimientosall").getFullList({
            filter:`cab='${cab.id}'`,
            sort:"-fecha",
            expand:"madre,padre"
        })
        nacimientos = recordsn
        nacimientosrow = nacimientos
    }
    async function guardar(){
        try{
            let dataparicion = {
                madre,
                padre,
                fecha:fecha + " 03:00:00",
                nombremadre,
                nombrepadre,
                observacion,
                cab:cab.id
            }
            const recordparicion = await pb.collection('nacimientos').create(dataparicion);
            let data = {
                caravana,
                active:true,
                delete:false,
                fechanacimiento:fecha +" 03:00:00",
                sexo,
                cab:cab.id,
                peso,
                nacimiento:recordparicion.id
            }
            let recorda = await pb.collection('animales').create(data); 
            Swal.fire("Éxito guardar","Se pudo guardar la paricion con exito","success")
            let item = {
                caravana,
                observacion,
                cab,
                nombremadre,
                nombrepadre,
                madre,
                padre,
                fecha:fecha +" 03:00:00"
            }
            nacimientos.push(item)
            
            nacimientos.sort((n1,n2)=>n1.fecha<n2.fecha?-1:1)
            filterUpdate()

            
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","Hubo un error para guardar la parición","error")
        }
    }
    function filterUpdate(){
        nacimientosrow = nacimientos
        if(buscar != ""){
            nacimientosrow = nacimientosrow.filter(n=>n.caravana.startsWith(buscar))
        }
        if(fechadesde != ""){
            nacimientosrow = nacimientosrow.filter(t=>t.fecha>=fechadesde)
        }
        if(fechahasta != ""){
            nacimientosrow = nacimientosrow.filter(t=>t.fecha<=fechahasta)
        }
    }
    function openNewModal(){
        idnacimiento = ""
        caravana = ""
        sexo = ""
        padre = ""
        madre = ""
        nombremadre = ""
        nombrepadre = ""
        fecha = ""
        observacion = ""
        peso=""
        nuevoModal.showModal()
    }
    function openEditModal(id){
        idnacimiento = id
        nacimiento = nacimientos.filter(n=>n.id == id)[0]
        if(nacimiento.padre){
            padre = nacimiento.padre
        }
        else{
            padre = ""
        }
        if(nacimiento.madre ){
            madre = nacimiento.madre
        }
        else{
            madre = ""
        }
        fecha = nacimiento.fecha.split(" ")[0]
        nombremadre = nacimiento.nombremadre
        nombrepadre = nacimiento.nombrepadre
        observacion = nacimiento.observacion
        caravana = nacimiento.caravana
        nuevoModal.showModal()

    }
    function eliminar(id){
        Swal.fire({
            title: 'Eliminar nacimiento',
            text: '¿Seguro que deseas eliminar el nacimiento?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then(async result => {
            if(result.value){
                idnacimiento = id
                
                try{
                    await pb.collection('nacimientos').delete(idnacimiento);
                    nacimientos = nacimientos.filter(n=>n.id!=idnacimiento)
                    filterUpdate()
                    const recorda = await pb.collection('animales').getFirstListItem(`nacimiento='${idnacimiento}'`, {});
                    const recordupdate = await pb.collection('animales').update(recorda.id, {nacimiento:""});

                    Swal.fire('Nacimiento eliminado!', 'Se eliminó el nacimiento correctamente.', 'success');
                }
                catch(e){
                    Swal.fire('Acción cancelada', 'No se pudo eliminar al nacimiento', 'error');
                }
                idnacimiento = ""
                nacimiento = null
                
            }
        })
    }
    onMount(async ()=>{
        let pb_json = await JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.model.id
        await getNacimientos()
        fechadesde = DESDE.toISOString().split("T")[0]
        fechahasta = HASTA.toISOString().split("T")[0]
        filterUpdate()
        await getAnimales()
    })
    function cerrarModal(){
        idnacimiento = ""
        caravana = ""
        sexo = ""
        padre = ""
        madre = ""
        nombremadre = ""
        nombrepadre = ""
        fecha = ""
        observacion = ""
        peso  = ""
        nuevoModal.close()
    }
    function getNombreMadre(){
        let m = madres.filter(item=>item.id == madre)[0]
        nombremadre = m.caravana
    }
    function getNombrePadre(){
        let p = padres.filter(item=>item.id == padre)[0]
        nombrepadre = p.caravana
    }
</script>
<Navbarr>
    <div class="w-full grid justify-items-left mx-1 lg:mx-10 mt-1">
        <h1 class="text-2xl">Nacimientos</h1>  
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4 mx-1 lg:mx-10 mb-2 lg:mb-3" >
        <div class="">
            <label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-first-name">
              Fecha desde
            </label>
            <input id ="fechadesde" type="date"  
                class={`
                    input input-bordered
                    ${estilos.bgdark2}
                `} 
                bind:value={fechadesde} onchange={filterUpdate}
            />
        </div>
        <div class="">
            <label class="block uppercase tracking-wide text-xs font-bold mb-2" for="grid-first-name">
              Fecha Hasta
            </label>
            <input id ="fechadesde" type="date"  
                class={`
                    input input-bordered
                    ${estilos.bgdark2}
                `} 
                bind:value={fechahasta} onchange={filterUpdate}
            />
        </div>
    </div>
    <div class="grid grid-cols-1 m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10 w-11/12" >
        <div class="w-full lg:w-1/2">
            <label 
                class={`
                    input 
                    input-bordered 
                    flex 
                    items-center gap-2
                    ${estilos.bgdark2}
                `}
            >
                <input type="text" class="grow" placeholder="Buscar..." bind:value={buscar} oninput={filterUpdate} />
            </label>
        </div>
    </div>
    <div class="grid grid-cols-1 m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10" >
        <div class="w-11/12 lg:w-1/2">
            <button class={`w-full btn flex btn-primary ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                <span  class="text-xl">Nuevo nacimiento</span>
            </button>
        </div>
    </div>  
    <div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Fecha</th>
                    <th class="text-base mx-1 px-1">Caravana</th>
                    
                    <th class="text-base mx-1 px-1">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each nacimientosrow as n}
                    <tr>
                        <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{new Date(n.fecha).toLocaleDateString()}</td>
                        <td class="text-base mx-1 px-1">
                            {`${n.caravana}`}
                        </td>
                        
                        <td class="flex gap-2 text-base mx-1 px-1">
                            <div class="tooltip" data-tip="Editar">
                                <button aria-label="Editar" onclick={()=>openEditModal(n.id)}>
                                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                                  </svg>
                                </button>
                            </div>
                            <div class="tooltip" data-tip="Eliminar">
                                <button aria-label="Eliminar" onclick={()=>eliminar(n.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m14.74 9-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 0 1-2.244 2.077H8.084a2.25 2.25 0 0 1-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 0 0-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 0 1 3.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 0 0-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 0 0-7.5 0" />
                                    </svg>                              
                                </button>
                            </div>
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <dialog id="nuevoModal" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
        <div class="
                modal-box w-11/12 max-w-xl
                bg-gradient-to-br from-white to-gray-100 
                dark:from-gray-900 dark:to-gray-800
            "
        >
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
            </form>
            {#if idnacimiento == ""}
                <h3 class="text-lg font-bold">Nuevo nacimiento</h3>  
            {:else}
                <h3 class="text-lg font-bold">Ver nacimiento</h3>  
            {/if}
            <div class="form-control">
                <label for = "nombre" class="label">
                    <span class="label-text text-base">Caravana</span>
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
                        bind:value={caravana}
                    />
                </label>
                {#if idnacimiento == ""}
                <label for = "sexo" class="label">
                    <span class="label-text text-base">Sexo</span>
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
                        bind:value={sexo}
                    >
                        {#each sexos as s}
                            <option value={s.id}>{s.nombre}</option>    
                        {/each}
                      </select>
                </label>
                <label for = "peso" class="label">
                    <span class="label-text text-base">Peso (KG)</span>
                </label>
                <label class="input-group">
                    <input id ="peso" type="number"  
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2} 
                        `} 
                        bind:value={peso}
                    />
                </label>
                {/if}
                <label for = "fechanacimiento" class="label">
                    <span class="label-text text-base">Fecha nacimiento</span>
                </label>
                <label class="input-group ">
                    <input id ="fechanacimiento" type="date" max={HOY}  
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
                <label for = "nombremadre" class="label">
                    <span class="label-text text-base">Nombre madre</span>
                </label>
                <label class="input-group">
                    <input 
                        id ="nombremadre" 
                        type="text"  
                        class={`
                            input 
                            input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none 
                            focus:ring-2 focus:ring-green-500 
                            focus:border-green-500
                            w-full 
                            ${estilos.bgdark2} 
                        `}
                        bind:value={nombremadre}
                    />
                </label>
                <label for = "madre" class="label">
                    <span class="label-text text-base">Madre</span>
                </label>
                <label class="input-group ">
                    <select 
                        class={`
                            select select-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={madre}
                        onchange={getNombreMadre}
                    >
                        {#each madres as m}
                            <option value={m.id}>{m.caravana}</option>    
                        {/each}
                      </select>
                </label>
                <label for = "nombrepadre" class="label">
                    <span class="label-text text-base">Nombre padre</span>
                </label>
                <label class="input-group">
                    <input 
                        id ="nombrepadre" 
                        type="text"  
                        class={`
                            input 
                            input-bordered 
                            border border-gray-300 rounded-md
                            focus:outline-none 
                            focus:ring-2 focus:ring-green-500 
                            focus:border-green-500
                            w-full 
                            ${estilos.bgdark2} 
                        `}
                        bind:value={nombrepadre}
                    />
                </label>
                <label for = "padre" class="label">
                    <span class="label-text text-base">Padre</span>
                </label>
                <label class="input-group ">
                    <select 
                        class={`
                            select select-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={padre}
                        onchange={getNombrePadre}
                    >
                        {#each padres as p}
                            <option value={p.id}>{p.caravana}</option>    
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
                  <button class="btn btn-success text-white" onclick={guardar} >Guardar</button>
                  <button class="btn btn-error text-white" onclick={cerrarModal}>Cancelar</button>
                </form>
            </div>
        </div>
    </dialog>
</Navbarr>