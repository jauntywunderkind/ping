#!/usr/bin/env node
"use module"
import DNS from "dns"
import net from "net"
import ChildProcess from "child_process"
import AsyncLift from "processification/async-lift.js"

const Dns= DNS.promise

const aliases= {
	ipv4: 4,
	ipv6: 6,
	broadcast: "b",
	bound: "B",
	count: "c",
	flow: "F",
	interval: "i",
	interface: "I",
	preload: "l",
	suppressLoopback: "L",
	mark: "m",
	pmtu: "M",
	numeric: "n",
	pad: "p",
	qos: "Q",
	bypassRouting: "r",
	packetSize: "s",
	sndbuf: "S",
	ttl: "t",
	deadline: "w",
	timeout: "W"
}

export const ping= AsyncLift( async function ping( res, rej, self, dest, opts= {}){
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
	// ping options
	self.timeout= Number.parseInt( opts.timeout|| 8000)
	self.count= Number.parseInt( opts.count|| 1)
	self.numeric= opts.numeric!== undefined? opts.numeric: true

	const args=[ ...(opts.args|| [])]
	for( const longOpt of aliases){
		const
			shortOpt= aliases[ longOpt],
			val= opts[ shortOpt]|| opts[ longOpt]
		if( val){
			args.push( `-${shortOpt}`,...( val!== true&&[ val]))
		}
	}

	// ping
	self.ping= ChildProcess.spawn( self.bin, args.join( " "))

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
