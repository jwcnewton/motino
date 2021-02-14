window.amdDefine('eventListener', [], function () {
    const ipc = require('electron').ipcRenderer;

    function settings(params) {
        var modal = document.getElementById("settings-modal");
        var modalSave = document.getElementById("modal-save");

        var span = document.getElementsByClassName("close")[0];
        modal.style.display = "block";

        span.onclick = function () {
            modal.style.display = "none";
        }

        window.onclick = function (event) {
            if (event.target == modal) {
                modal.style.display = "none";
            }
        }

        modalSave.onclick = function (event) {
            var form = document.getElementById("settings-form");
            const settings = {};
            for (let i = 0; i < form.elements.length; i++) {
                const elem = form.elements[i];
                settings[elem.name] = elem.value
            }
            ipc.send('settings', settings);

            modal.style.display = "none";
        }
    }
    function open() {
        ipc.send('open', 'open!');
    }
    function run() {
        const code = this.editor.getModel().getValue();
        ipc.send('run', code);
    }
    function download(params) {
        ipc.send('download', 'download!');
    }
    function clear(params) {

        ipc.send('clear', '');
        this.editor.getModel().setValue('');
    }

    function writeToToast(readResponse) {
        var toast = document.getElementById("toast");

        toast.className = "show";
        toast.innerText = readResponse;

        setTimeout(function () {
            toast.className =
                toast.className.replace("show", "");
        }, 3000);
    }

    function writeToTerm(readResponse) {
        var term = document.getElementById("terminal");
        readResponse = readResponse.replace("[?7l", "");
        term.innerText = readResponse;
    }

    function writeToSettings(settings) {
        var formData = document.getElementById('settings-form');
        for (let setting in settings) {
            try {
                formData.querySelector(`*[name="${setting}"]`).value = settings[setting];
            } catch (error) {
                console.error(error);
            }
        }
    }

    function registerEventListener() {
        document.getElementById("settings").onclick = settings;
        document.getElementById("open").onclick = open;
        document.getElementById("run").onclick = run.bind(this);
        document.getElementById("download").onclick = download;
        document.getElementById("clear").onclick = clear.bind(this);

        registerEvents();
    }

    function registerEvents() {
        var that = this;

        ipc.on('writeContent', (event, code) => {
            that.editor.getModel().setValue(code);
        });

        ipc.on('readResponse', (event, readResponse) => {
            writeToToast(readResponse)
        });

        ipc.on('termOutput', (event, readResponse) => {
            writeToTerm(readResponse)
        });

        ipc.on('writeSettings', (event, readResponse) => {
            writeToSettings(readResponse)
        });

        ipc.send('getSettings', '');
    }

    return function (editor) {
        this.editor = editor;

        registerEventListener();
    };
});