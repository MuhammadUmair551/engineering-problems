class MemoryEfficientCache {
    constructor(memoryLimitBytes, defaultTTLMs = 6000) {
        this.cache = new Map();
        this.memoryLimitBytes = memoryLimitBytes;
        this.currentMemory = 0;
        this.defaultTTL = defaultTTLMs;
    }

    _estimateSize(obj) {
        if (obj === null || obj === undefined) return 0;

        const type = typeof obj;

        if (type === "string") {
            return obj.length * 2;
        }

        if (type === "number") {
            return 8;
        }

        if (type === "boolean") {
            return 4;
        }

        if (type === "object") {
            let bytes = 0;

            if (Array.isArray(obj)) {
                for (let i = 0; i < obj.length; i++) {
                    bytes += this._estimateSize(obj[i]);
                }

                return bytes;
            }

            for (const key in obj) {
                if (Object.prototype.hasOwnProperty.call(obj, key)) {
                    bytes += this._estimateSize(key);
                    bytes += this._estimateSize(obj[key]);
                }
            }

            return bytes;
        }

        return 0;
    }

    get(key) {
        if (!this.cache.has(key)) {
            return null;
        }

        const entry = this.cache.get(key);

        if (entry.expiry && entry.expiry < Date.now()) {
            this.delete(key);
            return null;
        }

        this.cache.delete(key);
        this.cache.set(key, entry);

        return entry.value;
    }

    set(key, value, ttl = this.defaultTTL) {
        this.cleanExpired();

        const keySize = this._estimateSize(key);
        const valSize = this._estimateSize(value);
        const newSize = keySize + valSize;

        if (newSize > this.memoryLimitBytes) {
            console.warn(
                `[Cache Warning] Item with key "${key}" is too large...`
            );
            return false;
        }

        if (this.cache.has(key)) {
            this.delete(key);
        }

        while (
            this.currentMemory + newSize > this.memoryLimitBytes &&
            this.cache.size > 0
        ) {
            const oldestKey = this.cache.keys().next().value;

            console.log(
                `[Cache Evict] Memory Limit reached. Evicting LRU item: "${oldestKey}"`
            );

            this.delete(oldestKey);
        }

        const expiry = ttl ? Date.now() + ttl : null;

        this.cache.set(key, {
            value,
            size: newSize,
            expiry
        });

        this.currentMemory += newSize;

        return true;
    }

    delete(key) {
        if (!this.cache.has(key)) {
            return false;
        }

        const entry = this.cache.get(key);

        this.currentMemory -= entry.size;
        this.cache.delete(key);

        return true;
    }

    cleanExpired() {
        const now = Date.now();

        for (const [key, entry] of this.cache) {
            if (entry.expiry && entry.expiry < now) {
                this.delete(key);
            }
        }
    }

    getStats() {
        return {
            items: this.cache.size,
            currentMemory: this.currentMemory,
            memoryLimit: this.memoryLimitBytes,
            remainingMemory: this.memoryLimitBytes - this.currentMemory,
            keys: [...this.cache.keys()]
        };
    }
}

module.exports = MemoryEfficientCache;