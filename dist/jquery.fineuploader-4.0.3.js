/*!
* Fine Uploader
*
* Copyright 2013, Widen Enterprises, Inc. info@fineuploader.com
*
* Version: 4.0.3
*
* Homepage: http://fineuploader.com
*
* Repository: git://github.com/Widen/fine-uploader.git
*
* Licensed under GNU GPL v3, see LICENSE
*/ 


/*globals window, navigator, document, FormData, File, HTMLInputElement, XMLHttpRequest, Blob, Storage*/
var qq = function(element) {
    "use strict";

    return {
        hide: function() {
            element.style.display = 'none';
            return this;
        },

        /** Returns the function which detaches attached event */
        attach: function(type, fn) {
            if (element.addEventListener){
                element.addEventListener(type, fn, false);
            } else if (element.attachEvent){
                element.attachEvent('on' + type, fn);
            }
            return function() {
                qq(element).detach(type, fn);
            };
        },

        detach: function(type, fn) {
            if (element.removeEventListener){
                element.removeEventListener(type, fn, false);
            } else if (element.attachEvent){
                element.detachEvent('on' + type, fn);
            }
            return this;
        },

        contains: function(descendant) {
            // The [W3C spec](http://www.w3.org/TR/domcore/#dom-node-contains)
            // says a `null` (or ostensibly `undefined`) parameter
            // passed into `Node.contains` should result in a false return value.
            // IE7 throws an exception if the parameter is `undefined` though.
            if (!descendant) {
                return false;
            }

            // compareposition returns false in this case
            if (element === descendant) {
                return true;
            }

            if (element.contains){
                return element.contains(descendant);
            } else {
                /*jslint bitwise: true*/
                return !!(descendant.compareDocumentPosition(element) & 8);
            }
        },

        /**
         * Insert this element before elementB.
         */
        insertBefore: function(elementB) {
            elementB.parentNode.insertBefore(element, elementB);
            return this;
        },

        remove: function() {
            element.parentNode.removeChild(element);
            return this;
        },

        /**
         * Sets styles for an element.
         * Fixes opacity in IE6-8.
         */
        css: function(styles) {
            if (styles.opacity != null){
                if (typeof element.style.opacity !== 'string' && typeof(element.filters) !== 'undefined'){
                    styles.filter = 'alpha(opacity=' + Math.round(100 * styles.opacity) + ')';
                }
            }
            qq.extend(element.style, styles);

            return this;
        },

        hasClass: function(name) {
            var re = new RegExp('(^| )' + name + '( |$)');
            return re.test(element.className);
        },

        addClass: function(name) {
            if (!qq(element).hasClass(name)){
                element.className += ' ' + name;
            }
            return this;
        },

        removeClass: function(name) {
            var re = new RegExp('(^| )' + name + '( |$)');
            element.className = element.className.replace(re, ' ').replace(/^\s+|\s+$/g, "");
            return this;
        },

        getByClass: function(className) {
            var candidates,
                result = [];

            if (element.querySelectorAll){
                return element.querySelectorAll('.' + className);
            }

            candidates = element.getElementsByTagName("*");

            qq.each(candidates, function(idx, val) {
                if (qq(val).hasClass(className)){
                    result.push(val);
                }
            });
            return result;
        },

        children: function() {
            var children = [],
                child = element.firstChild;

            while (child){
                if (child.nodeType === 1){
                    children.push(child);
                }
                child = child.nextSibling;
            }

            return children;
        },

        setText: function(text) {
            element.innerText = text;
            element.textContent = text;
            return this;
        },

        clearText: function() {
            return qq(element).setText("");
        },

        // Returns true if the attribute exists on the element
        // AND the value of the attribute is NOT "false" (case-insensitive)
        hasAttribute: function(attrName) {
            var attrVal;

            if (element.hasAttribute) {

                if (!element.hasAttribute(attrName)) {
                    return false;
                }

                return /^false$/i.exec(element.getAttribute(attrName)) == null;
            }
            else {
                attrVal = element[attrName];

                if (attrVal === undefined) {
                    return false;
                }

                return /^false$/i.exec(attrVal) == null;
            }
        }
    };
};

qq.log = function(message, level) {
    "use strict";

    if (window.console) {
        if (!level || level === 'info') {
            window.console.log(message);
        }
        else
        {
            if (window.console[level]) {
                window.console[level](message);
            }
            else {
                window.console.log('<' + level + '> ' + message);
            }
        }
    }
};

qq.isObject = function(variable) {
    "use strict";
    return variable && !variable.nodeType && Object.prototype.toString.call(variable) === '[object Object]';
};

qq.isFunction = function(variable) {
    "use strict";
    return typeof(variable) === "function";
};

/**
 * Check the type of a value.  Is it an "array"?
 *
 * @param value value to test.
 * @returns true if the value is an array or associated with an `ArrayBuffer`
 */
qq.isArray = function(value) {
    "use strict";
    return Object.prototype.toString.call(value) === "[object Array]"
        || (window.ArrayBuffer && value.buffer && value.buffer.constructor === ArrayBuffer);
};

// Looks for an object on a `DataTransfer` object that is associated with drop events when utilizing the Filesystem API.
qq.isItemList = function(maybeItemList) {
    "use strict";
    return Object.prototype.toString.call(maybeItemList) === "[object DataTransferItemList]";
};

// Looks for an object on a `NodeList` or an `HTMLCollection`|`HTMLFormElement`|`HTMLSelectElement`
// object that is associated with collections of Nodes.
qq.isNodeList = function(maybeNodeList) {
    "use strict";
    return Object.prototype.toString.call(maybeNodeList) === "[object NodeList]" ||
        // If `HTMLCollection` is the actual type of the object, we must determine this
        // by checking for expected properties/methods on the object
        (maybeNodeList.item && maybeNodeList.namedItem);
};

qq.isString = function(maybeString) {
    "use strict";
    return Object.prototype.toString.call(maybeString) === '[object String]';
};

qq.trimStr = function(string) {
    if (String.prototype.trim) {
        return string.trim();
    }

    return string.replace(/^\s+|\s+$/g,'');
};


/**
 * @param str String to format.
 * @returns {string} A string, swapping argument values with the associated occurrence of {} in the passed string.
 */
qq.format = function(str) {
    "use strict";

    var args =  Array.prototype.slice.call(arguments, 1),
        newStr = str;

    qq.each(args, function(idx, val) {
        newStr = newStr.replace(/{}/, val);
    });

    return newStr;
};

qq.isFile = function(maybeFile) {
    "use strict";

    return window.File && Object.prototype.toString.call(maybeFile) === '[object File]'
};

qq.isFileList = function(maybeFileList) {
    return window.FileList && Object.prototype.toString.call(maybeFileList) === '[object FileList]'
};

qq.isFileOrInput = function(maybeFileOrInput) {
    "use strict";

    return qq.isFile(maybeFileOrInput) || qq.isInput(maybeFileOrInput);
};

qq.isInput = function(maybeInput) {
    if (window.HTMLInputElement) {
        if (Object.prototype.toString.call(maybeInput) === '[object HTMLInputElement]') {
            if (maybeInput.type && maybeInput.type.toLowerCase() === 'file') {
                return true;
            }
        }
    }
    if (maybeInput.tagName) {
        if (maybeInput.tagName.toLowerCase() === 'input') {
            if (maybeInput.type && maybeInput.type.toLowerCase() === 'file') {
                return true;
            }
        }
    }

    return false;
};

qq.isBlob = function(maybeBlob) {
    "use strict";
    return window.Blob && Object.prototype.toString.call(maybeBlob) === '[object Blob]';
};

qq.isXhrUploadSupported = function() {
    "use strict";
    var input = document.createElement('input');
    input.type = 'file';

    return (
        input.multiple !== undefined &&
            typeof File !== "undefined" &&
            typeof FormData !== "undefined" &&
            typeof (qq.createXhrInstance()).upload !== "undefined" );
};

// Fall back to ActiveX is native XHR is disabled (possible in any version of IE).
qq.createXhrInstance = function() {
    if (window.XMLHttpRequest) {
        return new XMLHttpRequest();
    }

    try {
        return new ActiveXObject("MSXML2.XMLHTTP.3.0");
    }
    catch(error) {
        qq.log("Neither XHR or ActiveX are supported!", "error");
        return null;
    }
};

qq.isFolderDropSupported = function(dataTransfer) {
    "use strict";
    return (dataTransfer.items && dataTransfer.items[0].webkitGetAsEntry);
};

qq.isFileChunkingSupported = function() {
    "use strict";
    return !qq.android() && //android's impl of Blob.slice is broken
        qq.isXhrUploadSupported() &&
        (File.prototype.slice !== undefined || File.prototype.webkitSlice !== undefined || File.prototype.mozSlice !== undefined);
};

qq.sliceBlob = function(fileOrBlob, start, end) {
    var slicer = fileOrBlob.slice || fileOrBlob.mozSlice || fileOrBlob.webkitSlice;

    return slicer.call(fileOrBlob, start, end);
};

qq.arrayBufferToHex = function(buffer) {
    var bytesAsHex = "",
        bytes = new Uint8Array(buffer);


    qq.each(bytes, function(idx, byte) {
        var byteAsHexStr = byte.toString(16);

        if (byteAsHexStr.length < 2) {
            byteAsHexStr = "0" + byteAsHexStr;
        }

        bytesAsHex += byteAsHexStr;
    });

    return bytesAsHex;
};

qq.readBlobToHex = function(blob, startOffset, length) {
    var initialBlob = qq.sliceBlob(blob, startOffset, startOffset + length),
        fileReader = new FileReader(),
        promise = new qq.Promise();

    fileReader.onload = function() {
        promise.success(qq.arrayBufferToHex(fileReader.result));
    };

    fileReader.readAsArrayBuffer(initialBlob);

    return promise;
};

qq.extend = function(first, second, extendNested) {
    "use strict";

    qq.each(second, function(prop, val) {
        if (extendNested && qq.isObject(val)) {
            if (first[prop] === undefined) {
                first[prop] = {};
            }
            qq.extend(first[prop], val, true);
        }
        else {
            first[prop] = val;
        }
    });

    return first;
};

/**
 * Allow properties in one object to override properties in another,
 * keeping track of the original values from the target object.
 *
 * Note that the pre-overriden properties to be overriden by the source will be passed into the `sourceFn` when it is invoked.
 *
 * @param target Update properties in this object from some source
 * @param sourceFn A function that, when invoked, will return properties that will replace properties with the same name in the target.
 * @returns {object} The target object
 */
qq.override = function(target, sourceFn) {
    var super_ = {},
        source = sourceFn(super_);

    qq.each(source, function(srcPropName, srcPropVal) {
        if (target[srcPropName] !== undefined) {
            super_[srcPropName] = target[srcPropName];
        }

        target[srcPropName] = srcPropVal;
    });

    return target;
};

/**
 * Searches for a given element in the array, returns -1 if it is not present.
 * @param {Number} [from] The index at which to begin the search
 */
qq.indexOf = function(arr, elt, from){
    "use strict";

    if (arr.indexOf) {
        return arr.indexOf(elt, from);
    }

    from = from || 0;
    var len = arr.length;

    if (from < 0) {
        from += len;
    }

    for (; from < len; from+=1){
        if (arr.hasOwnProperty(from) && arr[from] === elt){
            return from;
        }
    }
    return -1;
};

//this is a version 4 UUID
qq.getUniqueId = function(){
    "use strict";

    return 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function(c) {
        /*jslint eqeq: true, bitwise: true*/
        var r = Math.random()*16|0, v = c == 'x' ? r : (r&0x3|0x8);
        return v.toString(16);
    });
};

//
// Browsers and platforms detection

qq.ie       = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE') !== -1;
};
qq.ie7      = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE 7') !== -1;
};
qq.ie10     = function(){
    "use strict";
    return navigator.userAgent.indexOf('MSIE 10') !== -1;
};
qq.safari   = function(){
    "use strict";
    return navigator.vendor !== undefined && navigator.vendor.indexOf("Apple") !== -1;
};
qq.chrome   = function(){
    "use strict";
    return navigator.vendor !== undefined && navigator.vendor.indexOf('Google') !== -1;
};
qq.firefox  = function(){
    "use strict";
    return (navigator.userAgent.indexOf('Mozilla') !== -1 && navigator.vendor !== undefined && navigator.vendor === '');
};
qq.windows  = function(){
    "use strict";
    return navigator.platform === "Win32";
};
qq.android = function(){
    "use strict";
    return navigator.userAgent.toLowerCase().indexOf('android') !== -1;
};
qq.ios7 = function() {
    "use strict";
    return qq.ios() && navigator.userAgent.indexOf(" OS 7_") !== -1;
};
qq.ios = function() {
    "use strict";
    return navigator.userAgent.indexOf("iPad") !== -1
        || navigator.userAgent.indexOf("iPod") !== -1
        || navigator.userAgent.indexOf("iPhone") !== -1;
};

//
// Events

qq.preventDefault = function(e){
    "use strict";
    if (e.preventDefault){
        e.preventDefault();
    } else{
        e.returnValue = false;
    }
};

/**
 * Creates and returns element from html string
 * Uses innerHTML to create an element
 */
qq.toElement = (function(){
    "use strict";
    var div = document.createElement('div');
    return function(html){
        div.innerHTML = html;
        var element = div.firstChild;
        div.removeChild(element);
        return element;
    };
}());

//key and value are passed to callback for each entry in the iterable item
qq.each = function(iterableItem, callback) {
    "use strict";
    var keyOrIndex, retVal;

    if (iterableItem) {
        // Iterate through [`Storage`](http://www.w3.org/TR/webstorage/#the-storage-interface) items
        if (window.Storage && iterableItem.constructor === window.Storage) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(iterableItem.key(keyOrIndex), iterableItem.getItem(iterableItem.key(keyOrIndex)));
                if (retVal === false) {
                    break;
                }
            }
        }
        // `DataTransferItemList` & `NodeList` objects are array-like and should be treated as arrays
        // when iterating over items inside the object.
        else if (qq.isArray(iterableItem) || qq.isItemList(iterableItem) || qq.isNodeList(iterableItem)) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(keyOrIndex, iterableItem[keyOrIndex]);
                if (retVal === false) {
                    break;
                }
            }
        }
        else if (qq.isString(iterableItem)) {
            for (keyOrIndex = 0; keyOrIndex < iterableItem.length; keyOrIndex++) {
                retVal = callback(keyOrIndex, iterableItem.charAt(keyOrIndex));
                if (retVal === false) {
                    break;
                }
            }
        }
        else {
            for (keyOrIndex in iterableItem) {
                if (Object.prototype.hasOwnProperty.call(iterableItem, keyOrIndex)) {
                    retVal = callback(keyOrIndex, iterableItem[keyOrIndex]);
                    if (retVal === false) {
                        break;
                    }
                }
            }
        }
    }
};

//include any args that should be passed to the new function after the context arg
qq.bind = function(oldFunc, context) {
    if (qq.isFunction(oldFunc)) {
        var args =  Array.prototype.slice.call(arguments, 2);

        return function() {
            var newArgs = qq.extend([], args);
            if (arguments.length) {
                newArgs = newArgs.concat(Array.prototype.slice.call(arguments))
            }
            return oldFunc.apply(context, newArgs);
        };
    }

    throw new Error("first parameter must be a function!");
};

/**
 * obj2url() takes a json-object as argument and generates
 * a querystring. pretty much like jQuery.param()
 *
 * how to use:
 *
 *    `qq.obj2url({a:'b',c:'d'},'http://any.url/upload?otherParam=value');`
 *
 * will result in:
 *
 *    `http://any.url/upload?otherParam=value&a=b&c=d`
 *
 * @param  Object JSON-Object
 * @param  String current querystring-part
 * @return String encoded querystring
 */
qq.obj2url = function(obj, temp, prefixDone){
    "use strict";
    /*jshint laxbreak: true*/
     var uristrings = [],
         prefix = '&',
         add = function(nextObj, i){
            var nextTemp = temp
                ? (/\[\]$/.test(temp)) // prevent double-encoding
                ? temp
                : temp+'['+i+']'
                : i;
            if ((nextTemp !== 'undefined') && (i !== 'undefined')) {
                uristrings.push(
                    (typeof nextObj === 'object')
                        ? qq.obj2url(nextObj, nextTemp, true)
                        : (Object.prototype.toString.call(nextObj) === '[object Function]')
                        ? encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj())
                        : encodeURIComponent(nextTemp) + '=' + encodeURIComponent(nextObj)
                );
            }
        };

    if (!prefixDone && temp) {
        prefix = (/\?/.test(temp)) ? (/\?$/.test(temp)) ? '' : '&' : '?';
        uristrings.push(temp);
        uristrings.push(qq.obj2url(obj));
    } else if ((Object.prototype.toString.call(obj) === '[object Array]') && (typeof obj !== 'undefined') ) {
        qq.each(obj, function(idx, val) {
            add(val, idx);
        });
    } else if ((typeof obj !== 'undefined') && (obj !== null) && (typeof obj === "object")){
        qq.each(obj, function(prop, val) {
            add(val, prop);
        });
    } else {
        uristrings.push(encodeURIComponent(temp) + '=' + encodeURIComponent(obj));
    }

    if (temp) {
        return uristrings.join(prefix);
    } else {
        return uristrings.join(prefix)
            .replace(/^&/, '')
            .replace(/%20/g, '+');
    }
};

qq.obj2FormData = function(obj, formData, arrayKeyName) {
    "use strict";
    if (!formData) {
        formData = new FormData();
    }

    qq.each(obj, function(key, val) {
        key = arrayKeyName ? arrayKeyName + '[' + key + ']' : key;

        if (qq.isObject(val)) {
            qq.obj2FormData(val, formData, key);
        }
        else if (qq.isFunction(val)) {
            formData.append(key, val());
        }
        else {
            formData.append(key, val);
        }
    });

    return formData;
};

qq.obj2Inputs = function(obj, form) {
    "use strict";
    var input;

    if (!form) {
        form = document.createElement('form');
    }

    qq.obj2FormData(obj, {
        append: function(key, val) {
            input = document.createElement('input');
            input.setAttribute('name', key);
            input.setAttribute('value', val);
            form.appendChild(input);
        }
    });

    return form;
};

qq.setCookie = function(name, value, days) {
    var date = new Date(),
        expires = "";

	if (days) {
		date.setTime(date.getTime()+(days*24*60*60*1000));
		expires = "; expires="+date.toGMTString();
	}

	document.cookie = name+"="+value+expires+"; path=/";
};

qq.getCookie = function(name) {
	var nameEQ = name + "=",
        ca = document.cookie.split(';'),
        cookie;

    qq.each(ca, function(idx, part) {
        var cookiePart = part;
        while (cookiePart.charAt(0)==' ') {
            cookiePart = cookiePart.substring(1, cookiePart.length);
        }

        if (cookiePart.indexOf(nameEQ) === 0) {
            cookie = cookiePart.substring(nameEQ.length, cookiePart.length);
            return false;
        }
    });

    return cookie;
};

qq.getCookieNames = function(regexp) {
    var cookies = document.cookie.split(';'),
        cookieNames = [];

    qq.each(cookies, function(idx, cookie) {
        cookie = qq.trimStr(cookie);

        var equalsIdx = cookie.indexOf("=");

        if (cookie.match(regexp)) {
            cookieNames.push(cookie.substr(0, equalsIdx));
        }
    });

    return cookieNames;
};

qq.deleteCookie = function(name) {
	qq.setCookie(name, "", -1);
};

qq.areCookiesEnabled = function() {
    var randNum = Math.random() * 100000,
        name = "qqCookieTest:" + randNum;
    qq.setCookie(name, 1);

    if (qq.getCookie(name)) {
        qq.deleteCookie(name);
        return true;
    }
    return false;
};

/**
 * Not recommended for use outside of Fine Uploader since this falls back to an unchecked eval if JSON.parse is not
 * implemented.  For a more secure JSON.parse polyfill, use Douglas Crockford's json2.js.
 */
qq.parseJson = function(json) {
    /*jshint evil: true*/
    if (window.JSON && qq.isFunction(JSON.parse)) {
        return JSON.parse(json);
    } else {
        return eval("(" + json + ")");
    }
};

/**
 * Retrieve the extension of a file, if it exists.
 *
 * @param filename
 * @returns {string || undefined}
 */
qq.getExtension = function(filename) {
    var extIdx = filename.lastIndexOf('.') + 1;

    if (extIdx > 0) {
        return filename.substr(extIdx, filename.length - extIdx);
    }
};

/**
 * A generic module which supports object disposing in dispose() method.
 * */
qq.DisposeSupport = function() {
    "use strict";
    var disposers = [];

    return {
        /** Run all registered disposers */
        dispose: function() {
            var disposer;
            do {
                disposer = disposers.shift();
                if (disposer) {
                    disposer();
                }
            }
            while (disposer);
        },

        /** Attach event handler and register de-attacher as a disposer */
        attach: function() {
            var args = arguments;
            /*jslint undef:true*/
            this.addDisposer(qq(args[0]).attach.apply(this, Array.prototype.slice.call(arguments, 1)));
        },

        /** Add disposer to the collection */
        addDisposer: function(disposeFunction) {
            disposers.push(disposeFunction);
        }
    };
};

qq.version="4.0.3";

qq.supportedFeatures = (function () {
    var supportsUploading,
        supportsAjaxFileUploading,
        supportsFolderDrop,
        supportsChunking,
        supportsResume,
        supportsUploadViaPaste,
        supportsUploadCors,
        supportsDeleteFileXdr,
        supportsDeleteFileCorsXhr,
        supportsDeleteFileCors,
        supportsFolderSelection,
        supportsImagePreviews;


    function testSupportsFileInputElement() {
        var supported = true,
            tempInput;

        try {
            tempInput = document.createElement('input');
            tempInput.type = 'file';
            qq(tempInput).hide();

            if (tempInput.disabled) {
                supported = false;
            }
        }
        catch (ex) {
            supported = false;
        }

        return supported;
    }

    //only way to test for Filesystem API support since webkit does not expose the DataTransfer interface
    function isChrome21OrHigher() {
        return qq.chrome() &&
            navigator.userAgent.match(/Chrome\/[2][1-9]|Chrome\/[3-9][0-9]/) !== undefined;
    }

    //only way to test for complete Clipboard API support at this time
    function isChrome14OrHigher() {
        return qq.chrome() &&
            navigator.userAgent.match(/Chrome\/[1][4-9]|Chrome\/[2-9][0-9]/) !== undefined;
    }

    //Ensure we can send cross-origin `XMLHttpRequest`s
    function isCrossOriginXhrSupported() {
        if (window.XMLHttpRequest) {
            var xhr = qq.createXhrInstance();

            //Commonly accepted test for XHR CORS support.
            return xhr.withCredentials !== undefined;
        }

        return false;
    }

    //Test for (terrible) cross-origin ajax transport fallback for IE9 and IE8
    function isXdrSupported() {
        return window.XDomainRequest !== undefined;
    }

    // CORS Ajax requests are supported if it is either possible to send credentialed `XMLHttpRequest`s,
    // or if `XDomainRequest` is an available alternative.
    function isCrossOriginAjaxSupported() {
        if (isCrossOriginXhrSupported()) {
            return true;
        }

        return isXdrSupported();
    }

    function isFolderSelectionSupported() {
        // We know that folder selection is only supported in Chrome via this proprietary attribute for now
        return document.createElement('input').webkitdirectory !== undefined;
    }


    supportsUploading = testSupportsFileInputElement();

    supportsAjaxFileUploading = supportsUploading && qq.isXhrUploadSupported();

    supportsFolderDrop = supportsAjaxFileUploading && isChrome21OrHigher();

    supportsChunking = supportsAjaxFileUploading && qq.isFileChunkingSupported();

    supportsResume = supportsAjaxFileUploading && supportsChunking && qq.areCookiesEnabled();

    supportsUploadViaPaste = supportsAjaxFileUploading && isChrome14OrHigher();

    supportsUploadCors = supportsUploading && (window.postMessage !== undefined || supportsAjaxFileUploading);

    supportsDeleteFileCorsXhr = isCrossOriginXhrSupported();

    supportsDeleteFileXdr = isXdrSupported();

    supportsDeleteFileCors = isCrossOriginAjaxSupported();

    supportsFolderSelection = isFolderSelectionSupported();

    supportsImagePreviews = supportsAjaxFileUploading && window.FileReader !== undefined;


    return {
        uploading: supportsUploading,
        ajaxUploading: supportsAjaxFileUploading,
        fileDrop: supportsAjaxFileUploading, //NOTE: will also return true for touch-only devices.  It's not currently possible to accurately test for touch-only devices
        folderDrop: supportsFolderDrop,
        chunking: supportsChunking,
        resume: supportsResume,
        uploadCustomHeaders: supportsAjaxFileUploading,
        uploadNonMultipart: supportsAjaxFileUploading,
        itemSizeValidation: supportsAjaxFileUploading,
        uploadViaPaste: supportsUploadViaPaste,
        progressBar: supportsAjaxFileUploading,
        uploadCors: supportsUploadCors,
        deleteFileCorsXhr: supportsDeleteFileCorsXhr,
        deleteFileCorsXdr: supportsDeleteFileXdr, //NOTE: will also return true in IE10, where XDR is also supported
        deleteFileCors: supportsDeleteFileCors,
        canDetermineSize: supportsAjaxFileUploading,
        folderSelection: supportsFolderSelection,
        imagePreviews: supportsImagePreviews
    }

}());

/*globals qq*/
qq.Promise = function() {
    "use strict";

    var successArgs, failureArgs,
        successCallbacks = [],
        failureCallbacks = [],
        doneCallbacks = [],
        state = 0;

    return {
        then: function(onSuccess, onFailure) {
            if (state === 0) {
                if (onSuccess) {
                    successCallbacks.push(onSuccess);
                }
                if (onFailure) {
                    failureCallbacks.push(onFailure);
                }
            }
            else if (state === -1 && onFailure) {
                onFailure.apply(null, failureArgs);
            }
            else if (onSuccess) {
                onSuccess.apply(null,successArgs);
            }

            return this;
        },

        done: function(callback) {
            if (state === 0) {
                doneCallbacks.push(callback);
            }
            else {
                callback.apply(null, failureArgs === undefined ? successArgs : failureArgs);
            }

            return this;
        },

        success: function() {
            state = 1;
            successArgs = arguments;

            if (successCallbacks.length) {
                qq.each(successCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            if(doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, successArgs)
                })
            }

            return this;
        },

        failure: function() {
            state = -1;
            failureArgs = arguments;

            if (failureCallbacks.length) {
                qq.each(failureCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            if(doneCallbacks.length) {
                qq.each(doneCallbacks, function(idx, callback) {
                    callback.apply(null, failureArgs);
                })
            }

            return this;
        }
    };
};

qq.isPromise = function(maybePromise) {
    return maybePromise && maybePromise.then && maybePromise.done;
};

/*globals qq*/

/**
 * This module represents an upload or "Select File(s)" button.  It's job is to embed an opaque `<input type="file">`
 * element as a child of a provided "container" element.  This "container" element (`options.element`) is used to provide
 * a custom style for the `<input type="file">` element.  The ability to change the style of the container element is also
 * provided here by adding CSS classes to the container on hover/focus.
 *
 * TODO Eliminate the mouseover and mouseout event handlers since the :hover CSS pseudo-class should now be
 * available on all supported browsers.
 *
 * @param o Options to override the default values
 */
qq.UploadButton = function(o) {
    "use strict";


    var disposeSupport = new qq.DisposeSupport(),

        options = {
            // "Container" element
            element: null,

            // If true adds `multiple` attribute to `<input type="file">`
            multiple: false,

            // Corresponds to the `accept` attribute on the associated `<input type="file">`
            acceptFiles: null,

            // A true value allows folders to be selected, if supported by the UA
            folders: false,

            // `name` attribute of `<input type="file">`
            name: 'qqfile',

            // Called when the browser invokes the onchange handler on the `<input type="file">`
            onChange: function(input) {},

            // **This option will be removed** in the future as the :hover CSS pseudo-class is available on all supported browsers
            hoverClass: 'qq-upload-button-hover',

            focusClass: 'qq-upload-button-focus'
        },
        input, buttonId;

    // Overrides any of the default option values with any option values passed in during construction.
    qq.extend(options, o);

    buttonId = qq.getUniqueId();

    // Embed an opaque `<input type="file">` element as a child of `options.element`.
    function createInput() {
        var input = document.createElement("input");

        input.setAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME, buttonId);

        if (options.multiple) {
            input.setAttribute("multiple", "");
        }

        if (options.folders && qq.supportedFeatures.folderSelection) {
            // selecting directories is only possible in Chrome now, via a vendor-specific prefixed attribute
            input.setAttribute("webkitdirectory", "");
        }

        if (options.acceptFiles) {
            input.setAttribute("accept", options.acceptFiles);
        }

        input.setAttribute("type", "file");
        input.setAttribute("name", options.name);

        qq(input).css({
            position: 'absolute',
            // in Opera only 'browse' button
            // is clickable and it is located at
            // the right side of the input
            right: 0,
            top: 0,
            fontFamily: 'Arial',
            // 4 persons reported this, the max values that worked for them were 243, 236, 236, 118
            fontSize: '118px',
            margin: 0,
            padding: 0,
            cursor: 'pointer',
            opacity: 0
        });

        options.element.appendChild(input);

        disposeSupport.attach(input, 'change', function(){
            options.onChange(input);
        });

        // **These event handlers will be removed** in the future as the :hover CSS pseudo-class is available on all supported browsers
        disposeSupport.attach(input, 'mouseover', function(){
            qq(options.element).addClass(options.hoverClass);
        });
        disposeSupport.attach(input, 'mouseout', function(){
            qq(options.element).removeClass(options.hoverClass);
        });

        disposeSupport.attach(input, 'focus', function(){
            qq(options.element).addClass(options.focusClass);
        });
        disposeSupport.attach(input, 'blur', function(){
            qq(options.element).removeClass(options.focusClass);
        });

        // IE and Opera, unfortunately have 2 tab stops on file input
        // which is unacceptable in our case, disable keyboard access
        if (window.attachEvent) {
            // it is IE or Opera
            input.setAttribute('tabIndex', "-1");
        }

        return input;
    }

    // Make button suitable container for input
    qq(options.element).css({
        position: 'relative',
        overflow: 'hidden',
        // Make sure browse button is in the right side in Internet Explorer
        direction: 'ltr'
    });

    input = createInput();


    // Exposed API
    return {
        getInput: function() {
            return input;
        },

        getButtonId: function() {
            return buttonId;
        },

        setMultiple: function(isMultiple) {
            if (isMultiple !== options.multiple) {
                if (isMultiple) {
                    input.setAttribute("multiple", "");
                }
                else {
                    input.removeAttribute("multiple");
                }
            }
        },

        setAcceptFiles: function(acceptFiles) {
            if (acceptFiles !== options.acceptFiles) {
                input.setAttribute("accept", acceptFiles);
            }
        },

        reset: function(){
            if (input.parentNode){
                qq(input).remove();
            }

            qq(options.element).removeClass(options.focusClass);
            input = createInput();
        }
    };
};

