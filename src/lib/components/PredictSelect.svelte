<script>
    let {lista,etiqueta,valor=$bindable()} = $props()
    let cadena = $state("")
    let listarow = $state(lista)
    function cambioCadena(){
        if(cadena.length == 0){
            listarow = lista
        }
        listarow = lista.filter(e=>e.nombre.includes(cadena))
    }
</script>
<input class="input input-bordered" type="text" bind:value={cadena} onchange={cambioCadena}>
<label for="">{etiqueta}</label>
<select
    class="select select-bordered"
    bind:value={valor}
    >
    {#each listarow as elemento}
        <option value={elemento.id}>{elemento.nombre}</option>
    {/each}
</select>