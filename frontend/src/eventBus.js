const subscribers = {};

const eventBus = {
  subscribe(event, callback) {
    if (!subscribers[event]) subscribers[event] = [];
    subscribers[event].push(callback);

    return () => this.unsubscribe(event, callback);
  },

  unsubscribe(event, callback) {
    if (!subscribers[event]) return;
    subscribers[event] = subscribers[event].filter((cb) => cb !== callback);
  },

  publish(event, data) {
    if (!subscribers[event]) return;
    subscribers[event].forEach((cb) => cb(data));
  },
};

export default eventBus;