qq.UploadButton.BUTTON_ID_ATTR_NAME = "qq-button-id";

qq.UploadData = function(uploaderProxy) {
    var data = [],
        byId = {},
        byUuid = {},
        byStatus = {},
        api;

    function getDataByIds(ids) {
        if (qq.isArray(ids)) {
            var entries = [];

            qq.each(ids, function(idx, id) {
                entries.push(data[byId[id]]);
            });

            return entries;
        }

        return data[byId[ids]];
    }

    function getDataByUuids(uuids) {
        if (qq.isArray(uuids)) {
            var entries = [];

            qq.each(uuids, function(idx, uuid) {
                entries.push(data[byUuid[uuid]]);
            });

            return entries;
        }

        return data[byUuid[uuids]];
    }

    function getDataByStatus(status) {
        var statusResults = [],
            statuses = [].concat(status);

        qq.each(statuses, function(index, statusEnum) {
            var statusResultIndexes = byStatus[statusEnum];

            if (statusResultIndexes !== undefined) {
                qq.each(statusResultIndexes, function(i, dataIndex) {
                    statusResults.push(data[dataIndex]);
                });
            }
        });

        return statusResults;
    }

    api = {
        added: function(id) {
            var uuid = uploaderProxy.getUuid(id),
                name = uploaderProxy.getName(id),
                size = uploaderProxy.getSize(id),
                status = qq.status.SUBMITTING;

            var index = data.push({
                id: id,
                name: name,
                originalName: name,
                uuid: uuid,
                size: size,
                status: status
            }) - 1;

            byId[id] = index;

            byUuid[uuid] = index;

            if (byStatus[status] === undefined) {
                byStatus[status] = [];
            }
            byStatus[status].push(index);

            uploaderProxy.onStatusChange(id, undefined, status);
        },

        retrieve: function(optionalFilter) {
            if (qq.isObject(optionalFilter) && data.length)  {
                if (optionalFilter.id !== undefined) {
                    return getDataByIds(optionalFilter.id);
                }

                else if (optionalFilter.uuid !== undefined) {
                    return getDataByUuids(optionalFilter.uuid);
                }

                else if (optionalFilter.status) {
                    return getDataByStatus(optionalFilter.status);
                }
            }
            else {
                return qq.extend([], data, true);
            }
        },

        reset: function() {
            data = [];
            byId = {};
            byUuid = {};
            byStatus = {};
        },

        setStatus: function(id, newStatus) {
            var dataIndex = byId[id],
                oldStatus = data[dataIndex].status,
                byStatusOldStatusIndex = qq.indexOf(byStatus[oldStatus], dataIndex);

            byStatus[oldStatus].splice(byStatusOldStatusIndex, 1);

            data[dataIndex].status = newStatus;

            if (byStatus[newStatus] === undefined) {
                byStatus[newStatus] = [];
            }
            byStatus[newStatus].push(dataIndex);

            uploaderProxy.onStatusChange(id, oldStatus, newStatus);
        },

        uuidChanged: function(id, newUuid) {
            var dataIndex = byId[id],
                oldUuid = data[dataIndex].uuid;

            data[dataIndex].uuid = newUuid;
            byUuid[newUuid] = dataIndex;
            delete byUuid[oldUuid];
        },

        nameChanged: function(id, newName) {
            var dataIndex = byId[id];

            data[dataIndex].name = newName;
        }
    };

    return api;
};

qq.status = {
    SUBMITTING: "submitting",
    SUBMITTED: "submitted",
    REJECTED: "rejected",
    QUEUED: "queued",
    CANCELED: "canceled",
    UPLOADING: "uploading",
    UPLOAD_RETRYING: "retrying upload",
    UPLOAD_SUCCESSFUL: "upload successful",
    UPLOAD_FAILED: "upload failed",
    DELETE_FAILED: "delete failed",
    DELETING: "deleting",
    DELETED: "deleted"
};

/**
 * Defines the public API for FineUploaderBasic mode.
 */
qq.basePublicApi = {
    log: function(str, level) {
        if (this._options.debug && (!level || level === 'info')) {
            qq.log('[FineUploader ' + qq.version + '] ' + str);
        }
        else if (level && level !== 'info') {
            qq.log('[FineUploader ' + qq.version + '] ' + str, level);

        }
    },

    setParams: function(params, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.request.params = params;
        }
        else {
            this._paramsStore.setParams(params, id);
        }
    },

    setDeleteFileParams: function(params, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.deleteFile.params = params;
        }
        else {
            this._deleteFileParamsStore.setParams(params, id);
        }
    },

    // Re-sets the default endpoint, an endpoint for a specific file, or an endpoint for a specific button
    setEndpoint: function(endpoint, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.request.endpoint = endpoint;
        }
        else {
            this._endpointStore.setEndpoint(endpoint, id);
        }
    },

    getInProgress: function() {
        return this._uploadData.retrieve({
            status: [
                qq.status.UPLOADING,
                qq.status.UPLOAD_RETRYING,
                qq.status.QUEUED
            ]
        }).length;
    },

    getNetUploads: function() {
        return this._netUploaded;
    },

    uploadStoredFiles: function() {
        var idToUpload;

        if (this._storedIds.length === 0) {
            this._itemError('noFilesError');
        }
        else {
            while (this._storedIds.length) {
                idToUpload = this._storedIds.shift();
                this._handler.upload(idToUpload);
            }
        }
    },

    clearStoredFiles: function(){
        this._storedIds = [];
    },

    retry: function(id) {
        return this._manualRetry(id);
    },

    cancel: function(id) {
        this._handler.cancel(id);
    },

    cancelAll: function() {
        var storedIdsCopy = [],
            self = this;

        qq.extend(storedIdsCopy, this._storedIds);
        qq.each(storedIdsCopy, function(idx, storedFileId) {
            self.cancel(storedFileId);
        });

        this._handler.cancelAll();
    },

    reset: function() {
        this.log("Resetting uploader...");

        this._handler.reset();
        this._storedIds = [];
        this._autoRetries = [];
        this._retryTimeouts = [];
        this._preventRetries = [];
        this._thumbnailUrls = [];

        qq.each(this._buttons, function(idx, button) {
            button.reset();
        });

        this._paramsStore.reset();
        this._endpointStore.reset();
        this._netUploadedOrQueued = 0;
        this._netUploaded = 0;
        this._uploadData.reset();
        this._buttonIdsForFileIds = [];

        if (this._pasteHandler) {
            this._pasteHandler.reset();
        }
    },

    addFiles: function(filesOrInputs, params, endpoint) {
        var self = this,
            verifiedFilesOrInputs = [],
            fileOrInputIndex, fileOrInput, fileIndex;

        if (filesOrInputs) {
            if (!qq.isFileList(filesOrInputs)) {
                filesOrInputs = [].concat(filesOrInputs);
            }

            for (fileOrInputIndex = 0; fileOrInputIndex < filesOrInputs.length; fileOrInputIndex+=1) {
                fileOrInput = filesOrInputs[fileOrInputIndex];

                if (qq.isFileOrInput(fileOrInput)) {
                    if (qq.isInput(fileOrInput) && qq.supportedFeatures.ajaxUploading) {
                        for (fileIndex = 0; fileIndex < fileOrInput.files.length; fileIndex++) {
                            verifiedFilesOrInputs.push(fileOrInput.files[fileIndex]);
                        }
                    }
                    else {
                        verifiedFilesOrInputs.push(fileOrInput);
                    }
                }
                else {
                    self.log(fileOrInput + ' is not a File or INPUT element!  Ignoring!', 'warn');
                }
            }

            this.log('Received ' + verifiedFilesOrInputs.length + ' files or inputs.');
            this._prepareItemsForUpload(verifiedFilesOrInputs, params, endpoint);
        }
    },

    addBlobs: function(blobDataOrArray, params, endpoint) {
        if (blobDataOrArray) {
            var blobDataArray = [].concat(blobDataOrArray),
                verifiedBlobDataList = [],
                self = this;

            qq.each(blobDataArray, function(idx, blobData) {
                if (qq.isBlob(blobData) && !qq.isFileOrInput(blobData)) {
                    verifiedBlobDataList.push({
                        blob: blobData,
                        name: self._options.blobs.defaultName
                    });
                }
                else if (qq.isObject(blobData) && blobData.blob && blobData.name) {
                    verifiedBlobDataList.push(blobData);
                }
                else {
                    self.log("addBlobs: entry at index " + idx + " is not a Blob or a BlobData object", "error");
                }
            });

            this._prepareItemsForUpload(verifiedBlobDataList, params, endpoint);
        }
        else {
            this.log("undefined or non-array parameter passed into addBlobs", "error");
        }
    },

    getUuid: function(id) {
        return this._handler.getUuid(id);
    },

    setUuid: function(id, newUuid) {
        return this._handler.setUuid(id, newUuid);
    },

    getResumableFilesData: function() {
        return this._handler.getResumableFilesData();
    },

    getSize: function(id) {
        return this._handler.getSize(id);
    },

    getName: function(id) {
        return this._handler.getName(id);
    },

    setName: function(id, newName) {
        this._handler.setName(id, newName);
        this._uploadData.nameChanged(id, newName);
    },

    getFile: function(fileOrBlobId) {
        return this._handler.getFile(fileOrBlobId);
    },

    deleteFile: function(id) {
        this._onSubmitDelete(id);
    },

    setDeleteFileEndpoint: function(endpoint, id) {
        /*jshint eqeqeq: true, eqnull: true*/
        if (id == null) {
            this._options.deleteFile.endpoint = endpoint;
        }
        else {
            this._deleteFileEndpointStore.setEndpoint(endpoint, id);
        }
    },

    doesExist: function(fileOrBlobId) {
        return this._handler.isValid(fileOrBlobId);
    },

    getUploads: function(optionalFilter) {
        return this._uploadData.retrieve(optionalFilter);
    },

    getButton: function(fileId) {
        return this._getButton(this._buttonIdsForFileIds[fileId]);
    },

    // Generate a variable size thumbnail on an img or canvas,
    // returning a promise that is fulfilled when the attempt completes.
    // Thumbnail can either be based off of a URL for an image returned
    // by the server in the upload response, or the associated `Blob`.
    drawThumbnail: function(fileId, imgOrCanvas, maxSize, fromServer) {
        if (this._imageGenerator) {
            var fileOrUrl = this._thumbnailUrls[fileId],
                options = {
                    scale: maxSize > 0,
                    maxSize: maxSize > 0 ? maxSize : null
                };

            // If client-side preview generation is possible
            // and we are not specifically looking for the image URl returned by the server...
            if (!fromServer && qq.supportedFeatures.imagePreviews) {
                fileOrUrl = this.getFile(fileId);
            }

            if (fileOrUrl == null) {
                return new qq.Promise().failure(imgOrCanvas, "File or URL not found.");
            }

            return this._imageGenerator.generate(fileOrUrl, imgOrCanvas, options);
        }
    }
};




/**
 * Defines the private (internal) API for FineUploaderBasic mode.
 */
