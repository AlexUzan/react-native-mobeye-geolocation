/**
 * Copyright (c) Mobeye.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file in the root directory of this source tree.
 *
 * @format
 */
import MobeyeGeolocation from './nativeModule';
import DEFAULT_CONFIGURATION from './defaultConfiguration';
import { Location, LocationConfiguration, LocationEvent } from './types';
import { NativeEventEmitter, PermissionStatus } from 'react-native';
import { useEffect, useState } from 'react';

/* get native module */
const { start, revertTemporaryConfiguration } = MobeyeGeolocation;

/* init default configuration */
const _configuration: LocationConfiguration = DEFAULT_CONFIGURATION;

export function configure(configuration: Partial<LocationConfiguration>): void {
    MobeyeGeolocation.configure({
        ..._configuration,
        ...configuration
    });
}

export function setTemporaryConfiguration(configuration: Partial<LocationConfiguration>): void {
    MobeyeGeolocation.setTemporaryConfiguration({
        ..._configuration,
        ...configuration
    });
}

/**
 * Get last `n` last locations computed by the service.
 * @param n last computed locations
 */
export function getLastLocations(n: number): Promise<[Location]> {
    return MobeyeGeolocation.getLastLocations(n).then((result) => {
        const locations: [Location] = JSON.parse(result);
        return locations;
    });
}

/**
 * Check location authorization for iOS.
 * To check for android just use AndroidPermissions
 */
export function checkIOSAuthorization(): Promise<boolean> {
    return MobeyeGeolocation.checkPermission();
}

/**
 * Request location authorization for iOS.
 * To request for android just use AndroidPermissions
 */
export function requestIOSAuthorization(): Promise<PermissionStatus> {
    return MobeyeGeolocation.askForPermission();
}

/* Native event emitter to catch geolocations event */
export const locationEmitter = new NativeEventEmitter(MobeyeGeolocation);

/**
 * A React Hook which updates when the location significantly changes.
 */
export function useLocation(): Location {

    const [location, setLocation] = useState<Location>({
        latitude: -1,
        longitude: -1,
        accuracy: Number.MAX_SAFE_INTEGER,
        time: 0,
    });

    useEffect(() => {
        /* get last known use position */

        getLastLocations(1).then((res) => setLocation(res[0]));

        /* subscribe to the listener */
        const subscription = locationEmitter.addListener('LOCATION_UPDATED', (result: LocationEvent) => {
            if (result.success) {
                setLocation(result.payload);
            }
        });
        return () => subscription.remove();
    }, []);

    return location;
}

export default {
    configure,
    start,
    setTemporaryConfiguration,
    revertTemporaryConfiguration,
    locationEmitter,
    getLastLocations,
    checkIOSAuthorization,
    requestIOSAuthorization,
};
