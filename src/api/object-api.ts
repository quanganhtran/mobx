import { isObservableMap, ObservableMap } from "../types/observablemap"
import {
    isObservableObject,
    IObservableObject,
    ObservableObjectAdministration,
    IIsObservableObject,
    defineObservableProperty
} from "../types/observableobject"
import { isObservableArray, IObservableArray } from "../types/observablearray"
import { fail } from "../utils/utils"
import { extendObservable } from "./extendobservable"
import { isComputedValue } from "../core/computedvalue"
import { isModifierDescriptor } from "../mobx"
import { deepEnhancer } from "../types/modifiers"

export function keys(obj: IObservableObject): string[]
export function keys(map: ObservableMap<any>): string[]
export function keys(obj: any): string[] {
    if (isObservableObject(obj)) {
        return ((obj as any) as IIsObservableObject).$mobx.getKeys()
    }
    if (isObservableMap(obj)) {
        return obj.keys()
    }
    return fail("'keys()' can only be used on observable objects and maps")
}

export function values<T = any>(obj: IObservableObject): T[]
export function values<T>(map: ObservableMap<T>): T[]
export function values<T>(ar: IObservableArray<T>): T[]
export function values(obj: any): string[] {
    if (isObservableObject(obj)) {
        return keys(obj).map(key => obj[key])
    }
    if (isObservableMap(obj)) {
        return obj.values()
    }
    if (isObservableArray(obj)) {
        return obj.slice()
    }
    return fail("'values()' can only be used on observable objects, arrays and maps")
}

export function set(obj: IObservableObject, key: string, value: any)
export function set<T>(obj: ObservableMap<T>, key: string, value: T)
export function set<T>(obj: IObservableArray<T>, index: number, value: T)
export function set(obj: any, key: any, value: any): void {
    if (isObservableObject(obj)) {
        const adm = ((obj as any) as IIsObservableObject).$mobx
        const existingObservable = adm.values[key]
        if (existingObservable) {
            existingObservable.set(value)
        } else if (isModifierDescriptor(value)) {
            defineObservableProperty(adm, key, value.initialValue, value.enhancer)
        } else {
            defineObservableProperty(adm, key, value, deepEnhancer)
        }
    } else if (isObservableMap(obj)) {
        obj.set(key, value)
    } else if (isObservableArray(obj)) {
        if (key >= obj.length) obj.length = key + 1
        obj[key] = value
    } else {
        return fail("'set()' can only be used on observable objects, arrays and maps")
    }
}

export function remove(obj: IObservableObject, key: string)
export function remove<T>(obj: ObservableMap<T>, key: string)
export function remove<T>(obj: IObservableArray<T>, index: number)
export function remove(obj: any, key: any): void {
    if (isObservableObject(obj)) {
        const adm = ((obj as any) as IIsObservableObject).$mobx
        if (!adm.values[key]) return
        if (adm.keys) {
            const keyIndex = adm.keys.indexOf(key)
            if (keyIndex !== -1) adm.keys.splice(keyIndex, 1)
        }
        delete adm.values[key]
        delete adm.target[key]
    } else if (isObservableMap(obj)) {
        obj.delete(key)
    } else if (isObservableArray(obj)) {
        obj.splice(key, 1)
    } else {
        return fail("'remove()' can only be used on observable objects, arrays and maps")
    }
}
