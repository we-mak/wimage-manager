/*
 * =====================================================
 * File Manager
 * Sean 
 * Huu Phuoc 
 * Luanphan1994 
 * special thanks to Bruce Doan
 * Version 1.0 Beta - 5 August 2016
 * =====================================================
 */
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

(function() {
    var dump = function(a){console.log(a)}
    var WimageFilemanager = (function() { 
        /* General variables */

        var defaults = {
            url: '',//for backend API connector
            lang: 'vietnamese',
            maxFileUpload: '5',
            maxSizeUpload: '5mb',
            mimeType: ["image/jpeg","image/png"],
            datetimeFormat: 'DD/MM/YYYY',
            idPlugin: 'filemanager'
        }

        var language =  {
            english : {
                rename : "Rename",
                move : "Move",
                delete : "Delete",
                search : "Search",
                placeholderSearch : "Type a name... ",
                upload : "Upload",
                newfolder : "New album",
                openFolder : "Explore image",
                editName : "Edit name",
                preview : "Preview",
                error : {
                    numfile: "Maximum files upload must least than" + ' <span class="non">' + defaults.maxFileUpload + '</span>',
                    mime: "mime type erorr " + ' (<span class="non">' + defaults.mimeType.toString() + '</span>)',
                    size: 'size file must smaller than ' +  ' <span class="non">' + defaults.maxSizeUpload  + '</span>',
                },
                popUp:{
                    rename: {
                        cancel: "Cancel",
                        agree: "OK",
                    },
                    delete:{
                        cancel: "Cancel",
                        agree: "OK",
                        title: "Are you sure ??? ",
                    },
                    move: {
                        cancel: "Cancel",
                        agree: "OK",
                        title: "Move to anoter folder",
                    }
                },
                moveSuccess: "Moving the file successed",
                folder: "Folders are not exists",
            },
            vietnamese : {
                rename : "Sửa tên",
                move : "Chuyển folder",
                delete : "Xóa",
                search : "Tìm kiếm",
                placeholderSearch : "Nhập tên... ",
                upload : "Đăng hình",
                newfolder : "Tạo folder",
                openFolder : "Mở",
                editName : "Sửa tên",
                preview : "Xem",
                error : {
                    numfile: "Số files tối đa là " + ' <span class="non">' + defaults.maxFileUpload + '</span>',
                    mime: "mime type không phù hợp" + ' (<span class="non">' + defaults.mimeType.toString() + '</span>)',
                    size: "kích thước file phải bé hơn "+ ' <span class="non">' + defaults.maxSizeUpload  + '</span>',
                },
                popUp:{
                    rename: {
                        cancel: "Hủy",
                        agree: "Xác nhận",
                    },
                    delete:{
                        cancel: "Hủy",
                        agree: "Xác nhận",
                        title: "Bạn có chắc chắn muốn xóa ??? ",
                    },
                    move: {
                        cancel: "Hủy",
                        agree: "Xác nhận",
                        title: "Di chuyển đển thư mục khác",
                    }
                },
                moveSuccess: "Di chuyển file thành công",
                folder: "Thư mục không tồn tại"
            },
        };

        var defaultsLang = (language[defaults.lang]) ? language[defaults.lang] : language["english"];

        var temp = {
            gridView: '',
            listView: '',
            rename: defaultsLang.rename,
            move: defaultsLang.move,
            del: defaultsLang.delete,
            search: defaultsLang.search,
            upload: defaultsLang.upload,
            addfolder: defaultsLang.newfolder,
            placeholder : defaultsLang.placeholderSearch
        }, 

        btnIcon = {
            gridIcon: '<i class="fa fa-th"></i>',
            listIcon: '<i class="fa fa-list"></i>',
            renameIcon: '<i class="fa fa-pencil"></i>',
            moveIcon: '<i class="fa fa-clipboard"></i>',
            deleteIcon: '<i class="fa fa-trash"></i>',
            uploadIcon: '<i class="fa fa-file-image-o"></i>',
            addfolderIcon: '<i class="fa fa-folder-open"></i>'
        },
        files = {
            fileType: '',
            fileURL: '',
            fileId: '',
            fileName: '',
            createDate: '',
            latestUpdate: ''
        };
        /* context menu variables */
        var cMenuTitle = {
                             default: {
                             createFolder: defaultsLang.newfolder,
                             upload: defaultsLang.upload
                             },
                             folder: {
                               explore: defaultsLang.openFolder,
                               editName: defaultsLang.editName,
                               del: defaultsLang.delete
                             },
                             image: {
                             preview: defaultsLang.preview,
                             editName: defaultsLang.editName,
                             changeFolder: defaultsLang.move,
                             del: defaultsLang.delete
                           }
          },
              cMenuIcons = {
                             default: {
                             createFolder: '<i class="fa fa-folder"></i>',
                             upload: '<i class="fa fa-upload"></i>'
                             },
                             folder: {
                               explore: '<i class="fa fa-folder-open"></i>',
                               editName: '<i class="fa fa-edit"></i>',
                               del: '<i class="fa fa-trash"></i>'
                             },
                             image: {
                             preview: '<i class="fa fa-eye"></i>',
                             editName: '<i class="fa fa-edit"></i>',
                             changeFolder: '<i class="fa fa-exchange"></i>',
                             del: '<i class="fa fa-trash"></i>'
                           }
          };

        
        /*
        * -----------------
        * Utils functions
        * -----------------
        */  
        
        

        
        //Filter 
        // Looking for child element in depth
        function findChild(parent, child) {
            var children = parent.childNodes;
            var l = children.length;
            for (var i = 0; i < l; i++) {
                if (children[i] == child) {
                    return true;
                } else if (findChild(children[i], child)) {
                    return true;
                }
            }
            return false;
        }
        // Find the exactly child    
        function find(selector, elem) {
            var matches = document.querySelectorAll(selector);
            var l = matches.length;
            for (var i = 0; i < l; i++) {
                if (findChild(matches[i], elem)) {
                    return matches[i];
                }
            }
          return false;
        }

        //Function to check if we clicked inside an element with a particular class name
        function clickInsideElement(e, className ) {
            var el = e.srcElement || e.target;
            if (el.classList.contains(className)){
                return el;
            }
            else {
                while ( el = el.parentNode ) {
                    if ( el.classList && el.classList.contains(className) ) {
                        return el;
                    }
                }
            }
            return false;
        }
        // Get's exact position of event.
        function getPosition(e) {
            var posx = 0;
            var posy = 0;
            if (!e)
                var e = window.event;
            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            }
            else if (e.clientX || e.clientY) {
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            return {
                x: posx,
                y: posy
            }
        }

        /**
         * Create Popup menu
         */

        function createPopup(id,contents,buttons){
            var hugeModal = document.createElement("div");
            hugeModal.classList.add("modal");
            hugeModal.classList.add("fade");
            hugeModal.id = id;

            hugeModal.setAttribute("role", "dialog");

            var parent = document.createElement("div");
            parent.classList.add("modal-dialog");

            var modalContent = document.createElement("div");
            modalContent.classList.add("modal-content");

            var bodyContent = document.createElement("div");
            bodyContent.classList.add("modal-body");

            for(var i in contents){
                var temp = document.createElement("p");
                var text = document.createTextNode(contents[i]);
                temp.appendChild(text);
                bodyContent.appendChild(temp);
            }

            var bodyFooter = document.createElement("div");
            bodyFooter.classList.add("modal-footer");
            bodyFooter.id = "wimage-modal-delete-confirm";

            for(var i in buttons){
                var temp = document.createElement("button");
                temp.setAttribute("type","button");
                temp.classList.add("btn");
                temp.classList.add("btn-" + buttons[i].btn);
                if(buttons[i].id){
                    temp.id = buttons[i].id;
                }
                temp.setAttribute("data-dismiss","modal");
            
                var text = document.createTextNode(buttons[i].content);
                temp.appendChild(text);
                bodyFooter.appendChild(temp);
            }

            modalContent.appendChild(bodyContent);
            modalContent.appendChild(bodyFooter);
            parent.appendChild(modalContent);
            hugeModal.appendChild(parent);
            return hugeModal;
        }

        function createPopupRename(id,buttons){
            var hugeModal = document.createElement("div");
            hugeModal.classList.add("modal");
            hugeModal.classList.add("fade");
            hugeModal.id = id;

            hugeModal.setAttribute("role", "dialog");

            var parent = document.createElement("div");
            parent.classList.add("modal-dialog");

            var modalContent = document.createElement("div");
            modalContent.classList.add("modal-content");

            var bodyContent = document.createElement("div");
            bodyContent.classList.add("modal-body");
            bodyContent.innerHTML = '<input type="text" name="inputFileName" id="nameValue" value="" class="form-control" autofocus/>';
            var bodyFooter = document.createElement("div");
            bodyFooter.classList.add("modal-footer");
            bodyFooter.id = "wimage-modal-rename-confirm";
            bodyFooter.innerHTML = '<div class="col-md-4" id="wimage-rename-samename" style="visibility:'+ 'hidden' +'">The same name</div>';
            var tempDiv = document.createElement("div");
            tempDiv.classList.add('col-md-8');
            for(var i in buttons){
                var temp = document.createElement("button");
                temp.setAttribute("type","button");
                temp.classList.add("btn");
                temp.classList.add("btn-" + buttons[i].btn);
                if(buttons[i].id){
                    temp.id = buttons[i].id;
                }
                temp.setAttribute("data-dismiss","modal");
            
                var text = document.createTextNode(buttons[i].content);
                temp.appendChild(text);
                tempDiv.appendChild(temp);
            }
            bodyFooter.appendChild(tempDiv);
            modalContent.appendChild(bodyContent);
            modalContent.appendChild(bodyFooter);
            parent.appendChild(modalContent);
            hugeModal.appendChild(parent);
            return hugeModal;
        }

        function createPopupMove(id,buttons,contentHeader,className){
            var hugeModal = document.createElement("div");
            hugeModal.classList.add("modal");
            hugeModal.classList.add("fade");
            hugeModal.id = id;

            hugeModal.setAttribute("role", "dialog");

            var parent = document.createElement("div");
            parent.classList.add("modal-dialog");

            var modalContent = document.createElement("div");
            modalContent.classList.add("modal-content");

            var bodyHeader = document.createElement("div");
            bodyHeader.classList.add("modal-header");

            bodyHeader.innerHTML = '<h4> <i class="fa fa-folder-o" aria-hidden="true"></i> ' + contentHeader + '</h4>';

            var bodyContent = document.createElement("div");
            bodyContent.id = "wimage-modal-move-content";
            bodyContent.classList.add("modal-body");

            var bodyFooter = document.createElement("div");
            bodyFooter.classList.add("modal-footer");
            bodyFooter.id = "wimage-modal-confirm";
            bodyFooter.innerHTML = '';
            var tempDiv = document.createElement("div");
            for(var i in buttons){
                var temp = document.createElement("button");
                temp.setAttribute("type","button");
                temp.classList.add("btn");
                temp.classList.add("btn-" + buttons[i].btn);
                if(buttons[i].id){
                    temp.id = buttons[i].id;
                }
                temp.setAttribute("data-dismiss","modal");
            
                var text = document.createTextNode(buttons[i].content);
                temp.appendChild(text);
                tempDiv.appendChild(temp);
            }
            bodyFooter.appendChild(tempDiv);
            modalContent.appendChild(bodyHeader);
            modalContent.appendChild(bodyContent);
            modalContent.appendChild(bodyFooter);
            parent.appendChild(modalContent);
            hugeModal.appendChild(parent);
            return hugeModal;
        }

        function updateContentPopUpRename(className){
            var folders = document.getElementsByClassName(className);
            var length = folders.length;
            var bodyContent = document.getElementById("wimage-modal-move-content");
            bodyContent.innerHTML = '';
            for(var i = 0 ; i < length ; i++){
                var tempNode = folders[i].cloneNode(true);
                tempNode.style.display = "block";
                var classList = tempNode.classList;
                classList.remove("wimage-item-folder");
                classList.add("wimage-popup-folder");
                if(classList.contains("file-selected")){
                    classList.remove("file-selected");
                    classList.add("selected-folder");
                }

                tempNode.firstChild.classList.add("wimage-thumbnail-wrapper-list");
                tempNode.lastChild.classList.add("list-name");
                var span = document.createElement("span");
                span.appendChild(tempNode);
                bodyContent.appendChild(span);
            }
        }

        function isMatch(str,className){
            var allName = document.getElementsByClassName(className);
            var l = allName.length;
            for(var i = l ; i--;){
                var name = allName[i].firstChild.nodeValue;
                if(name === str)
                    return true;
            }
            return false;
        }

        // thêm select class cho hình đc chọn
        function addSelect(img){
            if(img.id !== "wimage-back-path"){
                img.classList.add("file-selected");
            }   
        }

        // remove
        function removeSelect(img){
            img.classList.remove("file-selected");
        }

         //stop event
        function disabled(e){
            e = (e) ? e : window.event;
            e.preventDefault();
            e.stopPropagation();
        }

        // có ít nhất 1 file dc chọn
        function isSelected(){
            var temp = document.getElementsByClassName("file-selected");
            if(temp.length === 0){
                return false;
            }
            return temp.length;
        }

        // active các nút delete move rename nếu có ít nhất 1 file đc chọn
        function activeButton(btn){
            var selected = document.getElementsByClassName("file-selected");
            var l = selected.length;
            if(l){
                for(var i in btn){
                    btn[i].classList.remove("disabled");
                } 
            }else{
                 for(var i in btn){
                    btn[i].classList.add("disabled");
                }
            }
            if(l === 1){
                document.getElementById("wimage-btn-rename").classList.remove("disabled");
                selected = selected[0];
                if(selected.classList.contains("wimage-item-folder")){
                    document.getElementById("wimage-btn-move").classList.add("disabled");
                }
            }else{
                 document.getElementById("wimage-btn-rename").classList.add("disabled");
            }         
        }

        function findSelected(target){
            var classList = target.classList;
            if(classList.contains("wimageThumbnail") || classList.contains("folder-icon")){
                return target.parentNode.parentNode;
            }
            if(classList.contains("ellipsis")){
                return target.parentNode;
            }
            if(classList.contains("wimage-thumbnail-wrapper")){
                return target.parentNode;
            }
            if(classList.contains("wimage-thumbnail-group")){
                return target;
            }
            return null;
        }

        /**
         * trigger event
         */ 
        
        function triggerEvent(el,eventName){
            var event;
            if(document.createEvent){
                event = document.createEvent('HTMLEvents');
                event.initEvent(eventName,true,true);
            }else if(document.createEventObject){// IE < 9
                event = document.createEventObject();
                event.eventType = eventName;
            }
            event.eventName = eventName;
            if(el.dispatchEvent){
                el.dispatchEvent(event);
            }else if(el.fireEvent && htmlEvents['on'+eventName]){// IE < 9
                el.fireEvent('on'+event.eventType,event);// can trigger only real event (e.g. 'click')
            }else if(el[eventName]){
                el[eventName]();
            }else if(el['on'+eventName]){
                el['on'+eventName]();
            }
        }


        function myFadeOut(obj,time,flag){
            var style = getComputedStyle(obj);
            var tempOpacity = style.opacity;
            tempOpacity -= 0.05;
            obj.style.opacity = tempOpacity;
            var id = setTimeout(function(e){
                if(tempOpacity <= 0){
                    if(flag)
                        obj.innerHTML = "";
                    obj.style.display = "none";
                    clearTimeout(id);
                }else{
                    myFadeOut(obj,time,flag);
                }
            },time);
        }

        /*
        * --------------------
        * Initialize Main DOM
        * --------------------
        */
        function AppLayout() {

            var pathHome = '<div class="wimage-path"><i class="fa fa-home" aria-hidden="true"></i><span class="wimage-back-slash">&nbsp;/&nbsp;</span><span id="wimage-back-foldername"></span></div>';

            var html_init = '<div id="wimage-error-upload" class="alert alert-danger"></div>';
                html_init += '<div id="wimage-notice" class="alert alert-success"></div>';
                html_init += '<div class="wimage-group">';
                html_init = html_init + '<div class="navbar"><div class="wimage-header">';

                //switch view, edit group
                html_init = html_init + '<div class="col-md-6 col-sm-12 wimage-toolbar-block">'
                            + '<div class="btn-group"><button id="wimage-btn-grid" type="button"  class="btn btn-default btn-sm active">' + btnIcon.gridIcon + '</button>' 
                            + '<button id="wimage-btn-list" type="button" class="btn btn-default btn-sm">' + btnIcon.listIcon + '</button></div>'
                            + '<div class="btn-group"><button id="wimage-btn-rename" type="button" class="btn btn-default btn-sm disabled">' + btnIcon.renameIcon + temp.rename + '</button>'
                            + '<button id="wimage-btn-move" type="button" class="btn btn-default btn-sm disabled">' + btnIcon.moveIcon + temp.move + '</button>' 
                            + '<button id="wimage-btn-delete" type="button" class="btn btn-default btn-sm disabled">' + btnIcon.deleteIcon + temp.del + '</button></div></div>';  
                //search 
                html_init = html_init + '<div class="col-md-3 col-sm-12 wimage-toolbar-block"> <div class="input-group">'
                            + '<input type="text" class="form-control input-sm" placeholder="' + temp.placeholder + '"><span class="input-group-btn"><button class="btn btn-primary btn-sm" type="button">' 
                            + temp.search + '</button></span></div></div>';
                // upload, create folder
                html_init = html_init + '<div class="col-md-3 col-sm-12 wimage-toolbar-block"><div class="wimage-create-btn-group"><div class="wimage-input-style-group">'
                            + '<input id="file" class="wimage-inputfile" type="file" name="file[]" multiple /><label class="btn btn-default btn-sm" for="file">' + btnIcon.uploadIcon + temp.upload + '</label></div>'   
                            + '<button class="btn btn-default btn-sm" id="wimage-createFolder">' + btnIcon.addfolderIcon + temp.addfolder + '</button></div></div>';

                html_init = html_init + '</div></div>';
                // path folder 
                html_init += pathHome;
                //content
                html_init = html_init + '<div class="wimage-content"><div id="progress_bar"><div class="percent">0%</div></div><output class="wimage-file-group" id="wimage-list"></output></div>';

                html_init = html_init + '</div>';

            var layOut = document.getElementById(defaults.idPlugin);
            return layOut.innerHTML = html_init;   
        }
        AppLayout();
        /*
        * -----------
        * Upload file 
        * -----------
        * re-contribute from http://www.html5rocks.com/en/tutorials/file/dndfiles
        */
      
        var DATA_VALUE = 0; 
      
        function upLoad() {
            var reader,
                progress = document.querySelector('.percent');
            function abortRead() {
                reader.abort();
            }
            function errorHandler(evt) {
                switch(evt.target.error.code) {
                    case evt.target.error.NOT_FOUND_ERR:
                        alert('File Not Found!');
                        break;
                    case evt.target.error.NOT_READABLE_ERR:
                        alert('File is not readable');
                        break;
                    case evt.target.error.ABORT_ERR:
                        break; // noop
                    default:
                        alert('An error occurred reading this file.');
                };
            }


          function updateProgress(evt) {
            // evt is an ProgressEvent.
            if (evt.lengthComputable) {
              var percentLoaded = Math.round((evt.loaded / evt.total) * 100);
              // Increase the progress bar length.
              if (percentLoaded < 100) {
                progress.style.width = percentLoaded + '%';
                progress.textContent = percentLoaded + '%';
              }
            }
          }

          // validate is image and limit mime type
          function validateType(file,mimes){
            var valid = file.type.match("image.*");
            if(valid){
              if(mimes === ""){
                return true;
              }
              var mime = valid.input;
              var l = mimes.length;
              for(var i = 0 ; i < l ; i++){
                if(mimes[i] === mime)
                  return true;
              }
            }
            return false;
          }

          function getSize(size){
            if(size){
              var tail = size.substr(-2,2);
              tail = tail.toLowerCase();
              var temp = size.substr(0,size.length - 2);
              var tempSize = parseInt(temp);
              switch(tail){
                case "kb":{
                  return temp*1024;
                }break;
                case "mb":{
                  return temp*1024*1024;
                }break;
                default:
                  return 1024*1024;
              }
            }
            return 1024*1024;
          }

          function validateSize(file,size){
            return (file.size <= size);
          }

            function setName(str,className){
                if(isMatch(str,className)){
                    var temp = str.split(".");
                    var mime = temp.pop();
                    var pureName = temp.join("");
                    pureName += "(1).";
                    pureName += mime;
                    return setName(pureName,className);
                }
                return str;
            }

        function handleFileSelect(evt) {
              "use strict";
              disabled(evt);
              var errorDiv = document.getElementById("wimage-error-upload");
              var files = evt.target.files; // FileList object
              // Loop through the FileList and render image files as thumbnails.
              var numberFile = files.length;
              var flag = true;
              if(numberFile > defaults.maxFileUpload){
                    flag = false;
              }
              numberFile = (numberFile <= defaults.maxFileUpload) ? numberFile : defaults.maxFileUpload;

                var grid = document.getElementById("wimage-btn-grid");
                var listView = {img: "",name: ""};
                var display = "";
                if(!grid.classList.contains("active")){
                    listView = {img: " wimage-thumbnail-wrapper-list",name: " list-name"};
                    display = ' style="display: block;"';
                }

                var errorFileUpload = [],j = 0;
                if(flag){
                  for (var i = 0; i < numberFile ; i++) {
                    // Only process image files.
                    var fileSize = getSize(defaults.maxSizeUpload);
                    var f1 = validateSize(files[i],fileSize);
                    var f2 = validateType(files[i],defaults.mimeType);
                    if (!f1 || !f2){
                        var tempFile = {};
                        tempFile.file = files[i];
                        if(!f1 && !f2){
                            tempFile.error = 3;
                        }else if(!f1){
                            tempFile.error = 1;
                        }else{
                            tempFile.error = 2;
                        }
                        errorFileUpload.push(tempFile);
                        continue;
                    }
                    // Reset progress indicator on new file selection.
                    progress.style.width = '0%';
                    progress.textContent = '0%';
                    reader = new FileReader();      
                    reader.onerror = errorHandler;
                    reader.onprogress = updateProgress;
                    reader.onabort = function(e) {
                      alert('File read cancelled');
                    };
                    reader.addEventListener('loadstart', function(e) {
                      document.getElementById('progress_bar').className = 'loading';
                    });

                    // Closure to capture the file information.
                    reader.onload = (function(theFile) {
                      return function(e) {
                        // Ensure that the progress bar displays 100% at the end.
                        progress.style.width = '100%';
                        progress.textContent = '100%';
                        setTimeout("document.getElementById('progress_bar').className='';", 800);
                        // Rendering thumbnail.
                        var span = document.createElement('span');
                        var nameFile = setName(theFile.name,"ellipsis");
                        span.innerHTML = [
                                          '<div class="wimage-thumbnail-group wimage-item-image" data-value="'+ (DATA_VALUE++) +'" ' + display + '><div class="wimage-thumbnail-wrapper'+ listView.img +'"><img class="wimageThumbnail" src="', 
                                          e.target.result, '"/></div>' 
                                          + '<p class="ellipsis'+ listView.name +'" id="wimage-filename" title="'+ nameFile +'">' + nameFile + '</p>' // Included file name
                                          + '</div>'].join('');
                        document.getElementById('wimage-list').insertBefore(span, null);               
                      };
                    })(files[i]);
                    // Read in the image file as a data URL.
                    reader.readAsDataURL(files[i]);
                  }
                  var lenghtError = errorFileUpload.length;
                  if(lenghtError > 0){
                        var lengthError = errorFileUpload.length;
                        var temp = "<ul>";
                        for(var i = 0 ; i < lenghtError ; i++){
                            var typeError = errorFileUpload[i].error;
                            temp += '<li><span class="non">'+ errorFileUpload[i].file.name + '</span>';
                            switch(typeError){
                                case 1:{
                                    temp += " " + defaultsLang.error.size;
                                }break;
                                 case 2:{
                                    temp += " " + defaultsLang.error.mime;
                                }break;
                                 case 3:{
                                    temp += " " + defaultsLang.error.size +", " + defaultsLang.error.mime;
                                }break;
                            }
                            temp += "</li>";
                        }

                        temp += "</ul>";
                        errorDiv.innerHTML = temp;
                        errorDiv.style.display = "block";
                        errorDiv.style.opacity = "1";
                        setTimeout(function(){
                            myFadeOut(errorDiv,20,true);
                        },3000);
                  }   
                 }else{
                    errorDiv.innerHTML = '<ul><li>'+ defaultsLang.error.numfile; +'</li></ul>';
                    errorDiv.style.display = "block";
                    errorDiv.style.opacity = "1";
                    setTimeout(function(){
                        myFadeOut(errorDiv,20,true);   
                    },3000);
                }
                evt.target.value = null;
            }
            var file = document.getElementById('file');
            return file.addEventListener('change', handleFileSelect, false);
        }
        upLoad();
        /*
        * -------------
        * create folder 
        * -------------
        */
        function createFolder(id) {
            "use strict";
            var folderIcon = '<div class="folder-icon"></div>',
              create = document.getElementById(id),
              fileCount = 0;

            function fileName() { 
                var nums = fileCount;
                ++fileCount;
                for(var i = 0 ; i <= nums ; i++){
                    var folderName = "Album";
                    folderName = (i === 0) ? folderName : folderName + " (" + i.toString() + ")";
                    
                    if(!isMatch(folderName,"ellipsis")){
                        return folderName;
                    }
                }
                return fileName();
            } 

          //create element when click the button.
          create.addEventListener('click', function(e) {
            "use strict";
            disabled(e);
            if(!create.classList.contains("disabled")){

                var grid = document.getElementById("wimage-btn-grid");
                var listView = {img: "",name: ""};
                var display = "";
                if(!grid.classList.contains("active")){
                    listView = {img: " wimage-thumbnail-wrapper-list",name: " list-name"};
                    display = ' style="display: block;"';
                }

                var folder = document.createElement('span');
                var folderNameGet = fileName();
                folder.innerHTML = ['<div class="wimage-thumbnail-group wimage-item-folder" data-value="'+ (DATA_VALUE++) +'"'+ display +'><div class="wimage-thumbnail-wrapper'+ listView.img +'">' + folderIcon + '</div><p class="ellipsis '+ listView.name +'" id="wimage-filename" title="'+ folderNameGet +'">' + folderNameGet + '</p></div>'];
                document.getElementById('wimage-list').insertBefore(folder, null); 
            }
          });
        }
        createFolder('wimage-createFolder');

        /*
        * -------------
        * context menu 
        * -------------
        */
        var globalBody = document.getElementsByClassName("wimage-group")[0];
        var main = globalBody.lastChild;
        var nav  = globalBody.firstChild;

         //get button for global
        var btnDelete = document.getElementById("wimage-btn-delete");
        var btnMove = document.getElementById("wimage-btn-move");
        var btnRename = document.getElementById("wimage-btn-rename");
        var btnUpload = document.getElementById("file");

        function contextMenu() {
          

        var menuStart = '<menu class="context-menu dropdown-menu" ';
        var menuEnd = '</menu>';
        var lineStart = '<li class="context-menu-item"><button class="context-menu-item-button"';
        var lineMid = '>';
        var lineEnd = '</button></li>';

        document.write(menuStart + 'id="contextMenu">' + 
                        lineStart + 'value="createFolder"' + lineMid + cMenuIcons.default.createFolder + cMenuTitle.default.createFolder + lineEnd + 
                        lineStart + 'value="upload"' + lineMid + cMenuIcons.default.upload + cMenuTitle.default.upload + lineEnd + 
                        menuEnd);
        document.write(menuStart + 'id="contextMenuImage">' +  
                        lineStart + 'value="preview"' + lineMid + cMenuIcons.image.preview + cMenuTitle.image.preview + lineEnd + 
                        lineStart + 'value="editName"' + lineMid + cMenuIcons.image.editName + cMenuTitle.image.editName + lineEnd +
                        lineStart + 'value="changeFolder"' + lineMid + cMenuIcons.image.changeFolder + cMenuTitle.image.changeFolder + lineEnd + 
                        lineStart + 'value="deleteImage"' + lineMid + cMenuIcons.image.del + cMenuTitle.image.del + lineEnd + 
                        menuEnd);

        document.write(menuStart + 'id="contextMenuFolder">' +  
                        lineStart + 'value="explore"' + lineMid + cMenuIcons.folder.explore + cMenuTitle.folder.explore + lineEnd + 
                        lineStart + 'value="editName"' + lineMid + cMenuIcons.folder.editName + cMenuTitle.folder.editName + lineEnd +
                        lineStart + 'value="deleteFolder"' + lineMid + cMenuIcons.folder.del + cMenuTitle.folder.del + lineEnd + 
                        menuEnd);

        var taskItemClassName = "wimage-content", 
            taskItemInContext;

        var cMenuClassName = "context-menu", 
              cMenuItemClassName = "context-menu-item", 
              cMenuButtonClassName = "context-menu-item-button",
              cMenuActive = "show-context-menu"; 

        var clickCoords,
              clickCoordsX,
              clickCoordsY;

        var menu = {
            main: document.getElementById('contextMenu'),
            state: 0
        }
        var imageMenu = {
            main: document.getElementById('contextMenuImage'),
            state: 0
        }
        var folderMenu = {
            main: document.getElementById('contextMenuFolder'),
            state: 0
        }

        function getTarget(e){
            e = (e) ? e : window.event;
            var target = e.target;
            var classList = target.classList;

            var temp;

            if(classList.contains("wimageThumbnail")){
                return { class: "wimage-item-image",node: target.parentNode.parentNode}
            }
            if(classList.contains("folder-icon")){
                return { class: "wimage-item-folder",node: target.parentNode.parentNode}
            }
            if(classList.contains("wimage-thumbnail-wrapper") || classList.contains('ellipsis')){
                temp = target.parentNode;
            }
            if(classList.contains("wimage-thumbnail-group")){
                temp = target;
            }
            if(temp){
                if(temp.classList.contains('wimage-item-image'))
                    return { class: "wimage-item-image",node: temp}
                else
                    if(temp.classList.contains('wimage-item-folder'))
                        return { class: "wimage-item-folder",node: temp}
            }
                  
            return {class:null,node:null};
        }

        function init() {
            contextListener();
            clickListener();
            keyupListener()
            resizeListener();
        }

        // Listens for context menu event
        function contextListener() {
            main.addEventListener('contextmenu', function(e) {
               
                turnOff();
                var target = getTarget(e);
                switch(target.class){
                    case "wimage-item-folder":{
                        turnOn(e,folderMenu);
                        activeNode(target.node);
                        target.node.classList.add("wimage-slide-active");
                    }break;
                    case "wimage-item-image":{
                        if(target.node.id !== "wimage-back-path"){
                            turnOn(e,imageMenu);
                            activeNode(target.node);
                            var childImg = target.node.firstChild.firstChild;
                            childImg.classList.add("wimage-slide-active");
                        }else{
                            disabled(e);
                        }
                        
                    }break;
                    default:
                        turnOn(e,menu);
                }
            });
        }
          // Listens for click event: click into item on menu 
        function clickListener() {
            document.addEventListener('click', function(e) {
              var clickElemButton = clickInsideElement(e, cMenuButtonClassName);
              if (clickElemButton) {
                e.preventDefault();
                menuItemListener();
              } else {
                var button = e.which || e.button;
                if (button === 1) {
                    turnOff();
                    var temp = document.getElementsByClassName("wimage-slide-active");
                    if(temp && temp[0]){
                        temp[0].classList.remove("wimage-slide-active");
                    }
                }
              }
            });
        }
          // Listens for keyup event 
          // close menu with escape key
        function keyupListener() {
            window.onkeyup = function(e) {
                if (e.keyCode === 27) {
                    turnOff();
                }
            }
        }
          // window resize event 
          // close menu when resize window 
        function resizeListener() {
            window.onresize = function(e) {
                turnOff();
            };
        }

        function activeNode(target){
            target.classList.add("file-selected");
        }

        // Show menu 
        function toggleMenuOn(menu) {
            if (menu.state !== 1) {
              menu.state = 1;
              menu.main.classList.add(cMenuActive);
            }
        }

        function turnOn(e,menu){
            e = (e) ? e : window.event;
            disabled(e);
            positionMenu(e,menu);
            toggleMenuOn(menu);
        }

        // Turn off menu 
        function toggleMenuOff(menu) {
            if (menu.state !== 0) {
              menu.state = 0;
              menu.main.classList.remove(cMenuActive);
            }
        }

        function turnOff(){
            toggleMenuOff(menu);
            toggleMenuOff(imageMenu);
            toggleMenuOff(folderMenu);
            var temp = document.getElementsByClassName("wimage-slide-active");
            if(temp){
                var l = temp.length;
                for(var i = 0 ; i < l ; i++){
                    temp[i].classList.remove("wimage-slide-active");
                }
            }
        }

        function getPosition(e) {
            var posx = 0;
            var posy = 0;

            if (!e) var e = window.event;

            if (e.pageX || e.pageY) {
                posx = e.pageX;
                posy = e.pageY;
            } 
            else if (e.clientX || e.clientY){
                posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
                posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
            }
            return {
                x: posx,
                y: posy
            }
        }

        // Menu position
        function positionMenu(e,menu) {
            menuPosition = getPosition(e);
            menuPositionX = menuPosition.x + "px";
            menuPositionY = menuPosition.y + "px";

            menu.main.style.left = menuPositionX;
            menu.main.style.top = menuPositionY;
        }

          // Listen for item clicked
          // to do: apply function to context menu 
          // close menu after click 
            function menuItemListener(button) {
                turnOff();
            }

            init();

            var defaultItemMenu = menu.main;
            var imageItemMenu = imageMenu.main;
            var folderItemMenu = folderMenu.main;
            
            function contextClickEvent(){

                function getTargetContext(e){
                    var target = e.target;
                    if(target.nodeName === "BUTTON")
                        return target;
                    else{
                        if(target.nodeName === "I")
                            return target.parentNode;
                    }
                }  

                var btnCreateFolder = document.getElementById("wimage-createFolder");
               
                defaultItemMenu.addEventListener("click",function(e){
                    var target = getTargetContext(e);
                    if(target){
                        var value = target.value;
                        switch(value){
                            case "createFolder":{
                                btnCreateFolder.click();
                            }break;
                            case "upload":{
                                btnUpload.click();
                            }break;
                        }
                    }                 
                });

                imageItemMenu.addEventListener("click",function(e){
                    var target = getTargetContext(e);
                    if(target){
                        var value = target.value;
                        switch(value){
                            case "preview":{
                                var dblclick = document.getElementsByClassName("wimage-slide-active");
                                if(dblclick){
                                    dblclick = dblclick[0];
                                    triggerEvent(dblclick,"dblclick");
                                }
                            }break;
                            case "editName":{
                                btnRename.click();
                            }break;
                            case "changeFolder":{
                                btnMove.click();
                            }break;
                            case "deleteImage":{
                                btnDelete.click();
                            }break;
                        }
                    }
                });

                folderItemMenu.addEventListener("click",function(e){
                    var target = getTargetContext(e);
                    if(target){
                        var value = target.value;
                        switch(value){
                            case "explore":{
                                var dblclick = document.getElementsByClassName("wimage-slide-active");
                                if(dblclick){
                                    dblclick = dblclick[0];
                                    triggerEvent(dblclick,"dblclick");
                                }
                            }break;
                            case "editName":{
                                btnRename.click();
                            }break;
                            case "deleteFolder":{
                                btnDelete.click();
                            }break;
                        }
                    }  
                });

            }   
            
            contextClickEvent();       

        }
        contextMenu();

        /*
        * -------------
        * select files 
        * -------------
        */

        var output = document.getElementById("wimage-list");
        
        function selectFile() {

            //set attributes for SVG
            function setAttribute(el,attr){
                for(var i in attr){
                    el.setAttributeNS(null,i,attr[i]);
                }
            }
            // craate SVG element
            function createSVG(tag,attr){
                var ns = "http://www.w3.org/2000/svg";
                var svg = document.createElementNS(ns,tag);
                var rect = document.createElementNS(ns,"rect");
                setAttribute(rect,{width: "100%",height: "100%"});
                setAttribute(svg,attr);
                svg.appendChild(rect);
                return svg;
            }

            var attr = {width: 0,height: 0,viewBox: "0 0 0 0"};
            var svg = createSVG("svg",attr);
            main.appendChild(svg);

            var start = {},delta = {},newPos = {},tran = {};

            // update lại khung ảnh svg
            function updatePosition(){
                svg.style.transform = "translate(" + tran.x + "px, " + tran.y + "px)";
                attr = {
                    width: newPos.x,
                    height: newPos.y,
                    viewBox: "0 0 " + newPos.x + " " + newPos.y
                };
                setAttribute(svg,attr);
            }

            // wrap 
            function move(e){
                findSelect();
                e = (e) ? e : window.event;
                // tìm đoạn di chuyển con trỏ
                delta.x = Math.abs(e.clientX - start.x);
                delta.y = Math.abs(e.clientY - start.y);

                // nếu di chuyển theo chiều thuận thì k dời điểm bắt đầu, ng lại dời
                tran.x = (e.clientX > start.x) ? start.x : (start.x - delta.x);
                tran.y = (e.clientY > start.y) ? start.y : (start.y - delta.y);

                // độ dài và rộng svg
                newPos.x = delta.x;
                newPos.y = delta.y;
                updatePosition();
            }

        
            

            function removeAnimation(){
                main.removeEventListener("mousemove", move);
                attr = {width: 0,height: 0, viewBox: "0 0 0 0"};
                setAttribute(svg,attr);
                svg.style.display = "none";
                main.classList.remove("wimage-content-active");
                activeButton([btnDelete,btnMove,btnRename]);
            }

            /**
             * Valid and deal with select
             */

             //2 hcn colliding
            function isColliding(a,b){
                return (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
            }

            

            // tìm hình đc chọn trong vùng draw
            function findSelect(){
                var rect = document.getElementsByClassName("wimage-thumbnail-group");    
                var posSVG = svg.getBoundingClientRect();
                var l = rect.length;
                for(var i = l ;i--;){
                    var posRect = rect[i].getBoundingClientRect();
                    if(isColliding(posSVG,posRect)){
                            addSelect(rect[i]);        
                    }else{
                       removeSelect(rect[i]);
                    }
                }
            }
            
            // reset lại tất cả các file đc chọn
            function resetSelected(){
                var listE = document.getElementsByClassName("file-selected");
                var length  = listE.length;
                for(var i= length ; i-- ;){
                    removeSelect(listE[i]);
                }
            }

            function removePointerStart(){
                var listE = document.getElementsByClassName("wimage-thumbnail-group");
                var l = listE.length;
                for(var i = 0 ; i < l ; i++){
                    listE[i].removeAttribute("pointstart");
                }
            }
   
             // click envent
            function clickHandler(){
            
                main.addEventListener('click',function(e){
                    var target = findSelected(e.target);   
                    if(target){
                       addSelect(target);
                       activeButton([btnDelete,btnMove,btnRename]);
                    }            
                });

                btnDelete.addEventListener("click",function(e){
                    if(isSelected()){
                        var confirm = document.getElementById("wimage-modal-delete-confirm");
                        confirm.addEventListener("click",function(e){            
                            var data = e.target;
                            if(data.id === "wimage-delete-agree"){
                                deleteSelected();
                            }
                        });
                    }else{
                        disabled(e);
                    }
                });

                btnRename.addEventListener("click",function(e){
                    var selected = document.getElementsByClassName("file-selected");
                    if(selected.length === 1){
                        var sameName = document.getElementById("wimage-rename-samename");
                        sameName.style.visibility = "hidden";
                        var target = selected[0];
                        var name = target.lastChild.firstChild.nodeValue;
                        var inputName = document.getElementById("nameValue");
                        inputName.value = name;
                        var confirm = document.getElementById("wimage-rename-agree");
                        confirm.addEventListener("click",function(e){ 
                            var tempSelected = document.getElementsByClassName("file-selected"); 
                            var tempName = tempSelected[0].lastChild.firstChild.nodeValue;   
                            var newName = inputName.value;
                            if(isMatch(newName,"ellipsis")){
                                if(newName !== tempName){
                                    sameName.style.visibility = "visible";
                                    e.stopPropagation();
                                }                    
                            }else{
                                tempSelected[0].lastChild.firstChild.nodeValue = newName;    
                            }
                        });
                    }else{
                        disabled(e);
                    }
                });

                function createBackImage(src){
                    var content = "<span>";
                    content += '<div class="wimage-thumbnail-group" id="wimage-back-path"><div class="wimage-thumbnail-wrapper"><img class="wimageThumbnail" src="';
                    content += src;
                    content += '"/></div><p class="ellipsis">&nbsp;</p></div>';
                    return content;
                }   

                var TEMP_OUTPUT;
                var wimagePath = document.getElementById("wimage-back-foldername");
                var wimageCreateFolder = document.getElementById("wimage-createFolder");
                var contextDefaultMenu = document.getElementById("contextMenu");
                var childCreateFolder  = contextDefaultMenu.firstChild;

                // open folder
                main.addEventListener("dblclick",function(e){
                    var target = findSelected(e.target);
                    //if double click on foler 
                    if(target && target.classList.contains("wimage-item-folder")){  
                        TEMP_OUTPUT = output.innerHTML;            
                        output.innerHTML = null;
                        var backImg = createBackImage("assets/images/enter.png");
                        output.innerHTML = backImg; 
                        var nameFolder = target.lastChild.firstChild.nodeValue;
                        // create only 1 level folder
                        wimagePath.previousSibling.style.display = "block";
                        wimagePath.innerHTML = nameFolder;
                        wimageCreateFolder.classList.add("disabled");
                        contextDefaultMenu.removeChild(childCreateFolder);
                    }
                    var backPath = document.getElementById("wimage-back-path");
                    if(backPath){
                        backPath.addEventListener("click",function(e){
                            disabled(e); 
                        });
                        backPath.addEventListener("click",function(e){
                            output.innerHTML = null;
                            output.innerHTML = TEMP_OUTPUT;
                            wimagePath.previousSibling.style.display = "none";
                            wimagePath.innerHTML = null;
                            wimageCreateFolder.classList.remove("disabled");
                            contextDefaultMenu.insertBefore(childCreateFolder,contextDefaultMenu.firstChild);
                        });
                    }
                   
                });

                window.onbeforeunload = function() {
                    return "You want to leave this site !";
                }
                // window.onbeforeunload = function() {
                //     return "You want to leave this site !";
                // }
    
            }   

            clickHandler();

            /**
             * Keyboard event 
             * -------------------------------------
             */

            var keyboard = {
                detectKeyboard: function(event){
                    event = (event) ? event : window.event;

                    if(event.ctrlKey){

                        switch(event.keyCode){
                            case 65: return "ctrlA";
                            case 67: return "ctrlC";
                            case 86: return "ctrlV";
                            case 88: return "ctrlX"; 
                            case 90: return "ctrlZ";  
                        }

                        return "ctrl";
                    }else{
                        switch(event.keyCode){
                            case 46: return "delete";
                            case 8: return "backspace";
                            case 13: return "enter";
                            case 91: return "ctrl"; 
                        }
                        if(event.shiftKey){
                            return "shift";
                        } 
                        if(event.metaKey){
                            return "meta";
                        }
                    }
                    return null;
                }
            };
     
            document.addEventListener("keydown",function(event){
                var body = document.body;
                body.classList.add("non-select");
                var selectables = document.getElementsByClassName("wimage-thumbnail-group");
                var length = selectables.length;
                var target = event.target;
                if(target.nodeName !== "INPUT"){
                    var detecKeyBoard = keyboard.detectKeyboard(event);
                    switch(detecKeyBoard){
                        case "ctrlA":{       
                            addMultiSelect(selectables,length);
                            activeButton([btnDelete,btnMove,btnRename]);
                        }break;
                        case "delete":{                  
                            btnDelete.click();
                        }break;
                    }

                    document.addEventListener("keyup",function(){
                        body.classList.remove("non-select");
                    });

                }

            });

            function numberFileSelect(){
                var selected = document.getElementsByClassName("file-selected");
                return selected.length;
            }

            function getStartAndEnd(target){
                var num = numberFileSelect();
                var tempNum = document.querySelectorAll("[pointStart]");
               
                tempNum = tempNum.length;
                if(num >= 2 && tempNum > 1){
                    resetSelected();
                    target.removeAttribute("pointStart");
                    var numEnd = target.getAttribute("data-value");

                    var startPoint = document.querySelectorAll("[pointStart]");
                    startPoint = startPoint[0];
                    var numStart = startPoint.getAttribute("data-value");

                    var start = (numStart < numEnd) ? numStart : numEnd;
                    var end = (numStart > numEnd) ? numStart : numEnd;
                    start = parseInt(start);
                    end = parseInt(end); 
                    var select = document.getElementsByClassName("wimage-thumbnail-group");
                    var l = select.length;
                    for(var i = 0 ; i < l ; i++){
                        var dataValue = select[i].getAttribute("data-value");
                        if(dataValue >= start && dataValue <= end){
                            select[i].classList.add("file-selected");
                        }
                    }
                    target.removeAttribute("pointEnd");
                }
            }

            

            /**
            * END keyboard
            * -------------------------------------
            */

    
            // for draw and choose file
            main.addEventListener("mousedown",function(event){
                start.x = event.clientX;
                start.y = event.clientY;
                // add class active user-select
                main.classList.add("wimage-content-active");
                // hiển thi khung svg
                svg.style.display = "block";

                main.addEventListener("mousemove",move); 
                main.addEventListener("mouseup",removeAnimation);
                var detectKeyboard = keyboard.detectKeyboard(event);
                if(detectKeyboard !== "ctrl" && detectKeyboard !== "shift"){
                    resetSelected();
                    removePointerStart();
                }    
            });
            /**
             * ---------------------------------------
             */
            
            

            function addMultiSelect(target,length){
                for(var i = length ; i-- ;){
                    addSelect(target[i]);
                }
            }

           
            function eventForCtrlClick(e){
                e = (e) ? e : window.event;
                var target = findSelected(e.target);   
                var detectKeyboard = keyboard.detectKeyboard(e);
                if(target){
                    disabled(e);
                    if(detectKeyboard === "ctrl"){
                        if(target.classList.contains("file-selected")){
                            removeSelect(target);
                        }else{
                            addSelect(target);
                        }
                    }else{
                        if(detectKeyboard === "shift"){
                            addSelect(target);
                            target.setAttribute("pointStart","1");
                            var selected = document.getElementsByClassName("file-selected");
                            getStartAndEnd(target);
                        }else{
                            addSelect(target);
                            target.setAttribute("pointStart","1");
                        }
                    }
                    activeButton([btnDelete,btnMove,btnRename]);
                }
            }

             // click envent
            function clickHandler(){
    
                main.addEventListener('click',eventForCtrlClick);     

                // window.onbeforeunload = function() {
                //     return "You want to leave this site !";
                // }
    
            }   

            clickHandler();

            

        }

        selectFile();

        
  



        /*
        * -------------
        * switch view 
        * -------------
        */
        function switchView() {
            var items = document.getElementsByClassName("wimage-thumbnail-group");
            var btnGrid = document.getElementById("wimage-btn-grid");
            var btnList = document.getElementById("wimage-btn-list");
            function view(listNode,flag){
                var l = listNode.length;
                // list view
                if(flag){
                    for(var i = l ; i--;){
                        var thum = listNode[i].firstChild;
                        var name = thum.nextSibling;
                        thum.classList.add("wimage-thumbnail-wrapper-list");
                        name.classList.add("list-name");
                        listNode[i].style.display = "block";
                    }
                }else{
                    for(var i = l ; i--;){
                        var thum = listNode[i].firstChild;
                        var name = thum.nextSibling;
                        thum.classList.remove("wimage-thumbnail-wrapper-list");
                        name.classList.remove("list-name");
                        listNode[i].style.display = "inline-block";
                    }
                }                 
                }

                btnGrid.addEventListener("click",function(){
                    this.classList.add("active");
                    btnList.classList.remove("active");
                    view(items,false);
                });

                btnList.addEventListener("click",function(){
                    this.classList.add("active");
                    btnGrid.classList.remove("active");
                    view(items,true);
            });
        }
        switchView();

        /*
        * -------------
        * edit file 
        * -------------
        */
        function editFile() { 

            /**
             * ------------------------------------
             */        
            // add popup menu
            
            var deletePopup = createPopup("deletePopup",[defaultsLang.popUp.delete.title],[
                {id:"wimage-cancel",btn: "default",content: defaultsLang.popUp.delete.cancel},
                {id:"wimage-delete-agree",btn: "primary",content: defaultsLang.popUp.delete.agree}
            ]);

            var renamePopup = createPopupRename("renamePopup",[
                {id:"wimage-cancel",btn: "default",content: defaultsLang.popUp.rename.cancel},
                {id:"wimage-rename-agree",btn: "primary",content: defaultsLang.popUp.rename.agree}
            ]);

            var movePopup = createPopupMove("movePopup",[
                {id:"wimage-cancel",btn: "default",content: defaultsLang.popUp.move.cancel},
                {id:"wimage-move-agree",btn: "primary",content: defaultsLang.popUp.move.agree}
            ],defaultsLang.popUp.move.title);

            nav.appendChild(deletePopup);
            nav.appendChild(renamePopup);
            nav.appendChild(movePopup);
            
            //set popup
            function setPopup(node,toggle,target){
                node.setAttribute("data-toggle", toggle);
                node.setAttribute("data-target", target);
            }

            setPopup(btnDelete,"modal","#deletePopup");
            setPopup(btnRename,"modal","#renamePopup");
            setPopup(btnMove,"modal","#movePopup");

            function deleteSelected(){
                var selected = document.getElementsByClassName("file-selected");
                var length = selected.length;
                for(var i = length; i-- ;){
                    var grandParent = selected[i].parentNode;
                    var hugeParent = grandParent.parentNode;
                    hugeParent.removeChild(grandParent);
                }
                activeButton([btnDelete,btnMove,btnRename]);
            }
                   
            btnDelete.addEventListener("click",function(e){
                if(isSelected()){
                    var confirm = document.getElementById("wimage-modal-delete-confirm");
                    confirm.addEventListener("click",function(e){            
                        var data = e.target;
                        if(data.id === "wimage-delete-agree"){
                            deleteSelected();
                        }
                    });
                }else{
                    disabled(e);
                }
            });

            btnRename.addEventListener("click",function(e){
                var selected = document.getElementsByClassName("file-selected");
                if(selected.length === 1){
                    var sameName = document.getElementById("wimage-rename-samename");
                    sameName.style.visibility = "hidden";
                    var target = selected[0];
                    var name = target.lastChild.firstChild.nodeValue;
                    var inputName = document.getElementById("nameValue");
                    inputName.value = name;
                    var confirm = document.getElementById("wimage-rename-agree");
                    confirm.addEventListener("click",function(e){ 
                        var tempSelected = document.getElementsByClassName("file-selected"); 
                        var tempName = tempSelected[0].lastChild.firstChild.nodeValue;   
                        var newName = inputName.value;
                        if(isMatch(newName,"ellipsis")){
                            if(newName !== tempName){
                                sameName.style.visibility = "visible";
                                e.stopPropagation();
                            }                    
                        }else{
                            var tempNodeName = tempSelected[0].lastChild;
                            tempNodeName.firstChild.nodeValue = newName;
                            tempNodeName.setAttribute("title",newName);   
                        }
                    });
                }else{
                    disabled(e);
                }
            });

            btnMove.addEventListener("click",function(e){
                var success = document.getElementById("wimage-notice");
                var selected = document.getElementsByClassName("file-selected");
                var folders = document.getElementsByClassName("wimage-item-folder");
                var lFolders = folders.length;
                if(selected.length === 1 && selected[0].classList.contains("wimage-item-image") && lFolders > 0){
                    updateContentPopUpRename("wimage-item-folder");
                    var btnMoveAgree = document.getElementById("wimage-move-agree");
                    btnMoveAgree.addEventListener("click",function(e){    
                        success.innerHTML = defaultsLang.moveSuccess;
                        success.style.display = "block";
                        success.style.opacity = "1";    
                        setTimeout(function(){
                            myFadeOut(success,20,true);
                        },3000);
                    });
                }else{
                    disabled(e);
                    if(lFolders === 0){
                        success.innerHTML = defaultsLang.folder;
                        success.style.display = "block";
                        success.style.opacity = "1";    
                        setTimeout(function(){
                            myFadeOut(success,20,true);
                        },3000);
                    }
                }
            });
        }

        editFile();

        /*
        * --------------------
        * exploring the folder 
        * --------------------
        */
        function folderXplore() {

            function createBackImage(src){
                var content = "<span>";
                content += '<div class="wimage-thumbnail-group" id="wimage-back-path"><div class="wimage-thumbnail-wrapper"><img class="wimageThumbnail wimage-thumbnail-back" src="';
                content += src;
                content += '"/></div><p class="ellipsis">Back</p></div>';
                return content;
            }   

            var TEMP_OUTPUT;
            var wimagePath = document.getElementById("wimage-back-foldername");
            var wimageCreateFolder = document.getElementById("wimage-createFolder");
            var contextDefaultMenu = document.getElementById("contextMenu");
            var childCreateFolder  = contextDefaultMenu.firstChild;

            // open folder
            main.addEventListener("dblclick",function(e){
                var target = findSelected(e.target);
                //if double click on foler 
                if(target && target.classList.contains("wimage-item-folder")){  
                    var nameFolder = target.lastElementChild.firstChild.nodeValue;

                    TEMP_OUTPUT = output.innerHTML;            
                    output.innerHTML = null;
                    var backImg = createBackImage("assets/images/enter.png");
                    output.innerHTML = backImg; 

                    // create only 1 level folder
                    wimagePath.previousSibling.style.display = "block";
                    wimagePath.innerHTML = nameFolder;
                    wimageCreateFolder.classList.add("disabled");
                    contextDefaultMenu.removeChild(childCreateFolder);
                    activeButton([btnDelete,btnMove,btnRename]);
                }
                var backPath = document.getElementById("wimage-back-path");
                if(backPath){
                    // backPath.addEventListener("click",function(e){
                    //     disabled(e); 
                    // });
                    backPath.addEventListener("click",function(e){
                        disabled(e);
                        output.innerHTML = null;
                        output.innerHTML = TEMP_OUTPUT;
                        wimagePath.previousSibling.style.display = "none";
                        wimagePath.innerHTML = "";
                        wimageCreateFolder.classList.remove("disabled");
                        contextDefaultMenu.insertBefore(childCreateFolder,contextDefaultMenu.firstChild);
                        activeButton([btnDelete,btnMove,btnRename]);
                    });
                }
            });

            var homeI = document.getElementsByClassName("wimage-path");
            homeI = homeI[0].firstChild;
            homeI.addEventListener("click",function(e){
                var backPath = document.getElementById("wimage-back-path");
                if(backPath){
                    backPath.click();
                }

            });

        }
        folderXplore(); 



    })();

})();
