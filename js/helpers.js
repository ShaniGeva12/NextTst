export function query(selector, scope) {
	if(scope === null) throw 'query scope cannot be null';
	return (scope || document).querySelector(selector);
}

export function listen(target, type, callback, capture) {
	target.addEventListener(type, callback, !!capture);
}

/***  Task 08 - Explaining this function: ***/ 
/***  Binding events to a given DOM element (target), and calling the specific handler (given as an input as well) ***/ 
export function delegateEvent(target, selector, type, handler, capture) {
	const dispatchEvent = event => {
		const targetElement = event.target;
		const potentialElements = target.querySelectorAll(selector);
		let i = potentialElements.length;

		while (i--) {
			if (potentialElements[i] === targetElement) {
				handler.call(targetElement, event);
				break;
			}
		}
	};

	listen(target, type, dispatchEvent, !!capture);
}

export const escapeForHTML = s => s?.replace(/[&<]/g, c => c === '&' ? '&amp;' : '&lt;');

