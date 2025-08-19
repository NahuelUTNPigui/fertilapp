<script>
    
    import Navbarr from "$lib/components/Navbarr.svelte";
    import { nuevonivel } from "$lib/stores/nuevonivel";
    import { goto } from "$app/navigation";
    import Swal from 'sweetalert2'; 
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
    async function volverNivel() {
        nuevonivel.setNivel( 0)
        goto(pre+"/user/nivel")
        
    }
</script>
<Navbarr>
    Erorr
    {nuevonivel.nuevonivelstate.nivel}
    <button onclick={volverNivel}>VOLVER nivel</button>
</Navbarr>