qq.basePrivateApi = {
    // Creates an internal object that tracks various properties of each extra button,
    // and then actually creates the extra button.
    _generateExtraButtonSpecs: function() {
        var self = this;

        this._extraButtonSpecs = {};

        qq.each(this._options.extraButtons, function(idx, extraButtonOptionEntry) {
            var multiple = extraButtonOptionEntry.multiple,
                validation = qq.extend({}, self._options.validation, true),
                extraButtonSpec = qq.extend({}, extraButtonOptionEntry);

            if (multiple === undefined) {
                multiple = self._options.multiple;
            }

            if (extraButtonSpec.validation) {
                qq.extend(validation, extraButtonOptionEntry.validation, true);
            }

            qq.extend(extraButtonSpec, {
                multiple: multiple,
                validation: validation
            }, true);

            self._initExtraButton(extraButtonSpec);
        });
    },

    // Creates an extra button element
    _initExtraButton: function(spec) {
        var button = this._createUploadButton({
            element: spec.element,
            multiple: spec.multiple,
            accept: spec.validation.acceptFiles,
            folders: spec.folders
        });

        this._extraButtonSpecs[button.getButtonId()] = spec;
    },

    /**
     * Gets the internally used tracking ID for a button.
     *
     * @param buttonOrFileInputOrFile `File`, `<input type="file">`, or a button container element
     * @returns {*} The button's ID, or undefined if no ID is recoverable
     * @private
     */
    _getButtonId: function(buttonOrFileInputOrFile) {
        var inputs, fileInput;

        // If the item is a `Blob` it will never be associated with a button or drop zone.
        if (buttonOrFileInputOrFile && !buttonOrFileInputOrFile.blob && !qq.isBlob(buttonOrFileInputOrFile)) {
            if (qq.isFile(buttonOrFileInputOrFile)) {
                return buttonOrFileInputOrFile.qqButtonId;
            }
            else if (buttonOrFileInputOrFile.tagName.toLowerCase() === "input" &&
                buttonOrFileInputOrFile.type.toLowerCase() === "file") {

                return buttonOrFileInputOrFile.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);
            }

            inputs = buttonOrFileInputOrFile.getElementsByTagName("input");

            qq.each(inputs, function(idx, input) {
                if (input.getAttribute("type") === "file") {
                    fileInput = input;
                    return false;
                }
            });

            if (fileInput) {
                return fileInput.getAttribute(qq.UploadButton.BUTTON_ID_ATTR_NAME);
            }
        }
    },

    _annotateWithButtonId: function(file, associatedInput) {
        if (qq.isFile(file)) {
            file.qqButtonId = this._getButtonId(associatedInput);
        }
    },

    _getButton: function(buttonId) {
        var extraButtonsSpec = this._extraButtonSpecs[buttonId];

        if (extraButtonsSpec) {
            return extraButtonsSpec.element;
        }
        else if (buttonId === this._defaultButtonId) {
            return this._options.button;
        }
    },

    _handleCheckedCallback: function(details) {
        var self = this,
            callbackRetVal = details.callback();

        if (qq.isPromise(callbackRetVal)) {
            this.log(details.name + " - waiting for " + details.name + " promise to be fulfilled for " + details.identifier);
            return callbackRetVal.then(
                function(successParam) {
                    self.log(details.name + " promise success for " + details.identifier);
                    details.onSuccess(successParam);
                },
                function() {
                    if (details.onFailure) {
                        self.log(details.name + " promise failure for " + details.identifier);
                        details.onFailure();
                    }
                    else {
                        self.log(details.name + " promise failure for " + details.identifier);
                    }
                });
        }

        if (callbackRetVal !== false) {
            details.onSuccess(callbackRetVal);
        }
        else {
            if (details.onFailure) {
                this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Invoking failure callback.")
                details.onFailure();
            }
            else {
                this.log(details.name + " - return value was 'false' for " + details.identifier + ".  Will not proceed.")
            }
        }

        return callbackRetVal;
    },

    /**
     * Generate a tracked upload button.
     *
     * @param spec Object containing a required `element` property
     * along with optional `multiple`, `accept`, and `folders`.
     * @returns {qq.UploadButton}
     * @private
     */
    _createUploadButton: function(spec) {
        var self = this,
            isMultiple = spec.multiple === undefined ? this._options.multiple : spec.multiple,
            acceptFiles = spec.accept || this._options.validation.acceptFiles;

        var button = new qq.UploadButton({
            element: spec.element,
            folders: spec.folders,
            name: this._options.request.inputName,
            multiple: isMultiple && qq.supportedFeatures.ajaxUploading,
            acceptFiles: acceptFiles,
            onChange: function(input) {
                self._onInputChange(input);
            },
            hoverClass: this._options.classes.buttonHover,
            focusClass: this._options.classes.buttonFocus
        });

        this._disposeSupport.addDisposer(function() {
            button.dispose();
        });

        self._buttons.push(button);

        return button;
    },

    _createUploadHandler: function(additionalOptions, namespace) {
        var self = this,
            options = {
                debug: this._options.debug,
                maxConnections: this._options.maxConnections,
                inputName: this._options.request.inputName,
                cors: this._options.cors,
                demoMode: this._options.demoMode,
                paramsStore: this._paramsStore,
                endpointStore: this._endpointStore,
                chunking: this._options.chunking,
                resume: this._options.resume,
                blobs: this._options.blobs,
                log: qq.bind(self.log, self),
                onProgress: function(id, name, loaded, total){
                    self._onProgress(id, name, loaded, total);
                    self._options.callbacks.onProgress(id, name, loaded, total);
                },
                onComplete: function(id, name, result, xhr){
                    var retVal = self._onComplete(id, name, result, xhr);

                    // If the internal `_onComplete` handler returns a promise, don't invoke the `onComplete` callback
                    // until the promise has been fulfilled.
                    if (qq.isPromise(retVal)) {
                        retVal.done(function() {
                            self._options.callbacks.onComplete(id, name, result, xhr);
                        });
                    }
                    else {
                        self._options.callbacks.onComplete(id, name, result, xhr);
                    }
                },
                onCancel: function(id, name) {
                    return self._handleCheckedCallback({
                        name: "onCancel",
                        callback: qq.bind(self._options.callbacks.onCancel, self, id, name),
                        onSuccess: qq.bind(self._onCancel, self, id, name),
                        identifier: id
                    });
                },
                onUpload: function(id, name) {
                    self._onUpload(id, name);
                    self._options.callbacks.onUpload(id, name);
                },
                onUploadChunk: function(id, name, chunkData){
                    self._options.callbacks.onUploadChunk(id, name, chunkData);
                },
                onResume: function(id, name, chunkData) {
                    return self._options.callbacks.onResume(id, name, chunkData);
                },
                onAutoRetry: function(id, name, responseJSON, xhr) {
                    return self._onAutoRetry.apply(self, arguments);
                },
                onUuidChanged: function(id, newUuid) {
                    self._uploadData.uuidChanged(id, newUuid);
                }
            };

        qq.each(this._options.request, function(prop, val) {
            options[prop] = val;
        });

        if (additionalOptions) {
            qq.each(additionalOptions, function(key, val) {
                options[key] = val;
            });
        }

        return new qq.UploadHandler(options, namespace);
    },

    _createDeleteHandler: function() {
        var self = this;

        return new qq.DeleteFileAjaxRequestor({
            method: this._options.deleteFile.method,
            maxConnections: this._options.maxConnections,
            uuidParamName: this._options.request.uuidName,
            customHeaders: this._options.deleteFile.customHeaders,
            paramsStore: this._deleteFileParamsStore,
            endpointStore: this._deleteFileEndpointStore,
            demoMode: this._options.demoMode,
            cors: this._options.cors,
            log: qq.bind(self.log, self),
            onDelete: function(id) {
                self._onDelete(id);
                self._options.callbacks.onDelete(id);
            },
            onDeleteComplete: function(id, xhrOrXdr, isError) {
                self._onDeleteComplete(id, xhrOrXdr, isError);
                self._options.callbacks.onDeleteComplete(id, xhrOrXdr, isError);
            }

        });
    },

    _createPasteHandler: function() {
        var self = this;

        return new qq.PasteSupport({
            targetElement: this._options.paste.targetElement,
            callbacks: {
                log: qq.bind(self.log, self),
                pasteReceived: function(blob) {
                    self._handleCheckedCallback({
                        name: "onPasteReceived",
                        callback: qq.bind(self._options.callbacks.onPasteReceived, self, blob),
                        onSuccess: qq.bind(self._handlePasteSuccess, self, blob),
                        identifier: "pasted image"
                    });
                }
            }
        });
    },

    _createUploadDataTracker: function() {
        var self = this;

        return new qq.UploadData({
            getName: function(id) {
                return self.getName(id);
            },
            getUuid: function(id) {
                return self.getUuid(id);
            },
            getSize: function(id) {
                return self.getSize(id);
            },
            onStatusChange: function(id, oldStatus, newStatus) {
                self._onUploadStatusChange(id, oldStatus, newStatus);
                self._options.callbacks.onStatusChange(id, oldStatus, newStatus);
            }
        });
    },

    _onUploadStatusChange: function(id, oldStatus, newStatus) {
        //nothing to do in the basic uploader
    },

    _handlePasteSuccess: function(blob, extSuppliedName) {
        var extension = blob.type.split("/")[1],
            name = extSuppliedName;

        /*jshint eqeqeq: true, eqnull: true*/
        if (name == null) {
            name = this._options.paste.defaultName;
        }

        name += '.' + extension;

        this.addBlobs({
            name: name,
            blob: blob
        });
    },

    _preventLeaveInProgress: function(){
        var self = this;

        this._disposeSupport.attach(window, 'beforeunload', function(e){
            if (self.getInProgress()) {
                var e = e || window.event;
                // for ie, ff
                e.returnValue = self._options.messages.onLeave;
                // for webkit
                return self._options.messages.onLeave;
            }
        });
    },

    _onSubmit: function(id, name) {
        this._netUploadedOrQueued++;
    },

    _onProgress: function(id, name, loaded, total) {
        //nothing to do yet in core uploader
    },

    _onComplete: function(id, name, result, xhr) {
        if (!result.success) {
            this._netUploadedOrQueued--;
            this._uploadData.setStatus(id, qq.status.UPLOAD_FAILED);
        }
        else {
            if (result.thumbnailUrl) {
                this._thumbnailUrls[id] = result.thumbnailUrl;
            }

            this._netUploaded++;
            this._uploadData.setStatus(id, qq.status.UPLOAD_SUCCESSFUL);
        }

        this._maybeParseAndSendUploadError(id, name, result, xhr);

        return result.success ? true : false;
    },

    _onCancel: function(id, name) {
        this._netUploadedOrQueued--;

        clearTimeout(this._retryTimeouts[id]);

        var storedItemIndex = qq.indexOf(this._storedIds, id);
        if (!this._options.autoUpload && storedItemIndex >= 0) {
            this._storedIds.splice(storedItemIndex, 1);
        }

        this._uploadData.setStatus(id, qq.status.CANCELED);
    },

    _isDeletePossible: function() {
        if (!qq.DeleteFileAjaxRequestor || !this._options.deleteFile.enabled) {
            return false;
        }

        if (this._options.cors.expected) {
            if (qq.supportedFeatures.deleteFileCorsXhr) {
                return true;
            }

            if (qq.supportedFeatures.deleteFileCorsXdr && this._options.cors.allowXdr) {
                return true;
            }

            return false;
        }

        return true;
    },

    _onSubmitDelete: function(id, onSuccessCallback, additionalMandatedParams) {
        var uuid = this.getUuid(id),
            adjustedOnSuccessCallback;

        if (onSuccessCallback) {
            adjustedOnSuccessCallback = qq.bind(onSuccessCallback, this, id, uuid, additionalMandatedParams);
        }

        if (this._isDeletePossible()) {
            return this._handleCheckedCallback({
                name: "onSubmitDelete",
                callback: qq.bind(this._options.callbacks.onSubmitDelete, this, id),
                onSuccess: adjustedOnSuccessCallback ||
                    qq.bind(this._deleteHandler.sendDelete, this, id, uuid, additionalMandatedParams),
                identifier: id
            });
        }
        else {
            this.log("Delete request ignored for ID " + id + ", delete feature is disabled or request not possible " +
                "due to CORS on a user agent that does not support pre-flighting.", "warn");
            return false;
        }
    },

    _onDelete: function(id) {
        this._uploadData.setStatus(id, qq.status.DELETING);
    },

    _onDeleteComplete: function(id, xhrOrXdr, isError) {
        var name = this._handler.getName(id);

        if (isError) {
            this._uploadData.setStatus(id, qq.status.DELETE_FAILED);
            this.log("Delete request for '" + name + "' has failed.", "error");

            // For error reporing, we only have accesss to the response status if this is not
            // an `XDomainRequest`.
            if (xhrOrXdr.withCredentials === undefined) {
                this._options.callbacks.onError(id, name, "Delete request failed", xhrOrXdr);
            }
            else {
                this._options.callbacks.onError(id, name, "Delete request failed with response code " + xhrOrXdr.status, xhrOrXdr);
            }
        }
        else {
            this._netUploadedOrQueued--;
            this._netUploaded--;
            this._handler.expunge(id);
            this._uploadData.setStatus(id, qq.status.DELETED);
            this.log("Delete request for '" + name + "' has succeeded.");
        }
    },

    _onUpload: function(id, name) {
        this._uploadData.setStatus(id, qq.status.UPLOADING);
    },

    _onInputChange: function(input) {
        var fileIndex;

        if (qq.supportedFeatures.ajaxUploading) {
            for (fileIndex = 0; fileIndex < input.files.length; fileIndex++) {
                this._annotateWithButtonId(input.files[fileIndex], input);
            }

            this.addFiles(input.files);
        }
        // Android 2.3.x will fire `onchange` even if no file has been selected
        else if (input.value.length > 0) {
            this.addFiles(input);
        }

        qq.each(this._buttons, function(idx, button) {
            button.reset();
        });
    },

    _onBeforeAutoRetry: function(id, name) {
        this.log("Waiting " + this._options.retry.autoAttemptDelay + " seconds before retrying " + name + "...");
    },

    /**
     * Attempt to automatically retry a failed upload.
     *
     * @param id The file ID of the failed upload
     * @param name The name of the file associated with the failed upload
     * @param responseJSON Response from the server, parsed into a javascript object
     * @param xhr Ajax transport used to send the failed request
     * @param callback Optional callback to be invoked if a retry is prudent.
     * Invoked in lieu of asking the upload handler to retry.
     * @returns {boolean} true if an auto-retry will occur
     * @private
     */
    _onAutoRetry: function(id, name, responseJSON, xhr, callback) {
        var self = this;

        self._preventRetries[id] = responseJSON[self._options.retry.preventRetryResponseProperty];

        if (self._shouldAutoRetry(id, name, responseJSON)) {
            self._maybeParseAndSendUploadError.apply(self, arguments);
            self._options.callbacks.onAutoRetry(id, name, self._autoRetries[id] + 1);
            self._onBeforeAutoRetry(id, name);

            self._retryTimeouts[id] = setTimeout(function() {
                self.log("Retrying " + name + "...");
                self._autoRetries[id]++;
                self._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);

                if (callback) {
                    callback(id);
                }
                else {
                    self._handler.retry(id);
                }
            }, self._options.retry.autoAttemptDelay * 1000);

            return true;
        }
    },

    _shouldAutoRetry: function(id, name, responseJSON) {
        if (!this._preventRetries[id] && this._options.retry.enableAuto) {
            if (this._autoRetries[id] === undefined) {
                this._autoRetries[id] = 0;
            }

            return this._autoRetries[id] < this._options.retry.maxAutoAttempts;
        }

        return false;
    },

    //return false if we should not attempt the requested retry
    _onBeforeManualRetry: function(id) {
        var itemLimit = this._options.validation.itemLimit;

        if (this._preventRetries[id]) {
            this.log("Retries are forbidden for id " + id, 'warn');
            return false;
        }
        else if (this._handler.isValid(id)) {
            var fileName = this._handler.getName(id);

            if (this._options.callbacks.onManualRetry(id, fileName) === false) {
                return false;
            }

            if (itemLimit > 0 && this._netUploadedOrQueued+1 > itemLimit) {
                this._itemError("retryFailTooManyItems");
                return false;
            }

            this.log("Retrying upload for '" + fileName + "' (id: " + id + ")...");
            return true;
        }
        else {
            this.log("'" + id + "' is not a valid file ID", 'error');
            return false;
        }
    },

    /**
     * Conditionally orders a manual retry of a failed upload.
     *
     * @param id File ID of the failed upload
     * @param callback Optional callback to invoke if a retry is prudent.
     * In lieu of asking the upload handler to retry.
     * @returns {boolean} true if a manual retry will occur
     * @private
     */
    _manualRetry: function(id, callback) {
        if (this._onBeforeManualRetry(id)) {
            this._netUploadedOrQueued++;
            this._uploadData.setStatus(id, qq.status.UPLOAD_RETRYING);

            if (callback) {
                callback(id);
            }
            else {
                this._handler.retry(id);
            }

            return true;
        }
    },

    _maybeParseAndSendUploadError: function(id, name, response, xhr) {
        // Assuming no one will actually set the response code to something other than 200
        // and still set 'success' to true...
        if (!response.success){
            if (xhr && xhr.status !== 200 && !response.error) {
                this._options.callbacks.onError(id, name, "XHR returned response code " + xhr.status, xhr);
            }
            else {
                var errorReason = response.error ? response.error : this._options.text.defaultResponseError;
                this._options.callbacks.onError(id, name, errorReason, xhr);
            }
        }
    },

    _prepareItemsForUpload: function(items, params, endpoint) {
        var validationDescriptors = this._getValidationDescriptors(items),
            buttonId = this._getButtonId(items[0]),
            button = this._getButton(buttonId);

        this._handleCheckedCallback({
            name: "onValidateBatch",
            callback: qq.bind(this._options.callbacks.onValidateBatch, this, validationDescriptors, button),
            onSuccess: qq.bind(this._onValidateBatchCallbackSuccess, this, validationDescriptors, items, params, endpoint, button),
            identifier: "batch validation"
        });
    },

    _upload: function(blobOrFileContainer, params, endpoint) {
        var id = this._handler.add(blobOrFileContainer),
            name = this._handler.getName(id);

        this._uploadData.added(id);

        if (params) {
            this.setParams(params, id);
        }

        if (endpoint) {
            this.setEndpoint(endpoint, id);
        }

        this._handleCheckedCallback({
            name: "onSubmit",
            callback: qq.bind(this._options.callbacks.onSubmit, this, id, name),
            onSuccess: qq.bind(this._onSubmitCallbackSuccess, this, id, name),
            onFailure: qq.bind(this._fileOrBlobRejected, this, id, name),
            identifier: id
        });
    },

    _onSubmitCallbackSuccess: function(id, name) {
        var buttonId;

        this._uploadData.setStatus(id, qq.status.SUBMITTED);

        if (qq.supportedFeatures.ajaxUploading) {
            buttonId = this._handler.getFile(id).qqButtonId;
        }
        else {
            buttonId = this._getButtonId(this._handler.getInput(id));
        }

        if (buttonId) {
            this._buttonIdsForFileIds[id] = buttonId;
        }

        this._onSubmit.apply(this, arguments);
        this._onSubmitted.apply(this, arguments);
        this._options.callbacks.onSubmitted.apply(this, arguments);

        if (this._options.autoUpload) {
            if (!this._handler.upload(id)) {
                this._uploadData.setStatus(id, qq.status.QUEUED);
            }
        }
        else {
            this._storeForLater(id);
        }
    },

    _onSubmitted: function(id) {
        //nothing to do in the base uploader
    },

    _storeForLater: function(id) {
        this._storedIds.push(id);
    },

    _onValidateBatchCallbackSuccess: function(validationDescriptors, items, params, endpoint, button) {
        var errorMessage,
            itemLimit = this._options.validation.itemLimit,
            proposedNetFilesUploadedOrQueued = this._netUploadedOrQueued + validationDescriptors.length;

        if (itemLimit === 0 || proposedNetFilesUploadedOrQueued <= itemLimit) {
            if (items.length > 0) {
                this._handleCheckedCallback({
                    name: "onValidate",
                    callback: qq.bind(this._options.callbacks.onValidate, this, validationDescriptors[0], button),
                    onSuccess: qq.bind(this._onValidateCallbackSuccess, this, items, 0, params, endpoint),
                    onFailure: qq.bind(this._onValidateCallbackFailure, this, items, 0, params, endpoint),
                    identifier: "Item '" + items[0].name + "', size: " + items[0].size
                });
            }
            else {
                this._itemError("noFilesError");
            }
        }
        else {
            errorMessage = this._options.messages.tooManyItemsError
                .replace(/\{netItems\}/g, proposedNetFilesUploadedOrQueued)
                .replace(/\{itemLimit\}/g, itemLimit);
            this._batchError(errorMessage);
        }
    },

    _onValidateCallbackSuccess: function(items, index, params, endpoint) {
        var nextIndex = index+1,
            validationDescriptor = this._getValidationDescriptor(items[index]),
            validItem = false;

        if (this._validateFileOrBlobData(items[index], validationDescriptor)) {
            validItem = true;
            this._upload(items[index], params, endpoint);
        }

        this._maybeProcessNextItemAfterOnValidateCallback(validItem, items, nextIndex, params, endpoint);
    },

    _onValidateCallbackFailure: function(items, index, params, endpoint) {
        var nextIndex = index+ 1;

        this._fileOrBlobRejected(undefined, items[0].name);

        this._maybeProcessNextItemAfterOnValidateCallback(false, items, nextIndex, params, endpoint);
    },

    _maybeProcessNextItemAfterOnValidateCallback: function(validItem, items, index, params, endpoint) {
        var self = this;

        if (items.length > index) {
            if (validItem || !this._options.validation.stopOnFirstInvalidFile) {
                //use setTimeout to prevent a stack overflow with a large number of files in the batch & non-promissory callbacks
                setTimeout(function() {
                    var validationDescriptor = self._getValidationDescriptor(items[index]);

                    self._handleCheckedCallback({
                        name: "onValidate",
                        callback: qq.bind(self._options.callbacks.onValidate, self, items[index]),
                        onSuccess: qq.bind(self._onValidateCallbackSuccess, self, items, index, params, endpoint),
                        onFailure: qq.bind(self._onValidateCallbackFailure, self, items, index, params, endpoint),
                        identifier: "Item '" + validationDescriptor.name + "', size: " + validationDescriptor.size
                    });
                }, 0);
            }
        }
    },

    /**
     * Performs some internal validation checks on an item, defined in the `validation` option.
     *
     * @param item `File`, `Blob`, or `<input type="file">`
     * @param validationDescriptor Normalized information about the item (`size`, `name`).
     * @returns {boolean} true if the item is valid
     * @private
     */
    _validateFileOrBlobData: function(item, validationDescriptor) {
        var name = validationDescriptor.name,
            size = validationDescriptor.size,
            buttonId = this._getButtonId(item),
            extraButtonSpec = this._extraButtonSpecs[buttonId],
            validationBase = extraButtonSpec ? extraButtonSpec.validation : this._options.validation,

            valid = true;

        if (qq.isFileOrInput(item) && !this._isAllowedExtension(validationBase.allowedExtensions, name)) {
            this._itemError('typeError', name, item);
            valid = false;

        }
        else if (size === 0) {
            this._itemError('emptyError', name, item);
            valid = false;

        }
        else if (size && validationBase.sizeLimit && size > validationBase.sizeLimit) {
            this._itemError('sizeError', name, item);
            valid = false;

        }
        else if (size && size < validationBase.minSizeLimit) {
            this._itemError('minSizeError', name, item);
            valid = false;
        }

        if (!valid) {
            this._fileOrBlobRejected(undefined, name);
        }

        return valid;
    },

    _fileOrBlobRejected: function(id) {
        if (id !== undefined) {
            this._uploadData.setStatus(id, qq.status.REJECTED);
        }
    },

    /**
     * Constructs and returns a message that describes an item/file error.  Also calls `onError` callback.
     *
     * @param code REQUIRED - a code that corresponds to a stock message describing this type of error
     * @param maybeNameOrNames names of the items that have failed, if applicable
     * @param item `File`, `Blob`, or `<input type="file">`
     * @private
     */
    _itemError: function(code, maybeNameOrNames, item) {
        var message = this._options.messages[code],
            allowedExtensions = [],
            names = [].concat(maybeNameOrNames),
            name = names[0],
            buttonId = this._getButtonId(item),
            extraButtonSpec = this._extraButtonSpecs[buttonId],
            validationBase = extraButtonSpec ? extraButtonSpec.validation : this._options.validation,
            extensionsForMessage, placeholderMatch;

        function r(name, replacement){ message = message.replace(name, replacement); }

        qq.each(validationBase.allowedExtensions, function(idx, allowedExtension) {
                /**
                 * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
                 * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
                 */
                if (qq.isString(allowedExtension)) {
                    allowedExtensions.push(allowedExtension);
                }
        });

        extensionsForMessage = allowedExtensions.join(', ').toLowerCase();

        r('{file}', this._options.formatFileName(name));
        r('{extensions}', extensionsForMessage);
        r('{sizeLimit}', this._formatSize(validationBase.sizeLimit));
        r('{minSizeLimit}', this._formatSize(validationBase.minSizeLimit));

        placeholderMatch = message.match(/(\{\w+\})/g);
        if (placeholderMatch !== null) {
            qq.each(placeholderMatch, function(idx, placeholder) {
                r(placeholder, names[idx]);
            });
        }

        this._options.callbacks.onError(null, name, message, undefined);

        return message;
    },

    _batchError: function(message) {
        this._options.callbacks.onError(null, null, message, undefined);
    },

    _isAllowedExtension: function(allowed, fileName) {
        var valid = false;

        if (!allowed.length) {
            return true;
        }

        qq.each(allowed, function(idx, allowedExt) {
            /**
             * If an argument is not a string, ignore it.  Added when a possible issue with MooTools hijacking the
             * `allowedExtensions` array was discovered.  See case #735 in the issue tracker for more details.
             */
            if (qq.isString(allowedExt)) {
                /*jshint eqeqeq: true, eqnull: true*/
                var extRegex = new RegExp('\\.' + allowedExt + "$", 'i');

                if (fileName.match(extRegex) != null) {
                    valid = true;
                    return false;
                }
            }
        });

        return valid;
    },

    _formatSize: function(bytes){
        var i = -1;
        do {
            bytes = bytes / 1000;
            i++;
        } while (bytes > 999);

        return Math.max(bytes, 0.1).toFixed(1) + this._options.text.sizeSymbols[i];
    },

    _wrapCallbacks: function() {
        var self, safeCallback;

        self = this;

        safeCallback = function(name, callback, args) {
            try {
                return callback.apply(self, args);
            }
            catch (exception) {
                self.log("Caught exception in '" + name + "' callback - " + exception.message, 'error');
            }
        };

        for (var prop in this._options.callbacks) {
            (function() {
                var callbackName, callbackFunc;
                callbackName = prop;
                callbackFunc = self._options.callbacks[callbackName];
                self._options.callbacks[callbackName] = function() {
                    return safeCallback(callbackName, callbackFunc, arguments);
                };
            }());
        }
    },

    _parseFileOrBlobDataName: function(fileOrBlobData) {
        var name;

        if (qq.isFileOrInput(fileOrBlobData)) {
            if (fileOrBlobData.value) {
                // it is a file input
                // get input value and remove path to normalize
                name = fileOrBlobData.value.replace(/.*(\/|\\)/, "");
            } else {
                // fix missing properties in Safari 4 and firefox 11.0a2
                name = (fileOrBlobData.fileName !== null && fileOrBlobData.fileName !== undefined) ? fileOrBlobData.fileName : fileOrBlobData.name;
            }
        }
        else {
            name = fileOrBlobData.name;
        }

        return name;
    },

    _parseFileOrBlobDataSize: function(fileOrBlobData) {
        var size;

        if (qq.isFileOrInput(fileOrBlobData)) {
            if (fileOrBlobData.value === undefined) {
                // fix missing properties in Safari 4 and firefox 11.0a2
                size = (fileOrBlobData.fileSize !== null && fileOrBlobData.fileSize !== undefined) ? fileOrBlobData.fileSize : fileOrBlobData.size;
            }
        }
        else {
            size = fileOrBlobData.blob.size;
        }

        return size;
    },

    _getValidationDescriptor: function(fileOrBlobData) {
        var fileDescriptor = {},
            name = this._parseFileOrBlobDataName(fileOrBlobData),
            size = this._parseFileOrBlobDataSize(fileOrBlobData);

        fileDescriptor.name = name;
        if (size !== undefined) {
            fileDescriptor.size = size;
        }

        return fileDescriptor;
    },

    _getValidationDescriptors: function(files) {
        var self = this,
            fileDescriptors = [];

        qq.each(files, function(idx, file) {
            fileDescriptors.push(self._getValidationDescriptor(file));
        });

        return fileDescriptors;
    },

    _createParamsStore: function(type) {
        var paramsStore = {},
            self = this;

        return {
            setParams: function(params, id) {
                var paramsCopy = {};
                qq.extend(paramsCopy, params);
                paramsStore[id] = paramsCopy;
            },

            getParams: function(id) {
                /*jshint eqeqeq: true, eqnull: true*/
                var paramsCopy = {};

                if (id != null && paramsStore[id]) {
                    qq.extend(paramsCopy, paramsStore[id]);
                }
                else {
                    qq.extend(paramsCopy, self._options[type].params);
                }

                return paramsCopy;
            },

            remove: function(fileId) {
                return delete paramsStore[fileId];
            },

            reset: function() {
                paramsStore = {};
            }
        };
    },

    _createEndpointStore: function(type) {
        var endpointStore = {},
        self = this;

        return {
            setEndpoint: function(endpoint, id) {
                endpointStore[id] = endpoint;
            },

            getEndpoint: function(id) {
                /*jshint eqeqeq: true, eqnull: true*/
                if (id != null && endpointStore[id]) {
                    return endpointStore[id];
                }

                return self._options[type].endpoint;
            },

            remove: function(fileId) {
                return delete endpointStore[fileId];
            },

            reset: function() {
                endpointStore = {};
            }
        };
    },

    // Allows camera access on either the default or an extra button for iOS devices.
    _handleCameraAccess: function() {
        if (this._options.camera.ios && qq.ios()) {
            var acceptIosCamera = "image/*;capture=camera",
                button = this._options.camera.button,
                buttonId = button ? this._getButtonId(button) : this._defaultButtonId,
                optionRoot = buttonId ? this._extraButtonSpecs[buttonId] : this._options;

            // Camera access won't work in iOS if the `multiple` attribute is present on the file input
            optionRoot.multiple = false;

            // update the options
            if (optionRoot.validation.acceptFiles === null) {
                optionRoot.validation.acceptFiles = acceptIosCamera;
            }
            else {
                optionRoot.validation.acceptFiles += "," + acceptIosCamera;
            }

            // update the already-created button
            qq.each(this._buttons, function(idx, button) {
                if (button.getButtonId() === buttonId) {
                    button.setMultiple(optionRoot.multiple);
                    button.setAcceptFiles(optionRoot.acceptFiles);

                    return false;
                }
            });
        }
    }
};

qq.FineUploaderBasic = function(o) {
    // These options define FineUploaderBasic mode.
    this._options = {
        debug: false,
        button: null,
        multiple: true,
        maxConnections: 3,
        disableCancelForFormUploads: false,
        autoUpload: true,
        request: {
            endpoint: '/server/upload',
            params: {},
            paramsInBody: true,
            customHeaders: {},
            forceMultipart: true,
            inputName: 'qqfile',
            uuidName: 'qquuid',
            totalFileSizeName: 'qqtotalfilesize',
            filenameParam: 'qqfilename'
        },
        validation: {
            allowedExtensions: [],
            sizeLimit: 0,
            minSizeLimit: 0,
            itemLimit: 0,
            stopOnFirstInvalidFile: true,
            acceptFiles: null
        },
        callbacks: {
            onSubmit: function(id, name){},
            onSubmitted: function(id, name){},
            onComplete: function(id, name, responseJSON, maybeXhr){},
            onCancel: function(id, name){},
            onUpload: function(id, name){},
            onUploadChunk: function(id, name, chunkData){},
            onResume: function(id, fileName, chunkData){},
            onProgress: function(id, name, loaded, total){},
            onError: function(id, name, reason, maybeXhrOrXdr) {},
            onAutoRetry: function(id, name, attemptNumber) {},
            onManualRetry: function(id, name) {},
            onValidateBatch: function(fileOrBlobData) {},
            onValidate: function(fileOrBlobData) {},
            onSubmitDelete: function(id) {},
            onDelete: function(id){},
            onDeleteComplete: function(id, xhrOrXdr, isError){},
            onPasteReceived: function(blob) {},
            onStatusChange: function(id, oldStatus, newStatus) {}
        },
        messages: {
            typeError: "{file} has an invalid extension. Valid extension(s): {extensions}.",
            sizeError: "{file} is too large, maximum file size is {sizeLimit}.",
            minSizeError: "{file} is too small, minimum file size is {minSizeLimit}.",
            emptyError: "{file} is empty, please select files again without it.",
            noFilesError: "No files to upload.",
            tooManyItemsError: "Too many items ({netItems}) would be uploaded.  Item limit is {itemLimit}.",
            retryFailTooManyItems: "Retry failed - you have reached your file limit.",
            onLeave: "The files are being uploaded, if you leave now the upload will be cancelled."
        },
        retry: {
            enableAuto: false,
            maxAutoAttempts: 3,
            autoAttemptDelay: 5,
            preventRetryResponseProperty: 'preventRetry'
        },
        classes: {
            buttonHover: 'qq-upload-button-hover',
            buttonFocus: 'qq-upload-button-focus'
        },
        chunking: {
            enabled: false,
            partSize: 2000000,
            paramNames: {
                partIndex: 'qqpartindex',
                partByteOffset: 'qqpartbyteoffset',
                chunkSize: 'qqchunksize',
                totalFileSize: 'qqtotalfilesize',
                totalParts: 'qqtotalparts'
            }
        },
        resume: {
            enabled: false,
            id: null,
            cookiesExpireIn: 7, //days
            paramNames: {
                resuming: "qqresume"
            }
        },
        formatFileName: function(fileOrBlobName) {
            if (fileOrBlobName !== undefined && fileOrBlobName.length > 33) {
                fileOrBlobName = fileOrBlobName.slice(0, 19) + '...' + fileOrBlobName.slice(-14);
            }
            return fileOrBlobName;
        },
        text: {
            defaultResponseError: "Upload failure reason unknown",
            sizeSymbols: ['kB', 'MB', 'GB', 'TB', 'PB', 'EB']
        },
        deleteFile : {
            enabled: false,
            method: "DELETE",
            endpoint: '/server/upload',
            customHeaders: {},
            params: {}
        },
        cors: {
            expected: false,
            sendCredentials: false,
            allowXdr: false
        },
        blobs: {
            defaultName: 'misc_data'
        },
        paste: {
            targetElement: null,
            defaultName: 'pasted_image'
        },
        camera: {
            ios: false,

            // if ios is true: button is null means target the default button, otherwise target the button specified
            button: null
        },

        // This refers to additional upload buttons to be handled by Fine Uploader.
        // Each element is an object, containing `element` as the only required
        // property.  The `element` must be a container that will ultimately
        // contain an invisible `<input type="file">` created by Fine Uploader.
        // Optional properties of each object include `multiple`, `validation`,
        // and `folders`.
        extraButtons: []
    };

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);

    this._buttons = [];
    this._extraButtonSpecs = {};
    this._buttonIdsForFileIds = [];

    this._wrapCallbacks();
    this._disposeSupport =  new qq.DisposeSupport();

    this._storedIds = [];
    this._autoRetries = [];
    this._retryTimeouts = [];
    this._preventRetries = [];
    this._thumbnailUrls = [];

    this._netUploadedOrQueued = 0;
    this._netUploaded = 0;
    this._uploadData = this._createUploadDataTracker();

    this._paramsStore = this._createParamsStore("request");
    this._deleteFileParamsStore = this._createParamsStore("deleteFile");

    this._endpointStore = this._createEndpointStore("request");
    this._deleteFileEndpointStore = this._createEndpointStore("deleteFile");

    this._handler = this._createUploadHandler();

    this._deleteHandler = qq.DeleteFileAjaxRequestor && this._createDeleteHandler();

    if (this._options.button) {
        this._defaultButtonId = this._createUploadButton({element: this._options.button}).getButtonId();
    }

    this._generateExtraButtonSpecs();

    this._handleCameraAccess();

    if (this._options.paste.targetElement) {
        if (qq.PasteSupport) {
            this._pasteHandler = this._createPasteHandler();
        }
        else {
            qq.log("Paste support module not found", "info");
        }
    }

    this._preventLeaveInProgress();

    this._imageGenerator = qq.ImageGenerator && new qq.ImageGenerator(qq.bind(this.log, this));
};

// Define the private & public API methods.
qq.FineUploaderBasic.prototype = qq.basePublicApi;
qq.extend(qq.FineUploaderBasic.prototype, qq.basePrivateApi);

/** Generic class for sending non-upload ajax requests and handling the associated responses **/
/*globals qq, XMLHttpRequest*/
qq.AjaxRequestor = function (o) {
    "use strict";

    var log, shouldParamsBeInQueryString,
        queue = [],
        requestData = [],
        options = {
            validMethods: ['POST'],
            method: 'POST',
            contentType: "application/x-www-form-urlencoded",
            maxConnections: 3,
            customHeaders: {},
            endpointStore: {},
            paramsStore: {},
            mandatedParams: {},
            successfulResponseCodes: {
                "DELETE": [200, 202, 204],
                "POST": [200, 204]
            },
            cors: {
                expected: false,
                sendCredentials: false
            },
            log: function (str, level) {},
            onSend: function (id) {},
            onComplete: function (id, xhrOrXdr, isError) {},
            onCancel: function (id) {}
        };

    qq.extend(options, o);
    log = options.log;

        // TODO remove code duplication among all ajax requesters
    if (qq.indexOf(options.validMethods, getNormalizedMethod()) < 0) {
        throw new Error("'" + getNormalizedMethod() + "' is not a supported method for this type of request!");
    }

    // TODO remove code duplication among all ajax requesters
    function getNormalizedMethod() {
        return options.method.toUpperCase();
    }

    // [Simple methods](http://www.w3.org/TR/cors/#simple-method)
    // are defined by the W3C in the CORS spec as a list of methods that, in part,
    // make a CORS request eligible to be exempt from preflighting.
    function isSimpleMethod() {
        return qq.indexOf(["GET", "POST", "HEAD"], getNormalizedMethod()) >= 0;
    }

    // [Simple headers](http://www.w3.org/TR/cors/#simple-header)
    // are defined by the W3C in the CORS spec as a list of headers that, in part,
    // make a CORS request eligible to be exempt from preflighting.
    function containsNonSimpleHeaders(headers) {
        var containsNonSimple = false;

        qq.each(containsNonSimple, function(idx, header) {
            if (qq.indexOf(["Accept", "Accept-Language", "Content-Language", "Content-Type"], header) < 0) {
                containsNonSimple = true;
                return false;
            }
        });

        return containsNonSimple;
    }

    function isXdr(xhr) {
        //The `withCredentials` test is a commonly accepted way to determine if XHR supports CORS.
        return options.cors.expected && xhr.withCredentials === undefined;
    }

    // Returns either a new `XMLHttpRequest` or `XDomainRequest` instance.
    function getCorsAjaxTransport() {
        var xhrOrXdr;

        if (window.XMLHttpRequest || window.ActiveXObject) {
            xhrOrXdr = qq.createXhrInstance();

            if (xhrOrXdr.withCredentials === undefined) {
                xhrOrXdr = new XDomainRequest();
            }
        }

        return xhrOrXdr;
    }

    // Returns either a new XHR/XDR instance, or an existing one for the associated `File` or `Blob`.
    function getXhrOrXdr(id, dontCreateIfNotExist) {
        var xhrOrXdr = requestData[id].xhr;

        if (!xhrOrXdr && !dontCreateIfNotExist) {
            if (options.cors.expected) {
                xhrOrXdr = getCorsAjaxTransport();
            }
            else {
                xhrOrXdr = qq.createXhrInstance();
            }

            requestData[id].xhr = xhrOrXdr;
        }

        return xhrOrXdr;
    }

    // Removes element from queue, sends next request
    function dequeue(id) {
        var i = qq.indexOf(queue, id),
            max = options.maxConnections,
            nextId;

        delete requestData[id];
        queue.splice(i, 1);

        if (queue.length >= max && i < max) {
            nextId = queue[max - 1];
            sendRequest(nextId);
        }
    }

    function onComplete(id, xdrError) {
        var xhr = getXhrOrXdr(id),
            method = getNormalizedMethod(),
            isError = xdrError === true;

        dequeue(id);

        if (isError) {
            log(method + " request for " + id + " has failed", "error");
        }
        else if (!isXdr(xhr) && !isResponseSuccessful(xhr.status)) {
            isError = true;
            log(method + " request for " + id + " has failed - response code " + xhr.status, "error");
        }

        options.onComplete(id, xhr, isError);
    }

    function getParams(id) {
        var onDemandParams = requestData[id].onDemandParams,
            mandatedParams = options.mandatedParams,
            params;

        if (options.paramsStore.getParams) {
            params = options.paramsStore.getParams(id);
        }

        if (onDemandParams) {
            qq.each(onDemandParams, function (name, val) {
                params = params || {};
                params[name] = val;
            });
        }

        if (mandatedParams) {
            qq.each(mandatedParams, function (name, val) {
                params = params || {};
                params[name] = val;
            });
        }

        return params;
    }

    function sendRequest(id) {
        var xhr = getXhrOrXdr(id),
            method = getNormalizedMethod(),
            params = getParams(id),
            body = requestData[id].body,
            url;

        options.onSend(id);

        url = createUrl(id, params);

        // XDR and XHR status detection APIs differ a bit.
        if (isXdr(xhr)) {
            xhr.onload = getXdrLoadHandler(id);
            xhr.onerror = getXdrErrorHandler(id);
        }
        else {
            xhr.onreadystatechange = getXhrReadyStateChangeHandler(id);
        }

        // The last parameter is assumed to be ignored if we are actually using `XDomainRequest`.
        xhr.open(method, url, true);

        // Instruct the transport to send cookies along with the CORS request,
        // unless we are using `XDomainRequest`, which is not capable of this.
        if (options.cors.expected && options.cors.sendCredentials && !isXdr(xhr)) {
            xhr.withCredentials = true;
        }

        setHeaders(id);

        log('Sending ' + method + " request for " + id);

        if (body) {
            xhr.send(body)
        }
        else if (shouldParamsBeInQueryString || !params) {
            xhr.send();
        }
        else if (params && options.contentType.toLowerCase().indexOf("application/x-www-form-urlencoded") >= 0) {
            xhr.send(qq.obj2url(params, ""));
        }
        else if (params && options.contentType.toLowerCase().indexOf("application/json") >= 0) {
            xhr.send(JSON.stringify(params));
        }
        else {
            xhr.send(params);
        }
    }

    function createUrl(id, params) {
        var endpoint = options.endpointStore.getEndpoint(id),
            addToPath = requestData[id].addToPath;

        if (addToPath != undefined) {
            endpoint += "/" + addToPath;
        }

        if (shouldParamsBeInQueryString && params) {
            return qq.obj2url(params, endpoint);
        }
        else {
            return endpoint;
        }
    }

    // Invoked by the UA to indicate a number of possible states that describe
    // a live `XMLHttpRequest` transport.
    function getXhrReadyStateChangeHandler(id) {
        return function () {
            if (getXhrOrXdr(id).readyState === 4) {
                onComplete(id);
            }
        };
    }

    // This will be called by IE to indicate **success** for an associated
    // `XDomainRequest` transported request.
    function getXdrLoadHandler(id) {
        return function () {
            onComplete(id);
        }
    }

    // This will be called by IE to indicate **failure** for an associated
    // `XDomainRequest` transported request.
    function getXdrErrorHandler(id) {
        return function () {
            onComplete(id, true);
        }
    }

    function setHeaders(id) {
        var xhr = getXhrOrXdr(id),
            customHeaders = options.customHeaders,
            onDemandHeaders = requestData[id].additionalHeaders || {},
            method = getNormalizedMethod(),
            allHeaders = {};

        // If this is a CORS request and a simple method with simple headers are used
        // on an `XMLHttpRequest`, exclude these specific non-simple headers
        // in an attempt to prevent preflighting.  `XDomainRequest` does not support setting
        // request headers, so we will take this into account as well.
        if (isXdr(xhr)) {
            if (!options.cors.expected || (!isSimpleMethod() || containsNonSimpleHeaders(customHeaders))) {
                xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
                xhr.setRequestHeader("Cache-Control", "no-cache");
            }
        }

        // Note that we can't set the Content-Type when using this transport XDR, and it is
        // not relevant unless we will be including the params in the payload.
        if (options.contentType && (method === "POST" || method === "PUT") && !isXdr(xhr)) {
            xhr.setRequestHeader("Content-Type", options.contentType);
        }

        // `XDomainRequest` doesn't allow you to set any headers.
        if (!isXdr(xhr)) {
            qq.extend(allHeaders, customHeaders);
            qq.extend(allHeaders, onDemandHeaders);

            qq.each(allHeaders, function (name, val) {
                xhr.setRequestHeader(name, val);
            });
        }
    }

    function cancelRequest(id) {
        var xhr = getXhrOrXdr(id, true),
            method = getNormalizedMethod();

        if (xhr) {
            // The event handlers we remove/unregister is dependant on whether we are
            // using `XDomainRequest` or `XMLHttpRequest`.
            if (isXdr(xhr)) {
                xhr.onerror = null;
                xhr.onload = null;
            }
            else {
                xhr.onreadystatechange = null;
            }

            xhr.abort();
            dequeue(id);

            log('Cancelled ' + method + " for " + id);
            options.onCancel(id);

            return true;
        }

        return false;
    }

    function isResponseSuccessful(responseCode) {
        return qq.indexOf(options.successfulResponseCodes[getNormalizedMethod()], responseCode) >= 0;
    }

    shouldParamsBeInQueryString = getNormalizedMethod() === 'GET' || getNormalizedMethod() === 'DELETE';

    return {
        send: function (id, addToPath, onDemandParams, onDemandHeaders, body) {
            requestData[id] = {
                addToPath: addToPath,
                onDemandParams: onDemandParams,
                additionalHeaders: onDemandHeaders,
                body: body
            };

            var len = queue.push(id);

            // if too many active connections, wait...
            if (len <= options.maxConnections) {
                sendRequest(id);
            }
        },

        cancel: function (id) {
            return cancelRequest(id);
        },

        getMethod: function() {
            return getNormalizedMethod();
        }
    };
};

