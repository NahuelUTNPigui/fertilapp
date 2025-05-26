<script>
    import Navbarr from '$lib/components/Navbarr.svelte';
    import { goto } from "$app/navigation";
    import estilos from "$lib/stores/estilos";
    let ruta = import.meta.env.VITE_RUTA
    let titulo = "Manual usuario"
    let cardsize = "max-w-5xl"
    function descargarManual(){
        goto(`/Manual de Usuario.pdf`)
    }
</script>
<Navbarr>
    <div class="bg-transparent p-2">
        <div class="flex items-center justify-center ">
            <div 
                class={`
                    bg-white dark:bg-gray-800 rounded-xl shadow-2xl p-2 w-full 
                    ${cardsize}
                `}
            >
                <h1 class="text-2xl font-bold text-green-700 dark:text-green-400 mb-3 text-start">{titulo}</h1>
                <div class="space-y-4 grid grid-cols-1 flex justify-center">
                    <a
                        href="/Manual de Usuario.pdf"
                        download="Manual de Usuario.pdf"
                        class={`
                            w-full
                            ${estilos.basico} ${estilos.grande} ${estilos.secundario}
                        `}
                        
                    >
                       Descargar manual
                    </a>
                </div>
            </div>
        </div>
    </div>
</Navbarr>