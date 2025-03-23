import { CustomTemplate } from "./Template.js";

export function isCustomTemplate(value: any): value is CustomTemplate<unknown> {
    return !!(value && typeof value.clientRender === "function");
}
