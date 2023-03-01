const FRAME_HEIGHT = 400;
const FRAME_WIDTH = window.innerWidth * 0.33;
const MARGINS = { left: 50, right: 50, top: 50, bottom: 50 };

const VIS_HEIGHT = FRAME_HEIGHT - MARGINS.top - MARGINS.bottom;
const VIS_WIDTH = FRAME_WIDTH - MARGINS.left - MARGINS.right;

let HIGHLIGHTED_ELEMENTS = [];

const SPECIES_COLOR = {
  setosa: "red",
  versicolor: "blue",
  virginica: "green",
};

const FRAME1 = d3
  .select("#length-scatter")
  .append("svg")
  .attr("height", FRAME_HEIGHT)
  .attr("width", FRAME_WIDTH)
  .attr("class", "frame");

const FRAME2 = d3
  .select("#width-scatter")
  .append("svg")
  .attr("height", FRAME_HEIGHT)
  .attr("width", FRAME_WIDTH)
  .attr("class", "frame");

const FRAME3 = d3
  .select("#iris-count")
  .append("svg")
  .attr("height", FRAME_HEIGHT)
  .attr("width", FRAME_WIDTH)
  .attr("class", "frame");

d3.csv("data/iris.csv").then((data) => {
  const MAX_PETAL_LENGTH = d3.max(data, (d) => parseInt(d["Sepal_Length"]));
  const X_SCALE_PETAL_LENGTH = d3
    .scaleLinear()
    .domain([0, MAX_PETAL_LENGTH + 1])
    .range([0, VIS_WIDTH]);

  const MAX_SEPAL_LENGTH = d3.max(data, (d) => parseInt(d["Petal_Length"]));
  const Y_SCALE_SEPAL_LENGTH = d3
    .scaleLinear()
    .domain([0, MAX_SEPAL_LENGTH + 1])
    .range([VIS_HEIGHT, 0]);

  FRAME1.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => X_SCALE_PETAL_LENGTH(d["Sepal_Length"]) + MARGINS.left)
    .attr("cy", (d) => Y_SCALE_SEPAL_LENGTH(d["Petal_Length"]) + MARGINS.top)
    .attr("r", 5)
    .attr("fill", (d) => SPECIES_COLOR[d["Species"]])
    .attr("stroke-width", 3)
    .attr("opacity", 0.5)
    .attr("id", (d) => `length-${d.id}`);

  FRAME1.append("g")
    .attr("transform", `translate(${MARGINS.left},${VIS_HEIGHT + MARGINS.top})`)
    .call(d3.axisBottom(X_SCALE_PETAL_LENGTH).ticks(10))
    .attr("font-size", "20px");

  FRAME1.append("g")
    .attr("transform", `translate(${MARGINS.left},${MARGINS.top})`)
    .call(d3.axisLeft(Y_SCALE_SEPAL_LENGTH).ticks(10))
    .attr("font-size", "20px");

  FRAME1.append("text")
    .attr("x", VIS_WIDTH / 2)
    .attr("y", MARGINS.top - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Petal Length vs Sepal Length");

  const MAX_PETAL_WIDTH = d3.max(data, (d) => parseInt(d["Sepal_Width"]));
  const X_SCALE_PETAL_WIDTH = d3
    .scaleLinear()
    .domain([0, MAX_PETAL_WIDTH + 1])
    .range([0, VIS_WIDTH]);

  const MAX_SEPAL_WIDTH = d3.max(data, (d) => parseInt(d["Petal_Width"]));
  const Y_SCALE_SEPAL_WIDTH = d3
    .scaleLinear()
    .domain([0, MAX_SEPAL_WIDTH + 1])
    .range([VIS_HEIGHT, 0]);

  const circles = FRAME2.selectAll("circle")
    .data(data)
    .enter()
    .append("circle")
    .attr("cx", (d) => X_SCALE_PETAL_WIDTH(d["Sepal_Width"]) + MARGINS.left)
    .attr("cy", (d) => Y_SCALE_SEPAL_WIDTH(d["Petal_Width"]) + MARGINS.top)
    .attr("r", 5)
    .attr("fill", (d) => SPECIES_COLOR[d["Species"]])
    .attr("stroke-width", 3)
    .attr("opacity", 0.5);

  FRAME2.append("text")
    .attr("x", VIS_WIDTH / 2)
    .attr("y", MARGINS.top - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Petal Width vs Sepal Width")
    .attr("fill", "black");

  FRAME2.append("g")
    .attr("transform", `translate(${MARGINS.left},${VIS_HEIGHT + MARGINS.top})`)
    .call(d3.axisBottom(X_SCALE_PETAL_WIDTH).ticks(10))
    .attr("font-size", "20px");

  FRAME2.append("g")
    .attr("transform", `translate(${MARGINS.left},${MARGINS.top})`)
    .call(d3.axisLeft(Y_SCALE_SEPAL_WIDTH).ticks(10))
    .attr("font-size", "20px");

  FRAME2.call(
    d3
      .brush() // Add the brush feature using the d3.brush function
      .extent([
        [MARGINS.left, MARGINS.top],
        [FRAME_WIDTH - MARGINS.left, FRAME_HEIGHT - MARGINS.top],
      ]) // initialise the brush area: start at 0,0 and finishes at width,height: it means I select the whole graph area
      .on("start brush", updateChart) // Each time the brush selection changes, trigger the 'updateChart' function
  );

  let extent = undefined;
  function updateChart(event) {
    extent = event.selection;
    let highlightSpecies = {
      setosa: false,
      versicolor: false,
      virginica: false,
    };
    circles.classed("selected", function (d) {
      const brushed = isBrushed(
        extent,
        X_SCALE_PETAL_WIDTH(d["Sepal_Width"]) + MARGINS.left,
        Y_SCALE_SEPAL_WIDTH(d["Petal_Width"]) + MARGINS.top
      );
      d3.select(`#length-${d.id}`).attr("class", brushed ? "selected" : null);
      highlightSpecies[d["Species"]] =
        highlightSpecies[d["Species"]] || brushed;

      return brushed;
    });
    Object.entries(highlightSpecies).forEach(([k, brushed]) => {
      if (brushed) {
        d3.select(`#bar-${k}`).attr("class", "selected");
      } else {
        d3.select(`#bar-${k}`).attr("class", null);
      }
    });
  }
  // A function that return TRUE or FALSE according if a dot is in the selection or not
  function isBrushed(brush_coords, cx, cy) {
    let x0 = brush_coords[0][0];
    let x1 = brush_coords[1][0];
    let y0 = brush_coords[0][1];
    let y1 = brush_coords[1][1];
    return x0 <= cx && cx <= x1 && y0 <= cy && cy <= y1; // This return TRUE or FALSE depending on if the points is in the selected area
  }

  const X_SCALE_SPECIES = d3
    .scaleBand()
    .domain(data.map((row) => row["Species"]))
    .range([0, VIS_WIDTH])
    .padding(0.5);

  const SPECIES_COUNT = [
    { species: "setosa", count: 50 },
    { species: "versicolor", count: 50 },
    { species: "virginica", count: 50 },
  ];

  const MAX_IRIS_COUNT = 50;
  const Y_SCALE_IRIS_COUNT = d3
    .scaleLinear()
    .domain([0, MAX_IRIS_COUNT])
    .range([VIS_HEIGHT, 0]);

  FRAME3.selectAll("rect")
    .data(SPECIES_COUNT)
    .enter()
    .append("rect")
    .attr("class", "bar")
    .attr("x", (d) => X_SCALE_SPECIES(d.species) + MARGINS.left)
    .attr("y", (d) => Y_SCALE_IRIS_COUNT(d.count) + MARGINS.top)
    .attr("width", X_SCALE_SPECIES.bandwidth())
    .attr("height", (d) => VIS_HEIGHT - Y_SCALE_IRIS_COUNT(d.count))
    .attr("fill", (d) => SPECIES_COLOR[d.species])
    .attr("opacity", 0.5)
    .attr("id", (d) => `bar-${d.species}`);

  FRAME3.append("g")
    .attr("transform", `translate(${MARGINS.left},${VIS_HEIGHT + MARGINS.top})`)
    .call(d3.axisBottom(X_SCALE_SPECIES).ticks(10))
    .attr("font-size", "20px");

  FRAME3.append("g")
    .attr("transform", `translate(${MARGINS.left},${MARGINS.top})`)
    .call(d3.axisLeft(Y_SCALE_IRIS_COUNT).ticks(10))
    .attr("font-size", "20px");

  FRAME3.append("text")
    .attr("x", VIS_WIDTH / 2)
    .attr("y", MARGINS.top - 10)
    .attr("text-anchor", "middle")
    .style("font-size", "16px")
    .style("text-decoration", "underline")
    .text("Iris Count");
});
