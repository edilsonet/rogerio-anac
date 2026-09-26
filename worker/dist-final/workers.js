var __defProp = Object.defineProperty;
var __name = (target, value) => __defProp(target, "name", { value, configurable: true });

// node_modules/unenv/dist/runtime/_internal/utils.mjs
// @__NO_SIDE_EFFECTS__
function createNotImplementedError(name) {
  return new Error(`[unenv] ${name} is not implemented yet!`);
}
__name(createNotImplementedError, "createNotImplementedError");
// @__NO_SIDE_EFFECTS__
function notImplemented(name) {
  const fn = /* @__PURE__ */ __name(() => {
    throw /* @__PURE__ */ createNotImplementedError(name);
  }, "fn");
  return Object.assign(fn, { __unenv__: true });
}
__name(notImplemented, "notImplemented");
// @__NO_SIDE_EFFECTS__
function notImplementedClass(name) {
  return class {
    __unenv__ = true;
    constructor() {
      throw new Error(`[unenv] ${name} is not implemented yet!`);
    }
  };
}
__name(notImplementedClass, "notImplementedClass");

// node_modules/unenv/dist/runtime/node/internal/perf_hooks/performance.mjs
var _timeOrigin = globalThis.performance?.timeOrigin ?? Date.now();
var _performanceNow = globalThis.performance?.now ? globalThis.performance.now.bind(globalThis.performance) : () => Date.now() - _timeOrigin;
var nodeTiming = {
  name: "node",
  entryType: "node",
  startTime: 0,
  duration: 0,
  nodeStart: 0,
  v8Start: 0,
  bootstrapComplete: 0,
  environment: 0,
  loopStart: 0,
  loopExit: 0,
  idleTime: 0,
  uvMetricsInfo: {
    loopCount: 0,
    events: 0,
    eventsWaiting: 0
  },
  detail: void 0,
  toJSON() {
    return this;
  }
};
var PerformanceEntry = class {
  static {
    __name(this, "PerformanceEntry");
  }
  __unenv__ = true;
  detail;
  entryType = "event";
  name;
  startTime;
  constructor(name, options) {
    this.name = name;
    this.startTime = options?.startTime || _performanceNow();
    this.detail = options?.detail;
  }
  get duration() {
    return _performanceNow() - this.startTime;
  }
  toJSON() {
    return {
      name: this.name,
      entryType: this.entryType,
      startTime: this.startTime,
      duration: this.duration,
      detail: this.detail
    };
  }
};
var PerformanceMark = class PerformanceMark2 extends PerformanceEntry {
  static {
    __name(this, "PerformanceMark");
  }
  entryType = "mark";
  constructor() {
    super(...arguments);
  }
  get duration() {
    return 0;
  }
};
var PerformanceMeasure = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceMeasure");
  }
  entryType = "measure";
};
var PerformanceResourceTiming = class extends PerformanceEntry {
  static {
    __name(this, "PerformanceResourceTiming");
  }
  entryType = "resource";
  serverTiming = [];
  connectEnd = 0;
  connectStart = 0;
  decodedBodySize = 0;
  domainLookupEnd = 0;
  domainLookupStart = 0;
  encodedBodySize = 0;
  fetchStart = 0;
  initiatorType = "";
  name = "";
  nextHopProtocol = "";
  redirectEnd = 0;
  redirectStart = 0;
  requestStart = 0;
  responseEnd = 0;
  responseStart = 0;
  secureConnectionStart = 0;
  startTime = 0;
  transferSize = 0;
  workerStart = 0;
  responseStatus = 0;
};
var PerformanceObserverEntryList = class {
  static {
    __name(this, "PerformanceObserverEntryList");
  }
  __unenv__ = true;
  getEntries() {
    return [];
  }
  getEntriesByName(_name, _type) {
    return [];
  }
  getEntriesByType(type) {
    return [];
  }
};
var Performance = class {
  static {
    __name(this, "Performance");
  }
  __unenv__ = true;
  timeOrigin = _timeOrigin;
  eventCounts = /* @__PURE__ */ new Map();
  _entries = [];
  _resourceTimingBufferSize = 0;
  navigation = void 0;
  timing = void 0;
  timerify(_fn, _options) {
    throw createNotImplementedError("Performance.timerify");
  }
  get nodeTiming() {
    return nodeTiming;
  }
  eventLoopUtilization() {
    return {};
  }
  markResourceTiming() {
    return new PerformanceResourceTiming("");
  }
  onresourcetimingbufferfull = null;
  now() {
    if (this.timeOrigin === _timeOrigin) {
      return _performanceNow();
    }
    return Date.now() - this.timeOrigin;
  }
  clearMarks(markName) {
    this._entries = markName ? this._entries.filter((e) => e.name !== markName) : this._entries.filter((e) => e.entryType !== "mark");
  }
  clearMeasures(measureName) {
    this._entries = measureName ? this._entries.filter((e) => e.name !== measureName) : this._entries.filter((e) => e.entryType !== "measure");
  }
  clearResourceTimings() {
    this._entries = this._entries.filter((e) => e.entryType !== "resource" || e.entryType !== "navigation");
  }
  getEntries() {
    return this._entries;
  }
  getEntriesByName(name, type) {
    return this._entries.filter((e) => e.name === name && (!type || e.entryType === type));
  }
  getEntriesByType(type) {
    return this._entries.filter((e) => e.entryType === type);
  }
  mark(name, options) {
    const entry = new PerformanceMark(name, options);
    this._entries.push(entry);
    return entry;
  }
  measure(measureName, startOrMeasureOptions, endMark) {
    let start;
    let end;
    if (typeof startOrMeasureOptions === "string") {
      start = this.getEntriesByName(startOrMeasureOptions, "mark")[0]?.startTime;
      end = this.getEntriesByName(endMark, "mark")[0]?.startTime;
    } else {
      start = Number.parseFloat(startOrMeasureOptions?.start) || this.now();
      end = Number.parseFloat(startOrMeasureOptions?.end) || this.now();
    }
    const entry = new PerformanceMeasure(measureName, {
      startTime: start,
      detail: {
        start,
        end
      }
    });
    this._entries.push(entry);
    return entry;
  }
  setResourceTimingBufferSize(maxSize) {
    this._resourceTimingBufferSize = maxSize;
  }
  addEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.addEventListener");
  }
  removeEventListener(type, listener, options) {
    throw createNotImplementedError("Performance.removeEventListener");
  }
  dispatchEvent(event) {
    throw createNotImplementedError("Performance.dispatchEvent");
  }
  toJSON() {
    return this;
  }
};
var PerformanceObserver = class {
  static {
    __name(this, "PerformanceObserver");
  }
  __unenv__ = true;
  static supportedEntryTypes = [];
  _callback = null;
  constructor(callback) {
    this._callback = callback;
  }
  takeRecords() {
    return [];
  }
  disconnect() {
    throw createNotImplementedError("PerformanceObserver.disconnect");
  }
  observe(options) {
    throw createNotImplementedError("PerformanceObserver.observe");
  }
  bind(fn) {
    return fn;
  }
  runInAsyncScope(fn, thisArg, ...args) {
    return fn.call(thisArg, ...args);
  }
  asyncId() {
    return 0;
  }
  triggerAsyncId() {
    return 0;
  }
  emitDestroy() {
    return this;
  }
};
var performance = globalThis.performance && "addEventListener" in globalThis.performance ? globalThis.performance : new Performance();

