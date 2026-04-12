class EventBus {
  constructor() {
    this.store = {};
  }
  on(event, callback) {
    document.addEventListener(event, (e) => callback(e.detail));
  }
  dispatch(event, data) {
    this.store[event] = data;
    document.dispatchEvent(new CustomEvent(event, { detail: data }));
  }
  remove(event, callback) {
    document.removeEventListener(event, callback);
  }
  getLast(event) {
    return this.store[event];
  }
}

export const crisisEventBus = new EventBus();
