import React, { useEffect, useRef, useState } from 'react'
import * as d3 from "d3";
import { empData } from "./assets/TestData";
import "./assets/styles.css";

function getProbabilityData(normalizedData, m, v) {
  var data = [];
  for (var i = 0; i < normalizedData.length; i += 1) {
    var q = normalizedData[i].rating,
      p = probabilityDensityCalculation(q, m, v),
      el = {
        x: q,
        y: p
      };
    data.push(el);
  };
  data.sort(function (x, y) { return x.x - y.x; });
  return data;
};

function probabilityDensityCalculation(x, mean, variance) {
  var m = Math.sqrt(2 * Math.PI * variance);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e / m;
};

function BellCurve() {
  const containerRef = useRef(null);

  const min = d3.min(empData, d => d.rating);
  const mean = d3.mean(empData, d => d.rating);
  const standardDeviation = d3.deviation(empData, d => d.rating);

  const series = Array.from(new Set(empData.map(d => d.category)));

  var color = d3.scaleOrdinal(d3.schemeCategory10);
  color.domain(series);
  var formatCount = d3.format(',.0f');
  var sum = d3.sum(empData, d => d.rating);
  var probability = 1 / empData.length;
  var variance = sum * probability * (1 - probability);

  useEffect(() => {
    const chartData = getProbabilityData(empData, mean, standardDeviation);
    const max = d3.max(chartData, d => d.y);

    console.log(chartData, mean, standardDeviation)
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const padding = 50;
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const svg = d3.select(containerRef.current);
    svg.selectAll("*").remove();

    var xScale = d3.scaleLinear()
      .domain([0, 5])
      .range([padding, width - padding * 2])

    var yScale = d3.scaleLinear()
      .domain([0, max])
      .range([height - padding, padding]);

    var xAxis = d3.axisBottom(xScale).scale(xScale).ticks(9)
    var yAxis = d3.axisLeft(yScale).scale(yScale).ticks(9)
    // Create the axis
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(0,' + (height - padding) + ')')
      .call(xAxis)
    svg.append('g')
      .attr('class', 'axis')
      .attr('transform', 'translate(' + padding + ',0)')
      .call(yAxis)

    var line = d3.line<{ x: number; y: number }>()
      .x(function (d) { return xScale(d.x); })
      .y(function (d) { return yScale(d.y); });

    svg.append("path")
      .attr("d", line(chartData))
      .attr("stroke", "steelblue")
      .attr("fill", "none");

  }, [containerRef.current, empData]);

  return (
    <div className="svg">
      <svg ref={containerRef} width="600" height="400"></svg>
    </div>
  )
}

export default BellCurve