// node_modules/@cloudflare/unenv-preset/dist/runtime/polyfill/performance.mjs
if (!("__unenv__" in performance)) {
  const proto = Performance.prototype;
  for (const key of Object.getOwnPropertyNames(proto)) {
    if (key !== "constructor" && !(key in performance)) {
      const desc = Object.getOwnPropertyDescriptor(proto, key);
      if (desc) {
        Object.defineProperty(performance, key, desc);
      }
    }
  }
}
globalThis.performance = performance;
globalThis.Performance = Performance;
globalThis.PerformanceEntry = PerformanceEntry;
globalThis.PerformanceMark = PerformanceMark;
globalThis.PerformanceMeasure = PerformanceMeasure;
globalThis.PerformanceObserver = PerformanceObserver;
globalThis.PerformanceObserverEntryList = PerformanceObserverEntryList;
globalThis.PerformanceResourceTiming = PerformanceResourceTiming;

// node_modules/unenv/dist/runtime/node/console.mjs
import { Writable } from "node:stream";

// node_modules/unenv/dist/runtime/mock/noop.mjs
var noop_default = Object.assign(() => {
}, { __unenv__: true });

// node_modules/unenv/dist/runtime/node/console.mjs
var _console = globalThis.console;
var _ignoreErrors = true;
var _stderr = new Writable();
var _stdout = new Writable();
var log = _console?.log ?? noop_default;
var info = _console?.info ?? log;
var trace = _console?.trace ?? info;
var debug = _console?.debug ?? log;
var table = _console?.table ?? log;
var error = _console?.error ?? log;
var warn = _console?.warn ?? error;
var createTask = _console?.createTask ?? /* @__PURE__ */ notImplemented("console.createTask");
var clear = _console?.clear ?? noop_default;
var count = _console?.count ?? noop_default;
var countReset = _console?.countReset ?? noop_default;
var dir = _console?.dir ?? noop_default;
var dirxml = _console?.dirxml ?? noop_default;
var group = _console?.group ?? noop_default;
var groupEnd = _console?.groupEnd ?? noop_default;
var groupCollapsed = _console?.groupCollapsed ?? noop_default;
var profile = _console?.profile ?? noop_default;
var profileEnd = _console?.profileEnd ?? noop_default;
var time = _console?.time ?? noop_default;
var timeEnd = _console?.timeEnd ?? noop_default;
var timeLog = _console?.timeLog ?? noop_default;
var timeStamp = _console?.timeStamp ?? noop_default;
var Console = _console?.Console ?? /* @__PURE__ */ notImplementedClass("console.Console");
var _times = /* @__PURE__ */ new Map();
var _stdoutErrorHandler = noop_default;
var _stderrErrorHandler = noop_default;

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/console.mjs
var workerdConsole = globalThis["console"];
var {
  assert,
  clear: clear2,
  // @ts-expect-error undocumented public API
  context,
  count: count2,
  countReset: countReset2,
  // @ts-expect-error undocumented public API
  createTask: createTask2,
  debug: debug2,
  dir: dir2,
  dirxml: dirxml2,
  error: error2,
  group: group2,
  groupCollapsed: groupCollapsed2,
  groupEnd: groupEnd2,
  info: info2,
  log: log2,
  profile: profile2,
  profileEnd: profileEnd2,
  table: table2,
  time: time2,
  timeEnd: timeEnd2,
  timeLog: timeLog2,
  timeStamp: timeStamp2,
  trace: trace2,
  warn: warn2
} = workerdConsole;
Object.assign(workerdConsole, {
  Console,
  _ignoreErrors,
  _stderr,
  _stderrErrorHandler,
  _stdout,
  _stdoutErrorHandler,
  _times
});
var console_default = workerdConsole;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-console
globalThis.console = console_default;

