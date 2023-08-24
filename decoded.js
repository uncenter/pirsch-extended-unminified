(() => {
    function findScriptTag(tag) {
        let element = document.querySelector(tag);
        if (!element) throw `Pirsch script ${element} tag not found!`;
        return element;
    }
    function isTrackingDisabled(scriptTag) {
        return (
            navigator.doNotTrack === "1" ||
            localStorage.getItem("disable_pirsch") ||
            isNotEnabledLocally(scriptTag) ||
            !shouldIncludePage(scriptTag) ||
            shouldExcludePage(scriptTag)
        );
    }
    function modifyURL(t) {
        return (
            t
                ? (t = location.href.replace(location.hostname, t))
                : (t = location.href),
            t
        );
    }
    function E(t) {
        let e = document.referrer;
        return t && (e = e.replace(location.hostname, t)), e;
    }
    function isNotEnabledLocally(scriptTag) {
        return !scriptTag.hasAttribute("data-dev") &&
            (/^localhost(.*)$|^127(\.[0-9]{1,3}){3}$/is.test(
                location.hostname
            ) ||
                location.protocol === "file:")
            ? (console.info(
                  "Pirsch is ignored on localhost. Add the data-dev attribute to enable it."
              ),
              true)
            : false;
    }
    function shouldIncludePage(scriptTag) {
        try {
            let e = scriptTag.getAttribute("data-include"),
                r = e ? e.split(",") : [];
            if (r.length) {
                let i = false;
                for (let o = 0; o < r.length; o++)
                    if (new RegExp(r[o]).test(location.pathname)) {
                        i = true;
                        break;
                    }
                if (!i) return false;
            }
        } catch (e) {
            console.error(e);
        }
        return true;
    }
    function shouldExcludePage(scriptTag) {
        try {
            let e = scriptTag.getAttribute("data-exclude"),
                r = e ? e.split(",") : [];
            for (let i = 0; i < r.length; i++)
                if (new RegExp(r[i]).test(location.pathname)) return true;
        } catch (e) {
            console.error(e);
        }
        return false;
    }
    function setupTrackingEventListeners(t, e, r, i, o, c, a, u) {
        if (history.pushState && !u) {
            let d = history.pushState;
            (history.pushState = function (p, h, l) {
                d.apply(this, [p, h, l]), initiateTracking(t, e, r, i, o, c, a);
            }),
                window.addEventListener("popstate", () =>
                    initiateTracking(t, e, r, i, o, c, a)
                );
        }
        document.body
            ? initiateTracking(t, e, r, i, o, c, a)
            : window.addEventListener("DOMContentLoaded", () =>
                  initiateTracking(t, e, r, i, o, c, a)
              );
    }
    function initiateTracking(t, e, r, i, o, c, a) {
        sendTrackingData(e, r, i, o, c, a);
        for (let u = 0; u < t.length; u++)
            sendTrackingData(t[u], r, i, o, c, a);
    }
    function sendTrackingData(t, e, r, i, o, c) {
        let a = E(t);
        (t = modifyURL(t)), i && (t = t.includes("?") ? t.split("?")[0] : t);
        let u =
                r +
                "?nc=" +
                new Date().getTime() +
                "&code=" +
                e +
                "&url=" +
                encodeURIComponent(t.substring(0, 1800)) +
                "&t=" +
                encodeURIComponent(document.title) +
                "&ref=" +
                (o ? "" : encodeURIComponent(a)) +
                "&w=" +
                (c ? "" : screen.width) +
                "&h=" +
                (c ? "" : screen.height),
            d = new XMLHttpRequest();
        d.open("GET", u), d.send();
    }
    function logPirschEvent() {
        window.pirsch = function (t, e) {
            return (
                console.log(
                    `Pirsch event: ${t}${e ? " " + JSON.stringify(e) : ""}`
                ),
                Promise.resolve(null)
            );
        };
    }
    function sendDetailedPirschEvent(t, e, r, i, o, c, a) {
        window.pirsch = function (u, d) {
            return typeof u != "string" || !u
                ? Promise.reject(
                      "The event name for Pirsch is invalid (must be a non-empty string)! Usage: pirsch('event name', {duration: 42, meta: {key: 'value'}})"
                  )
                : new Promise((p, h) => {
                      let l = d && d.meta ? d.meta : {};
                      for (let g in l)
                          l.hasOwnProperty(g) && (l[g] = String(l[g]));
                      sendPirschEventBeacon(e, r, i, o, c, a, u, d, l, p, h);
                      for (let g = 0; g < t.length; g++)
                          sendPirschEventBeacon(
                              t[g],
                              r,
                              i,
                              o,
                              c,
                              a,
                              u,
                              d,
                              l,
                              p,
                              h
                          );
                  });
        };
    }
    function sendPirschEventBeacon(t, e, r, i, o, c, a, u, d, p, h) {
        let l = E(t);
        (t = modifyURL(t)),
            i && (t = t.includes("?") ? t.split("?")[0] : t),
            navigator.sendBeacon(
                r,
                JSON.stringify({
                    identification_code: e,
                    url: t.substring(0, 1800),
                    title: document.title,
                    referrer: o ? "" : encodeURIComponent(l),
                    screen_width: c ? 0 : screen.width,
                    screen_height: c ? 0 : screen.height,
                    event_name: a,
                    event_duration:
                        u && u.duration && typeof u.duration == "number"
                            ? u.duration
                            : 0,
                    event_meta: d,
                })
            )
                ? p()
                : h("error queuing event request");
    }
    function setupPeriodicTracking(t, e, r, i, o) {
        let c = Number.parseInt(t.getAttribute("data-interval-ms"), 10) || 6e4,
            a = setInterval(() => {
                sendPeriodicTrackingData(e, r, i, o);
            }, c);
        window.pirschClearSession = () => {
            clearInterval(a);
        };
    }
    function sendPeriodicTrackingData(t, e, r, i) {
        D(e, r, i);
        for (let o = 0; o < t.length; o++) D(t[o], r, i);
    }
    function D(t, e, r) {
        t = modifyURL(t);
        let i =
                r +
                "?nc=" +
                new Date().getTime() +
                "&code=" +
                e +
                "&url=" +
                encodeURIComponent(t.substring(0, 1800)),
            o = new XMLHttpRequest();
        o.open("POST", i), o.send();
    }
    (function () {
        "use strict";
        logPirschEvent();
        let scriptTag = findScriptTag("#pirschextendedjs");
        if (isTrackingDisabled(scriptTag)) return;
        let e = [
                "7z",
                "avi",
                "csv",
                "docx",
                "exe",
                "gz",
                "key",
                "midi",
                "mov",
                "mp3",
                "mp4",
                "mpeg",
                "pdf",
                "pkg",
                "pps",
                "ppt",
                "pptx",
                "rar",
                "rtf",
                "txt",
                "wav",
                "wma",
                "wmv",
                "xlsx",
                "zip",
            ].concat(
                scriptTag
                    .getAttribute("data-download-extensions")
                    ?.split(",") || []
            ),
            r =
                scriptTag.getAttribute("data-hit-endpoint") ||
                "https://api.pirsch.io/hit",
            i =
                scriptTag.getAttribute("data-event-endpoint") ||
                "https://api.pirsch.io/event",
            o =
                scriptTag.getAttribute("data-session-endpoint") ||
                "https://api.pirsch.io/session",
            c = scriptTag.getAttribute("data-code") || "not-set",
            a = scriptTag.getAttribute("data-domain")
                ? scriptTag.getAttribute("data-domain").split(",") || []
                : [],
            u = scriptTag.hasAttribute("data-disable-page-views"),
            d = scriptTag.hasAttribute("data-disable-query"),
            p = scriptTag.hasAttribute("data-disable-referrer"),
            h = scriptTag.hasAttribute("data-disable-resolution"),
            l = scriptTag.hasAttribute("data-disable-history"),
            g = scriptTag.hasAttribute("data-disable-outbound-links"),
            _ = scriptTag.hasAttribute("data-disable-downloads"),
            F = scriptTag.hasAttribute("data-enable-sessions"),
            A = scriptTag.getAttribute("data-dev"),
            L =
                scriptTag.getAttribute("data-outbound-link-event-name") ||
                "Outbound Link Click",
            y =
                scriptTag.getAttribute("data-download-event-name") ||
                "File Download",
            W =
                scriptTag.getAttribute("data-not-found-event-name") ||
                "404 Page Not Found";
        u || setupTrackingEventListeners(a, A, c, r, d, p, h, l),
            F && setupPeriodicTracking(t, a, A, c, o),
            sendDetailedPirschEvent(a, A, c, i, d, p, h),
            document.addEventListener("DOMContentLoaded", () => {
                M(), R(), $(), j();
            });
        function M() {
            let s = document.querySelectorAll("[pirsch-event]");
            for (let n of s)
                n.addEventListener("click", () => {
                    k(n);
                }),
                    n.addEventListener("auxclick", () => {
                        k(n);
                    });
        }
        function k(s) {
            let n = s.getAttribute("pirsch-event");
            if (!n) {
                console.error(
                    "Pirsch event attribute name must not be empty!",
                    s
                );
                return;
            }
            let v = {},
                b;
            for (let f of s.attributes)
                f.name.startsWith("pirsch-meta-")
                    ? (v[f.name.substring(12)] = f.value)
                    : f.name.startsWith("pirsch-duration") &&
                      (b = Number.parseInt(f.value, 10) ?? 0);
            pirsch(n, { meta: v, duration: b });
        }
        function R() {
            let s = document.querySelectorAll("[class*='pirsch-event=']");
            for (let n of s)
                n.addEventListener("click", () => {
                    S(n);
                }),
                    n.addEventListener("auxclick", () => {
                        S(n);
                    });
        }
        function S(s) {
            let n = "",
                v = {},
                b;
            for (let f of s.classList)
                if (f.startsWith("pirsch-event=")) {
                    if (((n = f.substring(13).replaceAll("+", " ")), !n)) {
                        console.error(
                            "Pirsch event class name must not be empty!",
                            s
                        );
                        return;
                    }
                } else if (f.startsWith("pirsch-meta-")) {
                    let P = f.substring(12);
                    if (P) {
                        let w = P.split("=");
                        w.length === 2 &&
                            w[1] !== "" &&
                            (v[w[0]] = w[1].replaceAll("+", " "));
                    }
                } else
                    f.startsWith("pirsch-duration=") &&
                        (b = Number.parseInt(f.substring(16)) ?? 0);
            pirsch(n, { meta: v, duration: b });
        }
        function $() {
            let s = document.getElementsByTagName("a");
            for (let n of s)
                !n.hasAttribute("pirsch-ignore") &&
                    !n.classList.contains("pirsch-ignore") &&
                    (B(n.href) ? _ || z(n) : g || V(n));
        }
        function V(s) {
            let n = J(s.href);
            n !== null &&
                n.hostname !== location.hostname &&
                (s.addEventListener("click", () =>
                    pirsch(L, { meta: { url: n.href } })
                ),
                s.addEventListener("auxclick", () =>
                    pirsch(L, { meta: { url: n.href } })
                ));
        }
        function z(s) {
            let n = X(s.href);
            s.addEventListener("click", () => pirsch(y, { meta: { file: n } })),
                s.addEventListener("auxclick", () =>
                    pirsch(y, { meta: { file: n } })
                );
        }
        function B(s) {
            let n = s.split(".").pop().toLowerCase();
            return e.includes(n);
        }
        function J(s) {
            try {
                return new URL(s);
            } catch {
                return null;
            }
        }
        function X(s) {
            try {
                return s.toLowerCase().startsWith("http")
                    ? new URL(s).pathname
                    : s ?? "(empty)";
            } catch {
                return "(error)";
            }
        }
        function j() {
            window.pirschNotFound = function () {
                pirsch(W, { meta: { path: location.pathname } });
            };
        }
    })();
})();
