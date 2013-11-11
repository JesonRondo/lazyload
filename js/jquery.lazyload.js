/**
 * @filename  jquery.lazyload.js
 * @desc      lazyload image & module
 * @author    longzhou (buji)
 * @blog      http://vicbeta.com
 * @email     pancnlz@gmail.com
 * @create    2013-11-04
 * @update    2013-11-08
 * @version   1.0.0
 * @reference http://blog.csdn.net/huli870715/article/details/8126519
 */
(function($, document, window, undefined) {
    $.fn.lazyload = function(callback) {
        // Lazyload class
        function Lazyload($els, callback) {
            // 唯一标示
            this.stamp = +new Date + Math.random() >>> 0;

            // 设置
            this.settings = {
                IMG_DATA_SRC: 'data-src'
            };

            // 用来存放需要懒加载的图片和模块        
            this.imgArr = [];
            this.areaArr = [];

            // lazyload 的元素
            this.$els = $els;

            // 图片或 dom 加载完成的回调函数
            this.callback = callback && typeof callback === 'function' ? callback : null;

            // init
            this._filterItems();
        };

        /**
         * 获取目标节点距离页面顶部高度
         * @param {HTML Element} el
         */
        Lazyload.prototype._getTargetY = function(el) {
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
         */
        Lazyload.prototype._filterImgs = function() {
            var $imgs,
                IMG_DATA_SRC,
                callback = this.callback,
                hasCallback = callback ? true : false;

            IMG_DATA_SRC = this.settings.IMG_DATA_SRC;
            $imgs = this.$els.filter('img').filter('[' + IMG_DATA_SRC + ']');

            $imgs.each($.proxy(function(i, el) {
                var $this = $(el),
                    data_src = $this.attr(IMG_DATA_SRC);

                if (!data_src) {
                    return;
                }

                $this.css('opacity', 0);

                el.onload = function() {
                    $(this).animate({
                        'opacity': 1
                    }, 300, function() {
                        if (hasCallback) {
                            callback();
                        }
                    });
                };
                this.imgArr.push(el);

                // 先计算出每个图片距离页面顶部的高度，避免在事件事件处理函数中进行大量重复计算
                $this.targetY = this._getTargetY($this[0]);
            }, this));
        };

        /**
         * @desc 处理需要懒加载的模块
         */
        Lazyload.prototype._filterAreas = function() {
            var $areas = this.$els.filter('textarea');

            $areas.each($.proxy(function(i, el) {
                var $this = $(el);
                this.areaArr.push(el);

                $this.targetY = this._getTargetY($this[0]);
            }, this));
        };

        /**
         * @desc 处理需要懒加载的图片和模块入口
         */
        Lazyload.prototype._filterItems = function() {
            this._filterImgs();
            this._filterAreas();
        };

        /**
         * @desc 检查需要懒加载的节点是否进入可视区域
         * @param {jQuery Object} el
         */
        Lazyload.prototype._checkBounding = function($el) {
            var scrollY, seeY, targetY;

            // 页面滚动条高度
            scrollY = document.body.scrollTop || document.documentElement.scrollTop || window.pageYOffset || 0;
            // 浏览器可视区域高度
            seeY = window.innerHeight || document.documentElement.clientHeight;

            if ($el.targetY) {
                targetY = $el.targetY;
            } else {
                targetY = this._getTargetY($el[0]);
            }

            // 当目标节点进入可使区域
            if (Math.abs(targetY - scrollY) < seeY) {
                return true;
            } else {
                return false;
            }
        };

        (function($this, callback, $, window) {
            var lz = new Lazyload($this, callback);

            $(window)
                .on('scroll.lz' + lz.stamp + ' resize.lz' + lz.stamp, function() {
                    var i, len, el;

                    // 全部加载完时，解绑事件
                    if (lz.imgArr.length <= 0 && lz.areaArr.length <= 0) {
                        $(window).off('scroll.lz' + lz.stamp);
                        $(window).off('resize.lz' + lz.stamp);
                    }

                    for (i = 0, len = lz.imgArr.length; i < len;) {
                        el = lz.imgArr[i];

                        if (el) {
                            var $img = $(el);
                            if (lz._checkBounding($img)) {
                                $img.attr('src', $img.attr(lz.settings.IMG_DATA_SRC))
                                    .attr(lz.settings.IMG_DATA_SRC, '');
                                lz.imgArr.splice(i, 1);
                                len--;
                            } else {
                                i++;
                            }
                        }
                    }

                    for (i = 0, len = lz.areaArr.length; i < len;) {
                        el = lz.areaArr[i];

                        if (el) {
                            var $area = $(el);
                            if (lz._checkBounding($area)) {
                                $area.hide();
                                var $div = $('<div>').html($area.val());
                                $div.insertBefore($area);
                                $area.remove();

                                lz.areaArr.splice(i, 1);
                                len--;
                            } else {
                                i++;
                            }
                        }
                    }
                })
                .trigger('scroll.lazyload' + lz.stamp);
        }($(this), callback, $, window));

        return this;
    };
}(jQuery, document, window));
