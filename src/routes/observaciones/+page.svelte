<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Exportar from '$lib/components/Exportar.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createUserer } from '$lib/stores/user.svelte';
    import categorias from '$lib/stores/categorias';
    import estilos from '$lib/stores/estilos';
    let caber = createCaber()
    let cab = caber.cab
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let animales = $state([])
    let observaciones = $state([])
    let observacionesrow = $state([])

    //Datos observacioens
    let idobservacion = $state("")
    let animal = $state("")
    let categoria = $state("")
    let fecha = $state("")
    let observacion = $state("")
    //Validacioones
    let malanimal = $state(false)
    let malfecha = $state(false)
    let botonhabilitado = $state(false)
    //Filtros
    let buscar = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")

    //Funciones
    function isEmpty(str){
        return (!str || str.length === 0 );
    }
    async function getAnimales(){
        //Estaria joya que el animal venga con todos los chiches
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && cab='${cab.id}' && (sexo='H' || sexo ='M')`,
            expand:"nacimiento"
        })
        animales = recordsa
        animales.sort((a1,a2)=>a1.caravana>a2.caravana?1:-1)
    }
    async function getObservaciones(){
        const records = await pb.collection('observaciones').getFullList({
            filter:`active=true && cab='${cab.id}'`,
            expand:"animal",
            sort: '-fecha',
        });
        observaciones = records
        observacionesrow = observaciones
    }
    function openNewModal(){
        idobservacion = ""
        observacion = ""
        categoria = ""
        fecha = ""
        botonhabilitado = false
        malanimal = false
        malfecha = false
        nuevoModal.showModal()
    }
    function openModalEditar(id){
        botonhabilitado = true
        malanimal = false
        malfecha = false
        idobservacion = id
        let obs = observaciones.filter(o=>o.id==idobservacion)[0]
        observacion = obs.observacion
        categoria = obs.categoria
        fecha = obs.fecha.split(" ")[0]
        animal = obs.animal
        nuevoModal.showModal()
    }
    function eliminar(id){
        Swal.fire({
            title: 'Eliminar observación',
            text: '¿Seguro que deseas eliminar la observacion?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then(async result=>{
          if(result.value){
            idobservacion = id
            let data = {
                active:false
            }
            try{

                const recordedit = await pb.collection('observaciones').update(idobservacion, data);
                observaciones = observaciones.filter(o=>o.id!=idobservacion)
                filterUpdate()
                Swal.fire('Observación eliminada!', 'Se eliminó la observación correctamente.', 'success');
            }
            catch(err){
                Swal.fire('Acción cancelada', 'No se pudo eliminar la observacion', 'error');
                console.error(err)
            }
            idobservacion = ""
            
          }
        })
    }
    function cerrar(){
        idobservacion = ""
        fecha = ""
        observacion = ""
        categoria = ""
        animal = ""
        nuevoModal.close()
    }
    function filterUpdate(){
        observacionesrow = observaciones
        
        if(buscar != ""){
            observacionesrow = observacionesrow.filter(o=>o.expand.animal.caravana.startsWith(buscar))
        }
        if(fechadesde!=""){
            observacionesrow = observacionesrow.filter(o=>o.fecha>=fechadesde)
        }
        if(fechahasta!=""){
            observacionesrow = observacionesrow.filter(o=>o.fecha<=fechahasta)
        }
    }
    onMount(async ()=>{
        
        fechadesde = DESDE.toISOString().split("T")[0]
        fechahasta = HASTA.toISOString().split("T")[0]
        await getObservaciones()
        filterUpdate()
        await getAnimales()
    })
    async function guardar(){
        try{
            let data = {
                animal,
                fecha:fecha +" 03:00:00",
                categoria,
                cab:cab.id,
                observacion,
                active:true
            }
            const record = await pb.collection('observaciones').create(data);
            let a = animales.filter(an=>an.id==animal)[0]
            let item = {
                ...record,
                expand:{animal:a}
            }
            observaciones.push(item)
            observaciones.sort((o1,o2)=>new Date(o1.fecha)>new Date(o2.fecha)?-1:1)

            filterUpdate()
            Swal.fire("Éxito guardar","Se pudo guardar la observación","success")

        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar la observación","error")
        }
    }
    async function editar(){
        try{
            let data = {
                animal,
                fecha:fecha +" 03:00:00",
                categoria,
                observacion
            }
            const record = await pb.collection('observaciones').update(idobservacion, data);
            let a = animales.filter(an=>an.id==animal)[0]
            let idx = observaciones.findIndex(o=>o.id==idobservacion)
            observaciones[idx] = record
            observaciones[idx].expand = {animal:a}
            observaciones.sort((o1,o2)=>new Date(o1.fecha)>new Date(o2.fecha)?-1:1)
            filterUpdate()
            Swal.fire("Éxito editar","Se pudo editar la observación","success")

        }
        catch(err){
            console.error(err)
            Swal.fire("Error editar","No se pudo editar la observación","error")
        }
    }
    function validarBoton(){
        botonhabilitado = true
        if(isEmpty(animal)){
            botonhabilitado=false
        }
        if(isEmpty(fecha)){
            botonhabilitado=false
        }
    }
    function onSelectAnimal(){
        let a = animales.filter(an=>an.id==animal)[0]
        categoria = a.categoria
    }
    function oninput(inputName){
        validarBoton()
        if(inputName == "ANIMAL"){
            if(isEmpty(animal)){
                malanimal = true
            }
            else{
                malanimal = false
                onSelectAnimal()
            }
        }   
        if(inputName == "FECHA"){
            if(isEmpty(fecha)){
                malfecha = true
            }
            else{
                malfecha = false
            }
        }
    }
    function prepararData(item){
        return {
            CARAVANA:item.expand.animal.caravana,
            FECHA:new Date(item.fecha).toLocaleDateString(),
            OBSERVACION:item.observacion
        }
    }


</script>
<Navbarr>
    <div class="w-full grid justify-items-left mx-1 lg:mx-10 mt-1">
        <h1 class="text-2xl">Observaciones</h1>  
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
    <div class="grid grid-cols-1 m-1 mb-2 mt-1 mx-1 lg:mx-10 w-11/12" >
            <div class="w-full lg:w-1/2">
                <label 
                    class={`
                        input input-bordered flex items-center gap-2
                        ${estilos.bgdark2}
                    `}
                >
                    <input type="text" 
                        class="grow" placeholder="Buscar..." bind:value={buscar} oninput={filterUpdate} 
                    />
                </label>
            </div>
    </div>
    <div class="grid grid-cols-1 gap-1 lg:grid-cols-3 mb-2 mt-1 mx-1 lg:mx-10" >
            <div>
                <button class={`w-full btn btn-primary flex ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                    <span  class="text-xl">Nueva observación</span>
                </button>
            </div>
            <div>
            
                <Exportar
                    titulo ={"Observaciones"}
                    filtros = {[]}
                    confiltros = {false}
                    data = {observacionesrow}
                    {prepararData}
                />
            </div>
    </div>
    <div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th class="text-base w-3/12"  >Fecha</th>
                    <th class="text-base w-3/12"  >Animal</th>
                    <th class="text-base w-3/12"  >Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each observacionesrow as o}
                <tr>
                    <td class="text-base">
                        {`${new Date(o.fecha).toLocaleDateString()}`}
                    </td>
                    <td class="tex-base">
                        {`${o.expand.animal.caravana}`}
                    </td>
                    <td class="flex gap-2">
                        <div class="tooltip" data-tip="Editar">
                            <button aria-label="Editar" onclick={()=>openModalEditar(o.id)}>
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                    <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                                </svg>
                            </button>
                        </div>
                        <div class="tooltip" data-tip="Eliminar">
                            <button aria-label="Eliminar" onclick={()=>eliminar(o.id)}>
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
            {#if idobservacion==""}
                <h3 class="text-lg font-bold">Nueva observación</h3>  
            {:else}
                <h3 class="text-lg font-bold">Editar observación</h3>  
            {/if}
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
                        bind:value={animal}
                        onchange={()=>oninput("ANIMAL")}
                    >   
                        {#each animales as a}
                            <option value={a.id}>{a.caravana}</option>    
                        {/each}
                    </select>
                    {#if malanimal}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe seleccionar el animal</span>                    
                        </div>
                    {/if}
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
                        bind:value={categoria}
                    >
                        {#each categorias as c}
                            <option value={c.id}>{c.nombre}</option>    
                        {/each}
                      </select>
                </label>
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
                        bind:value={fecha}
                        onchange={()=>oninput("FECHA")}
                    />
                    {#if malfecha}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe seleccionar la fecha del tacto</span>                    
                        </div>
                    {/if}
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
                <form method="dialog" >
                    <!-- if there is a button, it will close the modal -->
                    {#if idobservacion==""}
                      <button class="btn btn-success text-white" disabled='{!botonhabilitado}' onclick={guardar} >Guardar</button>
                    {:else}
                      <button class="btn btn-success text-white" disabled='{!botonhabilitado}' onclick={editar} >Editar</button>
                    {/if}
                    <button class="btn btn-error text-white" onclick={cerrar}>Cancelar</button>
                  </form>
            </div>
        </div>
    </dialog>

</Navbarr>