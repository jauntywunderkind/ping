#!/usr/bin/env node
"use module"
import DNS from "dns"
import net from "net"
import ChildProcess from "child_process"
import AsyncLift from "processification/async-lift.js"

const Dns= DNS.promise

export const ping= AsyncLift( async function ping( res, rej, self, ip, opts){
	const process_= opts.process|| process
	self.timeStart= process_.hrtime.bigint()

	// munge arguments
	if( typeof ip!== "string"&& !opts){
		opts= ip
		self.ip= opts.ip
	}else{
		self.ip= ip
	}
	if( !self.ip){
		throw new Error( "No ip or host to ping found")
	}

	// read in options
	self.bin= opts.bin|| "/bin/ping"
	self.regex= opts.regex|| /[><=]([0-9.]+?) ms/
	self.timeout= Number.parseInt( opts.timeout|| 8000)
	self.count= Number.parseInt( opts.count|| 1)

	// ping
	const args=[ "-n", "-t", self.timeout, "-c", self.count]
	self.ping= ChildProcess.spawn( self.bin, args)

	self.ping.on( "error", rej)
	const data= []
	self.ping.stdout.on( "data", function( datum){ data.push( datum) })
	self.ping.stdout.on( "end", function(){
		
	})
	self.ping.on( "exit", function( code){
	})
})
export default ping

// SEND A PING
// ===========
Ping.prototype.send = function(callback) {
	var self = this;
	callback = callback || function(err, ms) {
		if (err) return self.emit('error', err);
		else		 return self.emit('result', ms);
	};

	var _ended, _exited, _errored;

	this._ping = spawn(this._bin, this._args); // spawn the binary

	this._ping.on('error', function(err) { // handle binary errors
		_errored = true;
		callback(err);
	});

	this._ping.stdout.on('data', function(data) { // log stdout
		this._stdout = (this._stdout || '') + data;
	});

	this._ping.stdout.on('end', function() {
		_ended = true;
		if (_exited && !_errored) onEnd.call(self._ping);
	});

	this._ping.stderr.on('data', function(data) { // log stderr
		this._stderr = (this._stderr || '') + data;
	});

	this._ping.on('exit', function(code) { // handle complete
		_exited = true;
		if (_ended && !_errored) onEnd.call(self._ping);
	});

	function onEnd() {
		var stdout = this.stdout._stdout,
				stderr = this.stderr._stderr,
				ms;

		if (stderr)
			return callback(new Error(stderr));
		else if (!stdout)
			return callback(new Error('No stdout detected'));

		ms = stdout.match(self._regmatch); // parse out the ##ms response
		ms = (ms && ms[1]) ? Number(ms[1]) : ms;

		callback(null, ms);
	}
};