// node_modules/unenv/dist/runtime/node/internal/process/hrtime.mjs
var hrtime = /* @__PURE__ */ Object.assign(/* @__PURE__ */ __name(function hrtime2(startTime) {
  const now = Date.now();
  const seconds = Math.trunc(now / 1e3);
  const nanos = now % 1e3 * 1e6;
  if (startTime) {
    let diffSeconds = seconds - startTime[0];
    let diffNanos = nanos - startTime[0];
    if (diffNanos < 0) {
      diffSeconds = diffSeconds - 1;
      diffNanos = 1e9 + diffNanos;
    }
    return [diffSeconds, diffNanos];
  }
  return [seconds, nanos];
}, "hrtime"), { bigint: /* @__PURE__ */ __name(function bigint() {
  return BigInt(Date.now() * 1e6);
}, "bigint") });

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
import { EventEmitter } from "node:events";

// node_modules/unenv/dist/runtime/node/internal/tty/read-stream.mjs
var ReadStream = class {
  static {
    __name(this, "ReadStream");
  }
  fd;
  isRaw = false;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  setRawMode(mode) {
    this.isRaw = mode;
    return this;
  }
};

// node_modules/unenv/dist/runtime/node/internal/tty/write-stream.mjs
var WriteStream = class {
  static {
    __name(this, "WriteStream");
  }
  fd;
  columns = 80;
  rows = 24;
  isTTY = false;
  constructor(fd) {
    this.fd = fd;
  }
  clearLine(dir3, callback) {
    callback && callback();
    return false;
  }
  clearScreenDown(callback) {
    callback && callback();
    return false;
  }
  cursorTo(x, y, callback) {
    callback && typeof callback === "function" && callback();
    return false;
  }
  moveCursor(dx, dy, callback) {
    callback && callback();
    return false;
  }
  getColorDepth(env2) {
    return 1;
  }
  hasColors(count3, env2) {
    return false;
  }
  getWindowSize() {
    return [this.columns, this.rows];
  }
  write(str, encoding, cb) {
    if (str instanceof Uint8Array) {
      str = new TextDecoder().decode(str);
    }
    try {
      console.log(str);
    } catch {
    }
    cb && typeof cb === "function" && cb();
    return false;
  }
};

