import { useState, useEffect } from 'react';
import { BridgeClient, BridgeEvent } from '../api/client';

export const useBridgeEvents = (maxEvents: number = 50) => {
    const [events, setEvents] = useState<BridgeEvent[]>([]);

    useEffect(() => {
        // Subscribe to bridge events
        const unsubscribe = BridgeClient.subscribe((event: BridgeEvent) => {
            setEvents(prev => {
                const updated = [event, ...prev];
                return updated.slice(0, maxEvents);
            });
        });

        return () => {
            unsubscribe();
        };
    }, [maxEvents]);

    return events;
};
