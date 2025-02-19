import Dexie, { Table } from 'dexie';
import { liveQuery } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

// Base interfaces
export type DeploymentCategory =
    | "Infrastructure"
    | "Software"
    | "Testing"
    | "Monitoring"
    | "Security"
    | "Backup"
    | "Process"
    | "Tools";

export interface Deployment {
    id: string;
    title: string;
    description: string;
    date: Date;
    category: DeploymentCategory;
    createdAt: Date;
    modifiedAt: Date;
    version: number;
    deleted?: boolean;
    sections: {
        prerequisites: Prerequisite[];
        execution: DeploymentStep[];
        postDeployment: DeploymentStep[];
    };
}

export interface DeploymentStep {
    id: string;
    deploymentId: string;
    type: 'database' | 'scripting' | 'api' | 'files' | 'mail' | 'backup' | 'monitor' | 'configure' | 'rollback' | 'service' | 'network';
    name: string;
    action: string;
    command: string;
    actor: string;
    isDone: boolean;
    version: number;
    datetime: Date;
    number: number;
}

export interface DeploymentInfo {
    id: string;
    deploymentId: string;
    information: string;
    version: number;
    modifiedAt: Date;
}

export interface Prerequisite {
    id: string;
    deploymentId: string;
    type: string;
    name: string;
    action: string;
    command: string;
    actor: string;
    isDone: boolean;
    version: number;
    modifiedAt: Date;
    number: number;
}

export interface DeviceInfo {
    id: string;
    name: string;
    ip: string;
    lastSeen: Date;
}

export interface Collaborator {
    id: string;
    deploymentId: string;
    name: string;
    lastActive: Date;
    lastSeen: number;
}

const isServer = typeof window === 'undefined';

const checkIndexedDB = () => {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
        // We're in Node.js, no need for IndexedDB
        return true;
    }

    if (!window.indexedDB) {
        console.warn(
            'IndexedDB not available. The app will work but changes won\'t be persisted.',
            '\nThis might happen if you\'re in a private browsing session.'
        );
        return false;
    }
    return true;
};

class AppDatabase extends Dexie {
    deployments!: Table<Deployment>;
    steps!: Table<DeploymentStep>;
    info!: Table<DeploymentInfo>;
    prerequisites!: Table<Prerequisite>;
    devices!: Table<DeviceInfo>;
    collaborators!: Table<Collaborator>;

    constructor() {
        if (isServer) {
            return;
        }
        super('DeploymentTracker');

        // Skip IndexedDB initialization in Node.js environment
        if (typeof window === 'undefined') {
            return;
        }

        if (!checkIndexedDB()) {
            return;
        }

        this.version(7).stores({
            devices: 'id',
            deployments: 'id, title, category, version, deleted',
            steps: 'id, deploymentId, number, version',
            info: 'id, deploymentId, version',
            prerequisites: 'id, deploymentId, number, version',
            collaborators: 'id, deploymentId'
        });

        // Fix middleware typing
        this.use({
            stack: 'dbcore',
            name: 'SyncMiddleware',
            create(downlevel) {
                return {
                    ...downlevel,
                    table(tableName) {
                        const table = downlevel.table(tableName);
                        return {
                            ...table,
                            mutate: async (req) => {
                                if ('values' in req && req.values && (req.type === 'add' || req.type === 'put')) {
                                    req.values = req.values.map(value => ({
                                        ...value,
                                        version: (value.version || 0) + 1,
                                        modifiedAt: new Date()
                                    }));
                                }
                                return table.mutate(req);
                            }
                        };
                    }
                };
            }
        });

        // Add to database middleware
        this.use({
            stack: 'dbcore',
            name: 'ConflictResolver',
            create(downlevel) {
                return {
                    ...downlevel,
                    table(tableName) {
                        return {
                            ...downlevel.table(tableName),
                            mutate: async req => {
                                if (req.type === 'put' && req.keys && req.keys.length > 0) {
                                    const tableRef = db.table(tableName);
                                    const existing = await tableRef.get(req.keys[0]);
                                    const putReq = req as unknown as { obj: { version: number } };
                                    if (existing && existing.version > putReq.obj.version) {
                                        return downlevel.table(tableName).mutate({ ...req, type: 'put' });
                                    }
                                }
                                return downlevel.table(tableName).mutate(req);
                            }
                        };
                    }
                };
            }
        });
    }

    // Real-time observable queries
    watchDeployments() {
        return liveQuery(() =>
            this.deployments
                .where('deleted')
                .equals(0)
                .toArray()
        );
    }

    watchSteps(deploymentId: string) {
        return liveQuery(() =>
            this.steps
                .where('deploymentId')
                .equals(deploymentId)
                .toArray()
        );
    }

    async getDeployment(id: string) {
        return this.deployments.get(id);
    }

    async addDeployment(deployment: Omit<Deployment, 'id'>) {
        return this.deployments.add({
            ...deployment,
            id: uuidv4()
        });
    }

    async updateDeployment(id: string, changes: Partial<Deployment>) {
        return this.deployments.update(id, changes);
    }

    async deleteDeployment(id: string) {
        return this.deployments.delete(id);
    }

    async addStep(step: Omit<DeploymentStep, 'id'>) {
        return this.steps.add({
            ...step,
            id: uuidv4()
        });
    }

    async updateStep(id: string, changes: Partial<DeploymentStep>) {
        return this.steps.update(id, changes);
    }

    async deleteStep(id: string) {
        return this.steps.delete(id);
    }

