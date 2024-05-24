export interface CacheAdapter<Options> {
	options: Options;
	get(key: string): Promise<any>;
	set(key: string, value: any, ttl?: number): Promise<void>;
	delete(key: string): Promise<void>;
	clear(): Promise<void>;
}
