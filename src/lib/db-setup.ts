import Dexie, { Table } from 'dexie';
import { liveQuery } from 'dexie';
import { v4 as uuidv4 } from 'uuid';

// Base interfaces
export interface Deployment {
    id: string;
    title: string;
    description: string;
    date: Date;
    category: string;
    createdAt: Date;
    modifiedAt: Date;
    version: number;
    deleted?: boolean;
}

export interface DeploymentStep {
    id: string;
    deploymentId: string;
    type: 'database' | 'scripting' | 'api' | 'files' | 'mail' | 'backup' | 'monitor' | 'configure' | 'rollback' | 'service' | 'network';
    name: string;
    action: string;
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
}

class AppDatabase extends Dexie {
    deployments!: Table<Deployment>;
    steps!: Table<DeploymentStep>;
    info!: Table<DeploymentInfo>;
    prerequisites!: Table<Prerequisite>;
    devices!: Table<DeviceInfo>;
    collaborators!: Table<Collaborator>;

    constructor() {
        super('DeploymentTracker');

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
                                        return;
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

export const db = new AppDatabase();

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