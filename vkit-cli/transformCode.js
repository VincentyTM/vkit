const importRegex = /import\s+(?:(\{([^}]+)\})|(\w+)|\*\s+as\s+(\w+)|default\s+(\w+))\s+from\s+['"]([^'"]+)['"];?\r?\n?/g;
const exportRegex = /export\s+(?:const\s+(\w+)|let\s+(\w+)|var\s+(\w+)|function\s+(\w+)|async\s+function\s+(\w+)|function\s*\*\s+(\w+)|async\s*function\s*\*\s+(\w+)|class\s+(\w+))|export\s+default\s+(?:function\s+(\w+)|(\w+)|function\s*$$\s*{);?\r?\n?|export\s+\{([^}]+)\}\s*from\s*['"]([^'"]+)['"]/g;

export function removeComments(sourceCode) {
	return sourceCode
		.replace(/\/\*[\s\S]*?\*\//g, '')
		.replace(/[^:]\/\/.*(?:\r?\n|$)/g, '');
}

function extractExports(sourceCode) {
	const exports = {};
	let match;

	while ((match = exportRegex.exec(sourceCode)) !== null) {
		if (match[1] || match[2] || match[3]) {
			// Named export (const, let, var)
			const exportedName = match[1] || match[2] || match[3];
			exports[exportedName] = { original: exportedName, type: 'named' };
		} else if (match[4]) {
			// Named export (function)
			exports[match[4]] = { original: match[4], type: 'named' };
		} else if (match[5]) {
			// Named export (async function)
			exports[match[5]] = { original: match[5], type: 'named' };
		} else if (match[6]) {
			// Named export (generator function)
			exports[match[6]] = { original: match[6], type: 'named' };
		} else if (match[7]) {
			// Named export (async generator function)
			exports[match[7]] = { original: match[7], type: 'named' };
		} else if (match[8]) {
			// Named export (class)
			exports[match[8]] = { original: match[8], type: 'named' };
		} else if (match[9]) {
			// Default export (named function)
			exports['default'] = { original: match[9], type: 'default' };
		} else if (match[10]) {
			// Default export (anonymous function) -> not supported
		} else if (match[11]) {
			// Named exports with renaming or re-exporting
			const namedExports = match[11].split(',').map(exp => exp.trim());
			namedExports.forEach(exp => {
				const [localName, exportedName] = exp.split(/\s+as\s+/).map(name => name.trim());
				exports[exportedName || localName] = { original: localName, type: 'named' };
			});
		}
	}

	return exports;
}

function extractImports(sourceCode) {
	const imports = {};
	let match;

	while ((match = importRegex.exec(sourceCode)) !== null) {
		const moduleName = match[6];

		if (match[1]) {
			// Named import (e.g., { a, b })
			const namedImports = match[2].split(',').map(name => name.trim());
			namedImports.forEach(name => {
				const [importedName, alias] = name.split(/\s+as\s+/).map(n => n.trim());
				imports[alias || importedName] = { module: moduleName, type: 'named', original: importedName };
			});
		} else if (match[3]) {
			// Default import
			imports[match[3]] = { module: moduleName, type: 'default' };
		} else if (match[4]) {
			// Namespace import
			imports[match[4]] = { module: moduleName, type: 'namespace' };
		} else if (match[5]) {
			// Default import (alternative syntax)
			imports["default"] = { module: moduleName, type: 'default' };
		}
	}
	
	return imports;
}

function removeExports(code) {
	const exportRegex = /(?<!["'`])\bexport\s+(default\s+)?/g;

	return code.replace(exportRegex, (match, p1, offset, string) => {
		const before = string.slice(0, offset);
		const after = string.slice(offset + match.length);
		const isInString = /(['"`])/.test(before.slice(-1)) && !/['"`]/.test(after[0]);
		const isInComment = /\/\//.test(before.slice(-2)) || /\/\*/.test(before.slice(-3));

		if (isInString || isInComment) {
			return match;
		}

		return '';
	});
}

function removeImports(sourceCode) {
	return sourceCode.replace(importRegex, '');
}

function getModuleName(src) {
	const match = src.match(/^\.\/([a-zA-Z][a-zA-Z0-9]*)\.js$/);
	
	if (!match) {
		console.error("Invalid module path '" + src + "'");
		return src;
	}
	
	return match[1];
}

export function transformCode(moduleName, sourceCode) {
	if (moduleName === "index") {
		return '';
	}
	
	if (!sourceCode.includes('export ')) {
		return sourceCode;
	}
	
	const imports = extractImports(sourceCode);
	const exports = extractExports(sourceCode);
	
	const params = ['$'];
	
	if (sourceCode.includes('window')) {
		params.push('window');
	}
	
	if (sourceCode.includes('document')) {
		params.push('document');
	}
	
	if (sourceCode.includes('undefined')) {
		params.push('undefined');
	}
	
	if (sourceCode.includes('global')) {
		params.push('global');
	}
	
	const code = ['(function(', params.join(', ')];
	
	code.push(') {\r\n');
	
	for (const name in imports) {
		const imp = imports[name];
		
		code.push('var ', name, ' = $.', imp.original || name, ';\r\n');
	}
	
	code.push(
		'\r\n',
		removeExports(removeImports(removeComments(sourceCode))),
		'\r\n'
	);
	
	for (const name in exports) {
		const exp = exports[name];
		
		code.push(
			'\r\n$.',
			exp.type === "default" ? moduleName : name,
			' = ',
			exp.original,
			';'
		);
	}
	
	code.push(
		'\r\n\r\n})(', params.join(', ').replace('global', 'this'), ');\r\n'
	);
	
	return code.join('');
}
