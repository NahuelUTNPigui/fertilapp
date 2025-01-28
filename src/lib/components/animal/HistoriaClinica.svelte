<script>
    import { onMount } from "svelte";
    import { page } from '$app/stores';
    import estilos from "$lib/stores/estilos";
    import PocketBase from 'pocketbase'
    import tiposanimal from '$lib/stores/tiposanimal';
    import categorias from "$lib/stores/categorias";
    import estados from "$lib/stores/estados";
    import {capitalize} from "$lib/stringutil/lib"
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let id = $state("")
    let historial = $state([])
    let inseminaciones = $state([])
    let tactos = $state([])
    let tratamientos = $state([])
    let observaciones = $state([])
    let pariciones = $state([])
    let pesajes = $state([])
    let historialeventos = $state([])

    async function getHistorial(){
        historial = await pb.collection("historialanimales").getFullList({
            filter:`animal='${id}'`,
            sort:"-created",
        })
    }
    async function getInseminaciones() {
        inseminaciones = await pb.collection("inseminacion").getFullList({
            filter:`animal='${id}'`,
            sort:"-created"
        })
    }
    async function getObservaciones() {
        observaciones = await pb.collection("observaciones").getFullList({
            filter:`animal='${id}'`,
            sort:"-created"
        })
    }
    async function getPesajes() {
        pesajes = await pb.collection("pesaje").getFullList({
            filter:`animal='${id}'`,
            sort:"-created"
        })
    }
    async function getTratamientos() {
        tratamientos = await pb.collection("tratamientos").getFullList({
            filter:`animal='${id}'`,
            sort:"-created"
        })
    }
    async function getTactos() {
        tactos = await pb.collection("tactos").getFullList({
            filter:`animal='${id}'`,
            sort:"-created"
        })
    }
    async function getPariciones() {
        pariciones = await pb.collection("nacimientos").getFullList({
            filter:`madre='${id}'`,
            sort:"-created"
        })
    }

    function getHistorialEventos(inseminaciones, pariciones, tactos, tratamientos, observaciones, pesajes) {

        if (inseminaciones.length != 0) {
            historialeventos.push(inseminaciones)
        }
        if (pariciones.length != 0) {
            historialeventos.push(pariciones)
        }
        if (tactos.length != 0) {
            historialeventos.push(tactos)
        }
        if (tratamientos.length != 0) {
            historialeventos.push(tratamientos)
        }
        if (observaciones.length != 0) {
            historialeventos.push(observaciones)
        }
        if (pesajes.length != 0) {
            historialeventos.push(pesajes)
        }

        for (let i = 0; i < historialeventos.length; i++) {
            if (inseminaciones.includes(historialeventos[i])) {
                historialeventos[i].nombre = "Inseminación"
            }
            if (pariciones.includes(historialeventos[i])) {
                historialeventos[i].nombre = "Parición"
            }
            if (tactos.includes(historialeventos[i])) {
                historialeventos[i].nombre = "Tacto"
            }
            if (tratamientos.includes(historialeventos[i])) {
                historialeventos[i].nombre = "Tratamiento"
            }
            if (pesajes.includes(historialeventos[i])) {
                historialeventos[i].nombre = "Pesaje"
            }
            if (observaciones.includes(historialeventos[i])) {
                historialeventos[i].nombre = "Observación"
            }
        }
    }

    function getEstadoNombre(estado){
        let e = estados.filter(est=>est.id==estado)[0]
        return e.nombre
    }
    onMount(async ()=>{
        id = $page.params.slug
        await getHistorial()
        await getInseminaciones()
        await getTactos()
        await getTratamientos()
        await getObservaciones()
        await getPesajes()
        await getPariciones()
        getHistorialEventos(inseminaciones, pariciones, tactos, tratamientos, observaciones, pesajes)
        console.log(historialeventos)
    })
</script>

<div class="w-full flex justify-items-center mx-1 lg:w-3/4 overflow-x-auto">
    {#if historialeventos.length == 0}
        <p class="mt-5 text-lg">No se encontraron eventos asociados</p>
    {:else}
        <table class="table table-lg " >
            <thead>
                <tr>
                    <th class="text-base mx-1 px-1"  >Caravana</th>
                    <th class="text-base mx-1 px-1"  >Evento</th>
                </tr>
            </thead>
            <tbody>
                {#each historialeventos as h}
                    <tr>
                        <td class="text-base">
                            {h.caravana}
                        </td>
                        <td class="text-base">
                            {h.nombre}
                        </td>
                    </tr>
                {/each}
            </tbody>
        </table>
    {/if}
</div>