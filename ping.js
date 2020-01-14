#!/usr/bin/env node
"use module"
import AsyncIterMap from "async-iter-map"
import Split from "async-iter-split"
import ChildProcess from "child_process"
import DictInvert from "dict-invert"

export const
	BadSample= Symbol.for( "async-iter-ping:err:bad-sample"),
	NetworkUnreachable= Symbol.for( "async-iter-ping:err:unreachable:network"),
	HostUnreachable= Symbol.for( "async-iter-ping:err:unreachable:host"),
	symbol= {
		BadSample,
		Unreachable: {
			Host: HostUnreachable,
			Network: NetworkUnreachable
		}
	}
export {
	symbol as Symbol
}

export function Ping( dest, opt){
	if( opt=== undefined&& typeof dest!== "string"){
		opt= dest
		dest= opt.dest
	}
	if( !dest){
		throw new Error( "No destination to ping found")
	}
	this.dest= dest
	AsyncIterMap.call( this, opt)
	Object.assign( this, opt)
	return this
}
export {
	Ping as default,
	Ping as ping
}
Ping.prototype= Object.create( AsyncIterMap.prototype, {
	// default base arguments
	_bin: {
		value: "/bin/ping",
		writable: true
	},
	_regex: {
		value: /[><=]([0-9.]+?) ms/,
		writable: true
	},
	// default ping arguments
	interval: {
		value: 2,
		writable: true
	},
	numeric: {
		value: true,
		writable: true
	},

	// methods
	args: {
		value: args
	},
	map: { // extracts data out of ping input
		value: map
	},
	once: {
		value: once
	},
	start: {
		value: start
	},
	stop: {
		value: stop
	},

	[ Symbol.asyncIterator]: {
		value: function(){
			this.start()
			return this
		}
	}
})
Ping.prototype.constructor= Ping

// static property

const
	alias= {
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
	},
	errorSymbol= {
		"Destination Host Unreachable": symbol.HostUnreachable,
		"Network is unreachable": symbol.NetworkUnreachable
	}
Object.defineProperties( Ping, {
	alias: {
		value: alias
	},
	short: {
		value: DictInvert( alias)
	},
	symbol: {
		value: symbol
	},
	errorSymbol: {
		value: errorSymbol
	}
})

// prototype methods

function args( onto= []){
	for( const [ longOpt, shortOpt] of Object.entries( Ping.alias)){
		const val= this[ shortOpt]|| this[ longOpt]
		if( val=== true){
			onto.push( `-${shortOpt}`)
		}else if( val){
			onto.push( `-${shortOpt}`, val)
		}
	}
	onto.push( this.dest)
	return onto
}

function map( line){
	if( !line){
		throw new Error("Expected output")
	}
	const d= this._regex.exec( line)
	if( !d){
		for( const text of Ping.errorSymbol){
			if( line.indexOf( text)!== -1){
				return Ping.errorSymbol[ text]
			}
		}
		return BadSample
	}
	return Number.parseFloat( d[ 1])
}

function start(){
	if( this.ping){
		return false
	}
	// count time!
	this.timeStart= (this.process|| process.hrtime).bigint()

	const args= this.args()
	// start the ping program
	this.ping= ChildProcess.spawn( this._bin, args)

	// send stderror to stdout
	this.ping.stderr.setEncoding( this.encoding|| "utf8")
	// TODO: this does not work
	// perhaps some day https://github.com/libuv/libuv/pull/2598
	this.ping.stderr.pipe( this.ping.stdout)
	// start splitting it into lines which will be input
	this.input= Split( this.ping.stdout)
	// drop first line, the header
	this.input.next()
}

function stop(){
	if( this.ping){
		this.ping.kill()
	}
	this.input= null
	this.ping= null
}

function once(){
}

export async function main(){
	const
		dest= process.argv[ 2]|| "127.0.0.1",
		ping= new Ping( dest)
	for await( let ms of ping){
		console.log( ms)
	}
}
if( typeof process!== "undefined"&& `file://${ process.argv[ 1]}`=== import.meta.url){
	main()
}
