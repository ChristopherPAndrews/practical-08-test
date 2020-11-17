
/*
  Borrowed from the Next repo.
https://github.com/vercel/next.js/blob/2e8068fcbea427bf50dd464c5565e676e4685ff0/test/lib/next-test-utils.js

*/
import path from "path";
import spawn from "cross-spawn";

import http from "http";
import server from "next/dist/server/next";
import fetch from "node-fetch";

export const nextServer = server;

export function runNextCommand(argv, options = {}) {
  const nextDir = path.dirname(require.resolve("next/package"));
  const nextBin = path.join(nextDir, "dist/bin/next");
  const cwd = options.cwd || nextDir;
  // Let Next.js decide the environment
  const env = {
    ...process.env,
    ...options.env,
    __NEXT_TEST_MODE: "true",
  };

  return new Promise((resolve, reject) => {
    console.log(`Running command "next ${argv.join(" ")}"`);

    const instance = spawn("node", ["--no-deprecation", nextBin, ...argv], {
      ...options.spawnOptions,
      cwd,
      env,
      stdio: ["ignore", "pipe", "pipe"],
    });

    if (typeof options.instance === "function") {
      options.instance(instance);
    }

    let stderrOutput = "";
    if (options.stderr) {
      instance.stderr.on("data", function (chunk) {
        stderrOutput += chunk;
      });
    }

    let stdoutOutput = "";
    if (options.stdout) {
      instance.stdout.on("data", function (chunk) {
        stdoutOutput += chunk;
      });
    }

    instance.on("close", (code) => {
      if (
        !options.stderr &&
        !options.stdout &&
        !options.ignoreFail &&
        code !== 0
      ) {
        return reject(new Error(`command failed with code ${code}`));
      }

      resolve({
        code,
        stdout: stdoutOutput,
        stderr: stderrOutput,
      });
    });

    instance.on("error", (err) => {
      err.stdout = stdoutOutput;
      err.stderr = stderrOutput;
      reject(err);
    });
  });
}

export function nextBuild(dir, args = [], opts = {}) {
  return runNextCommand(["build", dir, ...args], opts);
}

export async function startApp(app) {
  await app.prepare();
  const handler = app.getRequestHandler();
  const server = http.createServer(handler);
  server.__app = app;

  await promiseCall(server, "listen");
  return server;
}

export async function stopApp(server) {
  if (server.__app) {
    await server.__app.close();
  }
  await promiseCall(server, "close");
}

export function promiseCall(obj, method, ...args) {
  return new Promise((resolve, reject) => {
    const newArgs = [
      ...args,
      function (err, res) {
        if (err) return reject(err);
        resolve(res);
      },
    ];

    obj[method](...newArgs);
  });
}

export function fetchViaHTTP(appPort, pathname, query, opts) {
  const url = `http://localhost:${appPort}${pathname}${
    query ? `?${qs.stringify(query)}` : ""
  }`;

  return fetch(url, opts);
}