/*globals qq*/
/**
 * Base upload handler module.  Delegates to more specific handlers.
 *
 * @param o Options.  Passed along to the specific handler submodule as well.
 * @param namespace [optional] Namespace for the specific handler.
 */
qq.UploadHandler = function(o, namespace) {
    "use strict";

    var queue = [],
        options, log, handlerImpl, api;

    // Default options, can be overridden by the user
    options = {
        debug: false,
        forceMultipart: true,
        paramsInBody: false,
        paramsStore: {},
        endpointStore: {},
        filenameParam: 'qqfilename',
        cors: {
            expected: false,
            sendCredentials: false
        },
        maxConnections: 3, // maximum number of concurrent uploads
        uuidParam: 'qquuid',
        totalFileSizeParam: 'qqtotalfilesize',
        chunking: {
            enabled: false,
            partSize: 2000000, //bytes
            paramNames: {
                partIndex: 'qqpartindex',
                partByteOffset: 'qqpartbyteoffset',
                chunkSize: 'qqchunksize',
                totalParts: 'qqtotalparts',
                filename: 'qqfilename'
            }
        },
        resume: {
            enabled: false,
            id: null,
            cookiesExpireIn: 7, //days
            paramNames: {
                resuming: "qqresume"
            }
        },
        log: function(str, level) {},
        onProgress: function(id, fileName, loaded, total){},
        onComplete: function(id, fileName, response, xhr){},
        onCancel: function(id, fileName){},
        onUpload: function(id, fileName){},
        onUploadChunk: function(id, fileName, chunkData){},
        onAutoRetry: function(id, fileName, response, xhr){},
        onResume: function(id, fileName, chunkData){},
        onUuidChanged: function(id, newUuid){}

    };
    qq.extend(options, o);

    log = options.log;

    /**
     * Removes element from queue, starts upload of next
     */
    function dequeue(id) {
        var i = qq.indexOf(queue, id),
            max = options.maxConnections,
            nextId;

        if (i >= 0) {
            queue.splice(i, 1);

            if (queue.length >= max && i < max){
                nextId = queue[max-1];
                handlerImpl.upload(nextId);
            }
        }
    }

    function cancelSuccess(id) {
        log('Cancelling ' + id);
        options.paramsStore.remove(id);
        dequeue(id);
    }

    function determineHandlerImpl() {
        var handlerType = namespace ? qq[namespace] : qq,
            handlerModuleSubtype = qq.supportedFeatures.ajaxUploading ? "Xhr" : "Form";

        handlerImpl = new handlerType["UploadHandler" + handlerModuleSubtype](options, dequeue, options.onUuidChanged, log);
    }


    api = {
        /**
         * Adds file or file input to the queue
         * @returns id
         **/
        add: function(file){
            return handlerImpl.add(file);
        },
        /**
         * Sends the file identified by id
         */
        upload: function(id){
            var len = queue.push(id);

            // if too many active uploads, wait...
            if (len <= options.maxConnections){
                handlerImpl.upload(id);
                return true;
            }

            return false;
        },
        retry: function(id) {
            var i = qq.indexOf(queue, id);
            if (i >= 0) {
                return handlerImpl.upload(id, true);
            }
            else {
                return this.upload(id);
            }
        },
        /**
         * Cancels file upload by id
         */
        cancel: function(id) {
            var cancelRetVal = handlerImpl.cancel(id);

            if (qq.isPromise(cancelRetVal)) {
                cancelRetVal.then(function() {
                    cancelSuccess(id);
                });
            }
            else if (cancelRetVal !== false) {
                cancelSuccess(id);
            }
        },
        /**
         * Cancels all queued or in-progress uploads
         */
        cancelAll: function() {
            var self = this,
                queueCopy = [];

            qq.extend(queueCopy, queue);
            qq.each(queueCopy, function(idx, fileId) {
                self.cancel(fileId);
            });

            queue = [];
        },
        /**
         * Returns name of the file identified by id
         */
        getName: function(id) {
            return handlerImpl.getName(id);
        },
        // Update/change the name of the associated file.
        // This updated name should be sent as a parameter.
        setName: function(id, newName) {
            handlerImpl.setName(id, newName);
        },
        /**
         * Returns size of the file identified by id
         */
        getSize: function(id){
            if (handlerImpl.getSize) {
                return handlerImpl.getSize(id);
            }
        },
        getFile: function(id) {
            if (handlerImpl.getFile) {
                return handlerImpl.getFile(id);
            }
        },
        getInput: function(id) {
            if (handlerImpl.getInput) {
                return handlerImpl.getInput(id);
            }
        },
        reset: function() {
            log('Resetting upload handler');
            api.cancelAll();
            queue = [];
            handlerImpl.reset();
        },
        expunge: function(id) {
            return handlerImpl.expunge(id);
        },
        getUuid: function(id) {
            return handlerImpl.getUuid(id);
        },
        setUuid: function(id, newUuid) {
            return handlerImpl.setUuid(id, newUuid);
        },
        /**
         * Determine if the file exists.
         */
        isValid: function(id) {
            return handlerImpl.isValid(id);
        },
        getResumableFilesData: function() {
            if (handlerImpl.getResumableFilesData) {
                return handlerImpl.getResumableFilesData();
            }
            return [];
        },
        /**
         * This may or may not be implemented, depending on the handler.  For handlers where a third-party ID is
         * available (such as the "key" for Amazon S3), this will return that value.  Otherwise, the return value
         * will be undefined.
         *
         * @param id Internal file ID
         * @returns {*} Some identifier used by a 3rd-party service involved in the upload process
         */
        getThirdPartyFileId: function(id) {
            if (handlerImpl.getThirdPartyFileId && api.isValid(id)) {
                return handlerImpl.getThirdPartyFileId(id);
            }
        }
    };

    determineHandlerImpl();

    return api;
};

/**
 * Common APIs exposed to creators of upload via form/iframe handlers.  This is reused and possibly overridden
 * in some cases by specific form upload handlers.
 *
 * @param internalApi Object that will be filled with internal API methods
 * @param fileState An array containing objects that describe files tracked by the XHR upload handler.
 * @param isCors true if we should expect the response to come from a different origin.
 * @param inputName Name of the file input field/parameter.
 * @param onCancel Invoked when a request is handled to cancel an in-progress upload.  Invoked before the upload is actually cancelled.
 * @param onUuidChanged Callback to be invoked when the internal UUID is altered.
 * @param log Method used to send messages to the log.
 * @returns {} Various methods
 * @constructor
 */
qq.UploadHandlerFormApi = function(internalApi, fileState, isCors, inputName, onCancel, onUuidChanged, log) {
    "use strict";

    var formHandlerInstanceId = qq.getUniqueId(),
        corsMessageReceiver = new qq.WindowReceiveMessage({log: log}),
        onloadCallbacks = {},
        detachLoadEvents = {},
        postMessageCallbackTimers = {},
        publicApi;


    /**
     * Remove any trace of the file from the handler.
     *
     * @param id ID of the associated file
     */
    function expungeFile(id) {
        delete detachLoadEvents[id];
        delete fileState[id];

        // If we are dealing with CORS, we might still be waiting for a response from a loaded iframe.
        // In that case, terminate the timer waiting for a message from the loaded iframe
        // and stop listening for any more messages coming from this iframe.
        if (isCors) {
            clearTimeout(postMessageCallbackTimers[id]);
            delete postMessageCallbackTimers[id];
            corsMessageReceiver.stopReceivingMessages(id);
        }

        var iframe = document.getElementById(internalApi.getIframeName(id));
        if (iframe) {
            // To cancel request set src to something else.  We use src="javascript:false;"
            // because it doesn't trigger ie6 prompt on https
            iframe.setAttribute('src', 'java' + String.fromCharCode(115) + 'cript:false;'); //deal with "JSLint: javascript URL" warning, which apparently cannot be turned off

            qq(iframe).remove();
        }
    }

    /**
     * If we are in CORS mode, we must listen for messages (containing the server response) from the associated
     * iframe, since we cannot directly parse the content of the iframe due to cross-origin restrictions.
     *
     * @param iframe Listen for messages on this iframe.
     * @param callback Invoke this callback with the message from the iframe.
     */
    function registerPostMessageCallback(iframe, callback) {
        var iframeName = iframe.id,
            fileId = getFileIdForIframeName(iframeName),
            uuid = fileState[fileId].uuid;

        onloadCallbacks[uuid] = callback;

        // When the iframe has loaded (after the server responds to an upload request)
        // declare the attempt a failure if we don't receive a valid message shortly after the response comes in.
        detachLoadEvents[fileId] = qq(iframe).attach('load', function() {
            if (fileState[fileId].input) {
                log("Received iframe load event for CORS upload request (iframe name " + iframeName + ")");

                postMessageCallbackTimers[iframeName] = setTimeout(function() {
                    var errorMessage = "No valid message received from loaded iframe for iframe name " + iframeName;
                    log(errorMessage, "error");
                    callback({
                        error: errorMessage
                    });
                }, 1000);
            }
        });

        // Listen for messages coming from this iframe.  When a message has been received, cancel the timer
        // that declares the upload a failure if a message is not received within a reasonable amount of time.
        corsMessageReceiver.receiveMessage(iframeName, function(message) {
            log("Received the following window message: '" + message + "'");
            var fileId = getFileIdForIframeName(iframeName),
                response = internalApi.parseJsonResponse(fileId, message),
                uuid = response.uuid,
                onloadCallback;

            if (uuid && onloadCallbacks[uuid]) {
                log("Handling response for iframe name " + iframeName);
                clearTimeout(postMessageCallbackTimers[iframeName]);
                delete postMessageCallbackTimers[iframeName];

                internalApi.detachLoadEvent(iframeName);

                onloadCallback = onloadCallbacks[uuid];

                delete onloadCallbacks[uuid];
                corsMessageReceiver.stopReceivingMessages(iframeName);
                onloadCallback(response);
            }
            else if (!uuid) {
                log("'" + message + "' does not contain a UUID - ignoring.");
            }
        });
    }

    /**
     * Generates an iframe to be used as a target for upload-related form submits.  This also adds the iframe
     * to the current `document`.  Note that the iframe is hidden from view.
     *
     * @param name Name of the iframe.
     * @returns {HTMLIFrameElement} The created iframe
     */
    function initIframeForUpload(name) {
        var iframe = qq.toElement('<iframe src="javascript:false;" name="' + name + '" />');

        iframe.setAttribute('id', name);

        iframe.style.display = 'none';
        document.body.appendChild(iframe);

        return iframe;
    }

    /**
     * @param iframeName `document`-unique Name of the associated iframe
     * @returns {*} ID of the associated file
     */
    function getFileIdForIframeName(iframeName) {
        return iframeName.split("_")[0];
    }


// INTERNAL API

    qq.extend(internalApi, {
        /**
         * @param fileId ID of the associated file
         * @returns {string} The `document`-unique name of the iframe
         */
        getIframeName: function(fileId) {
            return fileId + "_" + formHandlerInstanceId;
        },

        /**
         * Creates an iframe with a specific document-unique name.
         *
         * @param id ID of the associated file
         * @returns {HTMLIFrameElement}
         */
        createIframe: function(id) {
            var iframeName = internalApi.getIframeName(id);

            return initIframeForUpload(iframeName);
        },

        /**
         * @param id ID of the associated file
         * @param innerHtmlOrMessage JSON message
         * @returns {*} The parsed response, or an empty object if the response could not be parsed
         */
        parseJsonResponse: function(id, innerHtmlOrMessage) {
            var response;

            try {
                response = qq.parseJson(innerHtmlOrMessage);

                if (response.newUuid !== undefined) {
                    publicApi.setUuid(id, response.newUuid);
                }
            }
            catch(error) {
                log('Error when attempting to parse iframe upload response (' + error.message + ')', 'error');
                response = {};
            }

            return response;
        },

        /**
         * Generates a form element and appends it to the `document`.  When the form is submitted, a specific iframe is targeted.
         * The name of the iframe is passed in as a property of the spec parameter, and must be unique in the `document`.  Note
         * that the form is hidden from view.
         *
         * @param spec An object containing various properties to be used when constructing the form.  Required properties are
         * currently: `method`, `endpoint`, `params`, `paramsInBody`, and `targetName`.
         * @returns {HTMLFormElement} The created form
         */
        initFormForUpload: function(spec) {
            var method = spec.method,
                endpoint = spec.endpoint,
                params = spec.params,
                paramsInBody = spec.paramsInBody,
                targetName = spec.targetName,
                form = qq.toElement('<form method="' + method + '" enctype="multipart/form-data"></form>'),
                url = endpoint;

            if (paramsInBody) {
                qq.obj2Inputs(params, form);
            }
            else {
                url = qq.obj2url(params, endpoint);
            }

            form.setAttribute('action', url);
            form.setAttribute('target', targetName);
            form.style.display = 'none';
            document.body.appendChild(form);

            return form;
        },

        /**
         * This function either delegates to a more specific message handler if CORS is involved,
         * or simply registers a callback when the iframe has been loaded that invokes the passed callback
         * after determining if the content of the iframe is accessible.
         *
         * @param iframe Associated iframe
         * @param callback Callback to invoke after we have determined if the iframe content is accessible.
         */
        attachLoadEvent: function(iframe, callback) {
            /*jslint eqeq: true*/
            var responseDescriptor;

            if (isCors) {
                registerPostMessageCallback(iframe, callback);
            }
            else {
                detachLoadEvents[iframe.id] = qq(iframe).attach('load', function(){
                    log('Received response for ' + iframe.id);

                    // when we remove iframe from dom
                    // the request stops, but in IE load
                    // event fires
                    if (!iframe.parentNode){
                        return;
                    }

                    try {
                        // fixing Opera 10.53
                        if (iframe.contentDocument &&
                            iframe.contentDocument.body &&
                            iframe.contentDocument.body.innerHTML == "false"){
                            // In Opera event is fired second time
                            // when body.innerHTML changed from false
                            // to server response approx. after 1 sec
                            // when we upload file with iframe
                            return;
                        }
                    }
                    catch (error) {
                        //IE may throw an "access is denied" error when attempting to access contentDocument on the iframe in some cases
                        log('Error when attempting to access iframe during handling of upload response (' + error.message + ")", 'error');
                        responseDescriptor = {success: false};
                    }

                    callback(responseDescriptor);
                });
            }
        },

        /**
         * Called when we are no longer interested in being notified when an iframe has loaded.
         *
         * @param id Associated file ID
         */
        detachLoadEvent: function(id) {
            if (detachLoadEvents[id] !== undefined) {
                detachLoadEvents[id]();
                delete detachLoadEvents[id];
            }
        }
    });


// PUBLIC API

    publicApi = {
        add: function(fileInput) {
            var id = fileState.push({input: fileInput}) - 1;

            fileInput.setAttribute('name', inputName);

            fileState[id].uuid = qq.getUniqueId();

            // remove file input from DOM
            if (fileInput.parentNode){
                qq(fileInput).remove();
            }

            return id;
        },

        getName: function(id) {
            /*jslint regexp: true*/

            if (fileState[id].newName !== undefined) {
                return fileState[id].newName;
            }
            else if (publicApi.isValid(id)) {
                // get input value and remove path to normalize
                return fileState[id].input.value.replace(/.*(\/|\\)/, "");
            }
            else {
                log(id + " is not a valid item ID.", "error");
            }
        },

        getInput: function(id) {
            return fileState[id].input;
        },

        setName: function(id, newName) {
            fileState[id].newName = newName;
        },

        isValid: function(id) {
            return fileState[id] !== undefined
                && fileState[id].input !== undefined;
        },

        reset: function() {
            fileState.length = 0;
        },

        expunge: function(id) {
            return expungeFile(id);
        },

        getUuid: function(id) {
            return fileState[id].uuid;
        },

        cancel: function(id) {
            var onCancelRetVal = onCancel(id, publicApi.getName(id));

            if (qq.isPromise(onCancelRetVal)) {
                return onCancelRetVal.then(function() {
                    publicApi.expunge(id);
                });
            }
            else if (onCancelRetVal !== false) {
                publicApi.expunge(id);
                return true;
            }

            return false;
        },

        upload: function(id) {
            // implementation-specific
        },

        setUuid: function(id, newUuid) {
            log("Server requested UUID change from '" + fileState[id].uuid + "' to '" + newUuid + "'");
            fileState[id].uuid = newUuid;
            onUuidChanged(id, newUuid);
        }
    };

    return publicApi;
};

/**
 * Common API exposed to creators of XHR handlers.  This is reused and possibly overriding in some cases by specific
 * XHR upload handlers.
 *
 * @param internalApi Object that will be filled with internal API methods
 * @param fileState An array containing objects that describe files tracked by the XHR upload handler.
 * @param chunking Properties that describe chunking option values.  Null if chunking is not enabled or possible.
 * @param onUpload Used to call the specific XHR upload handler when an upload has been request.
 * @param onCancel Invoked when a request is handled to cancel an in-progress upload.  Invoked before the upload is actually cancelled.
 * @param onUuidChanged Callback to be invoked when the internal UUID is altered.
 * @param log Method used to send messages to the log.
 * @returns Various methods
 * @constructor
 */
qq.UploadHandlerXhrApi = function(internalApi, fileState, chunking, onUpload, onCancel, onUuidChanged, log) {
    "use strict";

    var publicApi;


    function getChunk(fileOrBlob, startByte, endByte) {
        if (fileOrBlob.slice) {
            return fileOrBlob.slice(startByte, endByte);
        }
        else if (fileOrBlob.mozSlice) {
            return fileOrBlob.mozSlice(startByte, endByte);
        }
        else if (fileOrBlob.webkitSlice) {
            return fileOrBlob.webkitSlice(startByte, endByte);
        }
    }

    qq.extend(internalApi, {
        /**
         * Creates an XHR instance for this file and stores it in the fileState.
         *
         * @param id File ID
         * @returns {XMLHttpRequest}
         */
        createXhr: function(id) {
            var xhr = qq.createXhrInstance();

            fileState[id].xhr = xhr;

            return xhr;
        },

        /**
         * @param id ID of the associated file
         * @returns {number} Number of parts this file can be divided into, or undefined if chunking is not supported in this UA
         */
        getTotalChunks: function(id) {
            if (chunking) {
                var fileSize = publicApi.getSize(id),
                    chunkSize = chunking.partSize;

                return Math.ceil(fileSize / chunkSize);
            }
        },

        getChunkData: function(id, chunkIndex) {
            var chunkSize = chunking.partSize,
                fileSize = publicApi.getSize(id),
                fileOrBlob = publicApi.getFile(id),
                startBytes = chunkSize * chunkIndex,
                endBytes = startBytes+chunkSize >= fileSize ? fileSize : startBytes+chunkSize,
                totalChunks = internalApi.getTotalChunks(id);

            return {
                part: chunkIndex,
                start: startBytes,
                end: endBytes,
                count: totalChunks,
                blob: getChunk(fileOrBlob, startBytes, endBytes),
                size: endBytes - startBytes
            };
        },

        getChunkDataForCallback: function(chunkData) {
            return {
                partIndex: chunkData.part,
                startByte: chunkData.start + 1,
                endByte: chunkData.end,
                totalParts: chunkData.count
            };
        }
    });

    publicApi = {
        /**
         * Adds File or Blob to the queue
         * Returns id to use with upload, cancel
         **/
        add: function(fileOrBlobData){
            var id,
                uuid = qq.getUniqueId();

            if (qq.isFile(fileOrBlobData)) {
                id = fileState.push({file: fileOrBlobData}) - 1;
            }
            else if (qq.isBlob(fileOrBlobData.blob)) {
                id = fileState.push({blobData: fileOrBlobData}) - 1;
            }
            else {
                throw new Error('Passed obj in not a File or BlobData (in qq.UploadHandlerXhr)');
            }

            fileState[id].uuid = uuid;

            return id;
        },

        getName: function(id) {
            if (publicApi.isValid(id)) {
                var file = fileState[id].file,
                    blobData = fileState[id].blobData,
                    newName = fileState[id].newName;

                if (newName !== undefined) {
                    return newName;
                }
                else if (file) {
                    // fix missing name in Safari 4
                    //NOTE: fixed missing name firefox 11.0a2 file.fileName is actually undefined
                    return (file.fileName !== null && file.fileName !== undefined) ? file.fileName : file.name;
                }
                else {
                    return blobData.name;
                }
            }
            else {
                log(id + " is not a valid item ID.", "error");
            }
        },

        setName: function(id, newName) {
            fileState[id].newName = newName;
        },

        getSize: function(id) {
            /*jshint eqnull: true*/
            var fileOrBlob = fileState[id].file || fileState[id].blobData.blob;

            if (qq.isFileOrInput(fileOrBlob)) {
                return fileOrBlob.fileSize != null ? fileOrBlob.fileSize : fileOrBlob.size;
            }
            else {
                return fileOrBlob.size;
            }
        },

        getFile: function(id) {
            if (fileState[id]) {
                return fileState[id].file || fileState[id].blobData.blob;
            }
        },

        isValid: function(id) {
            return fileState[id] !== undefined;
        },

        reset: function() {
            fileState.length = 0;
        },

        expunge: function(id) {
            var xhr = fileState[id].xhr;

            if (xhr) {
                xhr.onreadystatechange = null;
                xhr.abort();
            }

            delete fileState[id];
        },

        getUuid: function(id) {
            return fileState[id].uuid;
        },

        /**
         * Sends the file identified by id to the server
         */
        upload: function(id, retry) {
            return onUpload(id, retry);
        },

        cancel: function(id) {
            var onCancelRetVal = onCancel(id, publicApi.getName(id));

            if (qq.isPromise(onCancelRetVal)) {
                return onCancelRetVal.then(function() {
                    publicApi.expunge(id);
                });
            }
            else if (onCancelRetVal !== false) {
                publicApi.expunge(id);
                return true;
            }

            return false;
        },

        setUuid: function(id, newUuid) {
            log("Server requested UUID change from '" + fileState[id].uuid + "' to '" + newUuid + "'");
            fileState[id].uuid = newUuid;
            onUuidChanged(id, newUuid);
        }
    };

    return publicApi;
};

qq.WindowReceiveMessage = function(o) {
    var options = {
            log: function(message, level) {}
        },
        callbackWrapperDetachers = {};

    qq.extend(options, o);

    return {
        receiveMessage : function(id, callback) {
            var onMessageCallbackWrapper = function(event) {
                    callback(event.data);
                };

            if (window.postMessage) {
                callbackWrapperDetachers[id] = qq(window).attach("message", onMessageCallbackWrapper);
            }
            else {
                log("iframe message passing not supported in this browser!", "error");
            }
        },

        stopReceivingMessages : function(id) {
            if (window.postMessage) {
                var detacher = callbackWrapperDetachers[id];
                if (detacher) {
                    detacher();
                }
            }
        }
    };
};

/**
 * Defines the public API for FineUploader mode.
 */
qq.uiPublicApi = {
    clearStoredFiles: function() {
        this._parent.prototype.clearStoredFiles.apply(this, arguments);
        this._templating.clearFiles();
    },

    addExtraDropzone: function(element){
        this._dnd && this._dnd.setupExtraDropzone(element);
    },

    removeExtraDropzone: function(element){
        if (this._dnd) {
            return this._dnd.removeDropzone(element);
        }
    },

    getItemByFileId: function(id) {
        return this._templating.getFileContainer(id);
    },

    reset: function() {
        this._parent.prototype.reset.apply(this, arguments);
        this._templating.reset();

        if (!this._options.button && this._templating.getButton()) {
            this._defaultButtonId = this._createUploadButton({element: this._templating.getButton()}).getButtonId();
        }

        if (this._dnd) {
            this._dnd.dispose();
            this._dnd = this._setupDragAndDrop();
        }

        this._totalFilesInBatch = 0;
        this._filesInBatchAddedToUi = 0;

        this._setupClickAndEditEventHandlers();
    }
};




/**
 * Defines the private (internal) API for FineUploader mode.
 */
