import { EventEmitter } from "node:events";

declare global {
  var _orderEvents: EventEmitter | undefined;
}

const CHANGED = "changed";

function getEmitter(): EventEmitter {
  if (!global._orderEvents) {
    const emitter = new EventEmitter();
    // Unbounded on purpose — one listener per connected SSE client (every
    // open Order/Pantry tab), not a fixed pool.
    emitter.setMaxListeners(0);
    global._orderEvents = emitter;
  }
  return global._orderEvents;
}

// Called by every route that mutates orders (place, update status, clear,
// auto-clear) so all connected clients get pushed a fresh snapshot.
export function broadcastOrdersChanged(): void {
  getEmitter().emit(CHANGED);
}

// Returns an unsubscribe function — callers must invoke it when the
// connection closes, or the listener (and its closure) leaks.
export function subscribeToOrderEvents(listener: () => void): () => void {
  const emitter = getEmitter();
  emitter.on(CHANGED, listener);
  return () => emitter.off(CHANGED, listener);
}
