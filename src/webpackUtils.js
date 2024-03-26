function loadDynamicScript(url) {
	return new Promise((resolve, reject) => {
		const element = document.createElement('script');
		element.src = url;
		element.type = 'text/javascript';
		element.async = true;
		element.onload = () => {
			resolve();
			element.parentNode.removeChild(element);
		};
		element.onerror = () => reject(`Script loading error: ${url}`);
		document.head.appendChild(element);
	});
}

async function loadWebpackModule(scope, component) {
	await __webpack_init_sharing__('default');
	const container = window[scope];
	await container.init(__webpack_share_scopes__.default);
	const factory = await window[scope].get(component);
	return factory();
}

export async function webpackInit() {
	await loadDynamicScript('http://localhost:8080/remoteEntry.js');
	const module = await loadWebpackModule('core', './Store');
	return module.default();
}
