import pako from "https://cdn.jsdelivr.net/npm/pako@2.1.0/+esm";
import jsUntar from "https://cdn.jsdelivr.net/npm/js-untar@2.0.0/+esm";

let db = null;
let db_name = "stk_db";
let store_name = "stk_store";
let idbfs_mount = null;
let data_version = 1;

let start_button = document.getElementById("start_button");
let status_text = document.getElementById("status_text");
let info_container = document.getElementById("info_container");
let quality_select = document.getElementById("quality_select");

let syncing_fs = false;
let config = {};

function load_db() {
  if (db) return db;
  return new Promise((resolve, reject) => {
    let request = indexedDB.open(db_name, 1);
    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = (event) => {
      db = event.target.result;
      resolve(db);
    };
    request.onupgradeneeded = (event) => {
      let db = event.target.result;
      db.createObjectStore(store_name);
    };
  });
}

function request_async(request) {
  return new Promise((resolve, reject) => {
    request.onerror = (event) => {
      reject(event);
    };
    request.onsuccess = () => {
      resolve(request.result);
    };
  });
}

async function delete_db() {
  if (db) {
    db.close();
    db = null;
  }
  await request_async(indexedDB.deleteDatabase(db_name));
}

async function load_store() {
  await load_db();
  let transaction = db.transaction(store_name, "readwrite");
  let store = transaction.objectStore(store_name);
  return store;
}

async function check_db(key) {
  let store = await load_store();
  return await request_async(store.count(key));
}

async function read_db(key) {
  let store = await load_store();
  return await request_async(store.get(key));
}

async function write_db(key, data) {
  let store = await load_store();
  return await request_async(store.put(data, key));
}

async function read_db_chunks(key) {
  let {size, chunk_count} = await read_db(key);
  let offset = 0;
  let array = new Uint8Array(size);
  
  for (let i = 0; i < chunk_count; i++) {
    let chunk_array = await read_db(key + "." + i);
    array.set(chunk_array, offset);
    offset += chunk_array.length;
  }

  return array;
}

async function write_db_chunks(key, data) {
  let size = data.length;
  let chunk_size = 20_000_000;
  let chunk_count = Math.ceil(size / chunk_size);

  let offset = 0;
  for (let i = 0; i < chunk_count; i++) {
    let chunk_array = data.slice(offset, offset + chunk_size);
    await write_db(key + "." + i, chunk_array);
    offset += chunk_size;
  }

  await write_db(key, {size, chunk_count});
}

async function download_chunks(url) {
  const baseUrl = url.slice(0, url.lastIndexOf("/") + 1);
  const filename = url.slice(url.lastIndexOf("/") + 1);
  status_text.textContent = `Downloading manifest for ${filename}...`;
  const manifestResponse = await fetch(url + ".manifest");
  if (!manifestResponse.ok) throw new Error("Asset manifest HTTP " + manifestResponse.status);
  const [sizeLine, ...lines] = (await manifestResponse.text()).trim().split(/\r?\n/);
  const totalSize = Number(sizeLine);
  const chunkNames = lines.filter(Boolean);
  if (!Number.isSafeInteger(totalSize) || totalSize < 1 || totalSize > 250_000_000 || !chunkNames.length) {
    throw new Error("Invalid asset manifest");
  }
  const array = new Uint8Array(totalSize);
  let offset = 0;
  for (let i = 0; i < chunkNames.length; i++) {
    const chunk = chunkNames[i];
    if (!/^data_(?:low|mid|high)\.tar\.gz\.\d+$/.test(chunk)) throw new Error("Invalid asset chunk name");
    status_text.textContent = "Downloading " + filename + " (part " + (i + 1) + "/" + chunkNames.length + ")...";
    const response = await fetch(baseUrl + chunk);
    if (!response.ok) throw new Error("Asset chunk HTTP " + response.status + ": " + chunk);
    const bytes = new Uint8Array(await response.arrayBuffer());
    if (offset + bytes.length > totalSize) throw new Error("Asset size mismatch");
    array.set(bytes, offset);
    offset += bytes.length;
  }
  if (offset !== totalSize) throw new Error("Incomplete asset download");
  return array.buffer;
}

