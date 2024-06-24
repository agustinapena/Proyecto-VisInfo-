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
    data = data.map(d => ({
        ...d,
        latitude: parseFloat(d.latitude),
        longitude: parseFloat(d.longitude),
        mag: parseFloat(d.mag),
        type: parseFloat(d.magType),
        depth: parseFloat(d.depth),
        time: parseFloat(d.time)
    }));

    // Definir intervalos de magnitud y tipos de magnitud
    const buttons = Array.from(document.querySelectorAll("button"));

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


    // Utilizar el método map para asignar eventos a cada botón
buttons.map(button => {
    button.addEventListener("click", () => {
        const filter = button.textContent;
        filterBars(filter);
    });
});
function filterBars(filter) {
    const bars = Array.from(document.querySelectorAll(".bar"));
    const texts = Array.from(document.querySelectorAll(".bar-text"));

    if (filter === "Limpiar filtro") {
        bars.map(bar => {
            d3.select(bar)
                .style("display", "block")
                .transition()
                .duration(500)  // Duración de la transición en milisegundos
                .style("opacity", 1);
        });
    
        texts.map(text => {
            d3.select(text)
                .style("display", "block")
                .transition()
                .duration(500)
                .style("opacity", 1);
        });
    
        // Mostrar todos los círculos en el mapa
        d3.selectAll(".sismo-circle")
            .style("display", "block")
            .transition()
            .duration(500)
            .style("opacity", 1);
    
        const color = colors[filter];
    } else {
        const color = colors[filter];
    
        bars.filter(bar => bar.getAttribute('fill') !== color)
            .map(bar => {
                d3.select(bar)
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", function() { d3.select(this).style("display", "none"); });
            });
    
        bars.filter(bar => bar.getAttribute('fill') === color)
            .map(bar => {
                d3.select(bar)
                    .style("display", "block")
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
            });
    
        texts.filter(text => text.getAttribute('data-color') !== color)
            .map(text => {
                d3.select(text)
                    .transition()
                    .duration(500)
                    .style("opacity", 0)
                    .on("end", function() { d3.select(this).style("display", "none"); });
            });
    
        texts.filter(text => text.getAttribute('data-color') === color)
            .map(text => {
                d3.select(text)
                    .style("display", "block")
                    .transition()
                    .duration(500)
                    .style("opacity", 1);
            });
    
        // Filtrar los círculos en el mapa según el color (magnitud) seleccionado
        d3.selectAll(".sismo-circle")
            .each(function(d) {
                const circle = d3.select(this);
                if (colors[d.magType] === color) {
                    circle
                        .style("display", "block")
                        .transition()
                        .duration(500)
                        .style("opacity", 1);
                } else {
                    circle
                        .transition()
                        .duration(500)
                        .style("opacity", 0)
                        .on("end", function() { circle.style("display", "none"); });
                }
            });
    }
    
//Cuenta la cantidad de veces que se repite, este codigo se realizó con ayuda de ChatGpt
}
const frequencies = magnitudes.map(mag => {
    const [minMag, maxMag] = mag.slice(1, -1).split(',').map(parseFloat);
    const filteredData = data.filter(d => d.mag >= minMag && d.mag < maxMag);
    
    const countByType = magTypes.reduce((counts, type) => {
        counts[type] = filteredData.reduce((count, d) => {
            return d.magType === type ? count + 1 : count;
        }, 0);
        return counts;
    }, {});

    return { mag, frequencies: countByType };
});

//Visualización 1: grafico de barras agrupado 

