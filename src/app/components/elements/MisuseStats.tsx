import React, {useState} from "react";
import {MisuseStatisticDTO} from "../../../IsaacApiTypes";
import {useGetMisuseStatisticsQuery, useResetMisuseMonitorMutation} from "../../state";
import {Button, Table} from "reactstrap";
import {selectOnChange} from "../../services";
import {StyledSelect} from "./inputs/StyledSelect";
import { useTranslation } from "react-i18next";

const EventMisuseTable = ({topMisuses}: {topMisuses: MisuseStatisticDTO[]}) => {
    const { t } = useTranslation();
    const [resetMisuseMonitor] = useResetMisuseMonitorMutation();
    return topMisuses.length === 0 ? <span className={"font-italic"}>{t("common:admin.misuse.emptyState")}</span> : <Table>
        <thead>
            <tr>
                <th>{t("common:admin.misuse.tableHeader.agentIdentifier")}</th>
                <th>{t("common:admin.misuse.tableHeader.currentCounter")}</th>
                <th>{t("common:admin.misuse.tableHeader.lastEvent")}</th>
                <th>{t("common:admin.misuse.tableHeader.status")}</th>
            </tr>
        </thead>
        <tbody>
            {topMisuses.map((m, i) => <tr key={i}>
                <td>{m.agentIdentifier}</td>
                <td>{m.currentCounter}{" "}{m.currentCounter > 0 && <Button className={"float-end"} size={"sm"} onClick={() => resetMisuseMonitor({eventLabel: m.eventType, agentIdentifier: m.agentIdentifier})}>{t("common:admin.misuse.resetButton")}</Button>}</td>
                <td>{m.lastEventTimestamp ? (new Date(m.lastEventTimestamp)).toString() : t("common:admin.misuse.noEvent")}</td>
                <td>{m.isMisused ? <span className={"text-danger fw-bold"}>{t("common:admin.misuse.statusYes")}</span> : (m.isOverSoftThreshold ? <span className={"text-warning fw-bold"}>{t("common:admin.misuse.statusAlmost")}</span> : "No")}</td>
            </tr>)}
        </tbody>
    </Table>;
};

export const MisuseStats = () => {
    const { t } = useTranslation();
    const {data: misuseStats} = useGetMisuseStatisticsQuery(10);
    const [openEventTable, setOpenEventTable] = useState<string[]>([]);
    const eventLabels = misuseStats ? Object.keys(misuseStats) : [];
    return <>
        <p>{t("common:admin.misuse.selectEventLabel")}</p>
        <StyledSelect
            options={eventLabels.map(el => ({value: el, label: el.replace("Handler", "")}))}
            onChange={selectOnChange(setOpenEventTable, true)}
        />
        <br/>
        {misuseStats && openEventTable.length > 0 && (openEventTable[0] in misuseStats) && <EventMisuseTable topMisuses={misuseStats[openEventTable[0]]}/>}
    </>;
};
