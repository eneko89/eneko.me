/*!
 * Copyright © 2020 Eneko Sanz <contact@eneko.me>
 * File distributed under the MIT license.
 */

var gulp = require('gulp'),
    childProcess = require('child_process'),
    dotenv = require('dotenv');

// Gulp tasks.
gulp.task('default', run);

/**
 * Set the environmental variables in the .env file and
 * run the server application with node.
 *
 * @param {Function} cb Called on task completion. It
 *                      makes this task asynchronous.
 */
function run(cb) {
  dotenv.config();
  var proc = childProcess.exec('node .', cb);
  proc.stdout.on('data', function (d) { process.stdout.write(d); });
  proc.stderr.on('data', function (d) { process.stderr.write(d); });
}
