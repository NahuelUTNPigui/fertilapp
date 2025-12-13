<script>
  import Oscuro from "./Oscuro.svelte";
  import PocketBase from "pocketbase";

  import { enabled } from "$lib/stores/enabled";
  import { onMount, onDestroy } from "svelte";
  import { usuario } from "$lib/stores/usuario";
  import { goto } from "$app/navigation";

  import { createDarker } from "$lib/stores/dark.svelte";
  import { page } from "$app/stores";
  import { createCaber } from "$lib/stores/cab.svelte";
  import NavegacionBottom from "./NavegacionBottom.svelte";
  //SVG
  import Animal from "$lib/svgs/animal.svelte";
  import Estable from "$lib/svgs/estable.svelte";
  import Lote from "$lib/svgs/lote.svelte";
  import Movimiento from "$lib/svgs/movimiento.svelte";
  import Nacimiento from "$lib/svgs/nacimiento.svelte";
  import Observacion from "$lib/svgs/observacion.svelte";
  import Pesaje from "$lib/svgs/pesaje.svelte";
  import Rodeo from "$lib/svgs/rodeo.svelte";
  import Servicio from "$lib/svgs/servicio.svelte";
  import Tacto from "$lib/svgs/tacto.svelte";
  import Tratamiento from "$lib/svgs/tratamiento.svelte";
  import Bell from "$lib/svgs/bell.svelte";
  import Reportes from "$lib/svgs/reportes.svelte";
    import Importar from "$lib/svgs/importar.svelte";
  //tamaño
  let innerWidth = $state(0);
  let innerHeight = $state(0);
  let { children } = $props();

  let pageurl = $page.url.pathname;
  let ruta = import.meta.env.VITE_RUTA;
  let pre = import.meta.env.VITE_PRE;
  let esCelu = $derived(innerWidth <= 1100);

  const pb = new PocketBase(ruta);
  let darker = createDarker();
  let leido = $state(true);
  let notificaciones = $state([]);
  let cab = $state({
    exist: false,
    nombre: "",
    id: "",
  });

  let nombreusuario = $state("");
  let usuarioid = $state("");

  let rol = "Establecimiento";
  let nombreestablecimiento = $state("");

  //let rol = "cab"
  onDestroy(() => {
    //document.removeEventListener("click", handleClickOutsideMenu);
    //document.removeEventListener("click", handleClickOutsideNoti);
  });

  onMount(async () => {
    //document.addEventListener("click", handleClickOutsideMenu);
    //document.addEventListener("click", handleClickOutsideNoti);
    let caber = createCaber();
    nombreestablecimiento = caber.cab.nombre;
    if (window.innerWidth <= 600) {
      // Pantallas pequeñas
      nombreestablecimiento = nombreestablecimiento.slice(0, 15);
    }

    let pb_json = JSON.parse(localStorage.getItem("pocketbase_auth"));
    usuarioid = pb_json.record.id;
    nombreusuario = pb_json.record.username;

    let hab = $enabled;
    if (hab === "no") {
      goto(pre + "/");
    }

    cab = caber.cab;
    await getNotis();
  });
  //menu
  let containerMenu = $state(null); // referencia al div principal
  let openMenu = $state(false);
  function toggleMenu() {
    openMenu = !openMenu;
  }
  function handleClickOutsideMenu(event) {
    if (!containerMenu.contains(event.target)) {
      openMenu = false;
    }
  }
  //notififaciones
  let dropdownOpen = $state(false);
  async function toggleDropdown() {
    dropdownOpen = !dropdownOpen;
    await leerNotis(); // tu función existente
  }

  function closeDropdown() {
    dropdownOpen = false;
  }

  let containerNoti = $state(null); // referencia al div principal
  let openNoti = $state(false);
  function toggleNoti() {
    openNoti;
  }
  function handleClickOutsideNoti(event) {
    if (!containerNoti.contains(event.target)) {
      openNoti = false;
    }
  }

  function salir() {
    pb.authStore.clear();
    usuario.set("");
    enabled.set("no");
    goto(pre + "/");
  }
  function editarUser() {
    goto(pre + "/user/config");
  }
  function cambiarEstablecimiento() {
    goto(pre + "/establecimientos");
  }
  function verManual() {
    goto(pre + "/manual");
  }
  let checked = $state("");
  function handleClick() {
    checked == "checked" ? (checked = "") : (checked = "checked");
  }
  async function getNotis() {
    const records = await pb.collection("notificaciones").getFullList({
      sort: "-created",
      filter: `destino = '${usuarioid}' && leido = False`,
    });

    notificaciones = records;
    if (notificaciones.length > 0) {
      leido = false;
    }
  }
  async function leerNotis() {
    leido = true;

    for (let i = 0; i < notificaciones.length; i++) {
      try {
        let data = { leido: true };
        await pb
          .collection("notificaciones")
          .update(notificaciones[i].id, data);
      } catch (err) {
        console.error(err);
      }
    }
  }
  let bgnav = "bg-green-500";
  let classtext = `text-lg px-2 font-extrabold`;
  let classnavbarr = `navbar ${bgnav} fixed top-0 left-0 right-0 z-50`;
  let classtextnavbar = `text-white font-extrabold dark:text-gray-700`;
