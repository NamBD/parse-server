const DEFAULT_CACHE_TTL = 5 * 1000;

var redis = require('redis');

export class InMemoryCache {
  constructor({
    ttl = DEFAULT_CACHE_TTL
  }) {
    console.log('InMemoryCache');
    var client = redis.createClient('6379','luck-redis.5jot1u.0001.use1.cache.amazonaws.com');
    client.on('connect', function() {
        console.log('connected');
    });
    client.set('framework', 'node js', function(err, reply) {
        if(err) {
            console.log(err);
        } else {
            console.log(reply);
        }
    });
    client.get('framework', function(err, reply) {
        if(err) {
            console.log(err);
        } else {
            console.log(reply);
        }
    });
    this.ttl = ttl;
    this.cache = Object.create(null);
  }

  get(key) {
    let record = this.cache[key];
    if (record == null) {
      return null;
    }

    // Has Record and isnt expired
    if (isNaN(record.expire) || record.expire >= Date.now()) {
      return record.value;
    }

    // Record has expired
    delete this.cache[key];
    return null;
  }

  put(key, value, ttl = this.ttl) {
    if (ttl < 0 || isNaN(ttl)) {
      ttl = NaN;
    }

    var record = {
      value: value,
      expire: ttl + Date.now()
    }

    if (!isNaN(record.expire)) {
      record.timeout = setTimeout(() => {
        this.del(key);
      }, ttl);
    }

    this.cache[key] = record;
  }

  del(key) {
    var record = this.cache[key];
    if (record == null) {
      return;
    }

    if (record.timeout) {
      clearTimeout(record.timeout);
    }
    delete this.cache[key];
  }

  clear() {
    this.cache = Object.create(null);
  }

}

export default InMemoryCache;
