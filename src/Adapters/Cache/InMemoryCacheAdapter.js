var redis = require('redis');

export class InMemoryCacheAdapter {

  constructor(ctx) {
    this.client = redis.createClient('6379','luck-redis.5jot1u.0001.use1.cache.amazonaws.com');
    this.client.on('connect', function() {
        console.log('connected');
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, function(error, record) {
        if (error || record == null) {
          console.log('record not found');
          return resolve(null);
        } else {
          console.log('record found:');
          console.log(JSON.parse(record));
          return resolve(JSON.parse(record));
        }
      });
    })
  }

  put(key, value, ttl = 1800) {
    this.client.set(key, JSON.stringify(value), function(error, reply) {
      if (error) {
        console.log(error);
      } else {
        if (ttl > 0 && !isNaN(ttl)) {
          this.client.expire(key, ttl);
        }
        console.log('Record Set');
      }
    });
    return Promise.resolve();
  }

  del(key) {
    this.client.del(key, function(error, reply) {
      if (error) {
        console.log(error);
      } else {
        console.log('Record Deleted');
      }
    });
    return Promise.resolve();
  }

  clear() {
    //this.cache.clear();
    return Promise.resolve();
  }
}

export default InMemoryCacheAdapter;
