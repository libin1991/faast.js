import test, { ExecutionContext } from "ava";
import { CommonOptions, faast, Provider, providers } from "../index";
import * as funcs from "./fixtures/functions";
import { configs, title } from "./fixtures/util";

async function testUnsupported(
    t: ExecutionContext,
    provider: Provider,
    options: CommonOptions
) {
    const opts: CommonOptions = { timeout: 30, gc: "off", ...options };
    const faastModule = await faast(provider, funcs, opts);
    const remote = faastModule.functions;

    try {
        await t.throwsAsync(remote.identityNum(NaN), /unsupported/);
        await t.throwsAsync(remote.promiseArg(Promise.resolve()), /unsupported/);
        await t.throwsAsync(remote.functionArg(() => {}), /unsupported/);
        await t.throwsAsync(remote.dateArg(new Date()), /unsupported/);
        await t.throwsAsync(remote.classArg(new funcs.Cls()), /unsupported/);

        // XXX Need to detect unsupported return values.
        // await t.throwsAsync(remote.functionReturn(), /unsupported/);
    } finally {
        await faastModule.cleanup();
    }
}
for (const provider of providers) {
    for (const config of configs) {
        test(
            title(provider, `unsupported arguments`, config),
            testUnsupported,
            provider,
            config
        );
    }
}
