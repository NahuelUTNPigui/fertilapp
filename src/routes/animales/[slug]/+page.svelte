<script>
    import { browser } from "$app/environment"
    import Navbarr from "$lib/components/Navbarr.svelte";
    import PocketBase from 'pocketbase'
    import { onMount } from 'svelte';
    import { page } from '$app/stores';
    import { goto } from '$app/navigation';
    import estilos from "$lib/stores/estilos";
    import Swal from 'sweetalert2'
    import CardBase from "$lib/components/CardBase.svelte";
    import CardAnimal from "$lib/components/animal/CardAnimal.svelte";
    import DatosBasicos from "$lib/components/animal/DatosBasicos.svelte";
    import Pariciones from "$lib/components/animal/Pariciones.svelte";
    import Tactos from "$lib/components/animal/Tactos.svelte";
    import Acciones from "$lib/components/animal/Acciones.svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import Inseminaciones from "$lib/components/animal/Inseminaciones.svelte";
    
    let ruta = import.meta.env.VITE_RUTA
    const pb = new PocketBase(ruta);
    let caber = createCaber()
    let cab = caber.cab
    // Datos
    let slug = ""
    let caravana = ""
    let usuarioid =""
    let active = true
    let fechanacimiento = ""
    let sexo = ""
    let nacimiento = ""
    let peso = 0
    let pariciones = []
    let nacimientoobj = {}
    let tactos = []

    async function  getPariciones(id){
        const recordpariciones =  await pb.collection('nacimientos').getFullList({
            filter:`madre='${id}' || padre='${id}'`,
            sort: '-created',
        });
        pariciones = recordpariciones
    }
    async function getTactos(id){
        const recordtactos = await pb.collection('tactos').getFullList({
            filter:`animal='${id}'`,
            sort: '-created',
        });

        tactos = recordtactos
    }
    async function darBaja(fechafallecimiento){
        try{
            const data = {
                active: false,
                fechafallecimiento: fechafallecimiento +  " 03:00:00"
            };

            const record = await pb.collection('animales').update(slug, data);  
            Swal.fire("Éxito dar de baja","Se pudo dar de baja al animal","success")
            goto("/animales")  
        }
        catch(err){
            Swal.fire("Error dar de baja","No se pudo dar de baja al animal","error")
            console.error(err)
        }
        
        
    }
    async function eliminar(){
        try{
            const data = {
                delete: true,
            };

            const record = await pb.collection('animales').update(slug, data);  
            Swal.fire("Éxito eliminar","Se pudo eliminar al animal","success")
            goto("/animales")  
        }
        catch(err){
            Swal.fire("Error eliminar","No se eliminar al animal","error")
            console.error(err)
        }
    }
    async function transferir(newcab){
        
        try{
            const data = {
                
                cab: newcab,
                rodeo: "",
            };

            const record = await pb.collection('animales').update(slug, data);

            goto("/animales")
            Swal.fire("Éxito transferencia","Se pudo transferir al animal","success")
        }catch(err){
            console.error(err)
            Swal.fire("Error transferencia","No se pudo transferir al animal","error")
        }
        
    }
    onMount(async ()=>{
        slug = $page.params.slug
        if(slug != ""){
            try{
                const recorda = await pb.collection('animales').getOne(slug, {
                    expand:"nacimiento"
                });
                caravana = recorda.caravana
                active = recorda.active
                fechanacimiento = recorda.fechanacimiento.split(" ")[0]
                
                nacimiento = ""
                nacimientoobj = {}
                if(recorda.nacimiento != ""){
                    nacimiento =recorda.nacimiento
                    nacimientoobj = recorda.expand.nacimiento
                }
                peso = recorda.peso
                sexo = recorda.sexo
                //await getPariciones(slug)
                //await getTactos(slug)
            }
            catch(err){
                console.log(err)
                Swal.fire('Error historial', 'No existe el animal', 'error');
            }

        }
    })
</script>
<Navbarr>
    <CardAnimal cardsize="max-w-7xl" titulo="Datos básicos">
        <DatosBasicos peso={peso} sexo={sexo} caravana={caravana} connacimiento={nacimiento != ""} nacimiento={nacimientoobj} fechanacimiento = {fechanacimiento}/>
    </CardAnimal>
    <CardAnimal cardsize="max-w-7xl" titulo="Pariciones">
        <Pariciones cabid={cab.id}/>
    </CardAnimal>
    {#if sexo=="H"}
    <CardAnimal cardsize="max-w-7xl" titulo="Tactos">
        <Tactos />
    </CardAnimal>
    <CardAnimal cardsize="max-w-7xl" titulo="Inseminaciones">
        <Inseminaciones/>
    </CardAnimal>
    {/if}
    <CardAnimal cardsize="max-w-7xl" titulo="Acciones">
        <Acciones 
            caravana = {caravana}
            bajar={async (fechafallecimiento)=>await darBaja(fechafallecimiento)}
            eliminar={eliminar}
            transferir={(newcab)=>transferir(newcab)}
        />
    </CardAnimal>
    <!--
    
    
    <CardAnimal cardsize="max-w-7xl" titulo="Detalles animal">
        <div role="tablist" class="tabs tabs-bordered">
            <input 
                type="radio" 
                name="my_tabs_1" 
                role="tab" 
                class="tab" 
                aria-label="Datos"
                checked="true"
            />
            <div role="tabpanel" class="tab-content p-0">
                <DatosBasicos peso={peso} sexo={sexo} caravana={caravana} connacimiento={nacimiento != ""} nacimiento={nacimientoobj} fechanacimiento = {fechanacimiento}/>
            </div>
          
            <input
                type="radio"
                name="my_tabs_1"
                role="tab"
                class="tab text-md"
                aria-label="Pariciones"
            />
            <div role="tabpanel" class="tab-content p-0">
                
                <Pariciones cabid={cab.id}/>
            </div>
          
            <input 
                type="radio"
                name="my_tabs_1" 
                role="tab" 
                class="tab" 
                aria-label="Tactos" 
            />
            <div role="tabpanel" class="tab-content p-0">
                <Tactos />
            </div>
            <input 
                type="radio"
                name="my_tabs_1" 
                role="tab" 
                class="tab" 
                aria-label="Acciones" 
            />
            <div role="tabpanel" class="tab-content p-0">
                <Acciones 
                    caravana = {caravana}
                    bajar={async (fechafallecimiento)=>await darBaja(fechafallecimiento)}
                    eliminar={eliminar}
                    transferir={(newcab)=>transferir(newcab)}
                />
            </div>
        </div>
        
    </CardAnimal>
    -->

</Navbarr>