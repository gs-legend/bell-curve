import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { empData } from "./assets/TestData";
import "./assets/styles.css";

function probabilityDensityCalculation(x, mean, variance) {
  var m = Math.sqrt(2 * Math.PI * variance);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e / m;
};

function BellCurve() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const colors = ["#be280c", "#c0a92c", "#105526", "#034aea", "#1502cf"];

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const tooltip = d3.select(".tooltip");

    const width = 1200, height = 500;
    const margin = { top: 20, right: 20, bottom: 60, left: 40 };
    const chartWidth = width + margin.left + margin.right;
    const chartHeight = height + margin.top + margin.bottom;
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const plot = svg.attr("width", chartWidth)
      .attr("height", chartHeight)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const mean = d3.mean(empData.map(d => d.rating));
    const deviation = d3.deviation(empData.map(d => d.rating)) as number;
    // const mean = 0, deviation = 1;
    const categoryRank = {
      'C': 1,
      'B': 2,
      'B+': 3,
      'A': 4,
      'A+': 5
    }
    const grouped_data = d3.group(empData.sort((x, y) => {
      return categoryRank[x.category] - categoryRank[y.category]
    }), d => d.category);

    const normalData = [];
    for (let i = mean - (3 * deviation); i < mean + (3 * deviation); i += 0.02) {
      normalData.push({ x: i, y: probabilityDensityCalculation(i, mean, deviation) });
    }
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    const xNormal = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(normalData, function (d) { return d.x; }));

    const yNormal = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(normalData, function (d) { return d.y; }));

    let usedCount = 0;
    let index = 0;
    let prevPercent = 0;
    let usedPercent = 0;
    const xAxisLables = [];

    grouped_data.forEach((data, key) => {
      const percent = (data.length * 100) / empData.length;
      const numOfElementsToSlice = Math.round((percent / 100) * (normalData.length));
      let percent_idealData = normalData.slice(usedCount, usedCount + numOfElementsToSlice - 2);
      usedCount += numOfElementsToSlice;
      xAxisLables.push({ key, percent });
      const groupData = { data: percent_idealData, key, percent }

      const percentGroup = plot.append("g");
      percentGroup
        .attr("class", "group_data " + key)
        .data([groupData])
        .append("path")
        .datum(groupData.data)
        .attr("fill", colors[index++])
        .attr("d", d3.area()
          .curve(d3.curveLinear)
          .x((d: any) => xNormal(d.x))
          .y0(y(0))
          .y1((d: any) => yNormal(d.y))
        )

      prevPercent = percent;
      usedPercent += percent;
    });

    let _prevPercent = 0;

    plot.selectAll("g.group_data").each((d1, i, _self) => {
      const d = _self[i];
      const data: any = d3.select(d).data()[0];
      const path = d3.select(d).select('path');
      let pos = width * ((data.percent * 0.5) + _prevPercent) / 100;

      d3.select(d)
        .append("text")
        .attr("class", "group_data_label")
        .attr("text-anchor", "center")
        .attr("fill", "steelblue")
        .attr("y", height + 40)
        .attr("dy", "1em")
        .attr("x", pos + "px")
        .style("font-size", "20px")
        .attr("transform", "translate(0,0)")
        .text(data.key)

      d3.select(d)
        .append("text")
        .attr("class", "group_data_label")
        .attr("text-anchor", "center")
        .attr("fill", "black")
        .attr("y", yNormal(data.data[data.data.length - 1].y) - 75)
        .attr("dy", "1em")
        .attr("x", pos + "px")
        .style("font-size", "20px")
        .attr("transform", "translate(0,0)")
        .text(data.percent + "%")
      _prevPercent += data.percent;

      const toolTipContent = `
        <div class="tooltip-content">
          <span class="categroy">Category ${data.key} </span>
          <span class="percent">${data.percent} % </span>
        </div>`;

      path.style('opacity', 0.8);
      path.on("mouseover", function (event, d2) {
        path.style('opacity', 1);
        tooltip.transition()
          .duration(200)
          .style("opacity", .9);
        tooltip.html(toolTipContent)
          .style("left", (event.pageX) + "px")
          .style("top", (event.pageY - 100) + "px");
      })
        .on("mouseout", function (d2) {
          path.style('opacity', 0.8);
          tooltip.transition()
            .duration(500)
            .style("opacity", 0)
            .style("left", 0)
            .style("top", 0);
        });
    })

    const xAxis = d3.axisBottom(xNormal).ticks(0);
    const yAxis = d3.axisLeft(yNormal).ticks(0);

    plot.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis)
      .append("text")
      .attr("class", "x label")
      .attr("text-anchor", "center")
      .attr("fill", "steelblue")
      .style("font-size", "20px")
      .attr("transform", "translate(" + width / 2 + ",25)")
      .text("Normal Company Wide Ratings")

    plot.append('g')
      .attr('class', 'axis y-axis')
      .call(yAxis)
      .append("text")
      .attr("class", "y label")
      .attr("text-anchor", "center")
      .attr("fill", "steelblue")
      .style("font-size", "20px")
      .attr("transform", "translate(-10, " + (height - 160) / 2 + ") rotate(-90)")
      .text("No of Employees")
  }, []);

  return <>
    <svg ref={svgRef}></svg>
    <div className="tooltip" style={{ 'opacity': '0' }}></div>
  </>
}

export default BellCurve