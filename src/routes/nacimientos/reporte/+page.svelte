<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Exportar from "$lib/components/Exportar.svelte";
    import PocketBase from "pocketbase";
    import { slide } from "svelte/transition";
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import sexos from "$lib/stores/sexos";
    import estilos from "$lib/stores/estilos";
    import { createCaber } from "$lib/stores/cab.svelte";
    import { guardarHistorial } from "$lib/historial/lib";
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    import { verificarNivel } from "$lib/permisosutil/lib";
    import AgregarAnimal from "$lib/components/eventos/AgregarAnimal.svelte";
    import { goto } from "$app/navigation";
    //Filtros
    import { createStorageProxy } from "$lib/filtros/filtros";
    import Limpiar from "$lib/filtros/Limpiar.svelte";
    //Permisos
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosList } from "$lib/permisosutil/lib";
    import RadioButton from "$lib/components/RadioButton.svelte";
    //filtros
    import MultiSelect from "$lib/components/MultiSelect.svelte";
    import { diasEntreFechas } from "$lib/stringutil/lib";
    let caber = createCaber();
    let cab = caber.cab;
    let ruta = import.meta.env.VITE_RUTA;
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];
    let pre = import.meta.env.VITE_PRE;
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);
    let usuarioid = $state("");
    //Datos filtrar
    let paricionesanimal = $state([]);
    let nacimientos = $state([]);
    let nacimientosrow = $state([]);
    let buscar = $state("");
    let fechadesde = $state("");
    let fechahasta = $state("");
    let rodeoseleccion = $state([]);
    let loteseleccion = $state([]);
    let isOpenFilter = $state(false);
    let buscarmadre = $state("");
    let buscarpadre = $state("");
    let cargadoanimales = $state(false);

    let defaultfiltro = {
        buscar: "",
        fechadesde: "",
        fechahasta: "",
        buscarmadre: "",
        buscarpadre: "",
        rodeoseleccion: [],
        loteseleccion: [],
    };
    let proxyfiltros = $state({
        ...defaultfiltro,
    });
    let proxy = createStorageProxy("reportenacimientos", defaultfiltro);
    //Datos nacimiento
    let agregaranimal = $state(false);
    let nacimiento = $state(null);
    let idnacimiento = $state("");
    let caravana = $state("");
    let sexo = $state("");
    let padre = $state("");
    let madre = $state("");
    let peso = $state("");
    let categoria = $state("");
    let nombremadre = $state("");
    let nombrepadre = $state("");
    let cadenamadre = $state("");
    let cadenapadre = $state("");
    let fecha = $state("");
    let madres = $state([]);
    let padres = $state([]);
    let listamadres = $state([]);
    let listapadres = $state([]);
    let idanimal = $state("");
    let observacion = $state("");
    let totalNacimientosEncontrados = $state(0);
    //Validacion
    let malmadre = $state(false);
    let malpadre = $state(false);
    let malfecha = $state(false);
    let malcaravana = $state(false);
    let malsexo = $state(false);
    let botonhabilitado = $state(false);
    function clickFilter() {
        isOpenFilter = !isOpenFilter;
    }
    function isEmpty(str) {
        return !str || str.length === 0;
    }
    async function getAnimales() {
        const recordsa = await pb.collection("animales").getFullList({
            filter: `active=true && cab='${cab.id}' && delete = false`,
            expand: "nacimiento",
        });
        madres = recordsa.filter((a) => a.sexo == "H" || a.sexo == "F");
        padres = recordsa.filter((a) => a.sexo == "M");
        cargadoanimales = true;
        listamadres = madres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
        listapadres = padres.map((item) => {
            return {
                id: item.id,
                nombre: item.caravana,
            };
        });
    }
    async function getNacimientos() {
        const recordsn = await pb.collection("nacimientosall").getFullList({
            filter: `cab='${cab.id}'`,
            sort: "-fecha",
            expand: "madre,padre",
        });
        nacimientos = recordsn;
        nacimientosrow = nacimientos;
    }
    function limpiarFiltros() {}
    function setFilters() {
        buscar = proxyfiltros.buscar;
        fechadesde = proxyfiltros.fechadesde;
        fechahasta = proxyfiltros.fechahasta;
        rodeoseleccion = proxyfiltros.rodeoseleccion;
        loteseleccion = proxyfiltros.loteseleccion;
        buscarmadre = proxyfiltros.buscarmadre;
        buscarpadre = proxyfiltros.buscarpadre;
    }
    function setProxyFilter() {
        proxyfiltros.buscar = buscar;
        proxyfiltros.fechadesde = fechadesde;
        proxyfiltros.fechahasta = fechahasta;
        proxyfiltros.buscarmadre = buscarmadre;
        proxyfiltros.buscarpadre = buscarpadre;
        proxyfiltros.rodeoseleccion = rodeoseleccion;
        proxyfiltros.loteseleccion = loteseleccion;
    }
    function procesarNacimientos() {
        paricionesanimal = [];
        let partosxvaca = {};
        for (let i = 0; i < nacimientosrow.length; i++) {
            let n = nacimientosrow[i];
            if (n.madre.length > 0) {
                if (!partosxvaca[n.madre]) {
                    partosxvaca[n.madre] = {
                        madre: n.madre,
                        caravana: n.expand.madre.caravana,
                        
                        partos: [],
                    };
                }
                partosxvaca[n.madre].partos.push(n);
            }
        }

        for (const [idVaca, vaca] of Object.entries(partosxvaca)) {
            let partos = vaca.partos;
            let dias = 0;
            if (partos.length > 0) {
                
                let fecha_parto = partos[0].fecha;

                for (let i = 1; i < partos.length; i++) {
                    let parto = partos[i]
                    let dias_entre_fechas =  diasEntreFechas(parto.fecha,fecha_parto)
                    if(isNaN(dias_entre_fechas)){
                        console.log
                        console.log(parto)
                        continue
                    }
                    console.log(dias_entre_fechas)

                    dias += dias_entre_fechas
                    fecha_parto = parto.fecha
                    
                }
                let ultimo_indice = 0
                if(partos.length>1){
                    let dias_entre_fechas =  diasEntreFechas(partos[0].fecha,partos[1].fecha)
                    if(!isNaN(dias_entre_fechas)){
                        ultimo_indice = dias_entre_fechas
                    }
                    
                }
                
                let promedio = dias / partos.length;
                paricionesanimal.push({
                    id: idVaca,
                    caravana: vaca.caravana,
                    promedio,
                    ultimo_indice,
                    partos: vaca.partos,
                });
            }
        }
        paricionesanimal.sort((a1, a2) =>
            a1.caravana.toLocaleLowerCase() < a2.caravana.toLocaleLowerCase()
                ? -1
                : 1,
        );
    }
    function filterUpdate() {
        nacimientosrow = nacimientos;
        setProxyFilter();
        proxy.save(proxyfiltros);
        totalNacimientosEncontrados = nacimientosrow.length;
        if (buscar != "") {
            nacimientosrow = nacimientosrow.filter((n) =>
                n.caravana
                    .toLocaleLowerCase()
                    .includes(buscar.toLocaleLowerCase()),
            );
            totalNacimientosEncontrados = nacimientosrow.length;
        }
        if (fechadesde != "") {
            nacimientosrow = nacimientosrow.filter(
                (t) => t.fecha >= fechadesde,
            );
            totalNacimientosEncontrados = nacimientosrow.length;
        }
        if (fechahasta != "") {
            nacimientosrow = nacimientosrow.filter(
                (t) => t.fecha <= fechahasta,
            );
            totalNacimientosEncontrados = nacimientosrow.length;
        }
        if (buscarmadre != "") {
            nacimientosrow = nacimientosrow.filter((t) =>
                t.nombremadre
                    .toLocaleLowerCase()
                    .includes(buscarmadre.toLocaleLowerCase()),
            );
            totalNacimientosEncontrados = nacimientosrow.length;
        }
        if (buscarpadre != "") {
            nacimientosrow = nacimientosrow.filter((t) =>
                t.nombrepadre
                    .toLocaleLowerCase()
                    .includes(buscarpadre.toLocaleLowerCase()),
            );
            totalNacimientosEncontrados = nacimientosrow.length;
        }
        //if (rodeoseleccion.length != 0) {
        //    if (rodeoseleccion.length == 1 && rodeoseleccion[0] == "-1") {
        //        animalesrows = animalesrows.filter((a) => !a.rodeo);
        //
        //    } else {
        //        animalesrows = animalesrows.filter((a) =>
        //            rodeoseleccion.includes(a.rodeo),
        //        );
        //
        //    }
        //}
        //if (loteseleccion.length != 0) {
        //    if (loteseleccion.length == 1 && loteseleccion[0] == "-1") {
        //        animalesrows = animalesrows.filter((a) => !a.lote);
        //
        //    } else {
        //        animalesrows = animalesrows.filter((a) =>
        //            loteseleccion.includes(a.lote),
        //        );
        //
        //    }
        //}
        procesarNacimientos();
    }
    
   
    onMount(async () => {
        proxyfiltros = proxy.load();
        setFilters();
        let pb_json = await JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        await getNacimientos();
        ordenarNacimientos(forma);
        filterUpdate();
        await getAnimales();
    });
    
    function cerrarModal() {
        idnacimiento = "";
        caravana = "";
        sexo = "";
        padre = "";
        madre = "";
        nombremadre = "";
        nombrepadre = "";
        fecha = "";
        observacion = "";
        peso = "";
        nuevoModal.close();
    }
    function getNombreMadre() {
        let m = madres.filter((item) => item.id == madre)[0];
        nombremadre = m.caravana;
        onchange("MADRE");
    }
    function getNombrePadre() {
        let p = padres.filter((item) => item.id == padre)[0];
        nombrepadre = p.caravana;
        onchange("PADRE");
    }
    function prepararData(item) {
        return {
            CARAVANA: item.caravana,
            FECHA: new Date(item.fecha).toLocaleDateString(),
            MADRE: item.nombremadre,
            PADRE: item.nombrepadre,
            OBSERVACION: item.observacion,
        };
    }
    //Para el collapse de los ordenar
    let isOpenOrdenar = $state(false);
    function clickOrdenar() {
        isOpenOrdenar = !isOpenOrdenar;
    }
    //Para los ordenar
    let ascendente = $state(true);
    let forma = $state("fecha");
    let selectforma = $state("fecha");
    //Ordenar nacimientos
    function ordenarNacimientosDescendente(p_forma) {
        let escalar = 1;
        if (!ascendente) {
            escalar = -1;
        }
        forma = p_forma;
        if (forma == "fecha") {
            nacimientosrow.sort(
                (a1, a2) => escalar * a1.fecha.localeCompare(a2.fecha),
            );
        } else if (forma == "caravana") {
            nacimientosrow.sort(
                (a1, a2) => escalar * a1.caravana.localeCompare(a2.caravana),
            );
        } else if (forma == "madre") {
            nacimientosrow.sort(
                (a1, a2) =>
                    escalar * a1.nombremadre.localeCompare(a2.nombremadre),
            );
        } else if (forma == "padre") {
            nacimientosrow.sort(
                (a1, a2) =>
                    escalar * a1.nombrepadre.localeCompare(a2.nombrepadre),
            );
        }
    }
    function ordenarNacimientos(p_forma) {
        if (p_forma == forma) {
            ascendente = !ascendente;
        } else {
            ascendente = true;
        }
        ordenarNacimientosDescendente(p_forma);
    }
