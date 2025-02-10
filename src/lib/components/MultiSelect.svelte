<script>
    import {ChevronDown, X} from 'lucide-svelte'
    import { slide } from 'svelte/transition';
    let {opciones,etiqueta,valores=$bindable([])} = $props()
    //Logica de las opciones
    let isOpen = $state(false)

    function clickOption(idopt){
        if(valores.includes(idopt)){
            valores = valores.filter(v =>v != idopt)
        }
        else{
            valores.push(idopt)
        }
    }
    function removeOption(idopt){
        valores = valores.filter(v =>v != idopt)
    }
</script>
<label for="">{etiqueta}</label>
<button 
    class="
        flex items-center justify-between 
        w-full p-2 text-left 
        bg-white border border-gray-300 
        rounded-md shadow-sm focus:outline-none focus:ring-2 
        focus:ring-blue-500 focus:border-blue-500
    "
    onclick={()=>isOpen = !isOpen}
>
    <span class="block truncate">
        {valores.length > 0 ? `${valores.length} seleccionados` : "Selecciona una opcion"}
    </span>
    
    <ChevronDown class={`w-5 h-5 ml-2 -mr-1 text-gray-400 transition-all duration-300 ${isOpen? 'transform rotate-180':''}`} />
</button>
{#if isOpen}
    <div class="absolute z-10  mt-1 bg-white rounded-md shadow-lg">
        <ul class="py-1 overflow-auto text-base max-h-60 focus:outline-none sm:text-sm">
            {#each valores as v}
                <li>
                    <button
                        class="relative py-2 pl-3 text-gray-900 cursor-default select-none pr-9 hover:bg-blue-100"
                        onclick={()=>clickOption(v.id)}
                    >   
                        <span
                            class={`
                                block truncate
                                ${valores.some(item=>item.id==v.id)?"font-semibold":"font-normal"}
                            `}
                        >
                            {v.nombre}
                        </span>
                        {#if valores.some(item=>item.id == v.id)}
                            <span 
                                class="absolute inset-y-0 right-0 flex items-center pr-4 text-blue-600"

                            >
                                <svg class="w-5 h-5" viewBox="0 0 20 20" fill="currentColor">
                                    <path
                                    fillRule="evenodd"
                                    d="M16.707 5.293a1 1 0 010 1.414l-8 8a1 1 0 01-1.414 0l-4-4a1 1 0 011.414-1.414L8 12.586l7.293-7.293a1 1 0 011.414 0z"
                                    clipRule="evenodd"
                                    />
                                </svg>
                            </span>
                        {/if}
                        
                    </button>
                </li>
            {/each}
        </ul>
    </div>
{/if}