// Escala x para los intervalos de magnitud
    const xScale = d3.scaleBand()
        .domain(magnitudes)
        .range([0, WIDTH_VIS_1 - margin.left - margin.right])
        .padding(0.2);

    // Obtener la frecuencia máxima para ajustar la escala y
    const maxY = d3.max(frequencies, d => d3.max(Object.values(d.frequencies)));

    // Escala y para la frecuencia máxima, empezando desde 0 para asegurar visibilidad de barras pequeñas
    //Codigo Clase 08 (Diapositivas)

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
        .data(d => magTypes.map(type => ({ type, count: d.frequencies[type], color: colors[type] })))
        .enter().append("rect")
        .attr("x", (d, i) => (xScale.bandwidth() / magTypes.length) * i) // Ajustar posición x de cada barra
        .attr("y", d => yScale(d.count)) // Ajustar posición y de cada barra según la frecuencia
        .attr("width", xScale.bandwidth() / magTypes.length)
        .attr("height", d => HEIGHT_VIS_1 - margin.top - margin.bottom - yScale(d.count)) // Altura de la barra basada en la escala y
        .attr("fill", d => d.color)
        .attr("class", "bar")
        .attr("data-color", d => d.color)
        .on("mouseover", function(event, d) {
            const magType = d.type;
            const intervalo = d3.select(this.parentNode).datum().mag;
            const frecuencia = d.count;

            // Actualizar el contenido de las etiquetas span en el HTML
            //Este codigo se realizó con ayuda de las diapositivas de la Clase 03 y Tarea 2 2024-1

            d3.select("#detailMag").text(magType);
            d3.select("#detailIntervalo").text(intervalo);
            d3.select("#detailFrecuencia").text(frecuencia);

            // Cambiar la opacidad de las barras no seleccionadas
            SVG1.selectAll("rect")
                .attr("opacity", function(dRect) {
                    return dRect.mag === intervalo ? 1 : 0.2; // Mantener opacidad completa solo de las barras del mismo intervalo
                });

            // Mantener la opacidad completa de la barra seleccionada
            d3.select(this)
                .attr("opacity", 1);

            // Cambiar la opacidad de los textos correspondientes
            intervalGroups.selectAll("text")
                .attr("opacity", function(dText) {
                    return dText.type === magType && d3.select(this.parentNode).datum().mag === intervalo ? 1 : 0.2;
                });
        })
        .on("mouseout", function(event, d) {
            // Restaurar la opacidad original de todas las barras y textos al quitar el mouse
            SVG1.selectAll("rect")
                .attr("opacity", 1);
            intervalGroups.selectAll("text")
                .attr("opacity", 1);

            // Limpiar el contenido de las etiquetas span
            d3.select("#detailMag").text("");
            d3.select("#detailIntervalo").text("");
            d3.select("#detailFrecuencia").text("");
        });

    // Agregar etiquetas de valor encima de las barras
    intervalGroups.selectAll("text")
        .data(d => magTypes.map(type => ({ type, count: d.frequencies[type], color: colors[type] })))
        .enter().append("text")
        .attr("x", (d, i) => (xScale.bandwidth() / magTypes.length) * i + (xScale.bandwidth() / magTypes.length) / 2) // Centrar el texto en la barra
        .attr("y", d => yScale(d.count) - 5) // Posicionar el texto justo encima de la barra
        .attr("text-anchor", "middle")
        .style("font-size", "12px")
        .style("font-family", "Lato, sans-serif") // Cambia la familia de fuentes
        .style("fill", "gray")
        .attr("class", "bar-text")
        .attr("data-color", d => d.color)
        .text(d => d.count);




    
        

