import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { empData } from "./assets/TestData";
import "./assets/styles.css";
import { _ } from "lodash"

function getProbabilityData(normalizedData, m, v) {
  var data = [];
  for (var i = 0; i < normalizedData.length; i += 1) {
    var q = normalizedData[i].rating,
      p = probabilityDensityCalculation(q, m, v),
      el = {
        q: q,
        p: p,
        c: normalizedData[i].category,
        e: normalizedData[i].empId
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

function D3Curve1() {
  const svgRef = useRef<SVGSVGElement | null>(null);
  const colors = ["#be280c", "#c0a92c", "#105526", "#034aea", "#1502cf"];

  useEffect(() => {
    if (!svgRef.current) {
      return;
    }

    const width = 800, height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const svg = d3.select(svgRef.current);
    svg.selectAll("*").remove();

    const plot = svg.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const mean = d3.mean(empData.map(d => d.rating));
    const deviation = d3.deviation(empData.map(d => d.rating)) as number;
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

    const group1 = empData.filter(d => d.category === 'C');
    const group2 = empData.filter(d => d.category === 'B');
    const group3 = empData.filter(d => d.category === 'B+');
    const group4 = empData.filter(d => d.category === 'A');
    const group5 = empData.filter(d => d.category === 'A+');

    const normalData = [];
    for (let i = mean - (3 * deviation); i < mean + (3 * deviation); i += 0.02) {
      normalData.push({ x: i, y: probabilityDensityCalculation(i, mean, deviation) });
    }
    // console.log(mean - (3 * deviation), mean + (3 * deviation), mean, deviation)
    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    const xNormal = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(normalData, function (d) { return d.x; }));

    const yNormal = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(normalData, function (d) { return d.y; }));

    const area = d3.area<{ x: number, y: number }>()
      .curve(d3.curveLinear)
      .x(function (d: any) { return xNormal(d.x); })
      .y0(y(0))
      .y1(function (d: any) { return yNormal(d.y); });

    const line = d3.line<{ x: number, y: number }>()
      .x(function (d) { return xNormal(d.x); })
      .y(function (d) { return yNormal(d.y); });


    const fill = (d) => {
      let _fill = "none";
      switch (d.c.toLowerCase()) {
        case "c":
          _fill = colors[0];
          break;
        case "b":
          _fill = colors[1];
          break;
        case "b+":
          _fill = colors[2];
          break;
        case "a":
          _fill = colors[3];
          break;
        case "a+":
          _fill = colors[4];
          break;
      }
      return _fill;
    }

    // plot
    //   .append('g')
    //   .append("path")
    //   .attr("class", "group group2")
    //   .datum(normalData)
    //   .attr("fill", "none")
    //   .attr("stroke", "steelblue")
    //   .attr("stroke-width", "1")
    //   .attr("d", line);

    let usedCount = 0;
    let index = 0;
    let prevPercent = 0;
    let usedPercent = 0;
    const xAxisLables = [];
    grouped_data.forEach((data, key) => {
      const percent = (data.length * 100) / empData.length;
      const numOfElementsToSlice = Math.round((percent / 100) * (normalData.length));
      let percent_idealData = normalData.slice(usedCount, usedCount + numOfElementsToSlice);
      usedCount += numOfElementsToSlice;
      console.log(usedCount, numOfElementsToSlice, percent, percent_idealData,normalData.length)
      xAxisLables.push(key);
      // const quantile = d3.quantile(normalData.map(d => d.x), (usedPercent + percent) / 100);
      // const prevQuantile = d3.quantile(normalData.map(d => d.x), (usedPercent + prevPercent) / 100);
      // const temp1 = {
      //   y: probabilityDensityCalculation(prevQuantile, mean, deviation),
      //   x: prevQuantile,
      //   c: key
      // };

      // const temp2 = {
      //   y: probabilityDensityCalculation(quantile, mean, deviation),
      //   x: quantile,
      //   c: key
      // }

      // console.log(percent / 100, quantile, prevPercent / 100, prevQuantile, temp1, temp2);
      // const newGroup = [temp1, ...percent_idealData, temp2];
      const percentGroup = plot.append("g");
      percentGroup
        .append("path")
        .attr("class", "group")
        .datum(percent_idealData)
        .attr("fill", colors[index++])
        // .attr("fill", "none")
        .attr("d", d3.area()
          .curve(d3.curveLinear)
          // .x((d: any) => { console.log(d, xNormal(d.q)); return xNormal(d.q); })
          .x((d: any) => xNormal(d.x))
          .y0(y(0))
          // .y1((d: any) => { console.log(d, percent, yNormal(d.p)); return yNormal(d.p); })
          .y1((d: any) => yNormal(d.y))
        ) 
        .append("svg:title")
        .attr("dx", ".35em")
        .attr("dy", ".35em")
        .text((d) => `Category ${key} - ${percent}%`);
      prevPercent = percent;
      usedPercent += percent;
    });

    const xAxis = d3.axisBottom(xNormal);
    const yAxis = d3.axisLeft(yNormal);

    // plot.append('g')
    //   .attr('class', 'x axis')
    //   .attr('transform', 'translate(0,' + height + ')')
    //   .call(xAxis);

    // plot.append('g')
    //   .attr('class', 'y axis')
    //   .call(yAxis);

  }, []);

  return <svg ref={svgRef}></svg>;
}

export default D3Curve1