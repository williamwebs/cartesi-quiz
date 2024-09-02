import { ROLLUP_SERVER } from './config';
import { toHex } from 'viem';

export class RollupStateHandler {
    static async advanceWrapper(callback) {
        try {
            const result = await callback();
            const bodyFallback = result ?? undefined;
            const noticeResponse = await fetch(`${ROLLUP_SERVER}/notice`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    payload: toHex(JSON.stringify(bodyFallback)),
                }),
            });
            const noticeResponseText = await noticeResponse.text();

            if (noticeResponse.status >= 400) {
                throw {
                    error: noticeResponseText,
                    status: noticeResponse.status,
                };
            }

            console.info(
                `Notice generated with status: ${noticeResponse.status}.`
            );
            console.info(`Notice response: ${noticeResponseText}`);
            console.info(`Notice data: ${JSON.stringify(bodyFallback)}`);

            return 'accept';
        } catch (err) {
            return this.handleReport(err.error ? err : { error: err });
        }
    }

    static async inspectWrapper(callback) {
        try {
            const result = await callback();
            const dataFallback = result ?? undefined;

            return this.handleReport(dataFallback, 'accept');
        } catch (err) {
            return this.handleReport(err);
        }
    }

    static async handleReport(data, status, rollupServer = ROLLUP_SERVER) {
        let statusFallback = status ?? 'reject';
        const reportResponse = await fetch(`${rollupServer}/report`, {
            method: 'POST',
            headers: {
                'Content-Type': 'application/json',
            },
            body: JSON.stringify({
                payload: toHex(JSON.stringify(data)),
            }),
        });
        const reportResponseText = await reportResponse.text();

        if (reportResponse.status >= 400 && statusFallback === 'accept') {
            statusFallback = 'reject';
        }

        console.info(`Report generated with status: ${reportResponse.status}.`);
        console.info(`Report response: ${reportResponseText}`);
        console.info(`Report data: ${JSON.stringify(data)}`);

        return statusFallback;
    }
}