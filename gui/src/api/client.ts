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

const BASE_URL = 'http://127.0.0.1:8000/api';

export class BridgeClient {
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
            const response = await fetch(`${BASE_URL}/health`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Bridge unreachable');
            return await response.json();
        } catch (e) {
            return { status: 'disconnected', docker_available: false, version: '0.0.0', api_key_configured: false };
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

    static async createProject(project_id: string, mount_path: string): Promise<Project | null> {
        try {
            const response = await fetch(`${BASE_URL}/projects`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ project_id, mount_path })
            });
            if (!response.ok) throw new Error('Failed to create project');
            return await response.json();
        } catch (e) {
            console.error("Bridge Error:", e);
            return null;
        }
    }

    static async deleteProject(project_id: string): Promise<boolean> {
        try {
            const response = await fetch(`${BASE_URL}/projects/${encodeURIComponent(project_id)}`, {
                method: 'DELETE',
                headers: this.getAuthHeaders()
            });
            return response.ok;
        } catch (e) {
            console.error("Bridge Error:", e);
            return false;
        }
    }

    static async queryProject(project_id: string, question: string): Promise<QueryResponse | null> {
        try {
            const response = await fetch(`${BASE_URL}/query`, {
                method: 'POST',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ project_id, question })
            });
            if (!response.ok) throw new Error('Query failed');
            return await response.json();
        } catch (e) {
            console.error("Bridge Error:", e);
            return null;
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
            return { exists: false, valid: false, expected_path: '', manifest_dir: '', configured: false };
        }
    }

    static async getSettings(): Promise<SettingsResponse | null> {
        try {
            const response = await fetch(`${BASE_URL}/settings`, {
                headers: this.getAuthHeaders()
            });
            if (!response.ok) throw new Error('Failed to get settings');
            return await response.json();
        } catch (e) {
            return null;
        }
    }

    static async setManifestDir(manifest_dir: string): Promise<SettingsResponse | null> {
        try {
            const response = await fetch(`${BASE_URL}/settings/manifest-dir`, {
                method: 'PUT',
                headers: this.getAuthHeaders(),
                body: JSON.stringify({ manifest_dir })
            });
            if (!response.ok) throw new Error('Failed to update manifest dir');
            return await response.json();
        } catch (e) {
            console.error("Bridge Error:", e);
            return null;
        }
    }
}
