<script>
    import { browser } from "$app/environment";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from "pocketbase";
    import { onMount } from "svelte";
    import { page } from "$app/stores";
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    import Swal from "sweetalert2";
    import CardBase from "$lib/components/CardBase.svelte";
    import CardAnimal from "$lib/components/animal/CardAnimal.svelte";
    import DatosBasicos from "$lib/components/animal/DatosBasicos.svelte";
    import Pariciones from "$lib/components/animal/Pariciones.svelte";
    import Tactos from "$lib/components/animal/Tactos.svelte";
    import Historial from "$lib/components/animal/Historial.svelte";
    import { guardarHistorial } from "$lib/historial/lib";
    import Acciones from "$lib/components/animal/Acciones.svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    //PERMISOS
    import { createPer } from "$lib/stores/permisos.svelte";
    import { getPermisosMessage, getPermisosList } from "$lib/permisosutil/lib";
    import {
        getPermisosCabUser,
        getPermisosEstXColab,
    } from "$lib/permisosutil/lib";
    import Inseminaciones from "$lib/components/animal/Inseminaciones.svelte";
    import Tratamientos from "$lib/components/animal/Tratamientos.svelte";
    import Observaciones from "$lib/components/animal/Observaciones.svelte";
    import Pesajes from "$lib/components/animal/Pesajes.svelte";
    import HistoriaClinica from "$lib/components/animal/HistoriaClinica.svelte";
    import tiponoti from "$lib/stores/tiponoti";
    import Servicios from "$lib/components/animal/Servicios.svelte";
    import SelectTab from "$lib/components/animal/SelectTab.svelte";
    let esdev = import.meta.env.VITE_DEV == "si";
    let ruta = import.meta.env.VITE_RUTA;
    let pre = import.meta.env.VITE_PRE;
    const pb = new PocketBase(ruta);
    let caber = createCaber();
    let cab = caber.cab;
    let cargado = $state(false);
    let pestañas = $state([]);
    let tab = $state("");
    let per = createPer();
    let userpermisos = $state([]);

    // Datos
    let slug = $state("");
    let caravana = $state("");
    let usuarioid = $state("");
    let active = $state(true);
    let fechanacimiento = $state("");
    let sexo = $state("");
    let nacimiento = $state("");
    let rodeo = $state("");
    let lote = $state("");
    let peso = $state(0);
    let rp = $state("");
    let categoria = $state("");
    let pariciones = $state([]);
    let fechafall = $state("");
    let motivobaja = $state("");
    let connacimiento = $state(false);
    let nacimientoobj = $state({});
    let tactos = $state([]);
    let prenada = $state(0);
    let modohistoria = $state(false);

    async function getPariciones(id) {
        const recordpariciones = await pb
            .collection("nacimientos")
            .getFullList({
                filter: `madre='${id}' || padre='${id}'`,
                sort: "-created",
            });
        pariciones = recordpariciones;
    }
    async function getTactos(id) {
        const recordtactos = await pb.collection("tactos").getFullList({
            filter: `animal='${id}'`,
            sort: "-created",
        });

        tactos = recordtactos;
    }
    async function darBaja(fechafallecimiento, motivo) {
        if (!userpermisos[5]) {
            Swal.fire("Error permisos", getPermisosMessage(5), "error");
        }
        try {
            const data = {
                active: false,
                lote: "",
                rodeo: "",
                fechafallecimiento: fechafallecimiento + " 03:00:00",
                motivobaja: motivo,
            };
            await guardarHistorial(pb, slug);
            const record = await pb.collection("animales").update(slug, data);
            Swal.fire(
                "Éxito dar de baja",
                "Se pudo dar de baja al animal",
                "success",
            );
            goto(pre + "/animales");
        } catch (err) {
            Swal.fire(
                "Error dar de baja",
                "No se pudo dar de baja al animal",
                "error",
            );
        }
    }
    async function eliminar() {
        if (!userpermisos[5]) {
            Swal.fire("Error permisos", getPermisosMessage(5), "error");
        }

        try {
            const data = {
                delete: true,
                active: false,
                lote: "",
                rodeo: "",
            };

            const record = await pb.collection("animales").update(slug, data);
            Swal.fire(
                "Éxito eliminar",
                "Se pudo eliminar al animal",
                "success",
            );
            goto(pre + "/animales");
        } catch (err) {
            Swal.fire("Error eliminar", "No se eliminar al animal", "error");
        }
    }
    async function transferir(codigo) {
        if (!userpermisos[5]) {
            Swal.fire("Error permisos", getPermisosMessage(5), "error");
        }
        const resultcab = await pb.collection("cabs").getList(1, 1, {
            filter: `active = true && renspa = '${codigo}'`,
        });

        try {
            let data = {
                cab: resultcab.items[0].id,
                lote: "",
                rodeo: "",
            };

            const record = await pb.collection("animales").update(slug, data);

            let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));

            let origenusuarioid = pb_json.record.id;
            let datatrans = {
                texto: "Se transfirió a " + codigo,
                titulo: "Transferencia de 1 animal",
                tipo: tiponoti[1].id,
                origen: origenusuarioid,
                destino: resultcab.items[0].user,
                leido: false,
            };
            await pb.collection("notificaciones").create(datatrans);

            goto(pre + "/animales");
            Swal.fire(
                "Éxito transferencia",
                "Se pudo transferir al animal",
                "success",
            );
        } catch (err) {
            console.error(err);
            Swal.fire(
                "Error transferencia",
                "No se pudo transferir al animal",
                "error",
            );
        }
    }
    async function irPadre(_id) {
        //Revisar si esta en la cabaña
        //Lo idea seria poder ver los datos del animaal este donde este
        let recordxiste = await pb.collection("animales").getFullList({
            filter: `active=true && cab='${cab.id}' && id='${_id}'`,
            skipTotal: true,
        });
        if (recordxiste.length > 0) {
            goto(`${pre}/animales/${_id}`);
            //window.location.reload();
        } else {
            Swal.fire(
                "Error padre",
                "No existe el animal en esta cabaña",
                "error",
            );
        }
    }
    async function perfilAnimal(_id) {
        //slug = $page.params.slug;
        slug = _id;

        if (slug != "") {
            try {
                const recorda = await pb.collection("animales").getOne(slug, {
                    expand: "nacimiento",
                });
                caravana = recorda.caravana;
                active = recorda.active;
                fechanacimiento = recorda.fechanacimiento.split(" ")[0];

                nacimiento = "";
                nacimientoobj = {};
                if (recorda.nacimiento != "") {
                    nacimiento = recorda.nacimiento;
                    nacimientoobj = recorda.expand.nacimiento;
                }
                peso = recorda.peso;
                sexo = recorda.sexo;
                rodeo = recorda.rodeo;
                lote = recorda.lote;
                categoria = recorda.categoria;
                prenada = recorda.prenada == 1 ? 0 : recorda.prenada;
                rp = recorda.rp;
                if (recorda.fechafallecimiento != "") {
                    fechafall = recorda.fechafallecimiento.split(" ")[0];
                    motivobaja = recorda.motivobaja;
                }
                cargado = true;
                tab = "datos";
                if (sexo.toLowerCase() == "h") {
                    pestañas = [
                        { id: "datos", nombre: "Datos básicos" },
                        { id: "pesajes", nombre: "Pesajes" },
                        { id: "tratamientos", nombre: "Tratamientos" },
                        { id: "observaciones", nombre: "Observaciones" },
                        { id: "pariciones", nombre: "Pariciones" },
                        { id: "tactos", nombre: "Tactos" },
                        { id: "servicios", nombre: "Servicios" },
                        { id: "clinica", nombre: "Historia clínica" },
                        { id: "historial", nombre: "Historial" },
                    ];
                } else {
                    pestañas = [
                        { id: "datos", nombre: "Datos básicos" },
                        { id: "pesajes", nombre: "Pesajes" },
                        { id: "tratamientos", nombre: "Tratamientos" },
                        { id: "observaciones", nombre: "Observaciones" },
                        { id: "clinica", nombre: "Historia clínica" },
                        { id: "historial", nombre: "Historial" },
                    ];
                }
            } catch (err) {
                Swal.fire("Error animal", "No existe el animal", "error");
            }
        }
    }
    //Necesito una funcion que traiga toda la informacion del animal
    onMount(async () => {
        let _id = $page.params.slug;
        let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
        usuarioid = pb_json.record.id;
        await perfilAnimal(_id);
        
        let respermisos = await getPermisosCabUser(pb, usuarioid, cab.id);
        per.setPer(respermisos.permisos, usuarioid);
        
        userpermisos = getPermisosList(per.per.permisos);
    });
