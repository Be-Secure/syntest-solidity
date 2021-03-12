const chalk = require("chalk");
const emoji = require("node-emoji");

/**
 * Coverage tool output formatters. These classes support any the logging solidity-coverage API
 * (or plugins which consume it) do on their own behalf. NB, most output is generated by the host
 * dev stack (ex: the truffle compile command, or istanbul).
 */
class UI {
  constructor(log) {
    this.log = log || console.log;
    this.chalk = chalk;
  }

  /**
   * Writes a formatted message
   * @param  {String}   kind  message selector
   * @param  {String[]} args  info to inject into template
   */
  report(kind, args = []) {}

  /**
   * Returns a formatted message. Useful for error messages.
   * @param  {String}   kind  message selector
   * @param  {String[]} args  info to inject into template
   * @return {String}         message
   */
  generate(kind, args = []) {}

  _write(msg) {
    this.log(this._format(msg));
  }

  _format(msg) {
    return emoji.emojify(msg);
  }
}

module.exports = UI;