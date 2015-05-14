/**
 * jQuery input-autosize Plugin
 *
 * This is an extended version of this plugin from http://stackoverflow.com/a/931695/2474379
 */

(function (factory) {
  if (typeof define === 'function' && define.amd) {
    // AMD support
    define(['jquery.input-autoresize'], factory);
  } else if (typeof exports !== 'undefined') {
    // CommonJS support
    var jQuery = require('jquery');
    module.exports = factory(jQuery);
  } else {
    // Non-modular execution
    factory(window.jQuery);
  }
}) (function($){

    var AUTORESIZE_DATA_KEY = 'jquery.input-autoresize';
    var AUTORESIZE_EVENT_SUFFIX = '.input-autoresize';

    var observedEvents = [
        'keyup'     + AUTORESIZE_EVENT_SUFFIX,
        'keydown'   + AUTORESIZE_EVENT_SUFFIX,
        'blur'      + AUTORESIZE_EVENT_SUFFIX,
        'update'    + AUTORESIZE_EVENT_SUFFIX
    ];

    var defaultOptions = {
        maxWidth: 1000,
        minWidth: 30,
        comfortZone: 70
    };

    var Autoresize = function (options, element) {

        this.$el = $(element);

        this.init = function () {
            this.options = $.extend(defaultOptions, options);

            this.$testSubject = $('<span />').css({
                position: 'absolute',
                top: -9999,
                left: -9999,
                width: 'auto',
                fontSize: this.$el.css('fontSize'),
                fontFamily: this.$el.css('fontFamily'),
                fontWeight: this.$el.css('fontWeight'),
                fontStyle: this.$el.css('fontStyle'),
                letterSpacing: this.$el.css('letterSpacing'),
                wordSpacing: this.$el.css('wordSpacing'),
                textIndent: this.$el.css('textIndent'),
                whiteSpace: 'nowrap'
            });
            this.$testSubject.insertAfter(this.$el);

            this.$el.on(observedEvents.join(' '), this.update.bind(this));

            this.update();

            return this;
        };

        this.update = function () {
            if (this.val === (this.val = this.$el.val())) return;

            var escaped = this.val
                .replace(/&/g, '&amp;')
                .replace(/\s/g,'&nbsp;')
                .replace(/</g, '&lt;')
                .replace(/>/g, '&gt;');

            this.$testSubject.html(escaped);

            // Calculate new width + whether to change
            var minWidth = this.options.minWidth || this.$el.width(),
                testerWidth = this.$testSubject.width(),
                newWidth = (testerWidth + this.options.comfortZone) >= minWidth
                    ? testerWidth + this.options.comfortZone 
                    : minWidth,
                currentWidth = this.$el.width(),
                isValidWidthChange = (newWidth < currentWidth && newWidth >= minWidth)
                                     || (newWidth > minWidth && newWidth < this.options.maxWidth);

            // Animate width
            if (isValidWidthChange) {
                this.$el.width(newWidth);
            }

            return this;
        };

        this.destroy = function () {
            this.$el.off(observedEvents.join(' '));
            this.$testSubject.remove();

            this.$el = null;
            this.$testSubject = null;
        };

        return this;
    };


    $.fn.inputAutoresize = function(options) {

        this.each(function () {
            var $this = $(this),
                autoresize = $this.data(AUTORESIZE_DATA_KEY);

            if (typeof options == 'string') {

                switch (options) {
                    case 'update':
                        autoresize.update();
                        break;

                    case 'destroy':
                        autoresize.destroy();
                        autoresize = null;

                        $this.removeData(AUTORESIZE_DATA_KEY);
                        break;
                }
            }
            else {
                if (autoresize == null) {
                    autoresize = (new Autoresize(options, this)).init();

                    $this.data(AUTORESIZE_DATA_KEY, autoresize);
                }
                else {
                    autoresize.update();
                }
            }

        });

        return this;

    };

});