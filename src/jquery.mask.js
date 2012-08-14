(function($){
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