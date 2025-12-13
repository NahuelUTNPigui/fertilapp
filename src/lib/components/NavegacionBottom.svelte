<script>
    import { goto } from "$app/navigation";
    import { page } from "$app/stores";
    import Animal from "$lib/svgs/animal.svelte";
    import Estable from "$lib/svgs/estable.svelte";
    let pageurl = $page.url.pathname;
    let pre = import.meta.env.VITE_PRE;
    let { conestable = $bindable(true) } = $props();
    //<div class="flex items-center justify-around h-16 px-4">
</script>

<nav class="fixed bottom-0 left-0 right-0 bg-white dark:bg-gray-800 border-t">
    <div class="grid grid-cols-3 h-16 px-4">
        <button
            class={`flex flex-col items-center h-auto py-1 px-2 ${
                pageurl.includes("inicio")
                    ? "text-green-900 dark:text-green-200"
                    : "text-muted-foreground"
            }`}
            onclick={() => goto(pre + "/inicio")}
        >
            <svg
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
                stroke-width="1.5"
                stroke="currentColor"
                class="size-10"
            >
                <path
                    stroke-linecap="round"
                    stroke-linejoin="round"
                    d="m2.25 12 8.954-8.955c.44-.439 1.152-.439 1.591 0L21.75 12M4.5 9.75v10.125c0 .621.504 1.125 1.125 1.125H9.75v-4.875c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125V21h4.125c.621 0 1.125-.504 1.125-1.125V9.75M8.25 21h8.25"
                />
            </svg>
            <span class="text-sm font-medium ">Inicio</span>
        </button>

        <button
            class={`flex flex-col items-center  h-auto py-1 px-2 ${
                pageurl.includes("animales")
                    ? "text-green-900 dark:text-green-200"
                    : "text-muted-foreground"
            }`}
            onclick={() => goto(pre + "/animales")}
        >
            <Animal class="size-8" margenes=""/>
            <span class="text-sm font-medium">Animales</span>
        </button>
        <button
            class={`flex flex-col items-center h-auto py-1 px-2 ${
                pageurl.includes("establecimiento")
                    ? "text-green-900 dark:text-green-200"
                    : "text-muted-foreground"
            }`}
            onclick={() => goto(pre + "/establecimiento")}
        >
            <Estable size="size-10" margenes=""></Estable>
            <span class="text-sm font-medium">Establecimiento</span>
        </button>
    </div>
</nav>
