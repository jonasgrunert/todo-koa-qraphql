const Promise = require('bluebird');
const dbServer = require('nano')('http://admin:my_admin_password@couchdb:5984');

const resolvercontent = {
  Query: {
    // args contains state, title
    tasks(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      if (args.state) {
        return new Promise(async (resolve, reject) => {
          try {
            const result = await db.viewAsync('todos', 'byState', { 'keys': [args.state]});
            let cb =[]
            result.rows.forEach(element => {
              cb.push(element.value)
            });
            resolve(cb);
          } catch (err) {
            reject(err);
          }
        });
      }
      return new Promise( async (resolve, reject) => {
        try {
          const result = await db.viewAsync('todos', 'byDefault');
          let cb =[]
          result.rows.forEach(element => {
            cb.push(element.value)
          });
          resolve(cb);
        } catch (err) {
          reject(err);
        }
      });
    },
    task(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      if (args.id) {
        return new Promise(async (resolve, reject) => {
          try {
            const result = await db.getAsync(args.id);
            resolve(result);
          } catch (err) {
            reject(err);
          }
        });
      }
      throw new Error("Missing id");
    },
    category(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      if (args.title) {
        return new Promise(async (resolve, reject) => {
          try {
            const result = await db.viewAsync('todos', 'byCategory', { 'keys': [args.title]});
            let cb =[]
            result.rows.forEach(element => {
              cb.push(element.value)
            });
            resolve(cb);
          } catch (err) {
            reject(err);
          }
        });
      }
      throw new Error("Missing title")
    },
    place(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      if (args.title) {
        return new Promise(async (resolve, reject) => {
          try {
            const result = await db.viewAsync('todos', 'byPlace', { 'keys': [args.title]});
            let cb =[]
            result.rows.forEach(element => {
              cb.push(element.value)
            });
            resolve(cb);
          } catch (err) {
            reject(err);
          }
        });
      }
      throw new Error("Missing title")
    },
    date(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      if (args.date && (args.to || args.from)){
        throw new Error("Too many parameters");
      }
      if (args.date) {
        return new Promise(async (resolve, reject) => {
          try {
            const result = await db.viewAsync('todos', 'byDate', { 'keys': [args.date]});
            let cb =[]
            result.rows.forEach(element => {
              cb.push(element.value)
            });
            resolve(cb);
          } catch (err) {
            reject(err);
          }
        });
      }
      if (args.to && args.from){
        return new Promise(async (resolve, reject) => {
          try {
            const result = await db.viewAsync('todos', 'byDate', { 'startkey': args.from, 'endkey': args.to});
            let cb =[]
            result.rows.forEach(element => {
              cb.push(element.value)
            });
            resolve(cb);
          } catch (err) {
            reject(err);
          }
        });
      }
      throw new Error("Missing parameters");
    },
  },
  task: {
    sameDate(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      return new Promise(async (resolve, reject) => {
        try {
          const result = await db.viewAsync('todos', 'byDate', { 'keys': [obj.date] });
          let cb =[]
          result.rows.forEach(element => {
            if (obj._id !== element.value._id) {
              cb.push(element.value)
            }
          });
          resolve(cb);
        } catch (err) {
          reject(err);
        }
      });
    },
    samePlace(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      return new Promise(async (resolve, reject) => {
        try {
          const result = await db.viewAsync('todos', 'byPlace', { 'keys': [obj.place] });
          let cb =[]
          result.rows.forEach(element => {
            if (obj._id !== element.value._id) {
              cb.push(element.value)
            }
          });
          resolve(cb);
        } catch (err) {
          reject(err);
        }
      });
    },
    sameCategory(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      return new Promise(async (resolve, reject) => {
        try {
          const result = await db.viewAsync('todos', 'byCategory', { 'keys': [obj.category] });
          let cb =[]
          result.rows.forEach(element => {
            if (obj._id !== element.value._id) {
              cb.push(element.value)
            }
          });
          resolve(cb);
        } catch (err) {
          reject(err);
        }
      });
    },
  },
  Mutation: {
    editTask(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      return new Promise(async (resolve, reject) => {
        try {
          let result = await db.getAsync(args.task._id);
          result = await db.insertAsync(Object.assign(result, args.task));
          result = await db.getAsync(result.id);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    },
    createTask(obj, args, context, info){
      const db = Promise.promisifyAll(dbServer.use(context.state.user.sub));
      return new Promise(async (resolve, reject) => {
        try {
          let result = await db.insertAsync(Object.assign({state: false},args.task));
          result = await db.getAsync(result.id);
          resolve(result);
        } catch (err) {
          reject(err);
        }
      });
    }
  }
}

export default resolvercontent;
