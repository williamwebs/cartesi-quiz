import { ROLLUP_SERVER } from './shared/config';
import { hexToString } from 'viem';
import { RollupStateHandler } from './shared/rollup-state-handler';
import { controller } from './controller';

const rollup_server = ROLLUP_SERVER;
console.log('HTTP rollup_server url is ' + rollup_server);

async function handle_advance(data) {
    console.log('Received advance raw data ->', JSON.stringify(data));
    const payloadRaw = hexToString(data.payload);
    const payload = JSON.parse(payloadRaw);
    const requestedAction = payload.action;
    const providedData = payload.data;

    const action = controller[requestedAction];

    if (!action) {
        return await RollupStateHandler.handleReport({
            error: `Action '${requestedAction}' not allowed.`,
        });
    }

    const controllerResponse = await action(providedData);

    return controllerResponse;
}

async function handle_inspect(data) {
    console.log('Received inspect raw data ->', JSON.stringify(data));
    const urlParams = hexToString(data.payload);
    const urlParamsSplited = urlParams.split('/');
    const requestedAction = urlParamsSplited[0];
    const providedData = urlParamsSplited.slice(1);
    const action = controller[requestedAction];

    if (!action) {
        return await RollupStateHandler.handleReport({
            error: `Action '${requestedAction}' not allowed.`,
        });
    }

    const controllerResponse = await action(providedData);

    return controllerResponse;
}

const handlers = {
    advance_state: handle_advance,
    inspect_state: handle_inspect,
};

(async () => {
    while (true) {
        try {
            const finish_req = await RollupStateHandler.sendFinish('accept');

            console.log('Received finish status ' + finish_req.status);

            if (finish_req.status == 202) {
                console.log('No pending rollup request, trying again');
            } else {
                const handler = handlers[finish_req.request_type];
                if (!handler) {
                    throw new Error(`Unknown request type: ${finish_req.request_type}`);
                }
                await handler(finish_req.data);
            }
        } catch (error) {
            console.error('Error in main loop:', error);
            await new Promise(resolve => setTimeout(resolve, 1000));
        }
    }
})();