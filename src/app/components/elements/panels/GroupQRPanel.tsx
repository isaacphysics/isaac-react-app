import React, { useEffect, useState } from 'react';
import QRCode from 'qrcode';
import { siteSpecific } from '../../../services';

const GroupQRCodePanel = ({link}: {link: string}) => {
    const [qrCodeStringBase64SVG, setQrCodeStringBase64SVG] = useState<string | undefined>(undefined);

    function generateSVG(qrcode: QRCode.QRCode): string {
        const fgCol = siteSpecific('#1a6600', '#6C0A48'); // phy=brand-700, ada=theme-200
        const bgCol = '#ffffff';
        const s = qrcode.modules.size;

        // draw the 3 squares separately (as to be solid)
        // can't use qrcode's reserved areas this includes various timing patterns that we don't want to draw differently
        const squareStarts = ["4 4.5", `4 ${s - 2.5}`, `${s - 3} 4.5`];
        const reservedStr = squareStarts.reduce((acc, curr) => {
            return acc + `<path stroke="${fgCol}" d="M${curr}h6.5v6h-6v-6.5m1.5 2.5h2.5v2h-2v-2m0 1h2" style="stroke-width: 1px;" fill="${bgCol}"/>`;
        }, '');
        let dataStr = '';
        for (let r = 0; r < s; r++) {
            for (let c = 0; c < s; c++) {
                if (qrcode.modules.get(r, c)) {
                    dataStr += `<circle cx="${c + 4.5}" cy="${r + 4.5}" r="0.5" fill="${fgCol}"/>`;
                }
            }
        }
        return `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${s + 8} ${s + 8}" shape-rendering="crispEdges"><path fill="${bgCol}" d="M0 0h${s + 8}v${s + 8}H0z"/>${reservedStr}<g>${dataStr}</g></svg>`;
    }

    useEffect(() => {
        // QRCode does have a toString => svg method but it isn't very customisable; instead, build SVG ourselves
        const code = QRCode.create(link, {
            errorCorrectionLevel: 'M',
        });

        setQrCodeStringBase64SVG(window.btoa(generateSVG(code)));
    }, [link]);

    return <div className="vertical-center">
        {qrCodeStringBase64SVG && <img
            className="wf-20"
            src={'data:image/svg+xml;base64,' + qrCodeStringBase64SVG}
            alt={"Follow this URL to join the group: " + link}
        />}
    </div>;
};

export default GroupQRCodePanel;