qq.uiPrivateApi = {
    _getButton: function(buttonId) {
        var button = this._parent.prototype._getButton.apply(this, arguments);

        if (!button) {
            if (buttonId === this._defaultButtonId) {
                button = this._templating.getButton();
            }
        }

        return button;
    },

    _removeFileItem: function(fileId) {
        this._templating.removeFile(fileId);
    },

    _setupClickAndEditEventHandlers: function() {
        this._deleteRetryOrCancelClickHandler = qq.DeleteRetryOrCancelClickHandler && this._bindDeleteRetryOrCancelClickEvent();

        // A better approach would be to check specifically for focusin event support by querying the DOM API,
        // but the DOMFocusIn event is not exposed as a property, so we have to resort to UA string sniffing.
        this._focusinEventSupported = !qq.firefox();

        if (this._isEditFilenameEnabled())
        {
            this._filenameClickHandler = this._bindFilenameClickEvent();
            this._filenameInputFocusInHandler = this._bindFilenameInputFocusInEvent();
            this._filenameInputFocusHandler = this._bindFilenameInputFocusEvent();
        }
    },

    _setupDragAndDrop: function() {
        var self = this,
            dropZoneElements = this._options.dragAndDrop.extraDropzones,
            templating = this._templating,
            defaultDropZone = templating.getDropZone();

        defaultDropZone && dropZoneElements.push(defaultDropZone);

        return new qq.DragAndDrop({
            dropZoneElements: dropZoneElements,
            allowMultipleItems: this._options.multiple,
            classes: {
                dropActive: this._options.classes.dropActive
            },
            callbacks: {
                processingDroppedFiles: function() {
                    templating.showDropProcessing();
                },
                processingDroppedFilesComplete: function(files) {
                    templating.hideDropProcessing();

                    if (files) {
                        self.addFiles(files);
                    }
                },
                dropError: function(code, errorData) {
                    self._itemError(code, errorData);
                },
                dropLog: function(message, level) {
                    self.log(message, level);
                }
            }
        });
    },

    _bindDeleteRetryOrCancelClickEvent: function() {
        var self = this;

        return new qq.DeleteRetryOrCancelClickHandler({
            templating: this._templating,
            log: function(message, lvl) {
                self.log(message, lvl);
            },
            onDeleteFile: function(fileId) {
                self.deleteFile(fileId);
            },
            onCancel: function(fileId) {
                self.cancel(fileId);
            },
            onRetry: function(fileId) {
                qq(self._templating.getFileContainer(fileId)).removeClass(self._classes.retryable);
                self.retry(fileId);
            },
            onGetName: function(fileId) {
                return self.getName(fileId);
            }
        });
    },

    _isEditFilenameEnabled: function() {
        return this._templating.isEditFilenamePossible()
            && !this._options.autoUpload
            && qq.FilenameClickHandler
            && qq.FilenameInputFocusHandler
            && qq.FilenameInputFocusHandler;
    },

    _filenameEditHandler: function() {
        var self = this,
            templating = this._templating;

        return {
            templating: templating,
            log: function(message, lvl) {
                self.log(message, lvl);
            },
            onGetUploadStatus: function(fileId) {
                return self.getUploads({id: fileId}).status;
            },
            onGetName: function(fileId) {
                return self.getName(fileId);
            },
            onSetName: function(id, newName) {
                var formattedFilename = self._options.formatFileName(newName);

                templating.updateFilename(id, formattedFilename);
                self.setName(id, newName);
            },
            onEditingStatusChange: function(id, isEditing) {
                var qqInput = qq(templating.getEditInput(id)),
                    qqFileContainer = qq(templating.getFileContainer(id));

                if (isEditing) {
                    qqInput.addClass('qq-editing');
                    templating.hideFilename(id);
                    templating.hideEditIcon(id);
                }
                else {
                    qqInput.removeClass('qq-editing');
                    templating.showFilename(id);
                    templating.showEditIcon(id);
                }

                // Force IE8 and older to repaint
                qqFileContainer.addClass('qq-temp').removeClass('qq-temp');
            }
        };
    },

    _onUploadStatusChange: function(id, oldStatus, newStatus) {
        if (this._isEditFilenameEnabled()) {
            // Status for a file exists before it has been added to the DOM, so we must be careful here.
            if (this._templating.getFileContainer(id) && newStatus !== qq.status.SUBMITTED) {
                this._templating.markFilenameEditable(id);
                this._templating.hideEditIcon(id);
            }
        }
    },

    _bindFilenameInputFocusInEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameInputFocusInHandler(spec);
    },

    _bindFilenameInputFocusEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameInputFocusHandler(spec);
    },

    _bindFilenameClickEvent: function() {
        var spec = qq.extend({}, this._filenameEditHandler());

        return new qq.FilenameClickHandler(spec);
    },

    _storeForLater: function(id) {
        this._parent.prototype._storeForLater.apply(this, arguments);
        this._templating.hideSpinner(id);
    },

    _onSubmit: function(id, name) {
        this._parent.prototype._onSubmit.apply(this, arguments);
        this._addToList(id, name);
    },

    // The file item has been added to the DOM.
    _onSubmitted: function(id) {
        // If the edit filename feature is enabled, mark the filename element as "editable" and the associated edit icon
        if (this._isEditFilenameEnabled()) {
            this._templating.markFilenameEditable(id);
            this._templating.showEditIcon(id);

            // If the focusin event is not supported, we must add a focus handler to the newly create edit filename text input
            if (!this._focusinEventSupported) {
                this._filenameInputFocusHandler.addHandler(this._templating.getEditInput(id));
            }
        }
    },

    // Update the progress bar & percentage as the file is uploaded
    _onProgress: function(id, name, loaded, total){
        this._parent.prototype._onProgress.apply(this, arguments);

        this._templating.updateProgress(id, loaded, total);

        if (loaded === total) {
            this._templating.hideCancel(id);

            this._templating.setStatusText(id, this._options.text.waitingForResponse);

            // If last byte was sent, display total file size
            this._displayFileSize(id);
        }
        else {
            // If still uploading, display percentage - total size is actually the total request(s) size
            this._displayFileSize(id, loaded, total);
        }
    },

    _onComplete: function(id, name, result, xhr) {
        var parentRetVal = this._parent.prototype._onComplete.apply(this, arguments),
            templating = this._templating,
            self = this;

        function completeUpload(result) {
            templating.setStatusText(id);

            qq(templating.getFileContainer(id)).removeClass(self._classes.retrying);
            templating.hideProgress(id);

            if (!self._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
                templating.hideCancel(id);
            }
            templating.hideSpinner(id);

            if (result.success) {
                if (self._isDeletePossible()) {
                    templating.showDelete(id);
                }

                qq(templating.getFileContainer(id)).addClass(self._classes.success);

                self._maybeUpdateThumbnail(id);
            }
            else {
                qq(templating.getFileContainer(id)).addClass(self._classes.fail);

                if (self._templating.isRetryPossible() && !self._preventRetries[id]) {
                    qq(templating.getFileContainer(id)).addClass(self._classes.retryable);
                }
                self._controlFailureTextDisplay(id, result);
            }
        }

        // The parent may need to perform some async operation before we can accurately determine the status of the upload.
        if (qq.isPromise(parentRetVal)) {
            parentRetVal.done(function(newResult) {
                completeUpload(newResult);
            });

        }
        else {
            completeUpload(result);
        }

        return parentRetVal;
    },

    _onUpload: function(id, name){
        var parentRetVal = this._parent.prototype._onUpload.apply(this, arguments);

        this._templating.showSpinner(id);

        return parentRetVal;
    },

    _onCancel: function(id, name) {
        this._parent.prototype._onCancel.apply(this, arguments);
        this._removeFileItem(id);
    },

    _onBeforeAutoRetry: function(id) {
        var retryNumForDisplay, maxAuto, retryNote;

        this._parent.prototype._onBeforeAutoRetry.apply(this, arguments);

        this._showCancelLink(id);
        this._templating.hideProgress(id);

        if (this._options.retry.showAutoRetryNote) {
            retryNumForDisplay = this._autoRetries[id] + 1;
            maxAuto = this._options.retry.maxAutoAttempts;

            retryNote = this._options.retry.autoRetryNote.replace(/\{retryNum\}/g, retryNumForDisplay);
            retryNote = retryNote.replace(/\{maxAuto\}/g, maxAuto);

            this._templating.setStatusText(id, retryNote);
            qq(this._templating.getFileContainer(id)).addClass(this._classes.retrying);
        }
    },

    //return false if we should not attempt the requested retry
    _onBeforeManualRetry: function(id) {
        if (this._parent.prototype._onBeforeManualRetry.apply(this, arguments)) {
            this._templating.resetProgress(id);
            qq(this._templating.getFileContainer(id)).removeClass(this._classes.fail);
            this._templating.setStatusText(id);
            this._templating.showSpinner(id);
            this._showCancelLink(id);
            return true;
        }
        else {
            qq(this._templating.getFileContainer(id)).addClass(this._classes.retryable);
            return false;
        }
    },

    _onSubmitDelete: function(id) {
        var onSuccessCallback = qq.bind(this._onSubmitDeleteSuccess, this);

        this._parent.prototype._onSubmitDelete.call(this, id, onSuccessCallback);
    },

    _onSubmitDeleteSuccess: function(id, uuid, additionalMandatedParams) {
        if (this._options.deleteFile.forceConfirm) {
            this._showDeleteConfirm.apply(this, arguments);
        }
        else {
            this._sendDeleteRequest.apply(this, arguments);
        }
    },

    _onDeleteComplete: function(id, xhr, isError) {
        this._parent.prototype._onDeleteComplete.apply(this, arguments);

        this._templating.hideSpinner(id);

        if (isError) {
            this._templating.setStatusText(id, this._options.deleteFile.deletingFailedText);
            this._templating.showDelete(id);
        }
        else {
            this._removeFileItem(id);
        }
    },

    _sendDeleteRequest: function(id, uuid, additionalMandatedParams) {
        this._templating.hideDelete(id);
        this._templating.showSpinner(id);
        this._templating.setStatusText(id, this._options.deleteFile.deletingStatusText);
        this._deleteHandler.sendDelete.apply(this, arguments);
    },

    _showDeleteConfirm: function(id, uuid, mandatedParams) {
        var fileName = this._handler.getName(id),
            confirmMessage = this._options.deleteFile.confirmMessage.replace(/\{filename\}/g, fileName),
            uuid = this.getUuid(id),
            deleteRequestArgs = arguments,
            self = this,
            retVal;

        retVal = this._options.showConfirm(confirmMessage);

        if (qq.isPromise(retVal)) {
            retVal.then(function () {
                self._sendDeleteRequest.apply(self, deleteRequestArgs);
            });
        }
        else if (retVal !== false) {
            self._sendDeleteRequest.apply(self, deleteRequestArgs);
        }
    },

    _addToList: function(id, name) {
        var prependData,
            prependIndex = 0;

        if (this._options.disableCancelForFormUploads && !qq.supportedFeatures.ajaxUploading) {
            this._templating.disableCancel();
        }

        if (this._options.display.prependFiles) {
            if (this._totalFilesInBatch > 1 && this._filesInBatchAddedToUi > 0) {
                prependIndex = this._filesInBatchAddedToUi - 1;
            }

            prependData = {
                index: prependIndex
            }
        }

        if (!this._options.multiple) {
            this._handler.cancelAll();
            this._clearList();
        }

        this._templating.addFile(id, this._options.formatFileName(name), prependData);
        this._templating.generatePreview(id, this.getFile(id));

        this._filesInBatchAddedToUi += 1;

        if (this._options.display.fileSizeOnSubmit && qq.supportedFeatures.ajaxUploading) {
            this._displayFileSize(id);
        }
    },

    _clearList: function(){
        this._templating.clearFiles();
        this.clearStoredFiles();
    },

    _displayFileSize: function(id, loadedSize, totalSize) {
        var size = this.getSize(id),
            sizeForDisplay = this._formatSize(size);

        if (loadedSize !== undefined && totalSize !== undefined) {
            sizeForDisplay = this._formatProgress(loadedSize, totalSize);
        }

        this._templating.updateSize(id, sizeForDisplay);
    },

    _formatProgress: function (uploadedSize, totalSize) {
        var message = this._options.text.formatProgress;
        function r(name, replacement) { message = message.replace(name, replacement); }

        r('{percent}', Math.round(uploadedSize / totalSize * 100));
        r('{total_size}', this._formatSize(totalSize));
        return message;
    },

    _controlFailureTextDisplay: function(id, response) {
        var mode, maxChars, responseProperty, failureReason, shortFailureReason;

        mode = this._options.failedUploadTextDisplay.mode;
        maxChars = this._options.failedUploadTextDisplay.maxChars;
        responseProperty = this._options.failedUploadTextDisplay.responseProperty;

        if (mode === 'custom') {
            failureReason = response[responseProperty];
            if (failureReason) {
                if (failureReason.length > maxChars) {
                    shortFailureReason = failureReason.substring(0, maxChars) + '...';
                }
            }
            else {
                failureReason = this._options.text.failUpload;
                this.log("'" + responseProperty + "' is not a valid property on the server response.", 'warn');
            }

            this._templating.setStatusText(id, shortFailureReason || failureReason);

            if (this._options.failedUploadTextDisplay.enableTooltip) {
                this._showTooltip(id, failureReason);
            }
        }
        else if (mode === 'default') {
            this._templating.setStatusText(id, this._options.text.failUpload);
        }
        else if (mode !== 'none') {
            this.log("failedUploadTextDisplay.mode value of '" + mode + "' is not valid", 'warn');
        }
    },

    _showTooltip: function(id, text) {
        this._templating.getFileContainer(id).title = text;
    },

    _showCancelLink: function(id) {
        if (!this._options.disableCancelForFormUploads || qq.supportedFeatures.ajaxUploading) {
            this._templating.showCancel(id);
        }
    },

    _itemError: function(code, name, item) {
        var message = this._parent.prototype._itemError.apply(this, arguments);
        this._options.showMessage(message);
    },

    _batchError: function(message) {
        this._parent.prototype._batchError.apply(this, arguments);
        this._options.showMessage(message);
    },

    _setupPastePrompt: function() {
        var self = this;

        this._options.callbacks.onPasteReceived = function() {
            var message = self._options.paste.namePromptMessage,
                defaultVal = self._options.paste.defaultName;

            return self._options.showPrompt(message, defaultVal);
        };
    },

    _fileOrBlobRejected: function(id, name) {
        this._totalFilesInBatch -= 1;
        this._parent.prototype._fileOrBlobRejected.apply(this, arguments);
    },

    _prepareItemsForUpload: function(items, params, endpoint) {
        this._totalFilesInBatch = items.length;
        this._filesInBatchAddedToUi = 0;
        this._parent.prototype._prepareItemsForUpload.apply(this, arguments);
    },

    _maybeUpdateThumbnail: function(fileId) {
        var thumbnailUrl = this._thumbnailUrls[fileId];

        this._templating.updateThumbnail(fileId, thumbnailUrl);
    }
};

/**
 * This defines FineUploader mode, which is a default UI w/ drag & drop uploading.
 */
qq.FineUploader = function(o, namespace) {
    // By default this should inherit instance data from FineUploaderBasic, but this can be overridden
    // if the (internal) caller defines a different parent.  The parent is also used by
    // the private and public API functions that need to delegate to a parent function.
    this._parent = namespace ? qq[namespace].FineUploaderBasic : qq.FineUploaderBasic;
    this._parent.apply(this, arguments);

    // Options provided by FineUploader mode
    qq.extend(this._options, {
        element: null,

        button: null,

        listElement: null,

        dragAndDrop: {
            extraDropzones: []
        },

        text: {
            formatProgress: "{percent}% of {total_size}",
            failUpload: "Upload failed",
            waitingForResponse: "Processing..."
        },

        template: "qq-template",

        classes: {
            retrying: 'qq-upload-retrying',
            retryable: 'qq-upload-retryable',
            success: 'qq-upload-success',
            fail: 'qq-upload-fail',
            editable: 'qq-editable',
            hide: "qq-hide",
            dropActive: 'qq-upload-drop-area-active'
        },

        failedUploadTextDisplay: {
            mode: 'default', //default, custom, or none
            maxChars: 50,
            responseProperty: 'error',
            enableTooltip: true
        },

        messages: {
            tooManyFilesError: "You may only drop one file",
            unsupportedBrowser: "Unrecoverable error - this browser does not permit file uploading of any kind."
        },

        retry: {
            showAutoRetryNote: true,
            autoRetryNote: "Retrying {retryNum}/{maxAuto}..."
        },

        deleteFile: {
            forceConfirm: false,
            confirmMessage: "Are you sure you want to delete {filename}?",
            deletingStatusText: "Deleting...",
            deletingFailedText: "Delete failed"

        },

        display: {
            fileSizeOnSubmit: false,
            prependFiles: false
        },

        paste: {
            promptForName: false,
            namePromptMessage: "Please name this image"
        },

        thumbnails: {
            placeholders: {
                waitUntilResponse: false,
                notAvailablePath: null,
                waitingPath: null
            }
        },

        showMessage: function(message){
            setTimeout(function() {
                window.alert(message);
            }, 0);
        },

        showConfirm: function(message) {
            return window.confirm(message);
        },

        showPrompt: function(message, defaultValue) {
            return window.prompt(message, defaultValue);
        }
    }, true);

    // Replace any default options with user defined ones
    qq.extend(this._options, o, true);

    this._templating = new qq.Templating({
        log: qq.bind(this.log, this),
        templateIdOrEl: this._options.template,
        containerEl: this._options.element,
        fileContainerEl: this._options.listElement,
        button: this._options.button,
        imageGenerator: this._imageGenerator,
        classes: {
            hide: this._options.classes.hide,
            editable: this._options.classes.editable
        },
        placeholders: {
            waitUntilUpdate: this._options.thumbnails.placeholders.waitUntilResponse,
            thumbnailNotAvailable: this._options.thumbnails.placeholders.notAvailablePath,
            waitingForThumbnail: this._options.thumbnails.placeholders.waitingPath
        }
    });

    if (!qq.supportedFeatures.uploading || (this._options.cors.expected && !qq.supportedFeatures.uploadCors)) {
        this._templating.renderFailure(this._options.messages.unsupportedBrowser);
    }
    else {
        this._wrapCallbacks();

        this._templating.render();

        this._classes = this._options.classes;

        if (!this._options.button && this._templating.getButton()) {
            this._defaultButtonId = this._createUploadButton({element: this._templating.getButton()}).getButtonId();
        }

        this._setupClickAndEditEventHandlers();

        if (qq.DragAndDrop && qq.supportedFeatures.fileDrop) {
            this._dnd = this._setupDragAndDrop();
        }

        if (this._options.paste.targetElement && this._options.paste.promptForName) {
            if (qq.PasteSupport) {
                this._setupPastePrompt();
            }
            else {
                qq.log("Paste support module not found.", "info");
            }
        }

        this._totalFilesInBatch = 0;
        this._filesInBatchAddedToUi = 0;
    }
};

// Inherit the base public & private API methods
qq.extend(qq.FineUploader.prototype, qq.basePublicApi);
qq.extend(qq.FineUploader.prototype, qq.basePrivateApi);

// Add the FineUploader/default UI public & private UI methods, which may override some base methods.
qq.extend(qq.FineUploader.prototype, qq.uiPublicApi);
qq.extend(qq.FineUploader.prototype, qq.uiPrivateApi);

/**
 * Module responsible for rendering all Fine Uploader UI templates.  This module also asserts at least
 * a limited amount of control over the template elements after they are added to the DOM.
 * Wherever possible, this module asserts total control over template elements present in the DOM.
 *
 * @param spec Specification object used to control various templating behaviors
 * @returns various API methods
 * @constructor
 */
qq.Templating = function(spec) {
    "use strict";

    var FILE_ID_ATTR = "qq-file-id",
        FILE_CLASS_PREFIX = "qq-file-id-",
        THUMBNAIL_MAX_SIZE_ATTR = "qq-max-size",
        PREVIEW_GENERATED_ATTR = "qq-preview-generated",
        THUMBNAIL_SERVER_SCALE_ATTR = "qq-server-scale",
        // This variable is duplicated in the DnD module since it can function as a standalone as well
        HIDE_DROPZONE_ATTR = "qq-hide-dropzone",
        isCancelDisabled = false,
        thumbnailMaxSize = -1,
        options = {
            log: null,
            templateIdOrEl: "qq-template",
            containerEl: null,
            fileContainerEl: null,
            button: null,
            imageGenerator: null,
            classes: {
                hide: "qq-hide",
                editable: "qq-editable"
            },
            placeholders: {
                waitUntilUpdate: false,
                thumbnailNotAvailable: null,
                waitingForThumbnail: null
            }
        },
        selectorClasses = {
            button: 'qq-upload-button-selector',
            drop: 'qq-upload-drop-area-selector',
            list: 'qq-upload-list-selector',
            progressBarContainer: "qq-progress-bar-container-selector",
            progressBar: 'qq-progress-bar-selector',
            file: 'qq-upload-file-selector',
            spinner: 'qq-upload-spinner-selector',
            size: 'qq-upload-size-selector',
            cancel: 'qq-upload-cancel-selector',
            deleteButton: 'qq-upload-delete-selector',
            retry: 'qq-upload-retry-selector',
            statusText: 'qq-upload-status-text-selector',
            editFilenameInput: 'qq-edit-filename-selector',
            editNameIcon: 'qq-edit-filename-icon-selector',
            dropProcessing: 'qq-drop-processing-selector',
            dropProcessingSpinner: 'qq-drop-processing-spinner-selector',
            thumbnail: 'qq-thumbnail-selector'
        },
        log,
        api,
        isEditElementsExist,
        isRetryElementExist,
        templateHtml,
        container,
        fileList,
        showThumbnails,
        serverScale,
        cachedThumbnailNotAvailableImg,
        cachedWaitingForThumbnailImg;

    /**
     * Grabs the HTML from the script tag holding the template markup.  This function will also adjust
     * some internally-tracked state variables based on the contents of the template.
     * The template is filtered so that irrelevant elements (such as the drop zone if DnD is not supported)
     * are omitted from the DOM.  Useful errors will be thrown if the template cannot be parsed.
     *
     * @returns {{template: *, fileTemplate: *}} HTML for the top-level file items templates
     */
    function parseAndGetTemplate() {
        var scriptEl,
            scriptHtml,
            fileListNode,
            tempTemplateEl,
            fileListHtml,
            defaultButton,
            dropArea,
            thumbnail,
            dropProcessing;

        log("Parsing template");

        if (options.templateIdOrEl == null) {
            throw new Error("You MUST specify either a template element or ID!");
        }

        // Grab the contents of the script tag holding the template.
        if (qq.isString(options.templateIdOrEl)) {
            scriptEl = document.getElementById(options.templateIdOrEl);

            if (scriptEl === null) {
                throw new Error(qq.format("Cannot find template script at ID '{}'!", options.templateIdOrEl));
            }

            scriptHtml = scriptEl.innerHTML;
        }
        else {
            if (options.templateIdOrEl.innerHTML === undefined) {
                throw new Error("You have specified an invalid value for the template option!  " +
                    "It must be an ID or an Element.");
            }

            scriptHtml = options.templateIdOrEl.innerHTML;
        }

        scriptHtml = qq.trimStr(scriptHtml);
        tempTemplateEl = document.createElement("div");
        tempTemplateEl.appendChild(qq.toElement(scriptHtml));

        // Don't include the default template button in the DOM
        // if an alternate button container has been specified.
        if (options.button) {
            defaultButton = qq(tempTemplateEl).getByClass(selectorClasses.button)[0];
            if (defaultButton) {
                qq(defaultButton).remove();
            }
        }

        // Omit the drop processing element from the DOM if DnD is not supported by the UA.
        // NOTE: We are consciously not removing the drop zone if the UA doesn't support DnD
        // to support layouts where the drop zone is also a container for visible elements,
        // such as the file list.
        if (!qq.DragAndDrop || !qq.supportedFeatures.fileDrop) {
            dropProcessing = qq(tempTemplateEl).getByClass(selectorClasses.dropProcessing)[0];
            if (dropProcessing) {
                qq(dropProcessing).remove();
            }

        }

        dropArea = qq(tempTemplateEl).getByClass(selectorClasses.drop)[0];

        // If DnD is not available then remove
        // it from the DOM as well.
        if (dropArea && !qq.DragAndDrop) {
            qq.log("DnD module unavailable.", "info");
            qq(dropArea).remove();
        }

        // If there is a drop area defined in the template, and the current UA doesn't support DnD,
        // and the drop area is marked as "hide before enter", ensure it is hidden as the DnD module
        // will not do this (since we will not be loading the DnD module)
        if (dropArea
            && !qq.supportedFeatures.fileDrop
            && qq(dropArea).hasAttribute(HIDE_DROPZONE_ATTR)) {

            qq(dropArea).css({
                display: "none"
            });
        }

        // Ensure the `showThumbnails` flag is only set if the thumbnail element
        // is present in the template AND the current UA is capable of generating client-side previews.
        thumbnail = qq(tempTemplateEl).getByClass(selectorClasses.thumbnail)[0];
        if (!showThumbnails) {
            thumbnail && qq(thumbnail).remove();
        }
        else if (thumbnail) {
            thumbnailMaxSize = parseInt(thumbnail.getAttribute(THUMBNAIL_MAX_SIZE_ATTR));
            // Only enforce max size if the attr value is non-zero
            thumbnailMaxSize = thumbnailMaxSize > 0 ? thumbnailMaxSize : null;

            serverScale = qq(thumbnail).hasAttribute(THUMBNAIL_SERVER_SCALE_ATTR);
        }
        showThumbnails = showThumbnails && thumbnail;

        isEditElementsExist = qq(tempTemplateEl).getByClass(selectorClasses.editFilenameInput).length > 0;
        isRetryElementExist = qq(tempTemplateEl).getByClass(selectorClasses.retry).length > 0;

        fileListNode = qq(tempTemplateEl).getByClass(selectorClasses.list)[0];
        if (fileListNode == null) {
            throw new Error("Could not find the file list container in the template!");
        }

        fileListHtml = fileListNode.innerHTML;
        fileListNode.innerHTML = "";

       log("Template parsing complete");

        return {
            template: qq.trimStr(tempTemplateEl.innerHTML),
            fileTemplate: qq.trimStr(fileListHtml)
        }
    }

    function getFile(id) {
        return qq(fileList).getByClass(FILE_CLASS_PREFIX + id)[0];
    }

    function getTemplateEl(context, cssClass) {
        return qq(context).getByClass(cssClass)[0];
    }

    function prependFile(el, index) {
        var parentEl = fileList,
            beforeEl = parentEl.firstChild;

        if (index > 0) {
            beforeEl = qq(parentEl).children()[index].nextSibling;

        }

        parentEl.insertBefore(el, beforeEl);
    }

    function getCancel(id) {
        return getTemplateEl(getFile(id), selectorClasses.cancel);
    }

    function getProgress(id) {
        return getTemplateEl(getFile(id), selectorClasses.progressBarContainer) ||
            getTemplateEl(getFile(id), selectorClasses.progressBar);
    }

    function getSpinner(id) {
        return getTemplateEl(getFile(id), selectorClasses.spinner);
    }

    function getEditIcon(id) {
        return getTemplateEl(getFile(id), selectorClasses.editNameIcon);
    }

    function getSize(id) {
        return getTemplateEl(getFile(id), selectorClasses.size);
    }

    function getDelete(id) {
        return getTemplateEl(getFile(id), selectorClasses.deleteButton);
    }

    function getRetry(id) {
        return getTemplateEl(getFile(id), selectorClasses.retry);
    }

    function getFilename(id) {
        return getTemplateEl(getFile(id), selectorClasses.file);
    }

    function getDropProcessing() {
        return getTemplateEl(container, selectorClasses.dropProcessing);
    }

    function getThumbnail(id) {
        return showThumbnails && getTemplateEl(getFile(id), selectorClasses.thumbnail);
    }

    function hide(el) {
        el && qq(el).addClass(options.classes.hide);
    }

    function show(el) {
        el && qq(el).removeClass(options.classes.hide);
    }

    function setProgressBarWidth(id, percent) {
        var bar = getProgress(id);

        if (bar && !qq(bar).hasClass(selectorClasses.progressBar)) {
            bar = qq(bar).getByClass(selectorClasses.progressBar)[0];
        }

        bar && qq(bar).css({width: percent + '%'});
    }

    // During initialization of the templating module we should cache any
    // placeholder images so we can quickly swap them into the file list on demand.
    // Any placeholder images that cannot be loaded/found are simply ignored.
    function cacheThumbnailPlaceholders() {
        var notAvailableUrl =  options.placeholders.thumbnailNotAvailable,
            waitingUrl = options.placeholders.waitingForThumbnail,
            spec = {
                maxSize: thumbnailMaxSize,
                scale: serverScale
            };

        if (showThumbnails) {
            if (notAvailableUrl) {
                options.imageGenerator.generate(notAvailableUrl, new Image(), spec).then(
                    function(updatedImg) {
                        cachedThumbnailNotAvailableImg = updatedImg;
                    },
                    function() {
                        log("Problem loading 'not available' placeholder image at " + notAvailableUrl, "error");
                    }
                );
            }

            if (waitingUrl) {
                options.imageGenerator.generate(waitingUrl, new Image(), spec).then(
                    function(updatedImg) {
                        cachedWaitingForThumbnailImg = updatedImg;
                    },
                    function() {
                        log("Problem loading 'waiting for thumbnail' placeholder image at " + waitingUrl, "error");
                    }
                );
            }
        }
    }

    // Displays a "waiting for thumbnail" type placeholder image
    // iff we were able to load it during initialization of the templating module.
    function displayWaitingImg(thumbnail) {
        if (cachedWaitingForThumbnailImg) {
            maybeScalePlaceholderViaCss(cachedWaitingForThumbnailImg, thumbnail);
            thumbnail.src = cachedWaitingForThumbnailImg.src;
            show(thumbnail);
        }
        // In some browsers (such as IE9 and older) an img w/out a src attribute
        // are displayed as "broken" images, so we sohuld just hide the img tag
        // if we aren't going to display the "waiting" placeholder.
        else {
            hide(thumbnail);
        }
    }

    // Displays a "thumbnail not available" type placeholder image
    // iff we were able to load this placeholder during initialization
    // of the templating module AND a valid preview does not already exist in the thumbnail element.
    function displayNotAvailableImg(thumbnail) {
        if (cachedThumbnailNotAvailableImg && !hasValidPreview(thumbnail)) {
            maybeScalePlaceholderViaCss(cachedThumbnailNotAvailableImg, thumbnail);
            thumbnail.src = cachedThumbnailNotAvailableImg.src;
            show(thumbnail);
        }
    }

    // Ensures a placeholder image does not exceed any max size specified
    // via `style` attribute properties iff <canvas> was not used to scale
    // the placeholder AND the target <img> doesn't already have these `style` attribute properties set.
    function maybeScalePlaceholderViaCss(placeholder, thumbnail) {
        var maxWidth = placeholder.style.maxWidth,
            maxHeight = placeholder.style.maxHeight;

        if (maxHeight && maxWidth && !thumbnail.style.maxWidth && !thumbnail.style.maxHeight) {
            qq(thumbnail).css({
                maxWidth: maxWidth,
                maxHeight: maxHeight
            });
        }
    }

    // Allows us to determine if a thumbnail element has already received a valid preview.
    function hasValidPreview(thumbnail) {
        return qq(thumbnail).hasAttribute(PREVIEW_GENERATED_ATTR);
    }


    qq.extend(options, spec);
    log = options.log;

    container = options.containerEl;
    showThumbnails = options.imageGenerator !== undefined;
    templateHtml = parseAndGetTemplate();

    cacheThumbnailPlaceholders();

    api = {
        render: function() {
            log("Rendering template in DOM.");

            container.innerHTML = templateHtml.template;
            hide(getDropProcessing());
            fileList = options.fileContainerEl || getTemplateEl(container, selectorClasses.list)

            log("Template rendering complete");
        },

        renderFailure: function(message) {
            var cantRenderEl = qq.toElement(message);
            container.innerHTML = "";
            container.appendChild(cantRenderEl);
        },

        reset: function() {
            api.render();
        },

        clearFiles: function() {
            fileList.innerHTML = "";
        },

        disableCancel: function() {
            isCancelDisabled = true;
        },

        addFile: function(id, name, prependInfo) {
            var fileEl = qq.toElement(templateHtml.fileTemplate),
                fileNameEl = getTemplateEl(fileEl, selectorClasses.file);

            qq(fileEl).addClass(FILE_CLASS_PREFIX + id);
            fileNameEl && qq(fileNameEl).setText(name);
            fileEl.setAttribute(FILE_ID_ATTR, id);

            if (prependInfo) {
                prependFile(fileEl, prependInfo.index);
            }
            else {
                fileList.appendChild(fileEl);
            }

            hide(getProgress(id));
            hide(getSize(id));
            hide(getDelete(id));
            hide(getRetry(id));

            if (isCancelDisabled) {
                api.hideCancel(id);
            }
        },

        removeFile: function(id) {
            qq(getFile(id)).remove();
        },

        getFileId: function(el) {
            var currentNode = el;

            while (currentNode.getAttribute(FILE_ID_ATTR) == null) {
                currentNode = currentNode.parentNode;
            }

            return parseInt(currentNode.getAttribute(FILE_ID_ATTR));
        },

        getFileList: function() {
            return fileList;
        },

        markFilenameEditable: function(id) {
            var filename = getFilename(id);

            filename && qq(filename).addClass(options.classes.editable);
        },

        updateFilename: function(id, name) {
            var filename = getFilename(id);

            filename && qq(filename).setText(name);
        },

        hideFilename: function(id) {
            hide(getFilename(id));
        },

        showFilename: function(id) {
            show(getFilename(id));
        },

        isFileName: function(el) {
            return qq(el).hasClass(selectorClasses.file);
        },

        getButton: function() {
            return options.button || getTemplateEl(container, selectorClasses.button);
        },

        hideDropProcessing: function() {
            hide(getDropProcessing());
        },

        showDropProcessing: function() {
            show(getDropProcessing());
        },

        getDropZone: function() {
            return getTemplateEl(container, selectorClasses.drop);
        },

        isEditFilenamePossible: function() {
            return isEditElementsExist;
        },

        isRetryPossible: function() {
            return isRetryElementExist;
        },

        getFileContainer: function(id) {
            return getFile(id);
        },

        showEditIcon: function(id) {
            var icon = getEditIcon(id);

            icon && qq(icon).addClass(options.classes.editable);
        },

        hideEditIcon: function(id) {
            var icon = getEditIcon(id);

            icon && qq(icon).removeClass(options.classes.editable);
        },

        isEditIcon: function(el) {
            return qq(el).hasClass(selectorClasses.editNameIcon);
        },

        getEditInput: function(id) {
            return getTemplateEl(getFile(id), selectorClasses.editFilenameInput);
        },

        isEditInput: function(el) {
            return qq(el).hasClass(selectorClasses.editFilenameInput);
        },

        updateProgress: function(id, loaded, total) {
            var bar = getProgress(id),
                percent;

            if (bar) {
                percent = Math.round(loaded / total * 100);

                if (loaded === total) {
                    hide(bar);
                }
                else {
                    show(bar);
                }

                setProgressBarWidth(id, percent);
            }
        },

        hideProgress: function(id) {
            var bar = getProgress(id);

            bar && hide(bar);
        },

        resetProgress: function(id) {
            setProgressBarWidth(id, 0);
        },

        showCancel: function(id) {
            if (!isCancelDisabled) {
                var cancel = getCancel(id);

                cancel && qq(cancel).removeClass(options.classes.hide);
            }
        },

        hideCancel: function(id) {
            hide(getCancel(id));
        },

        isCancel: function(el)  {
            return qq(el).hasClass(selectorClasses.cancel);
        },

        showDelete: function(id) {
            show(getDelete(id));
        },

        hideDelete: function(id) {
            hide(getDelete(id));
        },

        isDelete: function(el) {
            return qq(el).hasClass(selectorClasses.deleteButton);
        },

        isRetry: function(el) {
            return qq(el).hasClass(selectorClasses.retry);
        },

        updateSize: function(id, text) {
            var size = getSize(id);

            if (size) {
                show(size);
                qq(size).setText(text);
            }
        },

        setStatusText: function(id, text) {
            var textEl = getTemplateEl(getFile(id), selectorClasses.statusText);

            if (textEl) {
                if (text == null) {
                    qq(textEl).clearText();
                }
                else {
                    qq(textEl).setText(text);
                }
            }
        },

        hideSpinner: function(id) {
            hide(getSpinner(id));
        },

        showSpinner: function(id) {
            show(getSpinner(id));
        },

        generatePreview: function(id, fileOrBlob) {
            var thumbnail = getThumbnail(id),
                spec = {
                    maxSize: thumbnailMaxSize,
                    scale: true,
                    orient: true
                };

            if (qq.supportedFeatures.imagePreviews) {
                if (thumbnail) {
                    displayWaitingImg(thumbnail);
                    return options.imageGenerator.generate(fileOrBlob, thumbnail, spec).then(
                        function() {
                            thumbnail.setAttribute(PREVIEW_GENERATED_ATTR, "true");
                            show(thumbnail);
                        },
                        function() {
                            // Display the "not available" placeholder img only if we are
                            // not expecting a thumbnail at a later point, such as in a server response.
                            if (!options.placeholders.waitUntilUpdate) {
                                displayNotAvailableImg(thumbnail);
                            }
                        });
                }
            }
            else if (thumbnail) {
                displayWaitingImg(thumbnail);
            }
        },

        updateThumbnail: function(id, thumbnailUrl) {
            var thumbnail = getThumbnail(id),
                spec = {
                    maxSize: thumbnailMaxSize,
                    scale: serverScale
                };

            if (thumbnail) {
                if (thumbnailUrl) {
                    return options.imageGenerator.generate(thumbnailUrl, thumbnail, spec).then(
                        function() {
                            show(thumbnail);
                        },
                        function() {
                            displayNotAvailableImg(thumbnail);
                        }
                    );
                }
                else {
                    displayNotAvailableImg(thumbnail);
                }
            }
        }
    };

    return api;
};

