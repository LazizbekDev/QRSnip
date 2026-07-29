import { prepareZXingModule, readBarcodes } from "zxing-wasm/reader";

/**
 * Preload ZXing WASM from the extension package (offline, no CDN).
 */
export async function init() {
  await prepareZXingModule({
    overrides: {
      locateFile: (path) => {
        if (path.endsWith(".wasm")) {
          if (typeof chrome !== "undefined" && chrome.runtime?.getURL) {
            return chrome.runtime.getURL("vendor/zxing_reader.wasm");
          }
          return path;
        }
        return path;
      },
    },
    fireImmediately: true,
  });
}

/**
 * Decode all readable symbologies from ImageData.
 * @param {ImageData} imageData
 */
export async function read(imageData) {
  return readBarcodes(imageData, {
    tryHarder: true,
    tryRotate: true,
    tryInvert: true,
    tryDownscale: true,
    maxNumberOfSymbols: 32,
    formats: [], // empty = all readable formats
    textMode: "Plain",
  });
}