// node_modules/unenv/dist/runtime/node/internal/process/node-version.mjs
var NODE_VERSION = "22.14.0";

// node_modules/unenv/dist/runtime/node/internal/process/process.mjs
var Process = class _Process extends EventEmitter {
  static {
    __name(this, "Process");
  }
  env;
  hrtime;
  nextTick;
  constructor(impl) {
    super();
    this.env = impl.env;
    this.hrtime = impl.hrtime;
    this.nextTick = impl.nextTick;
    for (const prop of [...Object.getOwnPropertyNames(_Process.prototype), ...Object.getOwnPropertyNames(EventEmitter.prototype)]) {
      const value = this[prop];
      if (typeof value === "function") {
        this[prop] = value.bind(this);
      }
    }
  }
  // --- event emitter ---
  emitWarning(warning, type, code) {
    console.warn(`${code ? `[${code}] ` : ""}${type ? `${type}: ` : ""}${warning}`);
  }
  emit(...args) {
    return super.emit(...args);
  }
  listeners(eventName) {
    return super.listeners(eventName);
  }
  // --- stdio (lazy initializers) ---
  #stdin;
  #stdout;
  #stderr;
  get stdin() {
    return this.#stdin ??= new ReadStream(0);
  }
  get stdout() {
    return this.#stdout ??= new WriteStream(1);
  }
  get stderr() {
    return this.#stderr ??= new WriteStream(2);
  }
  // --- cwd ---
  #cwd = "/";
  chdir(cwd2) {
    this.#cwd = cwd2;
  }
  cwd() {
    return this.#cwd;
  }
  // --- dummy props and getters ---
  arch = "";
  platform = "";
  argv = [];
  argv0 = "";
  execArgv = [];
  execPath = "";
  title = "";
  pid = 200;
  ppid = 100;
  get version() {
    return `v${NODE_VERSION}`;
  }
  get versions() {
    return { node: NODE_VERSION };
  }
  get allowedNodeEnvironmentFlags() {
    return /* @__PURE__ */ new Set();
  }
  get sourceMapsEnabled() {
    return false;
  }
  get debugPort() {
    return 0;
  }
  get throwDeprecation() {
    return false;
  }
  get traceDeprecation() {
    return false;
  }
  get features() {
    return {};
  }
  get release() {
    return {};
  }
  get connected() {
    return false;
  }
  get config() {
    return {};
  }
  get moduleLoadList() {
    return [];
  }
  constrainedMemory() {
    return 0;
  }
  availableMemory() {
    return 0;
  }
  uptime() {
    return 0;
  }
  resourceUsage() {
    return {};
  }
  // --- noop methods ---
  ref() {
  }
  unref() {
  }
  // --- unimplemented methods ---
  umask() {
    throw createNotImplementedError("process.umask");
  }
  getBuiltinModule() {
    return void 0;
  }
  getActiveResourcesInfo() {
    throw createNotImplementedError("process.getActiveResourcesInfo");
  }
  exit() {
    throw createNotImplementedError("process.exit");
  }
  reallyExit() {
    throw createNotImplementedError("process.reallyExit");
  }
  kill() {
    throw createNotImplementedError("process.kill");
  }
  abort() {
    throw createNotImplementedError("process.abort");
  }
  dlopen() {
    throw createNotImplementedError("process.dlopen");
  }
  setSourceMapsEnabled() {
    throw createNotImplementedError("process.setSourceMapsEnabled");
  }
  loadEnvFile() {
    throw createNotImplementedError("process.loadEnvFile");
  }
  disconnect() {
    throw createNotImplementedError("process.disconnect");
  }
  cpuUsage() {
    throw createNotImplementedError("process.cpuUsage");
  }
  setUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.setUncaughtExceptionCaptureCallback");
  }
  hasUncaughtExceptionCaptureCallback() {
    throw createNotImplementedError("process.hasUncaughtExceptionCaptureCallback");
  }
  initgroups() {
    throw createNotImplementedError("process.initgroups");
  }
  openStdin() {
    throw createNotImplementedError("process.openStdin");
  }
  assert() {
    throw createNotImplementedError("process.assert");
  }
  binding() {
    throw createNotImplementedError("process.binding");
  }
  // --- attached interfaces ---
  permission = { has: /* @__PURE__ */ notImplemented("process.permission.has") };
  report = {
    directory: "",
    filename: "",
    signal: "SIGUSR2",
    compact: false,
    reportOnFatalError: false,
    reportOnSignal: false,
    reportOnUncaughtException: false,
    getReport: /* @__PURE__ */ notImplemented("process.report.getReport"),
    writeReport: /* @__PURE__ */ notImplemented("process.report.writeReport")
  };
  finalization = {
    register: /* @__PURE__ */ notImplemented("process.finalization.register"),
    unregister: /* @__PURE__ */ notImplemented("process.finalization.unregister"),
    registerBeforeExit: /* @__PURE__ */ notImplemented("process.finalization.registerBeforeExit")
  };
  memoryUsage = Object.assign(() => ({
    arrayBuffers: 0,
    rss: 0,
    external: 0,
    heapTotal: 0,
    heapUsed: 0
  }), { rss: /* @__PURE__ */ __name(() => 0, "rss") });
  // --- undefined props ---
  mainModule = void 0;
  domain = void 0;
  // optional
  send = void 0;
  exitCode = void 0;
  channel = void 0;
  getegid = void 0;
  geteuid = void 0;
  getgid = void 0;
  getgroups = void 0;
  getuid = void 0;
  setegid = void 0;
  seteuid = void 0;
  setgid = void 0;
  setgroups = void 0;
  setuid = void 0;
  // internals
  _events = void 0;
  _eventsCount = void 0;
  _exiting = void 0;
  _maxListeners = void 0;
  _debugEnd = void 0;
  _debugProcess = void 0;
  _fatalException = void 0;
  _getActiveHandles = void 0;
  _getActiveRequests = void 0;
  _kill = void 0;
  _preload_modules = void 0;
  _rawDebug = void 0;
  _startProfilerIdleNotifier = void 0;
  _stopProfilerIdleNotifier = void 0;
  _tickCallback = void 0;
  _disconnect = void 0;
  _handleQueue = void 0;
  _pendingMessage = void 0;
  _channel = void 0;
  _send = void 0;
  _linkedBinding = void 0;
};

