<script>
    import { niveles } from "$lib/stores/niveles";
    import { goto } from "$app/navigation";
    import Swal from "sweetalert2";
    import { dolar } from "$lib/stores/dolarprecio.svelte";
    import { nuevonivel } from "$lib/stores/nuevonivel";
    
    const rutampserver = import.meta.env.VITE_RUTA_MP_SERVER
    const  ISDEV = import.meta.env.VITE_DEV == "si"
    
    let {
        nivel ,
        nivel_actual = $bindable(0),
        pb,
        usuarioid

    } = $props()
    
    function getNivel(p_nivel){
        let n_idx = niveles.findIndex(n=>n.nivel == p_nivel)
        if(n_idx != -1){
            return niveles[n_idx]
        }
        else{
            return niveles[0]
        }
    }
    async function guardarNivel(p_nivel) {
        
        let pb_json = JSON.parse(localStorage.getItem('pocketbase_auth'))
        pb_json.record.nivel = p_nivel
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
    async function cambiarPlan(p_nivel){
        Swal.fire({
            title: 'Cambiar plan',
            text: `¿Seguro que deseas cambiar de plan?`,
            icon: 'warning',
            showCancelButton: true,
            confirmButtonText: 'Si',
            cancelButtonText: 'No'
        }).then(async result=>{

            if(result.value){
                await pagar(p_nivel)    
            }
        })
    }
    
    async function pagar(p_nivel) {
        if(p_nivel == 0){
            Swal.fire("Plan básico","El plan básico es gratuito","info")
            await guardarNivel(p_nivel)
            nivel_actual = p_nivel
            
        }
        else{
            await guardarNivel(p_nivel)
            nivel_actual = p_nivel
            //onclickmp(p_nivel)
            return 
            let n = getNivel(p_nivel)
            let body =  {
                user:usuarioid,
                nivel:p_nivel,
                title: n.nombre,
                quantity: 1,
                unit_price: n.precio * dolar.dolarstate.precio
            }
            if(ISDEV){
                body.unit_price = 1
                
            }
            try{
                
                let res = await fetch(`${rutampserver}`,{
                    method: "POST",
                    headers: {
                        "Content-Type": "application/json",
                    },
                    body: JSON.stringify(body),
                })
                console.log("lego del fetch d el fethc")
                let data = await res.json() 
                console.log("data")
                console.log(JSON.stringify(data))
                console.log(JSON.stringify(data.init_point  ))
                //nuevonivel.setNivel(p_nivel)
                window.location.href = data.init_point
            }
            catch(err){

                console.error(JSON.stringify(err,null,2))
            }
            
        }
        
    }
</script>
<button 
    class="
        w-full mt-6 font-medium py-3 
        rounded-lg 
        bg-green-100 text-green-600 hover:bg-green-200
        dark:bg-green-700 dark:text-white dark:hover:bg-green-600
    "
    onclick={async ()=>await cambiarPlan(nivel)}
>
    Elige nivel {nivel}
</button>



