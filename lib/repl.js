
exports = module.exports = repl;


var replDisabled = !process.env.NODE_ENV || process.env.NODE_ENV == "production"



var setEmptyNext = function() {
  repl.context.next = function() { console.log("Nothing to continue"); };
}



repl.options = {
  prompt: "REPL> ",
  input: process.stdin,
  output: process.stdout,
  useGlobal: false,
  ignoreUndefined: true
};


function ensureContextExists() {
  if(!repl.context) {
    repl.context = require('repl').start(repl.options).context;
    repl.context.stop = false;
    setEmptyNext();
  }
  if(ensureContextExists.exports) {
    for(var key in ensureContextExists.exports) {
      repl.context[key] = ensureContextExists.exports[key];
    }

    delete ensureContextExists.exports;
  }
}

// this create REPL after all initialization is done
if(!replDisabled)
  process.nextTick(ensureContextExists); 



function repl(exports) {
  // always disable on production
  if(replDisabled)
    return function connectREPLdisabled(req, res, next) { next(); };

  ensureContextExists.exports = exports

  return function connectREPL(req, res, next) {
    ensureContextExists();

    if(repl.context.stop) {
      repl.context.stop = false;
      repl.context.req = req;
      repl.context.res = res;
      console.log("Request stopped, call next() to continue");
      repl.context.next = function() {
        //don't know why setEmptyNext cannot be called immediatelly. It's a V8 bug or feature? :-)
        process.nextTick(setEmptyNext);
        console.log("Going on!");
        next.apply(null, arguments);
      };
      // do not call next(), this should do user in REPL
    } else {
      repl.context.last_req = req;
      repl.context.last_res = res;
      next();
    }
  }
};



global.REPL_EXPORT = repl.replExport = function replExport(name, value) {
  if(replDisabled) return value;

  ensureContextExists();

  console.log('REPL: Value exported to this["' + name + '"] (type ' + (typeof value) + ')');

  return repl.context[name] = value;
};



global.DEBUGGER = function DEBUGGER() {
  debugger;
};
