import React, {useEffect, useRef, useState} from 'react';
import {bb} from "billboard.js";
import "billboard.js/dist/theme/insight.css";

export const DailyStreakGauge = () => {
    setTimeout(() => {
        bb.generate({
            data: {
                columns: [
                    ["data", 0.32]
                ],
                type: "gauge",
            },
            gauge: {
                fullCircle: true,
                label: {
                    extents: () => "",
                    format: () => "0"
                },
                max: 1,
                startingAngle: 0
            },
            color: {
                pattern: [
                    "#00FF00",
                ],
                threshold: {
                    values: [
                        0,
                    ]
                }
            },
            size: {
                height: 180
            },
            legend: {
                show: false,
            },
            bindto: "#dailyStreakChart",
            tooltip: {
                show: false
            }
        });
    }, 0);
    return <div className={"auto-margin"} id="dailyStreakChart"/>
};