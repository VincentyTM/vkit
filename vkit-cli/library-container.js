const fs = require("fs");
const Library = require("./library.js");

class LibraryContainer {
	constructor(path){
		this.path = path;
		this.libraries = {};
		this.definitions = {};
	}
	async getLibraryNames(){
		return (await new Promise((resolve, reject) =>
			fs.readdir(this.path, (err, files) =>
				err ? reject("Can't access directory '" + this.path + "': " + err) : resolve(files)
			)
		)).filter(file => file.endsWith(".js")).map(file => file.substring(0, file.length - 3));
	}
	async loadAll(){
		const libraries = await this.getLibraryNames();
		for(const name of libraries){
			this.addLibrary(name);
		}
		try{
			for(const name in this.libraries){
				await this.libraries[name].load();
			}
			this.findParents();
		}catch(ex){
			this.unloadAll();
			console.error("Failed to load a library:");
			console.error(ex);
		}
	}
	unloadAll(){
		this.libraries = {};
		this.definitions = {};
	}
	findParents(){
		const libraries = this.libraries;
		for(const name in libraries){
			const lib = libraries[name];
			const parents = {};
			for(const dep in lib.dependencies){
				const parent = this.definitions[dep];
				if( parent ){
					parents[parent.name] = parent;
				}else{
					console.warn("Warning: In library '" + name + "' the '" + dep + "' dependency is not defined!");
				}
			}
			lib.parents = parents;
		}
	}
	addLibrary(name){
		if(!/^[a-z]+$/.test(name)){
			throw "Library names must only contain [a-z]!";
		}
		if( name in this.libraries ){
			throw "Library '" + name + "' already exists!";
		}
		const library = new Library(this, name, this.path + "/" + name + ".js");
		this.libraries[name] = library;
		return library;
	}
	addDefinition(def, library){
		if( def in this.definitions ){
			throw "Redefinion of '" + def + "' in " + library.name + " already present in " + this.definitions[def].name + "!";
		}
		this.definitions[def] = library;
	}
	getLibraries(input){
		const definitions = {};
		const regexDef = /\$(\.[a-zA-Z_][a-zA-Z0-9_]*)+\b\s*=/g;
		for(let match; match = regexDef.exec(input);){
			const def = match[0].replace(/\s*=/, "");
			definitions[def] = true;
		}
		const dependencies = {};
		const extraDependencies = {};
		const regexDep = /\$?(\.[a-zA-Z_][a-zA-Z0-9_]*)+\b/g;
		for(let match; match = regexDep.exec(input);){
			const dep = match[0];
			if( dep.startsWith("$.") ){
				if(!(dep in definitions)){
					dependencies[dep] = true;
				}
			}else{
				extraDependencies["$.fn" + dep] = true;
			}
		}
		const libraries = {};
		for(const dep in dependencies){
			const lib = this.definitions[dep];
			if( lib ){
				libraries[lib.name] = lib;
			}else{
				console.warn("Warning: " + dep + " is not defined in any library!");
			}
		}
		for(const dep in extraDependencies){
			const lib = this.definitions[dep];
			if( lib ){
				libraries[lib.name] = lib;
			}
		}
		const resolved = new Set();
		for(const name in libraries){
			this.resolveDependencies(libraries[name], resolved);
		}
		return this.libraries.core ? [this.libraries.core].concat(Array.from(resolved.values())) : [];
	}
	resolveDependencies(library, resolved = new Set(), unresolved = new Set()){
		unresolved.add(library);
		for(const name in library.parents){
			const parent = library.parents[name];
			if(!resolved.has(parent)){
				if( unresolved.has(parent) ){
					throw "Circular dependency: '" + library.name + "' -> '" + name + "'";
				}
				this.resolveDependencies(parent, resolved, unresolved);
			}
		}
		resolved.add(library);
		unresolved.delete(library);
	}
}

module.exports = LibraryContainer;
