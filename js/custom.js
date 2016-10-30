
/*
 *
 * TERMS OF USE - EASING EQUATIONS
 *
 * Open source under the BSD License.
 *
 * Copyright Â© 2001 Robert Penner
 * All rights reserved.
 *
 * Redistribution and use in source and binary forms, with or without modification,
 * are permitted provided that the following conditions are met:
 *
 * Redistributions of source code must retain the above copyright notice, this list of
 * conditions and the following disclaimer.
 * Redistributions in binary form must reproduce the above copyright notice, this list
 * of conditions and the following disclaimer in the documentation and/or other materials
 * provided with the distribution.
 *
 * Neither the name of the author nor the names of contributors may be used to endorse
 * or promote products derived from this software without specific prior written permission.
 *
 * THIS SOFTWARE IS PROVIDED BY THE COPYRIGHT HOLDERS AND CONTRIBUTORS "AS IS" AND ANY
 * EXPRESS OR IMPLIED WARRANTIES, INCLUDING, BUT NOT LIMITED TO, THE IMPLIED WARRANTIES OF
 * MERCHANTABILITY AND FITNESS FOR A PARTICULAR PURPOSE ARE DISCLAIMED. IN NO EVENT SHALL THE
 *  COPYRIGHT OWNER OR CONTRIBUTORS BE LIABLE FOR ANY DIRECT, INDIRECT, INCIDENTAL, SPECIAL,
 *  EXEMPLARY, OR CONSEQUENTIAL DAMAGES (INCLUDING, BUT NOT LIMITED TO, PROCUREMENT OF SUBSTITUTE
 *  GOODS OR SERVICES; LOSS OF USE, DATA, OR PROFITS; OR BUSINESS INTERRUPTION) HOWEVER CAUSED
 * AND ON ANY THEORY OF LIABILITY, WHETHER IN CONTRACT, STRICT LIABILITY, OR TORT (INCLUDING
 *  NEGLIGENCE OR OTHERWISE) ARISING IN ANY WAY OUT OF THE USE OF THIS SOFTWARE, EVEN IF ADVISED
 * OF THE POSSIBILITY OF SUCH DAMAGE.
 *
 */
// http://paulirish.com/2011/requestanimationframe-for-smart-animating/
// http://my.opera.com/emoller/blog/2011/12/20/requestanimationframe-for-smart-er-animating

// requestAnimationFrame polyfill by Erik MÃ¶ller. fixes from Paul Irish and Tino Zijdel

// MIT license

(function() {
		var lastTime = 0;
		var vendors = ['ms', 'moz', 'webkit', 'o'];
		for(var x = 0; x < vendors.length && !window.requestAnimationFrame; ++x) {
				window.requestAnimationFrame = window[vendors[x]+'RequestAnimationFrame'];
				window.cancelAnimationFrame = window[vendors[x]+'CancelAnimationFrame'] || window[vendors[x]+'CancelRequestAnimationFrame'];
		}

		if (!window.requestAnimationFrame)
				window.requestAnimationFrame = function(callback, element) {
						var currTime = new Date().getTime();
						var timeToCall = Math.max(0, 16 - (currTime - lastTime));
						var id = window.setTimeout(function() { callback(currTime + timeToCall); },
								timeToCall);
						lastTime = currTime + timeToCall;
						return id;
				};

		if (!window.cancelAnimationFrame)
				window.cancelAnimationFrame = function(id) {
						clearTimeout(id);
				};
});

