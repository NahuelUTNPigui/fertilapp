<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import { onMount } from 'svelte';
    import { goto }  from '$app/navigation';
    import { createCaber } from '$lib/stores/cab.svelte';
    import { createDarker } from "$lib/stores/dark.svelte";
    let nombreusuario = $state('')
    let darker = createDarker()

    let cab = $state({
        exist:false,
        nombre:"",
        id:""
    })
    
    onMount(async ()=>{
      let caber = createCaber()
      let pb_json = JSON.parse(localStorage.getItem('pocketbase_auth'))
      let usuarioid = pb_json.model.id
      nombreusuario = pb_json.model.username
      let light = !darker.dark
      cab = caber.cab      
    })
</script>
<Navbarr>
    <div>
        <span class="">Nombre de usuario: {nombreusuario}</span>
    </div>
    <div>
    </div>
</Navbarr>