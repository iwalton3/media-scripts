// ==UserScript==
// @name     MPV Shim Local Connection
// @version  2.2
// @grant GM.xmlHttpRequest
// @include  https://app.plex.tv/*
// @connect  127.0.0.1
// @description Allow Plex to connect to MPV Shim running on the same computer without a local Plex server.
// @license  MIT; https://spdx.org/licenses/MIT.html#licenseText
// @namespace https://greasyfork.org/users/456605
// ==/UserScript==

function messageHandler(event) {
    let message;
    try {
        message = JSON.parse(event.data);
    } catch(_) {
        return;
    }
    if (message.eventName != "gm_xhr_send") return;
    let parsedURL = new URL(message.url);
    parsedURL.host = "127.0.0.1:3000";
    parsedURL.protocol = "http:";
    GM.xmlHttpRequest({
        method: 'GET',
        url: parsedURL.toString(),
        headers: {
            "X-Plex-Client-Identifier": parsedURL.searchParams.get("X-Plex-Client-Identifier")
        },
        onload: function (result) {
            window.postMessage(JSON.stringify({
                eventName: "gm_xhr_recv",
                response: result.responseText,
                headers: result.responseHeaders,
                id: message.id
            }), "*");
        }
    });
}

window.addEventListener("message", messageHandler, false);

