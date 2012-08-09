
exports = module.exports = repl;


var context;
var replDisabled = !process.env.NODE_ENV || process.env.NODE_ENV == "production"



var setEmptyNext = function() {
  context.next = function() { console.log("Nothing to continue"); };
}



function ensureContextExists() {
  if(!context) {
    context = require('repl').start("REPL> ").context;
    context.stop = false;
    setEmptyNext();
  }
}



function repl() {
  // always disable on production
  if(replDisabled)
    return function connectREPLdisabled(req, res, next) { next(); };

  ensureContextExists();

  return function connectREPL(req, res, next) {
    if(!context)
      return next();

    if(context.stop) {
      context.stop = false;
      context.req = req;
      context.res = res;
      console.log("Request stopped, call next() to continue");
      context.next = function() {
        //don't know why setEmptyNext cannot be called immediatelly. It's a V8 bug or feature? :-)
        process.nextTick(setEmptyNext);
        console.log("Going on!");
        next.apply(null, arguments);
      };
      // do not call next(), this should do user in REPL
    } else {
      context.last_req = req;
      context.last_res = res;
      next();
    }
  }
};



GLOBAL.REPL_EXPORT = repl.replExport = function replExport(name, value) {
  if(replDisabled) return;

  ensureContextExists();

  console.log('REPL: Value exported to this["' + name + '"] (type ' + (typeof value) + ')');

  context[name] = value;
};
