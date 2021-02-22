(function () {
    const path = require('path');

    function uriFromPath(_path) {
        var pathName = path.resolve(_path).replace(/\\/g, '/');
        if (pathName.length > 0 && pathName.charAt(0) !== '/') {
            pathName = '/' + pathName;
        }
        return encodeURI('file://' + pathName);
    }

    window.amdRequire.config({
        baseUrl: uriFromPath(path.join(__dirname, dirRoot + 'node_modules/monaco-editor/min')),
    });

    // workaround monaco-css not understanding the environment
    self.module = undefined;

    window.amdRequire(['vs/editor/editor.main'], function () {
        var editor = monaco.editor.create(document.getElementById('editor'), {
            value: 'console.log("Hello world!");',
            language: 'javascript',
            theme: 'vs-dark'
        });
        // Add an overlay widget
        var overlayWidget = {
            domNode: null,
            getId: function () {
                return 'my.overlay.widget';
            },
            getDomNode: function () {
                if (!this.domNode) {
                    this.domNode = document.createElement('div');
                    this.domNode.className = 'expando'

                    var aTag = document.createElement('a');
                    aTag.href = "#";
                    aTag.id = "expando";
                    aTag.style.color = "white";

                    var ico = document.createElement('i');
                    ico.className = "fa fa-expand"

                    aTag.appendChild(ico);
                    this.domNode.appendChild(aTag);
                }
                return this.domNode;
            },
            getPosition: function () {
                return {
                    preference: [monaco.editor.ContentWidgetPositionPreference.ABOVE, monaco.editor.ContentWidgetPositionPreference.BELOW]
                };
            }
        };

        var originalSerializeArray = $.fn.serializeArray;
        // POLYFILL - Serialize checkboxes
        $.fn.extend({
            serializeToFlatObject: function () {
                var brokenSerialization = originalSerializeArray.apply(this);
                var checkboxValues = $(this).find('input[type=checkbox]').map(function () {
                    return { 'name': this.name, 'value': this.checked };
                }).get();
                var checkboxKeys = $.map(checkboxValues, function (element) { return element.name; });
                var withoutCheckboxes = $.grep(brokenSerialization, function (element) {
                    return $.inArray(element.name, checkboxKeys) == -1;
                });
                return $.merge(withoutCheckboxes, checkboxValues).reduce((a, x) => ({ ...a, [x.name]: x.value }), {});;
            }
        });
        editor.addOverlayWidget(overlayWidget);
        window.amdRequire('./eventListener')(editor);
    });
})();