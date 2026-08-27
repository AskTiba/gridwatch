import { r as requireBn } from "./bn.js.mjs";
import { r as requireInherits } from "./inherits.mjs";
import { r as requireSafer } from "./safer-buffer.mjs";
import { r as requireMinimalisticAssert } from "./minimalistic-assert.mjs";
var asn1 = {};
var api = {};
var encoders = {};
var reporter = {};
var hasRequiredReporter;
function requireReporter() {
  if (hasRequiredReporter) return reporter;
  hasRequiredReporter = 1;
  const inherits = requireInherits();
  function Reporter(options) {
    this._reporterState = {
      obj: null,
      path: [],
      options: options || {},
      errors: []
    };
  }
  reporter.Reporter = Reporter;
  Reporter.prototype.isError = function isError(obj) {
    return obj instanceof ReporterError;
  };
  Reporter.prototype.save = function save() {
    const state = this._reporterState;
    return { obj: state.obj, pathLen: state.path.length };
  };
  Reporter.prototype.restore = function restore(data) {
    const state = this._reporterState;
    state.obj = data.obj;
    state.path = state.path.slice(0, data.pathLen);
  };
  Reporter.prototype.enterKey = function enterKey(key) {
    return this._reporterState.path.push(key);
  };
  Reporter.prototype.exitKey = function exitKey(index) {
    const state = this._reporterState;
    state.path = state.path.slice(0, index - 1);
  };
  Reporter.prototype.leaveKey = function leaveKey(index, key, value) {
    const state = this._reporterState;
    this.exitKey(index);
    if (state.obj !== null)
      state.obj[key] = value;
  };
  Reporter.prototype.path = function path() {
    return this._reporterState.path.join("/");
  };
  Reporter.prototype.enterObject = function enterObject() {
    const state = this._reporterState;
    const prev = state.obj;
    state.obj = {};
    return prev;
  };
  Reporter.prototype.leaveObject = function leaveObject(prev) {
    const state = this._reporterState;
    const now = state.obj;
    state.obj = prev;
    return now;
  };
  Reporter.prototype.error = function error(msg) {
    let err;
    const state = this._reporterState;
    const inherited = msg instanceof ReporterError;
    if (inherited) {
      err = msg;
    } else {
      err = new ReporterError(state.path.map(function(elem) {
        return "[" + JSON.stringify(elem) + "]";
      }).join(""), msg.message || msg, msg.stack);
    }
    if (!state.options.partial)
      throw err;
    if (!inherited)
      state.errors.push(err);
    return err;
  };
  Reporter.prototype.wrapResult = function wrapResult(result) {
    const state = this._reporterState;
    if (!state.options.partial)
      return result;
    return {
      result: this.isError(result) ? null : result,
      errors: state.errors
    };
  };
  function ReporterError(path, msg) {
    this.path = path;
    this.rethrow(msg);
  }
  inherits(ReporterError, Error);
  ReporterError.prototype.rethrow = function rethrow(msg) {
    this.message = msg + " at: " + (this.path || "(shallow)");
    if (Error.captureStackTrace)
      Error.captureStackTrace(this, ReporterError);
    if (!this.stack) {
      try {
        throw new Error(this.message);
      } catch (e) {
        this.stack = e.stack;
      }
    }
    return this;
  };
  return reporter;
}
var buffer = {};
var hasRequiredBuffer;
function requireBuffer() {
  if (hasRequiredBuffer) return buffer;
  hasRequiredBuffer = 1;
  const inherits = requireInherits();
  const Reporter = requireReporter().Reporter;
  const Buffer = requireSafer().Buffer;
  function DecoderBuffer(base2, options) {
    Reporter.call(this, options);
    if (!Buffer.isBuffer(base2)) {
      this.error("Input not Buffer");
      return;
    }
    this.base = base2;
    this.offset = 0;
    this.length = base2.length;
  }
  inherits(DecoderBuffer, Reporter);
  buffer.DecoderBuffer = DecoderBuffer;
  DecoderBuffer.isDecoderBuffer = function isDecoderBuffer(data) {
    if (data instanceof DecoderBuffer) {
      return true;
    }
    const isCompatible = typeof data === "object" && Buffer.isBuffer(data.base) && data.constructor.name === "DecoderBuffer" && typeof data.offset === "number" && typeof data.length === "number" && typeof data.save === "function" && typeof data.restore === "function" && typeof data.isEmpty === "function" && typeof data.readUInt8 === "function" && typeof data.skip === "function" && typeof data.raw === "function";
    return isCompatible;
  };
  DecoderBuffer.prototype.save = function save() {
    return { offset: this.offset, reporter: Reporter.prototype.save.call(this) };
  };
  DecoderBuffer.prototype.restore = function restore(save) {
    const res = new DecoderBuffer(this.base);
    res.offset = save.offset;
    res.length = this.offset;
    this.offset = save.offset;
    Reporter.prototype.restore.call(this, save.reporter);
    return res;
  };
  DecoderBuffer.prototype.isEmpty = function isEmpty() {
    return this.offset === this.length;
  };
  DecoderBuffer.prototype.readUInt8 = function readUInt8(fail) {
    if (this.offset + 1 <= this.length)
      return this.base.readUInt8(this.offset++, true);
    else
      return this.error(fail || "DecoderBuffer overrun");
  };
  DecoderBuffer.prototype.skip = function skip(bytes, fail) {
    if (!(this.offset + bytes <= this.length))
      return this.error(fail || "DecoderBuffer overrun");
    const res = new DecoderBuffer(this.base);
    res._reporterState = this._reporterState;
    res.offset = this.offset;
    res.length = this.offset + bytes;
    this.offset += bytes;
    return res;
  };
  DecoderBuffer.prototype.raw = function raw(save) {
    return this.base.slice(save ? save.offset : this.offset, this.length);
  };
  function EncoderBuffer(value, reporter2) {
    if (Array.isArray(value)) {
      this.length = 0;
      this.value = value.map(function(item) {
        if (!EncoderBuffer.isEncoderBuffer(item))
          item = new EncoderBuffer(item, reporter2);
        this.length += item.length;
        return item;
      }, this);
    } else if (typeof value === "number") {
      if (!(0 <= value && value <= 255))
        return reporter2.error("non-byte EncoderBuffer value");
      this.value = value;
      this.length = 1;
    } else if (typeof value === "string") {
      this.value = value;
      this.length = Buffer.byteLength(value);
    } else if (Buffer.isBuffer(value)) {
      this.value = value;
      this.length = value.length;
    } else {
      return reporter2.error("Unsupported type: " + typeof value);
    }
  }
  buffer.EncoderBuffer = EncoderBuffer;
  EncoderBuffer.isEncoderBuffer = function isEncoderBuffer(data) {
    if (data instanceof EncoderBuffer) {
      return true;
    }
    const isCompatible = typeof data === "object" && data.constructor.name === "EncoderBuffer" && typeof data.length === "number" && typeof data.join === "function";
    return isCompatible;
  };
  EncoderBuffer.prototype.join = function join(out, offset) {
    if (!out)
      out = Buffer.alloc(this.length);
    if (!offset)
      offset = 0;
    if (this.length === 0)
      return out;
    if (Array.isArray(this.value)) {
      this.value.forEach(function(item) {
        item.join(out, offset);
        offset += item.length;
      });
    } else {
      if (typeof this.value === "number")
        out[offset] = this.value;
      else if (typeof this.value === "string")
        out.write(this.value, offset);
      else if (Buffer.isBuffer(this.value))
        this.value.copy(out, offset);
      offset += this.length;
    }
    return out;
  };
  return buffer;
}
var node;
var hasRequiredNode;
function requireNode() {
  if (hasRequiredNode) return node;
  hasRequiredNode = 1;
  const Reporter = requireReporter().Reporter;
  const EncoderBuffer = requireBuffer().EncoderBuffer;
  const DecoderBuffer = requireBuffer().DecoderBuffer;
  const assert = requireMinimalisticAssert();
  const tags = [
    "seq",
    "seqof",
    "set",
    "setof",
    "objid",
    "bool",
    "gentime",
    "utctime",
    "null_",
    "enum",
    "int",
    "objDesc",
    "bitstr",
    "bmpstr",
    "charstr",
    "genstr",
    "graphstr",
    "ia5str",
    "iso646str",
    "numstr",
    "octstr",
    "printstr",
    "t61str",
    "unistr",
    "utf8str",
    "videostr"
  ];
  const methods = [
    "key",
    "obj",
    "use",
    "optional",
    "explicit",
    "implicit",
    "def",
    "choice",
    "any",
    "contains"
  ].concat(tags);
  const overrided = [
    "_peekTag",
    "_decodeTag",
    "_use",
    "_decodeStr",
    "_decodeObjid",
    "_decodeTime",
    "_decodeNull",
    "_decodeInt",
    "_decodeBool",
    "_decodeList",
    "_encodeComposite",
    "_encodeStr",
    "_encodeObjid",
    "_encodeTime",
    "_encodeNull",
    "_encodeInt",
    "_encodeBool"
  ];
  function Node(enc, parent, name) {
    const state = {};
    this._baseState = state;
    state.name = name;
    state.enc = enc;
    state.parent = parent || null;
    state.children = null;
    state.tag = null;
    state.args = null;
    state.reverseArgs = null;
    state.choice = null;
    state.optional = false;
    state.any = false;
    state.obj = false;
    state.use = null;
    state.useDecoder = null;
    state.key = null;
    state["default"] = null;
    state.explicit = null;
    state.implicit = null;
    state.contains = null;
    if (!state.parent) {
      state.children = [];
      this._wrap();
    }
  }
  node = Node;
  const stateProps = [
    "enc",
    "parent",
    "children",
    "tag",
    "args",
    "reverseArgs",
    "choice",
    "optional",
    "any",
    "obj",
    "use",
    "alteredUse",
    "key",
    "default",
    "explicit",
    "implicit",
    "contains"
  ];
  Node.prototype.clone = function clone() {
    const state = this._baseState;
    const cstate = {};
    stateProps.forEach(function(prop) {
      cstate[prop] = state[prop];
    });
    const res = new this.constructor(cstate.parent);
    res._baseState = cstate;
    return res;
  };
  Node.prototype._wrap = function wrap() {
    const state = this._baseState;
    methods.forEach(function(method) {
      this[method] = function _wrappedMethod() {
        const clone = new this.constructor(this);
        state.children.push(clone);
        return clone[method].apply(clone, arguments);
      };
    }, this);
  };
  Node.prototype._init = function init(body) {
    const state = this._baseState;
    assert(state.parent === null);
    body.call(this);
    state.children = state.children.filter(function(child) {
      return child._baseState.parent === this;
    }, this);
    assert.equal(state.children.length, 1, "Root node can have only one child");
  };
  Node.prototype._useArgs = function useArgs(args) {
    const state = this._baseState;
    const children = args.filter(function(arg) {
      return arg instanceof this.constructor;
    }, this);
    args = args.filter(function(arg) {
      return !(arg instanceof this.constructor);
    }, this);
    if (children.length !== 0) {
      assert(state.children === null);
      state.children = children;
      children.forEach(function(child) {
        child._baseState.parent = this;
      }, this);
    }
    if (args.length !== 0) {
      assert(state.args === null);
      state.args = args;
      state.reverseArgs = args.map(function(arg) {
        if (typeof arg !== "object" || arg.constructor !== Object)
          return arg;
        const res = {};
        Object.keys(arg).forEach(function(key) {
          if (key == (key | 0))
            key |= 0;
          const value = arg[key];
          res[value] = key;
        });
        return res;
      });
    }
  };
  overrided.forEach(function(method) {
    Node.prototype[method] = function _overrided() {
      const state = this._baseState;
      throw new Error(method + " not implemented for encoding: " + state.enc);
    };
  });
  tags.forEach(function(tag) {
    Node.prototype[tag] = function _tagMethod() {
      const state = this._baseState;
      const args = Array.prototype.slice.call(arguments);
      assert(state.tag === null);
      state.tag = tag;
      this._useArgs(args);
      return this;
    };
  });
  Node.prototype.use = function use(item) {
    assert(item);
    const state = this._baseState;
    assert(state.use === null);
    state.use = item;
    return this;
  };
  Node.prototype.optional = function optional() {
    const state = this._baseState;
    state.optional = true;
    return this;
  };
  Node.prototype.def = function def(val) {
    const state = this._baseState;
    assert(state["default"] === null);
    state["default"] = val;
    state.optional = true;
    return this;
  };
  Node.prototype.explicit = function explicit(num) {
    const state = this._baseState;
    assert(state.explicit === null && state.implicit === null);
    state.explicit = num;
    return this;
  };
  Node.prototype.implicit = function implicit(num) {
    const state = this._baseState;
    assert(state.explicit === null && state.implicit === null);
    state.implicit = num;
    return this;
  };
  Node.prototype.obj = function obj() {
    const state = this._baseState;
    const args = Array.prototype.slice.call(arguments);
    state.obj = true;
    if (args.length !== 0)
      this._useArgs(args);
    return this;
  };
  Node.prototype.key = function key(newKey) {
    const state = this._baseState;
    assert(state.key === null);
    state.key = newKey;
    return this;
  };
  Node.prototype.any = function any() {
    const state = this._baseState;
    state.any = true;
    return this;
  };
  Node.prototype.choice = function choice(obj) {
    const state = this._baseState;
    assert(state.choice === null);
    state.choice = obj;
    this._useArgs(Object.keys(obj).map(function(key) {
      return obj[key];
    }));
    return this;
  };
  Node.prototype.contains = function contains(item) {
    const state = this._baseState;
    assert(state.use === null);
    state.contains = item;
    return this;
  };
  Node.prototype._decode = function decode(input, options) {
    const state = this._baseState;
    if (state.parent === null)
      return input.wrapResult(state.children[0]._decode(input, options));
    let result = state["default"];
    let present = true;
    let prevKey = null;
    if (state.key !== null)
      prevKey = input.enterKey(state.key);
    if (state.optional) {
      let tag = null;
      if (state.explicit !== null)
        tag = state.explicit;
      else if (state.implicit !== null)
        tag = state.implicit;
      else if (state.tag !== null)
        tag = state.tag;
      if (tag === null && !state.any) {
        const save = input.save();
        try {
          if (state.choice === null)
            this._decodeGeneric(state.tag, input, options);
          else
            this._decodeChoice(input, options);
          present = true;
        } catch (e) {
          present = false;
        }
        input.restore(save);
      } else {
        present = this._peekTag(input, tag, state.any);
        if (input.isError(present))
          return present;
      }
    }
    let prevObj;
    if (state.obj && present)
      prevObj = input.enterObject();
    if (present) {
      if (state.explicit !== null) {
        const explicit = this._decodeTag(input, state.explicit);
        if (input.isError(explicit))
          return explicit;
        input = explicit;
      }
      const start = input.offset;
      if (state.use === null && state.choice === null) {
        let save;
        if (state.any)
          save = input.save();
        const body = this._decodeTag(
          input,
          state.implicit !== null ? state.implicit : state.tag,
          state.any
        );
        if (input.isError(body))
          return body;
        if (state.any)
          result = input.raw(save);
        else
          input = body;
      }
      if (options && options.track && state.tag !== null)
        options.track(input.path(), start, input.length, "tagged");
      if (options && options.track && state.tag !== null)
        options.track(input.path(), input.offset, input.length, "content");
      if (state.any) ;
      else if (state.choice === null) {
        result = this._decodeGeneric(state.tag, input, options);
      } else {
        result = this._decodeChoice(input, options);
      }
      if (input.isError(result))
        return result;
      if (!state.any && state.choice === null && state.children !== null) {
        state.children.forEach(function decodeChildren(child) {
          child._decode(input, options);
        });
      }
      if (state.contains && (state.tag === "octstr" || state.tag === "bitstr")) {
        const data = new DecoderBuffer(result);
        result = this._getUse(state.contains, input._reporterState.obj)._decode(data, options);
      }
    }
    if (state.obj && present)
      result = input.leaveObject(prevObj);
    if (state.key !== null && (result !== null || present === true))
      input.leaveKey(prevKey, state.key, result);
    else if (prevKey !== null)
      input.exitKey(prevKey);
    return result;
  };
  Node.prototype._decodeGeneric = function decodeGeneric(tag, input, options) {
    const state = this._baseState;
    if (tag === "seq" || tag === "set")
      return null;
    if (tag === "seqof" || tag === "setof")
      return this._decodeList(input, tag, state.args[0], options);
    else if (/str$/.test(tag))
      return this._decodeStr(input, tag, options);
    else if (tag === "objid" && state.args)
      return this._decodeObjid(input, state.args[0], state.args[1], options);
    else if (tag === "objid")
      return this._decodeObjid(input, null, null, options);
    else if (tag === "gentime" || tag === "utctime")
      return this._decodeTime(input, tag, options);
    else if (tag === "null_")
      return this._decodeNull(input, options);
    else if (tag === "bool")
      return this._decodeBool(input, options);
    else if (tag === "objDesc")
      return this._decodeStr(input, tag, options);
    else if (tag === "int" || tag === "enum")
      return this._decodeInt(input, state.args && state.args[0], options);
    if (state.use !== null) {
      return this._getUse(state.use, input._reporterState.obj)._decode(input, options);
    } else {
      return input.error("unknown tag: " + tag);
    }
  };
  Node.prototype._getUse = function _getUse(entity, obj) {
    const state = this._baseState;
    state.useDecoder = this._use(entity, obj);
    assert(state.useDecoder._baseState.parent === null);
    state.useDecoder = state.useDecoder._baseState.children[0];
    if (state.implicit !== state.useDecoder._baseState.implicit) {
      state.useDecoder = state.useDecoder.clone();
      state.useDecoder._baseState.implicit = state.implicit;
    }
    return state.useDecoder;
  };
  Node.prototype._decodeChoice = function decodeChoice(input, options) {
    const state = this._baseState;
    let result = null;
    let match = false;
    Object.keys(state.choice).some(function(key) {
      const save = input.save();
      const node2 = state.choice[key];
      try {
        const value = node2._decode(input, options);
        if (input.isError(value))
          return false;
        result = { type: key, value };
        match = true;
      } catch (e) {
        input.restore(save);
        return false;
      }
      return true;
    }, this);
    if (!match)
      return input.error("Choice not matched");
    return result;
  };
  Node.prototype._createEncoderBuffer = function createEncoderBuffer(data) {
    return new EncoderBuffer(data, this.reporter);
  };
  Node.prototype._encode = function encode(data, reporter2, parent) {
    const state = this._baseState;
    if (state["default"] !== null && state["default"] === data)
      return;
    const result = this._encodeValue(data, reporter2, parent);
    if (result === void 0)
      return;
    if (this._skipDefault(result, reporter2, parent))
      return;
    return result;
  };
  Node.prototype._encodeValue = function encode(data, reporter2, parent) {
    const state = this._baseState;
    if (state.parent === null)
      return state.children[0]._encode(data, reporter2 || new Reporter());
    let result = null;
    this.reporter = reporter2;
    if (state.optional && data === void 0) {
      if (state["default"] !== null)
        data = state["default"];
      else
        return;
    }
    let content = null;
    let primitive = false;
    if (state.any) {
      result = this._createEncoderBuffer(data);
    } else if (state.choice) {
      result = this._encodeChoice(data, reporter2);
    } else if (state.contains) {
      content = this._getUse(state.contains, parent)._encode(data, reporter2);
      primitive = true;
    } else if (state.children) {
      content = state.children.map(function(child) {
        if (child._baseState.tag === "null_")
          return child._encode(null, reporter2, data);
        if (child._baseState.key === null)
          return reporter2.error("Child should have a key");
        const prevKey = reporter2.enterKey(child._baseState.key);
        if (typeof data !== "object")
          return reporter2.error("Child expected, but input is not object");
        const res = child._encode(data[child._baseState.key], reporter2, data);
        reporter2.leaveKey(prevKey);
        return res;
      }, this).filter(function(child) {
        return child;
      });
      content = this._createEncoderBuffer(content);
    } else {
      if (state.tag === "seqof" || state.tag === "setof") {
        if (!(state.args && state.args.length === 1))
          return reporter2.error("Too many args for : " + state.tag);
        if (!Array.isArray(data))
          return reporter2.error("seqof/setof, but data is not Array");
        const child = this.clone();
        child._baseState.implicit = null;
        content = this._createEncoderBuffer(data.map(function(item) {
          const state2 = this._baseState;
          return this._getUse(state2.args[0], data)._encode(item, reporter2);
        }, child));
      } else if (state.use !== null) {
        result = this._getUse(state.use, parent)._encode(data, reporter2);
      } else {
        content = this._encodePrimitive(state.tag, data);
        primitive = true;
      }
    }
    if (!state.any && state.choice === null) {
      const tag = state.implicit !== null ? state.implicit : state.tag;
      const cls = state.implicit === null ? "universal" : "context";
      if (tag === null) {
        if (state.use === null)
          reporter2.error("Tag could be omitted only for .use()");
      } else {
        if (state.use === null)
          result = this._encodeComposite(tag, primitive, cls, content);
      }
    }
    if (state.explicit !== null)
      result = this._encodeComposite(state.explicit, false, "context", result);
    return result;
  };
  Node.prototype._encodeChoice = function encodeChoice(data, reporter2) {
    const state = this._baseState;
    const node2 = state.choice[data.type];
    if (!node2) {
      assert(
        false,
        data.type + " not found in " + JSON.stringify(Object.keys(state.choice))
      );
    }
    return node2._encode(data.value, reporter2);
  };
  Node.prototype._encodePrimitive = function encodePrimitive(tag, data) {
    const state = this._baseState;
    if (/str$/.test(tag))
      return this._encodeStr(data, tag);
    else if (tag === "objid" && state.args)
      return this._encodeObjid(data, state.reverseArgs[0], state.args[1]);
    else if (tag === "objid")
      return this._encodeObjid(data, null, null);
    else if (tag === "gentime" || tag === "utctime")
      return this._encodeTime(data, tag);
    else if (tag === "null_")
      return this._encodeNull();
    else if (tag === "int" || tag === "enum")
      return this._encodeInt(data, state.args && state.reverseArgs[0]);
    else if (tag === "bool")
      return this._encodeBool(data);
    else if (tag === "objDesc")
      return this._encodeStr(data, tag);
    else
      throw new Error("Unsupported tag: " + tag);
  };
  Node.prototype._isNumstr = function isNumstr(str) {
    return /^[0-9 ]*$/.test(str);
  };
  Node.prototype._isPrintstr = function isPrintstr(str) {
    return /^[A-Za-z0-9 '()+,-./:=?]*$/.test(str);
  };
  return node;
}
var der = {};
var hasRequiredDer$2;
function requireDer$2() {
  if (hasRequiredDer$2) return der;
  hasRequiredDer$2 = 1;
  (function(exports) {
    function reverse(map) {
      const res = {};
      Object.keys(map).forEach(function(key) {
        if ((key | 0) == key)
          key = key | 0;
        const value = map[key];
        res[value] = key;
      });
      return res;
    }
    exports.tagClass = {
      0: "universal",
      1: "application",
      2: "context",
      3: "private"
    };
    exports.tagClassByName = reverse(exports.tagClass);
    exports.tag = {
      0: "end",
      1: "bool",
      2: "int",
      3: "bitstr",
      4: "octstr",
      5: "null_",
      6: "objid",
      7: "objDesc",
      8: "external",
      9: "real",
      10: "enum",
      11: "embed",
      12: "utf8str",
      13: "relativeOid",
      16: "seq",
      17: "set",
      18: "numstr",
      19: "printstr",
      20: "t61str",
      21: "videostr",
      22: "ia5str",
      23: "utctime",
      24: "gentime",
      25: "graphstr",
      26: "iso646str",
      27: "genstr",
      28: "unistr",
      29: "charstr",
      30: "bmpstr"
    };
    exports.tagByName = reverse(exports.tag);
  })(der);
  return der;
}
var der_1$1;
var hasRequiredDer$1;
function requireDer$1() {
  if (hasRequiredDer$1) return der_1$1;
  hasRequiredDer$1 = 1;
  const inherits = requireInherits();
  const Buffer = requireSafer().Buffer;
  const Node = requireNode();
  const der2 = requireDer$2();
  function DEREncoder(entity) {
    this.enc = "der";
    this.name = entity.name;
    this.entity = entity;
    this.tree = new DERNode();
    this.tree._init(entity.body);
  }
  der_1$1 = DEREncoder;
  DEREncoder.prototype.encode = function encode(data, reporter2) {
    return this.tree._encode(data, reporter2).join();
  };
  function DERNode(parent) {
    Node.call(this, "der", parent);
  }
  inherits(DERNode, Node);
  DERNode.prototype._encodeComposite = function encodeComposite(tag, primitive, cls, content) {
    const encodedTag = encodeTag(tag, primitive, cls, this.reporter);
    if (content.length < 128) {
      const header2 = Buffer.alloc(2);
      header2[0] = encodedTag;
      header2[1] = content.length;
      return this._createEncoderBuffer([header2, content]);
    }
    let lenOctets = 1;
    for (let i = content.length; i >= 256; i >>= 8)
      lenOctets++;
    const header = Buffer.alloc(1 + 1 + lenOctets);
    header[0] = encodedTag;
    header[1] = 128 | lenOctets;
    for (let i = 1 + lenOctets, j = content.length; j > 0; i--, j >>= 8)
      header[i] = j & 255;
    return this._createEncoderBuffer([header, content]);
  };
  DERNode.prototype._encodeStr = function encodeStr(str, tag) {
    if (tag === "bitstr") {
      return this._createEncoderBuffer([str.unused | 0, str.data]);
    } else if (tag === "bmpstr") {
      const buf = Buffer.alloc(str.length * 2);
      for (let i = 0; i < str.length; i++) {
        buf.writeUInt16BE(str.charCodeAt(i), i * 2);
      }
      return this._createEncoderBuffer(buf);
    } else if (tag === "numstr") {
      if (!this._isNumstr(str)) {
        return this.reporter.error("Encoding of string type: numstr supports only digits and space");
      }
      return this._createEncoderBuffer(str);
    } else if (tag === "printstr") {
      if (!this._isPrintstr(str)) {
        return this.reporter.error("Encoding of string type: printstr supports only latin upper and lower case letters, digits, space, apostrophe, left and rigth parenthesis, plus sign, comma, hyphen, dot, slash, colon, equal sign, question mark");
      }
      return this._createEncoderBuffer(str);
    } else if (/str$/.test(tag)) {
      return this._createEncoderBuffer(str);
    } else if (tag === "objDesc") {
      return this._createEncoderBuffer(str);
    } else {
      return this.reporter.error("Encoding of string type: " + tag + " unsupported");
    }
  };
  DERNode.prototype._encodeObjid = function encodeObjid(id, values, relative) {
    if (typeof id === "string") {
      if (!values)
        return this.reporter.error("string objid given, but no values map found");
      if (!values.hasOwnProperty(id))
        return this.reporter.error("objid not found in values map");
      id = values[id].split(/[\s.]+/g);
      for (let i = 0; i < id.length; i++)
        id[i] |= 0;
    } else if (Array.isArray(id)) {
      id = id.slice();
      for (let i = 0; i < id.length; i++)
        id[i] |= 0;
    }
    if (!Array.isArray(id)) {
      return this.reporter.error("objid() should be either array or string, got: " + JSON.stringify(id));
    }
    if (!relative) {
      if (id[1] >= 40)
        return this.reporter.error("Second objid identifier OOB");
      id.splice(0, 2, id[0] * 40 + id[1]);
    }
    let size = 0;
    for (let i = 0; i < id.length; i++) {
      let ident = id[i];
      for (size++; ident >= 128; ident >>= 7)
        size++;
    }
    const objid = Buffer.alloc(size);
    let offset = objid.length - 1;
    for (let i = id.length - 1; i >= 0; i--) {
      let ident = id[i];
      objid[offset--] = ident & 127;
      while ((ident >>= 7) > 0)
        objid[offset--] = 128 | ident & 127;
    }
    return this._createEncoderBuffer(objid);
  };
  function two(num) {
    if (num < 10)
      return "0" + num;
    else
      return num;
  }
  DERNode.prototype._encodeTime = function encodeTime(time, tag) {
    let str;
    const date = new Date(time);
    if (tag === "gentime") {
      str = [
        two(date.getUTCFullYear()),
        two(date.getUTCMonth() + 1),
        two(date.getUTCDate()),
        two(date.getUTCHours()),
        two(date.getUTCMinutes()),
        two(date.getUTCSeconds()),
        "Z"
      ].join("");
    } else if (tag === "utctime") {
      str = [
        two(date.getUTCFullYear() % 100),
        two(date.getUTCMonth() + 1),
        two(date.getUTCDate()),
        two(date.getUTCHours()),
        two(date.getUTCMinutes()),
        two(date.getUTCSeconds()),
        "Z"
      ].join("");
    } else {
      this.reporter.error("Encoding " + tag + " time is not supported yet");
    }
    return this._encodeStr(str, "octstr");
  };
  DERNode.prototype._encodeNull = function encodeNull() {
    return this._createEncoderBuffer("");
  };
  DERNode.prototype._encodeInt = function encodeInt(num, values) {
    if (typeof num === "string") {
      if (!values)
        return this.reporter.error("String int or enum given, but no values map");
      if (!values.hasOwnProperty(num)) {
        return this.reporter.error("Values map doesn't contain: " + JSON.stringify(num));
      }
      num = values[num];
    }
    if (typeof num !== "number" && !Buffer.isBuffer(num)) {
      const numArray = num.toArray();
      if (!num.sign && numArray[0] & 128) {
        numArray.unshift(0);
      }
      num = Buffer.from(numArray);
    }
    if (Buffer.isBuffer(num)) {
      let size2 = num.length;
      if (num.length === 0)
        size2++;
      const out2 = Buffer.alloc(size2);
      num.copy(out2);
      if (num.length === 0)
        out2[0] = 0;
      return this._createEncoderBuffer(out2);
    }
    if (num < 128)
      return this._createEncoderBuffer(num);
    if (num < 256)
      return this._createEncoderBuffer([0, num]);
    let size = 1;
    for (let i = num; i >= 256; i >>= 8)
      size++;
    const out = new Array(size);
    for (let i = out.length - 1; i >= 0; i--) {
      out[i] = num & 255;
      num >>= 8;
    }
    if (out[0] & 128) {
      out.unshift(0);
    }
    return this._createEncoderBuffer(Buffer.from(out));
  };
  DERNode.prototype._encodeBool = function encodeBool(value) {
    return this._createEncoderBuffer(value ? 255 : 0);
  };
  DERNode.prototype._use = function use(entity, obj) {
    if (typeof entity === "function")
      entity = entity(obj);
    return entity._getEncoder("der").tree;
  };
  DERNode.prototype._skipDefault = function skipDefault(dataBuffer, reporter2, parent) {
    const state = this._baseState;
    let i;
    if (state["default"] === null)
      return false;
    const data = dataBuffer.join();
    if (state.defaultBuffer === void 0)
      state.defaultBuffer = this._encodeValue(state["default"], reporter2, parent).join();
    if (data.length !== state.defaultBuffer.length)
      return false;
    for (i = 0; i < data.length; i++)
      if (data[i] !== state.defaultBuffer[i])
        return false;
    return true;
  };
  function encodeTag(tag, primitive, cls, reporter2) {
    let res;
    if (tag === "seqof")
      tag = "seq";
    else if (tag === "setof")
      tag = "set";
    if (der2.tagByName.hasOwnProperty(tag))
      res = der2.tagByName[tag];
    else if (typeof tag === "number" && (tag | 0) === tag)
      res = tag;
    else
      return reporter2.error("Unknown tag: " + tag);
    if (res >= 31)
      return reporter2.error("Multi-octet tag encoding unsupported");
    if (!primitive)
      res |= 32;
    res |= der2.tagClassByName[cls || "universal"] << 6;
    return res;
  }
  return der_1$1;
}
var pem$1;
var hasRequiredPem$1;
function requirePem$1() {
  if (hasRequiredPem$1) return pem$1;
  hasRequiredPem$1 = 1;
  const inherits = requireInherits();
  const DEREncoder = requireDer$1();
  function PEMEncoder(entity) {
    DEREncoder.call(this, entity);
    this.enc = "pem";
  }
  inherits(PEMEncoder, DEREncoder);
  pem$1 = PEMEncoder;
  PEMEncoder.prototype.encode = function encode(data, options) {
    const buf = DEREncoder.prototype.encode.call(this, data);
    const p = buf.toString("base64");
    const out = ["-----BEGIN " + options.label + "-----"];
    for (let i = 0; i < p.length; i += 64)
      out.push(p.slice(i, i + 64));
    out.push("-----END " + options.label + "-----");
    return out.join("\n");
  };
  return pem$1;
}
var hasRequiredEncoders;
function requireEncoders() {
  if (hasRequiredEncoders) return encoders;
  hasRequiredEncoders = 1;
  (function(exports) {
    const encoders2 = exports;
    encoders2.der = requireDer$1();
    encoders2.pem = requirePem$1();
  })(encoders);
  return encoders;
}
var decoders = {};
var der_1;
var hasRequiredDer;
function requireDer() {
  if (hasRequiredDer) return der_1;
  hasRequiredDer = 1;
  const inherits = requireInherits();
  const bignum = requireBn();
  const DecoderBuffer = requireBuffer().DecoderBuffer;
  const Node = requireNode();
  const der2 = requireDer$2();
  function DERDecoder(entity) {
    this.enc = "der";
    this.name = entity.name;
    this.entity = entity;
    this.tree = new DERNode();
    this.tree._init(entity.body);
  }
  der_1 = DERDecoder;
  DERDecoder.prototype.decode = function decode(data, options) {
    if (!DecoderBuffer.isDecoderBuffer(data)) {
      data = new DecoderBuffer(data, options);
    }
    return this.tree._decode(data, options);
  };
  function DERNode(parent) {
    Node.call(this, "der", parent);
  }
  inherits(DERNode, Node);
  DERNode.prototype._peekTag = function peekTag(buffer2, tag, any) {
    if (buffer2.isEmpty())
      return false;
    const state = buffer2.save();
    const decodedTag = derDecodeTag(buffer2, 'Failed to peek tag: "' + tag + '"');
    if (buffer2.isError(decodedTag))
      return decodedTag;
    buffer2.restore(state);
    return decodedTag.tag === tag || decodedTag.tagStr === tag || decodedTag.tagStr + "of" === tag || any;
  };
  DERNode.prototype._decodeTag = function decodeTag(buffer2, tag, any) {
    const decodedTag = derDecodeTag(
      buffer2,
      'Failed to decode tag of "' + tag + '"'
    );
    if (buffer2.isError(decodedTag))
      return decodedTag;
    let len = derDecodeLen(
      buffer2,
      decodedTag.primitive,
      'Failed to get length of "' + tag + '"'
    );
    if (buffer2.isError(len))
      return len;
    if (!any && decodedTag.tag !== tag && decodedTag.tagStr !== tag && decodedTag.tagStr + "of" !== tag) {
      return buffer2.error('Failed to match tag: "' + tag + '"');
    }
    if (decodedTag.primitive || len !== null)
      return buffer2.skip(len, 'Failed to match body of: "' + tag + '"');
    const state = buffer2.save();
    const res = this._skipUntilEnd(
      buffer2,
      'Failed to skip indefinite length body: "' + this.tag + '"'
    );
    if (buffer2.isError(res))
      return res;
    len = buffer2.offset - state.offset;
    buffer2.restore(state);
    return buffer2.skip(len, 'Failed to match body of: "' + tag + '"');
  };
  DERNode.prototype._skipUntilEnd = function skipUntilEnd(buffer2, fail) {
    for (; ; ) {
      const tag = derDecodeTag(buffer2, fail);
      if (buffer2.isError(tag))
        return tag;
      const len = derDecodeLen(buffer2, tag.primitive, fail);
      if (buffer2.isError(len))
        return len;
      let res;
      if (tag.primitive || len !== null)
        res = buffer2.skip(len);
      else
        res = this._skipUntilEnd(buffer2, fail);
      if (buffer2.isError(res))
        return res;
      if (tag.tagStr === "end")
        break;
    }
  };
  DERNode.prototype._decodeList = function decodeList(buffer2, tag, decoder, options) {
    const result = [];
    while (!buffer2.isEmpty()) {
      const possibleEnd = this._peekTag(buffer2, "end");
      if (buffer2.isError(possibleEnd))
        return possibleEnd;
      const res = decoder.decode(buffer2, "der", options);
      if (buffer2.isError(res) && possibleEnd)
        break;
      result.push(res);
    }
    return result;
  };
  DERNode.prototype._decodeStr = function decodeStr(buffer2, tag) {
    if (tag === "bitstr") {
      const unused = buffer2.readUInt8();
      if (buffer2.isError(unused))
        return unused;
      return { unused, data: buffer2.raw() };
    } else if (tag === "bmpstr") {
      const raw = buffer2.raw();
      if (raw.length % 2 === 1)
        return buffer2.error("Decoding of string type: bmpstr length mismatch");
      let str = "";
      for (let i = 0; i < raw.length / 2; i++) {
        str += String.fromCharCode(raw.readUInt16BE(i * 2));
      }
      return str;
    } else if (tag === "numstr") {
      const numstr = buffer2.raw().toString("ascii");
      if (!this._isNumstr(numstr)) {
        return buffer2.error("Decoding of string type: numstr unsupported characters");
      }
      return numstr;
    } else if (tag === "octstr") {
      return buffer2.raw();
    } else if (tag === "objDesc") {
      return buffer2.raw();
    } else if (tag === "printstr") {
      const printstr = buffer2.raw().toString("ascii");
      if (!this._isPrintstr(printstr)) {
        return buffer2.error("Decoding of string type: printstr unsupported characters");
      }
      return printstr;
    } else if (/str$/.test(tag)) {
      return buffer2.raw().toString();
    } else {
      return buffer2.error("Decoding of string type: " + tag + " unsupported");
    }
  };
  DERNode.prototype._decodeObjid = function decodeObjid(buffer2, values, relative) {
    let result;
    const identifiers = [];
    let ident = 0;
    let subident = 0;
    while (!buffer2.isEmpty()) {
      subident = buffer2.readUInt8();
      ident <<= 7;
      ident |= subident & 127;
      if ((subident & 128) === 0) {
        identifiers.push(ident);
        ident = 0;
      }
    }
    if (subident & 128)
      identifiers.push(ident);
    const first = identifiers[0] / 40 | 0;
    const second = identifiers[0] % 40;
    if (relative)
      result = identifiers;
    else
      result = [first, second].concat(identifiers.slice(1));
    if (values) {
      let tmp = values[result.join(" ")];
      if (tmp === void 0)
        tmp = values[result.join(".")];
      if (tmp !== void 0)
        result = tmp;
    }
    return result;
  };
  DERNode.prototype._decodeTime = function decodeTime(buffer2, tag) {
    const str = buffer2.raw().toString();
    let year;
    let mon;
    let day;
    let hour;
    let min;
    let sec;
    if (tag === "gentime") {
      year = str.slice(0, 4) | 0;
      mon = str.slice(4, 6) | 0;
      day = str.slice(6, 8) | 0;
      hour = str.slice(8, 10) | 0;
      min = str.slice(10, 12) | 0;
      sec = str.slice(12, 14) | 0;
    } else if (tag === "utctime") {
      year = str.slice(0, 2) | 0;
      mon = str.slice(2, 4) | 0;
      day = str.slice(4, 6) | 0;
      hour = str.slice(6, 8) | 0;
      min = str.slice(8, 10) | 0;
      sec = str.slice(10, 12) | 0;
      if (year < 70)
        year = 2e3 + year;
      else
        year = 1900 + year;
    } else {
      return buffer2.error("Decoding " + tag + " time is not supported yet");
    }
    return Date.UTC(year, mon - 1, day, hour, min, sec, 0);
  };
  DERNode.prototype._decodeNull = function decodeNull() {
    return null;
  };
  DERNode.prototype._decodeBool = function decodeBool(buffer2) {
    const res = buffer2.readUInt8();
    if (buffer2.isError(res))
      return res;
    else
      return res !== 0;
  };
  DERNode.prototype._decodeInt = function decodeInt(buffer2, values) {
    const raw = buffer2.raw();
    let res = new bignum(raw);
    if (values)
      res = values[res.toString(10)] || res;
    return res;
  };
  DERNode.prototype._use = function use(entity, obj) {
    if (typeof entity === "function")
      entity = entity(obj);
    return entity._getDecoder("der").tree;
  };
  function derDecodeTag(buf, fail) {
    let tag = buf.readUInt8(fail);
    if (buf.isError(tag))
      return tag;
    const cls = der2.tagClass[tag >> 6];
    const primitive = (tag & 32) === 0;
    if ((tag & 31) === 31) {
      let oct = tag;
      tag = 0;
      while ((oct & 128) === 128) {
        oct = buf.readUInt8(fail);
        if (buf.isError(oct))
          return oct;
        tag <<= 7;
        tag |= oct & 127;
      }
    } else {
      tag &= 31;
    }
    const tagStr = der2.tag[tag];
    return {
      cls,
      primitive,
      tag,
      tagStr
    };
  }
  function derDecodeLen(buf, primitive, fail) {
    let len = buf.readUInt8(fail);
    if (buf.isError(len))
      return len;
    if (!primitive && len === 128)
      return null;
    if ((len & 128) === 0) {
      return len;
    }
    const num = len & 127;
    if (num > 4)
      return buf.error("length octect is too long");
    len = 0;
    for (let i = 0; i < num; i++) {
      len <<= 8;
      const j = buf.readUInt8(fail);
      if (buf.isError(j))
        return j;
      len |= j;
    }
    return len;
  }
  return der_1;
}
var pem;
var hasRequiredPem;
function requirePem() {
  if (hasRequiredPem) return pem;
  hasRequiredPem = 1;
  const inherits = requireInherits();
  const Buffer = requireSafer().Buffer;
  const DERDecoder = requireDer();
  function PEMDecoder(entity) {
    DERDecoder.call(this, entity);
    this.enc = "pem";
  }
  inherits(PEMDecoder, DERDecoder);
  pem = PEMDecoder;
  PEMDecoder.prototype.decode = function decode(data, options) {
    const lines = data.toString().split(/[\r\n]+/g);
    const label = options.label.toUpperCase();
    const re = /^-----(BEGIN|END) ([^-]+)-----$/;
    let start = -1;
    let end = -1;
    for (let i = 0; i < lines.length; i++) {
      const match = lines[i].match(re);
      if (match === null)
        continue;
      if (match[2] !== label)
        continue;
      if (start === -1) {
        if (match[1] !== "BEGIN")
          break;
        start = i;
      } else {
        if (match[1] !== "END")
          break;
        end = i;
        break;
      }
    }
    if (start === -1 || end === -1)
      throw new Error("PEM section not found for: " + label);
    const base64 = lines.slice(start + 1, end).join("");
    base64.replace(/[^a-z0-9+/=]+/gi, "");
    const input = Buffer.from(base64, "base64");
    return DERDecoder.prototype.decode.call(this, input, options);
  };
  return pem;
}
var hasRequiredDecoders;
function requireDecoders() {
  if (hasRequiredDecoders) return decoders;
  hasRequiredDecoders = 1;
  (function(exports) {
    const decoders2 = exports;
    decoders2.der = requireDer();
    decoders2.pem = requirePem();
  })(decoders);
  return decoders;
}
var hasRequiredApi;
function requireApi() {
  if (hasRequiredApi) return api;
  hasRequiredApi = 1;
  (function(exports) {
    const encoders2 = requireEncoders();
    const decoders2 = requireDecoders();
    const inherits = requireInherits();
    const api2 = exports;
    api2.define = function define(name, body) {
      return new Entity(name, body);
    };
    function Entity(name, body) {
      this.name = name;
      this.body = body;
      this.decoders = {};
      this.encoders = {};
    }
    Entity.prototype._createNamed = function createNamed(Base) {
      const name = this.name;
      function Generated(entity) {
        this._initNamed(entity, name);
      }
      inherits(Generated, Base);
      Generated.prototype._initNamed = function _initNamed(entity, name2) {
        Base.call(this, entity, name2);
      };
      return new Generated(this);
    };
    Entity.prototype._getDecoder = function _getDecoder(enc) {
      enc = enc || "der";
      if (!this.decoders.hasOwnProperty(enc))
        this.decoders[enc] = this._createNamed(decoders2[enc]);
      return this.decoders[enc];
    };
    Entity.prototype.decode = function decode(data, enc, options) {
      return this._getDecoder(enc).decode(data, options);
    };
    Entity.prototype._getEncoder = function _getEncoder(enc) {
      enc = enc || "der";
      if (!this.encoders.hasOwnProperty(enc))
        this.encoders[enc] = this._createNamed(encoders2[enc]);
      return this.encoders[enc];
    };
    Entity.prototype.encode = function encode(data, enc, reporter2) {
      return this._getEncoder(enc).encode(data, reporter2);
    };
  })(api);
  return api;
}
var base = {};
var hasRequiredBase;
function requireBase() {
  if (hasRequiredBase) return base;
  hasRequiredBase = 1;
  (function(exports) {
    const base2 = exports;
    base2.Reporter = requireReporter().Reporter;
    base2.DecoderBuffer = requireBuffer().DecoderBuffer;
    base2.EncoderBuffer = requireBuffer().EncoderBuffer;
    base2.Node = requireNode();
  })(base);
  return base;
}
var constants = {};
var hasRequiredConstants;
function requireConstants() {
  if (hasRequiredConstants) return constants;
  hasRequiredConstants = 1;
  (function(exports) {
    const constants2 = exports;
    constants2._reverse = function reverse(map) {
      const res = {};
      Object.keys(map).forEach(function(key) {
        if ((key | 0) == key)
          key = key | 0;
        const value = map[key];
        res[value] = key;
      });
      return res;
    };
    constants2.der = requireDer$2();
  })(constants);
  return constants;
}
var hasRequiredAsn1;
function requireAsn1() {
  if (hasRequiredAsn1) return asn1;
  hasRequiredAsn1 = 1;
  (function(exports) {
    const asn12 = exports;
    asn12.bignum = requireBn();
    asn12.define = requireApi().define;
    asn12.base = requireBase();
    asn12.constants = requireConstants();
    asn12.decoders = requireDecoders();
    asn12.encoders = requireEncoders();
  })(asn1);
  return asn1;
}
export {
  requireAsn1 as r
};
