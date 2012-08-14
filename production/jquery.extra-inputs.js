(function($){
	if( typeof $ == 'undefined'){ return false; }
	$.fn.caret = function( options ){
		if (/iPad|iPhone/.test(navigator.platform)) {
			return this;
		};

		var defaults = {};

		var methods = {
			"pos": function(){
				var args = Array.prototype.slice.call(arguments);

				if( args.length > 0 ){
					// Set caret position
					this.focus();
					if( this.createTextRange ){		// Internet Explorer support
						var range = this.createTextRange();
						range.move('character', args[0]);
						range.select();
					}else if( this.setSelectionRange ){		// Other browsers
						this.setSelectionRange( args[0], args[0] );
					};
					return $(this);
				}else{
					// Get caret position
					if( document.selection ){	// Internet Explorer support
						this.focus();
						var range = document.selection.createRange();
						range.moveStart('character', -this.value.length);
						return range.text.length;
					}else if( this.selectionStart || this.selectionStart == '0' ){ // Other browsers
						return this.selectionStart;
					};
					return 0;
				};
				return this;
			}
		};
	
		if( typeof options == 'string' ){
			var args = Array.prototype.slice.call(arguments);
			if( methods[options] ){
				args.splice(0, 1);
				if( this.length && this.length > 1 ){ // If selected more than one element, return array with results
					var result = [];
					this.each(function(){
						result.push( methods[options].apply(this, args) );
					});
					return result;
				}
				return methods[options].apply(this[0], args);
			};
			return this;
		};
		
		return this;
	};
})(jQuery);/*
	jQuery.caret plugin from this package required
*/

