import {getComponent, setComponent, getProvider, setProvider} from "./contextGuard";

import type {Component} from "./component";
import type {View} from "./view";

type Service<InstanceType> = new () => InstanceType;

type Providable<InstanceType> = {provide: new () => InstanceType};

type Config<InstanceType> = (
	{useValue: InstanceType} |
	{useFactory: () => InstanceType} |
	{useClass: new () => InstanceType} |
	{useExisting: any} |
	Providable<InstanceType>
);

type Container<InstanceType> = {
	new (
		service: Service<InstanceType>,
		serviceOrConfig: Service<InstanceType> | Config<InstanceType>
	): Container<InstanceType>,
	getInstance(component: Component | null): InstanceType,
	service: Service<InstanceType>,
	serviceOrConfig: Service<InstanceType> | Config<InstanceType>,
	instance: InstanceType | null,
	instanceCreated: boolean,
	createInstance: (
		((service: Service<InstanceType>) => InstanceType) |
		((config: Config<InstanceType>) => InstanceType)
	)
};

type Provider = {
	new (parent: Provider | null, component: Component | null): Provider,
	getContainer<InstanceType>(service: Service<InstanceType>): Container<InstanceType>,
	component: Component | null,
	containers: WeakMap<Service<any>, Container<any>> | Container<any>[],
	parent: Provider | null,
	registerService<InstanceType>(service: Service<InstanceType>): void
};

var supportsWeakMap = typeof WeakMap === "function";

function serviceFactory<InstanceType>(service: Service<InstanceType>){
	return new service();
}

function configFactory<InstanceType>(config: Config<InstanceType>): InstanceType{
	if( "useValue" in config ){
		return config.useValue;
	}
	
	if( "useFactory" in config ){
		return config.useFactory();
	}
	
	if( "useClass" in config ){
		return new config.useClass();
	}
	
	if( "useExisting" in config ){
		return inject(config.useExisting);
	}
	
	return new config.provide();
}

function Container<InstanceType>(
	this: Container<InstanceType>,
	service: Service<InstanceType>,
	serviceOrConfig: Service<InstanceType> | Config<InstanceType>
){
	this.service = service;
	this.serviceOrConfig = serviceOrConfig;
	this.instance = null;
	this.instanceCreated = false;
	this.createInstance = service === serviceOrConfig ? serviceFactory : configFactory;
}

Container.prototype.getInstance = function(component: Component | null){
	if( this.instanceCreated ){
		return this.instance;
	}
	
	var prevComponent = getComponent();
	
	try{
		setComponent(component);
		this.instance = this.createInstance(this.serviceOrConfig);
	}finally{
		setComponent(prevComponent);
	}
	
	this.instanceCreated = true;
	
	return this.instance;
};

function Provider(
	this: Provider,
	parent: Provider | null,
	component: Component | null
){
	this.parent = parent;
	this.containers = supportsWeakMap ? new WeakMap<Service<any>, Container<any>>() : [];
	this.component = component;
}

Provider.prototype.getContainer = function<InstanceType>(service: Service<InstanceType>){
	var containers = this.containers;
	
	if( containers.get ){
		return containers.get(service);
	}
	
	for(var i=containers.length; i--;){
		if( containers[i].service === service ){
			return containers[i];
		}
	}
};

Provider.prototype.registerService = function<InstanceType>(
	service: Service<InstanceType> | Config<InstanceType>
){
	var key = typeof service === "object" ? (service as Providable<InstanceType>).provide : service;
	var containers = this.containers;
	
	if( supportsWeakMap ){
		containers.set(key, new (Container as any)(key, service));
	}else{
		containers.push(new (Container as any)(key, service));
	}
};

function inject<InstanceType>(
	service: Service<InstanceType>,
	provider?: Provider | null
){
	if(!provider){
		provider = getProvider();
	}
	
	var container: Container<InstanceType> | null = null;
	
	while(!(container = provider!.getContainer(service)) && provider!.parent){
		provider = provider!.parent;
	}
	
	if(!container){
		container = new (Container as any)(service, service);
		var containers = provider!.containers as any;
		containers.set ? containers.set(service, container) : containers.push(container);
	}
	
	return container!.getInstance(provider!.component);
}

function provide(
	services: (Service<any> | Config<any>)[] | null,
	getView: () => View
){
	var component = getComponent() as Component;
	var prevProvider: Provider | null = null;
	
	if( services ){
		prevProvider = getProvider();
	}
	
	var provider = new (Provider as any)(prevProvider, component);
	
	if( services ){
		var n = services.length;
		for(var i=0; i<n; ++i){
			provider.registerService(services[i]);
		}
	}
	
	try{
		setProvider(provider);
		
		return getView();
	}finally{
		setProvider(prevProvider);
	}
}

function createProvider(
	parent: Provider | null,
	component: Component | null
){
	return new (Provider as any)(parent, component);
}

export type {Provider};

export {inject, provide, createProvider as provider};
