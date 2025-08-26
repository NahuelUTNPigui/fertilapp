export async function guardarHistorial(pb,idanimal){
    let record = await pb.collection("animales").getOne(idanimal,{expand:"cab"})
    let histo ={
        animal:idanimal,
        caravana:record.caravana,
        user:record.expand.cab.user,
        active:true,
        delete:false,
        fechanacimiento:record.fechanacimiento,
        nacimiento:record.nacimiento,
        sexo:record.sexo,
        peso:record.peso,
        lote:record.lote,
        rodeo:record.rodeo,
        categoria:record.categoria,
        prenada:record.prenada,
        rp:record.rp,
        raza:record.raza,
        color:record.color,
        cab:record.cab
    }
    await pb.collection("historialanimales").create(histo)
}