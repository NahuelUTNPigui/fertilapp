<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import estilos from '$lib/stores/estilos';
    import { createCaber } from '$lib/stores/cab.svelte';
    import categorias from "$lib/stores/categorias";
    import sexos from "$lib/stores/sexos";
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    let caber = createCaber()
    let cab = caber.cab

    //boton
    let textoboton = $state("Mover")
    //Datos animales
    let animales = $state([])
    let animalesrows = $state([])
    //Filtros
    let buscar = $state("")
    let lote = $state("")
    let rodeo = $state("")
    let categoria = $state("")
    let sexo = $state("")

    let lotes = $state([])
    let rodeos = $state([])
    let tipos = $state([])
    
    //Seleccionados
    let selectanimales = $state([])
    let selecthashmap = $state({})
    let todos = $state(false)
    let algunos = $state(false)
    let ninguno = $state(true)
    //movimiento
    let nuevacategoria = $state("")
    let nuevolote = $state("")
    let nuevorodeo = $state("")
    let tipotratamiento = $state("")
    let fecha = $state("")
    //validar
    let malcategoria = $state("")
    let mallote = $state("")
    let malrodeo = $state("")
    let maltipo = $state("")
    let malfecha = $state("")
    let habilitarboton = $state(false)

    //Seleecionar
    let selectcategoria = $state(true)
    let selectlote = $state(false)
    let selectrodeo = $state(false)
    let selecttratamiento = $state(false)


    function filterUpdate(){
        let lista = []
        for (const [key, value ] of Object.entries(selecthashmap)) {
            lista.push(key)
        }
        for(let i = 0;i<lista.length;i++){
            selecthashmap[lista[i]] = null
        }
        algunos = false
        todos = false
        ninguno = true
        animalesrows = animales
        if(buscar != ""){
            animalesrows = animalesrows.filter(a=>a.caravana.startsWith(buscar))
        }
        if(sexo != ""){
            animalesrows = animalesrows.filter(a=>a.sexo == sexo)
        }
        if(rodeo != ""){
            animalesrows = animalesrows.filter(a=>a.rodeo == rodeo)
        }
        if(lote != ""){
            animalesrows = animalesrows.filter(a=>a.lote == lote)
        }
        if(categoria != ""){
            animalesrows = animalesrows.filter(a=>a.categoria == categoria)
        }

    }
    
    function ordenarNombre(lista){
        lista.sort((r1,r2)=>r1.nombre.toLocaleLowerCase()>r2.nombre.toLocaleLowerCase()?1:-1)
    }
    function clickAnimal(id){
        if(selecthashmap[id]){
            if(todos){
                todos = false
                algunos = true
            }
            selecthashmap[id] = null
        }
        else{
            if(ninguno){
                algunos = true
                ninguno =  false
            }
            let a = animalesrows.filter(an=>an.id==id)[0]
            selecthashmap[id] = {
                ...a
            }
        }
    }
    function clickTodos(){
        if(todos){
            todos = false
            ninguno = true
            for(let i = 0;i<animalesrows.length;i++){
                selecthashmap[animalesrows[i].id] = null
            }
        }
        if(ninguno){
            ninguno = false
            todos = true
            for(let i = 0;i<animalesrows.length;i++){
                let a = animalesrows.filter(an=>an.id==id)[0]
                selecthashmap[animalesrows[i].id] = {
                    ...a
                }
            }
        }
        if (algunos){
            let lista = []
            for (const [key, value ] of Object.entries(selecthashmap)) {
                lista.push(key)
            }
            for(let i = 0;i<lista.length;i++){
                selecthashmap[lista[i]] = null
            }
            algunos = false
            todos = false
            ninguno = true
        }
        
    }
    async function getLotes(){
        const records = await pb.collection('lotes').getFullList({
            filter:`active = true && cab ~ '${cab.id}'`,
            sort: 'nombre',
        });
        lotes = records
        ordenarNombre(lotes)
    }
    async function getRodeos(){
        const records = await pb.collection('rodeos').getFullList({
            filter:`active = true && cab ~ '${cab.id}'`,
            sort: 'nombre',
        });
        rodeos = records
        //ordenarNombre(rodeos)
    }
    async function getTipos(){
        const records = await pb.collection('tipotratamientos').getFullList({
            filter : `(cab='${cab.id}' || generico = true) && active = true`,
            sort: '-created',
        });
        tipos = records
        tipos.sort((tp1,tp2)=>tp1.nombre>tp2.nombre?1:-1)
    }
    async function getAnimales(){
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && delete=false && cab='${cab.id}'`,
            expand:"rodeo,lote"
        })
        
        animales = recordsa
        animales.sort((a1,a2)=>a1.caravana>a2.caravana?1:-1)
        animalesrows = animales
    }
    function openNewModal(){
        nuevoModal.showModal()   
    }
    async function mover(){
        if(ninguno){
            Swal.fire("Error movimiento","No hay animales seleccionados","error")
            nuevorodeo = ""
            nuevolote = ""
            nuevacategoria = ""
            return
        }
        let lista = []
        for (const [key, value ] of Object.entries(selecthashmap)) {
            lista.push(value)
        }
        if(lista.length==0){
            Swal.fire("Error movimiento","No hay animales seleccionados","error")
            nuevorodeo = ""
            nuevolote = ""
            nuevacategoria = ""
            return
        }
        try{
            let data = {}
            let nombrelote = ""
            let nombrerodeo = ""
            if(selectcategoria){
                data.categoria = nuevacategoria
                
            }
            if(selectlote){
                data.lote = nuevolote
                nombrelote = lotes.filter(l =>l.id==nuevolote)[0]
            }
            if(selectrodeo){
                data.rodeo = nuevorodeo
                nombrerodeo = rodeos.filter(r =>r.id==nuevorodeo)[0]
            }
            if(selecttratamiento){
                data.fecha = fecha + " 03:00:00"
                data.tipo = tipotratamiento
                data.active = true
                data.cab = cab.id
            }
            for(let i = 0;i<lista.length;i++){
                
                if(!selecttratamiento){
                    await pb.collection('animales').update(lista[i].id, data);
                }
                else{
                    let a = lista[i]
                    await pb.collection("tratamientos").create({
                        ...data,
                        animal:a.id,
                        categoria:a.categoria

                    })
                }
                
                
            }
            for(let i = 0;i<lista.length;i++){
                selecthashmap[lista[i].id] = null
            }
            algunos = false
            todos = false
            ninguno = true
            selectcategoria = true
            selectlote = false
            selectrodeo = false
            selecttratamiento = false
            nuevacategoria = ""
            nuevolote = ""
            nuevorodeo = ""
            fecha = ""
            tipotratamiento = ""
            habilitarboton = false
            Swal.fire("Éxito movimiento","Movimiento exitoso","success")
            await getAnimales()
            filterUpdate()
        }
        catch(err){
            console.error(err)
            Swal.fire("Error movimiento","Movimiento sin éxito","error")
        }
        nuevorodeo = ""
        nuevolote = ""
        nuevacategoria = ""

    }
    function onChangeCollapse(seccion){
        nuevacategoria = ""
        nuevolote = ""
        nuevorodeo = ""
        fecha = ""
        tipotratamiento = ""
        habilitarboton = false
        if(seccion == "CATEGORIA"){
            selectcategoria= true
            selectlote= false
            selectrodeo= false
            selecttratamiento = false
            textoboton = "Mover"
            
        }
        if(seccion == "RODEO"){
            selectcategoria= false
            selectlote= false
            selectrodeo= true
            selecttratamiento = false
            textoboton = "Mover"
            
        }
        if(seccion == "LOTE"){
            selectcategoria= false
            selectlote= true
            selectrodeo= false
            selecttratamiento = false
            textoboton = "Mover"
            
        }
        if(seccion == "TRATAMIENTO"){
            selectcategoria= false
            selectlote= false
            selectrodeo= false
            selecttratamiento = true
            textoboton = "Crear tratamientos"
            
        }

    }
    function validarBoton(){
        habilitarboton = true
        if(selectcategoria){
            if(nuevacategoria == ""){
                habilitarboton = false
                
            }
        }
        if(selectlote){
            if(nuevolote == ""){
                habilitarboton = false
                
            }
        }
        if(selectrodeo){
            if(nuevorodeo == ""){
                habilitarboton = false
                
            }
        }
        if(selecttratamiento){
            if(fecha == "" || tipotratamiento == ""){
                habilitarboton = false
                
            }
        }
    }
    function oninput(campo){
        validarBoton()
        if(selectcategoria && campo == "CATEGORIA"){
            if(nuevacategoria == ""){
                malcategoria = true
            }
            else{
                malcategoria = false
            }
        }
        if(selectlote && campo == "LOTE"){
            if(nuevolote == ""){
                mallote = true
            }
            else{
                mallote = false
            }
        }
        if(selectrodeo && campo == "RODEO"){
            if(nuevorodeo == ""){
                malrodeo = true
            }
            else{
                malrodeo = false
            }
        }
        if(selecttratamiento){
            if(campo == "FECHA"){
                if(fecha == "" ){
                    malfecha = true
                }
                else{
                    malfecha = false
                }
            }

            if(campo == "TIPO"){
                if( tipotratamiento == ""){
                    maltipo = true
                }
                else{
                    maltipo = false
                }
            }
        }
    }
    onMount(async ()=>{
        await getAnimales()
        await getRodeos()
        await getLotes()
        await getTipos()
    })

</script>
<Navbarr>
    <div class="w-full grid justify-items-start mx-1 lg:mx-10 mt-1">
        <h1 class="text-2xl">Movimientos</h1>  
    </div>
    <div class="grid grid-cols-1 lg:grid-cols-2  m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10" >
        <div class="w-11/12">
            <label class={`input input-bordered flex items-center gap-2 ${estilos.bgdark2}`}>
                <input type="text" class="grow" placeholder="Buscar..." bind:value={buscar} oninput={filterUpdate} />
            </label>
        </div>
        
    </div>
    <div class="grid grid-cols-2 lg:grid-cols-4  m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10 w-11/12" >
        <div>
            <label for = "sexo" class="label">
                <span class="label-text text-base">Sexo</span>
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
                    bind:value={sexo}
                    onchange={filterUpdate}
                >
                        <option value="">Todos</option>
                        {#each sexos as s}
                            <option value={s.id}>{s.nombre}</option>
                        {/each}
                  </select>
            </label>
        </div>
        <div>
            <label for = "rodeos" class="label">
                <span class="label-text text-base">Rodeos</span>
            </label>
            <label class="input-group ">
                <select 
                    class={`
                        select select-bordered w-full
                        rounded-md
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `} 
                    bind:value={rodeo}
                    onchange={filterUpdate}
                >
                        <option value="">Todos</option>
                        {#each rodeos as r}
                            <option value={r.id}>{r.nombre}</option>    
                        {/each}
                  </select>
            </label>
        </div>
        <div>
            <label for = "rodeos" class="label">
                <span class="label-text text-base">Lotes</span>
            </label>
            <label class="input-group ">
                <select 
                    class={`
                        select select-bordered w-full
                        rounded-md
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `} 
                    bind:value={lote}
                    onchange={filterUpdate}
                >
                        <option value="">Todos</option>
                        {#each lotes as r}
                            <option value={r.id}>{r.nombre}</option>    
                        {/each}
                  </select>
            </label>
        </div>
        <div>
            <label for = "rodeos" class="label">
                <span class="label-text text-base">Categorias</span>
            </label>
            <label class="input-group ">
                <select 
                    class={`
                        select select-bordered w-full
                        rounded-md
                        focus:outline-none 
                        focus:ring-2 
                        focus:ring-green-500 focus:border-green-500
                        ${estilos.bgdark2}
                    `} 
                    bind:value={categoria}
                    onchange={filterUpdate}
                >
                        <option value="">Todos</option>
                        {#each categorias as r}
                            <option value={r.id}>{r.nombre}</option>    
                        {/each}
                  </select>
            </label>
        </div>
        
    
    </div>
    <div  class="w-full grid grid-cols-1 lg:grid-cols-4 m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10">
        <button class={`w-11/12 btn btn-primary flex ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
            <span  class="text-xl">Nuevo movimiento</span>
        </button>
    </div>
    <div class="w-full grid grid-cols-1 justify-items-center mx-1 lg:mx-10 lg:w-5/6 overflow-x-auto" >
        <table class="table table-lg w-full " >
            <thead>
                <tr>
                    <th class="px-1 p-0 m-0">
                        <button    
                            aria-label="Todos"
                            onclick={clickTodos}
                            class={`
                                text-base bg-transparent rounded-lg
                                px-3 py-3 text-base
                                ${estilos.secundario}
                            `}
                        >
                            {#if todos}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M9 12.75 11.25 15 15 9.75M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {/if}
                            {#if ninguno}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="m9 12.75 3 3m0 0 3-3m-3 3v-7.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>
                            {/if}
                            {#if algunos}
                            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                <path stroke-linecap="round" stroke-linejoin="round" d="M15 12H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                            </svg>      
                            {/if}                        
                          
                        </button>
                    </th>
                    <th class="text-base mx-1 px-1 ">Caravana</th>
                    <th class="text-base mx-1 px-1">Categoria</th>
                    <th class="text-base mx-1 px-1">Rodeo</th>
                    <th class="text-base mx-1 px-1">Lote</th>
                    <th class="text-base mx-1 px-1">Sexo</th>
                </tr>

            </thead>
            <tbody>
                {#each animalesrows as a}
                    <tr>
                        <td class="px-1 p-0 m-0">
                            <button
                                aria-label="fila"
                                onclick={()=>clickAnimal(a.id)}
                                class={`
                                    font-medium bg-transparent rounded-lg
                                    px-3 py-3 text-base
                                    ${selecthashmap[a.id]?estilos.danger:estilos.primario}
                                `}
                            >
                                {#if selecthashmap[a.id]}
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="m9.75 9.75 4.5 4.5m0-4.5-4.5 4.5M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>                                  
                                {:else}             
                                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                                        <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v6m3-3H9m12 0a9 9 0 1 1-18 0 9 9 0 0 1 18 0Z" />
                                    </svg>
                                {/if}
                            </button>
                        </td>
                        <td class="text-base mx-1 px-0">{a.caravana}</td>
                        <td class="text-base mx-1 px-0">{a.categoria}</td>
                        <td class="text-base mx-1 px-0">{a.expand?.rodeo?.nombre||''}</td>
                        <td class="text-base mx-1 px-0">{a.expand?.lote?.nombre||''}</td>
                        <td class="text-base mx-1 px-0">{a.sexo}</td>
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
            <h3 class="text-lg font-bold">Movimiento</h3>
            <div class="form-control gap-1">
                <div class="collapse">
                    
                    <input type="radio" name="my-accordion-1" checked="checked" onchange={()=>onChangeCollapse("CATEGORIA")}/>
                    <div class="collapse-title text-xl font-medium">Cambiar categoria</div>
                    <div class="collapse-content">
                        <label for = "rodeos" class="label">
                            <span class="label-text text-base">Seleccione nueva categoria</span>
                        </label>
                        <label class="input-group ">
                            <select 
                                class={`
                                    select select-bordered w-full
                                    rounded-md
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-green-500 focus:border-green-500
                                    ${estilos.bgdark2}
                                `} 
                                bind:value={nuevacategoria}
                                onchange={()=>{oninput("CATEGORIA")}}

                            >    
                                {#each categorias as r}
                                    <option value={r.id}>{r.nombre}</option>    
                                {/each}
                              </select>
                        </label>
                    </div>
                </div>
                <div class="collapse">
                    <input type="radio" name="my-accordion-1" onchange={()=>onChangeCollapse("LOTE")} />
                    <div class="collapse-title text-xl font-medium">Cambiar lote</div>
                    <div class="collapse-content">
                        <label for = "rodeos" class="label">
                            <span class="label-text text-base">Seleccione nuevo lote</span>
                        </label>
                        <label class="input-group ">
                            <select 
                                class={`
                                    select select-bordered w-full
                                    rounded-md
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-green-500 focus:border-green-500
                                    ${estilos.bgdark2}
                                `} 
                                bind:value={nuevolote}
                                onchange={()=>oninput("LOTE")}
                            >
                                {#each lotes as r}
                                    <option value={r.id}>{r.nombre}</option>    
                                {/each}
                            </select>
                        </label>
                    </div>
                </div>
                <div class="collapse">
                    <input type="radio" name="my-accordion-1" onchange={()=>onChangeCollapse("RODEO")}/>
                    <div class="collapse-title text-xl font-medium">Cambiar rodeo</div>
                    <div class="collapse-content">
                        <label for = "rodeos" class="label">
                            <span class="label-text text-base">Rodeos</span>
                        </label>
                        <label class="input-group ">
                            <select 
                                class={`
                                    select select-bordered w-full
                                    rounded-md
                                    focus:outline-none 
                                    focus:ring-2 
                                    focus:ring-green-500 focus:border-green-500
                                    ${estilos.bgdark2}
                                `} 
                                bind:value={nuevorodeo}
                                onchange={()=>oninput("RODEO")}
                            >
                                    
                                    {#each rodeos as r}
                                        <option value={r.id}>{r.nombre}</option>    
                                    {/each}
                              </select>
                        </label>
                    </div>
                </div>
                <div class="collapse">
                    <input type="radio" name="my-accordion-1" onchange={()=>onChangeCollapse("TRATAMIENTO")}/>
                    <div class="collapse-title text-xl font-medium">Agregar tratamientos</div>
                    <div class="collapse-content">
                        <div class="grid grid-cols-2 gap-1">
                            <div>
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
                                        bind:value={tipotratamiento}
                                        onchange={()=>oninput("TIPO")}
                                    >
                                        {#each tipos as t}
                                            <option value={t.id}>{t.nombre}</option>    
                                        {/each}
                                    </select>
                                    
                                </label>
                            </div>
                            <div>
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
                            </div>
                        </div>
                    </div>
                </div>
            </div>
            <div class="modal-action justify-start ">
                <form method="dialog" >
                    <button class="btn btn-success text-white" disabled='{!habilitarboton}' onclick={mover} >{textoboton}</button>
                    <button class="btn btn-error text-white" >Cancelar</button>
                </form>
            </div>
        </div>

    </dialog>
</Navbarr>
