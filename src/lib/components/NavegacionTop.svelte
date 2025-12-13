<script>
    import Oscuro from "./Oscuro.svelte";
</script>

<header
    class="fixed top-0 left-0 right-0 z-50 bg-primary text-primary-foreground"
>
    <div class="flex items-center justify-between px-4 h-16">
        <div class="flex items-center gap-3">
            <div>
                <h1 class="font-semibold text-lg">Granja Digital</h1>
                <p class="text-xs text-primary-foreground/80">
                    Panel de control
                </p>
            </div>
        </div>

        <div class="flex items-center gap-2">
            <Oscuro></Oscuro>
        </div>
    </div>
</header>