</script>

<svelte:window bind:innerWidth bind:innerHeight />
<div
  class="drawer min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800"
>
  <input id="my-drawer" type="checkbox" class="drawer-toggle" bind:checked />
  <div class="drawer-content w-full">
    <div class={classnavbarr}>
      <div class="flex-none">
        <button
          aria-label="menu"
          class={`mx-1 px-0 btn btn-ghost ${classtextnavbar}`}
          onclick={handleClick}
        >
          <div class="flex items-center gap-2 px-3">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 24 24"
              fill="currentColor"
              class=" size-6"
            >
              <path
                fill-rule="evenodd"
                d="M3 6.75A.75.75 0 0 1 3.75 6h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 6.75ZM3 12a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75A.75.75 0 0 1 3 12Zm0 5.25a.75.75 0 0 1 .75-.75h16.5a.75.75 0 0 1 0 1.5H3.75a.75.75 0 0 1-.75-.75Z"
                clip-rule="evenodd"
              />
            </svg>
            <span class="hidden md:block text-lg font-bold">Menu</span>
          </div>
        </button>
      </div>
      <div class="flex-1">
        <a
          href={pre + "/establecimientos"}
          class={`ps-0 btn btn-ghost text-xl ${classtextnavbar}`}
        >
          {nombreestablecimiento}
        </a>
      </div>

      <div class="flex mr-1 pr-1 lg:mr-5 lg:pr-5">
        <details class="dropdown dropdown-end">
          <summary
            class={`btn m-0 p-0 bg-transparent hover:bg-transparent ${classtextnavbar} border-none`}
            onclick={leerNotis}
          >
            <div class="indicator">
              {#if !leido}
                <span
                  class="indicator-item badge dark:badge-error badge-error badge-xs"
                ></span>
              {/if}
              <Bell size="size-8"></Bell>
              <span class={`hidden px-2`}>{nombreusuario} </span>
            </div>
          </summary>

          <ul
            class={`menu dropdown-content w-52 rounded-box z-[1] shadow ${classtextnavbar} ${bgnav}`}
          >
            {#if notificaciones.length == 0}
              <li><span>Sin notificaciones</span></li>
            {:else}
              {#each notificaciones as n}
                <li><span>{n.titulo}</span></li>
              {/each}
            {/if}
          </ul>
        </details>

        <details class="dropdown dropdown-end">
          <summary class={`btn btn-square btn-ghost ${classtextnavbar}`}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              class="inline-block h-5 w-5 stroke-current"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                stroke-width="2"
                d="M5 12h.01M12 12h.01M19 12h.01M6 12a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0zm7 0a1 1 0 11-2 0 1 1 0 012 0z"
              ></path>
            </svg>
          </summary>
          <div class="pr-3 mr-3">
            <ul
              class={`menu dropdown-content rounded-box z-[1] shadow ${classtextnavbar} ${bgnav}`}
            >
              <li><button onclick={editarUser}>Configuración</button></li>
              <li>
                <button onclick={cambiarEstablecimiento}
                  >Establecimientos</button
                >
              </li>
              <li><button onclick={verManual}>Manual</button></li>
              <li><button onclick={salir}>Salir</button></li>
            </ul>
          </div>
        </details>
        <Oscuro></Oscuro>
      </div>
    </div>
    <main class="py-16">

      
      {@render children()}
      {#if esCelu}
        <NavegacionBottom />
      {/if}
    </main>
  </div>

  <div
    class="drawer-side overflow-y-auto scrollbar-thin scrollbar-thumb-gray-600 scrollbar-track-gray-800 pt-16"
  >
    <label for="my-drawer" aria-label="close sidebar" class="drawer-overlay"
    ></label>

    <ul
      class="
            overflow-y-auto
            menu bg-gradient-to-br from-white to-gray-100
            dark:from-gray-900 dark:to-gray-800
            text-base-content min-h-full
            w-2/3 lg:w-1/4 p-4
          "
    >
      <div class="border-b border-green-500">
        <h1 class="text-lg text-green-600 dark:text-green-400 italic">
          {`Fertil - ${nombreestablecimiento}`}
        </h1>
      </div>

      <!--Inicio-->
      <li
        class={`${esCelu ? "hidden" : ""} mt-0 ${pageurl.includes("inicio") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        <a class={`pb-0 ${classtext}`} href={pre + "/inicio"}>
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            stroke-width="1.5"
            stroke="currentColor"
            class="pl-3 size-10"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
            />
          </svg>
          <span class="px-3 flex items-center">
            <div>Inicio</div>
          </span>
        </a>
      </li>
      <!--Establecimiento-->
      <li
        class={`${esCelu ? "hidden" : ""} ${pageurl.includes("establecimiento") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        <a class={`py-0 ${classtext}`} href={pre + "/establecimiento"}>
          <Estable size="size-12" margenes=""></Estable>

          <span class="px-2 flex items-center">
            <div>Establecimiento</div>
          </span>
        </a>
      </li>
      <!--Animales-->
      <li
        class={`${esCelu ? "hidden" : ""} ${cab.exist ? "" : "disabled"}  ${pageurl.includes("animales") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/animales"}>
            <Animal size="size-12" margenes=""></Animal>

            <span class="px-3"> Animales </span>
          </a>
        {:else}
          <div class={`${classtext} py-0`}>
            <Animal size="size-12" margenes=""></Animal>
            <span class="px-3"> Animales </span>
          </div>
        {/if}
      </li>
      <!--Nacimientos-->
      <li
        class={`${cab.exist ? "" : "disabled"} ${pageurl.includes("nacimientos") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/nacimientos"}>
            <Nacimiento size="size-12" margenes=""></Nacimiento>
            <span class="px-3"> Nacimientos </span>
          </a>
        {:else}
          <div class={classtext}>
            <Nacimiento size="size-12"></Nacimiento>
            <span class="px-3"> Nacimientos </span>
          </div>
        {/if}
      </li>
      <!--Servicios-->
      <li
        class={`${cab.exist ? "" : "disabled"} ${pageurl.includes("servicios") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/servicios"}>
            <Servicio size="size-12" margenes=""></Servicio>
            <span class="px-3">Servicios</span>
          </a>
        {:else}
          <div class={classtext}>
            <Servicio size="size-12" margenes=""></Servicio>
            <span class="px-3">Servicios</span>
          </div>
        {/if}
      </li>
      <!--Tactos-->
      <li
        class={` ${cab.exist ? "" : "disabled"} ${pageurl.includes("tactos") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/tactos/cab"}>
            <Tacto size="size-12" margenes=""></Tacto>
            <span class="px-3"> Tactos </span>
          </a>
        {:else}
          <div class={classtext}>
            <Tacto size="size-12" margenes=""></Tacto>
            <span class="px-3"> Tactos </span>
          </div>
        {/if}
      </li>
      <!--Tratamientos-->
      <li
        class={`${cab.exist ? "" : "disabled"} ${pageurl.includes("tratamientos") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/tratamientos"}>
            <Tratamiento size="size-12" margenes=""></Tratamiento>

            <span class="px-3">Tratamientos</span>
          </a>
        {:else}
          <div class={classtext}>
            <Tratamiento size="size-12" margenes=""></Tratamiento>
            <span class="px-3">Tratamientos</span>
          </div>
        {/if}
      </li>
      <!--Movimientos-->
      <li
        class={` ${cab.exist ? "" : "disabled"} ${pageurl.includes("movimientos") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/movimientos"}>
            <Movimiento size={"size-12"} margenes=""></Movimiento>
            <span class="px-3">Movimientos</span>
          </a>
        {:else}
          <div class={classtext}>
            <Movimiento size={"size-12"} margenes=""></Movimiento>
            <span class="px-3">Movimientos</span>
          </div>
        {/if}
      </li>
      <!--Pesajes-->
      <li
        class={` ${cab.exist ? "" : "disabled"} ${pageurl.includes("pesajes") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/pesajes"}>
            <Pesaje size={"size-12"} margenes=""></Pesaje>

            <span class="px-3">Pesajes</span>
          </a>
        {:else}
          <div class={classtext}>
            <Pesaje size={"size-12"} margenes=""></Pesaje>
            <span class="px-3">Pesajes</span>
          </div>
        {/if}
      </li>
      <!--Observaciones-->
      <li
        class={`${cab.exist ? "" : "disabled"} ${pageurl.includes("observaciones") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/observaciones"}>
            <Observacion size="size-12" margenes=""></Observacion>

            <span class="px-3">Observaciones</span>
          </a>
        {:else}
          <div class={classtext}>
            <Observacion size="size-12" margenes=""></Observacion>

            <span class="px-3">Observaciones</span>
          </div>
        {/if}
      </li>
      <!--Rodeos-->
      <li
        class={`${cab.exist ? "" : "disabled"} ${pageurl.includes("rodeos") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/rodeos"}>
            <Rodeo size={"size-12"} margenes=""></Rodeo>

            <span class="px-3"> Rodeos </span>
          </a>
        {:else}
          <div class={classtext}>
            <Rodeo size={"size-12"} margenes=""></Rodeo>

            <span class="px-3"> Rodeos </span>
          </div>
        {/if}
      </li>
      <!--Lotes-->
      <li
        class={` ${cab.exist ? "" : "disabled"} ${pageurl.includes("lotes") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/lotes"}>
            <Lote size="size-12" margenes=""></Lote>
            <span class="px-3"> Lotes </span>
          </a>
        {:else}
          <div class={classtext}>
            <Lote size="size-12" margenes=""></Lote>
            <span class="px-3"> Lotes </span>
          </div>
        {/if}
      </li>
      <!--Reportes-->
      <li
        class={` ${cab.exist ? "" : "disabled"} ${pageurl.includes("reportes") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/reportes"}>
            <Reportes class="size-12"></Reportes>
            <span class="px-3">Reportes</span>
          </a>
        {:else}
          <div class={classtext}>
            <Reportes class="size-12"></Reportes>
            <span class="px-3">Reportes</span>
          </div>
        {/if}
      </li>
      <!--Importar-->
      <li
        class={`${cab.exist ? "" : "disabled"} ${pageurl.includes("importar") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/importar"}>
            <Importar size="size-12"/>
            <span class="px-3">Importar</span>
          </a>
        {:else}
          <div class={classtext}>
            <Importar size="size-12"/>
            <span class="px-3">Importar</span>
          </div>
        {/if}
      </li>
      <!--Manual-->
      <li
        class={`hidden ${cab.exist ? "" : "disabled"} ${pageurl.includes("manual") ? "bg-green-400 text-green-900 dark:bg-green-900 dark:text-green-200 bg-opacity-25" : ""} rounded-full`}
      >
        {#if cab.exist}
          <a class={`py-0 ${classtext}`} href={pre + "/manual"}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="ml-3 size-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <span class="px-3">Manual</span>
          </a>
        {:else}
          <div class={classtext}>
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              stroke-width="1.5"
              stroke="currentColor"
              class="ml-3 size-8"
            >
              <path
                stroke-linecap="round"
                stroke-linejoin="round"
                d="m11.25 11.25.041-.02a.75.75 0 0 1 1.063.852l-.708 2.836a.75.75 0 0 0 1.063.853l.041-.021M21 12a9 9 0 1 1-18 0 9 9 0 0 1 18 0Zm-9-3.75h.008v.008H12V8.25Z"
              />
            </svg>
            <span class="px-3">Manual</span>
          </div>
        {/if}
      </li>
    </ul>
  </div>
</div>
