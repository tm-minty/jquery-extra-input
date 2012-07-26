(function($){
	if( typeof $ == 'undefined'){ return false; }
	$.fn.caret = function( options ){
		var defaults = {};

		var methods = {
			"pos": function(){
				var focus = function(element){
					if (/iPad|iPhone/.test(navigator.platform)) {
				        element.click();
				    }else{
				    	element.focus();
				    }
				    return element;
				};

				var args = Array.prototype.slice.call(arguments);

				if( args.length > 0 ){
					// Set caret position
					focus(this);
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
						focus(this);
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
})(jQuery);