$( function($) {

		var width, height, canvas, ctx, points, target, animateHeader = true;

		// Main
		initHeader();
		initAnimation();
		addListeners();

		function initHeader() {
				width = window.innerWidth;
				height = window.innerHeight;
				target = {
						x: width / 2,
						y: height / 3
				};

				canvas = document.getElementById( 'spiders' );
				canvas.width = width;
				canvas.height = height-4;
				ctx = canvas.getContext( '2d' );

				// create points
				points = [];
				for ( var x = 0; x < width; x = x + width / 20 ) {
						for ( var y = 0; y < height; y = y + height / 20 ) {
								var px = x + Math.random() * width / 20;
								var py = y + Math.random() * height / 20;
								var p = {
										x: px,
										originX: px,
										y: py,
										originY: py
								};
								points.push( p );
						}
				}

				// for each point find the 5 closest points
				for ( var i = 0; i < points.length; i++ ) {
						var closest = [];
						var p1 = points[ i ];
						for ( var j = 0; j < points.length; j++ ) {
								var p2 = points[ j ]
								if ( !( p1 == p2 ) ) {
										var placed = false;
										for ( var k = 0; k < 5; k++ ) {
												if ( !placed ) {
														if ( closest[ k ] == undefined ) {
																closest[ k ] = p2;
																placed = true;
														}
												}
										}

										for ( var k = 0; k < 5; k++ ) {
												if ( !placed ) {
														if ( getDistance( p1, p2 ) < getDistance( p1, closest[ k ] ) ) {
																closest[ k ] = p2;
																placed = true;
														}
												}
										}
								}
						}
						p1.closest = closest;
				}

				// assign a circle to each point
				for ( var i in points ) {
						var c = new Circle( points[ i ], 2 + Math.random() * 2, 'rgba(255,255,255,0.3)' );
						points[ i ].circle = c;
				}
		}

		// Event handling
		function addListeners() {
				if ( !( 'ontouchstart' in window ) ) {
						window.addEventListener( 'mousemove', mouseMove );
				}
				window.addEventListener( 'scroll', scrollCheck );
				$(window).resize(resize);
		}

		function mouseMove( e ) {
				var posx = posy = 0;
				if ( e.pageX || e.pageY ) {
						posx = e.pageX;
						posy = e.pageY;
				} else if ( e.clientX || e.clientY ) {
						posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
						posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
				}
				target.x = posx;
				target.y = posy;
		}

		function scrollCheck() {
				if ( document.body.scrollTop > height ) animateHeader = false;
				else animateHeader = true;
		}

		function resize() {
			width = window.innerWidth;
			height = window.innerHeight;
			canvas.width = width;
			canvas.height = height - 4;
			// Find a way to use the draw function and  use it here. The animation one too if necessary
		}

		// animation
		function initAnimation() {
				animate();
				for ( var i in points ) {
						shiftPoint( points[ i ] );
				}
		}

		function animate() {
				if ( animateHeader ) {
						ctx.clearRect( 0, 0, width, height );
						for ( var i in points ) {
								// detect points in range
								if ( Math.abs( getDistance( target, points[ i ] ) ) < 2000 ) {
										points[ i ].active = 0.2;
										points[ i ].circle.active = 0.5;
								} else if ( Math.abs( getDistance( target, points[ i ] ) ) < 20000 ) {
										points[ i ].active = 0.1;
										points[ i ].circle.active = 0.3;
								} else if ( Math.abs( getDistance( target, points[ i ] ) ) < 70000 ) {
										points[ i ].active = 0.02;
										points[ i ].circle.active = 0.09;
								} else if ( Math.abs( getDistance( target, points[ i ] ) ) < 140000 ) {
										points[ i ].active = 0;
										points[ i ].circle.active = 0.02;
								} else {
										points[ i ].active = 0;
										points[ i ].circle.active = 0;
								}

								drawLines( points[ i ] );
								points[ i ].circle.draw();
						}
				}
				requestAnimationFrame( animate );
		}

		function shiftPoint( p ) {
				TweenLite.to( p, 1 + 1 * Math.random(), {
						x: p.originX - 50 + Math.random() * 100,
						y: p.originY - 50 + Math.random() * 100,
						onComplete: function() {
								shiftPoint( p );
						}
				} );
		}

		// Canvas manipulation
		function drawLines( p ) {
				if ( !p.active ) return;
				for ( var i in p.closest ) {
						ctx.beginPath();
						ctx.moveTo( p.x, p.y );
						ctx.lineTo( p.closest[ i ].x, p.closest[ i ].y );
						ctx.strokeStyle = 'rgba(255,255,255,' + p.active + ')';
						ctx.stroke();
				}
		}

		function Circle( pos, rad, color ) {
				var _this = this;

				// constructor
				( function() {
						_this.pos = pos || null;
						_this.radius = rad || null;
						_this.color = color || null
				} )();

				this.draw = function() {
						if ( !_this.active ) return;
						ctx.beginPath();
						ctx.arc( _this.pos.x, _this.pos.y, _this.radius, 0, 2 * Math.PI, false );
						ctx.fillStyle = 'rgba(255,255,255,' + _this.active + ')';
						ctx.fill();
				};
		}

		// Util
		function getDistance( p1, p2 ) {
				return Math.pow( p1.x - p2.x, 2 ) + Math.pow( p1.y - p2.y, 2 );
		}
}(jQuery));
