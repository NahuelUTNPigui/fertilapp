<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import sexos from '$lib/stores/sexos';
    import tipostacto from '$lib/stores/tipostacto';
    import tiposanimal from '$lib/stores/tiposanimal';
    import estilos from '$lib/stores/estilos';
    import estados from "$lib/stores/estados";
    import { createCaber } from "$lib/stores/cab.svelte";
    let caber = createCaber()
    let cab = caber.cab
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let usuarioid = ""
    let tactos = $state([])
    let animales = $state([])
    let tactosrow = $state([])

    //Filtros
    let buscar = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")
    //Datos tacto
    let tacto = $state(null)
    let idtacto = $state("")
    let fecha = $state("")
    let observacion = $state("")
    let animal = $state("")
    //Tipo animal
    let categoria = $state("vaca")
    let prenada = $state(0)
    //tipo tacto
    let tipo = $state("tacto")
    let nombreveterinario = $state("")
    //Validaciones
    let malfecha = $state("")
    let malanimal = $state("")
    let malvet = $state("")
    async function getTactos(){
        const recordst = await pb.collection('tactos').getFullList({
            filter:`cab='${cab.id}' && active=true`,
            sort: '-created',
            expand:"animal"
        });
        tactos = recordst
        tactosrow = tactos
        
    }
    function isEmpty(str){
        return (!str || str.length === 0 );
    }
    async function getAnimales(){
        //Estaria joya que el animal venga con todos los chiches
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && cab='${cab.id}' && sexo='H'`,
            expand:"nacimiento"
        })
        animales = recordsa
        animales.sort((a1,a2)=>a1.caravana>a2.caravana?1:-1)
    }
    function openNewModal(){
        tacto = null
        idtacto = ""   
        fecha = ""
        observacion =  ""
        animal = ""
        categoria = "vaca"
        prenada = 0
        tipo = "tacto"
        nombreveterinario = ""
        nuevoModal.showModal()
    }
    function openModalEdit(id){
        idtacto = id
        tacto = tactos.filter(t=>t.id==idtacto)[0]
        fecha = tacto.fecha.split(" ")[0]
        observacion = tacto.observacion
        animal = tacto.animal
        categoria = tacto.categoria
        prenada = tacto.prenada
        tipo = tacto.tipo
        nombreveterinario = tacto.nombreveterinario
        nuevoModal.showModal()
    }
    function eliminar(id){
        Swal.fire({
            title: 'Eliminar tacto',
            text: '¿Seguro que deseas eliminar el tacto?',
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then(async result => {
            if(result.value){
                idtacto = id
                let data = {
                    active:false
                }
                try{
                    let recordaedit = await pb.collection('tactos').update(idtacto,data);
                    tactos = tactos.filter(t=>t.id!=idtacto)
                    filterUpdate()
                    Swal.fire('Tacto eliminado!', 'Se eliminó el tacto correctamente.', 'success');
                }
                catch(e){
                    Swal.fire('Acción cancelada', 'No se pudo eliminar el tacto', 'error');
                }
                idtacto = ""
                tacto = null
            }
        })
    }
    function cerrar(){
        tacto = null
        idtacto = ""   
        fecha = ""
        observacion =  ""
        animal = ""
        categoria = "vaca"
        prenada = false
        tipo = "tacto"
        nombreveterinario = ""
        nuevoModal.close()
    }
    function filterUpdate(){
        tactosrow = tactos
        if(buscar!=""){
            tactosrow = tactosrow.filter(t=>t.expand.animal.caravana.startsWith(buscar))
        }
        if(fechadesde!=""){
            tactosrow = tactosrow.filter(t=>t.fecha>=fechadesde)
        }
        if(fechahasta!=""){
            tactosrow = tactosrow.filter(t=>t.fecha<=fechahasta)
        }
    }
    onMount(async ()=>{
        let pb_json = await JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.model.id
        fechadesde = DESDE.toISOString().split("T")[0]
        fechahasta = HASTA.toISOString().split("T")[0]
        await getTactos()
        filterUpdate()
        await getAnimales()
    })
    function selectOption(opcion){
        prenada = opcion
    }
    async function guardar(){
        try{
            let data = {
               fecha:fecha +" 03:00:00" ,
               observacion,
               animal,
               categoria,
               prenada,
               tipo,
               nombreveterinario,
               cab:cab.id,
               active:true
            }
            const record = await pb.collection('tactos').create(data);
            await pb.collection('animales').update(animal,{
                prenada
            })
            let a = animales.find(an=>an.id == animal)[0]
            let item = {...record,expand:{animal:a}}
            tactos.push(item)
            filterUpdate()
            Swal.fire("Éxito guardar","Se pudo guardar el tacto","success")
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar el tacto","error")
        }
    }
    async function editarTacto(){
        try{
            let data = {
               fecha:fecha +" 03:00:00" ,
               observacion,
               animal,
               categoria,
               prenada,
               tipo,
               nombreveterinario
            }
            const record = await pb.collection('tactos').update(idtacto,data);
            
            await pb.collection('animales').update(animal,{
                prenada
            })
            let idx = tactos.findIndex(t=>t.id==idtacto)
            let a = animales.find(an=>an.id == animal)[0]
            tactos[idx] = record
            tactos[idx].expand = {animal:a}

            filterUpdate()
            Swal.fire("Éxito guardar","Se pudo guardar el tacto","success")
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar el tacto","error")
        }
        console.log(tactos)
    }
</script>
<Navbarr>
    <div class="w-full grid justify-items-left mx-1 lg:mx-10 mt-1">
        <h1 class="text-2xl">Tactos</h1>  
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
    <div class="grid grid-cols-1 m-1 mb-2 mt-1 mx-1 lg:mx-10 w-11/12" >
        <div class="w-11/12 lg:w-1/2">
            <button class={`w-full btn btn-primary flex ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                <span  class="text-xl">Nuevo tacto</span>
            </button>
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
                {#each tactosrow as t}
                    <tr>
                        <td class="text-base">
                            {`${new Date(t.fecha).toLocaleDateString()}`}
                        </td>
                        <td class="tex-base">
                            {`${t.expand.animal.caravana}`}
                        </td>
                        <td class="flex gap-2">
                            <div class="tooltip" data-tip="Editar">
                                <button aria-label="Editar" onclick={()=>openModalEdit(t.id)}>
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path d="M21.731 2.269a2.625 2.625 0 0 0-3.712 0l-1.157 1.157 3.712 3.712 1.157-1.157a2.625 2.625 0 0 0 0-3.712ZM19.513 8.199l-3.712-3.712-12.15 12.15a5.25 5.25 0 0 0-1.32 2.214l-.8 2.685a.75.75 0 0 0 .933.933l2.685-.8a5.25 5.25 0 0 0 2.214-1.32L19.513 8.2Z" />
                                    </svg>
                                </button>
                            </div>
                            <div class="tooltip" data-tip="Eliminar">
                                <button aria-label="Eliminar" onclick={()=>eliminar(t.id)}>
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
            {#if idtacto == ""}
                <h3 class="text-lg font-bold">Nuevo tacto</h3>  
            {:else}
                <h3 class="text-lg font-bold">Editar tacto</h3>  
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
                    >
                        {#each animales as a}
                            <option value={a.id}>{a.caravana}</option>    
                        {/each}
                      </select>
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
                <div class="form-group">
                    <label for = "prenada" class="label">
                        <span class="label-text text-base">Preñada</span>
                    </label>
                    <label class="input-group ">
                        <select 
                            class={`
                                select select-bordered w-full
                                border border-gray-300 rounded-md
                                focus:outline-none focus:ring-2 
                                focus:ring-green-500 focus:border-green-500
                                ${estilos.bgdark2}
                            `} bind:value={prenada}>
                            {#each estados as e}
                                <option value={e.id}>{e.nombre}</option>    
                            {/each}
                        </select>
                    </label>
                    <!--<div class="grid grid-cols-3">
                        {#each  estados as e}
                            <div>
                                <button
                                    aria-label={`estado ${e.nombre}` }
                                    onclick={()=>selectOption(e.id)}
                                    class={`
                                        ${
                                            e.id==prenada?
                                            estilos.basicofill:
                                            estilos.basico} 

                                            ${estilos.medio} ${estilos.primario}
                                    `}
                                >
                                        {e.nombre}
                                </button>
                                
                            </div>
                        {/each} 
                    </div>
                    -->
                </div>
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
                    />
                </label>
                <label for = "tipo" class="label">
                    <span class="label-text text-base">Tacto/Ecografia</span>
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
                        {#each tipostacto as t}
                            <option value={t.id}>{t.nombre}</option>    
                        {/each}
                      </select>
                </label>
                <div class="hidden">
                <label for = "vete" class="label">
                    <span class="label-text text-base">Veterinario</span>
                </label>
                <label class="input-group">
                    <input 
                        id ="vete" 
                        type="text"  
                        class={`
                            input input-bordered w-full
                            border border-gray-300 rounded-md
                            focus:outline-none focus:ring-2 
                            focus:ring-green-500 focus:border-green-500
                            ${estilos.bgdark2}
                        `}
                        bind:value={nombreveterinario}
                    />
                </label>
                </div>
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
                  {#if idtacto==""}
                    <button class="btn btn-success text-white" onclick={guardar} >Guardar</button>
                  {:else}
                    <button class="btn btn-success text-white" onclick={editarTacto} >Editar</button>
                  {/if}
                  <button class="btn btn-error text-white" onclick={cerrar}>Cancelar</button>
                </form>
            </div>
        </div>

    </dialog>
</Navbarr>