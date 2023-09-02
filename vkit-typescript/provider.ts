import {Component} from "./component";
import {getComponent, setComponent} from "./contextGuard";
import {Config} from "./provide";

export type Provider<InstanceType> = {
    getInstance(): InstanceType;
};

function createProvider<InstanceType>(
    createInstance: (config: Config) => InstanceType,
    config: Config,
    component: Component | null
): Provider<InstanceType> {
    var instance: InstanceType | undefined;
    var instanceCreated = false;

    function getInstance(): InstanceType {
        if (instanceCreated) {
            return instance!;
        }

        var previousComponent = getComponent();

        try {
            setComponent(component);
            instance = createInstance(config);
        } finally {
            setComponent(previousComponent);
        }

        instanceCreated = true;
        return instance;
    }

    return {
        getInstance: getInstance
    };
}

export default createProvider;