// node_modules/@cloudflare/unenv-preset/dist/runtime/node/process.mjs
var globalProcess = globalThis["process"];
var getBuiltinModule = globalProcess.getBuiltinModule;
var workerdProcess = getBuiltinModule("node:process");
var unenvProcess = new Process({
  env: globalProcess.env,
  hrtime,
  // `nextTick` is available from workerd process v1
  nextTick: workerdProcess.nextTick
});
var { exit, features, platform } = workerdProcess;
var {
  _channel,
  _debugEnd,
  _debugProcess,
  _disconnect,
  _events,
  _eventsCount,
  _exiting,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _handleQueue,
  _kill,
  _linkedBinding,
  _maxListeners,
  _pendingMessage,
  _preload_modules,
  _rawDebug,
  _send,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  arch,
  argv,
  argv0,
  assert: assert2,
  availableMemory,
  binding,
  channel,
  chdir,
  config,
  connected,
  constrainedMemory,
  cpuUsage,
  cwd,
  debugPort,
  disconnect,
  dlopen,
  domain,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exitCode,
  finalization,
  getActiveResourcesInfo,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getMaxListeners,
  getuid,
  hasUncaughtExceptionCaptureCallback,
  hrtime: hrtime3,
  initgroups,
  kill,
  listenerCount,
  listeners,
  loadEnvFile,
  mainModule,
  memoryUsage,
  moduleLoadList,
  nextTick,
  off,
  on,
  once,
  openStdin,
  permission,
  pid,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  reallyExit,
  ref,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  send,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setMaxListeners,
  setSourceMapsEnabled,
  setuid,
  setUncaughtExceptionCaptureCallback,
  sourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  throwDeprecation,
  title,
  traceDeprecation,
  umask,
  unref,
  uptime,
  version,
  versions
} = unenvProcess;
var _process = {
  abort,
  addListener,
  allowedNodeEnvironmentFlags,
  hasUncaughtExceptionCaptureCallback,
  setUncaughtExceptionCaptureCallback,
  loadEnvFile,
  sourceMapsEnabled,
  arch,
  argv,
  argv0,
  chdir,
  config,
  connected,
  constrainedMemory,
  availableMemory,
  cpuUsage,
  cwd,
  debugPort,
  dlopen,
  disconnect,
  emit,
  emitWarning,
  env,
  eventNames,
  execArgv,
  execPath,
  exit,
  finalization,
  features,
  getBuiltinModule,
  getActiveResourcesInfo,
  getMaxListeners,
  hrtime: hrtime3,
  kill,
  listeners,
  listenerCount,
  memoryUsage,
  nextTick,
  on,
  off,
  once,
  pid,
  platform,
  ppid,
  prependListener,
  prependOnceListener,
  rawListeners,
  release,
  removeAllListeners,
  removeListener,
  report,
  resourceUsage,
  setMaxListeners,
  setSourceMapsEnabled,
  stderr,
  stdin,
  stdout,
  title,
  throwDeprecation,
  traceDeprecation,
  umask,
  uptime,
  version,
  versions,
  // @ts-expect-error old API
  domain,
  initgroups,
  moduleLoadList,
  reallyExit,
  openStdin,
  assert: assert2,
  binding,
  send,
  exitCode,
  channel,
  getegid,
  geteuid,
  getgid,
  getgroups,
  getuid,
  setegid,
  seteuid,
  setgid,
  setgroups,
  setuid,
  permission,
  mainModule,
  _events,
  _eventsCount,
  _exiting,
  _maxListeners,
  _debugEnd,
  _debugProcess,
  _fatalException,
  _getActiveHandles,
  _getActiveRequests,
  _kill,
  _preload_modules,
  _rawDebug,
  _startProfilerIdleNotifier,
  _stopProfilerIdleNotifier,
  _tickCallback,
  _disconnect,
  _handleQueue,
  _pendingMessage,
  _channel,
  _send,
  _linkedBinding
};
var process_default = _process;

