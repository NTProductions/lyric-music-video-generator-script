
var items = [];
var itemNames = [];

var audio = [];
var audioNames = [];

var window = new Window("palette", "Lyric Music Video Generator", undefined);
window.orientation = "column";

var groupOne = window.add("group", undefined, "groupOne");
var fileEditText = groupOne.add("edittext", undefined, "Select lyric file");
fileEditText.size = [210, 25];
var fileButton = groupOne.add("button", undefined, "...");
fileButton.size = [25, 25];

var musicGroup = window.add("group", undefined, "musicGroup");
var audioText = musicGroup.add("statictext", undefined, "Audio Track:");
var audioDD = musicGroup.add("dropdownlist", undefined, getAudioItems());
audioDD.selection = 0;
audioDD.size = [200, 25];

var groupTwo = window.add("group", undefined, "groupOne");
var styleText = groupTwo.add("statictext", undefined, "Animation Style:");
var styleDD = groupTwo.add("dropdownlist", undefined, ["Opacity", "Position", "Scale"]);
styleDD.selection = 0;
styleDD.size = [90, 25];
var lyricStartText = groupTwo.add("statictext", undefined, "startSecs");
var lyricStartEditText = groupTwo.add("edittext", undefined, "0");
lyricStartEditText.characters = 2;

var groupThree = window.add("group", undefined, "groupOne");
var bgText = groupThree.add("statictext", undefined, "Background Layer:");
var bgDD = groupThree.add("dropdownlist", undefined, getFootageItems());
bgDD.selection = 0;
bgDD.size = [170, 25];

var buttonGroup = window.add("group", undefined, "buttonGroup");
buttonGroup.orientation = "row";
var generateButton = buttonGroup.add("button", undefined, "Generate");
var applyMarkersButton = buttonGroup.add("button", undefined, "applyMarkers");
applyMarkersButton.enabled = false;

// use a txt to bring in the lyrics

window.center();
window.show();

fileButton.onClick = function() {
        var tempTextFile = new File;
        
        tempTextFile = tempTextFile.openDlg("Select your lyric text file", "*.txt", false);
        if(tempTextFile != null) {
                fileEditText.text = tempTextFile.fsName.replace(/%20/g, " ");
            }
    }

generateButton.onClick = function() {
        if(!File(fileEditText.text).exists) {
            alert("Please select a lyric text file first");
            return false;
            }
        
        fileEditText.enabled = false;
        audioDD.enabled = false;
        styleDD.enabled = false;
        fileButton.enabled = false;
        bgDD.enabled = false;
        generateButton.enabled = false;
        lyricStartEditText.enabled = false;
        applyMarkersButton.enabled = true;
        main(File(fileEditText.text), audio[audioDD.selection.index], styleDD.selection, parseInt(lyricStartEditText.text), items[bgDD.selection.index]);
    }

applyMarkersButton.onClick = function() {
        if(app.project.activeItem == null || !(app.project.activeItem instanceof CompItem)) {
            alert("Please select your comp with lyric markers");
            return false;
            }
        
        fileEditText.enabled = true;
        audioDD.enabled = true;
        styleDD.enabled = true;
        fileButton.enabled = true;
        bgDD.enabled = true;
        generateButton.enabled = true;
        lyricStartEditText.enabled = true;
        applyMarkersButton.enabled = false;
        applyMarkers(styleDD.selection);
    }

function applyMarkers(styleString) {
        app.beginUndoGroup("Markers to Lyrics");
        // styleString guide
        // Opacity - fading in/out
        // Position - moving in and off frame
        // Scale - scaling up and down from 0-100
        
        var comp = app.project.activeItem;
        var controlNull = comp.layer(1);
        
        var thisTextLyric, colourControlEffect, thisFillEffect;
        
        colourControlEffect = controlNull.Effects.addProperty("ADBE Color Control");
        colourControlEffect.name = "Text Colour";
        colourControlEffect.property(1).setValue([1, 1, 1]);
        
        for(var i = controlNull.property("Marker").numKeys; i > 0; i--) {
            thisTextLyric = comp.layers.addText(controlNull.property("Marker").keyValue(i).comment);
            thisTextLyric.inPoint = controlNull.property("Marker").keyTime(i);
            thisFillEffect = thisTextLyric.Effects.addProperty("ADBE Fill");
            thisFillEffect.property("ADBE Fill-0002").expression = 'thisComp.layer("Control Null").effect("Text Colour")("Color")';
            thisTextLyric.motionBlur = true;
            thisTextLyric.property("ADBE Transform Group").property("ADBE Scale").expression ='maxW = ' + (comp.width*.8).toString() + ';\rmaxH = ' + (comp.height*.65).toString() +';\rr = sourceRectAtTime(time);\rw = r.width;\rh = r.height;\rs = w/h > maxW/maxH ? maxW/w : maxH/h;\r[100, 100]*s';
            if(i != controlNull.property("Marker").numKeys) {
            thisTextLyric.outPoint = controlNull.property("Marker").keyTime(i+1);
            }
            applyTextStyle(thisTextLyric, styleString);
            }
        
            // remove markers
        for(var i = controlNull.property("Marker").numKeys; i > 0; i--) {
            controlNull.property("Marker").removeKey(i);
            }
        
        controlNull.moveToBeginning();
        controlNull.selected = true;
        
        comp.motionBlur = true;
        
        app.endUndoGroup();
    }

