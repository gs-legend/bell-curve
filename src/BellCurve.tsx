import React, { useEffect, useRef, useState } from 'react'
import { empData as data } from "./assets/TestData";
import "./assets/styles.css";
import Highcharts from 'highcharts';
import bellcurve from 'highcharts/modules/histogram-bellcurve'
import HighchartsReact from 'highcharts-react-official'
bellcurve(Highcharts);





function BellCurve() {
  const chartComponentRef = useRef(null);
  const [config, setConfig] = useState({});

  useEffect(() => {
    data.sort((x, y) => x.rating - y.rating);
    const empData = data.map(d => {
      if (d.rating < 4 && d.rating > 2) {
        d.rating = 4
      }
      return d;
    })

    const cat_c = empData.filter(d => d.rating < 1);
    const cat_b = empData.filter(d => d.rating >= 1 && d.rating < 2);
    const cat_bplus = empData.filter(d => d.rating >= 2 && d.rating < 3);
    const cat_a = empData.filter(d => d.rating >= 3 && d.rating < 4);
    const cat_aplus = empData.filter(d => d.rating >= 4);

    const c_percent = (cat_c.length / empData.length) * 100;
    const b_percent = (cat_b.length / empData.length) * 100;
    const bplus_percent = (cat_bplus.length / empData.length) * 100;
    const a_percent = (cat_a.length / empData.length) * 100;
    const aplus_percent = (cat_aplus.length / empData.length) * 100;
    console.log(c_percent, b_percent, bplus_percent, a_percent, aplus_percent)
    const zones = [
      {
        value: 0,
        color: "#be280c"
      },
      {
        value: 1,
        color: "#c0a92c"
      },
      {
        value: 2,
        color: "#105526"
      },
      {
        value: 3,
        color: "#034aea"
      },
      {
        value: 4,
        color: "#1502cf"
      },
    ];

    const series = [
      {
        name: "",
        type: "bellcurve",
        xAxis: 1,
        yAxis: 1,
        intervals: 4,
        baseSeries: 1,
        zoneAxis: 'x',
        zIndex: -1,
        marker: {
          enabled: false
        },
        threshold: -0.01
      },
      {
        name: "",
        data: empData.map(d => d.rating),
        visible: false,
      }
    ]

    const options = {
      title: {
        text: "Performance Review 1 to 5 Ratings Bell Dsitribution Curve"
      },
      accessibility: null,
      xAxis: [
        {
          title: {
            text: "Normal Company Wide Ratings"
          },
          visible: true
        },
        {
          title: {
            text: "Normal Company Wide Ratings"
          },
          visible: false,
          opposite: true
        }
      ],


      yAxis: [
        {
          title: {
            text: "No of Employees"
          },
          visible: true
        },
        {
          title: {
            text: "No of Employees"
          },
          opposite: true,
          visible: false
        }
      ],
      plotOptions: {
        series: {
          enableMouseTracking: false,
          zones: zones
        }
      },
      series: series
    };
    setConfig(options)

  }, [])

  return (
    <div className="svg">
      <HighchartsReact
        constructorType={"chart"}
        ref={chartComponentRef}
        highcharts={Highcharts}
        options={config}
      />
    </div>
  )
}

export default BellCurve