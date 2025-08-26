<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Swal from "sweetalert2";
    import PocketBase from "pocketbase";
    import { createRoler } from "$lib/stores/defaultrol.svelte";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import CardBase from "$lib/components/CardBase.svelte";
    import categorias from "$lib/stores/categorias";
    import sexos from "$lib/stores/sexos";
    import tipostacto from "$lib/stores/tipostacto";
    import tiposanimal from "$lib/stores/tiposanimal";
    import { guardarHistorial } from "$lib/historial/lib";
    import RadioButton from "$lib/components/RadioButton.svelte";
    import { isEmpty } from "$lib/stringutil/lib";
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    import estilos from "$lib/stores/estilos";
    import estados from "$lib/stores/estados";
    import StatCard from "$lib/components/StatCard.svelte";
    import AgregarAnimal from "$lib/components/eventos/AgregarAnimal.svelte";
    import cuentas from "$lib/stores/cuentas";
    import MultipleToros from "$lib/components/MultipleToros.svelte";
    import { verificarNivel } from "$lib/permisosutil/lib";
    import { addDays } from "$lib/stringutil/lib";

    import Estable from "$lib/svgs/estable.svelte";
    import Tacto from "$lib/svgs/tacto.svelte";
    import Nacimiento from "$lib/svgs/nacimiento.svelte";
    import Servicio from "$lib/svgs/servicio.svelte";
    import Tratamiento from "$lib/svgs/tratamiento.svelte";
    import Observacion from "$lib/svgs/observacion.svelte";
    //Permisos  (debo hacer la verificacion por backend)
    //Permisos
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import { createPer } from "$lib/stores/permisos.svelte";
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";

    //Formularios
    import InicioNacimiento from "$lib/components/inicio/Nacimiento.svelte";
    import InicioTacto from "$lib/components/inicio/Tacto.svelte";
    import InicioTratamiento from "$lib/components/inicio/Tratamiento.svelte";
    import InicioServicio from "$lib/components/inicio/Servicio.svelte";
    import InicioObservacion from "$lib/components/inicio/Observacion.svelte";
    import { dolar } from "$lib/stores/dolarprecio.svelte";
    import { getDolarPrice } from "$lib/stores/dolar";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    let esdev = import.meta.env.VITE_DEV == "si";
    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0];

    let usuarioid = $state("");
    let per = createPer();
    let permisos = $state([]);
    let cab = $state({
        exist: false,
        nombre: "",
        id: "",
    });
    let totaleventos = $state({
        animales: 0,
        tactos: 0,
        nacimientos: 0,
        rodeos: 0,
        lotes: 0,
        tratamientos: 0,
        inseminaciones: 0,
        observaciones: 0,
        pesajes: 0,
        servicios: 0,
    });
    let cargados = $state(false);
    let caber = createCaber();
    let animales = $state([]);
    let madres = $state([]);
    let padres = $state([]);
    let listaanimales = $state([]);
    let listamadres = $state([]);
    let listapadres = $state([]);
    let tipotratamientos = $state([]);
    let cargadoanimales = $state(false);
    //Datos cabaña
    let classbutton =
        "w-full flex items-center justify-center space-x-4 bg-green-600 hover:bg-green-700 text-white font-bold py-6 px-4 rounded-lg shadow-lg transition duration-300 ease-in-out transform hover:scale-105 focus:outline-none focus:ring-2 focus:ring-green-500 focus:ring-opacity-50 dark:bg-green-700 dark:hover:bg-green-600";
    //Tacto
    let tacto = $state({});
    let prenadatacto = $state(0);
    //Nacimiento
    let nacimiento = $state({});
    //Tratamiento
    let tratamiento = $state({});

    //Servicio

    let servicio = $state({});
    let inseminacion = $state({});
    let esServicio = $state(true);
    //Observacion
    let observacion = $state({});
    //Nuevo animal
    let agregaranimal = $state(false);
    let caravana = $state("");
    let peso = $state("");
    let sexo = $state("");
    let fechanacimiento = $state("");
    let categoria = $state("");

    function initNacimiento() {
        nacimiento = {
            //Nacimiento
            caravananac: "",
            sexonac: "",
            pesonac: "",
            fechanac: "",
            observacionnac: "",
            //Madre
            etiquetamadre: "Madre",
            madrenac: "",
            nombremadrenac: "",

            //Padre
            padrenac: "",
            nombrepadrenac: "",
            //Validacion
            malmadrenac: false,
            malpadrenac: false,
            malfechanac: false,
            malcaravananac: false,
            malsexonac: false,
            botonhabilitadonac: false,
        };
    }
    function initTacto() {
        tacto = {
            fechatacto: "",
            observaciontacto: "",
            animaltacto: "",
            cadenatacto: "",
            //Tipo animal
            categoriatacto: "",
            prenadatacto: 0,
            //tipo tacto
            tipotacto: "",
            //Validaciones
            malfechatacto: "",
            malanimaltacto: "",
            botonhabilitadotacto: false,
        };
        prenadatacto = 0;
    }
    function initTratamiento() {
        tratamiento = {
            animaltrat: "",
            cadenatrat: "",
            categoriatrat: "",
            fechatrat: "",
            tipotrat: "",
            observaciontrat: "",
            //Validaciones
            malanimaltrat: false,
            malcategoriatrat: false,
            malfechatrat: false,
            maltipotrat: false,
            botonhabilitadotrat: false,
        };
    }
    function initObservacion() {
        observacion = {
            animalobs: "",
            cadenaobs: "",
            categoriaobs: "",
            fechaobs: "",
            observacionobs: "",
            //Validaciones
            malanimalobs: false,
            malfechaobs: false,
            botonhabilitadoobs: false,
        };
    }
    function initServicio() {
        servicio = {
            idanimalser: "",
            categoriaser: "",
            padreser: "",
            padreserlista: [],
            fechapartoser: "",
            fechadesdeserv: "",
            fechahastaserv: "",
            madreser: "",
            observacionser: "",
            //validacion
            malanimalser: false,
            malfechadesdeser: false,
            malpadreser: false,
            botonhabilitadoser: false,
        };
        inseminacion = {
            padreins: "",
            pajuelains: "",
            idanimalins: "",
            cadenains: "",
            categoriains: "",
            fechainseminacion: "",
            fechapartoins: "",
            observacion: "",
            //Validaciones
            malanimalins: false,
            malpadreins: false,
            malfechainseminacion: false,
            malfechapartoins: false,
            botonhabilitadoins: false,
        };
    }
    async function getAnimales() {
        //Estaria joya que el animal venga con todos los chiches
        const recordsa = await pb.collection("animales").getFullList({
            filter: `active=true && cab='${cab.id}' && delete = false`,
            expand: "nacimiento",
        });
        animales = recordsa;
        animales.sort((a1, a2) => (a1.caravana > a2.caravana ? 1 : -1));
        totaleventos.animales = animales.length;

        cargadoanimales = true;
        madres = animales.filter((a) => a.sexo == "H" || a.sexo == "F");
        listamadres = madres.map((item) => {
            return { id: item.id, nombre: item.caravana };
        });
        padres = animales.filter((a) => a.sexo == "M");
        listapadres = padres.map((item) => {
            return { id: item.id, nombre: item.caravana };
        });
        listaanimales = animales.map((item) => {
            return { id: item.id, nombre: item.caravana };
        });
    }
    async function getTiposTratamientos() {
        const records = await pb.collection("tipotratamientos").getFullList({
            filter: `(cab='${cab.id}' || generico = true) && active = true`,
            sort: "-created",
        });
        tipotratamientos = records;
        tipotratamientos.sort((tp1, tp2) => (tp1.nombre > tp2.nombre ? 1 : -1));
    }
    function verficarPermisosColab(animal) {
        let listapermisos = getPermisosList(permisos.permisos);
        if (!listapermisos[4]) {
            Swal.fire("Error permisos", getPermisosMessage(4), "error");

            return false;
        }
        if (animal) {
            let listapermisos = getPermisosList(permisos.permisos);
            if (!listapermisos[5]) {
                Swal.fire("Error permisos", getPermisosMessage(5), "error");
                return false;
            }
        }
        return true;
    }
    function openNewModalTacto() {
        agregaranimal = false;
        caravana = "";
        sexo = "";
        peso = "";
        fechanacimiento = "";
        initTacto();

        nuevoModalTacto.showModal();
    }
    function openNewModalNacimiento() {
        agregaranimal = false;
        initNacimiento();
        nuevoModalNacimiento.showModal();
    }
    function openNewModalTratamiento() {
        agregaranimal = false;

        caravana = "";
        sexo = "";
        peso = "";
        fechanacimiento = "";
        initTratamiento();
        nuevoModalTratamiento.showModal();
    }
    function openNewModalServicio() {
        agregaranimal = false;
        caravana = "";
        sexo = "";
        peso = "";
        fechanacimiento = "";
        //Servicio
        esServicio = true;
        initServicio();

        nuevoModalServicio.showModal();
    }
    function openNewModalObservacion() {
        agregaranimal = false;
        caravana = "";
        sexo = "";
        peso = "";
        fechanacimiento = "";
        initObservacion();
        nuevoModalObservacion.showModal();
    }
    async function guardarAnimal(esTacto, esInseminacion) {
        //let verificar = await verificarNivel(cab.id)
        let verificar = true;
        if (!verificar) {
            Swal.fire(
                "Error guardar",
                `No tienes el nivel de la cuenta para tener más animales`,
                "error",
            );
            return { id: -1 };
        }
        let data = {
            caravana,
            active: true,
            categoria,
            delete: false,
            fechanacimiento: fechanacimiento + " 03:00:00",
            sexo: sexo,
            peso: peso,
            cab: cab.id,
        };

        if (esTacto) {
            data.prenada = prenadatacto;
        }
        if (esInseminacion) {
            data.prenada = 3;
        }
        let listapermisos = getPermisosList(permisos.permisos);
        if (!listapermisos[5]) {
            Swal.fire("Error permisos", getPermisosMessage(5), "error");
            return { id: -1 };
        }
        
        let recorda = await pb.collection("animales").create(data);
        totaleventos.animales += 1;
        return recorda;
    }
    async function guardarTacto() {
        if (agregaranimal) {
            if (caravana == "") {
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar el tacto porque el animal no tiene caravana",
                    "error",
                );
                return;
            }
            try {
                let listapermisos = getPermisosList(permisos.permisos);
                if (!listapermisos[4]) {
                    Swal.fire("Error permisos", getPermisosMessage(4), "error");

                    return false;
                }
                let a = await guardarAnimal(true, false);
                if (a.id == -1) {
                    return;
                }
                await getAnimales();
                let data = {
                    fecha: tacto.fechatacto + " 03:00:00",
                    observacion: tacto.observaciontacto,
                    animal: a.id,
                    categoria: tacto.categoriatacto,
                    prenada: prenadatacto,
                    tipo: tacto.tipotacto,
                    nombreveterinario: "",
                    cab: cab.id,
                    active: true,
                };

                const record = await pb.collection("tactos").create(data);

                //let recordtactos = await pb.collection('tactos').getList(1,1,{
                //    filter:`active=True && cab='${cab.id}'`
                //})
                totaleventos.tactos += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el tacto",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar el tacto",
                    "error",
                );
            }
        } else {
            try {
                let data = {
                    fecha: tacto.fechatacto + " 03:00:00",
                    observacion: tacto.observaciontacto,
                    animal: tacto.animaltacto,
                    categoria: tacto.categoriatacto,
                    prenada: prenadatacto,
                    tipo: tacto.tipotacto,
                    nombreveterinario: "",
                    cab: cab.id,
                    active: true,
                };
                let listapermisos = getPermisosList(permisos.permisos);
                if (!listapermisos[4]) {
                    Swal.fire("Error permisos", getPermisosMessage(4), "error");

                    return false;
                }
                const record = await pb.collection("tactos").create(data);
                //await guardarHistorial(pb, tacto.animaltacto);
                //await pb.collection("animales").update(tacto.animaltacto, {
                //    prenada: prenadatacto,
                //});
                //let recordtactos = await pb.collection("tactos").getList(1, 1, {
                //    filter: `active=True && cab='${cab.id}'`,
                //});
                totaleventos.tactos += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el tacto",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar el tacto",
                    "error",
                );
            }
        }
    }
    async function guardarNacimiento() {
        if (agregaranimal) {
            //let verificar = await verificarNivel(cab.id);
            let verificar = true;
            if (!verificar) {
                Swal.fire(
                    "Error guardar",
                    `No tienes el nivel de la cuenta para tener mas de ${nivel.animales} animales`,
                    "error",
                );
                return;
            }
        }

        try {
            let dataparicion = {
                madre: nacimiento.madrenac,
                padre: nacimiento.padrenac,
                fecha: nacimiento.fechanac + " 03:00:00",
                nombremadre: nacimiento.nombremadrenac,
                nombrepadre: nacimiento.nombrepadrenac,
                observacion: nacimiento.observacionnac,
                cab: cab.id,
            };
            let listapermisos = getPermisosList(permisos.permisos);
            if (!listapermisos[4]) {
                Swal.fire("Error permisos", getPermisosMessage(4), "error");

                return false;
            }
            const recordparicion = await pb
                .collection("nacimientos")
                .create(dataparicion);
            
            if (agregaranimal) {
                
                if (!listapermisos[5]) {
                    Swal.fire("Error permisos", getPermisosMessage(4), "error");

                    return false;
                }
                //Laburar esta parte
                let a = await guardarAnimal(true, false);
                
                await getAnimales();
                await pb
                    .collection("animales")
                    .update(a.id, { nacimiento: recordparicion.id });
            }
            //let recordnacimientos = await pb
            //    .collection("nacimientos")
            //    .getList(1, 1, {
            //        filter: `cab='${cab.id}'`,
            //    });
            totaleventos.nacimientos += 1;
            Swal.fire(
                "Éxito guardar",
                "Se pudo guardar la paricion con exito",
                "success",
            );
            nuevoModalNacimiento.close();
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error guardar",
                "Hubo un error al guardar el animal",
                "error",
            );
            nuevoModalNacimiento.close();
        }
    }
    async function guardarTrat() {
        if (agregaranimal) {
            if (caravana == "") {
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar el tacto porque el animal no tiene caravana",
                    "error",
                );
                return;
            }
            try {
                let listapermisos = getPermisosList(permisos.permisos);
                if (!listapermisos[4]) {
                    Swal.fire("Error permisos", getPermisosMessage(4), "error");

                    return false;
                }
                let a = await guardarAnimal(false, false);
                if (a.id == -1) {
                    return;
                }
                let data = {
                    animal: a.id,
                    categoria: a.categoria,
                    tipo: tratamiento.tipotrat,
                    fecha: tratamiento.fechatrat + " 03:00:00",
                    active: true,
                    observacion: tratamiento.observaciontrat,
                    cab: cab.id,
                };

                const record = await pb.collection("tratamientos").create(data);
                await getAnimales();
                let recordtratamientos = await pb
                    .collection("tratamientos")
                    .getList(1, 1, {
                        filter: `active=True && cab='${cab.id}'`,
                    });
                totaleventos.tratamientos += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el tratamiento con exito",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "Hubo un error para guardar el tratamiento",
                    "error",
                );
            }
        } else {
            try {
                let listapermisos = getPermisosList(permisos.permisos);
                if (!listapermisos[4]) {
                    Swal.fire("Error permisos", getPermisosMessage(4), "error");

                    return false;
                }
                let data = {
                    animal: tratamiento.animaltrat,
                    categoria: tratamiento.categoriatrat,
                    tipo: tratamiento.tipotrat,
                    fecha: tratamiento.fechatrat + " 03:00:00",
                    active: true,
                    observacion: tratamiento.observaciontrat,
                    cab: cab.id,
                };
                const record = await pb.collection("tratamientos").create(data);
                let recordtratamientos = await pb
                    .collection("tratamientos")
                    .getList(1, 1, {
                        filter: `active=True && cab='${cab.id}'`,
                    });
                totaleventos.tratamientos += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el tratamiento con exito",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "Hubo un error para guardar el tratamiento",
                    "error",
                );
            }
        }
    }
    async function guardarInseminacion() {
        if (agregaranimal) {
            if (caravana == "") {
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar el tacto porque el animal no tiene caravana",
                    "error",
                );
                return;
            }
            let listapermisos = getPermisosList(permisos.permisos);
            if (!listapermisos[4]) {
                Swal.fire("Error permisos", getPermisosMessage(4), "error");

                return false;
            }
            let a = await guardarAnimal(false, true);
            if (a.id == -1) {
                return;
            }
            let data = {
                cab: cab.id,
                animal: a.id,
                fechaparto: inseminacion.fechapartoins + " 03:00:00",
                fechainseminacion: inseminacion.fechainseminacion + " 03:00:00",
                active: true,
                padre: inseminacion.padreins,
                pajuela: inseminacion.pajuelains,
                categoria: a.categoria,
            };
            try {
                const record = await pb.collection("inseminacion").create(data);
                await getAnimales();
                let recordinseminaciones = await pb
                    .collection("inseminacion")
                    .getList(1, 1, {
                        filter: `active=True && cab='${cab.id}'`,
                    });
                totaleventos.inseminaciones += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar la inseminación con exito",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "Hubo un error para guardar la inseminación",
                    "error",
                );
            }
        } else {
            let listapermisos = getPermisosList(permisos.permisos);
            if (!listapermisos[4]) {
                Swal.fire("Error permisos", getPermisosMessage(4), "error");

                return false;
            }
            let data = {
                cab: cab.id,
                animal: inseminacion.idanimalins,
                fechaparto: inseminacion.fechapartoins + " 03:00:00",
                fechainseminacion: inseminacion.fechainseminacion + " 03:00:00",
                active: true,
                padre: inseminacion.padreins,
                pajuela: inseminacion.pajuelains,
                categoria: inseminacion.categoriains,
                observacion: inseminacion.observacion,
            };
            try {
                const record = await pb.collection("inseminacion").create(data);
                //revisar las fechas
                await guardarHistorial(pb, inseminacion.idanimalins);
                await pb
                    .collection("animales")
                    .update(inseminacion.idanimalins, {
                        prenada: 3,
                    });
                let recordinseminaciones = await pb
                    .collection("inseminacion")
                    .getList(1, 1, {
                        filter: `active=True && cab='${cab.id}'`,
                    });
                totaleventos.inseminaciones += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar la inseminación con exito",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "Hubo un error para guardar la inseminación",
                    "error",
                );
            }
        }
    }
    async function guardarServicio() {
        if (agregaranimal) {
            if (caravana == "") {
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar el tacto porque el animal no tiene caravana",
                    "error",
                );
                return;
            }
            let listapermisos = getPermisosList(permisos.permisos);
            if (!listapermisos[4]) {
                Swal.fire("Error permisos", getPermisosMessage(4), "error");

                return false;
            }
            let a = await guardarAnimal(false, true);
            if (a.id == -1) {
                return;
            }
            let dataser = {
                fechadesde: servicio.fechadesdeserv + " 03:00:00",
                fechaparto: servicio.fechapartoser + " 03:00:00",
                observacion: servicio.observacionser,
                madre: a.id,
                padres: servicio.padreserlista.join(),
                active: true,
                cab: cab.id,
            };
            if (servicio.fechahastaserv != "") {
                dataser.fechahasta = servicio.fechahastaserv + " 03:00:00";
            }
            try {
                await pb.collection("servicios").create(dataser);

                await getAnimales();
                let recordservicios = await pb
                    .collection("servicios")
                    .getList(1, 1, {
                        filter: `cab='${cab.id}'`,
                    });
                totaleventos.servicios += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el servicio con éxito",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "Hubo un error para guardar el servicio",
                    "error",
                );
            }
        } else {
            let listapermisos = getPermisosList(permisos.permisos);
            if (!listapermisos[4]) {
                Swal.fire("Error permisos", getPermisosMessage(4), "error");

                return false;
            }
            let dataser = {
                fechadesde: servicio.fechadesdeserv + " 03:00:00",
                fechaparto: servicio.fechapartoser + " 03:00:00",
                observacion: servicio.observacionser,
                madre: servicio.idanimalser,
                padres: servicio.padreserlista.join(),
                active: true,
                cab: cab.id,
            };
            if (servicio.fechahastaserv != "") {
                dataser.fechahasta = servicio.fechahastaserv + " 03:00:00";
            }
            try {
                await pb.collection("servicios").create(dataser);
                // Revisar las fechas
                await pb.collection("animales").update(servicio.idanimalser, {
                    prenada: 3,
                });
                await guardarHistorial(pb, servicio.idanimalser);
                let recordservicios = await pb
                    .collection("servicios")
                    .getList(1, 1, {
                        filter: `cab='${cab.id}'`,
                    });
                totaleventos.servicios += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar el servicio con éxito",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "Hubo un error para guardar el servicio",
                    "error",
                );
            }
        }
    }
    async function guardarObservacion() {
        if (agregaranimal) {
            try {
                let listapermisos = getPermisosList(permisos.permisos);
                if (!listapermisos[4]) {
                    Swal.fire("Error permisos", getPermisosMessage(4), "error");

                    return false;
                }
                let a = await guardarAnimal(false, false);
                if (a.id == -1) {
                    return;
                }
                let data = {
                    animal: a.id,
                    categoria: a.categoria,
                    fecha: observacion.fechaobs + " 03:00:00",
                    cab: cab.id,
                    observacion: observacion.observacionobs,
                    active: true,
                };
                const record = await pb
                    .collection("observaciones")
                    .create(data);
                let recordobservaciones = await pb
                    .collection("observaciones")
                    .getList(1, 1, {
                        filter: `active=True && cab='${cab.id}'`,
                    });
                totaleventos.observaciones += 1;
                await getAnimales();
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar la observación",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar la observación",
                    "error",
                );
            }
        } else {
            try {
                let listapermisos = getPermisosList(permisos.permisos);
                if (!listapermisos[4]) {
                    Swal.fire("Error permisos", getPermisosMessage(4), "error");

                    return false;
                }
                let data = {
                    animal: observacion.animalobs,
                    fecha: observacion.fechaobs + " 03:00:00",
                    categoria: observacion.categoriaobs,
                    cab: cab.id,
                    observacion: observacion.observacionobs,
                    active: true,
                };
                const record = await pb
                    .collection("observaciones")
                    .create(data);
                let recordobservaciones = await pb
                    .collection("observaciones")
                    .getList(1, 1, {
                        filter: `active=True && cab='${cab.id}'`,
                    });
                totaleventos.observaciones += 1;
                Swal.fire(
                    "Éxito guardar",
                    "Se pudo guardar la observación",
                    "success",
                );
            } catch (err) {
                console.error(err);
                Swal.fire(
                    "Error guardar",
                    "No se pudo guardar la observación",
                    "error",
                );
            }
        }
    }
    async function getTotales() {
        let recordtactos = await pb.collection("tactos").getList(1, 1, {
            filter: `active=True && cab='${cab.id}'`,
        });
        let recordnacimientos = await pb
            .collection("nacimientos")
            .getList(1, 1, {
                filter: `cab='${cab.id}'`,
            });
        let recordtratamientos = await pb
            .collection("tratamientos")
            .getList(1, 1, {
                filter: `active=True && cab='${cab.id}'`,
            });
        let recordinseminaciones = await pb
            .collection("inseminacion")
            .getList(1, 1, {
                filter: `active=True && cab='${cab.id}'`,
            });
        let recordobservaciones = await pb
            .collection("observaciones")
            .getList(1, 1, {
                filter: `active=True && cab='${cab.id}'`,
            });
        let recordpesajes = await pb.collection("pesaje").getList(1, 1, {
            expand: "animal",
            filter: `animal.cab='${cab.id}'`,
        });
        let recordservicios = await pb.collection("servicios").getList(1, 1, {
            filter: `cab='${cab.id}'`,
        });
        const recordslotes = await pb.collection("lotes").getList(1, 1, {
            filter: `active=True && cab='${cab.id}'`,
        });

        const recordsrodeos = await pb.collection("rodeos").getList(1, 1, {
            filter: `active=True && cab='${cab.id}'`,
        });
        totaleventos.tactos = recordtactos.totalItems;
        totaleventos.inseminaciones = recordinseminaciones.totalItems;
        totaleventos.nacimientos = recordnacimientos.totalItems;
        totaleventos.tratamientos = recordtratamientos.totalItems;
        totaleventos.observaciones = recordobservaciones.totalItems;
        totaleventos.pesajes = recordpesajes.totalItems;
        totaleventos.servicios = recordservicios.totalItems;
        totaleventos.lotes = recordslotes.totalItems;
        totaleventos.rodeos = recordsrodeos.totalItems;
    }
    onMount(async () => {
        try {
            dolar.updateDolar();
        } catch (err) {
            console.error("Error con el dolar");
        }

        cab = caber.cab;

        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));

        usuarioid = pb_json.record.id;
        if (cab.exist) {
            let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);

            per.setPer(respermisos.permisos, usuarioid);
            permisos = per.per;
            initNacimiento();
            initTacto();
            initTratamiento();
            initObservacion();
            initServicio();
            await getAnimales();
            await getTiposTratamientos();
            await getTotales();
            cargados = true;
        }
    });
