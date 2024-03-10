var exec = require('child_process').execSync;
var platform = require('os').platform();

const findExec = (function () {
  function isExec(command) {
    try {
      exec(command, { stdio: 'ignore' });
      return true;
    } catch (_e) {
      return false;
    }
  }

  function findCommand(command) {
    if (/^win/.test(platform)) {
      return 'where ' + command;
    } else {
      return 'command -v ' + command;
    }
  }

  return function () {
    var commands = Array.isArray(arguments[0])
      ? arguments[0]
      : Array.prototype.slice.apply(arguments);
    var command = null;

    commands.some(function (c) {
      if (isExec(findCommand(c))) {
        command = c;
        return true;
      }
    });

    return command;
  };
})();

var spawn = require('child_process').spawn,
  players = [
    'mplayer',
    'afplay',
    'mpg123',
    'mpg321',
    'play',
    'omxplayer',
    'aplay',
    'cmdmp3',
    'cvlc',
    'powershell',
  ];

function Play() {
  opts = {};

  this.players = players;
  this.player = findExec(this.players);
  // Regex by @stephenhay from https://mathiasbynens.be/demo/url-regex

  this.play = function (what, options, next) {
    next = next || function () {};
    next = typeof options === 'function' ? options : next;
    options = typeof options === 'object' ? options : {};
    options.stdio = 'ignore';

    if (!this.player) {
      return next(new Error("Couldn't find a suitable audio player"));
    }

    var args = Array.isArray(options[this.player])
      ? options[this.player].concat(what)
      : [what];
    var process = spawn(this.player, args, options);
    if (!process) {
      next(new Error('Unable to spawn process with ' + this.player));
      return null;
    }
    process.on('close', function (err) {
      next(err && !err.killed ? err : null);
    });
    return process;
  };
}

module.exports = function () {
  const player = new Play();
  player.play('alert.wav', function (err) {
    if (err) throw err;
  });
};
