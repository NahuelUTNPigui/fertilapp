<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import CardImportar from '$lib/components/importar/CardImportar.svelte';

    import ImportarServicios from '$lib/components/importar/ImportarServicios.svelte';   
    import ImportarAnimal from '$lib/components/importar/ImportarAnimal.svelte';
    import ImportarLotes from '$lib/components/importar/ImportarLotes.svelte';
    import ImportarNacimiento from '$lib/components/importar/ImportarNacimiento.svelte';
    import ImportarObservaciones from '$lib/components/importar/ImportarObservaciones.svelte';
    import ImportarPesajes from '$lib/components/importar/ImportarPesajes.svelte';
    import ImportarRodeos from '$lib/components/importar/ImportarRodeos.svelte';
    import ImportarTactos from '$lib/components/importar/ImportarTactos.svelte';
    import ImportarInseminaciones from '$lib/components/importar/ImportarInseminaciones.svelte';
    import PocketBase from 'pocketbase';
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let caber = createCaber()
    let cab = caber.cab
    let animales = $state([])
    let lotes = $state([])
    let rodeos = $state([])
    let nacimientos = $state([])
    let observaciones = $state([])
    let pesajes = $state([])
    let inseminaciones = $state([])
    let servicios = $state([])
    let tactos = $state([])
    let tratamientos = $state([])
    let animalesusuario = $state(0)
    let cargado = $state(false)
    let usuarioid = $state("")
    async function getCabData() {
        let res = await fetch(`${ruta}/api/creciente/fullcab/${cab.id}`)
        let data =  await res.json()
        animales = data.animales
        lotes = data.lotes
        rodeos = data.rodeos
        nacimientos = data.nacimientos
        observaciones = data.observaciones
        pesajes = data.pesajes
        inseminaciones = data.inseminaciones
        servicios = data.servicios
        tactos = data.tactos
    }
    async function getAnimalesUser() {
        let animals = await pb.collection('Animalesxuser').getList(1,1,{filter:`user='${usuarioid}'`})
        animalesusuario = animals.totalItems
    }
    onMount(async ()=>{
        let pb_json = await JSON.parse(localStorage.getItem('pocketbase_auth'))
        usuarioid = pb_json.record.id
        //const records = await pb.collection('Animalestacto').getFullList({
        //    filter: `active = true  && cab = '${cab.id}'`
        //})
        //animales = records
        await getCabData()
        await getAnimalesUser()
        cargado = true
    })

</script>
<Navbarr>
    {#if cargado}
    <CardImportar cardsize="max-w-2xl" titulo="Importar animales">
        <!--LOTES Y RODEOS-->
        <ImportarAnimal bind:animales bind:animalesusuario {getAnimalesUser} bind:lotes bind:rodeos/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar tactos">
        <ImportarTactos bind:animales bind:tactos/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar nacimientos">
        <!--LOTES Y RODEOS NACIMIENTOS-->
        <ImportarNacimiento bind:animales bind:animalesusuario {getAnimalesUser} bind:lotes bind:rodeos bind:nacimientos/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar rodeos">
        <!--RODEOS -->
        <ImportarRodeos bind:rodeos/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar lotes">
        <!--LOTES -->
        <ImportarLotes bind:lotes/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar observaciones">
        <!--OBSERVACIONES animales-->
        <ImportarObservaciones bind:animales bind:observaciones/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar servicios">
        <!--SERVICIOS animales-->
        <ImportarServicios bind:animales bind:servicios/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar inseminaciones">
        <!--INSEMINACIONES animales-->
        <ImportarInseminaciones bind:animales bind:inseminaciones/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar pesajes">
        <!--PESAJES animales-->
        <ImportarPesajes bind:animales bind:pesajes/>
    </CardImportar>
    {:else}
    <CardImportar cardsize="max-w-2xl" titulo="Cargando">
        <span class="loading loading-spinner loading-xl"></span>
    </CardImportar>
    {/if}
    
</Navbarr>