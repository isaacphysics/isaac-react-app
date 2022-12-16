import {closeActiveModal, isaacApi, store} from "../../../state";
import React, {useState} from "react";
import {Button, Col, CustomInput, Row, Table} from "reactstrap";
import {skipToken} from "@reduxjs/toolkit/query";
import {RenderNothing} from "../RenderNothing";
import {RegisteredUserDTO} from "../../../../IsaacApiTypes";

const UserMisuseModalBody = ({userId}: {userId?: number}) => {
    const {data: misuseStats} = isaacApi.endpoints.getMisuseStatistics.useQuery(userId ?? skipToken);
    const [resetMisuseMonitor] = isaacApi.endpoints.resetMisuseMonitor.useMutation();
    const [onlyShowRecorded, setOnlyShowRecorded] = useState(true);

    const eventRows = misuseStats?.filter(m => m.currentCounter || !onlyShowRecorded).map(m => <tr>
        <td>{m.eventType.replace("MisuseHandler", "")}</td>
        <td className={m.isMisused ? "text-danger" : ""}>{m.isMisused ? "Yes" : "No"}</td>
        <td>{m.lastEventTimestamp ? new Date(m.lastEventTimestamp).toUTCString() : "-"}</td>
        <td className={m.currentCounter >= m.maximumEventCountThreshold ? "text-danger" : ""}>{m.currentCounter}{m.currentCounter > 0 && <Button className={"float-right"} size={"sm"} onClick={() => {
            if (userId) {
                resetMisuseMonitor({eventType: m.eventType, userId});
            }
        }}>Reset</Button>}
        </td>
        <td>{m.maximumEventCountThreshold}</td>
    </tr>);

    return userId
        ? <>
            <Row>
                <Col><p>Misused events are highlighted in red.</p></Col>
                <Col>
                    <CustomInput
                        id="only-show-recorded"
                        checked={onlyShowRecorded}
                        className={"mb-2"}
                        type="checkbox"
                        label="Only show stats for recorded events"
                        onChange={e => setOnlyShowRecorded(e.target.checked)}
                    />
                </Col>
            </Row>
            {eventRows && eventRows?.length > 0
                ? <div className={"overflow-auto"}>
                    <Table>
                        <thead>
                            <tr>
                                <th>Event type</th>
                                <th>Misused?</th>
                                <th>Last recorded event</th>
                                <th>Current event counter</th>
                                <th>Maximum allowed events</th>
                            </tr>
                        </thead>
                        <tbody>
                            {eventRows}
                        </tbody>
                    </Table>
                </div>
                : <div className={"w-100 text-center font-italic"}>No recorded events for this user</div>
            }
        </>
        : RenderNothing;
};

export const userMisuseModal = (user: RegisteredUserDTO) => {
    return {
        closeAction: () => {store.dispatch(closeActiveModal())},
        title: `Site misuse statistics for ${user.email}`,
        body: <UserMisuseModalBody userId={user.id} />,
        buttons: [
            <Button key={1} color="primary" outline onClick={() => {store.dispatch(closeActiveModal())}}>
                Close
            </Button>
        ]
    }
};
