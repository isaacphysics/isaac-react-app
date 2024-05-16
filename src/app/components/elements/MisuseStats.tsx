import React, {useState} from "react";
import {MisuseStatisticDTO} from "../../../IsaacApiTypes";
import {useGetMisuseStatisticsQuery, useResetMisuseMonitorMutation} from "../../state";
import {Button, Table} from "reactstrap";
import {selectOnChange} from "../../services";
import {StyledSelect} from "./inputs/StyledSelect";

const EventMisuseTable = ({topMisuses}: {topMisuses: MisuseStatisticDTO[]}) => {
    const [resetMisuseMonitor] = useResetMisuseMonitorMutation();
    return topMisuses.length === 0 ? <span className={"font-italic"}>No misuse statistics for this event type! 🎉</span> : <Table>
        <thead>
        <tr>
            <th>Agent identifier</th>
            <th>Current event counter</th>
            <th>Last recorded event</th>
            <th>Misused?</th>
        </tr>
        </thead>
        <tbody>
        {topMisuses.map((m, i) => <tr key={i}>
            <td>{m.agentIdentifier}</td>
            <td>{m.currentCounter}{" "}{m.currentCounter > 0 && <Button className={"float-end"} size={"sm"} onClick={() => resetMisuseMonitor({eventLabel: m.eventType, agentIdentifier: m.agentIdentifier})}>Reset</Button>}</td>
            <td>{m.lastEventTimestamp ? (new Date(m.lastEventTimestamp)).toString() : "None"}</td>
            <td>{m.isMisused ? <span className={"text-danger font-weight-bold"}>Yes</span> : (m.isOverSoftThreshold ? <span className={"text-warning font-weight-bold"}>Almost</span> : "No")}</td>
        </tr>)}
        </tbody>
    </Table>;
};

export const MisuseStats = () => {
    const {data: misuseStats} = useGetMisuseStatisticsQuery(10);
    const [openEventTable, setOpenEventTable] = useState<string[]>([]);
    const eventLabels = misuseStats ? Object.keys(misuseStats) : [];
    return <>
        <p>Select a misuse event type:</p>
        <StyledSelect
            options={eventLabels.map(el => ({value: el, label: el.replace("Handler", "")}))}
            onChange={selectOnChange(setOpenEventTable, true)}
        />
        <br/>
        {misuseStats && openEventTable.length > 0 && (openEventTable[0] in misuseStats) && <EventMisuseTable topMisuses={misuseStats[openEventTable[0]]}/>}
    </>;
};