function main () {
    // From https://stackoverflow.com/questions/105034/create-guid-uuid-in-javascript
    function uuidv4() {
        return ([1e7]+-1e3+-4e3+-8e3+-1e11).replace(/[018]/g, c =>
          (c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> c / 4).toString(16)
        );
    }
    
    let clientId = localStorage.getItem('gmpx_uuid');
    if (!clientId) {
        clientId = uuidv4();
        localStorage.setItem('gmpx_uuid', clientId);
    }
  
    let serverId = localStorage.getItem('gmpx_suuid');
    if (!serverId) {
        serverId = uuidv4();
        localStorage.setItem('gmpx_suuid', serverId);
    }

    // Yes I know this is disgusting. But apparently you can't cast to a server that isn't local.
    // The Plex Web App doesn't even *try* to check for clients.
    var inject = true;
  
    var fake_cast_server_resource = {
      "name": "fake-cast-server",
      "product": "Plex Media Server",
      "productVersion": "1.18.9.2571-e106a8a91",
      "platform": "Linux",
      "platformVersion": "10 (buster)",
      "device": "PC",
      "clientIdentifier": serverId,
      "createdAt": "2000-01-01T00:00:00Z",
      "lastSeenAt": "2000-01-01T00:00:00Z",
      "provides": "server",
      "ownerId": null,
      "sourceTitle": null,
      "publicAddress": "0.0.0.0",
      "accessToken": "AAAAAAAAAAAAAAAAAAAA",
      "owned": false,
      "home": false,
      "synced": false,
      "relay": false,
      "presence": false,
      "httpsRequired": false,
      "publicAddressMatches": false,
      "dnsRebindingProtection": false,
      "natLoopbackSupported": true,
      "connections": [
        {
          "protocol": "https",
          "address": "127.0.0.1",
          "port": 32400,
          "uri": "https://fake.uri",
          "local": true,
          "relay": false,
          "IPv6": false
        }
      ]
    };

    var fake_cast_server_provider = {
      "MediaContainer": {
        "size": 1,
        "allowCameraUpload": false,
        "allowChannelAccess": false,
        "allowMediaDeletion": false,
        "allowSharing": false,
        "allowSync": false,
        "allowTuners": false,
        "backgroundProcessing": false,
        "certificate": true,
        "companionProxy": true,
        "countryCode": "usa",
        "diagnostics": "",
        "eventStream": false,
        "friendlyName": "fake-cast-server",
        "livetv": 7,
        "machineIdentifier": serverId,
        "myPlex": false,
        "myPlexMappingState": "mapped",
        "myPlexSigninState": "ok",
        "myPlexSubscription": true,
        "myPlexUsername": "admin@fake.uri",
        "ownerFeatures": "",
        "photoAutoTag": false,
        "platform": "Linux",
        "platformVersion": "10 (buster)",
        "pluginHost": false,
        "pushNotifications": false,
        "readOnlyLibraries": false,
        "streamingBrainABRVersion": 3,
        "streamingBrainVersion": 2,
        "sync": false,
        "transcoderActiveVideoSessions": 0,
        "transcoderAudio": false,
        "transcoderLyrics": false,
        "transcoderSubtitles": false,
        "transcoderVideo": false,
        "transcoderVideoBitrates": "64,96,208,320,720,1500,2000,3000,4000,8000,10000,12000,20000",
        "transcoderVideoQualities": "0,1,2,3,4,5,6,7,8,9,10,11,12",
        "transcoderVideoResolutions": "128,128,160,240,320,480,768,720,720,1080,1080,1080,1080",
        "updatedAt": 946702800,
        "updater": false,
        "version": "1.18.9.2571-e106a8a91",
        "voiceSearch": false,
        "MediaProvider": []
      }
    };
  
    window.gmpx_eventHandlers = {};
    window.gmpx_id = 0;
    const parser = new DOMParser();
    const serializer = new XMLSerializer();
    function gmpx_messageHandler(event) {
        let message;
        try {
            message = JSON.parse(event.data);
        } catch(_) {
            return;
        }
        if (message.eventName != "gm_xhr_recv") return;
        window.gmpx_eventHandlers[message.id](message);
        window.gmpx_eventHandlers[message.id] = undefined;
    }
    window.addEventListener("message", gmpx_messageHandler, false);
    function intercept(url, responseText) {
        if (url == "") return;
        let parsedURL = new URL(url);
        if (parsedURL.pathname == "/clients") {
            const xml = parser.parseFromString(responseText, "text/xml");
            const s = xml.createElement("Server")

            s.setAttribute("name", "local (direct)");
            s.setAttribute("host", "127.0.0.1");
            s.setAttribute("address", "127.0.0.1");
            s.setAttribute("port", "3000");
            s.setAttribute("machineIdentifier", clientId);
            s.setAttribute("version", "1.0");
            s.setAttribute("protocol", "plex");
            s.setAttribute("product", "Plex MPV Shim");
            s.setAttribute("deviceClass", "pc");
            s.setAttribute("protocolVersion", "1");
            s.setAttribute("protocolCapabilities", "timeline,playback,navigation,playqueues");

            xml.children[0].appendChild(s);
            inject = false;
            return serializer.serializeToString(xml);
        } else if (parsedURL.pathname == "/api/v2/resources" && parsedURL.hostname == "clients.plex.tv" && inject) {
            const parsed = JSON.parse(responseText);
            parsed.unshift(fake_cast_server_resource);
            return JSON.stringify(parsed);
        } else {
            return responseText;
        }
    }

    // From https://stackoverflow.com/questions/26447335/
    // Please note: This is very dirty in the way it works. Don't expect it to work perfectly in all areas.
    (function() {
        // create XMLHttpRequest proxy object
        var oldXMLHttpRequest = XMLHttpRequest;
        var oldWebSocket = WebSocket;
      
        WebSocket = function(url, extra) {
            var self = this;
            if (url.indexOf("fake.uri") >= 0) {
                self.override = true;
                var actual = {};
            } else {
                var actual = new oldWebSocket(url, extra);
            }
            
            // add all proxy getters/setters
            ["binaryType", "bufferedAmount", "extensions", "onclose", "onerror",
             "onmessage", "onopen", "protocol", "readyState", "url"].forEach(function(item) {
                Object.defineProperty(self, item, {
                    get: function() { return actual[item];},
                    set: function(val) { actual[item] = val;}
                });
            });
          
            // add all pure proxy pass-through methods
            ["close", "send"].forEach(function(item) {
                Object.defineProperty(self, item, {
                    value: function() {
                        if (self.override) { return; }
                        return actual[item].apply(actual, arguments);
                    }
                });
            });
        }
        
        WebSocket.CONNECTING = 0;
        WebSocket.OPEN = 1;
        WebSocket.CLOSING = 2;
        WebSocket.CLOSED = 3;

        // define constructor for my proxy object
        XMLHttpRequest = function() {
            var actual = new oldXMLHttpRequest();
            var self = this;
            self.override = false;

            this.onreadystatechange = null;

            // this is the actual handler on the real XMLHttpRequest object
            actual.onreadystatechange = function() {
                if (this.readyState == 4 && (actual.responseType == '' || actual.responseType == 'text')) {
                    try {
                        self._responseText = intercept(actual.responseURL, actual.responseText);
                    } catch (err) {
                        self._responseText = actual.responseText;
                    }
                }
                if (self.onreadystatechange) {
                    return self.onreadystatechange();
                }
            };

            // add all proxy getters/setters
            ["upload", "ontimeout, timeout", "withCredentials", "onerror", "onprogress"].forEach(function(item) {
                Object.defineProperty(self, item, {
                    get: function() { return actual[item];},
                    set: function(val) { actual[item] = val;}
                });
            });

            // add all proxy getters/setters
            ["response", "statusText", "status", "readyState", "responseURL", "responseType", "responseText"].forEach(function(item) {
                Object.defineProperty(self, item, {
                    get: function() {
                        if (self.hasOwnProperty("_" + item)) {
                            return self["_" + item];
                        } else {
                            return actual[item];
                        }
                    },
                    set: function(val) {actual[item] = val;}
                });
            });

            // add all pure proxy pass-through methods
            ["addEventListener", "abort", "getResponseHeader", "overrideMimeType", "setRequestHeader"].forEach(function(item) {
                Object.defineProperty(self, item, {
                    value: function() {
                        if (self.override) { return; }
                        return actual[item].apply(actual, arguments);
                    }
                });
            });

            self.open = function() {
                if (arguments[0] == "GET") {
                    const parsedURL = new URL(arguments[1]);
                    if (parsedURL.searchParams.get("X-Plex-Target-Client-Identifier") == clientId) {
                        const url = arguments[1];
                        self.override = true;
                        self._readyState = 1;
                        self._send = function() {
                            const id = window.gmpx_id++;
                            self._responseURL = url;
                            self._responseType = "";
                            window.gmpx_eventHandlers[id] = function(result) {
                                self._readyState = 4;
                                self._status = 200;
                                self._statusText = "OK";
                                self._responseText = result.response;
                                self.headers = result.headers;
                                if (self.onreadystatechange) {
                                    self.onreadystatechange();
                                }
                                if (self._onload) {
                                    self._onload();
                                }
                            };
                            window.postMessage(JSON.stringify({
                                eventName: "gm_xhr_send",
                                url: url,
                                id: id
                            }), "*");
                        }
                    } else if (parsedURL.hostname == "fake.uri") {
                        const url = arguments[1];
                        self.override = true;
                        self.override2 = true;
                        self._readyState = 1;
                        self._send = function() {
                            self._responseURL = url;
                            self._responseType = "";
                            self._status = 200;
                            self._statusText = "OK";
                            self._readyState = 4;
                            
                            self._responseText = "";
                            if (parsedURL.pathname == "/clients") {
                                const xml = parser.parseFromString('<MediaContainer/>', 'text/xml');
                                const s = xml.createElement("Server");
                                s.setAttribute("name", "local (direct)");
                                s.setAttribute("host", "127.0.0.1");
                                s.setAttribute("address", "127.0.0.1");
                                s.setAttribute("port", "3000");
                                s.setAttribute("machineIdentifier", clientId);
                                s.setAttribute("version", "1.0");
                                s.setAttribute("protocol", "plex");
                                s.setAttribute("product", "Plex MPV Shim");
                                s.setAttribute("deviceClass", "pc");
                                s.setAttribute("protocolVersion", "1");
                                s.setAttribute("protocolCapabilities", "timeline,playback,navigation,playqueues");
                                xml.children[0].appendChild(s);
                                self._responseText = serializer.serializeToString(xml);
                            } else if (parsedURL.pathname == "/neighborhood/devices") {
                                return "<MediaContainer size=\"0\"/>";
                            } else if (parsedURL.pathname == "/media/providers") {
                                self._responseText = JSON.stringify(fake_cast_server_provider);
                            } else if (parsedURL.pathname == "/player/proxy/poll") {
                                return;
                            } else {
                                 console.log("Unhandled URL: " + arguments[1]);
                            }

                            if (self.onreadystatechange) {
                                self.onreadystatechange();
                            }
                            if (self._onload) {
                                self._onload();
                            }
                        }
                    } else {
                        return actual.open.apply(actual, arguments);
                    }
                } else {
                    return actual.open.apply(actual, arguments);
                }
            }

            self.send = function() {
                if (self.override) {
                    self._send();
                } else {
                    return actual.send.apply(actual, arguments);
                }
            }

            self.getAllResponseHeaders = function() {
                if (self.override2) {
                    return "";
                } else if (self.override) {
                    const headers = self.headers.split("\r\n");
                    for (let i = 0; i < headers.length; i++) {
                        if (headers[i].indexOf("x-plex-client-identifier") >= 0) {
                            headers[i] = "x-plex-client-identifier: " + clientId;
                        }
                    }
                    return headers.join("\r\n");
                } else {
                    return actual.getAllResponseHeaders.apply(actual, arguments);
                }

            }

            Object.defineProperty(self, "responseXML", {
                get: function() {
                    if (self.override) {
                        return parser.parseFromString(self._responseText, "text/xml");
                    } else {
                        return actual[item];
                    }
                }
            });

            Object.defineProperty(self, "onload", {
                get: function() { if (self.override) return self._onload; return actual.onload;},
                set: function(val) { if (self.override) self._onload = val; else actual.onload = val;}
            });
        }
    })();
}

// From https://stackoverflow.com/questions/2303147/
var script = document.createElement('script');
script.appendChild(document.createTextNode('('+ main +')();'));
(document.body || document.head || document.documentElement).appendChild(script);