/*globals qq*/
qq.UploadHandlerForm = function(options, uploadCompleteCallback, onUuidChanged, logCallback) {
    "use strict";

    var fileState = [],
        uploadComplete = uploadCompleteCallback,
        log = logCallback,
        internalApi = {},
        publicApi;


    /**
     * Returns json object received by iframe from server.
     */
    function getIframeContentJson(id, iframe) {
        /*jshint evil: true*/

        var response;

        //IE may throw an "access is denied" error when attempting to access contentDocument on the iframe in some cases
        try {
            // iframe.contentWindow.document - for IE<7
            var doc = iframe.contentDocument || iframe.contentWindow.document,
                innerHtml = doc.body.innerHTML;

            log("converting iframe's innerHTML to JSON");
            log("innerHTML = " + innerHtml);
            //plain text response may be wrapped in <pre> tag
            if (innerHtml && innerHtml.match(/^<pre/i)) {
                innerHtml = doc.body.firstChild.firstChild.nodeValue;
            }

            response = internalApi.parseJsonResponse(id, innerHtml);
        }
        catch(error) {
            log('Error when attempting to parse form upload response (' + error.message + ")", 'error');
            response = {success: false};
        }

        return response;
    }

    /**
     * Creates form, that will be submitted to iframe
     */
    function createForm(id, iframe){
        var params = options.paramsStore.getParams(id),
            method = options.demoMode ? "GET" : "POST",
            endpoint = options.endpointStore.getEndpoint(id),
            name = fileState[id].newName || publicApi.getName(id);

        params[options.uuidParam] = fileState[id].uuid;
        params[options.filenameParam] = name;

        return internalApi.initFormForUpload({
            method: method,
            endpoint: endpoint,
            params: params,
            paramsInBody: options.paramsInBody,
            targetName: iframe.name
        });
    }

    publicApi = new qq.UploadHandlerFormApi(internalApi, fileState, options.cors.expected, options.inputName, options.onCancel, onUuidChanged, log);

    return qq.extend(publicApi, {
        upload: function(id) {
            var input = fileState[id].input,
                fileName = publicApi.getName(id),
                iframe = internalApi.createIframe(id),
                form;

            if (!input){
                throw new Error('file with passed id was not added, or already uploaded or cancelled');
            }

            options.onUpload(id, publicApi.getName(id));

            form = createForm(id, iframe);
            form.appendChild(input);

            internalApi.attachLoadEvent(iframe, function(responseFromMessage){
                log('iframe loaded');

                var response = responseFromMessage ? responseFromMessage : getIframeContentJson(id, iframe);

                internalApi.detachLoadEvent(id);

                //we can't remove an iframe if the iframe doesn't belong to the same domain
                if (!options.cors.expected) {
                    qq(iframe).remove();
                }

                if (!response.success) {
                    if (options.onAutoRetry(id, fileName, response)) {
                        return;
                    }
                }
                options.onComplete(id, fileName, response);
                uploadComplete(id);
            });

            log('Sending upload request for ' + id);
            form.submit();
            qq(form).remove();
        }
    });
};

/*globals qq, File, XMLHttpRequest, FormData, Blob*/
qq.UploadHandlerXhr = function(options, uploadCompleteCallback, onUuidChanged, logCallback) {
    "use strict";
    
    var uploadComplete = uploadCompleteCallback,
        log = logCallback,
        fileState = [],
        cookieItemDelimiter = "|",
        chunkFiles = options.chunking.enabled && qq.supportedFeatures.chunking,
        resumeEnabled = options.resume.enabled && chunkFiles && qq.supportedFeatures.resume,
        resumeId = getResumeId(),
        multipart = options.forceMultipart || options.paramsInBody,
        internalApi = {},
        publicApi;


     function addChunkingSpecificParams(id, params, chunkData) {
        var size = publicApi.getSize(id),
            name = publicApi.getName(id);

        params[options.chunking.paramNames.partIndex] = chunkData.part;
        params[options.chunking.paramNames.partByteOffset] = chunkData.start;
        params[options.chunking.paramNames.chunkSize] = chunkData.size;
        params[options.chunking.paramNames.totalParts] = chunkData.count;
        params[options.totalFileSizeParam] = size;

        /**
         * When a Blob is sent in a multipart request, the filename value in the content-disposition header is either "blob"
         * or an empty string.  So, we will need to include the actual file name as a param in this case.
         */
        if (multipart) {
            params[options.filenameParam] = name;
        }
    }

    function addResumeSpecificParams(params) {
        params[options.resume.paramNames.resuming] = true;
    }

    function getChunk(fileOrBlob, startByte, endByte) {
        if (fileOrBlob.slice) {
            return fileOrBlob.slice(startByte, endByte);
        }
        else if (fileOrBlob.mozSlice) {
            return fileOrBlob.mozSlice(startByte, endByte);
        }
        else if (fileOrBlob.webkitSlice) {
            return fileOrBlob.webkitSlice(startByte, endByte);
        }
    }

    function setParamsAndGetEntityToSend(params, xhr, fileOrBlob, id) {
        var formData = new FormData(),
            method = options.demoMode ? "GET" : "POST",
            endpoint = options.endpointStore.getEndpoint(id),
            url = endpoint,
            name = fileState[id].newName || publicApi.getName(id),
            size = publicApi.getSize(id);

        params[options.uuidParam] = fileState[id].uuid;
        params[options.filenameParam] = name;


        if (multipart) {
            params[options.totalFileSizeParam] = size;
        }

        //build query string
        if (!options.paramsInBody) {
            if (!multipart) {
                params[options.inputName] = name;
            }
            url = qq.obj2url(params, endpoint);
        }

        xhr.open(method, url, true);

        if (options.cors.expected && options.cors.sendCredentials) {
            xhr.withCredentials = true;
        }

        if (multipart) {
            if (options.paramsInBody) {
                qq.obj2FormData(params, formData);
            }

            formData.append(options.inputName, fileOrBlob);
            return formData;
        }

        return fileOrBlob;
    }

    function setHeaders(id, xhr) {
        var extraHeaders = options.customHeaders,
            fileOrBlob = fileState[id].file || fileState[id].blobData.blob;

        xhr.setRequestHeader("X-Requested-With", "XMLHttpRequest");
        xhr.setRequestHeader("Cache-Control", "no-cache");

        if (!multipart) {
            xhr.setRequestHeader("Content-Type", "application/octet-stream");
            //NOTE: return mime type in xhr works on chrome 16.0.9 firefox 11.0a2
            xhr.setRequestHeader("X-Mime-Type", fileOrBlob.type);
        }

        qq.each(extraHeaders, function(name, val) {
            xhr.setRequestHeader(name, val);
        });
    }

    function handleCompletedItem(id, response, xhr) {
        var name = publicApi.getName(id),
            size = publicApi.getSize(id);

        fileState[id].attemptingResume = false;

        options.onProgress(id, name, size, size);
        options.onComplete(id, name, response, xhr);

        if (fileState[id]) {
            delete fileState[id].xhr;
        }

        uploadComplete(id);
    }

    function uploadNextChunk(id) {
        var chunkIdx = fileState[id].remainingChunkIdxs[0],
            chunkData = internalApi.getChunkData(id, chunkIdx),
            xhr = internalApi.createXhr(id),
            size = publicApi.getSize(id),
            name = publicApi.getName(id),
            toSend, params;

        if (fileState[id].loaded === undefined) {
            fileState[id].loaded = 0;
        }

        if (resumeEnabled && fileState[id].file) {
            persistChunkData(id, chunkData);
        }

        xhr.onreadystatechange = getReadyStateChangeHandler(id, xhr);

        xhr.upload.onprogress = function(e) {
            if (e.lengthComputable) {
                var totalLoaded = e.loaded + fileState[id].loaded,
                    estTotalRequestsSize = calcAllRequestsSizeForChunkedUpload(id, chunkIdx, e.total);

                options.onProgress(id, name, totalLoaded, estTotalRequestsSize);
            }
        };

        options.onUploadChunk(id, name, internalApi.getChunkDataForCallback(chunkData));

        params = options.paramsStore.getParams(id);
        addChunkingSpecificParams(id, params, chunkData);

        if (fileState[id].attemptingResume) {
            addResumeSpecificParams(params);
        }

        toSend = setParamsAndGetEntityToSend(params, xhr, chunkData.blob, id);
        setHeaders(id, xhr);

        log('Sending chunked upload request for item ' + id + ": bytes " + (chunkData.start+1) + "-" + chunkData.end + " of " + size);
        xhr.send(toSend);
    }

    function calcAllRequestsSizeForChunkedUpload(id, chunkIdx, requestSize) {
        var chunkData = internalApi.getChunkData(id, chunkIdx),
            blobSize = chunkData.size,
            overhead = requestSize - blobSize,
            size = publicApi.getSize(id),
            chunkCount = chunkData.count,
            initialRequestOverhead = fileState[id].initialRequestOverhead,
            overheadDiff = overhead - initialRequestOverhead;

        fileState[id].lastRequestOverhead = overhead;

        if (chunkIdx === 0) {
            fileState[id].lastChunkIdxProgress = 0;
            fileState[id].initialRequestOverhead = overhead;
            fileState[id].estTotalRequestsSize = size + (chunkCount * overhead);
        }
        else if (fileState[id].lastChunkIdxProgress !== chunkIdx) {
            fileState[id].lastChunkIdxProgress = chunkIdx;
            fileState[id].estTotalRequestsSize += overheadDiff;
        }

        return fileState[id].estTotalRequestsSize;
    }

    function getLastRequestOverhead(id) {
        if (multipart) {
            return fileState[id].lastRequestOverhead;
        }
        else {
            return 0;
        }
    }

    function handleSuccessfullyCompletedChunk(id, response, xhr) {
        var chunkIdx = fileState[id].remainingChunkIdxs.shift(),
            chunkData = internalApi.getChunkData(id, chunkIdx);

        fileState[id].attemptingResume = false;
        fileState[id].loaded += chunkData.size + getLastRequestOverhead(id);

        if (fileState[id].remainingChunkIdxs.length > 0) {
            uploadNextChunk(id);
        }
        else {
            if (resumeEnabled) {
                deletePersistedChunkData(id);
            }

            handleCompletedItem(id, response, xhr);
        }
    }

    function isErrorResponse(xhr, response) {
        return xhr.status !== 200 || !response.success || response.reset;
    }

    function parseResponse(id, xhr) {
        var response;

        try {
            log(qq.format("Received response status {} with body: {}", xhr.status, xhr.responseText));

            response = qq.parseJson(xhr.responseText);

            if (response.newUuid !== undefined) {
                publicApi.setUuid(id, response.newUuid);
            }
        }
        catch(error) {
            log('Error when attempting to parse xhr response text (' + error.message + ')', 'error');
            response = {};
        }

        return response;
    }

    function handleResetResponse(id) {
        log('Server has ordered chunking effort to be restarted on next attempt for item ID ' + id, 'error');

        if (resumeEnabled) {
            deletePersistedChunkData(id);
            fileState[id].attemptingResume = false;
        }

        fileState[id].remainingChunkIdxs = [];
        delete fileState[id].loaded;
        delete fileState[id].estTotalRequestsSize;
        delete fileState[id].initialRequestOverhead;
    }

    function handleResetResponseOnResumeAttempt(id) {
        fileState[id].attemptingResume = false;
        log("Server has declared that it cannot handle resume for item ID " + id + " - starting from the first chunk", 'error');
        handleResetResponse(id);
        publicApi.upload(id, true);
    }

    function handleNonResetErrorResponse(id, response, xhr) {
        var name = publicApi.getName(id);

        if (options.onAutoRetry(id, name, response, xhr)) {
            return;
        }
        else {
            handleCompletedItem(id, response, xhr);
        }
    }

    function onComplete(id, xhr) {
        var response;

        // the request was aborted/cancelled
        if (!fileState[id]) {
            return;
        }

        log("xhr - server response received for " + id);
        log("responseText = " + xhr.responseText);
        response = parseResponse(id, xhr);

        if (isErrorResponse(xhr, response)) {
            if (response.reset) {
                handleResetResponse(id);
            }

            if (fileState[id].attemptingResume && response.reset) {
                handleResetResponseOnResumeAttempt(id);
            }
            else {
                handleNonResetErrorResponse(id, response, xhr);
            }
        }
        else if (chunkFiles) {
            handleSuccessfullyCompletedChunk(id, response, xhr);
        }
        else {
            handleCompletedItem(id, response, xhr);
        }
    }

    function getReadyStateChangeHandler(id, xhr) {
        return function() {
            if (xhr.readyState === 4) {
                onComplete(id, xhr);
            }
        };
    }

    function persistChunkData(id, chunkData) {
        var fileUuid = publicApi.getUuid(id),
            lastByteSent = fileState[id].loaded,
            initialRequestOverhead = fileState[id].initialRequestOverhead,
            estTotalRequestsSize = fileState[id].estTotalRequestsSize,
            cookieName = getChunkDataCookieName(id),
            cookieValue = fileUuid +
                cookieItemDelimiter + chunkData.part +
                cookieItemDelimiter + lastByteSent +
                cookieItemDelimiter + initialRequestOverhead +
                cookieItemDelimiter + estTotalRequestsSize,
            cookieExpDays = options.resume.cookiesExpireIn;

        qq.setCookie(cookieName, cookieValue, cookieExpDays);
    }

    function deletePersistedChunkData(id) {
        if (fileState[id].file) {
            var cookieName = getChunkDataCookieName(id);
            qq.deleteCookie(cookieName);
        }
    }

    function getPersistedChunkData(id) {
        var chunkCookieValue = qq.getCookie(getChunkDataCookieName(id)),
            filename = publicApi.getName(id),
            sections, uuid, partIndex, lastByteSent, initialRequestOverhead, estTotalRequestsSize;

        if (chunkCookieValue) {
            sections = chunkCookieValue.split(cookieItemDelimiter);

            if (sections.length === 5) {
                uuid = sections[0];
                partIndex = parseInt(sections[1], 10);
                lastByteSent = parseInt(sections[2], 10);
                initialRequestOverhead = parseInt(sections[3], 10);
                estTotalRequestsSize = parseInt(sections[4], 10);

                return {
                    uuid: uuid,
                    part: partIndex,
                    lastByteSent: lastByteSent,
                    initialRequestOverhead: initialRequestOverhead,
                    estTotalRequestsSize: estTotalRequestsSize
                };
            }
            else {
                log('Ignoring previously stored resume/chunk cookie for ' + filename + " - old cookie format", "warn");
            }
        }
    }

    function getChunkDataCookieName(id) {
        var filename = publicApi.getName(id),
            fileSize = publicApi.getSize(id),
            maxChunkSize = options.chunking.partSize,
            cookieName;

        cookieName = "qqfilechunk" + cookieItemDelimiter + encodeURIComponent(filename) + cookieItemDelimiter + fileSize + cookieItemDelimiter + maxChunkSize;

        if (resumeId !== undefined) {
            cookieName += cookieItemDelimiter + resumeId;
        }

        return cookieName;
    }

    function getResumeId() {
        if (options.resume.id !== null &&
            options.resume.id !== undefined &&
            !qq.isFunction(options.resume.id) &&
            !qq.isObject(options.resume.id)) {

            return options.resume.id;
        }
    }

    function calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex) {
        var currentChunkIndex;

        for (currentChunkIndex = internalApi.getTotalChunks(id)-1; currentChunkIndex >= firstChunkIndex; currentChunkIndex-=1) {
            fileState[id].remainingChunkIdxs.unshift(currentChunkIndex);
        }

        uploadNextChunk(id);
    }

    function onResumeSuccess(id, name, firstChunkIndex, persistedChunkInfoForResume) {
        firstChunkIndex = persistedChunkInfoForResume.part;
        fileState[id].loaded = persistedChunkInfoForResume.lastByteSent;
        fileState[id].estTotalRequestsSize = persistedChunkInfoForResume.estTotalRequestsSize;
        fileState[id].initialRequestOverhead = persistedChunkInfoForResume.initialRequestOverhead;
        fileState[id].attemptingResume = true;
        log('Resuming ' + name + " at partition index " + firstChunkIndex);

        calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);
    }

    function handlePossibleResumeAttempt(id, persistedChunkInfoForResume, firstChunkIndex) {
        var name = publicApi.getName(id),
            firstChunkDataForResume = internalApi.getChunkData(id, persistedChunkInfoForResume.part),
            onResumeRetVal;

        onResumeRetVal = options.onResume(id, name, internalApi.getChunkDataForCallback(firstChunkDataForResume));
        if (qq.isPromise(onResumeRetVal)) {
            log("Waiting for onResume promise to be fulfilled for " + id);
            onResumeRetVal.then(
                function() {
                    onResumeSuccess(id, name, firstChunkIndex, persistedChunkInfoForResume);
                },
                function() {
                    log("onResume promise fulfilled - failure indicated.  Will not resume.")
                    calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);
                }
            );
        }
        else if (onResumeRetVal !== false) {
            onResumeSuccess(id, name, firstChunkIndex, persistedChunkInfoForResume);
        }
        else {
            log("onResume callback returned false.  Will not resume.");
            calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);
        }
    }

    function handleFileChunkingUpload(id, retry) {
        var firstChunkIndex = 0,
            persistedChunkInfoForResume;

        if (!fileState[id].remainingChunkIdxs || fileState[id].remainingChunkIdxs.length === 0) {
            fileState[id].remainingChunkIdxs = [];

            if (resumeEnabled && !retry && fileState[id].file) {
                persistedChunkInfoForResume = getPersistedChunkData(id);
                if (persistedChunkInfoForResume) {
                    handlePossibleResumeAttempt(id, persistedChunkInfoForResume, firstChunkIndex);
                }
                else {
                    calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);
                }
            }
            else {
                calculateRemainingChunkIdxsAndUpload(id, firstChunkIndex);
            }
        }
        else {
            uploadNextChunk(id);
        }
    }

    function handleStandardFileUpload(id) {
        var fileOrBlob = fileState[id].file || fileState[id].blobData.blob,
            name = publicApi.getName(id),
            xhr, params, toSend;

        fileState[id].loaded = 0;

        xhr = internalApi.createXhr(id);

        xhr.upload.onprogress = function(e){
            if (e.lengthComputable){
                fileState[id].loaded = e.loaded;
                options.onProgress(id, name, e.loaded, e.total);
            }
        };

        xhr.onreadystatechange = getReadyStateChangeHandler(id, xhr);

        params = options.paramsStore.getParams(id);
        toSend = setParamsAndGetEntityToSend(params, xhr, fileOrBlob, id);
        setHeaders(id, xhr);

        log('Sending upload request for ' + id);
        xhr.send(toSend);
    }

    function handleUploadSignal(id, retry) {
        var name = publicApi.getName(id);

        if (publicApi.isValid(id)) {
            options.onUpload(id, name);

            if (chunkFiles) {
                handleFileChunkingUpload(id, retry);
            }
            else {
                handleStandardFileUpload(id);
            }
        }
    }


    publicApi = new qq.UploadHandlerXhrApi(
        internalApi,
        fileState,
        chunkFiles ? options.chunking : null,
        handleUploadSignal,
        options.onCancel,
        onUuidChanged,
        log
    );

    // Base XHR API overrides
    qq.override(publicApi, function(super_) {
        return {
            add: function(fileOrBlobData) {
                var id = super_.add(fileOrBlobData),
                    persistedChunkData;

                if (resumeEnabled) {
                    persistedChunkData = getPersistedChunkData(id);

                    if (persistedChunkData) {
                        fileState[id].uuid = persistedChunkData.uuid;
                    }
                }

                return id;
            },

            getResumableFilesData: function() {
                var matchingCookieNames = [],
                    resumableFilesData = [];

                if (chunkFiles && resumeEnabled) {
                    if (resumeId === undefined) {
                        matchingCookieNames = qq.getCookieNames(new RegExp("^qqfilechunk\\" + cookieItemDelimiter + ".+\\" +
                            cookieItemDelimiter + "\\d+\\" + cookieItemDelimiter + options.chunking.partSize + "="));
                    }
                    else {
                        matchingCookieNames = qq.getCookieNames(new RegExp("^qqfilechunk\\" + cookieItemDelimiter + ".+\\" +
                            cookieItemDelimiter + "\\d+\\" + cookieItemDelimiter + options.chunking.partSize + "\\" +
                            cookieItemDelimiter + resumeId + "="));
                    }

                    qq.each(matchingCookieNames, function(idx, cookieName) {
                        var cookiesNameParts = cookieName.split(cookieItemDelimiter);
                        var cookieValueParts = qq.getCookie(cookieName).split(cookieItemDelimiter);

                        resumableFilesData.push({
                            name: decodeURIComponent(cookiesNameParts[1]),
                            size: cookiesNameParts[2],
                            uuid: cookieValueParts[0],
                            partIdx: cookieValueParts[1]
                        });
                    });

                    return resumableFilesData;
                }
                return [];
            },

            expunge: function(id) {
                if (resumeEnabled) {
                    deletePersistedChunkData(id);
                }

                super_.expunge(id);
            }
        };
    });

    return publicApi;
};

