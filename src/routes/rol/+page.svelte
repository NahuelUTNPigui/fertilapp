<script>
    import {enabled} from '$lib/stores/enabled'
    import {usuario} from '$lib/stores/usuario'
    import Swal from 'sweetalert2'
    import { onMount } from 'svelte';
    import { goto } from '$app/navigation';
    import Oscuro from "$lib/components/OscuroLogin.svelte";
    import RoleCard from '$lib/components/RoleCard.svelte';
    import PocketBase from 'pocketbase'
    import { createDarker } from '$lib/stores/dark.svelte';
    import Image from '$lib/components/Image.svelte';
    let darker = createDarker()
    let ruta = import.meta.env.VITE_RUTA
    const images = [
        {
            src: "https://picsum.photos/300/200?random=1",
            alt: "Cabañas",
            title: "Gestion cabaña",
            rol:"cab"
        },
        {
            src: "https://picsum.photos/300/200?random=2",
            alt: "Veterinario",
            title: "Veterinario",
            rol:"vet"
        }
    ];
    const roles = [
    {
      title: "Cabaña",
      description: "Administra tus animales",
      icon: "🐮",
      rol:"cab"
      
    },
    {
      title: "Veterinario",
      description: "Realiza atenciones a los animales",
      icon: "👨‍⚕️",
      rol:"vet"
      
    }
  ];
</script>
<div class="flex justify-end m-10">
    <Oscuro></Oscuro>
</div>

<div class="min-h-screen">
    <div class="container mx-auto px-4 py-16">
      <div class="text-center mb-16">
        <h1 class="text-4xl font-bold  mb-4">
          Elige tu rol
        </h1>
        <p class="text-lg ">
          Selecciona como quieres usar a la plataforma
        </p>
      </div>
  
      <div class="flex flex-wrap gap-8 justify-center items-stretch">
        {#each roles as role}
          <RoleCard {...role} />
        {/each}
      </div>
    </div>
</div>

<!--<div class="w-full min-h-screen flex justify-center items-start pt-16">
    <div class="flex gap-8 justify-center items-center flex-wrap p-4">
        {#each images as image}
            <Image {...image} dark={darker.dark}/>
        {/each}
    </div>
</div>
-->
