<script>
    import Oscuro from '$lib/components/Oscuro.svelte';
    import CardBase from '$lib/components/CardBase.svelte';
    import PocketBase from 'pocketbase'
    import {enabled} from '$lib/stores/enabled'
    import { onMount } from 'svelte';
    import {usuario} from '$lib/stores/usuario'
    import { goto } from '$app/navigation';
    import { createRoler } from "$lib/stores/defaultrol.svelte";
    import { createDarker } from "$lib/stores/dark.svelte";
    import { page } from '$app/stores';  
    import { createCaber } from "$lib/stores/cab.svelte";
    import {randomString} from "$lib/stringutil/lib"
    import { codigoSinRepetirEstablecimiento } from "$lib/pbutils/lib";
    import cuentas from '$lib/stores/cuentas';
    import Swal from 'sweetalert2';
    let pageurl = $page.url.pathname  
    let ruta = import.meta.env.VITE_RUTA
    let pre = import.meta.env.VITE_PRE
    const pb = new PocketBase(ruta);
    let darker = createDarker()
    
    let cab = $state({
        exist:false,
        nombre:"",
        id:""
    })
    let concab = false
    let textColorClass = '';
    
    let nombreusuario = $state('')
    let roler = createRoler()
    
    let rol = roler.rol==""?"":roler.rol=="vet"?"Veterinario":"Establecimiento"
    let nombreestablecimiento = $state("")
    //valores
    let nombreest = $state("")
    let contactoest = $state("")
    let direccionest = $state("")
    //usuario id
    let usuarioid = $state("")
    //let rol = "cab"
    onMount(async ()=>{
      let caber = createCaber()
      nombreestablecimiento = caber.cab.nombre
      let pb_json = JSON.parse(localStorage.getItem('pocketbase_auth'))
      usuarioid = pb_json.record.id
      nombreusuario = pb_json.record.username
      let hab = $enabled
      if(hab==="no"){
        goto(pre+"/")
      }
      let light = !darker.dark
      cab = caber.cab      
    })
    
    function salir(){
        
        pb.authStore.clear();
        usuario.set('')
        enabled.set("no")
        
        goto(pre+"/")
    }
    function editarUser(){
      goto(pre+"/user/config")
    }
    function cambiarEstablecimiento(){
      goto(pre+"/establecimientos")
    }
    function volver(){
        goto(pre+"/establecimientos")
    }
    async function guardarEstablecimiento(){
        let user = await pb.collection("users").getOne(usuarioid)
        
        let nivel  = cuentas.filter(c=>c.nivel == user.nivel)[0]
        let cabs = await pb.collection('cabs').getList(1,1,{filter:`user='${usuarioid}' && active = true`})
        
        if(nivel.establecimientos != -1 && cabs.totalItems >= nivel.establecimientos){
          Swal.fire("Error guardar",`No tienes el nivel de la cuenta para tener más de ${nivel.establecimientos} establecimientos`,"error")
          return
        }
        
        let codigo = await codigoSinRepetirEstablecimiento(pb)
        const data = {
            nombre:nombreest,
            direccion:direccionest,
            user: usuarioid,
            active: true,
            contacto:contactoest,
            codigo
        };

        try{
            const record = await pb.collection('cabs').create(data);
            Swal.fire("Exito guadar","Se pudo guardar la cabaña con éxito","success")
            volver()
        }
        catch(err){
            console.error(err)
            Swal.fire("Error guardar","No se pudo guardar la cabaña","error")
        }
    }
    let bgnav = "bg-green-500"
    let classtext=`text-lg px-2 font-extrabold`
    let classnavbarr=`navbar ${bgnav}`
    let classtextnavbar = `text-white font-extrabold dark:text-gray-700`
  </script>
  <div class="drawer min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
    <div class="drawer-content w-full">
        <div class={classnavbarr}>
            <div class="flex-1">
              <a href={pre+"/inicio" }
              class={`pl-0 pr-1 btn btn-ghost text-2xl ${classtextnavbar}`}
              >{nombreestablecimiento}</a>
            </div>
            <div class="flex mr-1 pr-1 lg:mr-5 lg:pr-5">
              <span class={classtextnavbar}>{nombreusuario}</span>
              
              <details class="dropdown dropdown-end">
                <summary class={`btn btn-square btn-ghost ${classtextnavbar}`}>
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                    class="inline-block h-5 w-5 stroke-current">
                    <path
                      stroke-linecap="round"
                      stroke-linejoin="round"
                      stroke-width="2"
                      d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"></path>
                  </svg>
                </summary>
                <div class="pr-3 mr-3">
                  <ul class={`menu dropdown-content rounded-box z-[1] shadow ${classtextnavbar} ${bgnav}`}>
                    <li><button onclick={editarUser}>Usuario</button></li>
                    <li><button onclick={cambiarEstablecimiento}>Establecimientos</button></li>
                    <li><button onclick={salir}>Salir</button></li>
                    
                  </ul>
                </div>
                
              </details>
              <Oscuro></Oscuro>
            </div>
        </div>
        <!--Aca val el interior-->
        <CardBase titulo="Registra el nuevo establecimiento">
            <div class="space-y-4">
                
                <div>
                    <label for="nombre" 
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Nombre
                    </label>
                    <input 
                        type="nombre" 
                        id="nombre"
                        
                        bind:value={nombreest} 
                        required 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
                <div>
                    <label for="direccion" 
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Dirección
                    </label>
                    <input 
                        type="direccion" 
                        id="direccion"
                        
                        bind:value={direccionest} 
                        required 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>
                <div>
                    <label for="contacto" 
                        class="block text-sm font-medium text-gray-700 dark:text-gray-300 mb-1"
                    >
                        Contacto
                    </label>
                    <input 
                        type="contacto" 
                        id="contacto"
                        
                        bind:value={contactoest} 
                        required 
                        class="w-full px-3 py-2 border border-gray-300 dark:border-gray-600 dark:bg-gray-700 rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-green-500 focus:border-green-500 transition"
                    />
                </div>

            </div>
            <div class="mt-8 flex justify-end">
                <button class="btn btn-error text-white" onclick={volver}>Cancelar</button>
                <button
                    onclick={guardarEstablecimiento}
                    class="
                        btn px-6 py-2 
                        bg-green-600 hover:bg-green-700 
                        rounded-md text-white font-bold text-lg 
                        focus:outline-none focus:ring-2 
                        focus:ring-offset-2 focus:ring-green-500
                    "
                >
                  Guardar establecimiento
                </button>
            </div>
        </CardBase>
    </div>
  </div>