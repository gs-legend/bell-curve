import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { empData } from "./assets/TestData";
import "./assets/styles.css";

function getMeanAndStdDev(data: { rating: number }[]): { mean: number, stdDev: number } {
  const mean = d3.mean(data, d => d.rating);
  const stdDev = d3.deviation(data, d => d.rating);
  return { mean, stdDev };
}

function generateNormalDistributionData(mean: number, stdDev: number, data: { rating: number }[], numPoints: number): { x: number, y: number }[] {
  const zScores = data.map(d => (d.rating - mean) / stdDev);
  const xStep = stdDev * 6 / numPoints;
  const xStart = mean - stdDev * 3;
  const xEnd = mean + stdDev * 3;
  const xs = d3.range(xStart, xEnd, xStep);
  const ys = data.map(x => {
    const z = (x.rating - mean) / stdDev;
    const pdf = (1 / Math.sqrt(2 * Math.PI)) * Math.exp(-z * z / 2);
    return pdf;
  });
  const data1 = xs.map((x, i) => ({ x, y: ys[i] }));
  console.log(data1)
  return data1;
}


function D3Curve1() {
  const svgRef = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const svg = d3.select(svgRef.current);
    const { width, height } = svgRef.current.getBoundingClientRect();
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const innerWidth = width - margin.left - margin.right;
    const innerHeight = height - margin.top - margin.bottom;

    svg.selectAll("*").remove();

    const { mean, stdDev } = getMeanAndStdDev(empData);
    const numPoints = 100;
    const curveData = generateNormalDistributionData(mean, stdDev, empData, empData.length);

    const x = d3.scaleLinear()
      .domain([mean - stdDev * 3, mean + stdDev * 3])
      .range([0, innerWidth]);

    const y = d3.scaleLinear()
      .domain([0, d3.max(curveData, d => d.y)!])
      .range([innerHeight, 0]);

    const area = d3.area<{ x: number, y: number }>()
      .curve(d3.curveBasis)
      .x(d => x(d.x))
      .y0(innerHeight)
      .y1(d => y(d.y));

    const path = svg.append('path')
      .datum(curveData)
      .attr('class', 'area')
      .attr('d', area);

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    svg.append('g')
      .attr('class', 'x-axis')
      .attr('transform', `translate(0, ${innerHeight})`)
      .call(xAxis);

    svg.append('g')
      .attr('class', 'y-axis')
      .call(yAxis);

  }, [empData]);

  return <svg ref={svgRef} width="600" height="400"></svg>;
}

export default D3Curve1