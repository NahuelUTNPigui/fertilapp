export async function guardarHistorialTacto(pb,idanimal,prenada){
    let record = await pb.collection("animales").getOne(idanimal)
    record.prenada = prenada
    await pb.collection("historialanimales").create(record)
}