/*globals qq*/
qq.PasteSupport = function(o) {
    "use strict";

    var options, detachPasteHandler;

    options = {
        targetElement: null,
        callbacks: {
            log: function(message, level) {},
            pasteReceived: function(blob) {}
        }
    };

    function isImage(item) {
        return item.type &&
            item.type.indexOf("image/") === 0;
    }

    function registerPasteHandler() {
        qq(options.targetElement).attach("paste", function(event) {
            var clipboardData = event.clipboardData;

            if (clipboardData) {
                qq.each(clipboardData.items, function(idx, item) {
                    if (isImage(item)) {
                        var blob = item.getAsFile();
                        options.callbacks.pasteReceived(blob);
                    }
                });
            }
        });
    }

    function unregisterPasteHandler() {
        if (detachPasteHandler) {
            detachPasteHandler();
        }
    }

    qq.extend(options, o);
    registerPasteHandler();

    return {
        reset: function() {
            unregisterPasteHandler();
        }
    };
};
/*globals qq, document*/
qq.DragAndDrop = function(o) {
    "use strict";

    var options,
        HIDE_BEFORE_ENTER_ATTR = "qq-hide-dropzone",
        uploadDropZones = [],
        droppedFiles = [],
        disposeSupport = new qq.DisposeSupport();

     options = {
        dropZoneElements: [],
        allowMultipleItems: true,
        classes: {
            dropActive: null
        },
        callbacks: new qq.DragAndDrop.callbacks()
    };

    qq.extend(options, o, true);

    setupDragDrop();

    function uploadDroppedFiles(files, uploadDropZone) {
        options.callbacks.dropLog('Grabbed ' + files.length + " dropped files.");
        uploadDropZone.dropDisabled(false);
        options.callbacks.processingDroppedFilesComplete(files);
    }

    function traverseFileTree(entry) {
        var dirReader,
            parseEntryPromise = new qq.Promise();

        if (entry.isFile) {
            entry.file(function(file) {
                droppedFiles.push(file);
                parseEntryPromise.success();
            },
            function(fileError) {
                options.callbacks.dropLog("Problem parsing '" + entry.fullPath + "'.  FileError code " + fileError.code + ".", "error");
                parseEntryPromise.failure();
            });
        }
        else if (entry.isDirectory) {
            dirReader = entry.createReader();
            dirReader.readEntries(function(entries) {
                var entriesLeft = entries.length;

                qq.each(entries, function(idx, entry) {
                    traverseFileTree(entry).done(function() {
                        entriesLeft-=1;

                        if (entriesLeft === 0) {
                            parseEntryPromise.success();
                        }
                    });
                });

                if (!entries.length) {
                    parseEntryPromise.success();
                }
            }, function(fileError) {
                options.callbacks.dropLog("Problem parsing '" + entry.fullPath + "'.  FileError code " + fileError.code + ".", "error");
                parseEntryPromise.failure();
            });
        }

        return parseEntryPromise;
    }

    function handleDataTransfer(dataTransfer, uploadDropZone) {
        var pendingFolderPromises = [],
            handleDataTransferPromise = new qq.Promise();

        options.callbacks.processingDroppedFiles();
        uploadDropZone.dropDisabled(true);

        if (dataTransfer.files.length > 1 && !options.allowMultipleItems) {
            options.callbacks.processingDroppedFilesComplete([]);
            options.callbacks.dropError('tooManyFilesError', "");
            uploadDropZone.dropDisabled(false);
            handleDataTransferPromise.failure();
        }
        else {
            droppedFiles = [];

            if (qq.isFolderDropSupported(dataTransfer)) {
                qq.each(dataTransfer.items, function(idx, item) {
                    var entry = item.webkitGetAsEntry();

                    if (entry) {
                        //due to a bug in Chrome's File System API impl - #149735
                        if (entry.isFile) {
                            droppedFiles.push(item.getAsFile());
                        }

                        else {
                            pendingFolderPromises.push(traverseFileTree(entry).done(function() {
                                pendingFolderPromises.pop();
                                if (pendingFolderPromises.length === 0) {
                                    handleDataTransferPromise.success();
                                }
                            }));
                        }
                    }
                });
            }
            else {
                droppedFiles = dataTransfer.files;
            }

            if (pendingFolderPromises.length === 0) {
                handleDataTransferPromise.success();
            }
        }

        return handleDataTransferPromise;
    }

    function setupDropzone(dropArea) {
        var dropZone = new qq.UploadDropZone({
            element: dropArea,
            onEnter: function(e){
                qq(dropArea).addClass(options.classes.dropActive);
                e.stopPropagation();
            },
            onLeaveNotDescendants: function(e){
                qq(dropArea).removeClass(options.classes.dropActive);
            },
            onDrop: function(e){
                qq(dropArea).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropArea).hide();
                qq(dropArea).removeClass(options.classes.dropActive);

                handleDataTransfer(e.dataTransfer, dropZone).done(function() {
                    uploadDroppedFiles(droppedFiles, dropZone);
                });
            }
        });

        disposeSupport.addDisposer(function() {
            dropZone.dispose();
        });

        qq(dropArea).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropArea).hide();

        uploadDropZones.push(dropZone);

        return dropZone;
    }

    function isFileDrag(dragEvent) {
        var fileDrag;

        qq.each(dragEvent.dataTransfer.types, function(key, val) {
            if (val === 'Files') {
                fileDrag = true;
                return false;
            }
        });

        return fileDrag;
    }

    function leavingDocumentOut(e) {
        return ((qq.chrome() || (qq.safari() && qq.windows())) && e.clientX == 0 && e.clientY == 0) // null coords for Chrome and Safari Windows
            || (qq.firefox() && !e.relatedTarget); // null e.relatedTarget for Firefox
    }

    function setupDragDrop() {
        var dropZones = options.dropZoneElements;

        qq.each(dropZones, function(idx, dropZone) {
           var uploadDropZone = setupDropzone(dropZone);

            // IE <= 9 does not support the File API used for drag+drop uploads
            if (dropZones.length && (!qq.ie() || qq.ie10())) {
                disposeSupport.attach(document, 'dragenter', function(e) {
                    if (!uploadDropZone.dropDisabled() && isFileDrag(e)) {
                        qq.each(dropZones, function(idx, dropZone) {
                            qq(dropZone).css({display: 'block'});
                        });
                    }
                });
            }
        });

        disposeSupport.attach(document, 'dragleave', function(e) {
            if (leavingDocumentOut(e)) {
                qq.each(dropZones, function(idx, dropZone) {
                    qq(dropZone).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropZone).hide();
                });
            }
        });
        disposeSupport.attach(document, 'drop', function(e){
            qq.each(dropZones, function(idx, dropZone) {
                qq(dropZone).hasAttribute(HIDE_BEFORE_ENTER_ATTR) && qq(dropZone).hide();
            });
            e.preventDefault();
        });
    }

    return {
        setupExtraDropzone: function(element) {
            options.dropZoneElements.push(element);
            setupDropzone(element);
        },

        removeDropzone: function(element) {
            var i,
                dzs = options.dropZoneElements;

            for(i in dzs) {
                if (dzs[i] === element) {
                    return dzs.splice(i, 1);
                }
            }
        },

        dispose: function() {
            disposeSupport.dispose();
            qq.each(uploadDropZones, function(idx, dropZone) {
                dropZone.dispose();
            });
        }
    };
};

qq.DragAndDrop.callbacks = function() {
    return {
        processingDroppedFiles: function() {},
        processingDroppedFilesComplete: function(files) {},
        dropError: function(code, errorSpecifics) {
            qq.log("Drag & drop error code '" + code + " with these specifics: '" + errorSpecifics + "'", "error");
        },
        dropLog: function(message, level) {
            qq.log(message, level);
        }
    }
};

qq.UploadDropZone = function(o){
    "use strict";

    var options, element, preventDrop, dropOutsideDisabled, disposeSupport = new qq.DisposeSupport();

    options = {
        element: null,
        onEnter: function(e){},
        onLeave: function(e){},
        // is not fired when leaving element by hovering descendants
        onLeaveNotDescendants: function(e){},
        onDrop: function(e){}
    };

    qq.extend(options, o);
    element = options.element;

    function dragover_should_be_canceled(){
        return qq.safari() || (qq.firefox() && qq.windows());
    }

    function disableDropOutside(e){
        // run only once for all instances
        if (!dropOutsideDisabled ){

            // for these cases we need to catch onDrop to reset dropArea
            if (dragover_should_be_canceled){
               disposeSupport.attach(document, 'dragover', function(e){
                    e.preventDefault();
                });
            } else {
                disposeSupport.attach(document, 'dragover', function(e){
                    if (e.dataTransfer){
                        e.dataTransfer.dropEffect = 'none';
                        e.preventDefault();
                    }
                });
            }

            dropOutsideDisabled = true;
        }
    }

    function isValidFileDrag(e){
        // e.dataTransfer currently causing IE errors
        // IE9 does NOT support file API, so drag-and-drop is not possible
        if (qq.ie() && !qq.ie10()) {
            return false;
        }

        var effectTest, dt = e.dataTransfer,
        // do not check dt.types.contains in webkit, because it crashes safari 4
        isSafari = qq.safari();

        // dt.effectAllowed is none in Safari 5
        // dt.types.contains check is for firefox
        effectTest = qq.ie10() ? true : dt.effectAllowed !== 'none';
        return dt && effectTest && (dt.files || (!isSafari && dt.types.contains && dt.types.contains('Files')));
    }

    function isOrSetDropDisabled(isDisabled) {
        if (isDisabled !== undefined) {
            preventDrop = isDisabled;
        }
        return preventDrop;
    }

    function attachEvents(){
        disposeSupport.attach(element, 'dragover', function(e){
            if (!isValidFileDrag(e)) {
                return;
            }

            var effect = qq.ie() ? null : e.dataTransfer.effectAllowed;
            if (effect === 'move' || effect === 'linkMove'){
                e.dataTransfer.dropEffect = 'move'; // for FF (only move allowed)
            } else {
                e.dataTransfer.dropEffect = 'copy'; // for Chrome
            }

            e.stopPropagation();
            e.preventDefault();
        });

        disposeSupport.attach(element, 'dragenter', function(e){
            if (!isOrSetDropDisabled()) {
                if (!isValidFileDrag(e)) {
                    return;
                }
                options.onEnter(e);
            }
        });

        disposeSupport.attach(element, 'dragleave', function(e){
            if (!isValidFileDrag(e)) {
                return;
            }

            options.onLeave(e);

            var relatedTarget = document.elementFromPoint(e.clientX, e.clientY);
            // do not fire when moving a mouse over a descendant
            if (qq(this).contains(relatedTarget)) {
                return;
            }

            options.onLeaveNotDescendants(e);
        });

        disposeSupport.attach(element, 'drop', function(e){
            if (!isOrSetDropDisabled()) {
                if (!isValidFileDrag(e)) {
                    return;
                }

                e.preventDefault();
                options.onDrop(e);
            }
        });
    }

    disableDropOutside();
    attachEvents();

    return {
        dropDisabled: function(isDisabled) {
            return isOrSetDropDisabled(isDisabled);
        },

        dispose: function() {
            disposeSupport.dispose();
        }
    };
};

/** Generic class for sending non-upload ajax requests and handling the associated responses **/
/*globals qq, XMLHttpRequest*/
qq.DeleteFileAjaxRequestor = function(o) {
    "use strict";

    var requestor,
        options = {
            method: "DELETE",
            uuidParamName: "qquuid",
            endpointStore: {},
            maxConnections: 3,
            customHeaders: {},
            paramsStore: {},
            demoMode: false,
            cors: {
                expected: false,
                sendCredentials: false
            },
            log: function(str, level) {},
            onDelete: function(id) {},
            onDeleteComplete: function(id, xhrOrXdr, isError) {}
        };

    qq.extend(options, o);

    function getMandatedParams() {
        if (options.method.toUpperCase() === "POST") {
            return {
                "_method": "DELETE"
            };
        }

        return {};
    }

    requestor = new qq.AjaxRequestor({
        validMethods: ["POST", "DELETE"],
        method: options.method,
        endpointStore: options.endpointStore,
        paramsStore: options.paramsStore,
        mandatedParams: getMandatedParams(),
        maxConnections: options.maxConnections,
        customHeaders: options.customHeaders,
        demoMode: options.demoMode,
        log: options.log,
        onSend: options.onDelete,
        onComplete: options.onDeleteComplete,
        cors: options.cors
    });


    return {
        sendDelete: function(id, uuid, additionalMandatedParams) {
            var additionalOptions = additionalMandatedParams || {};

            options.log("Submitting delete file request for " + id);

            if (requestor.getMethod() === "DELETE") {
                requestor.send(id, uuid, additionalOptions);
            }
            else {
                additionalOptions[options.uuidParamName] = uuid;
                requestor.send(id, null, additionalOptions);
            }
        }
    };
};

/**
 * Mega pixel image rendering library for iOS6 Safari
 *
 * Fixes iOS6 Safari's image file rendering issue for large size image (over mega-pixel),
 * which causes unexpected subsampling when drawing it in canvas.
 * By using this library, you can safely render the image with proper stretching.
 *
 * Copyright (c) 2012 Shinichi Tomita <shinichi.tomita@gmail.com>
 * Released under the MIT license
 */
(function() {

  /**
   * Detect subsampling in loaded image.
   * In iOS, larger images than 2M pixels may be subsampled in rendering.
   */
  function detectSubsampling(img) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    if (iw * ih > 1024 * 1024) { // subsampling may happen over megapixel image
      var canvas = document.createElement('canvas');
      canvas.width = canvas.height = 1;
      var ctx = canvas.getContext('2d');
      ctx.drawImage(img, -iw + 1, 0);
      // subsampled image becomes half smaller in rendering size.
      // check alpha channel value to confirm image is covering edge pixel or not.
      // if alpha value is 0 image is not covering, hence subsampled.
      return ctx.getImageData(0, 0, 1, 1).data[3] === 0;
    } else {
      return false;
    }
  }

  /**
   * Detecting vertical squash in loaded image.
   * Fixes a bug which squash image vertically while drawing into canvas for some images.
   */
  function detectVerticalSquash(img, iw, ih) {
    var canvas = document.createElement('canvas');
    canvas.width = 1;
    canvas.height = ih;
    var ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    var data = ctx.getImageData(0, 0, 1, ih).data;
    // search image edge pixel position in case it is squashed vertically.
    var sy = 0;
    var ey = ih;
    var py = ih;
    while (py > sy) {
      var alpha = data[(py - 1) * 4 + 3];
      if (alpha === 0) {
        ey = py;
      } else {
        sy = py;
      }
      py = (ey + sy) >> 1;
    }
    var ratio = (py / ih);
    return (ratio===0)?1:ratio;
  }

  /**
   * Rendering image element (with resizing) and get its data URL
   */
  function renderImageToDataURL(img, options, doSquash) {
    var canvas = document.createElement('canvas'),
        mime = options.mime || "image/jpeg";

    renderImageToCanvas(img, canvas, options, doSquash);
    return canvas.toDataURL(mime, options.quality || 0.8);
  }

  /**
   * Rendering image element (with resizing) into the canvas element
   */
  function renderImageToCanvas(img, canvas, options, doSquash) {
    var iw = img.naturalWidth, ih = img.naturalHeight;
    var width = options.width, height = options.height;
    var ctx = canvas.getContext('2d');
    ctx.save();
    transformCoordinate(canvas, width, height, options.orientation);

    // Fine Uploader specific: Save some CPU cycles if not using iOS
    // Assumption: This logic is only needed to overcome iOS image sampling issues
    if (qq.ios()) {
        var subsampled = detectSubsampling(img);
        if (subsampled) {
          iw /= 2;
          ih /= 2;
        }
        var d = 1024; // size of tiling canvas
        var tmpCanvas = document.createElement('canvas');
        tmpCanvas.width = tmpCanvas.height = d;
        var tmpCtx = tmpCanvas.getContext('2d');
        var vertSquashRatio = doSquash ? detectVerticalSquash(img, iw, ih) : 1;
        var dw = Math.ceil(d * width / iw);
        var dh = Math.ceil(d * height / ih / vertSquashRatio);
        var sy = 0;
        var dy = 0;
        while (sy < ih) {
          var sx = 0;
          var dx = 0;
          while (sx < iw) {
            tmpCtx.clearRect(0, 0, d, d);
            tmpCtx.drawImage(img, -sx, -sy);
            ctx.drawImage(tmpCanvas, 0, 0, d, d, dx, dy, dw, dh);
            sx += d;
            dx += dw;
          }
          sy += d;
          dy += dh;
        }
        ctx.restore();
        tmpCanvas = tmpCtx = null;
    }
    else {
        ctx.drawImage(img, 0, 0, width, height);
    }
  }

  /**
   * Transform canvas coordination according to specified frame size and orientation
   * Orientation value is from EXIF tag
   */
  function transformCoordinate(canvas, width, height, orientation) {
    switch (orientation) {
      case 5:
      case 6:
      case 7:
      case 8:
        canvas.width = height;
        canvas.height = width;
        break;
      default:
        canvas.width = width;
        canvas.height = height;
    }
    var ctx = canvas.getContext('2d');
    switch (orientation) {
      case 2:
        // horizontal flip
        ctx.translate(width, 0);
        ctx.scale(-1, 1);
        break;
      case 3:
        // 180 rotate left
        ctx.translate(width, height);
        ctx.rotate(Math.PI);
        break;
      case 4:
        // vertical flip
        ctx.translate(0, height);
        ctx.scale(1, -1);
        break;
      case 5:
        // vertical flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.scale(1, -1);
        break;
      case 6:
        // 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(0, -height);
        break;
      case 7:
        // horizontal flip + 90 rotate right
        ctx.rotate(0.5 * Math.PI);
        ctx.translate(width, -height);
        ctx.scale(-1, 1);
        break;
      case 8:
        // 90 rotate left
        ctx.rotate(-0.5 * Math.PI);
        ctx.translate(-width, 0);
        break;
      default:
        break;
    }
  }


  /**
   * MegaPixImage class
   */
  function MegaPixImage(srcImage, errorCallback) {
    if (window.Blob && srcImage instanceof Blob) {
      var img = new Image();
      var URL = window.URL && window.URL.createObjectURL ? window.URL :
                window.webkitURL && window.webkitURL.createObjectURL ? window.webkitURL :
                null;
      if (!URL) { throw Error("No createObjectURL function found to create blob url"); }
      img.src = URL.createObjectURL(srcImage);
      this.blob = srcImage;
      srcImage = img;
    }
    if (!srcImage.naturalWidth && !srcImage.naturalHeight) {
      var _this = this;
      srcImage.onload = function() {
        var listeners = _this.imageLoadListeners;
        if (listeners) {
          _this.imageLoadListeners = null;
          for (var i=0, len=listeners.length; i<len; i++) {
            listeners[i]();
          }
        }
      };
      srcImage.onerror = errorCallback;
      this.imageLoadListeners = [];
    }
    this.srcImage = srcImage;
  }

  /**
   * Rendering megapix image into specified target element
   */
  MegaPixImage.prototype.render = function(target, options) {
    if (this.imageLoadListeners) {
      var _this = this;
      this.imageLoadListeners.push(function() { _this.render(target, options) });
      return;
    }
    options = options || {};
    var imgWidth = this.srcImage.naturalWidth, imgHeight = this.srcImage.naturalHeight,
        width = options.width, height = options.height,
        maxWidth = options.maxWidth, maxHeight = options.maxHeight,
        doSquash = !this.blob || this.blob.type === 'image/jpeg';
    if (width && !height) {
      height = (imgHeight * width / imgWidth) << 0;
    } else if (height && !width) {
      width = (imgWidth * height / imgHeight) << 0;
    } else {
      width = imgWidth;
      height = imgHeight;
    }
    if (maxWidth && width > maxWidth) {
      width = maxWidth;
      height = (imgHeight * width / imgWidth) << 0;
    }
    if (maxHeight && height > maxHeight) {
      height = maxHeight;
      width = (imgWidth * height / imgHeight) << 0;
    }
    var opt = { width : width, height : height };
    for (var k in options) opt[k] = options[k];

    var tagName = target.tagName.toLowerCase();
    if (tagName === 'img') {
      target.src = renderImageToDataURL(this.srcImage, opt, doSquash);
    } else if (tagName === 'canvas') {
      renderImageToCanvas(this.srcImage, target, opt, doSquash);
    }
    if (typeof this.onrender === 'function') {
      this.onrender(target);
    }
  };

  /**
   * Export class to global
   */
  if (typeof define === 'function' && define.amd) {
    define([], function() { return MegaPixImage; }); // for AMD loader
  } else {
    this.MegaPixImage = MegaPixImage;
  }

})();

/**
 * Draws a thumbnail of a Blob/File/URL onto an <img> or <canvas>.
 *
 * @returns {{generate: Function}}
 * @constructor
 */
qq.ImageGenerator = function(log) {
    "use strict";
    var api;

    function isImg(el) {
        return el.tagName.toLowerCase() === "img";
    }

    function isCanvas(el) {
        return el.tagName.toLowerCase() === "canvas";
    }

    function isImgCorsSupported() {
        return new Image().crossOrigin !== undefined;
    }

    function isCanvasSupported() {
        var canvas = document.createElement("canvas");

        return canvas.getContext && canvas.getContext("2d")
    }

    // This is only meant to determine the MIME type of a renderable image file.
    // It is used to ensure images drawn from a URL that have transparent backgrounds
    // are rendered correctly, among other things.
    function determineMimeOfFileName(nameWithPath) {
        var pathSegments = nameWithPath.split("/"),
            name = pathSegments[pathSegments.length - 1],
            extension = qq.getExtension(name);

        extension = extension && extension.toLowerCase();

        switch(extension) {
            case "jpeg":
            case "jpg":
                return "image/jpeg";
            case "png":
                return "image/png";
            case "bmp":
                return "image/bmp";
            case "gif":
                return "image/gif";
            case "tiff":
            case "tif":
                return "image/tiff";
        }
    }

    // This will likely not work correctly in IE8 and older.
    // It's only used as part of a formula to determine
    // if a canvas can be used to scale a server-hosted thumbnail.
    // If canvas isn't supported by the UA (IE8 and older)
    // this method should not even be called.
    function isCrossOrigin(url) {
        var targetAnchor = document.createElement('a'),
            targetProtocol, targetHostname, targetPort;

        targetAnchor.href = url;

        targetProtocol = targetAnchor.protocol;
        targetPort = targetAnchor.port;
        targetHostname = targetAnchor.hostname;

        if (targetProtocol.toLowerCase() !== window.location.protocol.toLowerCase()) {
            return true;
        }

        if (targetHostname.toLowerCase() !== window.location.hostname.toLowerCase()) {
            return true;
        }

        // IE doesn't take ports into consideration when determining if two endpoints are same origin.
        if (targetPort !== window.location.port && !qq.ie()) {
            return true;
        }

        return false;
    }

    function registerImgLoadListeners(img, promise) {
        img.onload = function() {
            img.onload = null;
            img.onerror = null;
            promise.success(img);
        };

        img.onerror = function() {
            img.onload = null;
            img.onerror = null;
            log("Problem drawing preview!", "error");
            promise.failure(img, "Problem drawing preview!");
        };
    }

    function registerCanvasDrawImageListener(canvas, promise) {
        var context = canvas.getContext("2d"),
            oldDrawImage = context.drawImage;

        // The image is drawn on the canvas by a third-party library,
        // and we want to know when this happens so we can fulfill the associated promise.
        context.drawImage = function() {
            oldDrawImage.apply(this, arguments);
            promise.success(canvas);
            context.drawImage = oldDrawImage;
        }
    }

    // Fulfills a `qq.Promise` when an image has been drawn onto the target,
    // whether that is a <canvas> or an <img>.  The attempt is considered a
    // failure if the target is not an <img> or a <canvas>, or if the drawing
    // attempt was not successful.
    function registerThumbnailRenderedListener(imgOrCanvas, promise) {
        var registered = isImg(imgOrCanvas) || isCanvas(imgOrCanvas);

        if (isImg(imgOrCanvas)) {
            registerImgLoadListeners(imgOrCanvas, promise);
        }
        else if (isCanvas(imgOrCanvas)) {
            registerCanvasDrawImageListener(imgOrCanvas, promise);
        }
        else {
            promise.failure(imgOrCanvas);
            log(qq.format("Element container of type {} is not supported!", imgOrCanvas.tagName), "error");
        }

        return registered;
    }

    // Draw a preview iff the current UA can natively display it.
    // Also rotate the image if necessary.
    function draw(fileOrBlob, container, options) {
        var drawPreview = new qq.Promise(),
            identifier = new qq.Identify(fileOrBlob, log),
            maxSize = options.maxSize,
            megapixErrorHandler = function() {
                drawPreview.failure(container, "Browser cannot render image!");
            };

        identifier.isPreviewable().then(
            function(mime) {
                var exif = new qq.Exif(fileOrBlob, log),
                    mpImg = new MegaPixImage(fileOrBlob, megapixErrorHandler);

                if (registerThumbnailRenderedListener(container, drawPreview)) {
                    exif.parse().then(
                        function(exif) {
                            var orientation = exif.Orientation;

                            mpImg.render(container, {
                                maxWidth: maxSize,
                                maxHeight: maxSize,
                                orientation: orientation,
                                mime: mime
                            });
                        },

                        function(failureMsg) {
                            log(qq.format("EXIF data could not be parsed ({}).  Assuming orientation = 1.", failureMsg));

                            mpImg.render(container, {
                                maxWidth: maxSize,
                                maxHeight: maxSize,
                                mime: mime
                            });
                        }
                    );
                }
            },

            function() {
                log("Not previewable");
                //TODO optionally include placeholder image
                drawPreview.failure(container, "Not previewable");
            }
        );

        return drawPreview;
    }

    function drawOnCanvasOrImgFromUrl(url, canvasOrImg, draw, maxSize) {
        var tempImg = new Image(),
            tempImgRender = new qq.Promise();

        registerThumbnailRenderedListener(tempImg, tempImgRender);

        if (isCrossOrigin(url)) {
            tempImg.crossOrigin = "anonymous";
        }

        tempImg.src = url;

        tempImgRender.then(function() {
            registerThumbnailRenderedListener(canvasOrImg, draw);

            var mpImg = new MegaPixImage(tempImg);
            mpImg.render(canvasOrImg, {
                maxWidth: maxSize,
                maxHeight: maxSize,
                mime: determineMimeOfFileName(url)
            });
        });
    }

    function drawOnImgFromUrlWithCssScaling(url, img, draw, maxSize) {
        registerThumbnailRenderedListener(img, draw);
        qq(img).css({
            maxWidth: maxSize + "px",
            maxHeight: maxSize + "px"
        });

        img.src = url;
    }

    // Draw a (server-hosted) thumbnail given a URL.
    // This will optionally scale the thumbnail as well.
    // It attempts to use <canvas> to scale, but will fall back
    // to max-width and max-height style properties if the UA
    // doesn't support canvas or if the images is cross-domain and
    // the UA doesn't support the crossorigin attribute on img tags,
    // which is required to scale a cross-origin image using <canvas> &
    // then export it back to an <img>.
    function drawFromUrl(url, container, options) {
        var draw = new qq.Promise(),
            scale = options.scale,
            maxSize = scale ? options.maxSize : null;

        // container is an img, scaling needed
        if (scale && isImg(container)) {
            // Iff canvas is available in this UA, try to use it for scaling.
            // Otherwise, fall back to CSS scaling
            if (isCanvasSupported()) {
                // Attempt to use <canvas> for image scaling,
                // but we must fall back to scaling via CSS/styles
                // if this is a cross-origin image and the UA doesn't support <img> CORS.
                if (isCrossOrigin(url) && !isImgCorsSupported()) {
                    drawOnImgFromUrlWithCssScaling(url, container, draw, maxSize);
                }
                else {
                    drawOnCanvasOrImgFromUrl(url, container, draw, maxSize);
                }
            }
            else {
                drawOnImgFromUrlWithCssScaling(url, container, draw, maxSize);
            }
        }
        // container is a canvas, scaling optional
        else if (isCanvas(container)) {
            drawOnCanvasOrImgFromUrl(url, container, draw, maxSize);
        }
        // container is an img & no scaling: just set the src attr to the passed url
        else if (registerThumbnailRenderedListener(container, draw)) {
            container.src = url;
        }

        return draw;
    }


    api = {
        /**
         * Generate a thumbnail.  Depending on the arguments, this may either result in
         * a client-side rendering of an image (if a `Blob` is supplied) or a server-generated
         * image that may optionally be scaled client-side using <canvas> or CSS/styles (as a fallback).
         *
         * @param fileBlobOrUrl a `File`, `Blob`, or a URL pointing to the image
         * @param container <img> or <canvas> to contain the preview
         * @param options possible properties include `maxSize` (int), `orient` (bool), and `resize` (bool)
         * @returns qq.Promise fulfilled when the preview has been drawn, or the attempt has failed
         */
        generate: function(fileBlobOrUrl, container, options) {
            if (qq.isString(fileBlobOrUrl)) {
                log("Attempting to update thumbnail based on server response.");
                return drawFromUrl(fileBlobOrUrl, container, options || {})
            }
            else {
                log("Attempting to draw client-side image preview.");
                return draw(fileBlobOrUrl, container, options || {});
            }
        }
    };

    /*<testing>*/
    api._testing = {};
    api._testing.isImg = isImg;
    api._testing.isCanvas = isCanvas;
    api._testing.isCrossOrigin = isCrossOrigin;
    api._testing.determineMimeOfFileName = determineMimeOfFileName;
    /*</testing>*/

    return api;
};

