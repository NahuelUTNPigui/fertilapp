<script>
    import { goto } from "$app/navigation";
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase'
    import Swal from 'sweetalert2';
    import { onMount } from 'svelte';
    import { slide } from 'svelte/transition';
    import estilos from '$lib/stores/estilos';
    import estados from "$lib/stores/estados";
    import { createCaber } from '$lib/stores/cab.svelte';
    import categorias from "$lib/stores/categorias";
    import sexos from "$lib/stores/sexos";
    import {capitalize} from "$lib/stringutil/lib"
    import {guardarHistorial} from "$lib/historial/lib"
    import PredictSelect from "$lib/components/PredictSelect.svelte";
    //lista testear
    let valor = $state("")
    let lista = [
        {id:1,nombre:"a"},
        {id:2,nombre:"b"},
        {id:3,nombre:"d"},
        {id:4,nombre:"c"},
    ]
    let etiqueta = $state("Test")
    //fin test

    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    const HOY = new Date().toISOString().split("T")[0]
    const today = new Date();
    const DESDE = new Date(today.getFullYear(), today.getMonth() - 1, 1);    
    const HASTA = new Date(today.getFullYear(), today.getMonth() + 1, 0);

    let caber = createCaber()
    let cab = caber.cab
    //Datos animales
    let animales = $state([])
    let animalesrows = $state([])
    //Filtros
    let buscar = $state("")
    let lote = $state("")
    let rodeo = $state("")
    let categoria = $state("")
    let sexo = $state("H")

    let lotes = $state([])
    let rodeos = $state([])
    let isOpenFilter = $state(false)

    //Seleccionados
    let selectanimales = $state([])
    let selecthashmap = $state({})
    let todos = $state(false)
    let algunos = $state(false)
    let ninguno = $state(true)

    //Datos inseminacion
    let fechainseminacion = $state("")
    let fechaparto = $state("")

    //validacion
    let malfecha = $state(false)
    let botonhabilitado = $state(false)

    function clickFilter(){
        isOpenFilter = !isOpenFilter
    }

    function filterUpdate(){
        selectanimales = []
        let lista = []
        for (const [key, value ] of Object.entries(selecthashmap)) {
            lista.push(key)
        }
        for(let i = 0;i<lista.length;i++){
            selecthashmap[lista[i]] = null
        }
        algunos = false
        todos = false
        ninguno = true
        animalesrows = animales
        if(buscar != ""){
            animalesrows = animalesrows.filter(a=>a.caravana.toLocaleLowerCase().includes(buscar.toLocaleLowerCase()))
        }
        if(sexo != ""){
            animalesrows = animalesrows.filter(a=>a.sexo == sexo)
        }
        if(rodeo != ""){
            animalesrows = animalesrows.filter(a=>a.rodeo == rodeo)
        }
        if(lote != ""){
            animalesrows = animalesrows.filter(a=>a.lote == lote)
        }
        if(categoria != ""){
            animalesrows = animalesrows.filter(a=>a.categoria == categoria)
        }

    }
    function ordenarNombre(lista){
        lista.sort((r1,r2)=>r1.nombre.toLocaleLowerCase()>r2.nombre.toLocaleLowerCase()?1:-1)
    }

    function clickAnimal(id){
        if(selecthashmap[id]){
            if(todos){
                todos = false
                algunos = true
            }
            selecthashmap[id] = null
        }
        else{
            if(ninguno){
                algunos = true
                ninguno =  false
            }
            let a = animalesrows.filter(an=>an.id==id)[0]
            selecthashmap[id] = {
                ...a
            }
        }
    }
    function clickTodos(){
        if(todos){
            todos = false
            ninguno = true
            algunos = false
            selecthashmap = {}
        }
        else if(ninguno){
            ninguno = false
            todos = true
            for(let i = 0;i<animalesrows.length;i++){
                let a = animalesrows[i]
                selecthashmap[animalesrows[i].id] = {
                    ...a
                }
            }
        }
        else if (algunos){
            selecthashmap = {}
            algunos = false
            todos = false
            ninguno = true
        }
        
    }
    async function getLotes(){
        const records = await pb.collection('lotes').getFullList({
            filter:`active = true && cab ~ '${cab.id}'`,
            sort: 'nombre',
        });
        lotes = records
        ordenarNombre(lotes)
    }
    async function getRodeos(){
        const records = await pb.collection('rodeos').getFullList({
            filter:`active = true && cab ~ '${cab.id}'`,
            sort: 'nombre',
        });
        rodeos = records
        //ordenarNombre(rodeos)
    }
    async function getAnimales(){
        const recordsa = await pb.collection("animales").getFullList({
            filter:`active=true && delete=false && cab='${cab.id}'`,
            expand:"rodeo,lote"
        })
        
        animales = recordsa
        animales.sort((a1,a2)=>a1.caravana>a2.caravana?1:-1)
        animalesrows = animales
    }
    function openNewModal(){
        tipotactoselect = "tacto"
        if(ninguno){
            Swal.fire("Error tacto","No hay animales seleccionados","error")
            return
        }
        selectanimales = []
        for (const [key, value ] of Object.entries(selecthashmap)) {
            
            selectanimales.push({
                ...value,
                padre:"",
                pajuela:""})
        }
        inseminacionMasiva.showModal()
    }
    function getEstadoName(est) {
        let estado = estados.filter(e=>e.id==est)[0]
        return estado.nombre
    }
    async function crearInseminacion() {
        if(fechainseminacion == ""){
            Swal.fire("Error inseminaciones","Debe seleccionar una fecha","error")
            return 
        }
        let errores = false
        for(let i = 0;i<selectanimales.length;i++){
            let inseminacion = selectanimales[i]
        }
        fechainseminacion = ""
        fechaparto = ""
        botonhabilitado = false
        malfecha = false
    }
    onMount(async ()=>{
        await getAnimales()
        await getRodeos()
        await getLotes()
        
    })

</script>
<Navbarr>
    <PredictSelect bind:valor={valor} lista={lista} etiqueta = {etiqueta}></PredictSelect>
    <span>{valor}</span>
    <div class="grid grid-cols-3 mx-1 lg:mx-10 mt-1 w-11/12">
        <div>
            <h1 class="text-2xl">Inseminaciones</h1>
        </div>
    </div>
</Navbarr>
<dialog id="inseminacionMasiva" class="modal modal-middle rounded-xl">
</dialog>