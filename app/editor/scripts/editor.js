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
        baseUrl: uriFromPath(path.join(__dirname, dirRoot+'node_modules/monaco-editor/min')),
    });

    // workaround monaco-css not understanding the environment
    self.module = undefined;

    window.amdRequire(['vs/editor/editor.main'], function () {
        var editor = monaco.editor.create(document.getElementById('editor'), {
            value: 'console.log("Hello world!");',
            language: 'javascript',
            theme: 'vs-dark',
            automaticLayout: true
        });
        
        window.amdRequire('./eventListener')(editor);
    });
})();