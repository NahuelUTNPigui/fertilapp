<script>
    import PocketBase from 'pocketbase'
    import Navbarr from "$lib/components/Navbarr.svelte";
    import { nuevonivel } from "$lib/stores/nuevonivel";
    import { goto } from "$app/navigation";
    import Swal from 'sweetalert2';
    let ruta = import.meta.env.VITE_RUTA

    const pb = new PocketBase(ruta);
    let pre = import.meta.env.VITE_PRE

    async function guardarNivel(p_nivel) {
        
        let pb_json = JSON.parse(localStorage.getItem('pocketbase_auth'))
        pb_json.record.nivel = p_nivel
        let usuarioid = pb_json.record.id
        localStorage.setItem('pocketbase_auth',JSON.stringify(pb_json))
        try{
            let data = {
                nivel:p_nivel
            }
            const record = await pb.collection('users').update(usuarioid, data);
        }
        catch(err){
            Swal.fire("Error cambiar plan","No se pudo cambiar el plan","error")
        }
    }
    async function confirmarNivel() {
        try{
            await guardarNivel(nuevonivel.nuevonivelstate.nivel)
            nuevonivel.setNivel( 0)
            Swal.fire("Éxito nivel","Se pudo cambiar nivel","success")
            goto(pre+"/user/nivel")
        }
        catch(err){
            console.log(err)
            Swal.fire("Error nivel","No se pudo cambiar nivel","error")
        }
        
    }
</script>
<Navbarr>
    exito
    {nuevonivel.nuevonivelstate.nivel}
    <button onclick={confirmarNivel}>Confimar nivel</button>
</Navbarr>
