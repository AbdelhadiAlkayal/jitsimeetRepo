import React from "react";
import ReactDOM from "react-dom";

import { App } from "./features/app/components/App.web";
import { getLogger } from "./features/base/logging/functions";
import Platform from "./features/base/react/Platform.web";
import { getJitsiMeetGlobalNS, getJitsiMeetGlobalNSConnectionTimes } from "./features/base/util/helpers";
import DialInSummaryApp from "./features/invite/components/dial-in-summary/web/DialInSummaryApp";
import PrejoinApp from "./features/prejoin/components/web/PrejoinApp";
import WhiteboardApp from "./features/whiteboard/components/web/WhiteboardApp";
import baseApi from "./api/axios";

if (!localStorage.getItem("initExecuted")) {
    const url = new URL(location.href);

    const jwtParam = url.searchParams.get("jwt") || "";
    const keyParam = url.searchParams.get("key") || "";
    localStorage.setItem("token", jwtParam);
    if (keyParam) localStorage.setItem("key", keyParam.replace(/\//g, ""));

    // Set a flag in localStorage to indicate this code has run
    localStorage.setItem("initExecuted", "true");
    try {
        // Wrap each API call in its own try-catch

        const [resKey, resToken] = Promise.allSettled([
            baseApi.get(`/meeting/verify-key/${keyParam}`),
            baseApi.get(`/auth/validate-token`),
        ]);

        const isResKeyFailed =
            resKey.status === "rejected" || (resKey.status === "fulfilled" && resKey.value.status !== 200);
        const isResTokenFailed =
            resToken.status === "rejected" || (resToken.status === "fulfilled" && resToken.value.status !== 200);

        // Redirect if BOTH APIs fail
        if (isResKeyFailed && isResTokenFailed) {
            window.location.href = "https://spacedesk.sa";
        }
    } catch (error) {
        console.error("Unexpected error occurred:", error);
    }
}

const logger = getLogger("index.web");

window.addEventListener(
    "beforeunload",
    function (e) {
        this.localStorage.clear();
    },
    false
);

// Add global loggers.
window.addEventListener("error", (ev) => {
    logger.error(
        `UnhandledError: ${ev.message}`,
        `Script: ${ev.filename}`,
        `Line: ${ev.lineno}`,
        `Column: ${ev.colno}`,
        "StackTrace: ",
        ev.error?.stack
    );
});

window.addEventListener("unhandledrejection", (ev) => {
    logger.error(`UnhandledPromiseRejection: ${ev.reason}`, "StackTrace: ", ev.reason?.stack);
});

// Workaround for the issue when returning to a page with the back button and
// the page is loaded from the 'back-forward' cache on iOS which causes nothing
// to be rendered.
if (Platform.OS === "ios") {
    window.addEventListener("pageshow", (event) => {
        // Detect pages loaded from the 'back-forward' cache
        // (https://webkit.org/blog/516/webkit-page-cache-ii-the-unload-event/)
        if (event.persisted) {
            // Maybe there is a more graceful approach but in the moment of
            // writing nothing else resolves the issue. I tried to execute our
            // DOMContentLoaded handler but it seems that the 'onpageshow' event
            // is triggered only when 'window.location.reload()' code exists.
            window.location.reload();
        }
    });
}

const globalNS = getJitsiMeetGlobalNS();
const connectionTimes = getJitsiMeetGlobalNSConnectionTimes();

// Used for automated performance tests.
connectionTimes["index.loaded"] = window.indexLoadedTime;

window.addEventListener("load", () => {
    connectionTimes["window.loaded"] = window.loadedEventTime;
});

document.addEventListener("DOMContentLoaded", () => {
    const now = window.performance.now();

    connectionTimes["document.ready"] = now;
    logger.log("(TIME) document ready:\t", now);
});

globalNS.entryPoints = {
    APP: App,
    PREJOIN: PrejoinApp,
    DIALIN: DialInSummaryApp,
    WHITEBOARD: WhiteboardApp,
};

globalNS.renderEntryPoint = ({ Component, props = {}, elementId = "react" }) => {
    ReactDOM.render(<Component {...props} />, document.getElementById(elementId));
};