// node_modules/wrangler/_virtual_unenv_global_polyfill-@cloudflare-unenv-preset-node-process
globalThis.process = process_default;

// src/db.js
async function run(db, sql, params = []) {
  const stmt = await db.prepare(sql);
  return stmt.bind(params).run();
}
__name(run, "run");

// src/status.js
function statusCarga(c) {
  return {
    arquivo: c.arquivo,
    pasta: c.pasta,
    nome: c.nome,
    data_carga: c.data_carga,
    linhas: c.linhas,
    hash: c.hash,
    status: c.status,
    erro: c.erro,
    ultima_modificacao: c.ultima_modificacao,
    ultima_verificacao: c.ultima_verificacao
  };
}
__name(statusCarga, "statusCarga");
async function getStatus(env2, db) {
  const cargas = await run(db, `SELECT * FROM anac_cargas ORDER BY ultima_verificacao DESC LIMIT 50`);
  const conjuntos = await run(db, `SELECT * FROM anac_conjuntos ORDER BY pasta, nome`);
  const total2 = cargas.rows.length;
  const ok = cargas.rows.filter((c) => c.status === "ok").length;
  const erro = cargas.rows.filter((c) => c.status === "erro").length;
  const pendente = cargas.rows.filter((c) => c.status === "pendente").length;
  const alertas = [];
  const agora = Date.now();
  const dias45 = 45 * 24 * 60 * 60 * 1e3;
  for (const c of cargas.rows) {
    if (c.status === "erro") {
      alertas.push({ tipo: "erro", arquivo: c.arquivo, erro: c.erro });
    }
    if (c.ultima_modificacao) {
      const ult = Date.parse(c.ultima_modificacao);
      if (!isNaN(ult) && agora - ult > dias45) {
        alertas.push({ tipo: "parado", arquivo: c.arquivo, dias_parado: Math.floor((agora - ult) / dias45) });
      }
    }
  }
  return {
    agora: (/* @__PURE__ */ new Date()).toISOString(),
    cargas: {
      total: total2,
      ok,
      erro,
      pendente,
      itens: cargas.rows.map(statusCarga)
    },
    conjuntos: conjuntos.rows.map((c) => ({
      id: c.id,
      nome: c.nome,
      pasta: c.pasta,
      tem_vetor: c.tem_vetor,
      ultima_verificacao: c.ultima_verificacao
    })),
    alertas
  };
}
__name(getStatus, "getStatus");

