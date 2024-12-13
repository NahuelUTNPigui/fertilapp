<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import CardImportar from '$lib/components/importar/CardImportar.svelte';
    import ImportarAnimal from '$lib/components/importar/ImportarAnimal.svelte';

    const fileTemplates= [
    {
        id: "animaldata",
        name: "Modelo animal",
        description: "Modelo para importar los animales",
        fileName: "animal-data-modelo",
        headers: [
            "Caravana",
            "Peso",
            "Sexo",
            "Rodeo"
        ],
        sampleData: [
            ["AAA", "0", "H/M", "Todos"],
        ],
    },
    {
        id: "nacimientodata",
        name: "Modelo nacimiento",
        description: "Modelo para importar los nacimientos",
        fileName: "nacimiento-data-modelo",
        headers: [
            "Caravana Hijo",
            "Caravana Padre",
            "Caravana Madre",
            "Fecha"
        ],
        sampleData: [
            ["AAA", "AAA", "AAA", "2014-10-11"],
        ],
    }];
</script>
<Navbarr>
    <CardImportar cardsize="max-w-2xl" titulo="Importar animales">
        <ImportarAnimal/>
    </CardImportar>
</Navbarr>