// Visualización 2 - Mapa
    const WIDTH_VIS_2 = 1000;
    const HEIGHT_VIS_2 = 500;

    const SVG2 = d3.select("#vis-2").append("svg")
        .attr("width", WIDTH_VIS_2)
        .attr("height", HEIGHT_VIS_2)

    const mapGroup = SVG2.append("g");

    const projection = d3.geoNaturalEarth1()
        .translate([WIDTH_VIS_2 / 2, HEIGHT_VIS_2 / 2])
        .scale(WIDTH_VIS_2 / 5.8);

    const path = d3.geoPath().projection(projection);

    d3.json("https://d3js.org/world-110m.v1.json").then(world => {
        mapGroup.append("path")
            .datum(topojson.feature(world, world.objects.countries))
            .attr("d", path)
            .attr("fill", "#e0e0e0")
            .attr("stroke", "#ffffff");
    
    const sismosGroup = mapGroup.append("g");

    const radiusScale = d3.scaleSqrt() // Escala de raíz cuadrada para el tamaño del círculo, la decisión fue con el objetivo de tener una escala más proporcional al tamaño del mapa
        .domain([d3.min(data, d => d.mag), d3.max(data, d => d.mag)]) // Dominio de magnitudes
        .range([1, 5]); // Rango de tamaños de radio

    // Añadir sismos al mapa
    sismosGroup.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => projection([d.longitude, d.latitude])[0])
        .attr("cy", d => projection([d.longitude, d.latitude])[1])
        .attr("r", d => radiusScale(d.mag)) // Utilizar la escala de radio para el tamaño del círculo
        .attr("fill", d => colors[d.magType])
        .attr("opacity", 0.7)
        .attr("class", "sismo-circle")
        .on("mouseover", function(event, d) {
            // Mostrar tooltip al pasar el mouse sobre el círculo
            showTooltip(event, d);

            // Opacar todos los círculos excepto el seleccionado
            d3.selectAll(".sismo-circle")
                .attr("opacity", 0.2);
            d3.select(this)
                .attr("opacity", 1);
        })
        .on("mouseout", function() {
            // Ocultar tooltip al quitar el mouse del círculo
            hideTooltip();
            d3.selectAll(".sismo-circle")
                .attr("opacity", 1);
        });
        //.append("title") // Tooltip con la información del sismo
        //.text(d => `Lugar: ${d.place}\nMagnitud: ${d.mag}\nProfundidad: ${d.depth}\nTipo de Magnitud: ${d.magType}`);

        // Función para mostrar el tooltip
        function showTooltip(event, d) {
            const tooltip = d3.select("#vis-2").append("div")
                .attr("class", "tooltip")
                .style("left", (event.pageX + 10) + "px")
                .style("top", (event.pageY - 10) + "px")
                .html(`
                    <strong>Epicentro:</strong> ${d.place}<br>
                    <strong>Magnitud:</strong> ${d.mag}<br>
                    <strong>Profundidad:</strong> ${d.depth}<br>
                    <strong>Tipo de Magnitud:</strong> ${d.magType}
                `);
            tooltip.transition()
                .duration(200)
                .style("display", "block");
        }
        
        // Función para ocultar el tooltip
        function hideTooltip() {
            d3.select(".tooltip").remove();
        }
    });


    // Añadir zoom y pan al mapa
    //Este mapa fue realizado con ayuda de ChatGpt y StackOverflow
    SVG2.call(d3.zoom()
        .scaleExtent([1, 8])
        .on("zoom", function(event) {
            const { transform } = event;
    
            // Asegurar que el mapa no desaparezca fuera del contenedor SVG
            const newScale = transform.k;
            const xLimit = Math.min(0, WIDTH_VIS_2 - WIDTH_VIS_2 * newScale);  // Límite horizontal
            const yLimit = Math.min(0, HEIGHT_VIS_2 - HEIGHT_VIS_2 * newScale);  // Límite vertical
            
            // Ajustar el transformador solo si está dentro de los límites
            transform.x = Math.max(xLimit, Math.min(0, transform.x));
            transform.y = Math.max(yLimit, Math.min(0, transform.y));
    
            // Aplicar el transformador actualizado al grupo del mapa
            mapGroup.attr("transform", transform);
            mapGroup.attr("stroke-width", 1 / newScale);
        }));
    



    // Visualización 3 - Gráfico de dispersión
    const WIDTH_VIS_3 = 1000;
    const HEIGHT_VIS_3 = 500;

    const SVG3 = d3.select("#vis-3").append("svg")
        .attr("width", WIDTH_VIS_3)
        .attr("height", HEIGHT_VIS_3)
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);  

    const yScale3 = d3.scaleLinear()
        .domain([-150, 150])  // Rango de -150 a 150 para intervalos de 50
        .range([HEIGHT_VIS_3 - margin.top - margin.bottom, 0]);
    
    const yAxis3 = d3.axisLeft(yScale3)
        .tickValues([-150, -100, -50, 0, 50, 100, 150, 200, 250, 300, 350, 400, 450, 500, 550, 600, 650])  // Definir los valores de las marcas deseadas
        .tickFormat(d3.format(".0f"));  // Formato de las marcas sin decimales

    const xScale3 = d3.scaleLinear()
        .domain([0, 10])  // Rango de 0 a 10
        .range([0, WIDTH_VIS_3 - margin.left - margin.right]);
    
    const xAxis3 = d3.axisBottom(xScale3)
        .ticks(10)  // Mostrará marcas cada 1 unidad (0, 1, 2, ..., 10)
        .tickFormat(d3.format(".0f"));  // Formato de las marcas sin decimales

    xScale3.domain(d3.extent(data, d => d.mag)).nice();
    yScale3.domain(d3.extent(data, d => d.depth)).nice();

   // Crear ejes x e y con grillas y estilos
    SVG3.append("g")
        .attr("class", "x-axis")
        .attr("transform", `translate(0, ${HEIGHT_VIS_3 - margin.top - margin.bottom})`)
        .call(xAxis3)
        .selectAll(".tick line")
        .attr("stroke", "lightgray")
        .attr("stroke-dasharray", "2,2");

    SVG3.selectAll(".domain")
        .attr("stroke", "gray")
        .attr("stroke-width", "1.5");

    SVG3.append("g")
        .attr("class", "y-axis")
        .call(yAxis3)
        .selectAll(".tick line")
        .attr("stroke", "lightgray")
        .attr("stroke-dasharray", "2,2");

    SVG3.selectAll(".domain")
        .attr("stroke", "gray")
        .attr("stroke-width", "1.5");

    // Agregar etiqueta para el eje x
    SVG3.select(".x-axis")
        .append("text")
        .attr("x", (WIDTH_VIS_3 - margin.left - margin.right) / 2)
        .attr("y", 40)
        .attr("fill", "gray")
        .attr("font-size", "16px")
        .attr("font-family", "Lato, sans-serif")
        .style("text-anchor", "middle")
        .text("Magnitud");
        
    // Agregar etiqueta para el eje y
    SVG3.select(".y-axis")
        .append("text")
        .attr("transform", "rotate(-90)")
        .attr("y", 0 - margin.left)
        .attr("x", 0 - (HEIGHT_VIS_3 / 2))
        .attr("dy", "1em")
        .style("text-anchor", "middle")
        .style("font-size", "16px")
        .style("font-family", "Lato, sans-serif")
        .style("fill", "gray")
        .text("Profundidad");

