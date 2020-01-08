#!/usr/bin/env node
"use module"
import Pipe from "async-iter-pipe"
import Split from "async-iter-split"
import ChildProcess from "child_process"

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

export function Ping( dest, opts){
	if( opts=== undefined&& typeof dest!== "string"){
		opts= dest
		dest= opts.dest
	}
	if( !dest){
		throw new Error( "No destination to ping found")
	}
	this.dest= dest
	Pipe.call( this, opts)
	Object.assign( this, opts)

	if( !this.noStart)
		this.start()
	}
	return this
}
export {
	Ping as default,
	Ping as ping
}
Ping.prototype= Object.create( Pipe.prototype)
Ping.prototype.constructor= Ping

// default base options
Ping.prototype.bin= "/bin/ping"
Ping.prototype.regex= /[><=]([0-9.]+?) ms/
// default ping arguments
Ping.prototype.interval= 5
Ping.prototype.numeric= true

Ping.prototype.args= function( onto= []){
	for( const [ longOpt, shortOpt] of Object.entries( aliases)){
		const val= this[ shortOpt]|| this[ longOpt]
		if( val=== true){
			onto.push( `-${shortOpt}`)
		}else if( val){
			onto.push( `-${shortOpt}`, val)
		}
	}
	onto.push( self.dest)
	return onto
}

Ping.prototype.start= function(){
	if( this.timeStart){
		return false
	}
	this.timeStart= process_.hrtime.bigint()

	// ping!
	this.ping= ChildProcess.spawn( self.bin, args)
	this.ping.on( "exit", function( code){
		// TODO
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


export async function main(){
	const
		dest= process.argv[ 2]|| "127.0.0.1",
		ms= await ping( dest)
	console.log( ms)
}
if( typeof process!== "undefined"&& `file://${ process.argv[ 1]}`=== import.meta.url){
	main()
}
