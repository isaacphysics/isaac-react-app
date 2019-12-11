import React, {useEffect, useRef, useState} from 'react';
import {VictoryAnimation, VictoryLabel, VictoryPie} from "victory";
import * as d3 from 'd3';

// export const TestD3 = () => {
//
//     return (
//         <div>
//             <svg viewBox="0 0 400 400" width="100%" height="100%">
//                 <VictoryPie
//                     // standalone={true}
//                     // animate={{ duration: 1000 }}
//                     width={400} height={400}
//                     data={[{ x: 1, y: 30 }, { x: 2, y: 100 - 30 }]}
//                     innerRadius={220}
//                     cornerRadius={25}
//                     labels={() => "label"}
//                     style={{
//                         data: { fill: ({ datum }) => {
//                             const color = datum.y > 30 ? "green" : "red";
//                             return datum.x === 1 ? color : "blue";
//                         }
//                         }
//                     }}
//                 />
//                 {/*<VictoryAnimation duration={1000} data={this.state}>*/}
//                 {/*    {(newProps) => {*/}
//                 {/*        return (*/}
//                 {/*            <VictoryLabel*/}
//                 {/*                textAnchor="middle" verticalAnchor="middle"*/}
//                 {/*                x={200} y={200}*/}
//                 {/*                text={`${Math.round(newProps.percent)}%`}*/}
//                 {/*                style={{ fontSize: 45 }}*/}
//                 {/*            />*/}
//                 {/*        );*/}
//                 {/*    }}*/}
//                 {/*</VictoryAnimation>*/}
//             </svg>
//         </div>
//     );
// };


// export const TestD3 = () => {
//     const userPurchases = [
//         {
//             itemName: 'Mountain Dew',
//             price: 3
//         },
//         {
//             itemName: 'Shoes',
//             price: 50
//         },
//         {
//             itemName: 'Kit Kat',
//             price: 1
//         },
//         {
//             itemName: 'Taxi',
//             price: 24
//         },
//         {
//             itemName: 'Watch',
//             price: 100
//         },
//         {
//             itemName: 'Headphones',
//             price: 15
//         },
//         {
//             itemName: 'Wine',
//             price: 16
//         }
//     ]
//     const sectionAngles = d3.pie().value(d => d.price)(userPurchases);
//     const path = d3.arc()
//         .outerRadius(100) //must be less than 1/2 the chart's height/width
//         .padAngle(.05) //defines the amount of whitespace between sections
//         .innerRadius(60); //the size of the inner 'donut' whitespace
//     return <svg viewBox={"0 0 400 400"} width={"100%"} height={"100%"}>
//         {
//             sectionAngles.map(section => (
//                 <path
//                     key={section.index}
//                     d={path(section)}
//                     stroke="#000"
//                     fill={`rgb(0,0,255)`}
//                     strokeWidth={1}
//                 />
//             ))
//         }
//     </svg>
// }

import { max } from 'd3-array'
import { select } from 'd3-selection'
import { scaleLinear } from 'd3-scale';

export const TestD3 = () => {
    const createBarChart = (node: SVGSVGElement | null) => {
        const data = [5,10,1,3];
        const size = [500,500];
        const dataMax = max(data) || 0;
        const yScale = scaleLinear()
            .domain([0, dataMax])
            .range([0, size[1]])

        select(node)
            .selectAll('rect')
            .data(data)
            .enter()
            .append('rect')

        select(node)
            .selectAll('rect')
            .data(data)
            .exit()
            .remove()

        select(node).selectAll('rect').data(data)
            .style('fill', '#fe9922')
            .attr('x', (d,i) => i * 25)
            .attr('y', (d) => size[1] - yScale(d))
            .attr('height', d => yScale(d))
            .attr('width', 25)
    };


    return <svg ref={node => createBarChart(node)}
        width={500} height={500}>
    </svg>
}

// import bb from "billboard.js";
// export const TestD3 = () => {
//     var chart = bb.generate({
//         data: {
//             columns: [
//                 ["data1", 30],
//                 ["data2", 120]
//             ],
//             type: "donut",
//             onclick: function(d, i) {
//                 console.log("onclick", d, i);
//             },
//             onover: function(d, i) {
//                 console.log("onover", d, i);
//             },
//             onout: function(d, i) {
//                 console.log("onout", d, i);
//             }
//         },
//         donut: {
//             title: "Iris Petal Width"
//         },
//         bindto: "#donutChart"
//     });
//
//     setTimeout(function() {
//         chart.load({
//             columns: [
//                 ["setosa", 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2],
//                 ["versicolor", 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3],
//                 ["virginica", 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8],
//             ]
//         });
//     }, 1500);
//     // chart.load({
//     //     columns: [
//     //         ["setosa", 0.2, 0.2, 0.2, 0.2, 0.2, 0.4, 0.3, 0.2, 0.2, 0.1, 0.2, 0.2, 0.1, 0.1, 0.2, 0.4, 0.4, 0.3, 0.3, 0.3, 0.2, 0.4, 0.2, 0.5, 0.2, 0.2, 0.4, 0.2, 0.2, 0.2, 0.2, 0.4, 0.1, 0.2, 0.2, 0.2, 0.2, 0.1, 0.2, 0.2, 0.3, 0.3, 0.2, 0.6, 0.4, 0.3, 0.2, 0.2, 0.2, 0.2],
//     //         ["versicolor", 1.4, 1.5, 1.5, 1.3, 1.5, 1.3, 1.6, 1.0, 1.3, 1.4, 1.0, 1.5, 1.0, 1.4, 1.3, 1.4, 1.5, 1.0, 1.5, 1.1, 1.8, 1.3, 1.5, 1.2, 1.3, 1.4, 1.4, 1.7, 1.5, 1.0, 1.1, 1.0, 1.2, 1.6, 1.5, 1.6, 1.5, 1.3, 1.3, 1.3, 1.2, 1.4, 1.2, 1.0, 1.3, 1.2, 1.3, 1.3, 1.1, 1.3],
//     //         ["virginica", 2.5, 1.9, 2.1, 1.8, 2.2, 2.1, 1.7, 1.8, 1.8, 2.5, 2.0, 1.9, 2.1, 2.0, 2.4, 2.3, 1.8, 2.2, 2.3, 1.5, 2.3, 2.0, 2.0, 1.8, 2.1, 1.8, 1.8, 1.8, 2.1, 1.6, 1.9, 2.0, 2.2, 1.5, 1.4, 2.3, 2.4, 1.8, 1.8, 2.1, 2.4, 2.3, 1.9, 2.3, 2.5, 2.3, 1.9, 2.0, 2.3, 1.8],
//     //     ]
//     // });
//     return <div id="donutChart"/>;
// }