// src/embed.js
async function embed(AI, texto) {
  const res = await AI.run("@cf/baai/bge-m3", { input: texto });
  return res.data[0].embedding;
}
__name(embed, "embed");
async function rerank(AI, query, docs) {
  if (docs.length === 0) return [];
  const pairs = docs.map((d) => ({ query, passage: d.texto }));
  const res = await AI.run("@cf/baai/bge-reranker-base", {
    model: "@cf/baai/bge-reranker-base",
    query,
    passages: docs.map((d) => d.texto)
  });
  const ordenados = (res.data || []).map((r, i) => ({ ...docs[i], score: r.score })).sort((a, b) => (b.score || 0) - (a.score || 0));
  return ordenados;
}
__name(rerank, "rerank");

// src/search.js
async function buscarVectorize(VECTOR, queryVector, filtro, topK = 50) {
  return VECTOR.query({
    data: queryVector,
    k: topK,
    filters: filtro || void 0,
    includeMetadata: true
  });
}
__name(buscarVectorize, "buscarVectorize");
async function busca(env2, query, opts = {}) {
  const { filtro, topK = 50, limite = 10 } = opts;
  const queryVector = await embed(env2.AI, query);
  const matches = await buscarVectorize(env2.VECTOR, queryVector, filtro, topK);
  const docs = (matches.matches || []).slice(0, limite).map((m) => ({
    id: m.id,
    score: m.distance,
    fonte: m.metadata?.fonte || m.id,
    texto: m.metadata?.snipeta || ""
  }));
  const reranked = docs.length > 1 ? await rerank(env2.AI, query, docs) : docs;
  return {
    query,
    resultados: reranked.slice(0, limite)
  };
}
__name(busca, "busca");

