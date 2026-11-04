/*
 * Records every Pendo data beacon this frame sends, so the top frame can attribute events to the
 * frame that actually produced them. Load this synchronously in <head>, before the Pendo snippet
 * and before the parent's autoFrameInstall can reach the frame -- the agent captures references
 * to fetch/sendBeacon at load, so a later patch would miss them.
 *
 * Results land in window.__reproBeacons. Decoding is async, so an entry's `events` field is null
 * until its payload has been inflated.
 */
(function () {
    var MAX_BEACONS = 120;
    var beacons = window.__reproBeacons = [];

    // Pendo data endpoints look like https://host/data/<target>/<apiKey>?... -- ptm carries
    // analytics events, the rest are guides, logs and metrics.
    function pendoTarget(url) {
        var match = String(url || '').match(/\/data\/([^/?#]+)/);
        return match && match[1];
    }

    function base64ToBytes(value) {
        var normalized = value.replace(/-/g, '+').replace(/_/g, '/');
        while (normalized.length % 4) normalized += '=';

        var binary = atob(normalized);
        var bytes = new Uint8Array(binary.length);
        for (var i = 0; i < binary.length; i++) bytes[i] = binary.charCodeAt(i);
        return bytes;
    }

    // The agent compresses with zlib Deflate and base64s the result, so 'deflate' (not
    // 'deflate-raw') is the matching format.
    function inflate(bytes) {
        if (typeof DecompressionStream !== 'function') return Promise.resolve(null);
        try {
            var stream = new Blob([bytes]).stream().pipeThrough(new DecompressionStream('deflate'));
            return new Response(stream).text().catch(function () { return null; });
        } catch (e) {
            return Promise.resolve(null);
        }
    }

    function extractJzb(url, body) {
        var fromUrl = String(url || '').match(/[?&]jzb=([^&]*)/);
        if (fromUrl) return decodeURIComponent(fromUrl[1]);

        if (typeof body === 'string' && body) {
            var fromBody = body.match(/(?:^|&)jzb=([^&]*)/);
            return fromBody ? decodeURIComponent(fromBody[1]) : body;
        }

        return null;
    }

    // The silo shape isn't stable enough to index into, so just tally every `type` we find.
    function tallyEventTypes(payload) {
        var counts = {};

        (function walk(node, depth) {
            if (!node || depth > 8) return;
            if (Array.isArray(node)) {
                node.forEach(function (item) { walk(item, depth + 1); });
                return;
            }
            if (typeof node !== 'object') return;

            if (typeof node.type === 'string') {
                counts[node.type] = (counts[node.type] || 0) + 1;
            }
            Object.keys(node).forEach(function (key) { walk(node[key], depth + 1); });
        })(payload, 0);

        return counts;
    }

    function decode(url, body) {
        var jzb = extractJzb(url, body);
        if (!jzb) return Promise.resolve(null);

        try {
            return inflate(base64ToBytes(jzb)).then(function (text) {
                if (!text) return null;
                try { return JSON.parse(text); } catch (e) { return null; }
            });
        } catch (e) {
            return Promise.resolve(null);
        }
    }

    function record(transport, url, body) {
        try {
            var target = pendoTarget(url);
            if (!target) return;

            var entry = {
                t: Date.now(),
                transport: transport,
                target: target,
                events: null,
                payload: null
            };

            beacons.push(entry);
            if (beacons.length > MAX_BEACONS) beacons.shift();

            decode(url, body).then(function (payload) {
                if (!payload) return;
                entry.payload = payload;
                entry.events = tallyEventTypes(payload);
            });
        } catch (e) { /* instrumentation must never break the frame */ }
    }

    // Image src -- the agent's default transport for gif beacons.
    var imgSrc = Object.getOwnPropertyDescriptor(HTMLImageElement.prototype, 'src');
    if (imgSrc && imgSrc.set) {
        Object.defineProperty(HTMLImageElement.prototype, 'src', {
            configurable: true,
            enumerable: imgSrc.enumerable,
            get: imgSrc.get,
            set: function (value) {
                record('img', value, null);
                return imgSrc.set.call(this, value);
            }
        });
    }

    if (typeof window.fetch === 'function') {
        var originalFetch = window.fetch;
        window.fetch = function (input, init) {
            record('fetch', (input && input.url) || input, init && init.body);
            return originalFetch.apply(this, arguments);
        };
    }

    if (navigator.sendBeacon) {
        var originalSendBeacon = navigator.sendBeacon.bind(navigator);
        navigator.sendBeacon = function (url, data) {
            record('sendBeacon', url, typeof data === 'string' ? data : null);
            return originalSendBeacon(url, data);
        };
    }

    var originalOpen = XMLHttpRequest.prototype.open;
    var originalSend = XMLHttpRequest.prototype.send;

    XMLHttpRequest.prototype.open = function (method, url) {
        this.__reproUrl = url;
        return originalOpen.apply(this, arguments);
    };

    XMLHttpRequest.prototype.send = function (body) {
        record('xhr', this.__reproUrl, typeof body === 'string' ? body : null);
        return originalSend.apply(this, arguments);
    };
})();
