<script>
    import estilos from "$lib/stores/estilos";
    import sexos from "$lib/stores/sexos";
    import { page } from '$app/stores';
    import { onMount } from "svelte";
    import { createCaber } from '$lib/stores/cab.svelte';
    import { goto } from "$app/navigation";
    import PocketBase from 'pocketbase'
    import Swal from "sweetalert2";
    let {caravana,connacimiento,peso,sexo,nacimiento,fechanacimiento} = $props()
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    let caber = createCaber()
    let cab = caber.cab
    let id = $state("")
    let modoedicion = $state(false)
    //Datos edicion
    let pesoviejo = $state("")
    let sexoviejo = $state("")
    let caravanavieja = $state("")
    //Datos nacimiento
    let idnacimiento = $state("")
    let padre = $state("")
    let madre = $state("")
    let nombremadre = $state("")
    let nombrepadre = $state("")
    let fecha = $state("")
    let madres = $state([])
    let padres = $state([])
    let observacion = $state("") 
    //Animales
    async function getAnimales(){
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && cab='${cab.id}'`,
            expand:"nacimiento"
        })
        madres = recordsa.filter(a=>a.sexo == "F")
        padres = recordsa.filter(a=>a.sexo == "M")
    }
    function getSexo(sex){
        let obj = sexos.filter(s => s.id == sex)[0]
        if(obj){
            return obj.nombre
        }
        else{
            return ""
        }        
    }
    function getFechaNacimiento(nacimiento){
        if(nacimiento){
            return new Date(nacimiento.fecha).toLocaleDateString()
        }
        else{
            return false
        }
    }
    function openEditar(){
        modoedicion = true
        pesoviejo = peso
        sexoviejo = sexo
        caravanavieja = caravana
    }
    function cancelarEditar(){
        modoedicion = false
        peso = pesoviejo
        sexo = sexoviejo
        caravana = caravanavieja
    }
    function openNewModal(){
        fecha  = fechanacimiento
        nuevoModal.showModal()
    }
    async function guardarNaciminento(){
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
            let datanimal = {
                nacimiento:recordparicion.id,
                fechanacimiento:fecha + " 03:00:00",

            }
            const record = await pb.collection('animales').update(id, datanimal);
            Swal.fire("Éxito guardar","Se pudo guardar el nacimiento","success")
            connacimiento = true
            nacimiento = recordparicion
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar el nacimiento","error")
        }
    }
    function getNombreMadre(){
        let m = madres.filter(item=>item.id == madre)[0]
        nombremadre = m.caravana
    }
    function getNombrePadre(){
        let p = padres.filter(item=>item.id == padre)[0]
        nombrepadre = p.caravana
    }
    async function editarAnimal(){
        let data = {
            peso,
            sexo,
            caravana
        }
        try{
            const record = await pb.collection('animales').update(id, data);
            sexo = data.sexo
            peso = data.peso
            caravana = data.caravana
            Swal.fire("Éxito editar","Se pudo editar el animal","success")
            modoedicion = false

        }catch(err){
            console.log(err)
            Swal.fire("Error editar","No se pudo editar el animal","error")
        }
    }
    function cerrarModal(){
        fecha = ""
        nombremadre = ""
        nombrepadre = ""
        madre = ""
        padre = ""
        observacion = ""
        nuevoModal.close()
    }
    onMount(async ()=>{
        id = $page.params.slug
        
        await getAnimales()
    })
</script>

<h2 class="text-2xl mx-1 font-bold mb-2 text-left mt-2">
    Caravana: {caravana}
</h2>
<div class="grid grid-cols-3 lg:grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
    <div class="mb-1 lg:mb-0">
        <label for = "peso" class="label">
            <span class="label-text text-base">Peso(KG)</span>
        </label>
        {#if modoedicion}
            <label class="input-group">
                <input id ="peso" type="text"  
                    class={`input input-bordered w-full `}
                    bind:value={peso}
                />
            </label>
        {:else}
            <label for="nombre" 
                class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-2`}
            >
                {peso}
            </label>
        {/if}
    </div>
    <div class="mb-1 lg:mb-0">
        
        {#if modoedicion}
        <label for = "sexo" class="label">
            <span class="label-text text-base">Sexo</span>
        </label>
        <label class="input-group ">
            <select 
                class={`
                    select select-bordered w-full
                    border border-gray-300 rounded-md
                    focus:outline-none focus:ring-2 
                    focus:ring-green-500 focus:border-green-500
                    ${estilos.bgdark2}
                `} bind:value={sexo}>
                {#each sexos as s}
                    <option value={s.id}>{s.nombre}</option>    
                {/each}
            </select>
        </label>
        {:else}
            <label for = "sexo" class="label">
                <span class="label-text text-base">Sexo</span>
            </label>
            <label for="sexo" 
                class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-2`}
            >
                {getSexo(sexo)}
            </label>
        {/if}
    </div>
    {#if modoedicion}
        <div class="mb-1 lg:mb-0">
            <label for = "caravana" class="label">
                <span class="label-text text-base">Caravana</span>
            </label>
            <label class="input-group">
                <input id ="caravana" type="text"  
                    class={`input input-bordered w-full `}
                    bind:value={caravana}
                />
            </label>
        </div>
    {/if}
</div>
<div class="mt-3 flex justify-center gap-2">
    {#if  !modoedicion}
        <div class="flex w-11/12">
            <button
                onclick={openEditar}
                class={`
                    w-full
                    btn text-lg px-6 py-2 
                    focus:outline-none focus:ring-2 
                    focus:ring-offset-2 font-medium 
                    rounded-md border-2
                    ${estilos.btnsecondary}
                    `}
            >
                Editar animal
            </button>    
        </div>
    {:else}
        <div class="grid grid-cols-2 gap-3">
            <button 
                onclick={cancelarEditar}
                class="btn btn-error text-white font-medium text-lg "
            >
                Cancelar
            </button>   
            <button
                onclick={editarAnimal}
                class="
                    btn text-lg px-6 py-2 bg-green-600 
                    hover:bg-green-700 rounded-md text-white font-medium focus:outline-none 
                    focus:ring-2 focus:ring-offset-2 focus:ring-green-500 
                    
                    "
                >
                Guadar
            </button>
        </div>
    {/if}
</div>
{#if connacimiento}
    <h3 class="text-xl font-bold mt-1 mb-1 text-left">
        Nacimiento
    </h3>
    <div class="grid grid-cols-1 lg:grid-cols-1 gap-1 lg:gap-6 mb-2">
        <div>
            <label for = "fechanacimiento" class="label">
                <span class="label-text text-base">Fecha</span>
            </label>
            <label for="fechanacimiento" 
                class={`block text-lg font-medium text-gray-700 dark:text-gray-300 mb-1 p-2`}
            >
                {getFechaNacimiento(nacimiento)}
            </label>
        </div>
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-2 gap-1 lg:gap-6 mx-1 mb-2">
        <div>
            <label for = "nombremadre" class="label">
                <span class="label-text text-base">Nombre madre</span>
            </label>
            <label for="nombremadre" 
                class={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`}
            >
                {nacimiento.nombremadre}
            </label>
        </div>
        <div>
            <label for = "nombrepadre" class="label">
                <span class="label-text text-base">Nombre padre</span>
            </label>
            <label for="nombrepadre" 
                class={`block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1`}
            >
                {nacimiento.nombrepadre}
            </label>
        </div>
    </div>
    {:else}
        <div>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-2 lg:gap-10 m-1  mb-2 lg:mx-10" >
                <h3 class="text-xl mx-1 font-bold mb-6 text-left">
                    No tiene un nacimiento registrado
                </h3>
                <button class={`w-full btn btn-primary flex ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                    <span  class="text-xl">Crear nacimiento</span>
                </button>
            </div>
            
        </div>
{/if}
<div class="flex justify-start p-0 m-0">
    <button class={`btn ${estilos.btnsecondary}`} onclick={()=>goto("/animales")}>Volver</button>
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
        <h3 class="text-lg font-bold">Nuevo nacimiento</h3>  
        <div class="form-control">    
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
              <button class="btn btn-success text-white" onclick={guardarNaciminento} >Guardar</button>
              <button class="btn btn-error text-white" onclick={cerrarModal}>Cancelar</button>
            </form>
        </div>
    </div>
</dialog>
