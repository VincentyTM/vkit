const fs = require("fs");

class Library {
	constructor(container, name, path){
		this.container = container;
		this.name = name;
		this.path = path;
		this.source = "";
		this.definitions = {};
		this.dependencies = {};
		this.parents = null;
	}
	async load(){
		this.source = this.transformCode(await new Promise((resolve, reject) =>
			fs.readFile(this.path, (err, content) =>
				err ? reject(err) : resolve(content.toString())
			)
		));
		this.findDefinitions();
		this.findDependencies();
	}
	transformCode(code){
		return code;
	}
	addDefinition(def){
		if(!(def in this.definitions)){
			this.definitions[def] = true;
			this.container.addDefinition(def, this);
		}
	}
	addDependency(dep){
		this.dependencies[dep] = true;
	}
	findDefinitions(){
		const input = this.source;
		const regex = /\$(\.fn)?\.[a-zA-Z_][a-zA-Z0-9_]*\b\s*=/g;
		for(let match; match = regex.exec(input);){
			const def = match[0].replace(/\s*=/, "");
			this.addDefinition(def);
		}
	}
	findDependencies(){
		const input = this.source;
		const regex = /\$(\.fn)?\.[a-zA-Z_][a-zA-Z0-9_]*\b/g;
		for(let match; match = regex.exec(input);){
			const dep = match[0];
			if(!(dep in this.definitions)){
				this.addDependency(dep);
			}
		}
	}
}

module.exports = Library;
