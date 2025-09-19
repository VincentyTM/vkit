import { observable, Observable } from "./observable.js";

export interface Asset<T> {
	readonly name: string;
	error(reason: unknown): void;
	get(): T | undefined;
	isFulfilled(): boolean;
	isPending(): boolean;
	isRejected(): boolean;
	load(value: T): void;
	onError(callback: (error: unknown) => void): () => void;
	onLoad(callback: (value: T) => void): () =>void;
	onProgress(callback: (state: unknown) => void): () =>void;
	onReset(callback: () => void): () =>void;
	onUnload(callback: () => void): () =>void;
	progress(state: unknown): void;
	reset(): void;
	then(resolveHandler: (data: unknown) => void, rejectHandler: (error: unknown) => void): void;
}

interface AssetInternals<T> extends Asset<T> {
	data: unknown;
	readonly errorHandler: Observable<unknown>;
	readonly loadHandler: Observable<T>;
	readonly progressHandler: Observable<unknown>;
	refCount: number;
	readonly resetHandler: Observable<void>;
	status: number;
	readonly unload: Observable<void>;
}

export interface AssetContainer<T> {
	bind(destination: Asset<T>, loadHandler: (value: T) => void, unloadHandler: () => void): void;
	forEach(callback: (asset: Asset<T>) => void): void;
	refs(): AssetRefs<T>;
	select(name: string): Asset<T> | undefined;
}

interface AssetContainerInternals<T> extends AssetContainer<T> {
	readonly assetNeeded: ((asset: Asset<T>) => void) | undefined;
	readonly assets: Record<string, AssetInternals<T>>;
}

export interface AssetRefs<T> {
	add(name: string): Asset<T>;
	forEach(callback: (asset: Asset<T>) => void): void;
	get(name: string): T | undefined;
	has(name: string): boolean;
	remove(name: string): void;
	removeAll(): void;
	set(name: string, value: T): void;
}

interface AssetRefsInternals<T> extends AssetRefs<T> {
	readonly assetContainer: AssetContainerInternals<T>;
	readonly refs: Record<string, AssetInternals<T>>;
}

const enum AssetStatus {
	Pending,
	Fulfilled,
	Rejected,
}

export function assets<T>(assetNeeded?: (asset: Asset<T>) => void): AssetContainer<T> {
	var assets: Record<string, AssetInternals<T>> = {};
	var assetContainer: AssetContainerInternals<T> = {
		assetNeeded: assetNeeded,
		assets: assets,
		bind: bind,
		forEach: forEach,
		refs: createRefs,
		select: select
	};
	return assetContainer;
}

function createAsset<T>(name: string): AssetInternals<T> {
	var unload = observable();
	var errorHandler = observable<unknown>();
	var loadHandler = observable<T>();
	var progressHandler = observable<unknown>();
	var resetHandler = observable();
	
	return {
		data: undefined,
		error: error,
		errorHandler: errorHandler,
		get: getValue,
		isFulfilled: isFulfilled,
		isPending: isPending,
		isRejected: isRejected,
		load: load,
		loadHandler: loadHandler,
		name: name,
		onError: errorHandler.subscribe,
		onLoad: loadHandler.subscribe,
		onProgress: progressHandler.subscribe,
		onReset: resetHandler.subscribe,
		onUnload: unload.subscribe,
		progress: progress,
		progressHandler: progressHandler,
		refCount: 1,
		reset: reset,
		resetHandler: resetHandler,
		status: AssetStatus.Pending,
		then: then,
		unload: unload
	};
}

function addRef<T>(asset: AssetInternals<T>): void {
	++asset.refCount;
}

function removeRef<T>(asset: AssetInternals<T>): boolean {
	var doUnload = --asset.refCount <= 0;
	
	if (doUnload) {
		asset.reset();
		asset.unload();
		asset.unload.clear();
	}
	
	return doUnload;
}

function load<T>(this: AssetInternals<T>, value: T): void {
	if (this.status === AssetStatus.Pending) {
		this.status = AssetStatus.Fulfilled;
		this.data = value;
		this.loadHandler(value);
	}
}

function error<T>(this: AssetInternals<T>, reason: unknown): void {
	if (this.status === AssetStatus.Pending) {
		this.status = AssetStatus.Rejected;
		this.data = reason;
		this.errorHandler(reason);
	}
}

function progress<T>(this: AssetInternals<T>, state: unknown): void {
	if (this.status === AssetStatus.Pending) {
		this.progressHandler(state);
	}
}

function reset<T>(this: AssetInternals<T>): void {
	if (this.status !== AssetStatus.Pending) {
		this.status = AssetStatus.Pending;
		this.data = undefined;
		this.resetHandler();
	}
}

function getValue<T>(this: AssetInternals<T>): T | undefined {
	return this.status === AssetStatus.Fulfilled ? this.data as T : undefined;
}

