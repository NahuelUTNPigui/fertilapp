<script>
    import Navbarr from "$lib/components/Navbarr.svelte";
    import Pocketbase from 'pocketbase';
    import Swal from "sweetalert2";
    import { onMount } from "svelte";
    import { createCaber } from "$lib/stores/cab.svelte";
    import estilos from '$lib/stores/estilos';
    function openNewModal(){
        nuevoModal.showModal()
    }
</script>
<Navbarr>
    <div class="w-full grid justify-items-left mx-1 lg:mx-10 mt-1">
        <h1 class="text-2xl">Reportes</h1>  
    </div>
    <div class="grid grid-cols-1 gap-1 lg:grid-cols-3 mb-2 mt-1 mx-1 lg:mx-10" >
        <div >
            <button class={`w-full btn flex btn-primary ${estilos.btntext}`} data-theme="forest" onclick={()=>openNewModal()}>
                <span  class="text-xl">Nuevo reporte</span>
            </button>
        </div>
    </div>
    <dialog id="nuevoModal" class="modal modal-top mt-10 ml-5 lg:items-start rounded-xl lg:modal-middle">
        <div class="
        modal-box w-11/12 max-w-xl
        bg-gradient-to-br from-white to-gray-100 
        dark:from-gray-900 dark:to-gray-800
        ">
            <form method="dialog">
                <button class="btn btn-sm btn-circle btn-ghost absolute right-2 top-2 rounded-xl">✕</button>
            </form>
            <h3 class="text-lg font-bold">Nuevo reporte</h3>
            <div class="form-control">
                <label for = "rodeo" class="label">
                    <span class="label-text text-base">Rodeos</span>
                </label>
                <input type="checkbox" name="rodeo">
                <label for = "lote" class="label">
                    <span class="label-text text-base">Lotes</span>
                </label>
                <input type="checkbox" name="lote">
            </div>
        </div>
    </dialog>
</Navbarr>