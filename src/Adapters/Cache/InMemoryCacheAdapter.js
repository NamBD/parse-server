var redis = require('redis');

import { logger } from '../../logger';
import AppCache from '../../cache';

export class InMemoryCacheAdapter {

  constructor(ctx) {

    var redisPort = AppCache.get('redisPort');
    var redisURL = AppCache.get('redisURL');

    this.client = redis.createClient(redisPort, redisURL);
    this.client.on('connect', function() {
        logger.info('redis connected');
    });
  }

  get(key) {
    return new Promise((resolve, reject) => {
      this.client.get(key, function(error, record) {
        if (error || record == null) {
          logger.error('record not found - Key: ' + key);
          return resolve(null);
        } else {
          logger.info('record found - key: ' + key);
          return resolve(JSON.parse(record));
        }
      });
    })
  }

  put(key, value, ttl = 1800) {
    var expire = ttl > 0 && !isNaN(ttl) ? ttl : null;
    if (expire)
    {
        this.client.set(key, JSON.stringify(value), 'NX', 'EX', expire, function(error, reply) {
          if (error) {
            logger.error(error);
          } else {
            logger.info('Record Set with expire.  Key: ' + key + '  ,   expire: ' + expire);
          }
        });
    } else {
      this.client.set(key, JSON.stringify(value), function(error, reply) {
        if (error) {
          logger.error(error);
        } else {
          logger.info('Record Set without expire - Key: ' + key);
        }
      });
    }
    return Promise.resolve();
  }

  del(key) {
    this.client.del(key, function(error, reply) {
      if (error) {
        logger.error(error);
      } else {
        logger.info('Record Deleted - Key: ' + key);
      }
    });
    return Promise.resolve();
  }

  clear() {
    this.client.flushdb(function(error, reply) {
      if (error) {
        logger.error(error);
      } else {
        logger.info('All Records Flushed');
      }
    });
    return Promise.resolve();
  }
}

export default InMemoryCacheAdapter;
