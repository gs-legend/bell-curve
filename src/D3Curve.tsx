import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { empData as data } from "./assets/TestData";
import "./assets/styles.css";

function getProbabilityData(normalizedData, m, v) {
  var data = [];
  for (var i = 0; i < normalizedData.length; i += 1) {
    var q = normalizedData[i].rating,
      q1 = q,//(q - m) / v,
      p = probabilityDensityCalculation(q1, m, v),
      el = {
        x: q,
        y: p,
        z: q1,
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

function kernelDensityEstimator(kernel, X) {
  return function (V) {
    return X.map(function (x) {
      return [x, d3.mean(V, function (v: any) { return kernel(x - v); })];
    });
  };
}

function kernelEpanechnikov(k) {
  return function (v) {
    return Math.abs(v /= k) <= 1 ? 0.75 * (1 - v * v) / k : 0;
  };
}

function D3Curve() {
  const ref = useRef<SVGSVGElement | null>(null);

  useEffect(() => {
    if (!ref.current) {
      return;
    }

    // Define the dimensions of the SVG element
    const width = 800;
    const height = 400;
    const margin = { top: 20, right: 20, bottom: 30, left: 40 };
    const chartWidth = width - margin.left - margin.right;
    const chartHeight = height - margin.top - margin.bottom;

    const colors = ["#be280c", "#c0a92c", "#105526", "#034aea", "#1502cf"];

    var svg = d3.select(ref.current);
    svg.selectAll("*").remove();

    svg.attr("width", width + margin.left + margin.right)
      .attr("height", height + margin.top + margin.bottom)
      .append("g")
      .attr("transform", "translate(" + margin.left + "," + margin.top + ")");

    const mean = d3.mean(data.map(d => d.rating));
    const deviation = d3.deviation(data.map(d => d.rating)) as number;
    const normalizedData = getProbabilityData(data, mean, deviation);

    var x = d3.scaleLinear()
      .range([0, chartWidth]);

    var y = d3.scaleLinear()
      .range([(chartHeight * (2 / 3)), 6]);


    const group1 = normalizedData.filter(d => d.x <= 1);
    const group2 = normalizedData.filter(d => d.x > 1 && d.x <= 2);
    const group3 = normalizedData.filter(d => d.x > 2 && d.x <= 3);
    const group4 = normalizedData.filter(d => d.x > 3 && d.x <= 4);
    const group5 = normalizedData.filter(d => d.x > 4);

    var line = d3.line<{ x: number, y: number, z: number }>()
      .x(function (d) { return x(d.z); })
      .y(function (d) { return y(d.y); });

    x.domain(d3.extent(normalizedData, function (d) {
      return d.z;
    }));
    y.domain(d3.extent(normalizedData, function (d) {
      return d.y;
    }));

    // svg.append("path")
    //   .datum(normalizedData)
    //   .attr("class", "line")
    //   .attr("d", line)
    //   .attr("fill", "none")
    //   .attr("stroke", "steelblue")
    //   .attr("stroke-width", 2);

   const density = kernelDensityEstimator(kernelEpanechnikov(7), x.ticks(40))(normalizedData.map(d=>d.y));

    svg
      .append('g')
      .append("path")
      .attr("class", "group group1")
      .datum(density)
      .attr("fill", colors[0])
      .attr("d", d3.area()
        .curve(d3.curveLinear)
        .x(d=>x(d[1]))
        .y0(y(0))
        .y1(d=> y(d[0]))
      );

    svg
      .append('g')
      .append("path")
      .attr("class", "group group2")
      .datum(group2)
      .attr("fill", colors[1])
      .attr("d", d3.area()
        .curve(d3.curveLinear)
        .x(function (d: any) { return x(d.z); })
        .y0(y(0))
        .y1(function (d: any) { return y(d.y); })
      );

    svg
      .append('g')
      .append("path")
      .attr("class", "group group3")
      .datum(group3)
      .attr("fill", colors[2])
      .attr("d", d3.area()
        .curve(d3.curveLinear)
        .x(function (d: any) { return x(d.z); })
        .y0(y(0))
        .y1(function (d: any) { return y(d.y); })
      );

    svg
      .append('g')
      .append("path")
      .attr("class", "group group4")
      .datum(group4)
      .attr("fill", colors[3])
      .attr("d", d3.area()
        .curve(d3.curveLinear)
        .x(function (d: any) { return x(d.z); })
        .y0(y(0))
        .y1(function (d: any) { return y(d.y); })
      );

    svg
      .append('g')
      .append("path")
      .attr("class", "group group5")
      .datum(group5)
      .attr("fill", colors[4])
      .attr("d", d3.area()
        .curve(d3.curveLinear)
        .x(function (d: any) { return x(d.z); })
        .y0(y(0))
        .y1(function (d: any) { return y(d.y); })
      );

  }, [data]);

  return <svg viewBox='0 0 860 450' ref={ref}></svg>;
}

export default D3Curve