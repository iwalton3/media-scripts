function getMediaTitle(media) {
    let parts = media.Part;
    for (let k = 0; k < parts.length; k++) {
        if (!parts[k].hasOwnProperty("Stream")) continue;
        let streams = parts[k].Stream;
        for (let l = 0; l < streams.length; l++) {
            if (streams[l].streamType == 1 && streams[l].hasOwnProperty("displayTitle")) {
                const format = streams[l].displayTitle.match(".* \\((.*)\\)$");
                if (format != null) return format[1] + " " + media.container;
                else return media.container;
            }
        }
    }
    return "Unknown";
}

function intercept(url, responseText) {
    if (url.indexOf("/library/metadata/") == -1 && url.indexOf("/status/sessions") == -1) return responseText;
    let response = JSON.parse(responseText);
    if (!response.hasOwnProperty("MediaContainer") ||
        !response.MediaContainer.hasOwnProperty("Metadata")) return responseText;
    const meta = response.MediaContainer.Metadata;
    for (let i = 0; i < meta.length; i++) {
        if (!meta[i].hasOwnProperty("Media")) continue;
        let medias = meta[i].Media;
        for (let j = 0; j < medias.length; j++) {
            if (!medias[j].hasOwnProperty("Part")) continue;
            if (!medias[j].hasOwnProperty("title")) medias[j].title = getMediaTitle(medias[j]);
            let parts = medias[j].Part;
            for (let k = 0; k < parts.length; k++) {
                if (!parts[k].hasOwnProperty("Stream")) continue;
                let streams = parts[k].Stream;
                for (let l = 0; l < streams.length; l++) {
                    if (!streams[l].hasOwnProperty("displayTitle") || !streams[l].hasOwnProperty("title")) continue;
                    streams[l].displayTitle = streams[l].displayTitle + " (" + streams[l].title + ")"; 
                }
            }
        }
    }
    return JSON.stringify(response);
}

// From https://stackoverflow.com/questions/26447335/
(function() {
    // create XMLHttpRequest proxy object
    var oldXMLHttpRequest = XMLHttpRequest;

    // define constructor for my proxy object
    XMLHttpRequest = function() {
        var actual = new oldXMLHttpRequest();
        var self = this;

        this.onreadystatechange = null;

        // this is the actual handler on the real XMLHttpRequest object
        actual.onreadystatechange = function() {
            if (this.readyState == 4 && (actual.responseType == '' || actual.responseType == 'text')) {
                try {
                    self._responseText = intercept(actual.responseURL, actual.responseText);
                } catch (err) {
                    console.error(err);
                }
            }
            if (self.onreadystatechange) {
                return self.onreadystatechange();
            }
        };

        // add all proxy getters/setters
        ["status", "statusText", "responseType", "response", "readyState", "responseXML",
        "upload", "ontimeout, timeout", "withCredentials", "onload", "onerror", "onprogress"].forEach(function(item) {
            Object.defineProperty(self, item, {
                get: function() {return actual[item];},
                set: function(val) {actual[item] = val;}
            });
        });

        // add all proxy getters/setters
        ["responseText"].forEach(function(item) {
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
        ["addEventListener", "send", "open", "abort", "getAllResponseHeaders",
         "getResponseHeader", "overrideMimeType", "setRequestHeader"].forEach(function(item) {
            Object.defineProperty(self, item, {
                value: function() {return actual[item].apply(actual, arguments);}
            });
        });
    }
})();