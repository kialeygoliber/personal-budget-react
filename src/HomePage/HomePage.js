import React, { useEffect, useState, useRef } from "react";
import axios from "axios";
import { Chart, registerables } from "chart.js";
import * as d3 from "d3";
Chart.register(...registerables);

const dataSource = {
  datasets: [{
    data: [], 
    backgroundColor: [
      '#1E1E24','#92140C','#FFF8F0','#FFCF99','#111D4A','#63B995','#273C2C'
    ]
  }],
  labels: [] 
};

function HomePage
() {
  const chartRef = useRef(null);
  const canvasRef = useRef(null);

  const [budgetData, setBudgetData] = useState(null);


  useEffect(() => {

    axios.get("http://localhost:3000/budget", { headers: { 'Cache-Control': 'no-cache' } })

    .then(res => {
      console.log("Axios response:", res.data);
      setBudgetData(res.data);
    })
     .catch(err => console.error(err));

    }, []);

  useEffect(() => {

    if (!budgetData || !budgetData.budget) return;

    if (budgetData && Array.isArray(budgetData.budget)) {
      budgetData.budget.forEach((item, i) => {
        dataSource.datasets[0].data[i] = item.budget;
        dataSource.labels[i] = item.title;
      });
    }
    

    if (!canvasRef.current) return;

    if (chartRef.current) {
      chartRef.current.destroy();
    }

    chartRef.current = new Chart(canvasRef.current.getContext('2d'), {
      type: 'pie',
      data: dataSource
    });

    d3.select("#stockChart").selectAll("*").remove();

    var stocksData = budgetData.stocks.map(d => ({ label: d.title, value: d.amount }));
    drawStockChart(stocksData);
      
  },[budgetData]); 



  function drawStockChart(data) {
    var width = 350,
        height = 300,
        radius = Math.min(width, height) / 2;

    var svg = d3.select("#stockChart")
        .append("svg")
        .attr("width", width)
        .attr("height", height)
        .append("g")
        .attr("transform", "translate(" + width / 2 + "," + height / 2 + ")");

    svg.append("g").attr("class", "slices");
    svg.append("g").attr("class", "labels");
    svg.append("g").attr("class", "lines");

    var pie = d3.layout.pie()
        .sort(null)
        .value(function(d) { return d.value; });

    
    var arc = d3.svg.arc()
        .outerRadius(radius * 0.8)
        .innerRadius(radius * 0.4);

    var outerArc = d3.svg.arc()
        .innerRadius(radius * 0.85)
        .outerRadius(radius * 0.85); 
        
    
    var key = function(d){ return d.data.label; };



    /*COLORS*/
    var color = d3.scale.ordinal()
        .domain(data.map(function(d){ return d.label; }))
        .range(["#92DDB6", "#69B594", "#003E1F", "#C1EBD5", "#006633" ]);


    var slice = svg.select(".slices").selectAll("path.slice")
        .data(pie(data), key);

    slice.enter()
        .insert("path")
        .style("fill", function(d) { return color(d.data.label); })
        .attr("class", "slice");

    slice.transition().duration(1000)
        .attrTween("d", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                return arc(interpolate(t));
            };
        });

    slice.exit().remove();

    /*TEXT LABELS*/

    var text = svg.select(".labels").selectAll("text")
    .data(pie(data), key);

    text.enter()
        .append("text")
        .attr("dy", "16px")
        .attr("fill", "black") 
        .text(function(d) {
            return d.data.label;
        });
    
    function midAngle(d){
        return d.startAngle + (d.endAngle - d.startAngle)/2;
    }

    text.transition().duration(1000)
        .attrTween("transform", function(d) {
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.75 * (midAngle(d2) < Math.PI ? 1 : -1);
                return "translate("+ pos +")";
            };
        })
        .styleTween("text-anchor", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                return midAngle(d2) < Math.PI ? "start":"end";
            };
        });

    text.exit()
    .remove();


    var polyline = svg.select(".lines").selectAll("polyline")
        .data(pie(data), key);

    polyline.enter().append("polyline")
        .style("fill", "none")
        .style("stroke", "#000") 
        .style("stroke-width", "1px");


    polyline.transition().duration(1000)
        .attrTween("points", function(d){
            this._current = this._current || d;
            var interpolate = d3.interpolate(this._current, d);
            this._current = interpolate(0);
            return function(t) {
                var d2 = interpolate(t);
                var pos = outerArc.centroid(d2);
                pos[0] = radius * 0.95 * (midAngle(d2) < Math.PI ? 1 : -1);
                return [arc.centroid(d2), outerArc.centroid(d2), pos];
            };			
        });

    polyline.exit().remove();
}

  return (

    <main className="center" id="main" tabIndex="-1">

    <div className="page-area">

        <article>
            <h2>Stay on track</h2> 
            <p>
                Do you know where you are spending your money? If you really stop to track it down,
                you would get surprised! Proper budget management depends on real data... and this
                app will help you with that!
            </p>
        </article>

        <article>
            <h2>Alerts</h2>
            <p>
                What if your clothing budget ended? You will get an alert. The goal is to never go over the budget.
            </p>
        </article>

        <article>
            <h2>Results</h2>
            <p>
                People who stick to a financial plan, budgeting every expense, get out of debt faster!
                Also, they to live happier lives... since they expend without guilt or fear... 
                because they know it is all good and accounted for.
            </p>
        </article>

        <article>
            <h2>Free</h2>
            <p>
                This app is free!!! And you are the only one holding your data!
            </p>
        </article>

        <article>
            <h2>Budget Chart</h2>
            <figure>
                <canvas ref={canvasRef} id="chartJS" width="400" height="400"></canvas>
                <figcaption>Visual breakdown of expenses in a chart</figcaption>
            </figure>
        </article>

        <article>
            <h2>  Annual Income from Stock Investments</h2>
            <figure>
                <div id="stockChart"></div>
                <figcaption>Comparison chart of annual income from stocks</figcaption>
            </figure>
        </article>

    </div>

</main>
  );
}

export default HomePage
;
