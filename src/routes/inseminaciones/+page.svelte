<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Exportar from '$lib/components/Exportar.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createUserer } from '$lib/stores/user.svelte';
    import tiposanimal from '$lib/stores/tiposanimal';
    import estilos from '$lib/stores/estilos';
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let caber = createCaber()
    let userer = createUserer()
    let cab = caber.cab
    let usuarioid = userer.userid
    // Datos para mostrar
    let inseminaciones = $state([])
    let inseminacionesrow = $state([])
    let buscar = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")
    
    //Datos inseminaciones
    let idins = $state("")
    // La inseminacion es a un animal mujer que luego sera un nacimiento
    let padre = $state("")
    let pajuela = $state("")

    //Seria la fecha del parto
    let fecha = $state("")
    let madres = $state([])
    let padres = $state([])
    let idanimal = $state("")
    //Datos de la inseminacion
    let categoria = $state("")
    let fechadesdeins = $state("")
    let fechahastains = $state("")
    //Validaciones
    let malanimal = $state(false) 
    let malpadre = $state(false)
    let malfechaparto = $state(false)
    let malfechadesde = $state(false)
    let malfechahasta = $state(false)
    let botonhabilitado = $state(false)
    function isEmpty(str){
        return (!str || str.length === 0 );
    }
    function getNombrePadre(){
        let p = padres.filter(item=>item.id == padre)[0]
        pajuela = p.caravana
        oninput("PADRE")
    }
    function openNewModal(){
        botonhabilitado = false
        malanimal = false
        malpadre = false
        malfechaparto = false
        malfechadesde = false
        malfechahasta = false
        fecha = ""
        padre = ""
        idins = ""
        idanimal = ""
        categoria = ""
        fechadesdeins = ""
        fechahastains = ""
        pajuela = ""
        nuevoModal.showModal()
    }
    function cerrarModal(){
        fecha = ""
        padre = ""
        idins = ""
        idanimal = ""
        categoria = ""
        fechadesdeins = ""
        fechahastains = ""
        pajuela = ""
        nuevoModal.close()
        
    }
    function openEditModal(id){
        botonhabilitado = true
        malanimal = false
        malpadre = false
        malfechaparto = false
        malfechadesde = false
        malfechahasta = false
        idins = id
        let inseminacion = inseminaciones.filter(i => i.id == id)[0]
        fecha = inseminacion.fechaparto.split(" ")[0]
        padre = inseminacion.padre
        pajuela = inseminacion.pajuela
        categoria = inseminacion.categoria
        fechadesdeins = inseminacion.fechadesde.split(" ")[0]
        fechahastains = inseminacion.fechahasta.split(" ")[0]
        idanimal = inseminacion.animal
        nuevoModal.showModal()
    }
    async function getAnimales(){
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && cab='${cab.id}'`
        })
        madres = recordsa.filter(a=>a.sexo == "H" || a.sexo == "F")
        padres = recordsa.filter(a=>a.sexo == "M")
    }

    async function getInseminaciones(){
        // you can also fetch all records at once via getFullList
        const records = await pb.collection('inseminacion').getFullList({
            sort: '-fechaparto ',
            filter :`cab = '${cab.id}' && active = true`,
            expand:"animal"
        });
        inseminaciones = records
        inseminacionesrow = inseminaciones
    }
    async function guardar(){
        try{
            let caravana = madres.filter(a=>a.id==idanimal)[0].caravana
            let data = {
                cab:cab.id,
                animal : idanimal,
                fechaparto:fecha +' 03:00:00',
                fechadesde:fechadesdeins+" 03:00:00",
                fechahasta:fechahastains+" 03:00:00",
                active:true,
                padre,
                pajuela,
                categoria
            }
            const record = await pb.collection('inseminacion').create(data);
            let item = record
            item.expand ={animal:{caravana}}
            
            inseminaciones.push(item)
            inseminaciones.sort((i1,i2)=>new Date(i1.fechaparto)>new Date(i2.fechaparto)?-1:1)
            
            filterUpdate()
            Swal.fire("Éxito guardar","Se pudo gu   ardar la inseminación con exito","success")
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","Hubo un error para guardar la inseminación","error")
        }
    }
    function onSelectAnimal(){
        let a = madres.filter(an=>an.id==idanimal)[0]
        categoria = a.categoria
    }
    async function editar(){
        try {
            let data = {
                fechaparto:fecha +' 03:00:00',
                fechadesde:fechadesdeins+" 03:00:00",
                fechahasta:fechahastains+" 03:00:00",
                padre,
                pajuela,
                categoria
            }
            const record = await pb.collection('inseminacion').update(idins, data);
            let idx = inseminaciones.findIndex(i=>i.id==idins)
            let a = madres.filter(an=>an.id==idanimal)[0]
            
            inseminaciones[idx]=record
            inseminaciones[idx].expand={animal:a}
            inseminaciones.sort((i1,i2)=>new Date(i1.fechaparto)>new Date(i2.fechaparto)?-1:1)
            
            filterUpdate()
            Swal.fire("Éxito editar","Se pudo editar la inseminación con exito","success")
        }catch(err){
            console.error(err)
            Swal.fire("Error editar","Hubo un error para editar la inseminación","error")
        }
    }
    
    async function eliminar(id){
        Swal.fire({
            title: 'Eliminar inseminación',
            text: '¿Seguro que deseas eliminar la inseminación?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then(async result=>{
            idins = id
            if(result.value){
                try{
                    let data = {active:false}
                    const record = await pb.collection('inseminacion').update(idins, data);
                    inseminaciones = inseminaciones.filter(i=>i.id!=idins)
                    inseminacionesrow = inseminaciones
                    Swal.fire("Éxito eliminar","Se pudo eliminar la inseminación con exito","success")
                }
                catch(err){
                    console.error(err)
                    Swal.fire("Éxito editar","Se pudo eliminar la inseminación con exito","success")
                }
            }
        })
        
    }
    function filterUpdate(){
        
        inseminacionesrow = inseminaciones
        
        if(buscar !=""){
            inseminacionesrow = inseminacionesrow.filter(i => i.expand.animal.caravana.startsWith(buscar))
        }
        if(fechadesde !=""){
            inseminacionesrow = inseminacionesrow.filter(i => i.fechaparto >= fechadesde)
        }
        if(fechahasta!=""){
            inseminacionesrow = inseminacionesrow.filter(i => i.fechaparto <= fechahasta)
        }
    }
    onMount(async ()=>{
        await getAnimales()
        await getInseminaciones()
    })
    function validarBoton(){
        botonhabilitado = true
        if(isEmpty(idanimal)){
            botonhabilitado = false
        }
        if(isEmpty(pajuela)){
            botonhabilitado = false
        }
        if(isEmpty(fecha)){
            botonhabilitado = false
        }
        if(isEmpty(fechadesdeins)){
            botonhabilitado = false
        }
        if(isEmpty(fechahastains)){
            botonhabilitado = false
        }
    }
    function oninput(campo){
        validarBoton()
        if(campo == "ANIMAL"){
            if(isEmpty(idanimal)){
                malanimal = true
            }
            else{
                onSelectAnimal()
                malanimal = false
            }
        }
        if(campo == "PADRE"){
            if(isEmpty(pajuela)){
                malpadre = true
            }
            else{
                malpadre = false
            }
        }
        if(campo == "FECHA"){
            if(isEmpty(fecha)){
                malfechaparto = true
            }
            else{
                malfechaparto = false
            }
        }
        if(campo == "DESDE"){
            if(isEmpty(fechadesdeins)){
                malfechadesde = true
            }
            else{
                malfechadesde = false
            }
        }
        if(campo == "HASTA"){
            if(isEmpty(fechahastains)){
                malfechahasta = true
            }
            else{
                malfechahasta = false
            }
        }
    }
    function prepararData(item){
        return {
            ANIMAL:item.expand.animal.caravana,
            PAJUELA:item.pajuela,
            FECHAPARTO:new Date(item.fechaparto).toLocaleDateString(),
            FECHADESDE:new Date(item.fechadesde).toLocaleDateString(),
            FECHAHASTA:new Date(item.fechahasta).toLocaleDateString()
        }
    }

    
</script>
<Navbarr>
    <div class="w-full grid justify-items-left mx-1 lg:mx-10 mt-1">
        <h1 class="text-2xl">Inseminaciones</h1>  
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
    <div class="grid grid-cols-1 gap-1 lg:grid-cols-3 mb-2 mt-1 mx-1 lg:mx-10" >
        <div >
            <button class={`w-full btn flex btn-primary ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                <span  class="text-xl">Nueva inseminación</span>
            </button>
        </div>
        <div>
            <Exportar
                titulo={"Inseminaciones"}
                filtros={[]}
                confiltros={false}
                data = {inseminacionesrow}
                {prepararData}
            />
        </div>
    </div>
    <div class="w-full grid justify-items-center mx-1 lg:mx-10 lg:w-3/4">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th class="text-base ml-3 pl-3 mr-1 pr-1 ">Fecha parto</th>
                    <th class="text-base mx-1 px-1">Caravana</th>
                    <th class="text-base mx-1 px-1">Acciones</th>
                </tr>
            </thead>
            <tbody>
                {#each inseminacionesrow as i}
                <tr>
                    <td class="text-base ml-3 pl-3 mr-1 pr-1 lg:ml-10">{new Date(i.fechaparto).toLocaleDateString()}</td>
                    <td class="text-base mx-1 px-1">
                        {`${i.expand.animal.caravana}`}
                    </td>
                    
                    <td class="flex gap-2 text-base mx-1 px-1">
                        <div class="tooltip" data-tip="Editar">
                            <button aria-label="Editar" onclick={()=>openEditModal(i.id)}>
                              <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-4">
                                <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                              </svg>
                            </button>
                        </div>
                        <div class="tooltip" data-tip="Eliminar">
                            <button aria-label="Eliminar" onclick={()=>eliminar(i.id)}>
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
            {#if idins == ""}
                <h3 class="text-lg font-bold">Nueva inseminación</h3>  
            {:else}
                <h3 class="text-lg font-bold">Ver inseminación</h3>  
            {/if}
            <div class="form-control">
                <label for = "nombre" class="label">
                    <span class="label-text text-base">Caravana</span>
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
                        bind:value={idanimal}
                        onchange={()=>oninput("ANIMAL")}
                    >
                        {#each madres as m}
                            <option value={m.id}>{m.caravana}</option>    
                        {/each}
                    </select>
                    {#if malanimal}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe seleccionar el animal</span>                    
                        </div>
                    {/if}

                </label>
                <label for = "tipo" class="label">
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
                        {#each tiposanimal as t}
                            <option value={t.id}>{t.nombre}</option>    
                        {/each}
                      </select>
                </label>
                <label for = "nombrepadre" class="label">
                    <span class="label-text text-base">Pajuela</span>
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
                        bind:value={pajuela}
                        oninput={()=>oninput("PADRE")}
                    />
                    {#if malpadre}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe escribir el nombre del padre</span>                    
                        </div>
                    {/if}
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
                <label for = "fechaparto" class="label">
                    <span class="label-text text-base">Fecha parto</span>
                </label>
                <label class="input-group ">
                    <input id ="fechaparto" type="date" 
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
                    {#if malfechaparto}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe seleccionar la fecha aproximada de parto</span>                    
                        </div>
                    {/if}
                </label>
                <label for = "fechadesde" class="label">
                    <span class="label-text text-base">Fecha desde</span>
                </label>
                <label class="input-group ">
                    <input id ="fechadesde" type="date" 
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={fechadesdeins}
                        onchange={()=>oninput("DESDE")}
                    />
                    {#if malfechadesde}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe seleccionar la fecha desde</span>                    
                        </div>
                    {/if}
                </label>
                <label for = "fechahasta" class="label">
                    <span class="label-text text-base">Fecha hasta</span>
                </label>
                <label class="input-group ">
                    <input id ="fechaparto" type="date" 
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 
                            focus:border-green-500
                            ${estilos.bgdark2} 
                        `}
                        bind:value={fechahastains}
                        onchange={()=>oninput("HASTA")}
                    />
                    {#if malfechahasta}
                        <div class="label">
                            <span class="label-text-alt text-red-500">Debe seleccionar la fecha hasta</span>                    
                        </div>
                    {/if}
                </label>

            </div>
            <div class="modal-action justify-start ">
                <form method="dialog" >
                    <!-- if there is a button, it will close the modal -->
                    {#if idins == ""}
                        <button class="btn btn-success text-white" disabled='{!botonhabilitado}' onclick={guardar} >Guardar</button>
                    {:else}
                        <button class="btn btn-success text-white" disabled='{!botonhabilitado}' onclick={editar} >Editar</button>
                    {/if}
                    <button class="btn btn-error text-white" onclick={cerrarModal}>Cancelar</button>
                </form>
            </div>
        </div>
    </dialog>
</Navbarr>