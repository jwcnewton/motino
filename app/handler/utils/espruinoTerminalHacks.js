var displayTimeout = null;


// Text to be displayed in the terminal
var termText = [""];
// Map of terminal line number to text to display before it
var termExtraText = {};

var termCursorX = 0;
var termCursorY = 0;
var termControlChars = [];

// maximum lines on the terminal
var MAX_LINES = 2048;

function trimRight(str) {
    var s = str.length - 1;
    while (s > 0 && str[s] == " ") s--;
    return str.substr(0, s + 1);
}

/// Called when data comes OUT of Espruino INTO the terminal
function outputDataHandler(readData) {
    if ("string" == typeof readData) {
        readData = readData.split("").map(function (x) { return x.charCodeAt(); });
    }
    // Text to be displayed in the terminal
    termText = [""];
    termExtraText = {};
    displayData = [];
    // Add data to our buffer
    var bufView = new Uint8Array(readData);
    searchData(bufView);
    for (var i = 0; i < bufView.length; i++) {
        displayData.push(bufView[i]);
    }

    for (i in displayData) {
        handleReceivedCharacter(displayData[i]);
    }
    return updateTerminal();
}

var receivedData = "";
function searchData(bytes) {
    var si, ei;
    for (var i = 0; i < bytes.length; i++) {
        receivedData += String.fromCharCode(bytes[i]);
    }
    si = receivedData.indexOf("<<<<<");
    if (si >= 0) {
        receivedData = receivedData.substr(si);
        ei = receivedData.indexOf(">>>>>");
        if (ei > 0) {
            receivedData = receivedData.substr(5, ei - 5);
            Espruino.callProcessor("getWatched", receivedData, function () { });
            receivedData = "";
        }
    }
    else { receivedData = ""; }
}

var handleReceivedCharacter = function (/*char*/ch) {
    //console.log("IN = "+ch);
    if (termControlChars.length == 0) {
        switch (ch) {
            case 8: {
                if (termCursorX > 0) termCursorX--;
            } break;
            case 10: { // line feed
                Espruino.callProcessor("terminalNewLine", termText[termCursorY]);
                termCursorX = 0; termCursorY++;
                while (termCursorY >= termText.length) termText.push("");
            } break;
            case 13: { // carriage return
                termCursorX = 0;
            } break;
            case 27: {
                termControlChars = [27];
            } break;
            case 19: break; // XOFF
            case 17: break; // XON
            case 0xC2: break; // UTF8 for <255 - ignore this
            default: {
                // Else actually add character
                if (termText[termCursorY] === undefined) termText[termCursorY] = "";
                termText[termCursorY] = trimRight(
                    Espruino.Core.Utils.getSubString(termText[termCursorY], 0, termCursorX) +
                    String.fromCharCode(ch) +
                    Espruino.Core.Utils.getSubString(termText[termCursorY], termCursorX + 1));
                termCursorX++;
                // check for the 'prompt', eg '>' or 'debug>'
                // if we have it, send a 'terminalPrompt' message
                if (ch == ">".charCodeAt(0)) {
                    var prompt = termText[termCursorY];
                    if (prompt == ">" || prompt == "debug>")
                        Espruino.callProcessor("terminalPrompt", prompt);
                }
            }
        }
    } else if (termControlChars[0] == 27) { // Esc
        if (termControlChars[1] == 91) { // Esc [
            if (termControlChars[2] == 63) {
                if (termControlChars[3] == 55) {
                    if (ch != 108)
                        console.log("Expected 27, 91, 63, 55, 108 - no line overflow sequence");
                    termControlChars = [];
                } else {
                    if (ch == 55) {
                        termControlChars = [27, 91, 63, 55];
                    } else termControlChars = [];
                }
            } else {
                termControlChars = [];
                switch (ch) {
                    case 63: termControlChars = [27, 91, 63]; break;
                    case 65: if (termCursorY > 0) termCursorY--; break; // up  FIXME should add extra lines in...
                    case 66: termCursorY++; while (termCursorY >= termText.length) termText.push(""); break;  // down FIXME should add extra lines in...
                    case 67: termCursorX++; break; // right
                    case 68: if (termCursorX > 0) termCursorX--; break; // left
                    case 74: termText[termCursorY] = termText[termCursorY].substr(0, termCursorX); // Delete to right + down
                        termText = termText.slice(0, termCursorY + 1);
                        break;
                    case 75: termText[termCursorY] = termText[termCursorY].substr(0, termCursorX); break; // Delete to right
                }
            }
        } else {
            switch (ch) {
                case 91: {
                    termControlChars = [27, 91];
                } break;
                default: {
                    termControlChars = [];
                }
            }
        }
    } else termControlChars = [];
};


var updateTerminal = function () {
    elements = [];
    var elements = [];
    // now write this to the screen
    var t = [];
    var terminal = [];
    for (var y in termText) {
        var line = termText[y];
        line = Espruino.Core.Utils.escapeHTML(line);
        // handle URLs
        line = line.replace(/(https?:\/\/[-a-zA-Z0-9@:%._\+~#=\/\?]+)/g, '<a href="$1" target="_blank">$1</a>');
        
        // detect inline images and link them in
        var m = line.match(/data:image\/\w+;base64,[\w\+\/=]+/);
        if (m) {
            line = line.substr(0, m.index) + '<a href="' + m[0] + '" download><img class="terminal-inline-image" src="' + m[0] + '"/></a>' + line.substr(m.index + m[0].length);
        }

        // extra text is for stuff like tutorials
        if (termExtraText[y]) {
            line = termExtraText[y] + line;
        }

        elements[y] = line;
        terminal.push(line);
    }
    return terminal;
};


module.exports = {
    outputDataHandler: outputDataHandler
}