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
  data.sort(function (x, y) { return x.q - y.q; });
  return data;
};

function probabilityDensityCalculation(x, mean, variance) {
  var m = Math.sqrt(2 * Math.PI * variance);
  var e = Math.exp(-Math.pow(x - mean, 2) / (2 * variance));
  return e / m;
};

function BellCurve() {
  const containerRef = useRef(null);

  // const min = d3.min(empData, d => d.rating);
  // const max = d3.max(empData, d => d.rating);
  // const mean = d3.mean(empData, d => d.rating);
  // const standardDeviation = d3.deviation(empData, d => d.rating);

  // const series = Array.from(new Set(empData.map(d => d.category)));

  // var color = d3.scaleOrdinal(d3.schemeCategory10);
  // color.domain(series);
  // var formatCount = d3.format(',.0f');
  // var sum = d3.sum(empData, d => d.rating);
  // var probability = 1 / empData.length;
  // var variance = sum * probability * (1 - probability);

  useEffect(() => {
    // const chartData = getProbabilityData(empData, mean, standardDeviation);
    const margin = { top: 20, right: 30, bottom: 30, left: 40 };
    const width = 600 - margin.left - margin.right;
    const height = 400 - margin.top - margin.bottom;
    const svg = d3.select(containerRef.current);
    svg.selectAll("*").remove();

    const x = d3.scaleLinear().domain([1, 5]).range([0, width]);
    const y = d3.scaleLinear().range([height, 0]);

    const binGenerator = d3.bin<any, number>()
      .value((d) => d.rating)
      .thresholds(x.ticks(20));

    const bins = binGenerator(empData);

    const maxY = d3.max(bins, (d) => d.length) || 0;
    y.domain([0, maxY]);

    const lineGenerator = d3.line<{ x: number; y: number }>()
      .x((d) => x(d.x))
      .y((d) => y(d.y));

   
      const gaussian = (x: number, mean: number, stdDev: number) => {
        const variance = stdDev * stdDev;
        const exponent = -((x - mean) * (x - mean)) / (2 * variance);
        const denominator = stdDev * Math.sqrt(2 * Math.PI);
        return Math.pow(Math.E, exponent) / denominator;
      };
  
      const mean = d3.mean(empData, (d) => d.rating) || 0;
      const stdDev = d3.deviation(empData, (d) => d.rating) || 1;
  
      const curveData = d3.range(1, 5, 0.01).map((x) => ({
        x,
        y: gaussian(x, mean, stdDev),
      }));
  
      const areaGenerator = d3.area<{ x: number; y: number }>()
        .x((d) => x(d.x))
        .y0(height)
        .y1((d) => y(d.y))
        .curve(d3.curveBasis);
  
  
      const g = svg
        .append("g")
        .attr("transform", `translate(${margin.left}, ${margin.top})`);
  
      g.append("path")
        .datum(curveData)
        .attr("fill", "#69b3a2")
        .attr("opacity", 0.8)
        .attr("d", areaGenerator);
  
      g.append("path")
        .datum(curveData)
        .attr("fill", "none")
        .attr("stroke", "#000")

  }, [containerRef.current, empData]);

  return (
    <div className="svg">
      <svg ref={containerRef} width="600" height="400" preserveAspectRatio="xMidYMid meet"></svg>
    </div>
  )
}

export default BellCurve