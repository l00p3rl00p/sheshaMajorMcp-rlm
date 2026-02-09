export interface HealthResponse {
    status: string;
    docker_available: boolean;
    version: string;
    api_key_configured: boolean;
}

export interface Project {
    id: string;
    path: string;
    description?: string;
}

export interface ManifestStatus {
    exists: boolean;
    path?: string;
    expected_path: string;
    manifest_dir: string;
    configured: boolean;
    valid: boolean;
}

export interface SettingsResponse {
    manifest_dir: string;
    configured: boolean;
}

export interface QueryResponse {
    answer: string;
}

export interface ToolInfo {
    name: string;
    description: string;
}

export interface CapabilitiesResponse {
    tools: ToolInfo[];
    system_prompt_preview: string;
}

// --- Event Bus ---
export type BridgeEventType = 'req' | 'res' | 'err';

export interface BridgeEvent {
    id: string;
    timestamp: number;
    type: BridgeEventType;
    method: string;
    payload?: any;
    duration?: number; // for responses
}

type BridgeEventListener = (event: BridgeEvent) => void;

const BASE_URL = window.location.port === '8000' ? '/api' : 'http://127.0.0.1:8000/api';

export class BridgeClient {
    private static listeners: BridgeEventListener[] = [];

    static subscribe(listener: BridgeEventListener): () => void {
        this.listeners.push(listener);
        return () => {
            this.listeners = this.listeners.filter(l => l !== listener);
        };
    }

    private static emit(event: BridgeEvent) {
        this.listeners.forEach(l => l(event));
    }

    private static async request<T>(method: string, endpoint: string, body?: any): Promise<T> {
        const id = Math.random().toString(36).substring(7);
        const start = Date.now();
        const EventMethod = endpoint.replace('/api/', ''); // simplified method name

        this.emit({
            id,
            timestamp: start,
            type: 'req',
            method: EventMethod,
            payload: body
        });

        try {
            const response = await fetch(`${BASE_URL}${endpoint}`, {
                method,
                headers: this.getAuthHeaders(),
                body: body ? JSON.stringify(body) : undefined
            });

            if (!response.ok) {
                const errorText = await response.text();
                throw new Error(errorText || response.statusText);
            }

            const data = await response.json();
            this.emit({
                id,
                timestamp: Date.now(),
                type: 'res',
                method: EventMethod,
                payload: data,
                duration: Date.now() - start
            });
            return data;
        } catch (e: any) {
            this.emit({
                id,
                timestamp: Date.now(),
                type: 'err',
                method: EventMethod,
                payload: { message: e.message },
                duration: Date.now() - start
            });
            throw e;
        }
    }

    static getBridgeKey(): string {
        return localStorage.getItem('shesha_bridge_key') || '';
    }

    static setBridgeKey(key: string): void {
        const trimmed = key.trim();
        if (trimmed) {
            localStorage.setItem('shesha_bridge_key', trimmed);
        } else {
            localStorage.removeItem('shesha_bridge_key');
        }
    }

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
        const headers: Record<string, string> = { 'Content-Type': 'application/json' };
        if (key) {
            headers['X-Bridge-Key'] = key;
        }
        return headers;
    }

    static async checkHealth(): Promise<HealthResponse> {
        try {
            return await this.request<HealthResponse>('GET', '/health');
        } catch (e) {
            return { status: 'disconnected', docker_available: false, version: '0.0.0', api_key_configured: false };
        }
    }

    static async getProjects(): Promise<Project[]> {
        try {
            return await this.request<Project[]>('GET', '/projects');
        } catch (e) {
            console.error("Bridge Error:", e);
            return [];
        }
    }

    static async createProject(project_id: string, mount_path: string): Promise<Project | null> {
        try {
            return await this.request<Project>('POST', '/projects', { project_id, mount_path });
        } catch (e) {
            console.error("Bridge Error:", e);
            return null;
        }
    }

    static async deleteProject(project_id: string): Promise<boolean> {
        try {
            await this.request('DELETE', `/projects/${encodeURIComponent(project_id)}`);
            return true;
        } catch (e) {
            console.error("Bridge Error:", e);
            return false;
        }
    }

    static async queryProject(project_id: string, question: string): Promise<QueryResponse | null> {
        try {
            return await this.request<QueryResponse>('POST', '/query', { project_id, question });
        } catch (e) {
            console.error("Bridge Error:", e);
            return null;
        }
    }

    static async getManifest(): Promise<ManifestStatus> {
        try {
            return await this.request<ManifestStatus>('GET', '/manifest');
        } catch (e) {
            return { exists: false, valid: false, expected_path: '', manifest_dir: '', configured: false };
        }
    }

    static async getSettings(): Promise<SettingsResponse | null> {
        try {
            return await this.request<SettingsResponse>('GET', '/settings');
        } catch (e) {
            return null;
        }
    }

    static async setManifestDir(manifest_dir: string): Promise<SettingsResponse | null> {
        try {
            return await this.request<SettingsResponse>('PUT', '/settings/manifest-dir', { manifest_dir });
        } catch (e) {
            console.error("Bridge Error:", e);
            return null;
        }
    }

    static async getCapabilities(): Promise<CapabilitiesResponse | null> {
        try {
            return await this.request<CapabilitiesResponse>('GET', '/capabilities');
        } catch (e) {
            console.error("Bridge Error:", e);
            return null;
        }
    }
}
