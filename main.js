const SISMOS = "https://raw.githubusercontent.com/agustinapena/Proyecto-VisInfo-/main/2020-nov-01%20to%202020-nov-28.xlsx%20-%20Hoja%201.csv?token=GHSAT0AAAAAACTVTDUJWFQWHML247UT6ILSZTN66KQ";

// Tamaños del SVG y márgenes
const WIDTH_VIS_1 = 1000;
const HEIGHT_VIS_1 = 500;
const margin = { top: 50, right: 50, bottom: 50, left: 50 };

// Seleccionar el div vis-1 y crear el SVG dentro de él
const SVG1 = d3.select("#vis-1").append("svg")
    .attr("width", WIDTH_VIS_1)
    .attr("height", HEIGHT_VIS_1)
  .append("g")
    .attr("transform", `translate(${margin.left}, ${margin.top})`);

// Cargar datos desde el archivo CSV
d3.csv(SISMOS).then(data => {
    // Definir intervalos de magnitud y tipos de magnitud
    const magnitudes = ["[2.5,3.7)", "[3.7,4.9)", "[4.9,6.1]"];
    const magTypes = ['md', 'mb_lg', 'ml', 'mwr', 'mw', 'mww', 'mb'];
    const colors = {
        'md': 'rgb(177, 238, 147)',
        'mb_lg': 'rgb(243, 104, 104)',
        'ml': 'rgb(255, 242, 159)',
        'mwr': 'rgb(252, 171, 121)',
        'mw': 'rgb(142, 127, 112)',
        'mww': 'rgb(140, 132, 203)',
        'mb': 'rgb(136, 195, 204)'
    };

    // Filtrar y contar datos por intervalo de magnitud y tipo de magnitud
    const frequencies = magnitudes.map(mag => {
        const filteredData = data.filter(d => parseFloat(d.mag) >= parseFloat(mag.split(',')[0]) && parseFloat(d.mag) < parseFloat(mag.split(',')[1]));
        const countByType = {};
        magTypes.forEach(type => {
            countByType[type] = filteredData.filter(d => d.magType === type).length;
        });
        return { mag, frequencies: countByType };
    });

    // Escala x para los intervalos de magnitud
    const xScale = d3.scaleBand()
        .domain(magnitudes)
        .range([0, WIDTH_VIS_1 - margin.left - margin.right])
        .padding(0.2);

    // Obtener la frecuencia máxima para ajustar la escala y
    const maxY = d3.max(frequencies, d => d3.max(Object.values(d.frequencies)));

    // Escala y para la frecuencia máxima
    const yScale = d3.scaleLinear()
        .domain([0, maxY])
        .nice() // Ajusta los límites del eje y para que las grillas se ajusten mejor
        .range([HEIGHT_VIS_1 - margin.top - margin.bottom, 0]);

    // Crear ejes x e y con grillas
    SVG1.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${HEIGHT_VIS_1 - margin.top - margin.bottom})`)
        .call(d3.axisBottom(xScale))
      .append("text") // Agregar texto para la etiqueta del eje x
        .attr("x", (WIDTH_VIS_1 - margin.left - margin.right) / 2)
        .attr("y", 40) // Ajustar la posición vertical del texto
        .attr("fill", "gray")
        .attr("font-size", "16px")
        .attr("font-family", "Lato, sans-serif")
        .style("text-anchor", "middle")
        .text("Intervalos de Magnitud");

    SVG1.append("g")
        .attr("class", "y-axis")
        .call(d3.axisLeft(yScale).ticks(5).tickSizeInner(-WIDTH_VIS_1 + margin.left + margin.right)) // Determina el número de ticks en el eje y y activa las grillas
      .append("text") // Agregar texto para la etiqueta del eje y
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (HEIGHT_VIS_1 / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-family", "Lato, sans-serif")
        .style("fill", "gray") // Cambiar color del texto del eje y a gris
        .text("Frecuencia");

    // Estilo de los textos del eje x
    SVG1.selectAll(".x-axis text")
        .style("font-size", "16px")
        .style("font-family", "Lato, sans-serif")
        .style("fill", "gray"); // Cambiar color del texto del eje x a gris

    // Estilo de las líneas de los ejes y grillas
    SVG1.selectAll(".tick line")
        .attr("stroke", "lightgray")
        .attr("stroke-dasharray", "2,2");

    // Estilo de la línea del eje x
    SVG1.selectAll(".domain")
        .attr("stroke", "gray") // Cambiar color de la línea del eje x a gris
        .attr("stroke-width", "1.5");

    // Estilo de la línea del eje y
    SVG1.selectAll(".y-axis .domain")
        .attr("stroke", "gray") // Cambiar color de la línea del eje y a gris
        .attr("stroke-width", "1.5");

    // Título del gráfico
    SVG1.append("text")
        .attr("x", (WIDTH_VIS_1 / 2) - 50)
        .attr("y", 0 - (margin.top / 2))
        .attr("text-anchor", "middle")
        .style("font-size", "16px")
        .text("Magnitudes y frecuencias de sismos")
        .style("font-family", "Lato, sans-serif") // Cambia la familia de fuentes
        .style("fill", "#7596e3");

    // Crear grupos para cada intervalo de magnitud
    const intervalGroups = SVG1.selectAll(".interval")
        .data(frequencies)
        .enter().append("g")
        .attr("class", "interval")
        .attr("transform", d => `translate(${xScale(d.mag)}, 0)`);

    // Crear las barras dentro de cada grupo de intervalo
    intervalGroups.selectAll("rect")
        .data(d => magTypes.map(type => ({ type, count: d.frequencies[type] })))
        .enter().append("rect")
        .attr("x", (d, i) => xScale.bandwidth() / 7 * i) // Ajustar posición x de cada barra
        .attr("y", d => yScale(d.count)) // Ajustar posición y de cada barra según la frecuencia
        .attr("width", xScale.bandwidth() / 7)
        .attr("height", d => HEIGHT_VIS_1 - margin.top - margin.bottom - yScale(d.count))
        .attr("fill", d => colors[d.type]);

}).catch(error => {
    console.error('Error cargando los datos:', error);
});
