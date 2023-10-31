(() => {
	function findScriptTag(tag) {
		let element = document.querySelector(tag);
		if (!element) throw `Pirsch script ${element} tag not found!`;
		return element;
	}
	function trackingIsDisabled(scriptTag) {
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
			(/^localhost(.*)$|^127(\.[0-9]{1,3}){3}$/is.test(location.hostname) ||
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
		for (let u = 0; u < t.length; u++) sendTrackingData(t[u], r, i, o, c, a);
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
				console.log(`Pirsch event: ${t}${e ? " " + JSON.stringify(e) : ""}`),
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
						for (let g in l) l.hasOwnProperty(g) && (l[g] = String(l[g]));
						sendPirschEventBeacon(e, r, i, o, c, a, u, d, l, p, h);
						for (let g = 0; g < t.length; g++)
							sendPirschEventBeacon(t[g], r, i, o, c, a, u, d, l, p, h);
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
						u && u.duration && typeof u.duration == "number" ? u.duration : 0,
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
		if (trackingIsDisabled(scriptTag)) return;
		let fileExtensions = [
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
			scriptTag.getAttribute("data-download-extensions")?.split(",") || []
		);

		let r =
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
			A = scriptTag.getAttribute("data-dev");

		let pageviewsDisabled = scriptTag.hasAttribute("data-disable-page-views"),
			queryDisabled = scriptTag.hasAttribute("data-disable-query"),
			referrerDisabled = scriptTag.hasAttribute("data-disable-referrer"),
			resolutionDisabled = scriptTag.hasAttribute("data-disable-resolution"),
			historyDisabled = scriptTag.hasAttribute("data-disable-history"),
			outboundLinksDisabled = scriptTag.hasAttribute(
				"data-disable-outbound-links"
			),
			downloadsDisabled = scriptTag.hasAttribute("data-disable-downloads"),
			sessionsEnabled = scriptTag.hasAttribute("data-enable-sessions"),
			outboundLinkEventName =
				scriptTag.getAttribute("data-outbound-link-event-name") ||
				"Outbound Link Click",
			downloadEventName =
				scriptTag.getAttribute("data-download-event-name") || "File Download",
			notFoundEventName =
				scriptTag.getAttribute("data-not-found-event-name") ||
				"404 Page Not Found";

		!pageviewsDisabled &&
			setupTrackingEventListeners(
				a,
				A,
				c,
				r,
				queryDisabled,
				referrerDisabled,
				resolutionDisabled,
				historyDisabled
			),
			sessionsEnabled && setupPeriodicTracking(t, a, A, c, o),
			sendDetailedPirschEvent(
				a,
				A,
				c,
				i,
				queryDisabled,
				referrerDisabled,
				resolutionDisabled
			),
			document.addEventListener("DOMContentLoaded", () => {
				addAttributeBasedEventListeners(),
					addClassBasedEventListeners(),
					findLinkElements(),
					j();
			});
		function addAttributeBasedEventListeners() {
			let elements = document.querySelectorAll("[pirsch-event]");
			for (let element of elements)
				element.addEventListener("click", () => {
					sendAttributeBasedEvent(element);
				}),
					element.addEventListener("auxclick", () => {
						sendAttributeBasedEvent(element);
					});
		}
		function sendAttributeBasedEvent(element) {
			let eventName = element.getAttribute("pirsch-event");
			if (!eventName) {
				console.error(
					"Pirsch event attribute name must not be empty!",
					element
				);
				return;
			}
			let meta = {},
				duration;
			for (let attribute of element.attributes)
				attribute.name.startsWith("pirsch-meta-")
					? (meta[attribute.name.substring(12)] = attribute.value)
					: attribute.name.startsWith("pirsch-duration") &&
					  (duration = Number.parseInt(attribute.value, 10) ?? 0);
			pirsch(eventName, { meta: meta, duration: duration });
		}
		function addClassBasedEventListeners() {
			let elements = document.querySelectorAll("[class*='pirsch-event=']");
			for (let element of elements)
				element.addEventListener("click", () => {
					sendClassBasedEvent(element);
				}),
					element.addEventListener("auxclick", () => {
						sendClassBasedEvent(element);
					});
		}
		function sendClassBasedEvent(element) {
			let name = "",
				meta = {},
				duration;
			for (let className of element.classList)
				if (className.startsWith("pirsch-event=")) {
					// You can combine classes with + symbols, i.e. "pirsch-event=event+with+spaces" -> "event with spaces"
					if (((name = className.substring(13).replaceAll("+", " ")), !name)) {
						console.error(
							"Pirsch event class name must not be empty!",
							element
						);
						return;
					}
				} else if (className.startsWith("pirsch-meta-")) {
					let arbitraryDataKey = className.substring(12);
					if (arbitraryDataKey) {
						let keyAndValue = arbitraryDataKey.split("=");
						keyAndValue.length === 2 &&
							keyAndValue[1] !== "" &&
							(meta[keyAndValue[0]] = keyAndValue[1].replaceAll("+", " "));
					}
				} else
					className.startsWith("pirsch-duration=") &&
						(duration = Number.parseInt(className.substring(16)) ?? 0);
			pirsch(name, { meta: meta, duration: duration });
		}
		function findLinkElements() {
			let linkElements = document.getElementsByTagName("a");
			for (let linkElement of linkElements)
				!linkElement.hasAttribute("pirsch-ignore") &&
					!linkElement.classList.contains("pirsch-ignore") &&
					(isDownloadFileExtension(linkElement.href)
						? downloadsDisabled || addDownloadEventListeners(linkElement)
						: outboundLinksDisabled || addLinkEventListeners(linkElement));
		}
		function addLinkEventListeners(element) {
			let url = urlify(element.href);
			url !== null &&
				url.hostname !== location.hostname &&
				(element.addEventListener("click", () =>
					pirsch(outboundLinkEventName, { meta: { url: url.href } })
				),
				element.addEventListener("auxclick", () =>
					pirsch(outboundLinkEventName, { meta: { url: url.href } })
				));
		}
		function addDownloadEventListeners(s) {
			let pathname = getFilePathname(s.href);
			s.addEventListener("click", () =>
				pirsch(downloadEventName, { meta: { file: pathname } })
			),
				s.addEventListener("auxclick", () =>
					pirsch(downloadEventName, { meta: { file: pathname } })
				);
		}
		function isDownloadFileExtension(href) {
			let extension = href.split(".").pop().toLowerCase();
			return fileExtensions.includes(extension);
		}
		function urlify(s) {
			try {
				return new URL(s);
			} catch {
				return null;
			}
		}
		function getFilePathname(href) {
			try {
				return href.toLowerCase().startsWith("http")
					? new URL(href).pathname
					: href ?? "(empty)";
			} catch {
				return "(error)";
			}
		}
		function j() {
			window.pirschNotFound = function () {
				pirsch(notFoundEventName, { meta: { path: location.pathname } });
			};
		}
	})();
})();
