<script>
    
    import NavegacionBottom from "./NavegacionBottom.svelte";
    import NavegacionTop from "./NavegacionTop.svelte";
    let { children } = $props();
    //class="min-h-screen dark:bg-gradient-to-br dark:from-gray-900 dark:to-gray-800"
</script>

<NavegacionTop />

<div class="min-h-screen bg-background pb-20">
    <main class="pt-16">
        {@render children()}
    </main>
</div>

<NavegacionBottom />
