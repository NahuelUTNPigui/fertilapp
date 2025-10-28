<script>
    //En esta pagina solo se van a crear y ver animales
    //Se pueden crear nuevos animales con un nacimientos
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import { slide } from "svelte/transition";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import sexos from "$lib/stores/sexos";
    import estilos from "$lib/stores/estilos";
    import estados from "$lib/stores/estados";
    import categorias from "$lib/stores/categorias";
    import { goto } from "$app/navigation";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { createUserer } from "$lib/stores/user.svelte";
    //filtros
    import { createStorageProxy } from "$lib/filtros/filtros";

    //permisos
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import RadioButton from "$lib/components/RadioButton.svelte";
    import {
        getEstadoNombre,
        getEstadoColor,
    } from "$lib/components/estadosutils/lib";
    import MultiSelect from "$lib/components/MultiSelect.svelte";
    import cuentas from "$lib/stores/cuentas";
    import {
        getSexoNombre,
        capitalize,
        shorterWord,
    } from "$lib/stringutil/lib";
    import { verificarNivel } from "$lib/permisosutil/lib";
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let caber = createCaber();
    let userer = createUserer();
    let per = createPer();
    let cab = caber.cab;
    let userpermisos = $state([]);

    let usuarioid = $state("");
    let filtros = false;
    let defaultfiltro = {
        buscar: "",
        rodeobuscar: "",
        rodeoseleccion: [],
        loteseleccion: [],
        categoriaseleccion: [],
        sexobuscar: "",
        lotebuscar: "",
        estadobuscar: -1,
        categoriabuscar: "",
        activosbuscar: "activos",
        fechadesde: "",
        fechahasta: "",
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("listahistoriaanimales", defaultfiltro);
    //Datos para mostrar
    //lista historiales
    let historial = $state([])
    //lista animales
    let animales = $state([]);
    //filas es el resultado de combinar animales e historiales
    let filas = $state([])
    //son las filas filtrads
    let historiarows = $state([])
    //son las filas procesadas que se ven en la tabla
    let animalesrows = $state([]);
    let rodeos = $state([]);
    let lotes = $state([]);
    let activos = [
        { id: "todos", nombre: "Todos" },
        { id: "activos", nombre: "Solo activos" },
        { id: "inactivos", nombre: "Solo inactivos" },
    ];
    let madres = $state([]);
    let padres = $state([]);
    let buscar = $state("");
    let rodeobuscar = $state("");
    let rodeoseleccion = $state([]);
    let loteseleccion = $state([]);
    let categoriaseleccion = $state([]);
    let sexobuscar = $state("");
    let lotebuscar = $state("");
    let estadobuscar = $state("");
    let categoriabuscar = $state("");
    let activosbuscar = $state("activos");
    let totalAnimalesEncontrados = $state(0);
    let fechadesde = $state("");
    let fechahasta = $state("");
    let botonhabilitado = $state(false);
    function calcularEdad(fechaNacimiento, fechaReferencia = new Date()) {
        const nacimiento = new Date(fechaNacimiento);
        const referencia = new Date(fechaReferencia);

        let años = referencia.getFullYear() - nacimiento.getFullYear();
        let meses = referencia.getMonth() - nacimiento.getMonth();
        let dias = referencia.getDate() - nacimiento.getDate();

        if (dias < 0) {
            // Restar un mes y calcular días exactos
            meses -= 1;
            const ultimoMes = new Date(
                referencia.getFullYear(),
                referencia.getMonth(),
                0,
            );
            dias += ultimoMes.getDate();
        }

        if (meses < 0) {
            años -= 1;
            meses += 12;
        }

        return `${años} A ${meses} M ${dias} D`;
    }
    function cambiarFiltros() {
        filtros != filtros;
    }
    function ordenarNombre(lista) {
        if (lista.length == 0) {
            return [];
        }
        lista.sort((r1, r2) =>
            r1.nombre.toLocaleLowerCase() > r2.nombre.toLocaleLowerCase()
                ? 1
                : -1,
        );
    }
    function isEmpty(str) {
        return !str || str.length === 0;
    }
    function limpiarFiltros() {
        proxyfiltros = { ...defaultfiltro };

        setFilters();
        filterUpdate();
    }
    async function getRodeos() {
        const records = await pb.collection("rodeos").getFullList({
            filter: `active = true && cab = '${cab.id}'`,
            sort: "nombre",
        });
        rodeos = records;
        ordenarNombre(rodeos);
    }
    async function getLotes() {
        const records = await pb.collection("lotes").getFullList({
            filter: `active = true && cab = '${cab.id}'`,
            sort: "nombre",
        });
        lotes = records;
        ordenarNombre(lotes);
    }
    async function getHistorialAnimales() {
      const recordsa = await pb.collection("historialanimales").getFullList({
            filter: `cab='${cab.id}'`,
            expand: "nacimiento,lote,rodeo",
        });  
    }
    async function getAnimales() {
        //Estaria joya que el animal venga con todos los chiches

        const recordsa = await pb.collection("animales").getFullList({
            filter: `delete=false && cab='${cab.id}'`,
            expand: "nacimiento,lote,rodeo",
        });

        animales = recordsa;
        animales.sort((a1, a2) => (a1.caravana > a2.caravana ? 1 : -1));

        //animalesrows = animales;
        madres = animales.filter((a) => a.sexo == "H");
        padres = animales.filter((a) => a.sexo == "M");
    }
    function procesarFilas(){
        animalesrows = []
        for (let i = 0; i < historiarows.length; i++) {
            let h = historiarows[i];
            let ultimo_estado = h.estados[h.estados.length - 1];
            let fila = { ...ultimo_estado };
            animalesrows.push(fila);
        }
        totalAnimalesEncontrados = animalesrows.length
    }
    function procesarHistorial(){
        for(let i =0;i<animales.length;i++){
            let a = animales[i]
            let animalhistoria = {
                id:a.id,
                estados:[]
            }
            let fecha_inicio = a.created
            let fecha_fin = ""
            let hs_animal = historial.filter(h=>h.animal == a.id)
            for (let j = 0; j < hs_animal.length; j++) {
                let h = hs_animal
                fecha_fin = h.created
                let estado = {
                    fecha_inicio,
                    fecha_fin,
                    ...h
                }
                animalhistoria.estados.push(estado)
                fecha_inicio = fecha_fin
            }
            fecha_fin = new Date().toUTCString().split("T")[0] + " 00:00:00";
            let estado = {
                fecha_inicio,
                fecha_fin,
                ...a
            }
            animalhistoria.estados.push(estado)
            filas.push(animalhistoria)
        }
    }

    function setFilters() {
        buscar = proxyfiltros.buscar;
        rodeobuscar = proxyfiltros.rodeobuscar;
        rodeoseleccion = proxyfiltros.rodeoseleccion;
        loteseleccion = proxyfiltros.loteseleccion;
        categoriaseleccion = proxyfiltros.categoriaseleccion;
        sexobuscar = proxyfiltros.sexobuscar;
        lotebuscar = proxyfiltros.lotebuscar;
        estadobuscar = proxyfiltros.estadobuscar;
        categoriabuscar = proxyfiltros.categoriabuscar;
        activosbuscar = proxyfiltros.activosbuscar;
        fechadesde = proxyfiltros.fechadesde;
        fechahasta = proxyfiltros.fechahasta;
    }
    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.rodeobuscar = rodeobuscar;
        proxyfiltros.rodeoseleccion = rodeoseleccion;
        proxyfiltros.loteseleccion = loteseleccion;
        proxyfiltros.categoriaseleccion = categoriaseleccion;
        proxyfiltros.sexobuscar = sexobuscar;
        proxyfiltros.lotebuscar = lotebuscar;
        proxyfiltros.estadobuscar = estadobuscar;
        proxyfiltros.categoriabuscar = categoriabuscar;
        proxyfiltros.activosbuscar = activosbuscar;
        proxyfiltros.fechadesde = fechadesde;
        proxyfiltros.fechahasta = fechahasta;
    }
    function filtrarPorParecido(variableestado, variable) {
        if (variable.length == 0) {
            return true;
        }
        return variableestado
            .toLocaleLowerCase()
            .includes(variable.toLocaleLowerCase());
    }
    function filtrarPorIgualdad(variableestado, variable) {
        if (variable.length == 0) {
            return true;
        }
        return variableestado == variable;
    }
    function filtrarPorFechaEstado(estado, fechadesde, fechahasta) {
        
        let estado_inicio = new Date(estado.fecha_inicio);
        let estado_fin = new Date(estado.fecha_fin);
        let desde = new Date(fechadesde);
        let hasta = new Date(fechahasta);
        let no_valido = estado_fin < desde || estado_inicio > hasta;
        return !no_valido;
    }
    function filtrarPorColeccion(variableestadoestado,coleccion){
        if(coleccion.length==0){
            return true
        }
        else if(coleccion[0] == "-1"){
            return !variableestadoestado
        }
        else{
            return coleccion.includes(variableestadoestado)
        }
    }
    function validarEstado(estado){
        //fecha
        if (!filtrarPorFechaEstado(estado, fechadesde, fechahasta)) {
            return false;
        }
        
        if(!filtrarPorParecido(estado.caravana,buscar)){
            return false
        }
        
        //if (buscar != "") {
        //    animalesrows = animalesrows.filter((a) =>
        //        a.caravana
        //            .toLocaleLowerCase()
        //            .includes(buscar.toLocaleLowerCase()),
        //    );
        //}
        if(!filtrarPorIgualdad(estado.sexo,sexobuscar)){
            return false
        }
        
        //if (sexobuscar != "") {
        //    animalesrows = animalesrows.filter((a) => a.sexo == sexobuscar);
        //}
        if(!filtrarPorColeccion(estado.rodeo,rodeoseleccion)){
            return false
        }
        
        //if (rodeoseleccion.length != 0) {
        //    if (rodeoseleccion.length == 1 && rodeoseleccion[0] == "-1") {
        //        animalesrows = animalesrows.filter((a) => !a.rodeo);
        //    } else {
        //        animalesrows = animalesrows.filter((a) =>
        //            rodeoseleccion.includes(a.rodeo),
        //        );
        //    }
        //}
        if(!filtrarPorColeccion(estado.lote,loteseleccion)){
            return false
        }
        
        //if (loteseleccion.length != 0) {
        //    if (loteseleccion.length == 1 && loteseleccion[0] == "-1") {
        //        animalesrows = animalesrows.filter((a) => !a.lote);
        //    } else {
        //        animalesrows = animalesrows.filter((a) =>
        //            loteseleccion.includes(a.lote),
        //        );
        //    }
        //}

        if (estadobuscar != -1  ) {
            return (estado.prenada == estadobuscar && estado.sexo == "H")
            //animalesrows = animalesrows.filter(
            //    (a) => a.prenada == estadobuscar && a.sexo == "H",
            //);
        }
        
        if(!filtrarPorColeccion(estado.categoria,categoriaseleccion)){
            return false
        }
        
        //if (categoriaseleccion.length != 0) {
        //    if (
        //        categoriaseleccion.length == 1 &&
        //        categoriaseleccion[0] == "-1"
        //    ) {
        //        animalesrows = animalesrows.filter((a) => !a.categoria);
        //    } else {
        //        animalesrows = animalesrows.filter((a) =>
        //            categoriaseleccion.includes(a.categoria),
        //        );
        //    }
        //}
        if (activosbuscar == "activos" && !estado.active) {
            return false
            //animalesrows = animalesrows.filter((a) => a.active == true);

        }
        if (activosbuscar == "inactivos" && estado.active) {
            return false
            //animalesrows = animalesrows.filter((a) => a.active == false);

        }
        return true
    }
    function filterUpdate() {
        setProxyFilter();
        proxy.save(proxyfiltros);
        historiarows = [];
        for(let i = 0;i<filas.length;i++){

            let ha = filas[i]

            let id = ha.id
            let listaestados = []
            let animalhistoria = {
                id,
                estados:[]
            }
            for(let j = 0;j<ha.estados.length;j++){
                
                let estado = ha.estados[j]
                
                if(validarEstado(estado)){
                    listaestados.push(estado)
                }
            }
            if(listaestados.length>0){
                animalhistoria.estados = listaestados.map(x=>x)
                historiarows.push(animalhistoria)
            }
        }
        
        procesarFilas()
        
    }

    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();

        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

        per.setPer(respermisos.permisos, usuarioid);
        userpermisos = getPermisosList(per.per.permisos);
        await getAnimales();
        
        await getRodeos();
        await getLotes();
        await getHistorialAnimales()
        
        procesarHistorial()
        filterUpdate()
    });
    function prepararData(item) {
        return {
            CARAVANA: item.caravana,
            RP: item.pr,
            NACIMIENTO: item.fechanacimiento
                ? new Date(item.fechanacimiento).toLocaleDateString()
                : "",
            PADRE: item.expand
                ? item.expand.nacimiento
                    ? item.expand.nacimiento.nombrepadre
                    : ""
                : "",
            MADRE: item.expand
                ? item.expand.nacimiento
                    ? item.expand.nacimiento.nombremadre
                    : ""
                : "",
            SEXO: item.sexo == "M" ? "Macho" : "Hembra",
            PESO: item.peso,
            RODEO: item.expand
                ? item.expand.rodeo
                    ? item.expand.rodeo.nombre
                    : ""
                : "",
            LOTE: item.expand
                ? item.expand.lote
                    ? item.expand.lote.nombre
                    : ""
                : "",
            CATEGORIA: capitalize(item.categoria),
            ESTADO: item.sexo == "M" ? "-" : getEstadoNombre(item.prenada),
            FALLECIMIENTO: item.fechafallecimiento
                ? new Date(item.fechafallecimiento).toLocaleDateString()
                : "",
        };
    }
    //Para el collapse de los filtros
    let isOpenFilter = $state(false);
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    //Para el collapse de los ordenar
    let isOpenOrdenar = $state(false);
    function clickOrdenar() {
        isOpenOrdenar = !isOpenOrdenar;
    }
    //Para los ordenar
    let ascendente = $state(true);
    let forma = $state("caravana");
    let selectforma = $state("caravana");
    //Ordenar animales
    function ordenarAnimalesDescendente(p_forma) {
        let escalar = 1;
        if (!ascendente) {
            escalar = -1;
        }
        forma = p_forma;
        if (forma == "caravana") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.caravana.localeCompare(a2.caravana),
            );
        } else if (forma == "sexo") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.sexo.localeCompare(a2.sexo),
            );
        } else if (forma == "categoria") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.categoria.localeCompare(a2.categoria),
            );
        } else if (forma == "estado") {
            animalesrows.sort((a1, a2) =>
                a1.prenada > a2.prenada ? escalar : -1 * escalar,
            );
        } else if (forma == "lote") {
            animalesrows.sort((a1, a2) => {
                let l1 = a1.expand
                    ? a1.expand.lote
                        ? a1.expand.lote.nombre
                        : ""
                    : "";
                let l2 = a2.expand
                    ? a2.expand.lote
                        ? a2.expand.lote.nombre
                        : ""
                    : "";
                return escalar * l1.localeCompare(l2);
            });
        } else if (forma == "rodeo") {
            animalesrows.sort((a1, a2) => {
                let r1 = a1.expand
                    ? a1.expand.rodeo
                        ? a1.expand.rodeo.nombre
                        : ""
                    : "";
                let r2 = a2.expand
                    ? a2.expand.rodeo
                        ? a2.expand.rodeo.nombre
                        : ""
                    : "";
                return escalar * r1.localeCompare(r2);
            });
        }
    }
    function ordenarAnimales(p_forma) {
        if (p_forma == forma) {
            ascendente = !ascendente;
        } else {
            ascendente = true;
        }
        let escalar = 1;
        if (!ascendente) {
            escalar = -1;
        }
        forma = p_forma;
        if (forma == "caravana") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.caravana.localeCompare(a2.caravana),
            );
        } else if (forma == "sexo") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.sexo.localeCompare(a2.sexo),
            );
        } else if (forma == "categoria") {
            animalesrows.sort(
                (a1, a2) => escalar * a1.categoria.localeCompare(a2.categoria),
            );
        } else if (forma == "estado") {
            animalesrows.sort((a1, a2) =>
                a1.prenada > a2.prenada ? escalar : -1 * escalar,
            );
        } else if (forma == "lote") {
            animalesrows.sort((a1, a2) => {
                let l1 = a1.expand
                    ? a1.expand.lote
                        ? a1.expand.lote.nombre
                        : ""
                    : "";
                let l2 = a2.expand
                    ? a2.expand.lote
                        ? a2.expand.lote.nombre
                        : ""
                    : "";
                return escalar * l1.localeCompare(l2);
            });
        } else if (forma == "rodeo") {
            animalesrows.sort((a1, a2) => {
                let r1 = a1.expand
                    ? a1.expand.rodeo
                        ? a1.expand.rodeo.nombre
                        : ""
                    : "";
                let r2 = a2.expand
                    ? a2.expand.rodeo
                        ? a2.expand.rodeo.nombre
                        : ""
                    : "";
                return escalar * r1.localeCompare(r2);
            });
        }
    }