function applyTextStyle(layer, styleString) {
        if(styleString.toString() == "Opacity") {
                layer.property("ADBE Transform Group").property("ADBE Opacity").setValuesAtTimes([layer.inPoint, layer.inPoint+1, layer.outPoint-1, layer.outPoint], [0, 100, 100, 0]);
                }
    
    var randInt = Math.floor(Math.random() * 4);
    var ogPos = layer.property("ADBE Transform Group").property("ADBE Position").value;
    if(styleString.toString() == "Position") {
            switch(randInt) {
                case 0:
                // top
                layer.property("ADBE Transform Group").property("ADBE Position").setValuesAtTimes([layer.inPoint, layer.inPoint+1, layer.outPoint-1, layer.outPoint], [[ogPos[0], -300], ogPos, ogPos, [ogPos[0], -300]]);
                break;
                case 1:
                layer.property("ADBE Transform Group").property("ADBE Position").setValuesAtTimes([layer.inPoint, layer.inPoint+1, layer.outPoint-1, layer.outPoint], [[app.project.activeItem.width+300, ogPos[1]], ogPos, ogPos, [app.project.activeItem.width+300, ogPos[1]]]);
                // right:
                break;
                case 2:
                // bottom
                layer.property("ADBE Transform Group").property("ADBE Position").setValuesAtTimes([layer.inPoint, layer.inPoint+1, layer.outPoint-1, layer.outPoint], [[ogPos[0], app.project.activeItem.height+300], ogPos, ogPos, [ogPos[0], -300]]);
                break;
                case 3:
                // left
                layer.property("ADBE Transform Group").property("ADBE Position").setValuesAtTimes([layer.inPoint, layer.inPoint+1, layer.outPoint-1, layer.outPoint], [[-300, ogPos[1]], ogPos, ogPos, [-300, ogPos[1]]]);
                break;
                }
                }
            
            if(styleString.toString() == "Scale") {
                layer.property("ADBE Transform Group").property("ADBE Scale").setValuesAtTimes([layer.inPoint, layer.inPoint+1, layer.outPoint-1, layer.outPoint], [[0, 0], [100, 100], [100, 100], [0, 0]]);
                }
    }


function main(txtFile, audioItem, styleString, startTime, imageItem) {
    app.beginUndoGroup("Lyric Music Video Setup");
    
    var lyricComp = app.project.items.addComp("Generated Lyric MV", 1920, 1080, 1, audioItem.duration, 30);
    
    var audioLayer = lyricComp.layers.add(audioItem);
    
    var backgroundLayer = lyricComp.layers.add(imageItem);
    fitLayerToComp(backgroundLayer);
    
    var lyricArray = [];
    
    var thisLine;
    txtFile.open("r");
    do {
        thisLine = txtFile.readln();
        if(thisLine != "") {
        lyricArray.push(thisLine);
        }
        } while(!txtFile.eof);
    
    var controlNull = lyricComp.layers.addNull(lyricComp.duration);
    controlNull.name = "Control Null";
    
    var markerTime = startTime;
    var markerTimeIncrement = (lyricComp.duration - markerTime) / lyricArray.length;
    var thisMarker = new MarkerValue("");
    for(var i = 0; i < lyricArray.length; i++) {
        thisMarker.comment = lyricArray[i];
        controlNull.property("Marker").setValueAtTime(markerTime, thisMarker);
        markerTime+=markerTimeIncrement;
        }
    
    lyricComp.openInViewer();
    
    app.endUndoGroup();
    }

function fitLayerToComp(layer) {
    var comp = layer.containingComp;
    
    var myRect = layer.sourceRectAtTime(0, false);
    var myScale = layer.property("ADBE Transform Group").property("ADBE Scale").value;
    var myNewScale = myScale * Math.min (comp.width / myRect.width, comp.height / myRect.height);
	layer.property("ADBE Transform Group").property("ADBE Scale").setValue(myNewScale);
    }

function getFootageItems() {
    items = [];
    itemNames = [];

    for(var i = 1; i <= app.project.numItems; i++) {
        if(app.project.item(i).file) {
            itemNames.push(app.project.item(i).name);
            items.push(app.project.item(i));
            }
        }
    
    return itemNames;
    }

function getAudioItems() {
    audio = [];
    audioNames = [];

    for(var i = 1; i <= app.project.numItems; i++) {
        if(app.project.item(i).hasVideo == false && app.project.item(i).hasAudio == true) {
            audioNames.push(app.project.item(i).name);
            audio.push(app.project.item(i));
            }
        }
    
    return audioNames;
    }