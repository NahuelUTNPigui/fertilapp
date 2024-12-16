<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    
    import CardImportar from '$lib/components/importar/CardImportar.svelte';
    import ImportarAnimal from '$lib/components/importar/ImportarAnimal.svelte';
    import ImportarNacimiento from '$lib/components/importar/ImportarNacimiento.svelte';
    
</script>
<Navbarr>
    <CardImportar cardsize="max-w-2xl" titulo="Importar animales">
        <ImportarAnimal/>
    </CardImportar>
    <CardImportar cardsize="max-w-2xl" titulo="Importar nacimientos">
        <ImportarNacimiento/>
    </CardImportar>
</Navbarr>