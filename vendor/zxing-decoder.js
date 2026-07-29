var QRSnipZXing = (() => {
  var __defProp = Object.defineProperty;
  var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
  var __getOwnPropNames = Object.getOwnPropertyNames;
  var __hasOwnProp = Object.prototype.hasOwnProperty;
  var __export = (target, all) => {
    for (var name in all)
      __defProp(target, name, { get: all[name], enumerable: true });
  };
  var __copyProps = (to, from, except, desc) => {
    if (from && typeof from === "object" || typeof from === "function") {
      for (let key of __getOwnPropNames(from))
        if (!__hasOwnProp.call(to, key) && key !== except)
          __defProp(to, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
    }
    return to;
  };
  var __toCommonJS = (mod) => __copyProps(__defProp({}, "__esModule", { value: true }), mod);

  // src/zxing-entry.js
  var zxing_entry_exports = {};
  __export(zxing_entry_exports, {
    init: () => init,
    read: () => read
  });

  // node_modules/zxing-wasm/dist/es/share.js
  var e = [
    [
      "All",
      "*",
      "*",
      "     ",
      0,
      "All"
    ],
    [
      "AllReadable",
      "*",
      "r",
      "     ",
      0,
      "All Readable"
    ],
    [
      "AllCreatable",
      "*",
      "w",
      "     ",
      0,
      "All Creatable"
    ],
    [
      "AllLinear",
      "*",
      "l",
      "     ",
      0,
      "All Linear"
    ],
    [
      "AllMatrix",
      "*",
      "m",
      "     ",
      0,
      "All Matrix"
    ],
    [
      "AllGS1",
      "*",
      "G",
      "     ",
      0,
      "All GS1"
    ],
    [
      "AllRetail",
      "*",
      "R",
      "     ",
      0,
      "All Retail"
    ],
    [
      "AllIndustrial",
      "*",
      "I",
      "     ",
      0,
      "All Industrial"
    ],
    [
      "Codabar",
      "F",
      " ",
      "lrw  ",
      18,
      "Codabar"
    ],
    [
      "Code39",
      "A",
      " ",
      "lrw I",
      8,
      "Code 39"
    ],
    [
      "Code39Std",
      "A",
      "s",
      "lrw I",
      8,
      "Code 39 Standard"
    ],
    [
      "Code39Ext",
      "A",
      "e",
      "lr  I",
      9,
      "Code 39 Extended"
    ],
    [
      "Code32",
      "A",
      "2",
      "lr  I",
      129,
      "Code 32"
    ],
    [
      "PZN",
      "A",
      "p",
      "lr  I",
      52,
      "Pharmazentralnummer"
    ],
    [
      "Code93",
      "G",
      " ",
      "lrw I",
      25,
      "Code 93"
    ],
    [
      "Code128",
      "C",
      " ",
      "lrwGI",
      20,
      "Code 128"
    ],
    [
      "ITF",
      "I",
      " ",
      "lrw I",
      3,
      "ITF"
    ],
    [
      "ITF14",
      "I",
      "4",
      "lr  I",
      89,
      "ITF-14"
    ],
    [
      "DataBar",
      "e",
      " ",
      "lr GR",
      29,
      "DataBar"
    ],
    [
      "DataBarOmni",
      "e",
      "o",
      "lr GR",
      29,
      "DataBar Omni"
    ],
    [
      "DataBarStk",
      "e",
      "s",
      "lr GR",
      79,
      "DataBar Stacked"
    ],
    [
      "DataBarStkOmni",
      "e",
      "O",
      "lr GR",
      80,
      "DataBar Stacked Omni"
    ],
    [
      "DataBarLtd",
      "e",
      "l",
      "lr GR",
      30,
      "DataBar Limited"
    ],
    [
      "DataBarExp",
      "e",
      "e",
      "lr GR",
      31,
      "DataBar Expanded"
    ],
    [
      "DataBarExpStk",
      "e",
      "E",
      "lr GR",
      81,
      "DataBar Expanded Stacked"
    ],
    [
      "EANUPC",
      "E",
      " ",
      "lr  R",
      15,
      "EAN/UPC"
    ],
    [
      "EAN13",
      "E",
      "1",
      "lrw R",
      15,
      "EAN-13"
    ],
    [
      "EAN8",
      "E",
      "8",
      "lrw R",
      10,
      "EAN-8"
    ],
    [
      "EAN5",
      "E",
      "5",
      "l   R",
      12,
      "EAN-5"
    ],
    [
      "EAN2",
      "E",
      "2",
      "l   R",
      11,
      "EAN-2"
    ],
    [
      "ISBN",
      "E",
      "i",
      "lr  R",
      69,
      "ISBN"
    ],
    [
      "UPCA",
      "E",
      "a",
      "lrw R",
      34,
      "UPC-A"
    ],
    [
      "UPCE",
      "E",
      "e",
      "lrw R",
      37,
      "UPC-E"
    ],
    [
      "Telepen",
      "B",
      " ",
      "lr  I",
      32,
      "Telepen"
    ],
    [
      "TelepenAlpha",
      "B",
      "0",
      "lr  I",
      32,
      "Telepen Alpha"
    ],
    [
      "TelepenNumeric",
      "B",
      "1",
      "lr  I",
      87,
      "Telepen Numeric"
    ],
    [
      "OtherBarcode",
      "X",
      " ",
      " r   ",
      0,
      "Other barcode"
    ],
    [
      "DXFilmEdge",
      "X",
      "x",
      "lr   ",
      147,
      "DX Film Edge"
    ],
    [
      "PDF417",
      "L",
      " ",
      "mrw  ",
      55,
      "PDF417"
    ],
    [
      "CompactPDF417",
      "L",
      "c",
      "mr   ",
      56,
      "Compact PDF417"
    ],
    [
      "MicroPDF417",
      "L",
      "m",
      "mr   ",
      84,
      "MicroPDF417"
    ],
    [
      "Aztec",
      "z",
      " ",
      "mr G ",
      92,
      "Aztec"
    ],
    [
      "AztecCode",
      "z",
      "c",
      "mrwG ",
      92,
      "Aztec Code"
    ],
    [
      "AztecRune",
      "z",
      "r",
      "mr   ",
      128,
      "Aztec Rune"
    ],
    [
      "QRCode",
      "Q",
      " ",
      "mrwG ",
      58,
      "QR Code"
    ],
    [
      "QRCodeModel1",
      "Q",
      "1",
      "mr   ",
      0,
      "QR Code Model 1"
    ],
    [
      "QRCodeModel2",
      "Q",
      "2",
      "mr   ",
      58,
      "QR Code Model 2"
    ],
    [
      "MicroQRCode",
      "Q",
      "m",
      "mr   ",
      97,
      "Micro QR Code"
    ],
    [
      "RMQRCode",
      "Q",
      "r",
      "mr G ",
      145,
      "rMQR Code"
    ],
    [
      "DataMatrix",
      "d",
      " ",
      "mrwG ",
      71,
      "Data Matrix"
    ],
    [
      "MaxiCode",
      "U",
      " ",
      "mr   ",
      57,
      "MaxiCode"
    ]
  ];
  var t = {
    DataBarExpanded: "DataBarExp",
    DataBarLimited: "DataBarLtd",
    "Linear-Codes": "AllLinear",
    "Matrix-Codes": "AllMatrix",
    Any: "All",
    rMQRCode: "RMQRCode"
  };
  var n = e.map((e2) => e2[5]);
  var r = e.filter((e2) => e2[1] === "*").map((e2) => e2[0]);
  var i = e.filter((e2) => e2[1] !== "*").map((e2) => e2[0]);
  var o = e.filter((e2) => e2[2] === " ").map((e2) => e2[0]);
  var s = e.filter((e2) => e2[3][0] === "l").map((e2) => e2[0]);
  var l = e.filter((e2) => e2[3][0] === "m").map((e2) => e2[0]);
  var d = e.filter((e2) => e2[3][1] === "r").map((e2) => e2[0]);
  var f = e.filter((e2) => e2[3][2] === "w" || e2[4] !== 0).map((e2) => e2[0]);
  var p = e.filter((e2) => e2[3][3] === "G").map((e2) => e2[0]);
  var m = e.filter((e2) => e2[3][4] === "R").map((e2) => e2[0]);
  var h = e.filter((e2) => e2[3][4] === "I").map((e2) => e2[0]);
  function y(e2) {
    var n2;
    return (n2 = t[e2]) == null ? e2 : n2;
  }
  function b(e2) {
    return e2.map(y).join(",");
  }
  var x = [
    "LocalAverage",
    "GlobalHistogram",
    "FixedThreshold",
    "BoolCast"
  ];
  function C(e2) {
    return x.indexOf(e2);
  }
  var w = /* @__PURE__ */ "Unknown.ASCII.ISO8859_1.ISO8859_2.ISO8859_3.ISO8859_4.ISO8859_5.ISO8859_6.ISO8859_7.ISO8859_8.ISO8859_9.ISO8859_10.ISO8859_11.ISO8859_13.ISO8859_14.ISO8859_15.ISO8859_16.Cp437.Cp1250.Cp1251.Cp1252.Cp1256.Shift_JIS.Big5.GB2312.GB18030.EUC_JP.EUC_KR.UTF16BE.UTF8.UTF16LE.UTF32BE.UTF32LE.BINARY".split(".");
  function E(e2) {
    return e2 === "UnicodeBig" ? w.indexOf("UTF16BE") : w.indexOf(e2);
  }
  var D = [
    "Text",
    "Binary",
    "Mixed",
    "GS1",
    "ISO15434",
    "UnknownECI"
  ];
  function k(e2) {
    return D[e2];
  }
  var A = [
    "Ignore",
    "Read",
    "Require"
  ];
  function M(e2) {
    return A.indexOf(e2);
  }
  var N = [
    "Plain",
    "ECI",
    "HRI",
    "Escaped",
    "Hex",
    "HexECI"
  ];
  function F(e2) {
    return N.indexOf(e2);
  }
  var I = {
    formats: [],
    tryHarder: true,
    tryRotate: true,
    tryInvert: true,
    tryDownscale: true,
    tryDenoise: false,
    binarizer: "LocalAverage",
    isPure: false,
    downscaleFactor: 3,
    downscaleThreshold: 500,
    minLineCount: 2,
    maxNumberOfSymbols: 255,
    validateOptionalChecksum: false,
    returnErrors: false,
    eanAddOnSymbol: "Ignore",
    textMode: "HRI",
    characterSet: "Unknown",
    tryCode39ExtendedMode: true
  };
  function L(e2) {
    var t2;
    return {
      ...e2,
      formats: b(e2.formats),
      binarizer: C(e2.binarizer),
      eanAddOnSymbol: M(e2.eanAddOnSymbol),
      textMode: F(e2.textMode),
      characterSet: E(e2.characterSet),
      tryCode39ExtendedMode: (t2 = e2.tryCode39ExtendedMode) == null || t2
    };
  }
  function R(e2) {
    return {
      ...e2,
      format: e2.format,
      symbology: e2.symbology,
      contentType: k(e2.contentType)
    };
  }
  var B = {
    format: "QRCode",
    readerInit: false,
    forceSquareDataMatrix: false,
    ecLevel: "",
    scale: 1,
    sizeHint: 0,
    rotate: 0,
    invert: false,
    withHRT: false,
    withQuietZones: true,
    addHRT: false,
    addQuietZones: true,
    options: ""
  };
  var W = { locateFile: (e2, t2) => {
    let n2 = e2.match(/_(.+?)\.wasm$/);
    return n2 ? `https://fastly.jsdelivr.net/npm/zxing-wasm@3.1.2/dist/${n2[1]}/${e2}` : t2 + e2;
  } };
  var G = /* @__PURE__ */ new WeakMap();
  function K(e2, t2) {
    return Object.is(e2, t2) || Object.keys(e2).length === Object.keys(t2).length && Object.keys(e2).every((n2) => Object.hasOwn(t2, n2) && e2[n2] === t2[n2]);
  }
  function q(e2, { overrides: t2, equalityFn: n2 = K, fireImmediately: r2 = false } = {}) {
    var i2, a2;
    let [o2, s2] = (i2 = G.get(e2)) == null ? [W] : i2, c2 = t2 == null ? o2 : t2, l2;
    if (r2) {
      if (s2 && (l2 = n2(o2, c2))) return s2;
      let t3 = e2({ ...c2 });
      return G.set(e2, [c2, t3]), t3;
    }
    ((a2 = l2) == null ? n2(o2, c2) : a2) || G.set(e2, [c2]);
  }
  function Y(e2) {
    let t2 = e2.byteLength >> 2, n2 = new Uint8Array(t2);
    for (let r2 = 0; r2 < t2; r2++) {
      let t3 = r2 << 2;
      n2[r2] = 306 * e2[t3] + 601 * e2[t3 + 1] + 117 * e2[t3 + 2] + 512 >> 10;
    }
    return n2;
  }
  async function X(e2, t2, n2 = I) {
    let r2 = {
      ...I,
      ...n2
    }, i2 = await q(e2, { fireImmediately: true }), a2, o2;
    if ("width" in t2 && "height" in t2 && "data" in t2) {
      let { data: e3, width: n3, height: s3 } = t2, c2 = Y(e3), l2 = c2.byteLength;
      if (o2 = i2._malloc(l2), !o2) throw Error(`Failed to allocate ${l2} bytes in WASM memory`);
      try {
        i2.HEAPU8.set(c2, o2), a2 = i2.readBarcodesFromPixmap(o2, n3, s3, L(r2));
      } finally {
        i2._free(o2);
      }
    } else {
      let e3, n3;
      if ("buffer" in t2) [e3, n3] = [t2.byteLength, t2];
      else if ("byteLength" in t2) [e3, n3] = [t2.byteLength, new Uint8Array(t2)];
      else if ("size" in t2) [e3, n3] = [t2.size, new Uint8Array(await t2.arrayBuffer())];
      else throw TypeError("Invalid input type");
      if (o2 = i2._malloc(e3), !o2) throw Error(`Failed to allocate ${e3} bytes in WASM memory`);
      try {
        i2.HEAPU8.set(n3, o2), a2 = i2.readBarcodesFromImage(o2, e3, L(r2));
      } finally {
        i2._free(o2);
      }
    }
    let s2 = [];
    for (let e3 = 0; e3 < a2.size(); ++e3) s2.push(R(a2.get(e3)));
    return s2;
  }
  var Q = {
    ...I,
    formats: [...I.formats]
  };
  var $ = { ...B };

  // node_modules/zxing-wasm/dist/es/reader/index.js
  async function x2(e2 = {}) {
    var t2, n2, r2, i2 = e2, a2 = !!globalThis.window, o2 = typeof Bun < "u", s2 = !!globalThis.WorkerGlobalScope;
    !((n2 = globalThis.process) == null || (n2 = n2.versions) == null) && n2.node && ((r2 = globalThis.process) == null || r2.type);
    var c2 = "./this.program", l2, u2 = "";
    function d2(e3) {
      return i2.locateFile ? i2.locateFile(e3, u2) : u2 + e3;
    }
    var f2, p2;
    if (a2 || s2 || o2) {
      try {
        u2 = new URL(".", l2).href;
      } catch {
      }
      s2 && (p2 = (e3) => {
        var t3 = new XMLHttpRequest();
        return t3.open("GET", e3, false), t3.responseType = "arraybuffer", t3.send(null), new Uint8Array(t3.response);
      }), f2 = async (e3) => {
        var t3 = await fetch(e3, { credentials: "same-origin" });
        if (t3.ok) return t3.arrayBuffer();
        throw Error(t3.status + " : " + t3.url);
      };
    }
    console.log.bind(console);
    var m2 = console.error.bind(console), h2, g2 = false, _2, ee, te = false;
    function ne() {
      var e3 = Wn.buffer;
      x3 = new Int8Array(e3), y2 = new Int16Array(e3), i2.HEAPU8 = T3 = new Uint8Array(e3), C2 = new Uint16Array(e3), b2 = new Int32Array(e3), w2 = new Uint32Array(e3), S3 = new Float32Array(e3), me = new Float64Array(e3);
    }
    function re() {
      if (i2.preRun) for (typeof i2.preRun == "function" && (i2.preRun = [i2.preRun]); i2.preRun.length; ) ye(i2.preRun.shift());
      he(ve);
    }
    function ie() {
      te = true, $2.ya();
    }
    function ae() {
      if (i2.postRun) for (typeof i2.postRun == "function" && (i2.postRun = [i2.postRun]); i2.postRun.length; ) _e(i2.postRun.shift());
      he(ge);
    }
    function oe(e3) {
      var t3, n3;
      (t3 = i2.onAbort) == null || t3.call(i2, e3), e3 = "Aborted(" + e3 + ")", m2(e3), g2 = true, e3 += ". Build with -sASSERTIONS for more info.";
      var r3 = new WebAssembly.RuntimeError(e3);
      throw (n3 = ee) == null || n3(r3), r3;
    }
    var v2;
    function se() {
      return d2("zxing_reader.wasm");
    }
    function ce(e3) {
      if (e3 == v2 && h2) return new Uint8Array(h2);
      if (p2) return p2(e3);
      throw "both async and sync fetching of the wasm failed";
    }
    async function le(e3) {
      if (!h2) try {
        var t3 = await f2(e3);
        return new Uint8Array(t3);
      } catch {
      }
      return ce(e3);
    }
    async function ue(e3, t3) {
      try {
        var n3 = await le(e3);
        return await WebAssembly.instantiate(n3, t3);
      } catch (e4) {
        m2(`failed to asynchronously prepare wasm: ${e4}`), oe(e4);
      }
    }
    async function de(e3, t3, n3) {
      if (!e3 && WebAssembly.instantiateStreaming) try {
        var r3 = fetch(t3, { credentials: "same-origin" });
        return await WebAssembly.instantiateStreaming(r3, n3);
      } catch (e4) {
        m2(`wasm streaming compile failed: ${e4}`), m2("falling back to ArrayBuffer instantiation");
      }
      return ue(t3, n3);
    }
    function fe() {
      return { a: qn };
    }
    async function pe() {
      function e3(e4, t4) {
        return $2 = e4.exports, Kn($2), ne(), $2;
      }
      function t3(t4) {
        return e3(t4.instance);
      }
      var n3 = fe();
      return i2.instantiateWasm ? new Promise((t4, r3) => {
        i2.instantiateWasm(n3, (n4, r4) => {
          t4(e3(n4, r4));
        });
      }) : (v2 != null || (v2 = se()), t3(await de(h2, v2, n3)));
    }
    var y2, b2, x3, S3, me, C2, w2, T3, he = (e3) => {
      for (; e3.length > 0; ) e3.shift()(i2);
    }, ge = [], _e = (e3) => ge.push(e3), ve = [], ye = (e3) => ve.push(e3), E2 = (e3) => In(e3), D2 = () => Ln(), O2 = [], be = 0, xe = (e3) => {
      var t3 = new Ce(e3);
      return t3.get_caught() || (t3.set_caught(true), be--), t3.set_rethrown(false), O2.push(t3), Pn(e3);
    }, k2 = 0, Se = () => {
      Q2(0, 0);
      var e3 = O2.pop();
      Rn(e3.excPtr), k2 = 0;
    };
    class Ce {
      constructor(e3) {
        this.excPtr = e3, this.ptr = e3 - 24;
      }
      set_type(e3) {
        w2[this.ptr + 4 >> 2] = e3;
      }
      get_type() {
        return w2[this.ptr + 4 >> 2];
      }
      set_destructor(e3) {
        w2[this.ptr + 8 >> 2] = e3;
      }
      get_destructor() {
        return w2[this.ptr + 8 >> 2];
      }
      set_caught(e3) {
        e3 = +!!e3, x3[this.ptr + 12] = e3;
      }
      get_caught() {
        return x3[this.ptr + 12] != 0;
      }
      set_rethrown(e3) {
        e3 = +!!e3, x3[this.ptr + 13] = e3;
      }
      get_rethrown() {
        return x3[this.ptr + 13] != 0;
      }
      init(e3, t3) {
        this.set_adjusted_ptr(0), this.set_type(e3), this.set_destructor(t3);
      }
      set_adjusted_ptr(e3) {
        w2[this.ptr + 16 >> 2] = e3;
      }
      get_adjusted_ptr() {
        return w2[this.ptr + 16 >> 2];
      }
    }
    var A2 = (e3) => Fn(e3), we = (e3) => {
      var t3 = k2;
      if (!t3) return A2(0), 0;
      var n3 = new Ce(t3);
      n3.set_adjusted_ptr(t3);
      var r3 = n3.get_type();
      if (!r3) return A2(0), t3;
      for (var i3 of e3) {
        if (i3 === 0 || i3 === r3) break;
        var a3 = n3.ptr + 16;
        if (Bn(i3, r3, a3)) return A2(i3), t3;
      }
      return A2(r3), t3;
    }, Te = () => we([]), Ee = (e3) => we([e3]), De = (e3, t3) => we([e3, t3]), Oe = () => {
      var e3 = O2.pop();
      e3 || oe("no exception to throw");
      var t3 = e3.excPtr;
      throw e3.get_rethrown() || (O2.push(e3), e3.set_rethrown(true), e3.set_caught(false), be++), zn(t3), k2 = t3, k2;
    }, ke = (e3, t3, n3) => {
      throw new Ce(e3).init(t3, n3), zn(e3), k2 = e3, be++, k2;
    }, Ae = () => be, je = (e3) => {
      throw k2 || (k2 = e3), k2;
    }, Me = () => oe(""), Ne = {}, Pe = (e3) => {
      for (; e3.length; ) {
        var t3 = e3.pop();
        e3.pop()(t3);
      }
    };
    function j2(e3) {
      return this.fromWireType(w2[e3 >> 2]);
    }
    var M2 = {}, N2 = {}, Fe = {}, Ie = class extends Error {
      constructor(e3) {
        super(e3), this.name = "InternalError";
      }
    }, Le = (e3) => {
      throw new Ie(e3);
    }, P2 = (e3, t3, n3) => {
      e3.forEach((e4) => Fe[e4] = t3);
      function r3(t4) {
        var r4 = n3(t4);
        r4.length !== e3.length && Le("Mismatched type converter count");
        for (var i4 = 0; i4 < e3.length; ++i4) R2(e3[i4], r4[i4]);
      }
      var i3 = Array(t3.length), a3 = [], o3 = 0;
      {
        let e4 = t3;
        for (let t4 = 0; t4 < e4.length; ++t4) {
          let n4 = e4[t4];
          N2.hasOwnProperty(n4) ? i3[t4] = N2[n4] : (a3.push(n4), M2.hasOwnProperty(n4) || (M2[n4] = []), M2[n4].push(() => {
            i3[t4] = N2[n4], ++o3, o3 === a3.length && r3(i3);
          }));
        }
      }
      a3.length === 0 && r3(i3);
    }, Re = (e3) => {
      var t3 = Ne[e3];
      delete Ne[e3];
      var n3 = t3.rawConstructor, r3 = t3.rawDestructor, i3 = t3.fields, a3 = i3.map((e4) => e4.getterReturnType).concat(i3.map((e4) => e4.setterArgumentType));
      P2([e3], a3, (e4) => {
        var a4 = {};
        {
          let t4 = i3;
          for (let n4 = 0; n4 < t4.length; ++n4) {
            let r4 = t4[n4], o3 = e4[n4], s3 = r4.getter, c3 = r4.getterContext, l3 = e4[n4 + i3.length], u3 = r4.setter, d3 = r4.setterContext;
            a4[r4.fieldName] = {
              read: (e5) => o3.fromWireType(s3(c3, e5)),
              write: (e5, t5) => {
                var n5 = [];
                u3(d3, e5, l3.toWireType(n5, t5)), Pe(n5);
              },
              optional: o3.optional
            };
          }
        }
        return [{
          name: t3.name,
          fromWireType: (e5) => {
            var t4 = {};
            for (var n4 in a4) t4[n4] = a4[n4].read(e5);
            return r3(e5), t4;
          },
          toWireType: (e5, t4) => {
            for (var i4 in a4) if (!(i4 in t4) && !a4[i4].optional) throw TypeError(`Missing field: "${i4}"`);
            var o3 = n3();
            for (i4 in a4) a4[i4].write(o3, t4[i4]);
            return e5 !== null && e5.push(r3, o3), o3;
          },
          readValueFromPointer: j2,
          destructorFunction: r3
        }];
      });
    }, ze = (e3, t3, n3, r3, i3) => {
    }, F2 = (e3) => {
      for (var t3 = ""; ; ) {
        var n3 = T3[e3++];
        if (!n3) return t3;
        t3 += String.fromCharCode(n3);
      }
    }, I2 = class extends Error {
      constructor(e3) {
        super(e3), this.name = "BindingError";
      }
    }, L2 = (e3) => {
      throw new I2(e3);
    };
    function Be(e3, t3) {
      let n3 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {};
      var r3 = t3.name;
      if (e3 || L2(`type "${r3}" must have a positive integer typeid pointer`), N2.hasOwnProperty(e3)) {
        if (n3.ignoreDuplicateRegistrations) return;
        L2(`Cannot register type '${r3}' twice`);
      }
      if (N2[e3] = t3, delete Fe[e3], M2.hasOwnProperty(e3)) {
        var i3 = M2[e3];
        delete M2[e3], i3.forEach((e4) => e4());
      }
    }
    function R2(e3, t3) {
      return Be(e3, t3, arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : {});
    }
    var Ve = (e3, t3, n3, r3) => {
      t3 = F2(t3), R2(e3, {
        name: t3,
        fromWireType: function(e4) {
          return !!e4;
        },
        toWireType: function(e4, t4) {
          return t4 ? n3 : r3;
        },
        readValueFromPointer: function(e4) {
          return this.fromWireType(T3[e4]);
        },
        destructorFunction: null
      });
    }, He = (e3) => ({
      count: e3.count,
      deleteScheduled: e3.deleteScheduled,
      preservePointerOnDelete: e3.preservePointerOnDelete,
      ptr: e3.ptr,
      ptrType: e3.ptrType,
      smartPtr: e3.smartPtr,
      smartPtrType: e3.smartPtrType
    }), Ue = (e3) => {
      function t3(e4) {
        return e4.$$.ptrType.registeredClass.name;
      }
      L2(t3(e3) + " instance already deleted");
    }, We = false, Ge = (e3) => {
    }, Ke = (e3) => {
      e3.smartPtr ? e3.smartPtrType.rawDestructor(e3.smartPtr) : e3.ptrType.registeredClass.rawDestructor(e3.ptr);
    }, qe = (e3) => {
      --e3.count.value, e3.count.value === 0 && Ke(e3);
    }, z = (e3) => globalThis.FinalizationRegistry ? (We = new FinalizationRegistry((e4) => {
      qe(e4.$$);
    }), z = (e4) => {
      var t3 = e4.$$;
      if (t3.smartPtr) {
        var n3 = { $$: t3 };
        We.register(e4, n3, e4);
      }
      return e4;
    }, Ge = (e4) => We.unregister(e4), z(e3)) : (z = (e4) => e4, e3), B2 = [], Je = () => {
      for (; B2.length; ) {
        var e3 = B2.pop();
        e3.$$.deleteScheduled = false, e3.delete();
      }
    }, Ye, Xe = () => {
      let e3 = V.prototype;
      Object.assign(e3, {
        isAliasOf(e4) {
          if (!(this instanceof V) || !(e4 instanceof V)) return false;
          var t4 = this.$$.ptrType.registeredClass, n3 = this.$$.ptr;
          e4.$$ = e4.$$;
          for (var r3 = e4.$$.ptrType.registeredClass, i3 = e4.$$.ptr; t4.baseClass; ) n3 = t4.upcast(n3), t4 = t4.baseClass;
          for (; r3.baseClass; ) i3 = r3.upcast(i3), r3 = r3.baseClass;
          return t4 === r3 && n3 === i3;
        },
        clone() {
          if (this.$$.ptr || Ue(this), this.$$.preservePointerOnDelete) return this.$$.count.value += 1, this;
          var e4 = z(Object.create(Object.getPrototypeOf(this), { $$: { value: He(this.$$) } }));
          return e4.$$.count.value += 1, e4.$$.deleteScheduled = false, e4;
        },
        delete() {
          this.$$.ptr || Ue(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && L2("Object already scheduled for deletion"), Ge(this), qe(this.$$), this.$$.preservePointerOnDelete || (this.$$.smartPtr = void 0, this.$$.ptr = void 0);
        },
        isDeleted() {
          return !this.$$.ptr;
        },
        deleteLater() {
          return this.$$.ptr || Ue(this), this.$$.deleteScheduled && !this.$$.preservePointerOnDelete && L2("Object already scheduled for deletion"), B2.push(this), B2.length === 1 && Ye && Ye(Je), this.$$.deleteScheduled = true, this;
        }
      });
      let t3 = Symbol.dispose;
      t3 && (e3[t3] = e3.delete);
    };
    function V() {
    }
    var Ze = (e3, t3) => Object.defineProperty(t3, "name", { value: e3 }), Qe = {}, $e = (e3, t3, n3) => {
      if (e3[t3].overloadTable === void 0) {
        var r3 = e3[t3];
        e3[t3] = function() {
          var r4 = [...arguments];
          return e3[t3].overloadTable.hasOwnProperty(r4.length) || L2(`Function '${n3}' called with an invalid number of arguments (${r4.length}) - expects one of (${e3[t3].overloadTable})!`), e3[t3].overloadTable[r4.length].apply(this, r4);
        }, e3[t3].overloadTable = [], e3[t3].overloadTable[r3.argCount] = r3;
      }
    }, et = (e3, t3, n3) => {
      i2.hasOwnProperty(e3) ? ((n3 === void 0 || i2[e3].overloadTable !== void 0 && i2[e3].overloadTable[n3] !== void 0) && L2(`Cannot register public name '${e3}' twice`), $e(i2, e3, e3), i2[e3].overloadTable.hasOwnProperty(n3) && L2(`Cannot register multiple overloads of a function with the same number of arguments (${n3})!`), i2[e3].overloadTable[n3] = t3) : (i2[e3] = t3, i2[e3].argCount = n3);
    }, tt = 48, nt = 57, rt = (e3) => {
      e3 = e3.replace(/[^a-zA-Z0-9_]/g, "$");
      var t3 = e3.charCodeAt(0);
      return t3 >= tt && t3 <= nt ? `_${e3}` : e3;
    };
    function it(e3, t3, n3, r3, i3, a3, o3, s3) {
      this.name = e3, this.constructor = t3, this.instancePrototype = n3, this.rawDestructor = r3, this.baseClass = i3, this.getActualType = a3, this.upcast = o3, this.downcast = s3, this.pureVirtualFunctions = [];
    }
    var at = (e3, t3, n3) => {
      for (; t3 !== n3; ) t3.upcast || L2(`Expected null or instance of ${n3.name}, got an instance of ${t3.name}`), e3 = t3.upcast(e3), t3 = t3.baseClass;
      return e3;
    }, ot = (e3) => {
      if (e3 === null) return "null";
      var t3 = typeof e3;
      return t3 === "object" || t3 === "array" || t3 === "function" ? e3.toString() : "" + e3;
    };
    function st(e3, t3) {
      if (t3 === null) return this.isReference && L2(`null is not a valid ${this.name}`), 0;
      t3.$$ || L2(`Cannot pass "${ot(t3)}" as a ${this.name}`), t3.$$.ptr || L2(`Cannot pass deleted object as a pointer of type ${this.name}`);
      var n3 = t3.$$.ptrType.registeredClass;
      return at(t3.$$.ptr, n3, this.registeredClass);
    }
    function ct(e3, t3) {
      var n3;
      if (t3 === null) return this.isReference && L2(`null is not a valid ${this.name}`), this.isSmartPointer ? (n3 = this.rawConstructor(), e3 !== null && e3.push(this.rawDestructor, n3), n3) : 0;
      (!t3 || !t3.$$) && L2(`Cannot pass "${ot(t3)}" as a ${this.name}`), t3.$$.ptr || L2(`Cannot pass deleted object as a pointer of type ${this.name}`), !this.isConst && t3.$$.ptrType.isConst && L2(`Cannot convert argument of type ${t3.$$.smartPtrType ? t3.$$.smartPtrType.name : t3.$$.ptrType.name} to parameter type ${this.name}`);
      var r3 = t3.$$.ptrType.registeredClass;
      if (n3 = at(t3.$$.ptr, r3, this.registeredClass), this.isSmartPointer) switch (t3.$$.smartPtr === void 0 && L2("Passing raw pointer to smart pointer is illegal"), this.sharingPolicy) {
        case 0:
          t3.$$.smartPtrType === this ? n3 = t3.$$.smartPtr : L2(`Cannot convert argument of type ${t3.$$.smartPtrType ? t3.$$.smartPtrType.name : t3.$$.ptrType.name} to parameter type ${this.name}`);
          break;
        case 1:
          n3 = t3.$$.smartPtr;
          break;
        case 2:
          if (t3.$$.smartPtrType === this) n3 = t3.$$.smartPtr;
          else {
            var i3 = t3.clone();
            n3 = this.rawShare(n3, J2.toHandle(() => i3.delete())), e3 !== null && e3.push(this.rawDestructor, n3);
          }
          break;
        default:
          L2("Unsupported sharing policy");
      }
      return n3;
    }
    function lt(e3, t3) {
      if (t3 === null) return this.isReference && L2(`null is not a valid ${this.name}`), 0;
      t3.$$ || L2(`Cannot pass "${ot(t3)}" as a ${this.name}`), t3.$$.ptr || L2(`Cannot pass deleted object as a pointer of type ${this.name}`), t3.$$.ptrType.isConst && L2(`Cannot convert argument of type ${t3.$$.ptrType.name} to parameter type ${this.name}`);
      var n3 = t3.$$.ptrType.registeredClass;
      return at(t3.$$.ptr, n3, this.registeredClass);
    }
    var ut = (e3, t3, n3) => {
      if (t3 === n3) return e3;
      if (n3.baseClass === void 0) return null;
      var r3 = ut(e3, t3, n3.baseClass);
      return r3 === null ? null : n3.downcast(r3);
    }, dt = {}, ft = (e3, t3) => {
      for (t3 === void 0 && L2("ptr should not be undefined"); e3.baseClass; ) t3 = e3.upcast(t3), e3 = e3.baseClass;
      return t3;
    }, pt = (e3, t3) => (t3 = ft(e3, t3), dt[t3]), H2 = (e3, t3) => ((!t3.ptrType || !t3.ptr) && Le("makeClassHandle requires ptr and ptrType"), !!t3.smartPtrType != !!t3.smartPtr && Le("Both smartPtrType and smartPtr must be specified"), t3.count = { value: 1 }, z(Object.create(e3, { $$: {
      value: t3,
      writable: true
    } })));
    function mt(e3) {
      var t3 = this.getPointee(e3);
      if (!t3) return this.destructor(e3), null;
      var n3 = pt(this.registeredClass, t3);
      if (n3 !== void 0) {
        if (n3.$$.count.value === 0) return n3.$$.ptr = t3, n3.$$.smartPtr = e3, n3.clone();
        var r3 = n3.clone();
        return this.destructor(e3), r3;
      }
      function i3() {
        return this.isSmartPointer ? H2(this.registeredClass.instancePrototype, {
          ptrType: this.pointeeType,
          ptr: t3,
          smartPtrType: this,
          smartPtr: e3
        }) : H2(this.registeredClass.instancePrototype, {
          ptrType: this,
          ptr: e3
        });
      }
      var a3 = Qe[this.registeredClass.getActualType(t3)];
      if (!a3) return i3.call(this);
      var o3 = this.isConst ? a3.constPointerType : a3.pointerType, s3 = ut(t3, this.registeredClass, o3.registeredClass);
      return s3 === null ? i3.call(this) : this.isSmartPointer ? H2(o3.registeredClass.instancePrototype, {
        ptrType: o3,
        ptr: s3,
        smartPtrType: this,
        smartPtr: e3
      }) : H2(o3.registeredClass.instancePrototype, {
        ptrType: o3,
        ptr: s3
      });
    }
    var ht = () => {
      Object.assign(U2.prototype, {
        getPointee(e3) {
          return this.rawGetPointee && (e3 = this.rawGetPointee(e3)), e3;
        },
        destructor(e3) {
          var t3;
          (t3 = this.rawDestructor) == null || t3.call(this, e3);
        },
        readValueFromPointer: j2,
        fromWireType: mt
      });
    };
    function U2(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u3) {
      this.name = e3, this.registeredClass = t3, this.isReference = n3, this.isConst = r3, this.isSmartPointer = i3, this.pointeeType = a3, this.sharingPolicy = o3, this.rawGetPointee = s3, this.rawConstructor = c3, this.rawShare = l3, this.rawDestructor = u3, !i3 && t3.baseClass === void 0 ? r3 ? (this.toWireType = st, this.destructorFunction = null) : (this.toWireType = lt, this.destructorFunction = null) : this.toWireType = ct;
    }
    var gt = (e3, t3, n3) => {
      i2.hasOwnProperty(e3) || Le("Replacing nonexistent public symbol"), i2[e3].overloadTable !== void 0 && n3 !== void 0 ? i2[e3].overloadTable[n3] = t3 : (i2[e3] = t3, i2[e3].argCount = n3);
    }, W2 = {}, _t = (e3, t3, n3) => {
      e3 = e3.replace(/p/g, "i");
      var r3 = W2[e3];
      return r3(t3, ...n3);
    }, vt = [], G2 = (e3) => {
      var t3 = vt[e3];
      return t3 || (vt[e3] = t3 = Gn.get(e3)), t3;
    }, yt = function(e3, t3) {
      let n3 = arguments.length > 2 && arguments[2] !== void 0 ? arguments[2] : [];
      if (arguments.length > 3 && arguments[3] !== void 0 && arguments[3], e3.includes("j")) return _t(e3, t3, n3);
      var r3 = G2(t3)(...n3);
      function i3(e4) {
        return e4;
      }
      return i3(r3);
    }, bt = function(e3, t3) {
      let n3 = arguments.length > 2 && arguments[2] !== void 0 && arguments[2];
      return function() {
        return yt(e3, t3, [...arguments], n3);
      };
    }, K2 = function(e3, t3) {
      arguments.length > 2 && arguments[2] !== void 0 && arguments[2], e3 = F2(e3);
      function n3() {
        return e3.includes("j") ? bt(e3, t3) : G2(t3);
      }
      var r3 = n3();
      return typeof r3 != "function" && L2(`unknown function pointer with signature ${e3}: ${t3}`), r3;
    };
    class xt extends Error {
    }
    var St = (e3) => {
      var t3 = Mn(e3), n3 = F2(t3);
      return Z(t3), n3;
    }, Ct = (e3, t3) => {
      var n3 = [], r3 = {};
      function i3(e4) {
        if (!r3[e4] && !N2[e4]) {
          if (Fe[e4]) {
            Fe[e4].forEach(i3);
            return;
          }
          n3.push(e4), r3[e4] = true;
        }
      }
      throw t3.forEach(i3), new xt(`${e3}: ` + n3.map(St).join([", "]));
    }, wt = (e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3, f3) => {
      u3 = F2(u3), a3 = K2(i3, a3), s3 && (s3 = K2(o3, s3)), l3 && (l3 = K2(c3, l3)), f3 = K2(d3, f3);
      var p3 = rt(u3);
      et(p3, function() {
        Ct(`Cannot construct ${u3} due to unbound types`, [r3]);
      }), P2([
        e3,
        t3,
        n3
      ], r3 ? [r3] : [], (t4) => {
        t4 = t4[0];
        var n4, i4;
        r3 ? (n4 = t4.registeredClass, i4 = n4.instancePrototype) : i4 = V.prototype;
        var o4 = Ze(u3, function() {
          if (Object.getPrototypeOf(this) !== c4) throw new I2(`Use 'new' to construct ${u3}`);
          if (d4.constructor_body === void 0) throw new I2(`${u3} has no accessible constructor`);
          var e4 = [...arguments], t5 = d4.constructor_body[e4.length];
          if (t5 === void 0) throw new I2(`Tried to invoke ctor of ${u3} with invalid number of parameters (${e4.length}) - expected (${Object.keys(d4.constructor_body).toString()}) parameters instead!`);
          return t5.apply(this, e4);
        }), c4 = Object.create(i4, { constructor: { value: o4 } });
        o4.prototype = c4;
        var d4 = new it(u3, o4, c4, f3, n4, a3, s3, l3);
        if (d4.baseClass) {
          var m3;
          (m3 = d4.baseClass).__derivedClasses != null || (m3.__derivedClasses = []), d4.baseClass.__derivedClasses.push(d4);
        }
        var h3 = new U2(u3, d4, true, false, false), g3 = new U2(u3 + "*", d4, false, false, false), _3 = new U2(u3 + " const*", d4, false, true, false);
        return Qe[e3] = {
          pointerType: g3,
          constPointerType: _3
        }, gt(p3, o4), [
          h3,
          g3,
          _3
        ];
      });
    }, Tt = (e3, t3) => {
      for (var n3 = [], r3 = 0; r3 < e3; r3++) n3.push(w2[t3 + r3 * 4 >> 2]);
      return n3;
    };
    function Et(e3) {
      for (var t3 = 1; t3 < e3.length; ++t3) if (e3[t3] !== null && e3[t3].destructorFunction === void 0) return true;
      return false;
    }
    function Dt(e3, t3, n3, r3, i3, a3) {
      var o3 = t3.length;
      o3 < 2 && L2("argTypes array size mismatch! Must at least get return value and 'this' types!");
      var s3 = t3[1] !== null && n3 !== null, c3 = Et(t3), l3 = !t3[0].isVoid, u3 = o3 - 2, d3 = Array(u3), f3 = [], p3 = [];
      return Ze(e3, function() {
        p3.length = 0;
        var e4;
        f3.length = s3 ? 2 : 1, f3[0] = i3, s3 && (e4 = t3[1].toWireType(p3, this), f3[1] = e4);
        for (var n4 = 0; n4 < u3; ++n4) d3[n4] = t3[n4 + 2].toWireType(p3, n4 < 0 || arguments.length <= n4 ? void 0 : arguments[n4]), f3.push(d3[n4]);
        var a4 = r3(...f3);
        function o4(n5) {
          if (c3) Pe(p3);
          else for (var r4 = s3 ? 1 : 2; r4 < t3.length; r4++) {
            var i4 = r4 === 1 ? e4 : d3[r4 - 2];
            t3[r4].destructorFunction !== null && t3[r4].destructorFunction(i4);
          }
          if (l3) return t3[0].fromWireType(n5);
        }
        return o4(a4);
      });
    }
    var Ot = (e3, t3, n3, r3, i3, a3) => {
      var o3 = Tt(t3, n3);
      i3 = K2(r3, i3), P2([], [e3], (e4) => {
        e4 = e4[0];
        var n4 = `constructor ${e4.name}`;
        if (e4.registeredClass.constructor_body === void 0 && (e4.registeredClass.constructor_body = []), e4.registeredClass.constructor_body[t3 - 1] !== void 0) throw new I2(`Cannot register multiple constructors with identical number of parameters (${t3 - 1}) for class '${e4.name}'! Overload resolution is currently only performed using the parameter count, not actual type info!`);
        return e4.registeredClass.constructor_body[t3 - 1] = () => {
          Ct(`Cannot construct ${e4.name} due to unbound types`, o3);
        }, P2([], o3, (r4) => (r4.splice(1, 0, null), e4.registeredClass.constructor_body[t3 - 1] = Dt(n4, r4, null, i3, a3), [])), [];
      });
    }, kt = (e3) => {
      e3 = e3.trim();
      let t3 = e3.indexOf("(");
      return t3 === -1 ? e3 : e3.slice(0, t3);
    }, At = (e3, t3, n3, r3, i3, a3, o3, s3, c3, l3) => {
      var u3 = Tt(n3, r3);
      t3 = F2(t3), t3 = kt(t3), a3 = K2(i3, a3, c3), P2([], [e3], (e4) => {
        e4 = e4[0];
        var r4 = `${e4.name}.${t3}`;
        t3.startsWith("@@") && (t3 = Symbol[t3.substring(2)]), s3 && e4.registeredClass.pureVirtualFunctions.push(t3);
        function i4() {
          Ct(`Cannot call ${r4} due to unbound types`, u3);
        }
        var l4 = e4.registeredClass.instancePrototype, d3 = l4[t3];
        return d3 === void 0 || d3.overloadTable === void 0 && d3.className !== e4.name && d3.argCount === n3 - 2 ? (i4.argCount = n3 - 2, i4.className = e4.name, l4[t3] = i4) : ($e(l4, t3, r4), l4[t3].overloadTable[n3 - 2] = i4), P2([], u3, (i5) => {
          var s4 = Dt(r4, i5, e4, a3, o3, c3);
          return l4[t3].overloadTable === void 0 ? (s4.argCount = n3 - 2, l4[t3] = s4) : l4[t3].overloadTable[n3 - 2] = s4, [];
        }), [];
      });
    }, jt = [], q2 = [
      0,
      1,
      ,
      1,
      null,
      1,
      true,
      1,
      false,
      1
    ], Mt = (e3) => {
      e3 > 9 && --q2[e3 + 1] === 0 && (q2[e3] = void 0, jt.push(e3));
    }, J2 = {
      toValue: (e3) => (e3 || L2(`Cannot use deleted val. handle = ${e3}`), q2[e3]),
      toHandle: (e3) => {
        switch (e3) {
          case void 0:
            return 2;
          case null:
            return 4;
          case true:
            return 6;
          case false:
            return 8;
          default: {
            let t3 = jt.pop() || q2.length;
            return q2[t3] = e3, q2[t3 + 1] = 1, t3;
          }
        }
      }
    }, Nt = {
      name: "emscripten::val",
      fromWireType: (e3) => {
        var t3 = J2.toValue(e3);
        return Mt(e3), t3;
      },
      toWireType: (e3, t3) => J2.toHandle(t3),
      readValueFromPointer: j2,
      destructorFunction: null
    }, Pt = (e3) => R2(e3, Nt), Ft = (e3, t3) => {
      switch (t3) {
        case 4:
          return function(e4) {
            return this.fromWireType(S3[e4 >> 2]);
          };
        case 8:
          return function(e4) {
            return this.fromWireType(me[e4 >> 3]);
          };
        default:
          throw TypeError(`invalid float width (${t3}): ${e3}`);
      }
    }, It = (e3, t3, n3) => {
      t3 = F2(t3), R2(e3, {
        name: t3,
        fromWireType: (e4) => e4,
        toWireType: (e4, t4) => t4,
        readValueFromPointer: Ft(t3, n3),
        destructorFunction: null
      });
    }, Lt = (e3, t3, n3, r3, i3, a3, o3, s3) => {
      var c3 = Tt(t3, n3);
      e3 = F2(e3), e3 = kt(e3), i3 = K2(r3, i3, o3), et(e3, function() {
        Ct(`Cannot call ${e3} due to unbound types`, c3);
      }, t3 - 1), P2([], c3, (n4) => {
        var r4 = [n4[0], null].concat(n4.slice(1));
        return gt(e3, Dt(e3, r4, null, i3, a3, o3), t3 - 1), [];
      });
    }, Rt = (e3, t3, n3) => {
      switch (t3) {
        case 1:
          return n3 ? (e4) => x3[e4] : (e4) => T3[e4];
        case 2:
          return n3 ? (e4) => y2[e4 >> 1] : (e4) => C2[e4 >> 1];
        case 4:
          return n3 ? (e4) => b2[e4 >> 2] : (e4) => w2[e4 >> 2];
        default:
          throw TypeError(`invalid integer width (${t3}): ${e3}`);
      }
    }, zt = (e3, t3, n3, r3, i3) => {
      t3 = F2(t3);
      let a3 = r3 === 0, o3 = (e4) => e4;
      if (a3) {
        var s3 = 32 - 8 * n3;
        o3 = (e4) => e4 << s3 >>> s3, i3 = o3(i3);
      }
      R2(e3, {
        name: t3,
        fromWireType: o3,
        toWireType: (e4, t4) => t4,
        readValueFromPointer: Rt(t3, n3, r3 !== 0),
        destructorFunction: null
      });
    }, Bt = (e3, t3, n3) => {
      let r3 = (e4, t4) => {
        let n4 = 0;
        return {
          next() {
            if (n4 >= e4) return { done: true };
            let r4 = n4;
            return n4++, {
              value: t4(r4),
              done: false
            };
          },
          [Symbol.iterator]() {
            return this;
          }
        };
      };
      e3[Symbol.iterator] || (e3[Symbol.iterator] = function() {
        let e4 = this[t3]();
        return r3(e4, (e5) => this[n3](e5));
      });
    }, Vt = (e3, t3, n3, r3) => {
      n3 = F2(n3), r3 = F2(r3), P2([], [e3, t3], (e4) => {
        let t4 = e4[0];
        return Bt(t4.registeredClass.instancePrototype, n3, r3), [];
      });
    }, Ht = (e3, t3, n3) => {
      var r3 = [
        Int8Array,
        Uint8Array,
        Int16Array,
        Uint16Array,
        Int32Array,
        Uint32Array,
        Float32Array,
        Float64Array
      ][t3];
      function i3(e4) {
        var t4 = w2[e4 >> 2], n4 = w2[e4 + 4 >> 2];
        return new r3(x3.buffer, n4, t4);
      }
      n3 = F2(n3), R2(e3, {
        name: n3,
        fromWireType: i3,
        readValueFromPointer: i3
      }, { ignoreDuplicateRegistrations: true });
    }, Ut = Object.assign({ optional: true }, Nt), Wt = (e3, t3) => {
      R2(e3, Ut);
    }, Gt = (e3, t3, n3, r3) => {
      if (!(r3 > 0)) return 0;
      for (var i3 = n3, a3 = n3 + r3 - 1, o3 = 0; o3 < e3.length; ++o3) {
        var s3 = e3.codePointAt(o3);
        if (s3 <= 127) {
          if (n3 >= a3) break;
          t3[n3++] = s3;
        } else if (s3 <= 2047) {
          if (n3 + 1 >= a3) break;
          t3[n3++] = 192 | s3 >> 6, t3[n3++] = 128 | s3 & 63;
        } else if (s3 <= 65535) {
          if (n3 + 2 >= a3) break;
          t3[n3++] = 224 | s3 >> 12, t3[n3++] = 128 | s3 >> 6 & 63, t3[n3++] = 128 | s3 & 63;
        } else {
          if (n3 + 3 >= a3) break;
          t3[n3++] = 240 | s3 >> 18, t3[n3++] = 128 | s3 >> 12 & 63, t3[n3++] = 128 | s3 >> 6 & 63, t3[n3++] = 128 | s3 & 63, o3++;
        }
      }
      return t3[n3] = 0, n3 - i3;
    }, Y2 = (e3, t3, n3) => Gt(e3, T3, t3, n3), Kt = (e3) => {
      for (var t3 = 0, n3 = 0; n3 < e3.length; ++n3) {
        var r3 = e3.charCodeAt(n3);
        r3 <= 127 ? t3++ : r3 <= 2047 ? t3 += 2 : r3 >= 55296 && r3 <= 57343 ? (t3 += 4, ++n3) : t3 += 3;
      }
      return t3;
    }, qt = globalThis.TextDecoder && new TextDecoder(), Jt = (e3, t3, n3, r3) => {
      var i3 = t3 + n3;
      if (r3) return i3;
      for (; e3[t3] && !(t3 >= i3); ) ++t3;
      return t3;
    }, Yt = function(e3) {
      let t3 = arguments.length > 1 && arguments[1] !== void 0 ? arguments[1] : 0, n3 = arguments.length > 2 ? arguments[2] : void 0, r3 = arguments.length > 3 ? arguments[3] : void 0;
      var i3 = Jt(e3, t3, n3, r3);
      if (i3 - t3 > 16 && e3.buffer && qt) return qt.decode(e3.subarray(t3, i3));
      for (var a3 = ""; t3 < i3; ) {
        var o3 = e3[t3++];
        if (!(o3 & 128)) {
          a3 += String.fromCharCode(o3);
          continue;
        }
        var s3 = e3[t3++] & 63;
        if ((o3 & 224) == 192) {
          a3 += String.fromCharCode((o3 & 31) << 6 | s3);
          continue;
        }
        var c3 = e3[t3++] & 63;
        if (o3 = (o3 & 240) == 224 ? (o3 & 15) << 12 | s3 << 6 | c3 : (o3 & 7) << 18 | s3 << 12 | c3 << 6 | e3[t3++] & 63, o3 < 65536) a3 += String.fromCharCode(o3);
        else {
          var l3 = o3 - 65536;
          a3 += String.fromCharCode(55296 | l3 >> 10, 56320 | l3 & 1023);
        }
      }
      return a3;
    }, Xt = (e3, t3, n3) => e3 ? Yt(T3, e3, t3, n3) : "", Zt = (e3, t3) => {
      t3 = F2(t3);
      var n3 = true;
      R2(e3, {
        name: t3,
        fromWireType(e4) {
          var t4 = w2[e4 >> 2], r3 = e4 + 4, i3;
          if (n3) i3 = Xt(r3, t4, true);
          else {
            i3 = "";
            for (var a3 = 0; a3 < t4; ++a3) i3 += String.fromCharCode(T3[r3 + a3]);
          }
          return Z(e4), i3;
        },
        toWireType(e4, t4) {
          t4 instanceof ArrayBuffer && (t4 = new Uint8Array(t4));
          var r3, i3 = typeof t4 == "string";
          i3 || ArrayBuffer.isView(t4) && t4.BYTES_PER_ELEMENT == 1 || L2("Cannot pass non-string to std::string"), r3 = n3 && i3 ? Kt(t4) : t4.length;
          var a3 = Nn(4 + r3 + 1), o3 = a3 + 4;
          if (w2[a3 >> 2] = r3, i3) if (n3) Y2(t4, o3, r3 + 1);
          else for (var s3 = 0; s3 < r3; ++s3) {
            var c3 = t4.charCodeAt(s3);
            c3 > 255 && (Z(a3), L2("String has UTF-16 code units that do not fit in 8 bits")), T3[o3 + s3] = c3;
          }
          else T3.set(t4, o3);
          return e4 !== null && e4.push(Z, a3), a3;
        },
        readValueFromPointer: j2,
        destructorFunction(e4) {
          Z(e4);
        }
      });
    }, Qt = globalThis.TextDecoder ? new TextDecoder("utf-16le") : void 0, $t = (e3, t3, n3) => {
      var r3 = e3 >> 1, i3 = Jt(C2, r3, t3 / 2, n3);
      if (i3 - r3 > 16 && Qt) return Qt.decode(C2.subarray(r3, i3));
      for (var a3 = "", o3 = r3; o3 < i3; ++o3) {
        var s3 = C2[o3];
        a3 += String.fromCharCode(s3);
      }
      return a3;
    }, en = (e3, t3, n3) => {
      if (n3 != null || (n3 = 2147483647), n3 < 2) return 0;
      n3 -= 2;
      for (var r3 = t3, i3 = n3 < e3.length * 2 ? n3 / 2 : e3.length, a3 = 0; a3 < i3; ++a3) {
        var o3 = e3.charCodeAt(a3);
        y2[t3 >> 1] = o3, t3 += 2;
      }
      return y2[t3 >> 1] = 0, t3 - r3;
    }, tn = (e3) => e3.length * 2, nn = (e3, t3, n3) => {
      for (var r3 = "", i3 = e3 >> 2, a3 = 0; !(a3 >= t3 / 4); a3++) {
        var o3 = w2[i3 + a3];
        if (!o3 && !n3) break;
        r3 += String.fromCodePoint(o3);
      }
      return r3;
    }, rn = (e3, t3, n3) => {
      if (n3 != null || (n3 = 2147483647), n3 < 4) return 0;
      for (var r3 = t3, i3 = r3 + n3 - 4, a3 = 0; a3 < e3.length; ++a3) {
        var o3 = e3.codePointAt(a3);
        if (o3 > 65535 && a3++, b2[t3 >> 2] = o3, t3 += 4, t3 + 4 > i3) break;
      }
      return b2[t3 >> 2] = 0, t3 - r3;
    }, an = (e3) => {
      for (var t3 = 0, n3 = 0; n3 < e3.length; ++n3) e3.codePointAt(n3) > 65535 && n3++, t3 += 4;
      return t3;
    }, on = (e3, t3, n3) => {
      n3 = F2(n3);
      var r3, i3, a3;
      t3 === 2 ? (r3 = $t, i3 = en, a3 = tn) : (r3 = nn, i3 = rn, a3 = an), R2(e3, {
        name: n3,
        fromWireType: (e4) => {
          var n4 = w2[e4 >> 2], i4 = r3(e4 + 4, n4 * t3, true);
          return Z(e4), i4;
        },
        toWireType: (e4, r4) => {
          typeof r4 != "string" && L2(`Cannot pass non-string to C++ string type ${n3}`);
          var o3 = a3(r4), s3 = Nn(4 + o3 + t3);
          return w2[s3 >> 2] = o3 / t3, i3(r4, s3 + 4, o3 + t3), e4 !== null && e4.push(Z, s3), s3;
        },
        readValueFromPointer: j2,
        destructorFunction(e4) {
          Z(e4);
        }
      });
    }, sn = (e3, t3, n3, r3, i3, a3) => {
      Ne[e3] = {
        name: F2(t3),
        rawConstructor: K2(n3, r3),
        rawDestructor: K2(i3, a3),
        fields: []
      };
    }, cn = (e3, t3, n3, r3, i3, a3, o3, s3, c3, l3) => {
      Ne[e3].fields.push({
        fieldName: F2(t3),
        getterReturnType: n3,
        getter: K2(r3, i3),
        getterContext: a3,
        setterArgumentType: o3,
        setter: K2(s3, c3),
        setterContext: l3
      });
    }, ln = (e3, t3) => {
      t3 = F2(t3), R2(e3, {
        isVoid: true,
        name: t3,
        fromWireType: () => void 0,
        toWireType: (e4, t4) => void 0
      });
    }, un = [], dn = (e3) => {
      var t3 = un.length;
      return un.push(e3), t3;
    }, fn = (e3, t3) => {
      var n3 = N2[e3];
      return n3 === void 0 && L2(`${t3} has unknown type ${St(e3)}`), n3;
    }, pn = (e3, t3) => {
      for (var n3 = Array(e3), r3 = 0; r3 < e3; ++r3) n3[r3] = fn(w2[t3 + r3 * 4 >> 2], `parameter ${r3}`);
      return n3;
    }, mn = (e3, t3, n3) => {
      var r3 = [], i3 = e3(r3, n3);
      return r3.length && (w2[t3 >> 2] = J2.toHandle(r3)), i3;
    }, hn = {}, gn = (e3) => {
      var t3 = hn[e3];
      return t3 === void 0 ? F2(e3) : t3;
    }, _n = (e3, t3, n3) => {
      var [r3, ...i3] = pn(e3, t3), a3 = r3.toWireType.bind(r3), o3 = i3.map((e4) => e4.readValueFromPointer.bind(e4));
      e3--;
      var s3 = Array(e3);
      return dn(Ze(`methodCaller<(${i3.map((e4) => e4.name)}) => ${r3.name}>`, (t4, r4, i4, c3) => {
        for (var l3 = 0, u3 = 0; u3 < e3; ++u3) s3[u3] = o3[u3](c3 + l3), l3 += 8;
        var d3;
        switch (n3) {
          case 0:
            d3 = J2.toValue(t4).apply(null, s3);
            break;
          case 2:
            d3 = Reflect.construct(J2.toValue(t4), s3);
            break;
          case 3:
            d3 = s3[0];
            break;
          case 1:
            d3 = J2.toValue(t4)[gn(r4)](...s3);
            break;
        }
        return mn(a3, i4, d3);
      }));
    }, vn = (e3) => e3 ? (e3 = gn(e3), J2.toHandle(globalThis[e3])) : J2.toHandle(globalThis), yn = (e3) => {
      e3 > 9 && (q2[e3 + 1] += 1);
    }, bn = (e3, t3, n3, r3, i3) => un[e3](t3, n3, r3, i3), xn = (e3) => {
      Pe(J2.toValue(e3)), Mt(e3);
    }, Sn = (e3, t3, n3, r3) => {
      var i3 = (/* @__PURE__ */ new Date()).getFullYear(), a3 = new Date(i3, 0, 1), o3 = new Date(i3, 6, 1), s3 = a3.getTimezoneOffset(), c3 = o3.getTimezoneOffset(), l3 = Math.max(s3, c3);
      w2[e3 >> 2] = l3 * 60, b2[t3 >> 2] = Number(s3 != c3);
      var u3 = (e4) => {
        var t4 = e4 >= 0 ? "-" : "+", n4 = Math.abs(e4);
        return `UTC${t4}${String(Math.floor(n4 / 60)).padStart(2, "0")}${String(n4 % 60).padStart(2, "0")}`;
      }, d3 = u3(s3), f3 = u3(c3);
      c3 < s3 ? (Y2(d3, n3, 17), Y2(f3, r3, 17)) : (Y2(d3, r3, 17), Y2(f3, n3, 17));
    }, Cn = () => 2147483648, wn = (e3, t3) => Math.ceil(e3 / t3) * t3, Tn = (e3) => {
      var t3 = (e3 - Wn.buffer.byteLength + 65535) / 65536 | 0;
      try {
        return Wn.grow(t3), ne(), 1;
      } catch {
      }
    }, En = (e3) => {
      var t3 = T3.length;
      e3 >>>= 0;
      var n3 = Cn();
      if (e3 > n3) return false;
      for (var r3 = 1; r3 <= 4; r3 *= 2) {
        var i3 = t3 * (1 + 0.2 / r3);
        if (i3 = Math.min(i3, e3 + 100663296), Tn(Math.min(n3, wn(Math.max(e3, i3), 65536)))) return true;
      }
      return false;
    }, Dn = {}, On = () => c2 || "./this.program", X2 = () => {
      if (!X2.strings) {
        var e3, t3, n3 = {
          USER: "web_user",
          LOGNAME: "web_user",
          PATH: "/",
          PWD: "/",
          HOME: "/home/web_user",
          LANG: ((e3 = (t3 = globalThis.navigator) == null ? void 0 : t3.language) == null ? "C" : e3).replace("-", "_") + ".UTF-8",
          _: On()
        };
        for (var r3 in Dn) Dn[r3] === void 0 ? delete n3[r3] : n3[r3] = Dn[r3];
        var i3 = [];
        for (var r3 in n3) i3.push(`${r3}=${n3[r3]}`);
        X2.strings = i3;
      }
      return X2.strings;
    }, kn = (e3, t3) => {
      var n3 = 0, r3 = 0;
      for (var i3 of X2()) {
        var a3 = t3 + n3;
        w2[e3 + r3 >> 2] = a3, n3 += Y2(i3, a3, Infinity) + 1, r3 += 4;
      }
      return 0;
    }, An = (e3, t3) => {
      var n3 = X2();
      w2[e3 >> 2] = n3.length;
      var r3 = 0;
      for (var i3 of n3) r3 += Kt(i3) + 1;
      return w2[t3 >> 2] = r3, 0;
    }, jn = (e3) => e3;
    if (Xe(), ht(), i2.noExitRuntime && i2.noExitRuntime, i2.print && i2.print, i2.printErr && (m2 = i2.printErr), i2.wasmBinary && (h2 = i2.wasmBinary), i2.arguments && i2.arguments, i2.thisProgram && (c2 = i2.thisProgram), i2.preInit) for (typeof i2.preInit == "function" && (i2.preInit = [i2.preInit]); i2.preInit.length > 0; ) i2.preInit.shift()();
    var Mn, Z, Nn, Pn, Q2, Fn, In, Ln, Rn, zn, Bn, Vn, Hn, Un, Wn, Gn;
    function Kn(e3) {
      Mn = e3.za, Z = i2._free = e3.Aa, Nn = i2._malloc = e3.Ca, Pn = e3.Da, Q2 = e3.Ea, Fn = e3.Fa, In = e3.Ga, Ln = e3.Ha, Rn = e3.Ia, zn = e3.Ja, Bn = e3.Ka, W2.viijii = e3.La, Vn = W2.viijjijjjjjj = e3.Ma, Hn = W2.iiijj = e3.Na, Un = W2.jiiii = e3.Oa, W2.iiiiij = e3.Pa, W2.iiiiijj = e3.Qa, W2.iiiiiijj = e3.Ra, Wn = e3.xa, Gn = e3.Ba;
    }
    var qn = {
      q: xe,
      x: Se,
      a: Te,
      i: Ee,
      m: De,
      S: Oe,
      p: ke,
      fa: Ae,
      d: je,
      ba: Me,
      ua: Re,
      aa: ze,
      oa: Ve,
      sa: wt,
      ra: Ot,
      H: At,
      ma: Pt,
      X: It,
      Y: Lt,
      A: zt,
      qa: Vt,
      u: Ht,
      ta: Wt,
      na: Zt,
      T: on,
      I: sn,
      va: cn,
      pa: ln,
      O: _n,
      wa: Mt,
      F: vn,
      U: yn,
      N: bn,
      ha: xn,
      ca: Sn,
      ga: En,
      da: kn,
      ea: An,
      ka: mr,
      M: _r,
      B: Cr,
      P: tr,
      V: Tr,
      s: Er,
      b: Xn,
      C: gr,
      ia: xr,
      c: Qn,
      Q: Sr,
      h: er,
      j: sr,
      r: cr,
      R: hr,
      t: ur,
      G: dr,
      D: fr,
      K: Dr,
      _: Ar,
      Z: jr,
      f: nr,
      l: Jn,
      e: Zn,
      W: vr,
      g: $n,
      L: wr,
      k: Yn,
      ja: yr,
      o: lr,
      y: ir,
      v: pr,
      E: or,
      w: br,
      n: rr,
      J: Or,
      la: ar,
      $: kr,
      z: jn
    };
    function Jn(e3, t3) {
      var n3 = D2();
      try {
        G2(e3)(t3);
      } catch (e4) {
        if (E2(n3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Yn(e3, t3, n3, r3, i3) {
      var a3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3);
      } catch (e4) {
        if (E2(a3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Xn(e3, t3) {
      var n3 = D2();
      try {
        return G2(e3)(t3);
      } catch (e4) {
        if (E2(n3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Zn(e3, t3, n3) {
      var r3 = D2();
      try {
        G2(e3)(t3, n3);
      } catch (e4) {
        if (E2(r3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Qn(e3, t3, n3) {
      var r3 = D2();
      try {
        return G2(e3)(t3, n3);
      } catch (e4) {
        if (E2(r3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function $n(e3, t3, n3, r3) {
      var i3 = D2();
      try {
        G2(e3)(t3, n3, r3);
      } catch (e4) {
        if (E2(i3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function er(e3, t3, n3, r3) {
      var i3 = D2();
      try {
        return G2(e3)(t3, n3, r3);
      } catch (e4) {
        if (E2(i3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function tr(e3, t3, n3, r3, i3, a3) {
      var o3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3, a3);
      } catch (e4) {
        if (E2(o3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function nr(e3) {
      var t3 = D2();
      try {
        G2(e3)();
      } catch (e4) {
        if (E2(t3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function rr(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u3) {
      var d3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3, s3, c3, l3, u3);
      } catch (e4) {
        if (E2(d3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function ir(e3, t3, n3, r3, i3, a3, o3) {
      var s3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3);
      } catch (e4) {
        if (E2(s3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function ar(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3, f3, p3, m3, h3, g3) {
      var _3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3, f3, p3, m3, h3, g3);
      } catch (e4) {
        if (E2(_3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function or(e3, t3, n3, r3, i3, a3, o3, s3, c3) {
      var l3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3, s3, c3);
      } catch (e4) {
        if (E2(l3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function sr(e3, t3, n3, r3, i3) {
      var a3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3);
      } catch (e4) {
        if (E2(a3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function cr(e3, t3, n3, r3, i3, a3) {
      var o3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3, a3);
      } catch (e4) {
        if (E2(o3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function lr(e3, t3, n3, r3, i3, a3) {
      var o3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3);
      } catch (e4) {
        if (E2(o3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function ur(e3, t3, n3, r3, i3, a3, o3) {
      var s3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3, a3, o3);
      } catch (e4) {
        if (E2(s3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function dr(e3, t3, n3, r3, i3, a3, o3, s3) {
      var c3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3, a3, o3, s3);
      } catch (e4) {
        if (E2(c3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function fr(e3, t3, n3, r3, i3, a3, o3, s3, c3) {
      var l3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3, a3, o3, s3, c3);
      } catch (e4) {
        if (E2(l3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function pr(e3, t3, n3, r3, i3, a3, o3, s3) {
      var c3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3, s3);
      } catch (e4) {
        if (E2(c3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function mr(e3, t3, n3) {
      var r3 = D2();
      try {
        return G2(e3)(t3, n3);
      } catch (e4) {
        if (E2(r3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function hr(e3, t3, n3, r3, i3, a3, o3) {
      var s3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3, a3, o3);
      } catch (e4) {
        if (E2(s3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function gr(e3, t3, n3, r3) {
      var i3 = D2();
      try {
        return G2(e3)(t3, n3, r3);
      } catch (e4) {
        if (E2(i3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function _r(e3, t3, n3, r3) {
      var i3 = D2();
      try {
        return G2(e3)(t3, n3, r3);
      } catch (e4) {
        if (E2(i3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function vr(e3, t3, n3, r3, i3, a3, o3, s3, c3) {
      var l3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3, s3, c3);
      } catch (e4) {
        if (E2(l3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function yr(e3, t3, n3, r3, i3, a3, o3, s3) {
      var c3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3, s3);
      } catch (e4) {
        if (E2(c3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function br(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3) {
      var u3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3, s3, c3, l3);
      } catch (e4) {
        if (E2(u3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function xr(e3, t3, n3) {
      var r3 = D2();
      try {
        return G2(e3)(t3, n3);
      } catch (e4) {
        if (E2(r3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Sr(e3, t3, n3, r3, i3) {
      var a3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3);
      } catch (e4) {
        if (E2(a3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Cr(e3, t3, n3, r3, i3, a3) {
      var o3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3, a3);
      } catch (e4) {
        if (E2(o3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function wr(e3, t3, n3, r3, i3, a3, o3) {
      var s3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3);
      } catch (e4) {
        if (E2(s3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Tr(e3, t3, n3, r3) {
      var i3 = D2();
      try {
        return G2(e3)(t3, n3, r3);
      } catch (e4) {
        if (E2(i3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Er(e3) {
      var t3 = D2();
      try {
        return G2(e3)();
      } catch (e4) {
        if (E2(t3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Dr(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3) {
      var f3 = D2();
      try {
        return G2(e3)(t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3);
      } catch (e4) {
        if (E2(f3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Or(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3, f3, p3, m3, h3) {
      var g3 = D2();
      try {
        G2(e3)(t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3, f3, p3, m3, h3);
      } catch (e4) {
        if (E2(g3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function kr(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3, f3, p3, m3, h3, g3, _3, ee2, te2) {
      var ne2 = D2();
      try {
        Vn(e3, t3, n3, r3, i3, a3, o3, s3, c3, l3, u3, d3, f3, p3, m3, h3, g3, _3, ee2, te2);
      } catch (e4) {
        if (E2(ne2), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Ar(e3, t3, n3, r3, i3, a3, o3) {
      var s3 = D2();
      try {
        return Hn(e3, t3, n3, r3, i3, a3, o3);
      } catch (e4) {
        if (E2(s3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function jr(e3, t3, n3, r3, i3) {
      var a3 = D2();
      try {
        return Un(e3, t3, n3, r3, i3);
      } catch (e4) {
        if (E2(a3), e4 !== e4 + 0) throw e4;
        Q2(1, 0);
      }
    }
    function Mr() {
      re();
      function e3() {
        var e4, t3;
        i2.calledRun = true, !g2 && (ie(), (e4 = _2) == null || e4(i2), (t3 = i2.onRuntimeInitialized) == null || t3.call(i2), ae());
      }
      i2.setStatus ? (i2.setStatus("Running..."), setTimeout(() => {
        setTimeout(() => i2.setStatus(""), 1), e3();
      }, 1)) : e3();
    }
    var $2 = await pe();
    return Mr(), t2 = te ? i2 : new Promise((e3, t3) => {
      _2 = e3, ee = t3;
    }), t2;
  }
  function S2(e2) {
    return q(x2, e2);
  }
  async function T2(e2, t2) {
    return X(x2, e2, t2);
  }

  // src/zxing-entry.js
  async function init() {
    await S2({
      overrides: {
        locateFile: (path) => {
          if (path.endsWith(".wasm")) {
            if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
              return chrome.runtime.getURL("vendor/zxing_reader.wasm");
            }
            return path;
          }
          return path;
        }
      },
      fireImmediately: true
    });
  }
  async function read(imageData) {
    return T2(imageData, {
      tryHarder: true,
      tryRotate: true,
      tryInvert: true,
      tryDownscale: true,
      maxNumberOfSymbols: 32,
      formats: [],
      // empty = all readable formats
      textMode: "Plain"
    });
  }
  return __toCommonJS(zxing_entry_exports);
})();
