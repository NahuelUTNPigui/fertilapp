<script>
    import estilos from "$lib/stores/estilos";
    let {data,titulo,filtros,confiltros,prepararData,sheetname="",establecimiento=""} = $props()
    import * as XLSX from "xlsx"
    import * as ExcelJS from "exceljs"
    import * as FileSaver from 'file-saver';
    async function exportar2(){
        // Crear un nuevo libro de Excel
        const workbook = new ExcelJS.Workbook();
        
        const worksheet = workbook.addWorksheet(sheetname);
        // 1. Agregar fila de título con estilo
        const titleRow = worksheet.addRow([
            "Creciente fertil",
            establecimiento,
            new Date().toLocaleDateString(),
            sheetname
        ]);
        // Aplicar estilo a la fila de título
        titleRow.eachCell((cell) => {
            cell.fill = {
                type: 'pattern',
                pattern: 'solid',
                fgColor: { argb: 'FF4F6228' } // Verde oscuro
            };
            cell.font = {
                color: { argb: 'FFC4D79B' }, // Verde claro
                bold: true,
                size: 12
            };
            cell.alignment = { horizontal: 'center' };
        });
        // 2. Agregar los datos principales (a partir de la fila 3)
        const csvdata = data.map(prepararData);
        
        worksheet.addRows(csvdata);
        // 3. Agregar hoja de filtros si es necesario
        if (confiltros) {
            const filterWorksheet = workbook.addWorksheet('Filtros aplicados');
            filterWorksheet.addRows(filtros);
        }

        // 4. Guardar el archivo
        //await workbook.xlsx.writeFile(`${titulo.replace(/\//g, "-")}.xlsx`);
        workbook.xlsx.writeBuffer()
            .then(buffer => FileSaver.saveAs(new Blob([buffer]), `${titulo.replace(/\//g, "-")}.xlsx`))
            .catch(err => console.log('Error writing excel export', err))
    }
    function exportar(){
        let csvdata = data.map(prepararData)
        const wb = XLSX.utils.book_new();
        const ws = XLSX.utils.aoa_to_sheet([])
        ws['A1']={t:'s',v:"Creciente fertil ",s:{}}
        ws['B1']={t:'s',v:establecimiento,s:{}}
        ws['C1']={t:'s',v:new Date().toLocaleDateString(),s:{}}
        ws['D1']={t:'s',v:sheetname,s:{}}
        //const range = XLSX.utils.decode_range('A1:K1');
        //ws['!merges'] = [{ s: { r: range.s.r, c: range.s.c }, e: { r: range.e.r, c: range.e.c } }];
        XLSX.utils.sheet_add_json(ws, csvdata, { origin: 'A3' });
        XLSX.utils.book_append_sheet(wb, ws, sheetname);
        if(confiltros){
            const wsFilter = XLSX.utils.aoa_to_sheet(filtros)
            XLSX.utils.book_append_sheet(wb, wsFilter, 'Filtros aplicados');
        }
        XLSX.writeFile(wb, `${titulo.replace(/\//g, "-")}.xlsx`, { cellStyles: true });
        
    }
</script>
<button
    onclick={exportar}
    class={`
        bg-transparent border rounded-lg focus:outline-none transition-colors duration-200
        ${estilos.btnsecondary}
        rounded-full
        px-4 pt-2 pb-3
    `} 
    aria-label="Exportar"
>
    <span  class="text-xl font-semibold ">Exportar</span>
    
</button>