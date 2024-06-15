const SISMOS= "https://github.com/agustinapena/Proyecto-VisInfo-/blob/main/2020-nov-01%20to%202020-nov-28.xlsx%20-%20Hoja%201.csv"

d3.csv(SISMOS).then(data => {
    // Aquí puedes trabajar con tus datos
    console.log(data);



});


const SVG1 = d3.select("#vis-1").append("svg");
const SVG2 = d3.select("#vis-2").append("svg");

// Editar tamaños como estime conveniente
const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 500;

const WIDTH_VIS_2 = 800;
const HEIGHT_VIS_2 = 1600;

SVG1.attr("width", WIDTH_VIS_1).attr("height", HEIGHT_VIS_1);
SVG2.attr("width", WIDTH_VIS_2).attr("height", HEIGHT_VIS_2);



// Definir los intervalos de magnitud
const intervalos = [
    { nombre: "Primer intervalo", rango: [2.5, 3.7] },
    { nombre: "Segundo intervalo", rango: [3.7, 4.9] },
    { nombre: "Tercer intervalo", rango: [4.9, 6.1] }
];

// Definir la escala de colores para cada tipo de magType
const colorScale = d3.scaleOrdinal()
    .domain(["md", "mb_lg", "ml", "mwr", "mw", "mww", "mb"])
    .range([
        "rgb(177, 238, 147)",
        "rgb(243, 104, 104)",
        "rgb(255, 242, 159)",
        "rgb(252, 171, 121)",
        "rgb(142, 127, 112)",
        "rgb(140, 132, 203)",
        "rgb(136, 195, 204)"
    ]);




// Agrupar y contar frecuencias por intervalo y magType
const dataNested = d3.nest()
    .key(d => {
        // Determinar a qué intervalo pertenece la magnitud
        const mag = +d.mag;
        if (mag >= 2.5 && mag < 3.7) return "Primer intervalo";
        else if (mag >= 3.7 && mag < 4.9) return "Segundo intervalo";
        else if (mag >= 4.9 && mag <= 6.1) return "Tercer intervalo";
    })
    .key(d => d.magType)
    .rollup(v => v.length)
    .entries(data);

// Estructura de datos final para las barras agrupadas
const datosBarras = intervalos.map(intervalo => {
    const values = dataNested.find(d => d.key === intervalo.nombre)?.values || [];
    const total = values.reduce((acc, cur) => acc + cur.value, 0);
    return {
        intervalo: intervalo.nombre,
        valores: values.map(d => ({
            magType: d.key,
            frecuencia: d.value,
            total: total
        }))
    };
});

// Configurar dimensiones y márgenes del SVG
const margin = { top: 20, right: 20, bottom: 30, left: 40 };
const width = 800 - margin.left - margin.right;
const height = 500 - margin.top - margin.bottom;

// Crear el SVG
const svg = SVG1
    .append("svg")
    .attr("width", width + margin.left + margin.right)
    .attr("height", height + margin.top + margin.bottom)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`);

// Escala para el eje y (frecuencia)
const y = d3.scaleLinear()
    .domain([0, d3.max(datosBarras, d => d3.max(d.valores, d => d.frecuencia))])
    .range([height, 0]);

// Escala para el eje x (intervalos de magnitud)
const x0 = d3.scaleBand()
    .domain(datosBarras.map(d => d.intervalo))
    .rangeRound([0, width])
    .paddingInner(0.1);

// Escala para agrupar las barras por tipo de magType dentro de cada intervalo
const x1 = d3.scaleBand()
    .domain(["md", "mb_lg", "ml", "mwr", "mw", "mww", "mb"])
    .rangeRound([0, x0.bandwidth()])
    .padding(0.05);

// Agregar las barras agrupadas
svg.append("g")
    .selectAll("g")
    .data(datosBarras)
    .join("g")
    .attr("transform", d => `translate(${x0(d.intervalo)},0)`)
    .selectAll("rect")
    .data(d => d.valores)
    .join("rect")
    .attr("x", d => x1(d.magType))
    .attr("y", d => y(d.frecuencia))
    .attr("width", x1.bandwidth())
    .attr("height", d => height - y(d.frecuencia))
    .attr("fill", d => colorScale(d.magType));

// Agregar ejes
svg.append("g")
    .attr("class", "axis")
    .attr("transform", `translate(0,${height})`)
    .call(d3.axisBottom(x0));

svg.append("g")
    .attr("class", "axis")
    .call(d3.axisLeft(y));