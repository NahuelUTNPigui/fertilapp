<script>
    import Navegacion from "$lib/components/Navegacion.svelte";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import NavegacionBottom from "$lib/components/NavegacionBottom.svelte";
    let lista = $state([])

</script>
<Navbarr>
{#each { length: 100 } as _,rank}
        <div>{rank}</div>
    {/each}
    <NavegacionBottom/>
</Navbarr>

    
    
