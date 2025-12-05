<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import Exportar from '$lib/components/Exportar.svelte';
    import PocketBase from 'pocketbase'
    import { slide } from 'svelte/transition';
    import sexos from '$lib/stores/sexos';
    import permisos from '$lib/stores/permisos';
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createUserer } from '$lib/stores/user.svelte';
    import categorias from '$lib/stores/categorias';
    import estilos from '$lib/stores/estilos';
    import AgregarAnimal from '$lib/components/eventos/AgregarAnimal.svelte';
    import cuentas from '$lib/stores/cuentas';
    //FILTROS
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    import InfoAnimal from '$lib/components/InfoAnimal.svelte';
    import PredictSelect from '$lib/components/PredictSelect.svelte';
    let caber = createCaber()
    let cab = caber.cab
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let animales = $state([])
    let animalesactivos = $derived(animales.filter(a=>a.active).map(a=>({id:a.id,nombre:a.caravana})))
    let observaciones = $state([])
    let observacionesrow = $state([])
    let caravana = $state("")
    let malcaravana = $state(false)
    let sexo = $state("")
    let peso = $state(0)
    let usuarioid = $state("")
    let cargadoanimales = $state(false)
    //Datos observaciones
    let veranimal = $state({})
    let idobservacion = $state("")
    let animal = $state("")
    let cadenaanimal = $state("")
    let categoria = $state("")
    let fecha = $state("")
    let observacion = $state("")
    let totalObservacionesEncontradas = $state(0)
    let nombreanimal = $state("")
    
    //Validacioones
    let malanimal = $state(false)
    let malfecha = $state(false)
    let botonhabilitado = $state(false)
    let botonhabilitadoAnimal = $state(false)
    //Filtros
    let buscar = $state("")
    let buscarcategoria = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")
    let isOpenFilter = $state(false)
    let defaultfiltro = {
        buscar: "",
        buscarcategoria: "",
        fechadesde: "",
        fechahasta: "",
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listaobservaciones", defaultfiltro);
    //Datos animal
    let caravananuevo = $state("")
    let categorianuevo = $state("")
    let sexonuevo = $state("")
    let fechanacimientonuevo = $state("")
    let pesonuevo = $state("")
    let agregaranimal = $state(false)
    //Funciones
    //Para el collapse de los filtros
    function clickFilter(){
        isOpenFilter = !isOpenFilter
    }
    function isEmpty(str){
        return (!str || str.length === 0 );
    }
    async function getAnimales(){
        //Estaria joya que el animal venga con todos los chiches
        const recordsa = await pb.collection("animales").getFullList({
            filter:`cab='${cab.id}'`,
            expand:"nacimiento"
        })
        animales = recordsa
        animales.sort((a1,a2)=>a1.caravana.toLocaleLowerCase()>a2.caravana.toLocaleLowerCase()?1:-1)
        cargadoanimales = true
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
        nombreanimal = ""
        animal = ""
        cadenaanimal = ""
        nuevoModal.showModal()
    }

    function openNewAnimal(){
        if(permisos[4]){
            caravana = ""
            sexo = ""
            peso = 0
            botonhabilitadoAnimal = false
            animal = ""
            nuevoModal.showModal()
        } else{
            Swal.fire("Sin permisos","No tienes permisos para crear eventos","error")
        }
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
        nombreanimal = obs.expand.animal.caravana
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
            observacion = ""
            categoria = ""
            fecha = ""
            
          }
        })
        
    }
    function setFilters() {
        buscar = proxyfiltros.buscar;
        buscarcategoria = proxyfiltros.buscarcategoria;
        fechadesde = proxyfiltros.fechadesde;
        fechahasta = proxyfiltros.fechahasta;
    }

    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.buscarcategoria = buscarcategoria;
        proxyfiltros.fechadesde = fechadesde;
        proxyfiltros.fechahasta = fechahasta;
    }

    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    function cerrar(){
        idobservacion = ""
        fecha = ""
        observacion = ""
        categoria = ""
        animal = ""
        caravananuevo = ""
        categorianuevo = ""
        sexonuevo = ""
        fechanacimientonuevo = ""
        pesonuevo = ""
        agregaranimal = false
        nuevoModal.close()
    }
    function filterUpdate(){
        setProxyFilter();
        proxy.save(proxyfiltros);
        observacionesrow = observaciones
        totalObservacionesEncontradas = observacionesrow.length
        if(buscar != ""){
            observacionesrow = observacionesrow.filter(o=>o.expand.animal.caravana.toLocaleLowerCase().includes(buscar.toLocaleLowerCase()))
            totalObservacionesEncontradas = observacionesrow.length
        }
        if(fechadesde!=""){
            observacionesrow = observacionesrow.filter(o=>o.fecha>=fechadesde)
            totalObservacionesEncontradas = observacionesrow.length
        }
        if(fechahasta!=""){
            observacionesrow = observacionesrow.filter(o=>o.fecha<=fechahasta)
            totalObservacionesEncontradas = observacionesrow.length
        }
        if(buscarcategoria != ""){
            observacionesrow = observacionesrow.filter(o=>o.categoria==buscarcategoria)
            totalObservacionesEncontradas = observacionesrow.length
        }
    }
    onMount(async ()=>{
        proxyfiltros = proxy.load();
        setFilters();
        let pb_json = await JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.record.id
        await getObservaciones()
        filterUpdate()
        await getAnimales()
    })
    async function guardar(){
        if (agregaranimal){
            try{
                let a = await guardarAnimal()
                let data = {
                    animal:a.id,
                    fecha:fecha +" 03:00:00",
                    categoria:a.categoria,
                    cab:cab.id,
                    observacion,
                    active:true
                }
                const record = await pb.collection('observaciones').create(data);
                await getObservaciones()
                
                filterUpdate()
                await getAnimales()
                Swal.fire("Éxito guardar","Se pudo guardar la observación","success")
            }
            catch(err){
                console.error(err)
                Swal.fire("Error guardar","No se pudo guardar la observación","error")
            }
        }
        else{
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
                await getObservaciones()

                filterUpdate()
                Swal.fire("Éxito guardar","Se pudo guardar la observación","success")

            }
            catch(err){
                console.error(err)
                Swal.fire("Error guardar","No se pudo guardar la observación","error")
            }
        }
        
        idobservacion = ""
        fecha = ""
        observacion = ""
        categoria = ""
        animal = ""
    }

    async function guardarAnimal(){
        let user = await pb.collection("users").getOne(usuarioid)
        
        let nivel  = cuentas.filter(c=>c.nivel == user.nivel)[0]
        
        let animals = await pb.collection('Animalesxuser').getList(1,1,{filter:`user='${usuarioid}'`})
        let verificar = true
        if(nivel.animales != -1 && animals.totalItems > nivel.animales){
            verificar =  false
        }
        
        let data = {
            caravana:caravananuevo,
            active:true,
            categoria:categorianuevo,
            delete:false,
            fechanacimiento:fechanacimientonuevo +" 03:00:00",
            sexo:sexonuevo,
            peso:pesonuevo,
            cab:cab.id
        }
        
        let recorda = await pb.collection('animales').create(data); 
        return recorda
    }
    
    async function editar(){
        try{
            let data = {
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
        if(!agregaranimal && isEmpty(animal)){
            botonhabilitado=false
        }
        if(isEmpty(fecha)){
            botonhabilitado=false
        }
    }

    function validarBotonAnimal(){
        botonhabilitadoAnimal = true
        if(!agregaranimal && isEmpty(caravana)){
            botonhabilitadoAnimal=false
        }
    }

    function onSelectAnimal(){
        if (animal == "agregar") {
            openNewAnimal()
        } else {
            let a = animales.filter(an=>an.id==animal)[0]
            veranimal = a
            categoria = a.categoria
        }
    }
    function oninput(inputName){
        validarBoton()
        //validarBotonAnimal()
        if(!agregaranimal && inputName == "ANIMAL"){
            if(isEmpty(animal)){
                malanimal = true
                veranimal = {}
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
        if(inputName=="NOMBRE"){
            if(isEmpty(caravana)){
                malcaravana = true
            }
            else{
                malcaravana = false
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

    //Para el collapse de los ordenar
    let isOpenOrdenar = $state(false)
    function clickOrdenar(){
        isOpenOrdenar = !isOpenOrdenar
    }
    //Para los ordenar
    let ascendente = $state(true)
    let forma = $state("fecha")
    let selectforma = $state("fecha")
    //Ordenar servicios
    function ordenarObservacionesDescendente(p_forma){
        
        let escalar = 1
        if(!ascendente){
            escalar = -1
        }
        forma = p_forma
        if(forma=="fecha"){
            
            observacionesrow.sort((a1,a2)=>escalar * a1.fecha.localeCompare(a2.fecha))
        }
        else if(forma=="animal"){
            
            observacionesrow.sort((a1,a2)=>escalar * a1.expand.animal.caravana.localeCompare(a2.expand.animal.caravana))
        }
        else if(forma=="categoria"){
            observacionesrow.sort((a1,a2)=>escalar * a1.categoria.localeCompare(a2.categoria))
        }
    }
    function ordenarObservaciones(p_forma){
        
        if(p_forma == forma){
            ascendente = !ascendente
            
        }
        else{
            ascendente = true
        }
        ordenarObservacionesDescendente(p_forma)
    }
</script>
<Navbarr>
    <div class="grid grid-cols-2 lg:grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div>
            <h1 class="text-2xl">Observaciones</h1>  
        </div>
        <div class="flex col-span-2 gap-1 justify-start lg:justify-end">
            <div>
                <button class={` btn btn-primary rounded-lg ${estilos.btntext} px-2 mx-1`} data-theme="forest" onclick={()=>openNewModal()}>
                    <span  class="text-lg m-1">Nuevo</span>
                </button>
            </div>
            <div>
            
                <Exportar
                    titulo ={"Observaciones"}
                    filtros = {[]}
                    confiltros = {false}
                    data = {observacionesrow}
                    sheetname = {"Observaciones"}
                    establecimiento = {cab.nombre}
                    {prepararData}
                />
            </div>
        </div>
    </div>
    
    
    <div class="grid grid-cols-1 lg:grid-cols-2 m-1 mb-2 mt-1 mx-1 lg:mx-10 w-11/12">
        <div class="w-11/12">
            <label
                class={`
                        input input-bordered flex items-center gap-2
                        ${estilos.bgdark2}
                    `}
            >
                <input
                    type="text"
                    class="grow"
                    placeholder="Buscar..."
                    bind:value={buscar}
                    oninput={filterUpdate}
                />
            </label>
        </div>
        <div class="w-11/12">
            <Limpiar
                {limpiarFiltros}
            />
        </div>
    </div>
    <!--Filtrar-->
    <div class="w-11/12 m-1 mb-2 lg:mx-10 rounded-lg bg-transparent">
        <button 
            aria-label="Filtrar" 
            class="w-full"
            onclick={clickFilter}
        >
            <div class="flex justify-between items-center px-2">
                <h1 class="font-bold text-lg py-2">Filtros</h1>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class={`h-5 w-5 transition-all duration-300 ${isOpenFilter? 'transform rotate-180':''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
        </button>
        <div>
            <span class = "text-lg mx-1">Total de observaciones encontradas: {totalObservacionesEncontradas}</span>
        </div>
        {#if isOpenFilter}
            <div transition:slide>
                <div class="grid grid-cols-1 lg:grid-cols-4" >
                    <div class="">
                        <label class="block tracking-wide  mb-2" for="grid-first-name">
                            Fecha desde
                        </label>
                        <input id ="fechadesde" type="date"  
                            class={`
                            w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `} 
                            bind:value={fechadesde} onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label class="block tracking-wide mb-2" for="grid-first-name">
                            Fecha Hasta
                        </label>
                        <input id ="fechadesde" type="date"  
                            class={`
                            w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}  
                            bind:value={fechahasta} onchange={filterUpdate}
                        />
                    </div>
                    <div>
                        <label for = "categoria" class="tracking-wide label">
                            <span class="label-text text-base">Categoria</span>
                        </label>
                        <label class="input-group ">
                            <select 
                                class={`
                                    select select-bordered w-full
                                    rounded-md
                                    focus:outline-none focus:ring-2 
                                    focus:ring-green-500 
                                    focus:border-green-500
                                    ${estilos.bgdark2}
                                `}
                                bind:value={buscarcategoria}
                                onchange={filterUpdate}
                            >
                                    <option value="">Todos</option>
                                    {#each categorias as s}
                                        <option value={s.id}>{s.nombre}</option>
                                    {/each}
                              </select>
                        </label>
                    </div>
                </div>  
            </div>
        {/if}

    </div>
    <!--Ordenar-->
    <div class="block  md:hidden w-11/12 m-1 mb-2 lg:mx-10 rounded-lg bg-transparent">
        <button 
            aria-label="Ordenar" 
            class="w-full"
            onclick={clickOrdenar}
        >
            <div class="flex justify-between items-center px-1">
                <h1 class="font-semibold text-lg py-2">Ordenar</h1>
                <svg 
                    xmlns="http://www.w3.org/2000/svg" 
                    class={`size-6 transition-all duration-300 ${isOpenOrdenar? 'transform rotate-180':''}`}
                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                </svg>
            </div>
            
        </button>
        {#if isOpenOrdenar}
            <div transition:slide>
                <div class="my-0 py-0">
                    <label class="input-group ">
                        <select 
                            class={`
                                select select-bordered w-full
                                rounded-md
                                focus:outline-none focus:ring-2 
                                focus:ring-green-500 
                                focus:border-green-500
                                
                                ${estilos.bgdark2}
                            `}
                            bind:value={selectforma}
                            onchange={()=>ordenarObservaciones(selectforma)}
                            
                        >
                            <option value="fecha" class="rounded">Fecha</option>
                            <option value="animal" class="rounded">Animal</option>
                            <option value="categoria" class="rounded">Categoria</option>
                            
                        </select>
                    </label>
                </div>
                <div class="my-1">
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">Ascendente</span>
                            <input type="checkbox" class="toggle" bind:checked={ascendente} onclick={()=>ordenarObservaciones(selectforma)}/>
                        </label>
                      </div>
                </div>
            </div>
        {/if}
    </div> 
    <div class="hidden w-full md:grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto">
        <table class="table table-lg w-full" >
            <thead>
                <tr>
                    <th 
                        onclick={()=>ordenarObservaciones("fecha")}
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        
                        <div
                                class="flex flex-row justify-between"
                        >
                            Fecha
                            {#if forma == "fecha"}
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    class={`size-5 transition-all duration-300 ${!ascendente? 'transform rotate-180':''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            {/if}
                        </div>
                    </th>
                    <th 
                        onclick={()=>ordenarObservaciones("animal")}
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        
                        <div
                                class="flex flex-row justify-between"
                        >
                            Animal
                            {#if forma == "animal"}
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    class={`size-5 transition-all duration-300 ${!ascendente? 'transform rotate-180':''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            {/if}
                        </div>
                    </th>
                    <th 
                        onclick={()=>ordenarObservaciones("categoria")}
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        
                        <div
                                class="flex flex-row justify-between"
                        >
                            Categoria
                            {#if forma == "categoria"}
                                <svg 
                                    xmlns="http://www.w3.org/2000/svg" 
                                    class={`size-5 transition-all duration-300 ${!ascendente? 'transform rotate-180':''}`}
                                    fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7" />
                                </svg>
                            {/if}
                        </div>
                    </th>
                    <th 
                        class="text-base border-b dark:border-gray-600"  
                    >
                        Observacion
                    </th>
                    
                </tr>
            </thead>
            <tbody>
                {#each observacionesrow as o}
                <tr onclick={()=>openModalEditar(o.id)} class="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900">
                    <td class="text-base ">
                        {`${new Date(o.fecha).toLocaleDateString()}`}
                    </td>
                    <td class="text-base ">
                        {`${o.expand.animal.caravana}`}
                    </td>
                    <td class="text-base ">
                        {`${o.categoria}`}
                    </td>
                    <td class="text-base ">
                        {`${o.observacion}`}
                    </td>
                   
                </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="block w-full md:hidden justify-items-center mx-1">
        {#each observacionesrow as o}
        <div class="card  w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900">
            <button onclick={()=>openModalEditar(o.id)}>
                <div class="block p-4">
                    <div class="grid grid-cols-2 gap-y-2">
                        <div class="flex items-start">
                            <span >Fecha:</span> 
                            <span class="mx-1 font-semibold">
                                {new Date(o.fecha).toLocaleDateString()}
                            </span>
                            
                        </div>
                        <div class="flex items-start">
                            <span >Caravana:</span> 
                            <span class="mx-1 font-semibold">
                                {`${o.expand.animal.caravana}`}
                            </span>
                            
                        </div>
                        <div class="col-span-2 flex items-start">
                            <span >{`${o.observacion}`}</span> 
                            
                        </div>
                    </div>
                </div>
            </button>
        </div>
        {/each}
    </div>
    

</Navbarr>
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
            {#if idobservacion==""}
                <AgregarAnimal bind:agregaranimal bind:caravana = {caravananuevo} bind:categoria = {categorianuevo} bind:sexo = {sexonuevo} bind:peso = {pesonuevo} bind:fechanacimiento = {fechanacimientonuevo}/>
            {/if}
            {#if !agregaranimal}
                {#if idobservacion != ""}
                <label for = "animal" class="label">
                    <span class="label-text text-base">Animal</span>
                </label>
                {/if}
                {#if idobservacion == ""}
                    {#if cargadoanimales}
                    <PredictSelect
                        lista={animalesactivos}
                        etiqueta = {"Animal"}
                        bind:valor={animal}
                        bind:cadena={cadenaanimal}
                        onelegir={()=>oninput("ANIMAL")}
        

                    />
                    {/if}
                    <label class="hidden input-group ">
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
                            {#each animales.filter(an=>an.active) as a}
                                <option value={a.id}>{a.caravana}</option>    
                            {/each}
                        
                        </select>
                        {#if malanimal}
                            <div class="label">
                                <span class="label-text-alt text-red-500">Debe seleccionar el animal</span>                    
                            </div>
                        {/if}
                        {#if animal.length>0}
                            <InfoAnimal
                                animal = {veranimal}
                            />
                        {/if}
                    </label>
                {:else}
                    <label for = "animal" class="label">
                        <span class="label-text text-base">{nombreanimal}</span>
                    </label>
                {/if}
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
            {/if}
            <label for = "fecha" class="label">
                <span class="label-text text-base">Fecha observación</span>
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
            <textarea
                class={`
                    input 
                    input-bordered 
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500
                    w-full
                    ${estilos.bgdark2}
                `}
                
                bind:value={observacion}
            >
            </textarea>
            <input 
                id ="observacion" 
                type="text"  
                class={`
                    hidden
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
                  <button class="btn btn-error text-white" onclick={()=>eliminar(idobservacion)}>Eliminar</button>
                {/if}
                <button class="btn btn-neutral " onclick={cerrar}>Cerrar</button>
                
              </form>
        </div>
    </div>
</dialog>