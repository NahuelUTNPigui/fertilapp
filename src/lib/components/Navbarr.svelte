<script>
    import Oscuro from "./Oscuro.svelte";
    import PocketBase from 'pocketbase'
    import {enabled} from '$lib/stores/enabled'
    import { onMount } from 'svelte';
    import {usuario} from '$lib/stores/usuario'
    import { goto } from '$app/navigation';
    import { createRoler } from "$lib/stores/defaultrol.svelte";
    import { createDarker } from "$lib/stores/dark.svelte";
    import { page } from '$app/stores';  
    import { createCaber } from "$lib/stores/cab.svelte";
    let { children} = $props();
    let pageurl = $page.url.pathname  
    let ruta = import.meta.env.VITE_RUTA
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
    let rol = roler.rol==""?"":roler.rol=="vet"?"Veterinario":"Cabaña"
    //let rol = "cab"
    onMount(async ()=>{
      let caber = createCaber()
      let pb_json = JSON.parse(localStorage.getItem('pocketbase_auth'))
      let usuarioid = pb_json.model.id
      nombreusuario = pb_json.model.username
      let hab = $enabled
      if(hab==="no"){
        goto("/")
      }
      let light = !darker.dark
      cab = caber.cab      
    })
    
    function salir(){
        
        pb.authStore.clear();
        usuario.set('')
        enabled.set("no")
        
        goto("/")
    }
    function cambiarRol(){
      goto("/rol")
    }
    let checked = $state('');
    function handleClick() {
        (checked == 'checked') ? checked = '': checked = 'checked';

    }
    let bgnav = "bg-green-500"
    let classtext=`text-lg px-2 font-extrabold`
    let classnavbarr=`navbar ${bgnav}`
    let classtextnavbar = `text-white font-extrabold dark:text-gray-700`
  </script>
  
  
  <div class="drawer min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
      <input id="my-drawer" type="checkbox" class="drawer-toggle" bind:checked={checked} />
      <div class="drawer-content w-full">
          <div class={classnavbarr}>
              <div class="flex-none">
                <button
                  aria-label="menu" 
                  class={`mx-1 px-1 btn btn-ghost ${classtextnavbar}`} onclick={handleClick}>
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" class="size-6">
                    <path fill-rule="evenodd" d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z" clip-rule="evenodd" />
                  </svg>
                
                
                </button>
              </div>
              <div class="flex-1">
                <a href="/inicio" 
                class={`pl-0 pr-1 btn btn-ghost text-2xl ${classtextnavbar}`}
                >{rol}</a>
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
                      <li><button onclick={cambiarRol}>Configuracion</button></li>
                      <li><button onclick={salir}>Salir</button></li>
                      
                    </ul>
                  </div>
                  
                </details>
                <Oscuro></Oscuro>
              </div>
          </div>
          {@render children()}
      </div>
      <div class="drawer-side">
        <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"></label>
        
        <ul 
          class="
            menu bg-gradient-to-br from-white to-gray-100 
            dark:from-gray-900 dark:to-gray-800 
            text-base-content min-h-full 
            w-2/3 lg:w-1/4 p-4
          "
        >
          <div class="border-b border-green-500 ">
            <h1 class="text-lg text-green-600 dark:text-green-400 italic">Fertil</h1>
          </div>
          {#if rol=="Veterinario"}
            <li class={`mt-2 ${pageurl.includes("tactos")?"bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25":""} rounded-full`}>
              
              <a class = {classtext} href="/tactos/vet">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>
                <span class="px-3"> Tactos </span>       
                
              </a>
            </li>
            <li class={`${pageurl.includes("perfil")?"bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25":""} rounded-full`}>
              <a class = {classtext} href="/perfil">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
                </svg>          
                <span class="px-3"> Perfil </span>       
              </a>
            </li>
          {:else if rol=="Cabaña"}
          <li  class={`mt-2 ${pageurl.includes("inicio")?"bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25":""} rounded-full`}>
            <a class = {classtext} href="/inicio">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25" />
              </svg>              
              <span class="px-3 flex items-center">
                <div>
                  Inicio
                </div>
                
                {#if !cab.exist}
                  <div class="m-3">
                    <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="red" class="size-6">
                      <path stroke-linecap="round" stroke-linejoin="round" d="M14.857 17.082a23.848 23.848 0 0 0 5.454-1.31A8.967 8.967 0 0 1 18 9.75V9A6 6 0 0 0 6 9v.75a8.967 8.967 0 0 1-2.312 6.022c1.733.64 3.56 1.085 5.455 1.31m5.714 0a24.255 24.255 0 0 1-5.714 0m5.714 0a3 3 0 1 1-5.714 0M3.124 7.5A8.969 8.969 0 0 1 5.292 3m13.416 0a8.969 8.969 0 0 1 2.168 4.5" />
                    </svg>
                  </div>
                {/if}
                
                
                
              </span>
            </a>
          </li>
          <li  class={` ${cab.exist?"":"disabled"}  ${pageurl.includes("animales")?"bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25":""} rounded-full`}>
            {#if cab.exist}
              <a class = {classtext} href="/animales">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                  <path d="M32 32c17.7 0 32 14.3 32 32l0 336c0 8.8 7.2 16 16 16l400 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L80 480c-44.2 0-80-35.8-80-80L0 64C0 46.3 14.3 32 32 32zM160 224c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32zm128-64l0 160c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160c0-17.7 14.3-32 32-32s32 14.3 32 32zm64 32c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96c0-17.7 14.3-32 32-32zM480 96l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-224c0-17.7 14.3-32 32-32s32 14.3 32 32z"/>
                </svg>
                
                        
                <span class="px-3"> Animales </span>       
              </a>
            {:else}
              <div class = {classtext} href="/animales">
                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M7.5 14.25v2.25m3-4.5v4.5m3-6.75v6.75m3-9v9M6 20.25h12A2.25 2.25 0 0 0 20.25 18V6A2.25 2.25 0 0 0 18 3.75H6A2.25 2.25 0 0 0 3.75 6v12A2.25 2.25 0 0 0 6 20.25Z" />
                  <path d="M32 32c17.7 0 32 14.3 32 32l0 336c0 8.8 7.2 16 16 16l400 0c17.7 0 32 14.3 32 32s-14.3 32-32 32L80 480c-44.2 0-80-35.8-80-80L0 64C0 46.3 14.3 32 32 32zM160 224c17.7 0 32 14.3 32 32l0 64c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-64c0-17.7 14.3-32 32-32zm128-64l0 160c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-160c0-17.7 14.3-32 32-32s32 14.3 32 32zm64 32c17.7 0 32 14.3 32 32l0 96c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-96c0-17.7 14.3-32 32-32zM480 96l0 224c0 17.7-14.3 32-32 32s-32-14.3-32-32l0-224c0-17.7 14.3-32 32-32s32 14.3 32 32z"/>
                </svg>
                
                        
                <span class="px-3"> Animales </span>       
              </div>
            {/if}
          </li>
          <li class={`${cab.exist?"":"disabled"} ${pageurl.includes("tactos")?"bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25":""} rounded-full`}>
            <a class = {classtext} href="/tactos/cab">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z" />
              </svg>
              <span class="px-3"> Tactos </span>       
            </a>
          </li>
          <li class={`${cab.exist?"":"disabled"} ${pageurl.includes("nacimientos")?"bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25":""} rounded-full`}>
            <a class = {classtext} href="/nacimientos">
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6">
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>              
              <span class="px-3"> Nacimientos </span>       
            </a>
          </li>
          <li class={`${cab.exist?"":"disabled"} ${pageurl.includes("rodeos")?"bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25":""} rounded-full`}>
            <a class = {classtext} href="/rodeos">
              <!--<svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" >
                <path stroke-linecap="round" stroke-linejoin="round" d="M11.48 3.499a.562.562 0 0 1 1.04 0l2.125 5.111a.563.563 0 0 0 .475.345l5.518.442c.499.04.701.663.321.988l-4.204 3.602a.563.563 0 0 0-.182.557l1.285 5.385a.562.562 0 0 1-.84.61l-4.725-2.885a.562.562 0 0 0-.586 0L6.982 20.54a.562.562 0 0 1-.84-.61l1.285-5.386a.562.562 0 0 0-.182-.557l-4.204-3.602a.562.562 0 0 1 .321-.988l5.518-.442a.563.563 0 0 0 .475-.345L11.48 3.5Z" />
              </svg>              
              
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" stroke="currentColor" class="size-6 mt-1 ms-1" viewBox="0 0 24 24"  stroke-width="1.5">
                <path stroke-linecap="round" stroke-linejoin="round" d="M7.21.8C7.69.295 8 0 8 0q.164.544.371 1.038c.812 1.946 2.073 3.35 3.197 4.6C12.878 7.096 14 8.345 14 10a6 6 0 0 1-12 0C2 6.668 5.58 2.517 7.21.8m.413 1.021A31 31 0 0 0 5.794 3.99c-.726.95-1.436 2.008-1.96 3.07C3.304 8.133 3 9.138 3 10a5 5 0 0 0 10 0c0-1.201-.796-2.157-2.181-3.7l-.03-.032C9.75 5.11 8.5 3.72 7.623 1.82z"/>
                <path stroke-linecap="round" stroke-linejoin="round" d="M4.553 7.776c.82-1.641 1.717-2.753 2.093-3.13l.708.708c-.29.29-1.128 1.311-1.907 2.87z"/>
              </svg>-->
              <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke-width="1.5" stroke="currentColor" class="size-6" >
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 3h7a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-7m0-18H5a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h7m0-18v18" />
              </svg>
              
              <span class="px-3"> Rodeos </span>       
            </a>
          </li>
          {/if}
          
        </ul>
  
      </div>
      
      
</div>
  