'use strict';

Object.defineProperty(exports, '__esModule', { value: true });

var axios = require('axios');
var ws = require('ws');

/******************************************************************************
Copyright (c) Microsoft Corporation.

Permission to use, copy, modify, and/or distribute this software for any
purpose with or without fee is hereby granted.

THE SOFTWARE IS PROVIDED "AS IS" AND THE AUTHOR DISCLAIMS ALL WARRANTIES WITH
REGARD TO THIS SOFTWARE INCLUDING ALL IMPLIED WARRANTIES OF MERCHANTABILITY
AND FITNESS. IN NO EVENT SHALL THE AUTHOR BE LIABLE FOR ANY SPECIAL, DIRECT,
INDIRECT, OR CONSEQUENTIAL DAMAGES OR ANY DAMAGES WHATSOEVER RESULTING FROM
LOSS OF USE, DATA OR PROFITS, WHETHER IN AN ACTION OF CONTRACT, NEGLIGENCE OR
OTHER TORTIOUS ACTION, ARISING OUT OF OR IN CONNECTION WITH THE USE OR
PERFORMANCE OF THIS SOFTWARE.
***************************************************************************** */
/* global Reflect, Promise, SuppressedError, Symbol, Iterator */


function __awaiter(thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
}

typeof SuppressedError === "function" ? SuppressedError : function (error, suppressed, message) {
    var e = new Error(message);
    return e.name = "SuppressedError", e.error = error, e.suppressed = suppressed, e;
};

const log = (...args) => {
    console.log(`[LOG] ${new Date().toISOString()}: ${args.join(" ")}`);
};

const getAllFlags = (flagsmithApi, flagsmithEnvironmentId) => __awaiter(void 0, void 0, void 0, function* () {
    const response = yield axios.get(`${flagsmithApi}/api/v1/flags`, {
        headers: { "x-environment-key": flagsmithEnvironmentId },
    });
    if (response.status !== 200) {
        return { status: false };
    }
    if (!Array.isArray(response.data)) {
        return { status: false };
    }
    return { status: true, data: response.data };
});
class Flagtron {
    constructor(config) {
        var _a, _b;
        this.initializingPromise = null;
        this.flags = {};
        this.dependencies = new Set(config.dependencies);
        this.flagsmithApi = config.flagsmithApi;
        this.reconnectAttempts = 0;
        this.flagsmithEnvironmentId = config.flagsmithEnvironmentId;
        this.flagtronWebsocketServer = config.flagtronWebsocketServer;
        this.reconnectInterval = (_a = config.reconnectInterval) !== null && _a !== void 0 ? _a : 5000;
        this.maxReconnectAttempts = (_b = config.maxReconnectAttempts) !== null && _b !== void 0 ? _b : 10;
        this.websocket = null;
        this.isInitialized = false;
        this.onFlagUpdate = config.onFlagUpdate;
    }
    listenForChanges() {
        const _this = this;
        return new Promise(function (resolve, reject) {
            var _a, _b;
            if (_this.websocket) {
                (_a = _this.websocket) === null || _a === void 0 ? void 0 : _a.removeAllListeners(); // Properly remove previous listeners
                (_b = _this.websocket) === null || _b === void 0 ? void 0 : _b.close(); // Close existing WebSocket if open
                log("(Flagtron STAT) Existing WebSocket found. Closing and removing listeners.");
            }
            _this.websocket = new ws.WebSocket(_this.flagtronWebsocketServer);
            _this.websocket.on("open", () => {
                log("(Flagtron STAT) Connected to Flagtron WebSocket.");
                _this.isInitialized = true;
                _this.reconnectAttempts = 0; // Reset on successful connection
                resolve();
            });
            _this.websocket.on("message", (data) => {
                var _a, _b, _c, _d;
                try {
                    const encodedData = data.toString();
                    if (encodedData === "PING") {
                        return (_a = _this.websocket) === null || _a === void 0 ? void 0 : _a.send("PONG");
                    }
                    const flagEvent = JSON.parse(encodedData);
                    if (!((_b = flagEvent === null || flagEvent === void 0 ? void 0 : flagEvent.data) === null || _b === void 0 ? void 0 : _b.new_state)) {
                        return;
                    }
                    const featureState = flagEvent.data.new_state;
                    if (_this.dependencies.has(featureState.feature.name)) {
                        _this.flags[featureState.feature.name] = {
                            enabled: featureState.enabled,
                            value: (_c = featureState.feature_state_value) !== null && _c !== void 0 ? _c : featureState.feature.initial_value,
                        };
                        (_d = _this === null || _this === void 0 ? void 0 : _this.onFlagUpdate) === null || _d === void 0 ? void 0 : _d.call(_this, Object.assign(Object.assign({}, _this.flags[featureState.feature.name]), { name: featureState.feature.name }));
                    }
                }
                catch (error) {
                    if (error instanceof Error) {
                        log("(Flagtron ERR) Error parsing WebSocket message:", error.message);
                    }
                }
            });
            _this.websocket.on("close", (code, reason) => {
                log(`(Flagtron ERR) WebSocket closed. Code: ${code}, Reason: ${reason.toString()}`);
                _this.reconnectWebSocket();
            });
        });
    }
    reconnectWebSocket() {
        if (this.reconnectAttempts >= this.maxReconnectAttempts) {
            log("(Flagtron ERR) Max reconnect attempts reached. Stopping WebSocket reconnection.");
            return;
        }
        this.reconnectAttempts++;
        setTimeout(() => this.listenForChanges(), this.reconnectInterval);
    }
    initialize() {
        return __awaiter(this, void 0, void 0, function* () {
            if (this.initializingPromise) {
                return this.initializingPromise;
            }
            this.initializingPromise = (() => __awaiter(this, void 0, void 0, function* () {
                if (!this.flagsmithApi || !this.flagsmithEnvironmentId) {
                    throw new Error("No Flagsmith API key or environment ID provided. Exiting.");
                }
                const flags = yield getAllFlags(this.flagsmithApi, this.flagsmithEnvironmentId);
                if (!flags.status || !flags.data) {
                    throw new Error("Error fetching initial flags from Flagsmith");
                }
                flags.data.forEach((flag) => {
                    var _a;
                    if (!this.dependencies.has(flag.feature.name)) {
                        return;
                    }
                    this.flags[flag.feature.name] = {
                        enabled: flag.enabled,
                        value: (_a = flag.feature_state_value) !== null && _a !== void 0 ? _a : flag.feature.initial_value,
                    };
                });
                yield this.listenForChanges();
                return true;
            }))();
            return this.initializingPromise;
        });
    }
    getFlag(flagName) {
        if (!this.isInitialized) {
            throw new Error("Flagtron not initialized. Call initialize() first.");
        }
        return this.flags[flagName];
    }
}

exports.Flagtron = Flagtron;
exports.default = Flagtron;
//# sourceMappingURL=index.js.map
