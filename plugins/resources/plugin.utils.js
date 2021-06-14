/**
 * A collection of utilities for common tasks plugins will need in the course
 * of composing a workflow using the solidity-coverage API
 */

const PluginUI = require("./truffle.ui");

const path = require("path");
const fs = require("fs-extra");
const shell = require("shelljs");
const util = require("util");

// ===
// UI
// ===

/**
 * Displays a list of skipped contracts
 * @param  {TruffleConfig}  config
 * @return {Object[]}       skipped array of objects generated by `assembleTargets` method
 */
function reportSkipped(config, skipped = []) {
  let started = false;
  const ui = new PluginUI(config.logger.log);

  for (let item of skipped) {
    if (!started) {
      ui.report("instr-skip", []);
      started = true;
    }
    ui.report("instr-skipped", [item.relativePath]);
  }
}

// ========
// File I/O
// ========

/**
 * Loads source
 * @param  {String} _path absolute path
 * @return {String}       source file
 */
function loadSource(_path) {
  return fs.readFileSync(_path).toString();
}

/**
 * Save a set of instrumented files to a temporary directory.
 * @param  {Object[]} targets   array of targets generated by `assembleTargets`
 * @param  {[type]} originalDir absolute path to original contracts directory
 * @param  {[type]} tempDir     absolute path to temp contracts directory
 */
function save(targets, originalDir, tempDir) {
  let _path;
  for (target of targets) {
    _path = path.normalize(target.canonicalPath).replace(originalDir, tempDir);

    fs.outputFileSync(_path, target.source);
  }
}

/**
 * Relativizes an absolute file path, given an absolute parent path
 * @param  {String} pathToFile
 * @param  {String} pathToParent
 * @return {String}              relative path
 */
function toRelativePath(pathToFile, pathToParent) {
  return pathToFile.replace(`${pathToParent}${path.sep}`, "");
}


// =============================
// Instrumentation Set Assembly
// =============================

function assembleFiles(config, skipFiles = []) {
  const targetsPath = path.join(config.contractsDir, "**", "*.sol");
  const targets = shell.ls(targetsPath).map(path.normalize);

  skipFiles = assembleSkipped(config, targets, skipFiles);

  return assembleTargets(config, targets, skipFiles);
}

function assembleTargets(config, targets = [], skipFiles = []) {
  const skipped = [];
  const filtered = [];
  const cd = config.contractsDir;

  for (let target of targets) {
    if (skipFiles.includes(target)) {
      skipped.push({
        canonicalPath: target,
        relativePath: toRelativePath(target, cd),
        source: loadSource(target),
      });
    } else {
      filtered.push({
        canonicalPath: target,
        relativePath: toRelativePath(target, cd),
        source: loadSource(target),
      });
    }
  }

  return {
    skipped: skipped,
    targets: filtered,
  };
}

/**
 * Parses the skipFiles option (which also accepts folders)
 */
function assembleSkipped(config, targets, skipFiles = []) {
  // Make paths absolute
  skipFiles = skipFiles.map((contract) =>
    path.join(config.contractsDir, contract)
  );

  // Enumerate files in skipped folders
  const skipFolders = skipFiles.filter((item) => path.extname(item) !== ".sol");

  for (let folder of skipFolders) {
    for (let target of targets) {
      if (target.indexOf(folder) === 0) skipFiles.push(target);
    }
  }

  return skipFiles;
}

// ==========================
// Finishing / Cleanup
// ==========================


module.exports = {
  assembleFiles: assembleFiles,
  assembleSkipped: assembleSkipped,
  assembleTargets: assembleTargets,
  loadSource: loadSource,
  reportSkipped: reportSkipped,
  save: save,
  toRelativePath: toRelativePath,
};
