<script>
    import { onMount } from 'svelte';
    import {enabled} from '$lib/stores/enabled'
    //import {oscuro} from '$lib/oscuro'
    import {createDarker} from "$lib/stores/dark.svelte.js"
    import { goto } from '$app/navigation';
    let pre = import.meta.env.VITE_PRE
    let hab = $enabled
    onMount(()=>{        
        
        let darker = createDarker()
        if(!darker.dark){
            document.querySelector("html").setAttribute("data-theme","light") 
        }
        else{
            document.querySelector("html").setAttribute("data-theme","dark") 
        }
        if(hab==="si"){
            goto(pre+"/inicio")
        }
        else{
            goto(pre+"/login")
        }
    })
    let bgnav = "bg-green-500"
    let classtext=`text-lg px-2 font-extrabold`
    let classnavbarr=`navbar ${bgnav}`
    let classtextnavbar = `text-white font-extrabold dark:text-gray-700`
</script>
{#if hab==="si"}
    <div class="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800">
        <div class="w-full">
            <div class={classnavbarr}>
                <p class="hidden">Pagina principal</p>
            </div>
        </div>
    </div>
{:else}
<div class="min-h-screen bg-gradient-to-br from-green-400 to-green-700  dark:from-gray-900 dark:to-gray-800 p-4">
    <p class="hidden">Pagina principal</p>
</div>
{/if}