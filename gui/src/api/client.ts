export interface HealthResponse {
    status: string;
    docker_available: boolean;
    version: string;
}

export interface Project {
    id: string;
    path: string;
    description?: string;
}

export interface ManifestStatus {
    exists: boolean;
    path?: string;
    valid: boolean;
}

const BASE_URL = 'http://127.0.0.1:8000/api';

export class BridgeClient {
    private static getAuthHeaders(): Record<string, string> {
        // 1. Check URL for key (priority)
        const urlParams = new URLSearchParams(window.location.search);
        const urlKey = urlParams.get('key');
        if (urlKey) {
            localStorage.setItem('shesha_bridge_key', urlKey);
            // Clean up URL to keep it pretty
            const url = new URL(window.location.href);
            url.searchParams.delete('key');
            window.history.replaceState({}, '', url.toString());
        }

        // 2. Load from storage
        const key = localStorage.getItem('shesha_bridge_key') || '';
        return {
            'X-Bridge-Key': key,
            'Content-Type': 'application/json'
        };
    }

    static async checkHealth(): Promise<HealthResponse> {
        try {
            const response = await fetch(`${BASE_URL}/health`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Bridge unreachable');
            return await response.json();
        } catch (e) {
            return { status: 'disconnected', docker_available: false, version: '0.0.0' };
        }
    }

    static async getProjects(): Promise<Project[]> {
        try {
            const response = await fetch(`${BASE_URL}/projects`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to list projects');
            return await response.json();
        } catch (e) {
            console.error("Bridge Error:", e);
            return [];
        }
    }

    static async getManifest(): Promise<ManifestStatus> {
        try {
            const response = await fetch(`${BASE_URL}/manifest`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to get manifest');
            return await response.json();
        } catch (e) {
            return { exists: false, valid: false };
        }
    }
}