</script>

<Navbarr>
    {#if esdev}
        premisos {JSON.stringify(userpermisos, null, 2)}
    {/if}
    <div class="flex justify-center mt-1">
        <div class="w-full max-w-7xl px-4">
            <!-- Combo alineado al borde izquierdo de la card -->
            <SelectTab bind:pestañas bind:tab />
        </div>
    </div>

    {#if cargado}
        {#if tab == "datos"}
            <!--Datos animal-->
            <CardAnimal cardsize="max-w-7xl" titulo="Datos básicos">
                <DatosBasicos
                    {rp}
                    {peso}
                    {prenada}
                    {categoria}
                    {lote}
                    {rodeo}
                    {sexo}
                    {caravana}
                    connacimiento={nacimiento != ""}
                    nacimiento={nacimientoobj}
                    {fechanacimiento}
                    bind:modohistoria
                    bind:userpermisos
                    {irPadre}
                />
            </CardAnimal>
            <CardAnimal cardsize="max-w-7xl" titulo="Acciones">
                <Acciones
                    {caravana}
                    fechafallecimiento={fechafall}
                    bind:motivo={motivobaja}
                    bajar={async (fechafallecimiento, motivo) =>
                        await darBaja(fechafallecimiento, motivo)}
                    {eliminar}
                    transferir={async (codigo) => await transferir(codigo)}
                />
            </CardAnimal>
        {:else if tab == "pesajes"}
            <!--Pesajes-->
            <CardAnimal cardsize="max-w-7xl" titulo="Pesajes">
                <Pesajes
                    pesoanterior={peso}
                    bind:peso
                    {caravana}
                    bind:userpermisos
                ></Pesajes>
            </CardAnimal>
        {:else if tab == "tratamientos"}
            <!--Tipos y tratamientos-->
            <CardAnimal cardsize="max-w-7xl" titulo="Tratamientos">
                <Tratamientos cabid={cab.id} {categoria} bind:userpermisos
                ></Tratamientos>
            </CardAnimal>
        {:else if tab == "observaciones"}
            <!--Observaciones-->
            <CardAnimal cardsize="max-w-7xl" titulo="Observaciones">
                <Observaciones cabid={cab.id} {categoria} bind:userpermisos />
            </CardAnimal>
        {:else if tab == "pariciones"}
            <!--Animales nacimientos-->
            <CardAnimal cardsize="max-w-7xl" titulo="Pariciones">
                <Pariciones
                    cabid={cab.id}
                    sexoanimal={sexo}
                    bind:prenada
                    bind:userpermisos
                />
            </CardAnimal>
        {:else if tab == "tactos"}
            <!--Tactos-->
            <CardAnimal cardsize="max-w-7xl" titulo="Tactos">
                <Tactos
                    cabid={cab.id}
                    bind:prenadaori={prenada}
                    {categoria}
                    bind:userpermisos
                />
            </CardAnimal>
        {:else if tab == "servicios"}
            <!--Animales servicios-->
            <CardAnimal
                cardsize="max-w-7xl"
                titulo="Inseminaciones y Servicios"
            >
                <Servicios cabid={cab.id} {categoria} bind:userpermisos />
            </CardAnimal>
        {:else if tab == "clinica"}
            <!--Pesajes, tactos, servicios, tratamientos, observaciones,pariciones-->
            <CardAnimal cardsize="max-w-7xl" titulo="Historia clínica">
                <HistoriaClinica />
            </CardAnimal>
        {:else if tab == "historial"}
            <!--Historial del animal-->
            <CardAnimal cardsize="max-w-7xl" titulo="Historial">
                <Historial />
            </CardAnimal>
        {/if}
    {/if}
</Navbarr>
