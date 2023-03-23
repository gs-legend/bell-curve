import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { empData } from "./assets/TestData";
import "./assets/styles.css";

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
    const grouped_data = d3.group(empData, d => d.category);
    const idealData = getProbabilityData(empData, mean, deviation);
    const sampleFn = d3.randomNormal(mean, deviation);
    

    var x = d3.scaleLinear().range([0, width]);
    var y = d3.scaleLinear().range([height, 0]);

    const xNormal = d3.scaleLinear()
      .range([0, width])
      .domain(d3.extent(idealData, function (d) { return d.q; }));

    const yNormal = d3.scaleLinear()
      .range([height, 0])
      .domain(d3.extent(idealData, function (d) { return d.p; }));

    const area = d3.area()
      .curve(d3.curveLinear)
      .x(function (d: any) { return xNormal(d.q); })
      .y0(y(0))
      .y1(function (d: any) { return yNormal(d.p); });

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
    //   .attr("class", "group")
    //   .datum(idealData)
    //   .attr("fill", "none")
    //   .attr("stroke", "steelblue")
    //   .attr("d", area);

    let usedCount = 0;
    let index = 0;
    let prevPercent = 0;
    let usedPercent = 0;
    const xAxisLables = [];
    grouped_data.forEach((data, key) => {
      const percent = (data.length * 100) / empData.length;
      const numOfElementsToSlice = Math.round((percent / 100) * (idealData.length));
      let percent_idealData = idealData.slice(usedCount, usedCount + numOfElementsToSlice);
      usedCount += numOfElementsToSlice;
      xAxisLables.push(key);
      const quantile = d3.quantile(empData.map(d => d.rating), (usedPercent + percent) / 100);
      const prevQuantile = d3.quantile(empData.map(d => d.rating), (usedPercent + prevPercent) / 100);
      const temp1 = {
        e: "",
        p: probabilityDensityCalculation(prevQuantile, mean, deviation),
        q: prevQuantile,
        c: key
      };

      const temp2 = {
        e: "",
        p: probabilityDensityCalculation(quantile, mean, deviation),
        q: quantile,
        c: key
      }

      console.log(percent / 100, quantile, prevPercent / 100, prevQuantile, temp1, temp2);
      const newGroup = [...percent_idealData];
      plot
        .append('g')
        .append("path")
        .attr("class", "group")
        .datum(newGroup)
        .attr("fill", colors[index++])
        // .attr("fill", "none")
        .attr("d", d3.area()
          .curve(d3.curveLinear)
          // .x((d: any) => { console.log(d, xNormal(d.q)); return xNormal(d.q); })
          .x((d: any) => xNormal(d.q))
          .y0(y(0))
          // .y1((d: any) => { console.log(d, percent, yNormal(d.p)); return yNormal(d.p); })
          .y1((d: any) => yNormal(d.p))
        );
      prevPercent = percent;
      usedPercent += percent;
    });

    const xAxis = d3.axisBottom(x);
    const yAxis = d3.axisLeft(y);

    plot.append('g')
      .attr('class', 'x axis')
      .attr('transform', 'translate(0,' + height + ')')
      .call(xAxis);

    plot.append('g')
      .attr('class', 'y axis')
      .call(yAxis);

  }, []);

  return <svg ref={svgRef}></svg>;
}

export default D3Curve1