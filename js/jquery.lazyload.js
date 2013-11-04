/**
 * @filename  jquery.lazyload.js
 * @desc      lazyload image & module
 * @author    longzhou (buji)
 * @blog      http://vicbeta.com
 * @email     pancnlz@gmail.com
 * @create    2013-11-04
 * @update    2013-11-04
 * @version   1.0.0
 * @reference http://blog.csdn.net/huli870715/article/details/8126519
 */
(function($) {
    var App = {};

    App.lazyload = (function($) {
        // 默认配置
        var config = {
            mod: 'auto',    // 分为auto、manul
            IMG_SRC_DATA: 'img-lazyload',
            AREA_DATA_CLS: 'area-lazyload'
        };

        var IMG_SRC_DATA = '',
            AREA_DATA_CLS = '';

        // 用来存放需要懒加载的图片和模块
        var imgArr = [],
            areaArr = [];

        // 支持用户回调的事件类型
        var eventType = 'lazyload';

        /**
         * 获取目标节点距离页面顶部高度
         * @param {HTML Element} el
         * @private
         */
        var _getTargetY = function(el) {
            var tp = el.offsetTop;
            if (el.offsetParent) {
                while (el = el.offsetParent) {
                    tp += el.offsetTop;
                }
            }
            return tp;
        };

        /** 
         * @desc 处理需要懒加载的图片 
         * @private 
         */    
        var _filterImgs = function() {
            if (config.mod === 'auto') {
                // 自动模式  
                var $imgs = $('img');
                $imgs.each(function() {
                    var $this = $(this),
                        dataSrc = $this.attr(IMG_SRC_DATA);
                    
                    imgArr.push(this);
                    
                    // 先计算出每个图片距离页面顶部的高度，避免在事件事件处理函数中进行大量重复计算
                    $this.targetY = _getTargetY($this[0]);

                    // 对于已存在IMG_SRC_DATA的，可能其它实例处理过，我们直接跳过去
                    if (!dataSrc) {
                        $this.attr(IMG_SRC_DATA, $this.attr('src'));
                        $this.removeAttr('src');
                    }
                });
            } else {
                // 手动模式下，已经在需要懒加载的IMG中设置了IMG_SRC_DATA属性，所以不作任何处理
                var $imgs = $('img').filter('[' + IMG_SRC_DATA + ']');
                $imgs.each(function() {
                    var $this = $(this);

                    imgArr.push(this);

                    // 先计算出每个图片距离页面顶部的高度，避免在事件事件处理函数中进行大量重复计算
                    $this.targetY = _getTargetY($this[0]);
                });
            }
        };

        /**
         * @desc 处理需要懒加载的模块
         * @private
         */
        var _filterAreas = function() {
            var $areas = $('textarea').find('.' + AREA_DATA_CLS);
            $areas.each(function() {
                var $this = $(this);

                areaArr.push(this);

                $this.targetY = _getTargetY($this[0]);
            });
        };

        /**
         * @desc 处理需要懒加载的图片和模块入口
         * @private
         */
        var _filterItems = function() {
            _filterImgs();
            _filterAreas();
        };

        /**
         * @desc 检查需要懒加载的节点是否进入可视区域
         * @param {jQuery Object} el
         * @private
         */
        var _checkBounding = function($el) {
            // 页面滚动条高度
            var scrollY = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset || 0;
            // 浏览器可视区域高度
            var seeY = window.innerHeight || document.documentElement.clientHeight;
        
            if ($el.targetY) {
                var targetY = $el.targetY;
            } else {
                var targetY = _getTargetY($el[0]);
            }

            // 当目标节点进入可使区域
            if (Math.abs(targetY - scrollY) < seeY) {
                return true;
            } else {
                return false;
            }
        };

        /**
         * @desc window节点的scroll和resize的事件处理函数
         * @private
         */
        var _eventHandler = function() {
            // 全部加载完时，解绑事件
            if (imgArr.length <= 0 && areaArr.length <= 0) {
                $(window).off('scroll:lazyload');
                $(window).off('resize:lazyload');
            }

            $.each(imgArr, function(i, el) {
                if (el !== undefined) {
                    var $img = $(el);
                    if (_checkBounding($img)) {
                        $img.attr('src', $img.attr(IMG_SRC_DATA));
                        $img.trigger(eventType);
                        $img.unbind(eventType);

                        imgArr.splice(i, 1);
                    }
                }
            });

            $.each(areaArr,function(i, el) {
                if (el !== undefined) {
                    var $area = $(el);
                    if (_checkBounding($area)) {
                        $area.hide();
                        $area.removeClass(AREA_DATA_CLS);
                        var $div = $('<div>').html($area.val());
                        $div.insertBefore($area);

                        areaArr.splice(i, 1);
                    }
                }
            });
        };

        /**
         * @desc 事件绑定
         * @private
         */
        var _initEvent = function() {
            $(window).on('scroll:lazyload', _eventHandler);
            $(window).on('resize:lazyload', _eventHandler);
            _eventHandler();
        };

        /** 
         * @desc 特定元素即将出现时的回调函数
         * @param {Function} func
         * @param {jQuery Obj} $el
         * @private
         */
        var _addCallback = function(func, $el) {
            if (func == null) {
                return;
            }
            
            if ($el == null) {
                $.each(imgArr, function(i, el) {
                    $(el).bind(eventType, function(event) {
                        func.call($el, event);
                    });
                });
            } else {
                $el.bind(eventType, function(event) {
                    func.call($el, event);
                });
            }
        };

        /** 
         * @desc 初始化自定义配置
         * @param {object} settings
         * @private
         */
        var _initialize = function(settings) {
            if (!(settings == null)) {
                config = $.extend(config, settings);
            }

            IMG_SRC_DATA = config.IMG_SRC_DATA;
            AREA_DATA_CLS = config.AREA_DATA_CLS;

            _filterItems();
            _initEvent();
        };

        return {
            init: function() {
                _initialize(this.arguments);   
            },
            addCallback: function() {
                _addCallback(this.arguments);
            }
        };
    } ($));

    /**
     * @desc 启用lazyload对外方法
     * @param {object} settings
     *      var settings = {
     *          mod: 'auto',                    // 分为auto、manul
     *          IMG_SRC_DATA: 'img-lazyload',   // img data属性
     *          AREA_DATA_CLS: 'area-lazyload'  // textarea class属性
     *      };
     * @param {jQuery obj} $filter 待绑定回调事件的dom集合 可选参数，存在回调函数的情况下，为空将为所有满足条件的img元素绑定回调事件
     * @param {function} callback 特定元素即将出现时的回调函数
     */
    $.lazyload = function() {
        var i, len,
            paramAry = Array.prototype.slice.call(arguments),
            paramObj = {};

        for (i = 0, len = paramAry.length; i < len; i++) {
            if (typeof paramAry[i] === 'function' && !paramObj['callback']) {
                paramObj['callback'] = paramAry[i];
                continue;
            }

            if (paramAry[i].length > 0 && !paramObj['$filter']) {
                paramObj['$filter'] = paramAry[i];
                continue;
            }

            if (typeof paramAry[i] === 'object' && !paramObj['settings']) {
                paramObj['settings'] = paramAry[i];
                continue;
            }
        }

        App.lazyload.init(paramObj['settings']);
        App.lazyload.addCallback(paramObj['callback'], paramObj['$filter']);
    };
}(jQuery));