// Dentro de la sección de código para crear el gráfico de dispersión (vis-3)
//Selecciona todos los circulos (Ayuda de stackoverflow.com)

    const circles = SVG3.selectAll("circle")
        .data(data)
        .enter().append("circle")
        .attr("cx", d => xScale3(d.mag))
        .attr("cy", d => yScale3(d.depth))
        .attr("r", 5)
        .attr("fill", d => colors[d.magType])
        .attr("opacity", 0.7)
        .attr("class", "sismo-circulo")
        .on("mouseover", function(event, d) {
            showTooltip3(event, d);
            
            // Opacar todos los círculos excepto el seleccionado
            d3.selectAll(".sismo-circulo")
                .attr("opacity", 0.2);
            d3.select(this)
                .attr("opacity", 1);
        })
        .on("mouseout", function() {
            hideTooltip3();
            d3.selectAll(".sismo-circulo")
                .attr("opacity", 1);
        });

    function showTooltip3(event, d) {
        const tooltip = d3.select("#vis-3").append("div")
            .attr("class", "tooltip")
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 10) + "px")
            .html(`
                <strong>Epicentro:</strong> ${d.place}<br>
                <strong>Magnitud:</strong> ${d.mag}<br>
                <strong>Profundidad:</strong> ${d.depth}<br>
                <strong>Tipo de Magnitud:</strong> ${d.magType}
            `);
        tooltip.transition()
            .duration(200)
            .style("display", "block");
    }

    function hideTooltip3() {
        d3.select(".tooltip").remove();
    }

    function actualizarDispersion(magnitudeType) {
        let filteredData;
        if (magnitudeType.includes("limpiar")) {
            filteredData = data;
        } else {
            filteredData = data.filter(d => magnitudeType.includes(d.magType));
        }
    
        xScale3.domain(d3.extent(filteredData, d => d.mag)).nice();
        yScale3.domain(d3.extent(filteredData, d => d.depth)).nice();
    
        SVG3.select(".x-axis")
            .call(xAxis3);
    
        SVG3.select(".y-axis")
            .call(yAxis3);
    
        const circulos = SVG3.selectAll(".sismo-circulo")
            .data(filteredData, d => d.id);
    
        circulos.exit()
            .transition()
            .duration(500)
            .attr("opacity", 0)
            .remove();
    
        circulos.enter().append("circle")
            .attr("cx", d => xScale3(d.mag))
            .attr("cy", d => yScale3(d.depth))
            .attr("r", 5)
            .attr("fill", d => colors[d.magType])
            .attr("class", "sismo-circulo")
            .attr("opacity", 0) // Inicialmente invisible
            .merge(circulos)
            .on("mouseover", function(event, d) {
                showTooltip3(event, d);
                
                // Opacar todos los círculos excepto el seleccionado
                d3.selectAll(".sismo-circulo")
                    .attr("opacity", 0.2);
                d3.select(this)
                    .attr("opacity", 1);
            })
            .on("mouseout", function() {
                hideTooltip3();
                d3.selectAll(".sismo-circulo")
                    .attr("opacity", 1);
            })
            .transition()
            .duration(500)
            .attr("cx", d => xScale3(d.mag))
            .attr("cy", d => yScale3(d.depth))
            .attr("fill", d => colors[d.magType])
            .attr("opacity", 1) // Transición de entrada
    }
        
    // Asignar eventos de clic a los botones de magnitud
    d3.select("#btn1").on("click", () => actualizarDispersion(["md"]));
    d3.select("#btn2").on("click", () => actualizarDispersion(["mwr"]));
    d3.select("#btn3").on("click", () => actualizarDispersion(["mw"]));
    d3.select("#btn4").on("click", () => actualizarDispersion(["ml"]));
    d3.select("#btn5").on("click", () => actualizarDispersion(["mb"]));
    d3.select("#btn6").on("click", () => actualizarDispersion(["mww"]));
    d3.select("#btn7").on("click", () => actualizarDispersion(["mb_lg"]));
    d3.select("#btn8").on("click", () => actualizarDispersion(["limpiar"]));

}).catch(error => {
    console.error('Error cargando los datos:', error);
});