// src/index.js
var MAX_PARALELO = 4;
var MAX_TENTATIVAS = 3;
var AGENTE = "anac-sync/1.0 (https://anac-sync.rocha-eng.workers.dev)";
function extrairLinks(html) {
  const resultados = [];
  const regex = /href="([^"]+)"[^>]*>\s*([^<]+?)\s*<\/a>/gi;
  let match;
  while ((match = regex.exec(html)) !== null) {
    const href = match[1];
    const nome = match[2].trim();
    if (!href || href.startsWith("#")) continue;
    const ePasta = href.endsWith("/");
    const nomeArquivo = ePasta ? "/" : href.split("/").pop();
    const pasta = ePasta ? href : href.substring(0, href.lastIndexOf("/") + 1);
    resultados.push({ link: href, nome: nomeArquivo, pasta, isPasta: ePasta });
  }
  return resultados;
}
__name(extrairLinks, "extrairLinks");
async function baixarComTentativa(url) {
  let ultimaErro;
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      const resp = await fetch(url, { headers: { "user-agent": AGENTE } });
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const html = await resp.text();
      return { html, status: resp.status };
    } catch (err) {
      ultimaErro = err;
      await new Promise((resolve) => setTimeout(resolve, 1e3 * tentativa));
    }
  }
  throw new Error(`Falha ao baixar ${url}: ${ultimaErro.message}`);
}
__name(baixarComTentativa, "baixarComTentativa");
async function visitar(link, db, visitados, fila) {
  if (visitados.has(link)) return;
  visitados.add(link);
  const { html } = await baixarComTentativa(link);
  const entradas = extrairLinks(html);
  for (const entrada of entradas) {
    if (entrada.isPasta) {
      const subLink = link.replace(/\/$/, "") + "/" + entrada.href;
      if (!visitados.has(subLink)) {
        fila.push(subLink);
      }
    } else {
      const linkCompleto = link.replace(/\/$/, "") + "/" + entrada.href;
      await gravarIndice(db, {
        link: linkCompleto,
        nome: entrada.nome,
        pasta: link.replace(/\/$/, "") + "/"
      });
      total.arquivos++;
    }
  }
}
__name(visitar, "visitar");
async function gravarIndice(db, registro) {
  let ultimaErro;
  for (let tentativa = 1; tentativa <= MAX_TENTATIVAS; tentativa++) {
    try {
      await upsertIndice(db, registro);
      return;
    } catch (err) {
      ultimaErro = err;
      await new Promise((resolve) => setTimeout(resolve, 500 * tentativa));
    }
  }
  throw new Error(`Falha ao gravar \xEDndice ${registro.link}: ${ultimaErro.message}`);
}
__name(gravarIndice, "gravarIndice");
async function percorrerIndice(env2) {
  const raiz = env2.ANAC_BASE.replace(/\/$/, "");
  const visitados = /* @__PURE__ */ new Set();
  const fila = [raiz];
  const total2 = { pastas: 0, arquivos: 0 };
  while (fila.length > 0) {
    const link = fila.shift();
    total2.pastas++;
    const lotes = [];
    for (let i = 0; i < MAX_PARALELO && fila.length > 0; i++) {
      const proximo = fila.shift();
      visitados.add(proximo);
      lotes.push(visitar(proximo, env2.DB, visitados, fila));
    }
    await Promise.all(lotes);
  }
  console.log(`\xCDndice percorrido: ${total2.pastas} pastas`);
  return total2;
}
__name(percorrerIndice, "percorrerIndice");

// src/workers.js
async function handleRequest(req, env2, ctx) {
  const url = new URL(req.url);
  const path = url.pathname;
  if (path === "/status" && req.method === "GET") {
    const status = await getStatus(env2, env2.DB);
    return Response.json(status);
  }
  if (path === "/busca" && req.method === "GET") {
    const query = url.searchParams.get("q");
    if (!query) {
      return Response.json({ erro: 'par\xE2metro "q" obrigat\xF3rio' }, { status: 400 });
    }
    const resultado = await busca(env2, query, {
      filtro: url.searchParams.get("filtro") ? JSON.parse(url.searchParams.get("filtro")) : void 0,
      topK: Number(url.searchParams.get("topk") || 50),
      limite: Number(url.searchParams.get("limite") || 10)
    });
    return Response.json(resultado);
  }
  if (path === "/" && req.method === "GET") {
    return Response.json({
      nome: "anac-sync",
      descricao: "Sincroniza\xE7\xE3o di\xE1ria dos dados abertos da ANAC",
      rotas: ["/status", "/busca"]
    });
  }
  return Response.json({ erro: "rota n\xE3o encontrada" }, { status: 404 });
}
__name(handleRequest, "handleRequest");
var workers_default = {
  async fetch(req, env2, ctx) {
    try {
      return await handleRequest(req, env2, ctx);
    } catch (err) {
      console.error("Erro no handler:", err);
      return Response.json({ erro: "erro interno do servidor", detail: err.message }, { status: 500 });
    }
  }
};
var cron = /* @__PURE__ */ __name(async (req, env2, ctx) => {
  ctx.waitUntil(sincronizar(env2));
  return Response.json({ status: "sync iniciado" });
}, "cron");
async function sincronizar(env2) {
  console.log("Sincroniza\xE7\xE3o iniciada...");
  await percorrerIndice(env2);
  console.log("\xCDndice da ANAC percorrido.");
}
__name(sincronizar, "sincronizar");
var ANAC_SYNC = {
  initial: "verificar",
  steps: {
    verificar: /* @__PURE__ */ __name(async (input) => {
      await percorrerIndice(input);
      return { acoes: ["indice_anac"] };
    }, "verificar")
  }
};
export {
  ANAC_SYNC,
  cron,
  workers_default as default
};
//# sourceMappingURL=workers.js.map
