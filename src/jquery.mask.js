(function($){
	$.fn.mask = function( options ){
		var definitions = {
			"#": /[0-9]/,
			"$": /[a-zA-Zа-яА-Я]/
		}
		var defaults = {
			"placeholder": " ", // Placeholder
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
			"move": function( direction, mask, pos){ // Move caret left to first editable place
				if( pos >= 0 && pos < mask.length )
					if( 
						typeof mask[pos] != 'undefined' && 
						typeof mask[pos] != 'string' 
					){
						return pos;
					}else{
						console.log('continue', pos, mask[pos], pos + 1*direction);
						return methods.move( direction, mask, pos + 1*direction );
					}
			}
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
			var value = '';
			for( var i = 0, l = mask.length; i < l; i++ ){
				value += typeof mask[i] == 'string' ? mask[i] : opts.placeholder;
			}
			$(this).attr('maxlength', value.length).val(value);

			$(this)
			.bind('keypress', function(e){
				if( 
					e.keyCode >= 48 && e.keyCode <= 57  || // Digits
					e.keyCode >= 96 && e.keyCode <= 105 || // Numpad
					e.keyCode >= 65 && e.keyCode <= 90  || // Latin
					e.keyCode >= 186 && e.keyCode <= 222   // Others
				){
					var pos = $(this).caret('pos');
					methods.keypress.call(this, e.charCode, pos, mask);
				};
				return false;
			})
			.bind('keydown', function(e){
				var value = $(this).val().split(''),
					pos = $(this).caret('pos');

				if( e.keyCode == 39 ){ // Arrow right
					if( 
						typeof mask[pos] != 'undefined' && 
						typeof mask[pos] != 'string' 
					){
						$(this).caret('pos', methods.move(1, mask, pos));
					}else{
						$(this).caret('pos', methods.move(1, mask, pos)-1);
					}
				}else if( e.keyCode == 37 ){ // Arrow left
					$(this).caret('pos', methods.move(-1, mask, pos));
				}else if( e.keyCode == 8 ){ // Backspace

				}else if( e.keyCode == 46 ){ // Del

				};
				return true;
			});
		});
	};
})(jQuery);