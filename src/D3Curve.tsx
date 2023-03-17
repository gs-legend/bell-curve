import React, { useRef, useEffect } from 'react';
import * as d3 from 'd3';
import { empData as data } from "./assets/TestData";

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

    const mean = d3.mean(data.map(d => d.rating));
    const deviation = d3.deviation(data.map(d => d.rating)) as number;

    const xScale = d3
      .scaleLinear()
      .domain([d3.min(data)!, d3.max(data)!])
      .range([margin.left, width - margin.right]);

    const yScale = d3
      .scaleLinear()
      .domain([
        0,
        d3.max(
          data.map((d) =>
            d3
              .normal(mean, deviation)
              .pdf(d) as number
          )
        )!,
      ])
      .range([chartHeight, margin.top]);

    // Create the curve generator
    const curveGenerator = d3
      .line()
      .curve(d3.curveBasis)
      .x((d) => xScale(d))
      .y((d) => yScale(d3.normal(mean, deviation).pdf(d) as number));

    // Create the bell curve path
    const pathSelection = d3.select(ref.current).append('path');

    pathSelection
      .attr('d', curveGenerator(d3.range(d3.min(data)!, d3.max(data)!, 0.1)))
      .attr('fill', 'none')
      .attr('stroke', '#69b3a2');

    // Add the shaded zones to the bell curve
    const zonesSelection = d3.select(ref.current).selectAll('rect').data([1, 2, 3]).enter().append('rect');

    zonesSelection
      .attr('x', (d) => xScale(mean - d * deviation))
      .attr('width', (d) => (d === 1 ? xScale(mean + d * deviation) : xScale(mean + d * deviation) - xScale(mean - d * deviation)))
      .attr('y', margin.top)
      .attr('height', chartHeight - margin.top - margin.bottom)
      .attr('fill', (d) => (d === 1 ? 'rgba(105, 179, 162, 0.2)' : 'rgba(105, 179, 162, 0.4)'));
  }, [data]);

  return <svg ref={ref} width={800} height={400}></svg>;
}

export default D3Curve