function isFulfilled<T>(this: AssetInternals<T>): boolean {
	return this.status === AssetStatus.Fulfilled;
}

function isPending<T>(this: AssetInternals<T>): boolean {
	return this.status === AssetStatus.Pending;
}

function isRejected<T>(this: AssetInternals<T>): boolean {
	return this.status === AssetStatus.Rejected;
}

function then<T>(
	this: AssetInternals<T>,
	resolveHandler: (data: T) => void,
	rejectHandler: (error: unknown) => void
): void {
	var unsub = observable();
	
	if (typeof resolveHandler === "function") {
		if (this.status === AssetStatus.Fulfilled) {
			resolveHandler(this.data as T);
		} else if (this.status === AssetStatus.Pending) {
			unsub.subscribe(
				this.loadHandler.subscribe(function(value: T): void {
					unsub();
					resolveHandler(value);
				})
			);
		}
	}
	
	if (typeof rejectHandler === "function") {
		if (this.status === AssetStatus.Rejected) {
			rejectHandler(this.data);
		} else if (this.status === AssetStatus.Pending) {
			unsub.subscribe(
				this.errorHandler.subscribe(function(reason: unknown): void {
					unsub();
					rejectHandler(reason);
				})
			);
		}
	}
}

function createRefs<T>(this: AssetContainerInternals<T>): AssetRefsInternals<T> {
	return {
		assetContainer: this,
		refs: {},
		add: addToRefs,
		forEach: forEachInRefs,
		get: getFromRefs,
		has: hasInRefs,
		remove: removeFromRefs,
		removeAll: removeAllFromRefs,
		set: set
	};
}

function addToRefs<T>(this: AssetRefsInternals<T>, name: string): Asset<T> {
	var assetContainer = this.assetContainer;
	var refs = this.refs;
	var asset = refs[name];
	
	if (asset) {
		return asset;
	}
	
	refs[name] = asset = addAsset(assetContainer, name);
	return asset;
}

function forEachInRefs<T>(this: AssetRefsInternals<T>, callback: (asset: Asset<T>) => void): void {
	var refs = this.refs;

	for (var name in refs) {
		callback(refs[name]);
	}
}

function getFromRefs<T>(this: AssetRefsInternals<T>, name: string): T | undefined {
	var asset = this.refs[name];
	return asset ? asset.get() : undefined;
}

function hasInRefs<T>(this: AssetRefsInternals<T>, name: string): boolean {
	return name in this.refs;
}

function removeFromRefs<T>(this: AssetRefsInternals<T>, name: string): void {
	var assetContainer = this.assetContainer;
	var refs = this.refs;

	if (name in refs) {
		delete refs[name];
		removeAsset(assetContainer, name);
	}
}

function removeAllFromRefs<T>(this: AssetRefsInternals<T>): void {
	for (var name in this.refs) {
		this.remove(name);
	}
}

function set<T>(this: AssetRefsInternals<T>, name: string, value: T): void {
	var asset = this.add(name);
	asset.reset();
	asset.load(value);
}

function addAsset<T>(assetContainer: AssetContainerInternals<T>, name: string): AssetInternals<T> {
	var assets = assetContainer.assets;
	var assetNeeded = assetContainer.assetNeeded;
	var asset = assets[name];
	
	if (asset) {
		addRef(asset);
	} else {
		asset = assets[name] = createAsset(name);
		
		if (typeof assetNeeded === "function") {
			try {
				assetNeeded(asset);
			} catch (ex) {
				asset.error(ex);
			}
		}
	}
	
	return asset;
}

function removeAsset<T>(assetContainer: AssetContainerInternals<T>, name: string): void {
	var assets = assetContainer.assets;
	var asset = assets[name];
	
	if (asset && removeRef(asset)) {
		delete assets[name];
	}
}

function bind<T>(this: AssetContainerInternals<T>, destination: Asset<T>, loadHandler: (value: T) => void, unloadHandler: () => void): void {
	var assetContainer = this;
	var name = destination.name;
	var asset = addAsset(this, name);
	
	destination.onUnload(
		asset.onLoad(loadHandler)
	);
	
	destination.onUnload(
		asset.onError(destination.error)
	);
	
	destination.onUnload(
		asset.onReset(destination.reset)
	);
	
	if (asset.isFulfilled()) {
		loadHandler(asset.get()!);
	}
	
	destination.onUnload(function(): void {
		removeAsset(assetContainer, name);
	});
	
	if (typeof unloadHandler === "function") {
		destination.onUnload(
			asset.onUnload(unloadHandler)
		);
	}
}

function forEach<T>(this: AssetContainerInternals<T>, callback: (asset: Asset<T>) => void): void {
	var assets = this.assets;

	for (var name in assets) {
		callback(assets[name]);
	}
}
	
function select<T>(this: AssetContainerInternals<T>, name: string): Asset<T> | undefined {
	return this.assets[name];
}
