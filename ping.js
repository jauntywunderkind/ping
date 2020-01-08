#!/usr/bin/env node
"use module"
import Split from "async-iter-split"
import ChildProcess from "child_process"
import DNS from "dns"
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
	if( typeof dest!== "string"&& !opts){
		opts= dest
		self.dest= opts.dest
	}else{
		self.dest= dest
	}
	if( !self.dest){
		throw new Error( "No destination to ping found")
	}

	// read in base options
	self.bin= opts.bin|| "/bin/ping"
	self.regex= opts.regex|| /[><=]([0-9.]+?) ms/
	// default ping options
	self.timeout= Number.parseInt( opts.timeout|| 8000)
	self.count= Number.parseInt( opts.count|| 1)
	self.numeric= opts.numeric!== undefined? opts.numeric: true
	// pull in remaining ping options
	const args=[ ...(opts.args|| [])]
	for( const [ longOpt, shortOpt] of Object.entries( aliases)){
		const val= opts[ shortOpt]|| opts[ longOpt]|| self[ longOpt]
		if( val){
			// add arg
			args.push( `-${shortOpt}`,...( val!== true?[ val]: []))
			// write value to self
			self[ longOpt]= val
		}
	}
	args.push( self.dest)

	// ping!
	self.ping= ChildProcess.spawn( self.bin, args)
	self.ping.on( "exit", function( code){
		// we should get stdout & resolve before this
		rej()
	})

	// parse
	const
		// split ping lines
		lines= Split( self.ping.stdout),
		// ignore header
		header= lines.next(),
		// next line please!
		ping= lines.next(),
		// get that text
		text= await ping,
		// find the digits
		d= self.regex.exec( text.value),
		// convert to number
		digit= d&& Number.parseFloat( d[ 1])
	if( !digit){
		throw new Error( "unexpected reply")
	}
	res( digit)
	return digit
})
export default ping

export async function main(){
	const
		dest= process.argv[ 2]|| "127.0.0.1",
		ms= await ping( dest)
	console.log( ms)
}
if( typeof process!== "undefined"&& `file://${ process.argv[ 1]}`=== import.meta.url){
	main()
}
