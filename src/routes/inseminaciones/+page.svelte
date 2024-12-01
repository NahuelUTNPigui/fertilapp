<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createUserer } from '$lib/stores/user.svelte';
    import estilos from '$lib/stores/estilos';
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    let caber = createCaber()
    let userer = createUserer()
    let cab = caber.cab
    let usuarioid = userer.userid
    // Datos para mostrar
    let inseminaciones = []
    let inseminacionesrow = $state([])
    let buscar = $state("")
    let fechadesde = $state("")
    let fechahasta = $state("")

    //Datos inseminaciones
</script>
<Navbarr>
    inseminaciones
</Navbarr>