    async addInfo(info: Omit<DeploymentInfo, 'id'>) {
        return this.info.add({
            ...info,
            id: uuidv4()
        });
    }

    async updateInfo(id: number, changes: Partial<DeploymentInfo>) {
        return this.info.update(id, changes);
    }

    async deleteInfo(id: number) {
        return this.info.delete(id);
    }

    async addPrerequisite(prerequisite: Omit<Prerequisite, 'id'>) {
        return this.prerequisites.add({
            ...prerequisite,
            id: uuidv4()
        });
    }

    async updatePrerequisite(id: string, changes: Partial<Prerequisite>) {
        return this.prerequisites.update(id, changes);
    }

    async deletePrerequisite(id: string) {
        return this.prerequisites.delete(id);
    }
}

// Create a mock database for server-side
class MockDatabase {
    private deployments: Map<string, Deployment> = new Map();
    private steps: Map<string, DeploymentStep[]> = new Map();
    private prerequisites: Map<string, Prerequisite[]> = new Map();
    private info: Map<string, DeploymentInfo[]> = new Map();

    async put(table: string, data: any) {
        switch (table) {
            case 'deployments':
                this.deployments.set(data.id, data);
                break;
            case 'steps':
                const steps = this.steps.get(data.deploymentId) || [];
                steps.push(data);
                this.steps.set(data.deploymentId, steps);
                break;
            // Add other cases as needed
        }
        return data.id;
    }

    async get(table: string, id: string) {
        switch (table) {
            case 'deployments':
                return this.deployments.get(id);
            case 'steps':
                return this.steps.get(id);
            // Add other cases as needed
            default:
                return null;
        }
    }
}

// Modify the db export
export const db = isServer ? new MockDatabase() as any : new AppDatabase();

interface DatabaseError extends Error {
    name: 'DatabaseClosedError' | 'MissingAPIError';
}

const wrapDbOperation = async <T>(operation: () => Promise<T>): Promise<T> => {
    try {
        return await operation();
    } catch (error) {
        if (error instanceof Error &&
            (error.name === 'DatabaseClosedError' || error.name === 'MissingAPIError')) {
            console.warn('IndexedDB operation failed (private browsing?)', error);
            return [] as any;
        }
        throw error;
    }
};

export const setupRealtime = (deploymentId: string) => {
    let ws: WebSocket;
    let retries = 0;

    const connect = () => {
        const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
        ws = new WebSocket(`${protocol}//${window.location.host}/ws`);

        ws.onopen = () => {
            retries = 0;
            // Send initial sync message
        };

        ws.onerror = (error) => {
            console.error('WebSocket error:', error);
        };

        ws.onclose = () => {
            if (retries < 5) {
                const delay = Math.min(1000 * 2 ** retries, 30000);
                setTimeout(connect, delay);
                retries++;
            }
        };

        ws.onmessage = async (event) => {
            // Skip database operations on server
            if (isServer) return;

            const msg = JSON.parse(event.data);
            if (msg.deploymentId !== deploymentId) return;

            await db.transaction('rw', db.deployments, db.steps, db.prerequisites, db.info, () => {
                if (msg.data?.deployment) {
                    db.deployments.put(msg.data.deployment);
                    window.dispatchEvent(new Event('deployment-update'));
                }
                if (msg.data?.steps) {
                    db.steps.bulkPut(msg.data.steps);
                    window.dispatchEvent(new CustomEvent('db-update', {
                        detail: {
                            type: 'steps',
                            deploymentId
                        }
                    }));
                }
                if (msg.data?.prerequisites) db.prerequisites.bulkPut(msg.data.prerequisites);
                if (msg.data?.info) db.info.bulkPut(msg.data.info);
            });
        };
    };

    connect();
    return () => ws.close();
};

export const setupRealtimeLiveQuery = (deploymentId: string) => {
    const protocol = window.location.protocol === 'https:' ? 'wss:' : 'ws:';
    const wsUrl = `${protocol}//${window.location.host}/ws`;
    const ws = new WebSocket(wsUrl);
    ws.onmessage = async (event) => {
        // Skip database operations on server
        if (isServer) return;

        const msg = JSON.parse(event.data);
        if (msg.deploymentId !== deploymentId) return;

        await db.transaction('rw', db.deployments, db.steps, db.prerequisites, db.info, () => {
            if (msg.data?.deployment) {
                db.deployments.put(msg.data.deployment);
                window.dispatchEvent(new Event('deployment-update'));
            }
            if (msg.data?.steps) {
                db.steps.bulkPut(msg.data.steps);
                window.dispatchEvent(new CustomEvent('db-update', {
                    detail: {
                        type: 'steps',
                        deploymentId
                    }
                }));
            }
            if (msg.data?.prerequisites) db.prerequisites.bulkPut(msg.data.prerequisites);
            if (msg.data?.info) db.info.bulkPut(msg.data.info);
        });

        window.dispatchEvent(new CustomEvent('db-update', {
            detail: {
                type: 'partial',
                deploymentId
            }
        }));
    };
    return liveQuery(async () => {
        const [deployment, steps, prerequisites, info] = await Promise.all([
            db.getDeployment(deploymentId),
            db.steps.where({ deploymentId }).toArray(),
            db.prerequisites.where({ deploymentId }).toArray(),
            db.info.where({ deploymentId }).toArray()
        ]);

        // Send full state when any entity changes
        ws.send(JSON.stringify({
            type: 'SYNC_STATE',
            deploymentId,
            data: { deployment, steps, prerequisites, info },
            version: Date.now()
        }));
    });
}; 