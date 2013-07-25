/**
* @name             Simple Timer
* @descripton       Adds a timer to an element with an assigned interval and
*                   callback function.
*
* @version          0.1.0
* @requires         Jquery 1.4+
*
* @author           Ben Gullotti
* @author-email     ben@bengullotti.com
*
* @license          MIT License -
*                   http://www.opensource.org/licenses/mit-license.php
**/

(function($) {

	/**
	 * Starts a timeout that lasts for the plugin's increment value.
	 *
	 * @method _time
	 * @param {Object} The DOM element the plugin was initialized on
	 * @param {Object} The settings the plugin was initialized with
	 * @private
	 **/
	function _time( el, settings ) {
		// set timeout
		settings.timeout = setTimeout( function() {
			_count(el, settings);
		}, settings.increment);
	}

	/**
	 * Counts the increments until the plugin's duration is reached.
	 *
	 * @method _count
	 * @param {Object} The DOM element the plugin was initialized on
	 * @param {Object} The settings the plugin was initialized with
	 * @private
	 **/
	function _count( el, settings ) {
		// increase count
		settings.count += settings.increment;
		// set percent to the nearest 1000th
		settings.percent = Math.round(settings.count /
			settings.duration * 1000) / 1000;
		// on increment event
		if( settings.onIncrement ) {
			settings.onIncrement.apply(el, settings);
		}
		// check complete
		if( settings.count >= settings.duration ) {
			// set percent to 100%
			settings.percent = 1;
			// on complete event
			if( settings.onComplete ) {
				settings.onComplete.apply(el, settings);
			}
			// stop timer
			methods.stop.apply($(el));

			return true;
		}
		// timeout
		_time(el, settings);
	}

	// filters applied before method calls

	var filters = {

		/**
		 * A filter applied before all methods are called. The filter ensures
		 * that all of the jQuery objects selected were initialized.
		 *
		 * @method all
		 * @param {Object} method The method about to be filtered
		 * @return {Object} The jQuery object from which the method was called
		 **/
		all : function( method ) {
			// filter out the uninitialized
			var filtered = this.filter(function() {
				if( $(this).data('SimpleTimer.settings') === undefined ) {
					$.error('Simple Timer Error: method "' + method + '" was ' +
						'called on an element which has not been initialized.');

					return false;
				}

				return true;
			});

			// check filtered before proceeding
			if( filtered.length === 0 ) {
				return false;
			}

			// call method
			if( filters[method] ) {
				// filtered method
				filters[method].apply( filtered,
					Array.prototype.slice.call( arguments, 1 )
				);
			}else {
				// unfiltered method
				methods[method].apply( filtered,
					Array.prototype.slice.call( arguments, 1 )
				);
			}

			// return the jQuery object to keep the method chainable
			return this;
		},

		/**
		 * A filter applied before the start method is called. The filter
		 * checks to see if any of the elements' timers are already timing.
		 *
		 * @method start
		 * @return {Boolean} Returns true if some of the selected jQuery objects
		 * passed the filter, false if none of the objects passed
		 **/
		start : function() {
			var filtered = this.filter(function() {
				var settings = $(this).data('SimpleTimer.settings');
				// checks if the timer has already been started
				if ( settings.isTiming ) {
					return false;
				}
				// checks if the timer has completed
				if ( settings.percent === 1 ) {
					return false;
				}

				return true;
			});

			// check filtered before proceeding
			if( filtered.length === 0 ) {
				return false;
			}

			// call start
			methods.start.call(filtered);

			return true;
		},

		/**
		 * A filter applied before the stop method is called. The filter
		 * checks to see if any of the elements' timers are already timing.
		 *
		 * @method stop
		 * @return {Boolean} Returns true if some of the selected jQuery objects
		 * passed the filter, false if none of the objects passed
		 **/
		stop : function() {
			var filtered = this.filter(function() {
				var settings = $(this).data('SimpleTimer.settings');
				// checks if the timer has already been stopped
				if ( !settings.isTiming ) {
					return false;
				}

				return true;
			});

			// check filtered before proceeding
			if( filtered.length === 0 ) {
				return false;
			}

			// call stop
			methods.stop.call(filtered);

			return true;
		},
	},

	// publicly accessible methods $('div').simpleSlides('methodName')

	methods = {

		/**
		 * The initialization method. Used to set the properties of the timer
		 * and attach the data to the selected jQuery objects.
		 *
		 * @method init
		 * @param {Object} options An object used to set publicly accessible
		 * options such as the timer's increment, duration, and callbacks (see
		 * README.md for details)
		 * @return {Object} The jQuery object's from which the method was called
		 **/
		init : function( options ) {

			/*
			* Create some defaults. Extend them with any options that were
			* provided.
			*/
			var settings = $.extend( true, {
				increment       :   1000,
				duration        :   5000,
				// callbacks
				onComplete      :   false,
				onIncrement     :   false,
				onStart         :   false,
				onStop          :   false,
				onReset         :   false,
			}, options,
			//private settings
			{
				timeout         :   null,
				count           :   0,
				percent         :   0,
				isTiming        :   false,
				isCounting      :   false,
			});

			return this.each(function(){
				// save data
				$(this).data('SimpleTimer.settings', settings);
			});
		},

		/**
		 * Destroys the timer by deleting the settings attached to the DOM
		 * element.
		 *
		 * @method destroy
		 * @return {Object} The jQuery object's from which the method was called
		 **/
		destroy : function() {
			// apply to each element
			return this.each( function() {
				// reset plugin
				methods.reset.apply($(this));
				// remove previously stored data
				$(this).removeData('SimpleTimer.settings');
			});
		},

		/**
		 * Starts the timer.
		 *
		 * @method start
		 * @return {Object} The jQuery object's from which the method was called
		 **/
		start : function() {
			// apply to each element
			return this.each( function() {
				// retrieve settings
				var settings = $(this).data('SimpleTimer.settings');
				// set isTiming
				settings.isTiming = true;
				// on start event
				if ( settings.onStart ) {
					settings.onStart.apply(this, settings);
				}
				// start timing
				_time(this, settings);
			});
		},

		/**
		 * Stops the timer.
		 *
		 * @method stop
		 * @return {Object} The jQuery object's from which the method was called
		 **/
		stop : function() {
			// apply to each element
			return this.each( function() {
				// retrieve settings
				var settings = $(this).data('SimpleTimer.settings');
				// clear timeout
				clearTimeout(settings.timeout);
				// stop timing
				settings.isTiming = false;
				// on stop event
				if ( settings.onStop ) {
					settings.onStop.apply(this, settings);
				}
			});
		},

		/**
		 * Resets the timer. The timer's count is reset to 0.
		 *
		 * @method reset
		 * @return {Object} The jQuery object's from which the method was called
		 **/
		reset : function() {
			// apply to each element
			return this.each( function() {
				// retrieve settings
				var settings = $(this).data('SimpleTimer.settings');
				// stop the timer
				$(this).simpleTimer('stop');
				// reset the count
				settings.count = 0;
				// reset the percent
				settings.percent = 0;
				// on reset event
				if ( settings.onReset ) {
					settings.onReset.apply(this, settings);
				}
			});
		},

	};

	// jQuery plugin

	$.fn.simpleTimer = function( method ) {
		//call the methods from the methods variable
		if ( methods[method] ) {
			return filters.all.apply( this, arguments );
		} else if ( typeof method === 'object' || ! method ) {
			return methods.init.apply( this, arguments );
		} else {
			$.error( 'Simple Timer Error: method ' +  method +
				' does not exist.' );
		}
	};

})(jQuery);