async function extract_tar(url, fs_path, use_cache = false) {
  //download tar file from server and decompress
  let decompressed;
  if (!use_cache || !await check_db(url)) {
    let filename = url.split("/").pop();
    let compressed = await download_chunks(url);
    status_text.textContent = `Decompressing ${filename}...`;
    decompressed = pako.inflate(compressed);
    compressed = null;
    if (use_cache) {
      status_text.textContent = `Saving ${filename} to the cache...`;
      await write_db_chunks(url, decompressed);
    }
  }
  else {
    decompressed = await read_db_chunks(url);
  }

  //read the tar file and add to emscripten's fs
  let files = await jsUntar(decompressed.buffer);
  for (let file of files) {
    let relative_path = file.name.substring(1);
    let out_path = fs_path + relative_path;
    if (out_path.endsWith("/")) {
      try {
        FS.mkdir(out_path);
      }
      catch {}
    }
    else {
      let array = new Uint8Array(file.buffer);
      FS.writeFile(out_path, array);
      file.buffer = null;
    }
  }
}

async function load_data() {
  //check if we need to update the assets bundle
  if (!await check_db("/version") || !(await read_db("/version") == data_version)) {
    await delete_db();
    await write_db("/version", data_version);
  }

  let quality = quality_select.value;
  let data_url = `./game/data_${quality}.tar.gz`;
  await extract_tar(data_url, "/data", true);
}

async function load_idbfs() {
  idbfs_mount = FS.mount(IDBFS, {}, "/home").mount;
  await sync_idbfs(true);
}

function sync_idbfs(populate = false) {
  if (syncing_fs) return;
  syncing_fs = true;
  return new Promise((resolve, reject) => {
    idbfs_mount.type.syncfs(idbfs_mount, populate, (err) => {
      syncing_fs = false;
      if (err) reject(err);
      else resolve();
    });
  })
}

function wait_for_frame() {
  return new Promise((resolve) => {requestAnimationFrame(resolve)});
}

function set_websocket_url(url) {
  if (typeof Module.websocket === "undefined") 
    Module.websocket = {};
  if (typeof SOCKFS.websocketArgs !== "undefined") 
    SOCKFS.websocketArgs.url = url;
  Module.websocket.url = url;
}

async function load_config() {
  let response = await fetch("./config.json");
  config = await response.json();
  globalThis.config = config;
}

async function main() {
  globalThis.ready = true;
  await load_config();
  await load_idbfs();
  if (config.ws_enabled) {
    set_websocket_url(config.ws_proxy);
  }

  start_button.onclick = start_game;
  start_button.disabled = false;
  status_text.innerText = "";
}

async function start_game() {
  start_button.disabled = true;
  try {
    status_text.textContent = "Loading game files...";
    await load_data();
    await wait_for_frame();
    status_text.textContent = "Launching game...";
    await wait_for_frame();
    run();
    info_container.style.zIndex = 0;
    info_container.style.display = "none";
    sync_idbfs();
    console.warn("Warning: Opening devtools may harm the game's performance.");
  } catch (error) {
    console.error("SuperTuxKart failed to start", error);
    status_text.textContent = "Game failed to load: " + (error?.message || "unknown error") + ". Check storage space and reload.";
    start_button.disabled = false;
  }
}

Module["canvas"] = document.getElementById("canvas")
globalThis.main = main;
globalThis.sync_idbfs = sync_idbfs;
globalThis.load_idbfs = load_idbfs;

let poll_runtime_interval = setInterval(() => {
  if (globalThis.ready) {
    clearInterval(poll_runtime_interval);
    main().catch(error => {
      console.error("SuperTuxKart initialization failed", error);
      status_text.textContent = "Initialization failed. Browser storage or WASM runtime may be unavailable.";
    });
  }
}, 100);