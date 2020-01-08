#!/usr/bin/env node
"use module"
import Split from "async-iter-split"
import ChildProcess from "child_process"
import DNS from "dns"
import { on} from "events"
import net from "net"
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

	const
		stdout= on( self.ping.stdout, "data"),
		stderr= on( self.ping.stderr, "data"),
		lines= Split( stdout),
		header= lines.next(),
		ping= lines.next()

	self.ping.on( "exit", function( code){
		rej()
	})

	const
		text= await ping,
		d= self.regex.match( text),
		digit= d&& Number.parseFloat( d[ 0])
	return digit
})
export default ping
