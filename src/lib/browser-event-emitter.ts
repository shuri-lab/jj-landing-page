type Listener = (...args: unknown[]) => void;

export default class EventEmitter {
  private listeners = new Map<string | symbol, Listener[]>();

  on(event: string | symbol, listener: Listener): this {
    const existing = this.listeners.get(event) ?? [];
    existing.push(listener);
    this.listeners.set(event, existing);
    return this;
  }

  once(event: string | symbol, listener: Listener): this {
    const wrapped: Listener = (...args) => {
      this.removeListener(event, wrapped);
      listener(...args);
    };
    return this.on(event, wrapped);
  }

  emit(event: string | symbol, ...args: unknown[]): boolean {
    const existing = this.listeners.get(event);
    if (!existing?.length) return false;
    for (const listener of [...existing]) listener(...args);
    return true;
  }

  removeListener(event: string | symbol, listener: Listener): this {
    const existing = this.listeners.get(event);
    if (!existing) return this;
    const next = existing.filter((candidate) => candidate !== listener);
    if (next.length) this.listeners.set(event, next);
    else this.listeners.delete(event);
    return this;
  }

  off(event: string | symbol, listener: Listener): this {
    return this.removeListener(event, listener);
  }

  removeAllListeners(event?: string | symbol): this {
    if (typeof event === "undefined") this.listeners.clear();
    else this.listeners.delete(event);
    return this;
  }
}

export { EventEmitter };