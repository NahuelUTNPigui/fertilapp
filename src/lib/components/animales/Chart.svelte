<script>
    import Chart from "chart.js/auto";
    import { onMount } from "svelte";
    import estilos from "$lib/stores/estilos";
    import { capitalize } from "$lib/stringutil/lib";

    let { historicorows, elegir } = $props();

    let ctx = $state(null);
    let canvas = $state(null);
    let chart = $state(null);
    let metrica = $state("cantidad");
    let canvasRef = $state(null);

    let colorIndex = $state(0);
    const coloresBase = [
        "#FF6384",
        "#36A2EB",
        "#FFCE56",
        "#4BC0C0",
        "#9966FF",
        "#FF9F40",
    ];
    const labels = {
        cantidad: "Cantidad",
        peso: "Peso total (kg)",
        promedio: "Peso promedio (kg)",
    };

    function createChart() {
        ctx = canvasRef.getContext("2d");
        if (chart) {
            chart.destroy();
        }

        let data = historicorows.map((h) => ({
            x: h.fecha,
            y: h[metrica],
        }));

        let dataset = {
            label: elegir,
            data,
            borderColor: "#FF6384",
            backgroundColor: "#FF6384" + "40",
            fill: false,
            tension: 0.3,
        };

        let datasets = [dataset];

        chart = new Chart(ctx, {
            type: "bar",
            data: { datasets },
            options: {
                responsive: true,
                maintainAspectRatio: false,
                layout: {
                    padding: {
                        left: 10,
                        right: 10,
                        top: 10,
                        bottom: 10,
                    },
                },
                plugins: {
                    legend: {
                        display: true,
                        labels: {
                            color: "#cbd5e1",
                            font: {
                                size: 14, // 👈 Tamaño de letra de la leyenda
                                weight: 'bold'
                            }
                        },
                    },
                    tooltip: {
                        callbacks: {
                            label: (context) => {
                                return `${labels[metrica]}: ${context.parsed.y.toFixed(2)}`;
                            },
                        },
                    },
                    title: {
                        display: true,
                        text: `Evolución de ${capitalize(metrica)} para ${elegir}`, // 👈 Título del gráfico
                        color: "#ffffff", // color blanco
                        font: {
                            size: 18, // 👈 Tamaño del título
                            weight: 'bold',
                            family: 'Arial' // opcional
                        },
                        padding: {
                            top: 10,
                            bottom: 10
                        }
                    }
                },
                scales: {
                    x: {
                        type: "time",
                        time: {
                            parser: "yyyy-MM-dd",
                            tooltipFormat: "dd/MM/yyyy",
                            unit: "day",
                            displayFormats: {
                                day: "dd/MM"
                            }
                        },
                        grid: {
                            color: "rgba(255,255,255,0.1)"
                        },
                        ticks: {
                            color: "#cbd5e1",
                            font: {
                                size: 13, // 👈 Tamaño de las fechas en eje X
                                weight: 'normal'
                            },
                            maxRotation: 45,
                            minRotation: 45
                        }
                    },
                    y: {
                        beginAtZero: true,
                        title: {
                            display: true,
                            text: labels[metrica],
                            color: "#cbd5e1",
                            font: {
                                size: 14, // 👈 Tamaño del título del eje Y
                                weight: 'bold'
                            }
                        },
                        grid: {
                            color: "rgba(255,255,255,0.1)"
                        },
                        ticks: {
                            color: "#cbd5e1",
                            font: {
                                size: 13, // 👈 Tamaño de los números en eje Y
                                weight: 'normal'
                            },
                            precision: 0
                        }
                    }
                }
            },
        });
    }

    const getChartHeight = () => {
        if (typeof window !== "undefined") {
            return window.innerWidth < 640 ? 250 : 800;
        }
        return 800;
    };

    onMount(() => {
        createChart();
    });
</script>

<!-- Controles de métrica -->
<div>
    <select
        class={`
            select select-bordered w-full
            rounded-md
            focus:outline-none focus:ring-2 
            focus:ring-green-500 
            focus:border-green-500
            
            ${estilos.bgdark2}
        `}
        bind:value={metrica}
        onchange={createChart}
    >
        {#each ["cantidad", "peso", "promedio"] as opcion}
            <option value={opcion} class="rounded">{capitalize(opcion)}</option>
        {/each}
    </select>
</div>

<!-- Canvas responsive -->
<div
    style="width: 100%; height: {getChartHeight()}px; min-height: 200px;"
    class="w-full"
>
    <canvas
        bind:this={canvasRef}
        style="width: 100%; height: 100%;"
        class="w-full h-full"
    ></canvas>
</div>