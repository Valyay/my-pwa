const CACHE_NAME = "vid-voter-v3";
const URLS_CACHE_ONLY = [
	"/css/bootstrap.min.css",
	"/js/bootstrap.min.js",
	"/js/jquery-3.3.1.min.js",
	"/image/cover.jpg",
	"/image/did-logo.png",

	"/image/coffee1.jpg",
	"/image/coffee2.jpg",
	"/image/coffee3.jpg",
	"/image/coffee4.jpg",
	"/image/coffee5.jpg",
	"/image/coffee6.jpg",
	"/image/coffee7.jpg",
	"/image/coffee8.jpg",
	"/image/coffee9.jpg",

	// font-awesome
	"/css/all.min.css",
	"/webfonts/fa-brands-400.eot",
	"/webfonts/fa-brands-400.svg",
	"/webfonts/fa-brands-400.ttf",
	"/webfonts/fa-brands-400.woff",
	"/webfonts/fa-brands-400.woff2",
	"/webfonts/fa-regular-400.eot",
	"/webfonts/fa-regular-400.svg",
	"/webfonts/fa-regular-400.ttf",
	"/webfonts/fa-regular-400.woff",
	"/webfonts/fa-regular-400.woff2",
	"/webfonts/fa-solid-900.eot",
	"/webfonts/fa-solid-900.svg",
	"/webfonts/fa-solid-900.ttf",
	"/webfonts/fa-solid-900.woff",
	"/webfonts/fa-solid-900.woff2"
];

const URLS_OVER_NETWORK_WITH_CACHE_FALLBACK = [
	"/index.html",
	"/voter.html",
	"/offline.html",
	"/css/app.css",
	"/css/cover.css",
	"/js/app.js",
	"/js/voter/voter.js"
];

self.addEventListener("install", function(event) {
	event.waitUntil(
		caches
			.open(CACHE_NAME)
			.then(function(cache) {
				return cache.addAll(
					URLS_CACHE_ONLY.concat(URLS_OVER_NETWORK_WITH_CACHE_FALLBACK)
				);
			})
			.catch(err => {
				console.error(err);
				return new Promise((resolve, reject) => {
					reject("ERROR: " + err);
				});
			})
	);
});

self.addEventListener("fetch", function(event) {
	const requestURL = new URL(event.request.url);

	if (requestURL.pathname === "/") {
		event.respondWith(getByNetworkFallingBackByCache("/index.html"));
	} else if (
		URLS_OVER_NETWORK_WITH_CACHE_FALLBACK.includes(requestURL.href) ||
		URLS_OVER_NETWORK_WITH_CACHE_FALLBACK.includes(requestURL.pathname)
	) {
		event.respondWith(getByNetworkFallingBackByCache(event.request));
	} else if (
		URLS_CACHE_ONLY.includes(requestURL.href) ||
		URLS_CACHE_ONLY.includes(requestURL.pathname)
	) {
		event.respondWith(getByCacheOnly(event.request));
	}
});

self.addEventListener("activate", function(event) {
	event.waitUntil(
		caches.keys().then(function(cacheNames) {
			return Promise.all(
				cacheNames.map(function(cacheName) {
					if (CACHE_NAME !== cacheName && cacheName.startsWith("vid-voter")) {
						return caches.delete(cacheName);
					}
				})
			);
		})
	);
});

/**
 * 1. We fetch the request over the network
 * 2. If successful we add the new response to the cache
 * 3. If failed we return the result from the cache
 *
 * @param request
 * @param showAlert
 * @returns Promise
 */
const getByNetworkFallingBackByCache = (request, showAlert = false) => {
	return caches.open(CACHE_NAME).then(cache => {
		return fetch(request)
			.then(networkResponse => {
				cache.put(request, networkResponse.clone());
				return networkResponse;
			})
			.catch(() => {
				if (showAlert) {
					alert("You are in offline mode. The data may be outdated.");
				}

				return caches.match(request);
			});
	});
};

/**
 * Get from cache
 *
 * @param request
 * @returns Promise
 */
const getByCacheOnly = request => {
	return caches.open(CACHE_NAME).then(cache => {
		return cache.match(request).then(response => {
			return response;
		});
	});
};