/**
 * EXIF image data parser.  Currently only parses the Orientation tag value,
 * but this may be expanded to other tags in the future.
 *
 * @param fileOrBlob Attempt to parse EXIF data in this `Blob`
 * @returns {{parse: Function}}
 * @constructor
 */
qq.Exif = function(fileOrBlob, log) {
    // Orientation is the only tag parsed here at this time.
    var TAG_IDS = [274],
        TAG_INFO = {
            274: {
                name: "Orientation",
                bytes: 2
            }
        },
        api;

    // Convert a little endian (hex string) to big endian (decimal).
    function parseLittleEndian(hex) {
        var result = 0,
            pow = 0;

        while (hex.length > 0) {
            result += parseInt(hex.substring(0, 2), 16) * Math.pow(2, pow);
            hex = hex.substring(2, hex.length);
            pow += 8;
        }

        return result;
    }

    // Find the byte offset, of Application Segment 1 (EXIF).
    // External callers need not supply any arguments.
    function seekToApp1(offset, promise) {
        var theOffset = offset,
            thePromise = promise;
        if (theOffset === undefined) {
            theOffset = 2;
            thePromise = new qq.Promise();
        }

        qq.readBlobToHex(fileOrBlob, theOffset, 4).then(function(hex) {
            var match = /^ffe([0-9])/.exec(hex);
            if (match) {
                if (match[1] !== "1") {
                    var segmentLength = parseInt(hex.slice(4, 8), 16);
                    seekToApp1(theOffset + segmentLength + 2, thePromise);
                }
                else {
                    thePromise.success(theOffset);
                }
            }
            else {
                thePromise.failure("No EXIF header to be found!");
            }
        });

        return thePromise;
    }

    // Find the byte offset of Application Segment 1 (EXIF) for valid JPEGs only.
    function getApp1Offset() {
        var promise = new qq.Promise();

        qq.readBlobToHex(fileOrBlob, 0, 6).then(function(hex) {
            if (hex.indexOf("ffd8") !== 0) {
                promise.failure("Not a valid JPEG!");
            }
            else {
                seekToApp1().then(function(offset) {
                    promise.success(offset);
                },
                function(error) {
                    promise.failure(error);
                });
            }
        });

        return promise;
    }

    // Determine the byte ordering of the EXIF header.
    function isLittleEndian(app1Start) {
        var promise = new qq.Promise();

        qq.readBlobToHex(fileOrBlob, app1Start + 10, 2).then(function(hex) {
            promise.success(hex === "4949");
        });

        return promise;
    }

    // Determine the number of directory entries in the EXIF header.
    function getDirEntryCount(app1Start, littleEndian) {
        var promise = new qq.Promise();

        qq.readBlobToHex(fileOrBlob, app1Start + 18, 2).then(function(hex) {
            if (littleEndian) {
                return promise.success(parseLittleEndian(hex));
            }
            else {
                promise.success(parseInt(hex, 16));
            }
        });

        return promise;
    }

    // Get the IFD portion of the EXIF header as a hex string.
    function getIfd(app1Start, dirEntries) {
        var offset = app1Start + 20,
            bytes = dirEntries * 12;

        return qq.readBlobToHex(fileOrBlob, offset, bytes);
    }

    // Obtain an array of all directory entries (as hex strings) in the EXIF header.
    function getDirEntries(ifdHex) {
        var entries = [],
            offset = 0;

        while (offset+24 <= ifdHex.length) {
            entries.push(ifdHex.slice(offset, offset + 24));
            offset += 24;
        }

        return entries;
    }

    // Obtain values for all relevant tags and return them.
    function getTagValues(littleEndian, dirEntries) {
        var TAG_VAL_OFFSET = 16,
            tagsToFind = qq.extend([], TAG_IDS),
            vals = {};

        qq.each(dirEntries, function(idx, entry) {
            var idHex = entry.slice(0, 4),
                id = littleEndian ? parseLittleEndian(idHex) : parseInt(idHex, 16),
                tagsToFindIdx = tagsToFind.indexOf(id),
                tagValHex, tagName, tagValLength;

            if (tagsToFindIdx >= 0) {
                tagName = TAG_INFO[id].name;
                tagValLength = TAG_INFO[id].bytes;
                tagValHex = entry.slice(TAG_VAL_OFFSET, TAG_VAL_OFFSET + (tagValLength*2));
                vals[tagName] = littleEndian ? parseLittleEndian(tagValHex) : parseInt(tagValHex, 16);

                tagsToFind.splice(tagsToFindIdx, 1);
            }

            if (tagsToFind.length === 0) {
                return false;
            }
        });

        return vals;
    }

    api = {
        /**
         * Attempt to parse the EXIF header for the `Blob` associated with this instance.
         *
         * @returns {qq.Promise} To be fulfilled when the parsing is complete.
         * If successful, the parsed EXIF header as an object will be included.
         */
        parse: function() {
            var parser = new qq.Promise(),
                onParseFailure = function(message) {
                    log(qq.format("EXIF header parse failed: '{}' ", message));
                    parser.failure(message);
                };

            getApp1Offset().then(function(app1Offset) {
                log(qq.format("Moving forward with EXIF header parsing for '{}'", fileOrBlob.name === undefined ? "blob" : fileOrBlob.name));

                isLittleEndian(app1Offset).then(function(littleEndian) {

                    log(qq.format("EXIF Byte order is {} endian", littleEndian ? "little" : "big"));

                    getDirEntryCount(app1Offset, littleEndian).then(function(dirEntryCount) {

                        log(qq.format("Found {} APP1 directory entries", dirEntryCount));

                        getIfd(app1Offset, dirEntryCount).then(function(ifdHex) {
                            var dirEntries = getDirEntries(ifdHex),
                                tagValues = getTagValues(littleEndian, dirEntries);

                            log("Successfully parsed some EXIF tags");

                            parser.success(tagValues);
                        }, onParseFailure);
                    }, onParseFailure);
                }, onParseFailure);
            }, onParseFailure);

            return parser;
        }
    };

    /*<testing>*/
    api._testing = {};
    api._testing.parseLittleEndian = parseLittleEndian;
    /*</testing>*/

    return api;
};

qq.Identify = function(fileOrBlob, log) {
    var PREVIEWABLE_MAGIC_BYTES = {
            "image/jpeg": "ffd8ff",
            "image/gif": "474946",
            "image/png": "89504e",
            "image/bmp": "424d",
            "image/tiff": ["49492a00", "4d4d002a"]
        };

    function isIdentifiable(magicBytes, questionableBytes) {
        var identifiable = false,
            magicBytesEntries = [].concat(magicBytes);

        qq.each(magicBytesEntries, function(idx, magicBytesArrayEntry) {
            if (questionableBytes.indexOf(magicBytesArrayEntry) === 0) {
                identifiable = true;
                return false;
            }
        });

        return identifiable;
    }

    return {
        isPreviewable: function() {
            var idenitifer = new qq.Promise(),
                previewable = false,
                name = fileOrBlob.name === undefined ? "blob" : fileOrBlob.name;

            log(qq.format("Attempting to determine if {} can be rendered in this browser", name));

            qq.readBlobToHex(fileOrBlob, 0, 4).then(function(hex) {
                qq.each(PREVIEWABLE_MAGIC_BYTES, function(mime, bytes) {
                    if (isIdentifiable(bytes, hex)) {
                        // Safari is the only supported browser that can deal with TIFFs natively,
                        // so, if this is a TIFF and the UA isn't Safari, declare this file "non-previewable".
                        if (mime !== "image/tiff" || qq.safari()) {
                            previewable = true;
                            idenitifer.success(mime);
                        }

                        return false;
                    }
                });

                log(qq.format("'{}' is {} able to be rendered in this browser", name, previewable ? "" : "NOT"));

                if (!previewable) {
                    idenitifer.failure();
                }
            });

            return idenitifer;
        }
    }
};

// Base handler for UI (FineUploader mode) events.
// Some more specific handlers inherit from this one.
qq.UiEventHandler = function(s, protectedApi) {
    "use strict";

    var disposer = new qq.DisposeSupport(),
        spec = {
            eventType: 'click',
            attachTo: null,
            onHandled: function(target, event) {}
        },
        // This makes up the "public" API methods that will be accessible
        // to instances constructing a base or child handler
        publicApi = {
            addHandler: function(element) {
                addHandler(element);
            },

            dispose: function() {
                disposer.dispose();
            }
        };



    function addHandler(element) {
        disposer.attach(element, spec.eventType, function(event) {
            // Only in IE: the `event` is a property of the `window`.
            event = event || window.event;

            // On older browsers, we must check the `srcElement` instead of the `target`.
            var target = event.target || event.srcElement;

            spec.onHandled(target, event);
        });
    }

    // These make up the "protected" API methods that children of this base handler will utilize.
    qq.extend(protectedApi, {
        getFileIdFromItem: function(item) {
            return item.qqFileId;
        },

        getDisposeSupport: function() {
            return disposer;
        }
    });


    qq.extend(spec, s);

    if (spec.attachTo) {
        addHandler(spec.attachTo);
    }

    return publicApi;
};

qq.DeleteRetryOrCancelClickHandler = function(s) {
    "use strict";

    var inheritedInternalApi = {},
        spec = {
            templating: null,
            log: function(message, lvl) {},
            classes: {
                cancel: 'qq-upload-cancel',
                deleteButton: 'qq-upload-delete',
                retry: 'qq-upload-retry'
            },
            onDeleteFile: function(fileId) {},
            onCancel: function(fileId) {},
            onRetry: function(fileId) {},
            onGetName: function(fileId) {}
    };

    function examineEvent(target, event) {
        if (spec.templating.isCancel(target) ||
            spec.templating.isRetry(target) ||
            spec.templating.isDelete(target)) {

            var fileId = spec.templating.getFileId(target);

            qq.preventDefault(event);

            spec.log(qq.format("Detected valid cancel, retry, or delete click event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
            deleteRetryOrCancel(target, fileId);
        }
    }

    function deleteRetryOrCancel(target, fileId) {
        if (spec.templating.isDelete(target)) {
            spec.onDeleteFile(fileId);
        }
        else if (spec.templating.isCancel(target)) {
            spec.onCancel(fileId);
        }
        else {
            spec.onRetry(fileId);
        }
    }

    qq.extend(spec, s);

    spec.eventType = 'click';
    spec.onHandled = examineEvent;
    spec.attachTo = spec.templating.getFileList();

    qq.extend(this, new qq.UiEventHandler(spec, inheritedInternalApi));
};

// Child of FilenameEditHandler.  Used to detect click events on filename display elements.
qq.FilenameClickHandler = function(s) {
    "use strict";

    var inheritedInternalApi = {},
        spec = {
            templating: null,
            log: function(message, lvl) {},
            classes: {
                file: 'qq-upload-file',
                editNameIcon: 'qq-edit-filename-icon'
            },
            onGetUploadStatus: function(fileId) {},
            onGetName: function(fileId) {}
    };

    qq.extend(spec, s);

    // This will be called by the parent handler when a `click` event is received on the list element.
    function examineEvent(target, event) {
        if (spec.templating.isFileName(target) || spec.templating.isEditIcon(target)) {
            var fileId = spec.templating.getFileId(target),
                status = spec.onGetUploadStatus(fileId);

            // We only allow users to change filenames of files that have been submitted but not yet uploaded.
            if (status === qq.status.SUBMITTED) {
                spec.log(qq.format("Detected valid filename click event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
                qq.preventDefault(event);

                inheritedInternalApi.handleFilenameEdit(fileId, target, true);
            }
        }
    }

    spec.eventType = 'click';
    spec.onHandled = examineEvent;

    return qq.extend(this, new qq.FilenameEditHandler(spec, inheritedInternalApi));
};

// Child of FilenameEditHandler.  Used to detect focusin events on file edit input elements.
qq.FilenameInputFocusInHandler = function(s, inheritedInternalApi) {
    "use strict";

    var spec = {
            templating: null,
            onGetUploadStatus: function(fileId) {},
            log: function(message, lvl) {}
    };

    if (!inheritedInternalApi) {
        inheritedInternalApi = {};
    }

    // This will be called by the parent handler when a `focusin` event is received on the list element.
    function handleInputFocus(target, event) {
        if (spec.templating.isEditInput(target)) {
            var fileId = spec.templating.getFileId(target),
                status = spec.onGetUploadStatus(fileId);

            if (status === qq.status.SUBMITTED) {
                spec.log(qq.format("Detected valid filename input focus event on file '{}', ID: {}.", spec.onGetName(fileId), fileId));
                inheritedInternalApi.handleFilenameEdit(fileId, target);
            }
        }
    }

    spec.eventType = 'focusin';
    spec.onHandled = handleInputFocus;

    qq.extend(spec, s);

    return qq.extend(this, new qq.FilenameEditHandler(spec, inheritedInternalApi));
};

/**
 * Child of FilenameInputFocusInHandler.  Used to detect focus events on file edit input elements.  This child module is only
 * needed for UAs that do not support the focusin event.  Currently, only Firefox lacks this event.
 *
 * @param spec Overrides for default specifications
 */
qq.FilenameInputFocusHandler = function(spec) {
    "use strict";

    spec.eventType = 'focus';
    spec.attachTo = null;

    return qq.extend(this, new qq.FilenameInputFocusInHandler(spec, {}));
};

// Handles edit-related events on a file item (FineUploader mode).  This is meant to be a parent handler.
// Children will delegate to this handler when specific edit-related actions are detected.
qq.FilenameEditHandler = function(s, inheritedInternalApi) {
    "use strict";

    var spec = {
            templating: null,
            log: function(message, lvl) {},
            onGetUploadStatus: function(fileId) {},
            onGetName: function(fileId) {},
            onSetName: function(fileId, newName) {},
            onEditingStatusChange: function(fileId, isEditing) {}
        },
        publicApi;

    function getFilenameSansExtension(fileId) {
        var filenameSansExt = spec.onGetName(fileId),
            extIdx = filenameSansExt.lastIndexOf('.');

        if (extIdx > 0) {
            filenameSansExt = filenameSansExt.substr(0, extIdx);
        }

        return filenameSansExt;
    }

    function getOriginalExtension(fileId) {
        var origName = spec.onGetName(fileId);
        return qq.getExtension(origName);
    }

    // Callback iff the name has been changed
    function handleNameUpdate(newFilenameInputEl, fileId) {
        var newName = newFilenameInputEl.value,
            origExtension;

        if (newName !== undefined && qq.trimStr(newName).length > 0) {
            origExtension = getOriginalExtension(fileId);

            if (origExtension !== undefined) {
                newName = newName + "." + origExtension;
            }

            spec.onSetName(fileId, newName);
        }

        spec.onEditingStatusChange(fileId, false);
    }

    // The name has been updated if the filename edit input loses focus.
    function registerInputBlurHandler(inputEl, fileId) {
        inheritedInternalApi.getDisposeSupport().attach(inputEl, 'blur', function() {
            handleNameUpdate(inputEl, fileId)
        });
    }

    // The name has been updated if the user presses enter.
    function registerInputEnterKeyHandler(inputEl, fileId) {
        inheritedInternalApi.getDisposeSupport().attach(inputEl, 'keyup', function(event) {

            var code = event.keyCode || event.which;

            if (code === 13) {
                handleNameUpdate(inputEl, fileId)
            }
        });
    }

    qq.extend(spec, s);

    spec.attachTo = spec.templating.getFileList();

    publicApi = qq.extend(this, new qq.UiEventHandler(spec, inheritedInternalApi));

    qq.extend(inheritedInternalApi, {
        handleFilenameEdit: function(id, target, focusInput) {
            var newFilenameInputEl = spec.templating.getEditInput(id);

            spec.onEditingStatusChange(id, true);

            newFilenameInputEl.value = getFilenameSansExtension(id);

            if (focusInput) {
                newFilenameInputEl.focus();
            }

            registerInputBlurHandler(newFilenameInputEl, id);
            registerInputEnterKeyHandler(newFilenameInputEl, id);
        }
    });

    return publicApi;
};

/*globals jQuery, qq*/
(function($) {
    "use strict";
    var $el,
        pluginOptions = ['uploaderType', 'endpointType'];

    function init(options) {
        if (options) {
            var xformedOpts = transformVariables(options),
                newUploaderInstance = getNewUploaderInstance(xformedOpts);

            uploader(newUploaderInstance);
            addCallbacks(xformedOpts, newUploaderInstance);
        }

        return $el;
    }

    function getNewUploaderInstance(params) {
        var uploaderType = pluginOption('uploaderType'),
            namespace = pluginOption('endpointType');

        // If the integrator has defined a specific type of uploader to load, use that, otherwise assume `qq.FineUploader`
        if (uploaderType) {
            // We can determine the correct constructor function to invoke by combining "FineUploader"
            // with the upper camel cased `uploaderType` value.
            uploaderType = uploaderType.charAt(0).toUpperCase() + uploaderType.slice(1).toLowerCase();

            if (namespace) {
                return new qq[namespace]["FineUploader" + uploaderType](params);
            }

            return new qq["FineUploader" + uploaderType](params);
        }
        else {
            if (namespace) {
                return new qq[namespace]["FineUploader"](params);
            }

            return new qq.FineUploader(params);
        }
    }

    function dataStore(key, val) {
        var data = $el.data('fineuploader');

        if (val) {
            if (data === undefined) {
                data = {};
            }
            data[key] = val;
            $el.data('fineuploader', data);
        }
        else {
            if (data === undefined) {
                return null;
            }
            return data[key];
        }
    }

    //the underlying Fine Uploader instance is stored in jQuery's data stored, associated with the element
    // tied to this instance of the plug-in
    function uploader(instanceToStore) {
        return dataStore('uploader', instanceToStore);
    }

    function pluginOption(option, optionVal) {
        return dataStore(option, optionVal);
    }

    // Implement all callbacks defined in Fine Uploader as functions that trigger appropriately names events and
    // return the result of executing the bound handler back to Fine Uploader
    function addCallbacks(transformedOpts, newUploaderInstance) {
        var callbacks = transformedOpts.callbacks = {};

        $.each(newUploaderInstance._options.callbacks, function(prop, nonJqueryCallback) {
            var name, callbackEventTarget;

            name = /^on(\w+)/.exec(prop)[1];
            name = name.substring(0, 1).toLowerCase() + name.substring(1);
            callbackEventTarget = $el;

            callbacks[prop] = function() {
                var originalArgs = Array.prototype.slice.call(arguments),
                    transformedArgs = [],
                    nonJqueryCallbackRetVal, jqueryEventCallbackRetVal;

                $.each(originalArgs, function(idx, arg) {
                    transformedArgs.push(maybeWrapInJquery(arg));
                });

                nonJqueryCallbackRetVal = nonJqueryCallback.apply(this, originalArgs);
                jqueryEventCallbackRetVal = callbackEventTarget.triggerHandler(name, transformedArgs);

                if (nonJqueryCallbackRetVal != null) {
                    return nonJqueryCallbackRetVal;
                }
                return jqueryEventCallbackRetVal;
            };
        });

        newUploaderInstance._options.callbacks = callbacks;
    }

    //transform jQuery objects into HTMLElements, and pass along all other option properties
    function transformVariables(source, dest) {
        var xformed, arrayVals;

        if (dest === undefined) {
            if (source.uploaderType !== 'basic') {
                xformed = { element : $el[0] };
            }
            else {
                xformed = {};
            }
        }
        else {
            xformed = dest;
        }

        $.each(source, function(prop, val) {
            if ($.inArray(prop, pluginOptions) >= 0) {
                pluginOption(prop, val);
            }
            else if (val instanceof $) {
                xformed[prop] = val[0];
            }
            else if ($.isPlainObject(val)) {
                xformed[prop] = {};
                transformVariables(val, xformed[prop]);
            }
            else if ($.isArray(val)) {
                arrayVals = [];
                $.each(val, function(idx, arrayVal) {
                    var arrayObjDest = {};

                    if (arrayVal instanceof $) {
                        $.merge(arrayVals, arrayVal);
                    }
                    else if ($.isPlainObject(arrayVal)) {
                        transformVariables(arrayVal, arrayObjDest);
                        arrayVals.push(arrayObjDest);
                    }
                    else {
                        arrayVals.push(arrayVal);
                    }
                });
                xformed[prop] = arrayVals;
            }
            else {
                xformed[prop] = val;
            }
        });

        if (dest === undefined) {
            return xformed;
        }
    }

    function isValidCommand(command) {
        return $.type(command) === "string" &&
            !command.match(/^_/) && //enforce private methods convention
            uploader()[command] !== undefined;
    }

    // Assuming we have already verified that this is a valid command, call the associated function in the underlying
    // Fine Uploader instance (passing along the arguments from the caller) and return the result of the call back to the caller
    function delegateCommand(command) {
        var xformedArgs = [],
            origArgs = Array.prototype.slice.call(arguments, 1),
            retVal;

        transformVariables(origArgs, xformedArgs);

        retVal = uploader()[command].apply(uploader(), xformedArgs);

        return maybeWrapInJquery(retVal);
    }

    // If the value is an `HTMLElement` or `HTMLDocument`, wrap it in a `jQuery` object
    function maybeWrapInJquery(val) {
        var transformedVal = val;

        // If the command is returning an `HTMLElement` or `HTMLDocument`, wrap it in a `jQuery` object
        if(val != null && typeof val === "object"
            && (val.nodeType === 1 || val.nodeType === 9)
            && val.cloneNode) {

            transformedVal = $(val);
        }

        return transformedVal;
    }

    $.fn.fineUploader = function(optionsOrCommand) {
        var self = this, selfArgs = arguments, retVals = [];

        this.each(function(index, el) {
            $el = $(el);

            if (uploader() && isValidCommand(optionsOrCommand)) {
                retVals.push(delegateCommand.apply(self, selfArgs));

                if (self.length === 1) {
                    return false;
                }
            }
            else if (typeof optionsOrCommand === 'object' || !optionsOrCommand) {
                init.apply(self, selfArgs);
            }
            else {
                $.error('Method ' +  optionsOrCommand + ' does not exist on jQuery.fineUploader');
            }
        });

        if (retVals.length === 1) {
            return retVals[0];
        }
        else if (retVals.length > 1) {
            return retVals;
        }

        return this;
    };

}(jQuery));

/*globals jQuery, qq*/
(function($) {
    "use strict";
    var rootDataKey = "fineUploaderDnd",
        $el;

    function init (options) {
        if (!options) {
            options = {};
        }

        options.dropZoneElements = [$el];
        var xformedOpts = transformVariables(options);
        addCallbacks(xformedOpts);
        dnd(new qq.DragAndDrop(xformedOpts));

        return $el;
    };

    function dataStore(key, val) {
        var data = $el.data(rootDataKey);

        if (val) {
            if (data === undefined) {
                data = {};
            }
            data[key] = val;
            $el.data(rootDataKey, data);
        }
        else {
            if (data === undefined) {
                return null;
            }
            return data[key];
        }
    };

    function dnd(instanceToStore) {
        return dataStore('dndInstance', instanceToStore);
    };

    function addCallbacks(transformedOpts) {
        var callbacks = transformedOpts.callbacks = {},
            dndInst = new qq.FineUploaderBasic();

        $.each(new qq.DragAndDrop.callbacks(), function(prop, func) {
            var name = prop,
                $callbackEl;

            $callbackEl = $el;

            callbacks[prop] = function() {
                var args = Array.prototype.slice.call(arguments),
                    jqueryHandlerResult = $callbackEl.triggerHandler(name, args);

                return jqueryHandlerResult;
            };
        });
    };

    //transform jQuery objects into HTMLElements, and pass along all other option properties
    function transformVariables(source, dest) {
        var xformed, arrayVals;

        if (dest === undefined) {
            xformed = {};
        }
        else {
            xformed = dest;
        }

        $.each(source, function(prop, val) {
            if (val instanceof $) {
                xformed[prop] = val[0];
            }
            else if ($.isPlainObject(val)) {
                xformed[prop] = {};
                transformVariables(val, xformed[prop]);
            }
            else if ($.isArray(val)) {
                arrayVals = [];
                $.each(val, function(idx, arrayVal) {
                    if (arrayVal instanceof $) {
                        $.merge(arrayVals, arrayVal);
                    }
                    else {
                        arrayVals.push(arrayVal);
                    }
                });
                xformed[prop] = arrayVals;
            }
            else {
                xformed[prop] = val;
            }
        });

        if (dest === undefined) {
            return xformed;
        }
    };

    function isValidCommand(command) {
        return $.type(command) === "string" &&
            command === "dispose" &&
            dnd()[command] !== undefined;
    };

    function delegateCommand(command) {
        var xformedArgs = [], origArgs = Array.prototype.slice.call(arguments, 1);
        transformVariables(origArgs, xformedArgs);
        return dnd()[command].apply(dnd(), xformedArgs);
    };

    $.fn.fineUploaderDnd = function(optionsOrCommand) {
        var self = this, selfArgs = arguments, retVals = [];

        this.each(function(index, el) {
            $el = $(el);

            if (dnd() && isValidCommand(optionsOrCommand)) {
                retVals.push(delegateCommand.apply(self, selfArgs));

                if (self.length === 1) {
                    return false;
                }
            }
            else if (typeof optionsOrCommand === 'object' || !optionsOrCommand) {
                init.apply(self, selfArgs);
            }
            else {
                $.error("Method " +  optionsOrCommand + " does not exist in Fine Uploader's DnD module.");
            }
        });

        if (retVals.length === 1) {
            return retVals[0];
        }
        else if (retVals.length > 1) {
            return retVals;
        }

        return this;
    };

}(jQuery));

/*! 2013-11-20 */
