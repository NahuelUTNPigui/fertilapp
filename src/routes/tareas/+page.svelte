<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createUserer } from '$lib/stores/user.svelte';
    import estilos from '$lib/stores/estilos';
</script>
<Navbarr>
    tareas
</Navbarr>