(function($){
	$.fn.group = function( options ){
		if (/iPad|iPhone/.test(navigator.platform)) {
			return this;
		};

		var defaults = {};

		var methods = {
			"keyup": function(e){
				var key = e.keyCode,
					length = $(this).val().length,
					maxlength = $(this).attr('maxlength') - 0,
					next = $(this).data('group').next,
					previous = $(this).data('group').previous,
					position = $(this).caret('pos');

				if( key == 37 && position == 0 && previous ){ // Left arrow -> Focus to previous input
					previous.caret('pos', previous.val().length);
				}else if( key == 39 && position == length && next ){ // Right arrow -> Focus to next input
					next.caret('pos', 0);
				}else if( position == maxlength && next ){
					next.caret('pos', next.val().length);
				}else if( key == 8 && position == 0 && previous ){
					previous.caret('pos', previous.val().length);
				};
				return true;
			},
			"getValue": function(){
				var value = [], length = [];
				for( var i = 0, l = inputs.length; i < l; i++ ){
					var input = $(inputs[i]);
					value.push(input.val());
					length.push(input.attr('maxlength') - 0);
				};
				return {value: value, len: length};
			},
			"setValue": function(value){
				for( var i = 0, l = inputs.length; i < l; i++ ){
					var input = $(inputs[i]);
					input.val( value[i] );
				}
				return true;
			},
			"paste": function( clipboardData, index, pos ){
				var data = clipboardData.split(''),
					value = methods.getValue(),
					caret = [0, 0];

				for( var i = index, l = value.value.length; i < l; i++ ){
					var val = value.value[i],
						s = ( i == index ? pos : 0),
						ending = val.substr(s);
					caret = [i, 0];
					data = data.concat( ending.split('') );
					value.value[i] = value.value[i].replace( ending, '' );
					for( var j = value.len[i] - s; j--; ){
						value.value[i] += data.splice(0, 1).join('');
						if( data.length > 0)
							caret[1]++;
					}
				}

				methods.setValue(value.value);

				$(inputs[caret[0]]).caret('pos', caret[1] - 1);

				return true;
			}
		};

		var inputs = this;
		for( var i = 0, l = inputs.length; i < l; i++ ){
			var input = $(inputs[i]);
			input.data('group', {
				index: i,
				name: input.attr('data-group'), 
				next: ( i+1 == l ? null : $(inputs[i+1])),
				previous: ( i-1 >= 0 ? $(inputs[i-1]) : null)
			});
		};

		this
			.bind('keyup keypress', methods.keyup)
			.bind('group-afterpaste', function(e){
				var tmp = $('#group-clipboard-data');
				var clipboardData = tmp.val();
				tmp.remove();
				methods.paste( clipboardData, $(this).data('group').index, $(this).caret('pos') );
				this.focus();
			})
			.bind('paste', function(e){
				var tmp = $('<input type="text" id="group-clipboard-data"/>').css({ position: 'absolute', left: '-9999999px' }),
					self = $(this);
				$(document.body).append(tmp);
				tmp[0].focus();
				setTimeout(function(){ self.trigger('group-afterpaste'); }, 0)
			});	

		return this;
	}
})(jQuery);(function($){
	$.fn.mask = function( options ){
		var definitions = {
			"#": /[0-9]/,
			"$": /[a-zA-Zа-яА-Я]/
		}
		var defaults = {
			"placeholder": "_", // Placeholder
			"mask": "+7 (###) ###-##-##" // Phone mask by default
		};

		var methods = {
			"parseMask": function(mask){
				mask = mask.split('');
				for( var i = mask.length; i--; ){
					if( mask[i] in definitions ){
						mask[i] = definitions[mask[i]];
					};
				};
				return mask;
			},
			"keypress": function(charCode, pos, mask){
				var value = $(this).val().split(''),
					s = String.fromCharCode(charCode);
				if( pos >= mask.length )
					return false;
				if( 
					typeof mask[pos] != 'undefined' && 
					typeof mask[pos] != 'string' && 
					mask[pos].test(s) 
				){
					value[pos] = s;
					$(this).val(value.join('')).caret('pos', pos + 1);
				}else{
					methods.keypress.call(this, charCode, pos + 1, mask);
				};
			},
			"move": function( direction, mask, pos ){ // Move caret left to first editable place
				if( pos >= 0 && pos < mask.length ){
					if( 
						typeof mask[pos+direction] != 'undefined' && 
						typeof mask[pos+direction] != 'string' 
					){
						return pos;
					}else{
						return methods.move( direction, mask, pos + direction );
					};
				};
				return pos;
			},
			"getClearValue": function( mask, value, placeholder ){
				var clear = [];
				for( var i = 0, l = mask.length; i<l; i++ ){
					if( typeof mask[i] == 'object' ){
						if( value[i] != placeholder ){
							clear.push(value[i]);
						}/*else{
							clear.push(0);
						}*/
					};
				};
				return clear;
			},
			"fill": function( mask, value, placeholder ){
				var newValue = [], ni = 0;
				for( var i = 0, l = mask.length; i<l; i++ ){
					if( typeof mask[i] == 'object' ){
						if( typeof value[ni] != 'undefined' ){
							var p = true;
							while( p ){
								if( mask[i].test(value[ni]) ){
									newValue.push( value[ni] );
									p = false;
								}else{
									if( ni <= mask.length ){
										ni++;
									}else{
										p = false;
									}
								};
							};
						}else{
							newValue.push( placeholder );
						};
						ni++;
					}else{
						newValue.push( mask[i] );
					};
				};
				return newValue.join('');
			}
		};

		if( typeof options == 'string' && typeof methods[options] == 'function'){
			return methods[options].apply(this, Array.prototype.splice.call(arguments, 1, arguments.length));
		};

		return this.each(function(){
			var attrData = {
				"placeholder": $(this).attr('data-mask-placeholder'),
				"mask": $(this).attr('data-mask')
			}
			var opts = $.extend(defaults, options); // Override defaults by options object
			opts = $.extend(opts, attrData); // Override options object by node attributes
			var mask = methods.parseMask( opts.mask );

			// Fill default value like mask
			var value = '', curValue = $(this).val();
			if( curValue == methods.fill( mask, methods.getClearValue( mask, curValue, opts.placeholder ), opts.placeholder ) ){
				value = curValue;
			}else if(curValue.length > 0){
				value = methods.fill( mask, curValue, opts.placeholder );
			}else{
				for( var i = 0, l = mask.length; i < l; i++ ){
					value += typeof mask[i] == 'string' ? mask[i] : opts.placeholder;
				}
			};
			$(this).attr('maxlength', value.length).val(value);

			$(this)
			.bind('keypress', function(e){
				
				if( e.keyCode == 0 ){
					e.keyCode = e.charCode;
				}
				if( 
					e.keyCode >= 48 && e.keyCode <= 57  || // Digits
					e.keyCode >= 96 && e.keyCode <= 105 || // Numpad
					e.keyCode >= 65 && e.keyCode <= 90  || // Latin
					e.keyCode >= 186 && e.keyCode <= 222   // Others
				){
					var pos = $(this).caret('pos');
					methods.keypress.call(this, e.charCode, pos, mask);
				};
				//return false;
			})
			.bind('keydown', function(e){
				var value = $(this).val().split(''),
					pos = $(this).caret('pos');

				if( e.keyCode == 39 ){ // Arrow right
					$(this).caret('pos', methods.move(1, mask, pos));
				}else if( e.keyCode == 37 ){ // Arrow left
					$(this).caret('pos', methods.move(-1, mask, pos));
				}else if( e.keyCode == 8 ){ // Backspace
					var newPos = methods.move(-1, mask, pos)-1;
					if( typeof mask[newPos] == 'object' ){
						if( value[newPos] != opts.placeholder ){
							value[newPos] = opts.placeholder;
							$(this).val(value.join(''));
						}
						$(this).caret('pos', newPos);
					};
					return false;
				}else if( e.keyCode == 46 ){ // Del
					if( typeof[] )
					value[pos] = opts.placeholder;
					$(this).val( methods.fill(mask, methods.getClearValue(mask, value, opts.placeholder), opts.placeholder) ).caret('pos', pos);
					return false;
				};
				return true;
			}).bind('mask-afterpaste afterpaste', function(e){
				var tmp = $('#mask-clipboard-data'),
					clipboardData = tmp.val().split(''),
					pos = $(this).caret('pos');
				tmp.remove();
				for( var i = 0, l = clipboardData.length; i<l; i++ ){
					methods.keypress.call(this, clipboardData[i].charCodeAt(0), pos, mask);
					pos = $(this).caret('pos');
				};
				//methods.fill( mask, clipboardData, opts.placeholder );
				this.focus();
			}).bind('paste beforepaste', function(e){
				var paste = e.clipboardData && e.clipboardData.getData ?
					        e.clipboardData.getData('text/plain') :                // Standard
					        window.clipboardData && window.clipboardData.getData ?
					        window.clipboardData.getData('Text') :                 // MS
					        false;

				var tmp = $('<input type="text" id="mask-clipboard-data"/>').css({ position: 'absolute', left: '-999999px' }),
					self = $(this);
				$(document.body).append(tmp);
				tmp.focus();
				setTimeout(function(){ self.trigger('mask-afterpaste'); }, 0);
				return true;
			});	
		});
	};
})(jQuery);