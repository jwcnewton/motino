window.amdDefine('eventListener', [], function () {
    const ipc = require('electron').ipcRenderer;
    this.isExpanded = false;
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
            let settings = $('#settings-form').serializeToFlatObject();
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

    function clear() {
        this.editor.getModel().setValue('');
        $('#terminal-table').empty();
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
        var term = $("#terminal-table");
        for (let y = 0; y < readResponse.length; y++) {
            var prev = y - 1;
            while (prev >= 0 && readResponse[prev] === undefined) prev--;
            var newLine = $("<div class='termLine' lineNumber='" + y + "'>" + readResponse[y] + "</div>");
            newLine.appendTo(term);
        }
    }

    function writeToSettings(settings) {
        var formData = document.getElementById('settings-form');
        for (let setting in settings) {
            try {
                var inputForm = formData.querySelector(`*[name="${setting}"]`).type;
                if (inputForm == "checkbox") {
                    formData.querySelector(`*[name="${setting}"]`).checked = settings[setting];
                } else {
                    formData.querySelector(`*[name="${setting}"]`).value = settings[setting];
                }
            } catch (error) {
                console.error(error);
            }
        }
    }

    function expando() {
        this.isExpanded = !this.isExpanded;

        if (this.isExpanded) {
            document.getElementById("terminal").style.flex = "0%";
            document.getElementById("terminal").style.display = "none";
            document.getElementById("editor").style.flex = "95%";
            this.editor.layout();
        } else {
            document.getElementById("terminal").style.flex = "47.5%";
            document.getElementById("editor").style.flex = "47.5%";
            document.getElementById("terminal").style.display = "flex";
            document.getElementById("editor").style.width = "0%";
            this.editor.layout();
        }
    }

    function registerEventListener() {
        document.getElementById("settings").onclick = settings;
        document.getElementById("open").onclick = open;
        document.getElementById("run").onclick = run.bind(this);
        document.getElementById("download").onclick = download;
        document.getElementById("clear").onclick = clear.bind(this);
        document.getElementById("expando").onclick = expando.bind(this);

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

        ipc.addListener('jam', (event, readResponse) => {
            console.log("JAAAAAM")
        });

        ipc.on('jam', (event, readResponse) => {
            console.log("JAAAAAM")
        });

        ipc.send('getSettings', '');
    }

    return function (editor) {
        this.editor = editor;
        window.onresize = () => {
            editor.layout();
        };

        registerEventListener();
    };
});