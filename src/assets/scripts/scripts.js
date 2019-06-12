// Exif orientation value to css transform mapping
// Does not include flipped orientations
var rotation = {
    1: 'rotate(0deg)',
    3: 'rotate(180deg)',
    6: 'rotate(90deg)',
    8: 'rotate(270deg)'
};

function _arrayBufferToBase64(buffer) {
    var binary = ''
    var bytes = new Uint8Array(buffer)
    var len = bytes.byteLength;
    for (var i = 0; i < len; i++) {
        binary += String.fromCharCode(bytes[i])
    }
    return window.btoa(binary);
}
var orientation = function(file, callback) {
    var fileReader = new FileReader();
    fileReader.onloadend = function() {
        var base64img = "data:" + file.type + ";base64," + _arrayBufferToBase64(fileReader.result);
        var scanner = new DataView(fileReader.result);
        var idx = 0;
        var value = 1; // Non-rotated is the default
        if (fileReader.result.length < 2 || scanner.getUint16(idx) != 0xFFD8) {
            // Not a JPEG
            if (callback) {
                callback(base64img, value);
            }
            return;
        }
        idx += 2;
        var maxBytes = scanner.byteLength;
        while (idx < maxBytes - 2) {
            var uint16 = scanner.getUint16(idx);
            idx += 2;
            switch (uint16) {
                case 0xFFE1: // Start of EXIF
                    var exifLength = scanner.getUint16(idx);
                    maxBytes = exifLength - idx;
                    idx += 2;
                    break;
                case 0x0112: // Orientation tag
                    // Read the value, its 6 bytes further out
                    // See page 102 at the following URL
                    // http://www.kodak.com/global/plugins/acrobat/en/service/digCam/exifStandard2.pdf
                    value = scanner.getUint16(idx + 6, false);
                    maxBytes = 0; // Stop scanning
                    break;
            }
        }
        if (callback) {
            callback(base64img, value);
        }
    }
    fileReader.readAsArrayBuffer(file);
};

// Element.closest
(function (ElementProto) {
	if (typeof ElementProto.matches !== 'function') {
		ElementProto.matches = ElementProto.msMatchesSelector || ElementProto.mozMatchesSelector || ElementProto.webkitMatchesSelector || function matches(selector) {
			var element = this;
			var elements = (element.document || element.ownerDocument).querySelectorAll(selector);
			var index = 0;

			while (elements[index] && elements[index] !== element) {
				++index;
			}

			return Boolean(elements[index]);
		};
	}

	if (typeof ElementProto.closest !== 'function') {
		ElementProto.closest = function closest(selector) {
			var element = this;

			while (element && element.nodeType === 1) {
				if (element.matches(selector)) {
					return element;
				}

				element = element.parentNode;
			}

			return null;
		};
	}
})(window.Element.prototype);

var sessionStorage_transfer = function(event) {
    if(!event) { event = window.event; }
    if(!event.newValue) return;
    if (event.key === 'getSessionStorage') {
        localStorage.setItem('sessionStorage', JSON.stringify(sessionStorage));
        localStorage.removeItem('sessionStorage');
    } else if (event.key === 'sessionStorage' && !sessionStorage.length) {
        var data = JSON.parse(event.newValue);
        for (var key in data) {
            sessionStorage.setItem(key, data[key]);
        }
    }
};

if(window.addEventListener) {
    window.addEventListener("storage", sessionStorage_transfer, false);
} else {
    window.attachEvent("onstorage", sessionStorage_transfer);
};

if (!sessionStorage.length) {
    localStorage.setItem('getSessionStorage', 'foobar');
    localStorage.removeItem('getSessionStorage');
};