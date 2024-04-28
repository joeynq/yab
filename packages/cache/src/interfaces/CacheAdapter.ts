export abstract class CacheAdapter {
	abstract get(key: string): Promise<any>;
	abstract set(key: string, value: any): Promise<void>;
	abstract delete(key: string): Promise<void>;
}