</script>

<Navbarr>
    <div class="grid grid-cols-2 lg:grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div>
            <h1 class="text-2xl">Reporte nacimientos</h1>
        </div>
        <div class="flex col-span-2 gap-1 justify-start">
            <div>
                <Exportar
                    titulo={"Nacimientos"}
                    filtros={[]}
                    confiltros={false}
                    data={nacimientosrow}
                    sheetname={"Nacimientos"}
                    establecimiento={cab.nombre}
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
                    onclick={() => goto(pre + "/nacimientos")}
                >
                    <span class="text-lg font-semibold">Volver</span>
                </button>
            </div>
        </div>
    </div>
    <div
        class="grid grid-cols-1 lg:grid-cols-2 m-1 gap-2 lg:gap-10 mb-2 mt-1 mx-1 lg:mx-10 w-11/12"
    >
        <div class="w-11/12">
            <label
                class={`
                    input 
                    input-bordered 
                    flex 
                    items-center gap-2
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
            <Limpiar {limpiarFiltros} />
        </div>
    </div>
    <!--Filtrar-->
    <div class="w-11/12 m-1 mb-2 lg:mx-10 rounded-lg bg-transparent">
        <button aria-label="Filtrar" class="w-full" onclick={clickFilter}>
            <div class="flex justify-between items-center px-1">
                <h1 class="font-semibold text-lg py-2">Filtros</h1>
                <svg
                    xmlns="http://www.w3.org/2000/svg"
                    class={`h-5 w-5 transition-all duration-300 ${isOpenFilter ? "transform rotate-180" : ""}`}
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
                >Total de nacimientos encontrados: {totalNacimientosEncontrados}</span
            >
        </div>
        {#if isOpenFilter}
            <div transition:slide>
                <div class="grid grid-cols-1 lg:grid-cols-2 mb-2 lg:mb-3 gap-1">
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
                    <div class="">
                        <label for="nombremadre" class="label">
                            <span class="label-text text-base">Madre</span>
                        </label>
                        <label class="input-group md:w-1/2 md:flex">
                            <input
                                id="nombremadre"
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
                                bind:value={buscarmadre}
                                oninput={filterUpdate}
                            />
                        </label>
                    </div>
                    <div>
                        <label for="nombrepadre" class="label">
                            <span class="label-text text-base">Padre</span>
                        </label>
                        <label class="input-group md:w-1/2 md:flex">
                            <input
                                id="nombrepadre"
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
                                bind:value={buscarpadre}
                                oninput={filterUpdate}
                            />
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
                            onchange={() => ordenarNacimientos(selectforma)}
                        >
                            <option value="fecha" class="rounded">Fecha</option>
                            <option value="caravana" class="rounded"
                                >Caravana</option
                            >
                            <option value="madre" class="rounded">Madre</option>
                            <option value="padre" class="rounded">Padre</option>
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
                                onclick={() => ordenarNacimientos(selectforma)}
                            />
                        </label>
                    </div>
                </div>
            </div>
        {/if}
    </div>
    <div
        class="hidden w-full md:grid justify-items-center mx-1 lg:mx-10 lg:w-3/4 overflow-x-auto"
    >
        <table class="table table-lg w-full">
            <thead>
                <tr>
                    <th
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <div class="flex flex-row justify-between">Madre</div>
                    </th>
                    <th
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <div class="flex flex-row justify-between">
                            Ultimo IEP
                        </div>
                    </th>
                    <th
                        class="text-base p-3 border-b dark:border-gray-600 hover:cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-800"
                    >
                        <div class="flex flex-row justify-between">
                            IEP Promedio
                        </div>
                    </th>
                </tr>
            </thead>
            <tbody>
                {#each paricionesanimal as n}
                    <tr
                        class="cursor-pointer hover:bg-gray-200 dark:hover:bg-gray-900"
                    >
                        <td class="text-base mx-1 px-1">
                            {`${n.caravana}`}
                        </td>
                        <td class="text-base mx-1 px-1">
                            {`${n.ultimo_indice}`}
                        </td>
                        <td class="text-base mx-1 px-1">
                            {`${n.promedio}`}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    </div>
</Navbarr>
