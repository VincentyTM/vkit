import fs from "fs";
import {isJS} from "./is.js";
import Library from "./Library.js";

export default class LibraryContainer {
	constructor(output){
		this.libraries = {};
		this.definitions = {};
		this.output = output;
	}
	
	async addDirectory(directory) {
		const libraries = (
			await new Promise((resolve, reject) => fs.readdir(directory, (err, files) =>
				err
					? reject("Can't access directory '" + directory + "': " + err)
					: resolve(files)
			))
		)
			.filter(isJS)
			.map(file => ({
				name: file.substring(0, file.length - 3),
				path: directory + "/" + file
			}));
		
		for (const {name, path} of libraries) {
			this.addLibrary(name, path);
		}
	}
	
	async load() {
		await Promise.all(
			Object.keys(this.libraries).map(async name => {
				return await this.libraries[name].load();
			})
		);
		
		this.findParents();
	}
	
	clear() {
		this.libraries = {};
		this.definitions = {};
	}
	
	findParents() {
		const libraries = this.libraries;
		
		for (const name in libraries) {
			const lib = libraries[name];
			const parents = {};
			
			if (name !== "core") {
				parents.core = libraries.core;
			}
			
			for (const dep in lib.dependencies) {
				const parent = this.definitions[dep];
				
				if (parent) {
					parents[parent.name] = parent;
				} else if (dep.startsWith("$.fn.")) {
					delete lib.dependencies[dep];
				} else {
					this.output.dependencyNotFound(name, dep);
				}
			}
			
			lib.parents = parents;
		}
	}
	
	addLibrary(name, path) {
		if (!/^[a-zA-Z][a-zA-Z0-9]*$/.test(name)) {
			throw new Error("Library names must match ^[a-zA-Z][a-zA-Z0-9]*$");
		}
		
		if (name in this.libraries) {
			throw new Error("Library '" + name + "' already exists");
		}
		
		const library = new Library(this, name, path);
		this.libraries[name] = library;
		return library;
	}
	
	addDefinition(def, library) {
		if (def in this.definitions) {
			throw new Error("Redefinion of '" + def + "' in " + library.name + ": already defined in " + this.definitions[def].name);
		}
		
		this.definitions[def] = library;
	}
	
	getLibraries(input) {
		if (!this.libraries.core) {
			throw new Error("The 'core' library is missing");
		}
		
		const definitions = {};
		const regexDef = /\$(\.fn)?\.[a-zA-Z_][a-zA-Z0-9_]*\b\s*=/g;
		
		for (let match; match = regexDef.exec(input);) {
			const def = match[0].replace(/\s*=/, "");
			definitions[def] = true;
		}
		
		const dependencies = {};
		const regexDep = /\$?\.[a-zA-Z_][a-zA-Z0-9_]*\b/g;
		
		for (let match; match = regexDep.exec(input);) {
			let dep = match[0];
			
			if (/^\$\.(apply|call|bind)$/.test(dep)) {
				continue;
			}
			
			if (!dep.startsWith("$.")) {
				dep = "$.fn" + dep;
			}
			
			if (!(dep in definitions)) {
				dependencies[dep] = true;
			}
		}
		
		const libraries = {};
		
		for (const dep in dependencies) {
			const lib = this.definitions[dep];
			
			if (lib) {
				libraries[lib.name] = lib;
			} else if (!dep.startsWith("$.fn.")) {
				this.output.dependencyNotDefined(dep);
			}
		}
		
		const resolved = new Set();
		
		for (const name in libraries) {
			this.resolveDependencies(libraries[name], resolved);
		}
		
		const result = Array.from(resolved.values());
		
		if (!result.length && input.includes("$")) {
			result.push(this.libraries.core);
		}
		
		return result;
	}
	
	resolveDependencies(library, resolved = new Set(), unresolved = new Set()) {
		unresolved.add(library);
		
		for (const name in library.parents) {
			const parent = library.parents[name];
			
			if (!resolved.has(parent)) {
				if (unresolved.has(parent)) {
					throw new Error("Circular dependency: '" + library.name + "' -> '" + name + "'");
				}
				
				this.resolveDependencies(parent, resolved, unresolved);
			}
		}
		
		resolved.add(library);
		unresolved.delete(library);
	}
}