</script>

<Navbarr>
    <div class="flex items-center justify-center">
        <h2 class="text-xl font-bold">
            ¡Proximamente Lanzamiento de Preventas!
        </h2>
    </div>
    {#if esdev}
        premisos {JSON.stringify(permisos, null, 2)}
    {/if}
    {#if cab.exist}
        <CardBase titulo="Bienvenido a Creciente Fértil" cardsize="max-w-5xl">
            <div
                class="mx-1 my-2 lg:mx-10 grid grid-cols-2 lg:grid-cols-3 gap-1"
            >
                <StatCard
                    urlto={"/animales"}
                    titsize={"text-md"}
                    titulo="Animales"
                    valor={totaleventos.animales}
                />
                <StatCard
                    urlto={"/lotes"}
                    titsize={"text-md"}
                    titulo="Lotes"
                    valor={totaleventos.lotes}
                />
                <StatCard
                    urlto={"/rodeos"}
                    titsize={"text-md"}
                    titulo="Rodeos"
                    valor={totaleventos.rodeos}
                />
                <StatCard
                    urlto={"/servicios"}
                    titsize={"text-md"}
                    titulo="Inseminaciones"
                    valor={totaleventos.inseminaciones}
                />
                <StatCard
                    urlto={"/servicios"}
                    titsize={"text-md"}
                    titulo="Servicios"
                    valor={totaleventos.servicios}
                />
                <StatCard
                    urlto={"/nacimientos"}
                    titsize={"text-md"}
                    titulo="Nacimientos"
                    valor={totaleventos.nacimientos}
                />
                <StatCard
                    urlto={"/tratamientos"}
                    titsize={"text-md"}
                    titulo="Tratamientos"
                    valor={totaleventos.tratamientos}
                />
                <StatCard
                    urlto={"/observaciones"}
                    titsize={"text-md"}
                    titulo="Observaciones"
                    valor={totaleventos.observaciones}
                />
                <StatCard
                    urlto={"/pesajes"}
                    titsize={"text-md"}
                    titulo="Pesajes"
                    valor={totaleventos.pesajes}
                />
                <StatCard
                    urlto={"/tactos/cab"}
                    titsize={"text-md"}
                    titulo="Tactos"
                    valor={totaleventos.tactos}
                />
            </div>
            <h2
                class="text-xl font-bold text-green-700 dark:text-green-400 mb-6 text-start"
            >
                Acciones rapidas
            </h2>
            <div class="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                    <a class={classbutton} href={pre + "/establecimiento"}>
                        <Estable></Estable>
                        Ir a establecimiento
                    </a>
                </div>
                <div>
                    <button class={classbutton} onclick={openNewModalTacto}>
                        <Tacto></Tacto>
                        Nuevo tacto
                    </button>
                </div>
                <div>
                    <button
                        class={classbutton}
                        onclick={openNewModalNacimiento}
                    >
                        <Nacimiento></Nacimiento>
                        Nueva parición
                    </button>
                </div>
                <div>
                    <button
                        class={classbutton}
                        onclick={openNewModalTratamiento}
                    >
                        <Tratamiento></Tratamiento>

                        Nuevo tratamiento
                    </button>
                </div>
                <div>
                    <button class={classbutton} onclick={openNewModalServicio}>
                        <Servicio></Servicio>
                        Nuevo servicio
                    </button>
                </div>
                <div>
                    <button
                        class={classbutton}
                        onclick={openNewModalObservacion}
                    >
                        <Observacion></Observacion>
                        Nueva observacion
                    </button>
                </div>
            </div>
        </CardBase>
    {:else}
        <CardBase titulo="Bienvenido a Creciente Fértil">
            <div class="grid grid-cols-1 gap-6">
                <a class={classbutton} href={pre + "/establecimiento"}>
                    <Estable></Estable>
                    Crear establecimiento
                </a>
            </div>
        </CardBase>
    {/if}
</Navbarr>
<dialog
    id="nuevoModalTacto"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box w-11/12 max-w-xl
            bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-lg font-bold">Nuevo tacto</h3>

        <InicioTacto
            bind:caravana
            bind:peso
            bind:sexo
            bind:fechanacimiento
            bind:categoria
            bind:agregaranimal
            bind:tacto
            bind:prenadatacto
            bind:madres
            bind:cargadoanimales
            {guardarTacto}
        ></InicioTacto>
    </div>
</dialog>
<dialog
    id="nuevoModalNacimiento"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box w-11/12 max-w-xl
            bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-lg font-bold">Nueva parición</h3>

        <InicioNacimiento
        bind:caravana
            bind:peso
            bind:sexo
            bind:fechanacimiento
            bind:categoria
            bind:agregaranimal
            bind:listamadres
            bind:listapadres
            bind:animales
            bind:nacimiento
            bind:cargadoanimales
            {guardarNacimiento}
        />
    </div>
</dialog>
<dialog
    id="nuevoModalTratamiento"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box w-11/12 max-w-3xl
            bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>

        <h3 class="text-lg font-bold">Nuevo tratamiento</h3>
        <InicioTratamiento
        bind:caravana
            bind:peso
            bind:sexo
            bind:fechanacimiento
            bind:categoria
            bind:tipotratamientos
            bind:animales
            bind:tratamiento
            bind:cargadoanimales
            bind:agregaranimal
            {guardarTrat}
        ></InicioTratamiento>
    </div>
</dialog>
<dialog
    id="nuevoModalObservacion"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box w-11/12 max-w-xl
            bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-lg font-bold">Nueva observación</h3>
        <InicioObservacion
            bind:agregaranimal
            bind:caravana
            bind:categoria
            bind:sexo
            bind:peso
            bind:fechanacimiento
            bind:animales
            bind:cargadoanimales
            bind:observacion
            {guardarObservacion}
        ></InicioObservacion>
    </div>
</dialog>
<dialog
    id="nuevoModalServicio"
    class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle"
>
    <div
        class="
            modal-box w-11/12 max-w-xl
            bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
        "
    >
        <form method="dialog">
            <button
                class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl"
                >✕</button
            >
        </form>
        <h3 class="text-lg font-bold">
            {esServicio ? "Nuevo servicio" : "Nueva inseminación"}
        </h3>
        <InicioServicio
            bind:agregaranimal
            bind:caravana
            bind:categoria
            bind:sexo
            bind:peso
            bind:fechanacimiento
            bind:esServicio
            bind:madres
            bind:padres
            bind:animales
            bind:servicio
            bind:inseminacion
            bind:cargadoanimales
            bind:listapadres
            {guardarInseminacion}
            {guardarServicio}
        ></InicioServicio>
    </div>
</dialog>
