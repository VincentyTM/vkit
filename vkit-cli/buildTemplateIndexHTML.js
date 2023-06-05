module.exports = ({
	config: {
		srcDir,
		htmlHotReloadToken
	},
	fileCache,
	templateFile
}) => fileCache.get(srcDir + "/" + templateFile) || `<!DOCTYPE html>
<html>
	<head>
		<meta charset="UTF-8">
		<title>vKit CLI - Development Server</title>
		${htmlHotReloadToken}
	</head>
	<body>
		<h1>${templateFile} missing</h1>
		<p>Create a file named '${
			templateFile
		}' in the '${
			srcDir
		}' directory.</p>
	</body>
</html>`;