</script>

<Navbarr>
    {#if esdev}
        premisos {JSON.stringify(userpermisos, null, 2)}
    {/if}
    <div class="grid grid-cols-1 lg:grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div class="">
            <h1 class="text-2xl">Historial</h1>
        </div>
        <div class="flex col-span-2 gap-1 justify-start lg:justify-end">
            <div>
                <button
                    class={`
                        bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                        ${estilos.btnsecondary}
                        rounded-full
                        px-4 pt-2 pb-3
                    `}
                    onclick={() => goto(pre + "/animales")}
                >
                    <span class="text-lg font-semibold">Volver</span>
                </button>
            </div>
            <div>
                <Exportar
                    titulo={`${cab.nombre}_${new Date().toLocaleDateString().replace("/", "-")}_Historial_Animales`}
                    sheetname={"Historial Animales"}
                    establecimiento={cab.nombre}
                    filtros={[]}
                    confiltros={false}
                    data={animalesrows}
                    {prepararData}
                />
            </div>
            <div>
                <button
                    class={`
                        bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                        ${estilos.btnsecondary}
                        rounded-full
                        px-4 pt-2 pb-3
                    `} 
                    onclick={() => goto(pre+"/animales/estadisticas")}
                >
                    <span class="text-lg font-semibold">Estadísticas</span>
                </button>
            </div>
        </div>
    </div>

    <div
        class="grid grid-cols-1 lg:grid-cols-2 m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10"
    >
        <div class="w-11/12">
            <label
                class={`
                    input 
                    input-bordered 
                    flex items-center 
                    gap-2
                    ${estilos.bgdark2}
                `}
            >
                <input
                    type="text"
                    class={`
                        grow
                    `}
                    placeholder="Buscar..."
                    bind:value={buscar}
                    oninput={filterUpdate}
                />
            </label>
        </div>
        <div class="w-11/12">
            <button
                onclick={limpiarFiltros}
                class={`
                    bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
                    ${estilos.btnsecondary}
                    rounded-full
                    px-4 pt-2 pb-3
                `}
                aria-label="Limpiar"
            >
                <span class="text-xl font-semibold">Limpiar</span>
            </button>
        </div>
    </div>
    <!--Filtros-->
    <div class="w-11/12 m-1 mb-2 lg:mx-10 rounded-lg bg-transparent">
        <button aria-label="Filtrar" class="w-full" onclick={clickFilter}>
            <div class="flex justify-between items-center px-1">
                <h1 class="font-semibold text-lg py-2">Filtros</h1>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`size-6 transition-all duration-300 ${isOpenFilter ? "transform rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
        </button>
        <div>
            <span class="text-lg my-1"
                >Total de animales encontrados: {totalAnimalesEncontrados}</span
            >
        </div>
        {#if isOpenFilter}
            <div transition:slide>
                <div
                    class="grid grid-cols-1 lg:grid-cols-3 gap-2 lg:gap-10 w-full my-1"
                >
                    <div class="">
                        <label
                            class="block tracking-wide mb-2"
                            for="grid-first-name"
                        >
                            Fecha desde
                        </label>
                        <input
                            id="fechadesde"
                            type="date"
                            class={`
                            w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechadesde}
                            onchange={filterUpdate}
                        />
                    </div>
                    <div class="">
                        <label
                            class="block tracking-wide mb-2"
                            for="grid-first-name"
                        >
                            Fecha Hasta
                        </label>
                        <input
                            id="fechadesde"
                            type="date"
                            class={`
                            w-full md:w-1/2
                                input input-bordered
                                ${estilos.bgdark2}
                            `}
                            bind:value={fechahasta}
                            onchange={filterUpdate}
                        />
                    </div>
                    <div class="mt-1">
                        <MultiSelect
                            opciones={[
                                { id: "-1", nombre: "Sin rodeo" },
                            ].concat(rodeos)}
                            bind:valores={rodeoseleccion}
                            etiqueta="Rodeos"
                            {filterUpdate}
                        />
                    </div>
                    <div class="my-0 py-0">
                        <label for="sexo" class="label mb-0">
                            <span class="label-text text-base">Sexo</span>
                        </label>
                        <label class="input-group">
                            <select
                                class={`
                                        select select-bordered w-full
                                        rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        
                                        ${estilos.bgdark2}
                                    `}
                                bind:value={sexobuscar}
                                onchange={filterUpdate}
                            >
                                <option value="" class="rounded">Todos</option>
                                {#each sexos as s}
                                    <option value={s.id} class="rounded"
                                        >{s.nombre}</option
                                    >
                                {/each}
                            </select>
                        </label>
                    </div>
                    <div class="mt-0">
                        <MultiSelect
                            opciones={[{ id: "-1", nombre: "Sin lote" }].concat(
                                lotes,
                            )}
                            bind:valores={loteseleccion}
                            etiqueta="Lotes"
                            {filterUpdate}
                        />
                    </div>
                    <div class="mt-1">
                        <MultiSelect
                            opciones={[
                                { id: "-1", nombre: "Sin categoria" },
                            ].concat(categorias)}
                            bind:valores={categoriaseleccion}
                            etiqueta="Categorias"
                            {filterUpdate}
                        />
                    </div>
                    <div>
                        <label for="estado" class="label">
                            <span class="label-text text-base">Estado</span>
                        </label>
                        <label class="input-group">
                            <select
                                class={`
                                        select select-bordered w-full
                                        rounded-md
                                        focus:outline-none focus:ring-2 
                                        focus:ring-green-500 
                                        focus:border-green-500
                                        ${estilos.bgdark2}
                                    `}
                                bind:value={estadobuscar}
                                onchange={filterUpdate}
                            >
                                {#each estados as s}
                                    <option value={s.id}
                                        >{s.id == -1
                                            ? "Todos"
                                            : s.nombre}</option
                                    >
                                {/each}
                            </select>
                        </label>
                    </div>
                    <div>
                        <label for="activos" class="label">
                            <span class="label-text text-base">Activos</span>
                        </label>
                        <label class="input-group">
                            <select
                                class={`
                                        select select-bordered w-full
                                        rounded-md
                                        focus:outline-none 
                                        focus:ring-2 
                                        focus:ring-green-500 focus:border-green-500
                                        ${estilos.bgdark2}
                                    `}
                                bind:value={activosbuscar}
                                onchange={filterUpdate}
                            >
                                {#each activos as a}
                                    <option value={a.id}>{a.nombre}</option>
                                {/each}
                            </select>
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <!--Ordenar-->
    <div
        class="block md:hidden w-11/12 m-1 mb-2 lg:mx-10 rounded-lg bg-transparent"
    >
        <button aria-label="Ordenar" class="w-full" onclick={clickOrdenar}>
            <div class="flex justify-between items-center px-1">
                <h1 class="font-semibold text-lg py-2">Ordenar</h1>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`size-6 transition-all duration-300 ${isOpenOrdenar ? "transform rotate-180" : ""}`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                >
                    <path
                        stroke-linecap="round"
                        stroke-linejoin="round"
                        stroke-width="2"
                        d="M19 9l-7 7-7-7"
                    />
                </svg>
            </div>
        </button>
        {#if isOpenOrdenar}
            <div transition:slide>
                <div class="my-0 py-0">
                    <label class="input-group">
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
                            onchange={() => ordenarAnimales(selectforma)}
                        >
                            <option value="caravana" class="rounded"
                                >Caravana</option
                            >
                            <option value="sexo" class="rounded">Sexo</option>
                            <option value="categoria" class="rounded"
                                >Categoria</option
                            >
                            <option value="lote" class="rounded">Lote</option>
                            <option value="rodeo" class="rounded">Rodeo</option>
                            <option value="estado" class="rounded"
                                >Estado</option
                            >
                        </select>
                    </label>
                </div>
                <div class="my-1">
                    <div class="form-control">
                        <label class="label cursor-pointer">
                            <span class="label-text">Ascendente</span>
                            <input
                                type="checkbox"
                                class="toggle"
                                bind:checked={ascendente}
                                onclick={() => ordenarAnimales(selectforma)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <div
        class="hidden w-full md:grid justify-items-center mx-1 lg:mx-10 lg:w-5/6 overflow-x-auto"
    >
        <table class="table table-lg w-full">
            <thead>
                <tr>
                    <th
                        onclick={() => ordenarAnimales("caravana")}
                        class={`
                            text-base p-3 border-b dark:border-gray-600 
                            hover:cursor-pointer hover:bg-gray-200 
                            dark:hover:bg-gray-800
                            
                        `}
                    >
                        <div class="flex flex-row justify-between">
                            Animal

                            {#if forma == "caravana"}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </th>

                    <th
                        onclick={() => ordenarAnimales("sexo")}
                        class={`
                            text-base p-3 border-b dark:border-gray-600 
                            hover:cursor-pointer hover:bg-gray-200 
                            dark:hover:bg-gray-800
                            
                        `}
                    >
                        <div class="flex flex-row justify-between">
                            Sexo
                            {#if forma == "sexo"}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </th>
                    <th
                        onclick={() => ordenarAnimales("categoria")}
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <div class="flex flex-row justify-between">
                            Categoria
                            {#if forma == "categoria"}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </th>
                    <th
                        onclick={() => ordenarAnimales("estado")}
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <div class="flex flex-row justify-between">
                            Estado
                            {#if forma == "estado"}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </th>
                    <th
                        onclick={() => ordenarAnimales("lote")}
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <div class="flex flex-row justify-between">
                            Lote
                            {#if forma == "lote"}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </th>
                    <th
                        onclick={() => ordenarAnimales("rodeo")}
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <div class="flex flex-row justify-between">
                            Rodeo
                            {#if forma == "rodeo"}
                                <svg
                                    xmlns="http://www.w3.org/2000/svg"
                                    class={`size-5 transition-all duration-300 ${!ascendente ? "transform rotate-180" : ""}`}
                                    fill="none"
                                    viewBox="0 0 24 24"
                                    stroke="currentColor"
                                >
                                    <path
                                        stroke-linecap="round"
                                        stroke-linejoin="round"
                                        stroke-width="2"
                                        d="M19 9l-7 7-7-7"
                                    />
                                </svg>
                            {/if}
                        </div>
                    </th>
                    <th
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <div class="flex flex-row justify-between">Edad</div>
                    </th>
                </tr>
            </thead>
            <tbody>
                {#each animalesrows as a}
                    <tr
                        class="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900"
                        onclick={() => goto(`${pre}/animales/${a.id}`)}
                    >
                        <td class="text-base p-3">
                            <div class="flex gap-1">
                                {`${shorterWord(a.caravana)}`}
                                {#if !a.active}
                                    <div
                                        class={`
                                    bg-transparent rounded-lg
                                    p-0 m-0  ${estilos.danger}
                                `}
                                    >
                                        <svg
                                            xmlns="http://www.w3.org/2000/svg"
                                            fill="none"
                                            viewBox="0 0 24 24"
                                            stroke-width="1.5"
                                            stroke="currentColor"
                                            class="size-6"
                                        >
                                            <path
                                                stroke-linecap="round"
                                                stroke-linejoin="round"
                                                d="M19.5 13.5 12 21m0 0-7.5-7.5M12 21V3"
                                            />
                                        </svg>
                                    </div>
                                {/if}
                            </div>
                        </td>
                        <td class="text-base p-3"> {a.sexo}</td>
                        <td class="text-base p-3"> {a.categoria}</td>
                        <td class="text-base p-3">
                            {#if a.sexo == "H"}
                                {getEstadoNombre(a.prenada)}
                            {:else}
                                -
                            {/if}
                        </td>
                        <td class="text-base p-3">
                            {a.expand
                                ? a.expand.lote
                                    ? a.expand.lote.nombre
                                    : ""
                                : ""}
                        </td>
                        <td class="text-base p-3">
                            {a.expand
                                ? a.expand.rodeo
                                    ? a.expand.rodeo.nombre
                                    : ""
                                : ""}
                        </td>
                        <td>
                            {a.fechanacimiento != ""
                                ? calcularEdad(a.fechanacimiento)
                                : "-"}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
    <div class="block md:hidden justify-items-center mx-1">
        {#each animalesrows as a}
            <div
                class="card w-full shadow-xl p-2 hover:bg-gray-200 dark:hover:bg-gray-900"
            >
                <button onclick={() => goto(`${pre}/animales/${a.id}`)}>
                    <div class="block p-4">
                        <div class="flex justify-between items-start mb-2">
                            <h3 class="font-medium">
                                {shorterWord(a.caravana)}
                            </h3>
                            {#if a.sexo == "H" && a.prenada != 1}
                                <div
                                    class={`badge badge-outline badge-${getEstadoColor(a.prenada)}`}
                                >
                                    {getEstadoNombre(a.prenada)}
                                </div>
                            {/if}
                        </div>
                        <div class="flex items-start">
                            <span>Edad:</span>
                            <span class="font-semibold">
                                {a.fechanacimiento != ""
                                    ? calcularEdad(a.fechanacimiento)
                                    : ""}
                            </span>
                        </div>

                        <div class="grid grid-cols-2 gap-y-2">
                            <div class="flex items-start">
                                <span class="font-semibold"
                                    >{getSexoNombre(a.sexo)}</span
                                >
                            </div>
                            <div class="flex items-start">
                                <span>Categoría:</span>
                                <span class="font-semibold">
                                    {a.categoria}
                                </span>
                            </div>
                            <div class="flex items-start">
                                <span>Lote:</span>
                                <span class="font-semibold">
                                    {a.expand
                                        ? a.expand.lote
                                            ? a.expand.lote.nombre
                                            : ""
                                        : ""}
                                </span>
                            </div>
                            <div class="flex items-start">
                                <span>Rodeo:</span>
                                <span class="font-semibold">
                                    {a.expand
                                        ? a.expand.rodeo
                                            ? a.expand.rodeo.nombre
                                            : ""
                                        : ""}
                                </span>
                            </div>
                        </div>
                    </div>
                </button>
            </div>
        {/each}
    </div>
</Navbarr>
