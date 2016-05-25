/*
 * =====================================================
 * File Manager
 * Created by Son Dang @we-mak.com
 * Helped from Bruce Doan https://github.com/rgv151
 * Version 0.1 WIP - 15 April 2016
 * =====================================================
 */
// Check for the various File API support.
if (window.File && window.FileReader && window.FileList && window.Blob) {
    // Great success! All the File APIs are supported.
} else {
    alert('The File APIs are not fully supported in this browser.');
}

(function() {
    "use strict";
    var WimageFilemanager = (function() { 
        /* General variables */
        var defaults = {
            url: '',//for backend API connector
            lang: '',
            maxFileUpload: '25',
            maxSizeUpload: '',
            datetimeFormat: 'DD/MM/YYYY'
        },
        temp = {
            gridView: '',
            listView: '',
            rename: 'Rename',
            move: 'Move',
            del: 'Delete',
            search: 'Search',
            upload: 'Upload',
            addfolder: 'New album'
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
                          general: {
                          createFolder: "New album",
                          upload: "Upload"
                          },
                          folder: {
                            explore: "Explore image",
                            editName: "Edit name",
                            del: "Delete"
                          },
                          image: {
                          preview: "Preview",
                          editName: "Edit Name",
                          changeFolder: "Move",
                          del: "Delete"
                          }
        },
            cMenuIcons = {
                          general: {
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
        * Helper functions
        * -----------------
        */  

        //Filter 
        // Looking for child element in depth
        function findChild(parent, child) {
          var children = parent.childNodes;
          for (var i = 0; i < children.length; i++) {
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
          for (var i = 0; i < matches.length; i++) {
            if (findChild(matches[i], elem)) {
              return matches[i];
            }
          }
          return false;
        }

        //Function to check if we clicked inside an element with a particular class name
        function clickInsideElement( e, className ) {
          var el = e.srcElement || e.target; 
          if ( el.classList.contains(className) ) {
            return el;
          } else {
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

          if (!e) var e = window.event;
          
          if (e.pageX || e.pageY) {
            posx = e.pageX;
            posy = e.pageY;
          } else if (e.clientX || e.clientY) {
            posx = e.clientX + document.body.scrollLeft + document.documentElement.scrollLeft;
            posy = e.clientY + document.body.scrollTop + document.documentElement.scrollTop;
          }
          return {
            x: posx,
            y: posy
          }
        }

        /*
        * --------------------
        * Initialize Main DOM
        * --------------------
        */
        function AppLayout() {
            var html_init = '<div class="wimage-group">';
                html_init = html_init + '<div class="navbar"><div class="wimage-header">';

                //switch view, edit group
                html_init = html_init + '<div class="col-md-6 col-sm-12 wimage-toolbar-block">'
                            + '<div class="btn-group"><button class="btn btn-default btn-sm active">' + btnIcon.gridIcon + '</button>' 
                            + '<button class="btn btn-default btn-sm">' + btnIcon.listIcon + '</button></div>'
                            + '<div class="btn-group"><button class="btn btn-default btn-sm disabled">' + btnIcon.renameIcon + temp.rename + '</button>'
                            + '<button class="btn btn-default btn-sm disabled">' + btnIcon.moveIcon + temp.move + '</button>' 
                            + '<button class="btn btn-default btn-sm disabled">' + btnIcon.deleteIcon + temp.del + '</button></div></div>';  
                //search 
                html_init = html_init + '<div class="col-md-3 col-sm-12 wimage-toolbar-block"> <div class="input-group">'
                            + '<input type="text" class="form-control input-sm" placeholder="Type a name..."><span class="input-group-btn"><button class="btn btn-primary btn-sm" type="button">' 
                            + temp.search + '</button></span></div></div>';

                // upload, create folder
                html_init = html_init + '<div class="col-md-3 col-sm-12 wimage-toolbar-block"><div class="wimage-create-btn-group"><div class="wimage-input-style-group">'
                            + '<input id="file" class="wimage-inputfile" type="file" name="file[]" multiple /><label class="btn btn-default btn-sm" for="file">' + btnIcon.uploadIcon + temp.upload + '</label></div>'   
                            + '<button class="btn btn-default btn-sm" id="createFolder">' + btnIcon.addfolderIcon + temp.addfolder + '</button></div></div>';

                html_init = html_init + '</div></div>';

                //content
                html_init = html_init + '<div class="wimage-content"><div id="progress_bar"><div class="percent">0%</div></div><output class="wimage-file-group" id="list"></output></div>';

                html_init = html_init + '</div>';

            var layOut = document.getElementById('filemanager');
            return layOut.innerHTML = html_init;   
        }
        AppLayout();
        /*
        * -----------
        * Upload file 
        * -----------
        * re-contribute from http://www.html5rocks.com/en/tutorials/file/dndfiles
        */
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
          function handleFileSelect(evt) {
              "use strict";
              evt.stopPropagation();
              evt.preventDefault();
              var files = evt.target.files; // FileList object
              // Loop through the FileList and render image files as thumbnails.
              for (var i = 0, f; f = files[i]; i++) {
                // Only process image files.
                if (!f.type.match('image.*')) {
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
                    setTimeout("document.getElementById('progress_bar').className='';", 2000);
                    // Rendering thumbnail.
                    var span = document.createElement('span');
                    span.innerHTML = [
                                      '<div class="wimage-thumbnail-group"><div class="wimage-thumbnail-wrapper" ><img class="wimageThumbnail" src="', 
                                      e.target.result, '"/></div>' 
                                      + '<p class="ellipsis" id="wimage-filename">' + theFile.name + '</p>' // Included file name
                                      + '</div>'].join('');
                    document.getElementById('list').insertBefore(span, null);               
                  };
                })(f);
                // Read in the image file as a data URL.
                reader.readAsDataURL(f);
              }
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
        function createFolder() {
          "use strict";
          var folderIcon = '<div class="folder-icon"></div>',
              create = document.getElementById('createFolder'),
              fileCount = 0;
          //create element when click the button.
          create.addEventListener('click', function(e) {
            "use strict";
            e.stopPropagation();
            e.preventDefault();
            function fileName(folderName) {
              folderName = "Album";
              var fileUp = fileCount++;
              //generate number of folder's default name
              if (fileUp === 0) {
                return folderName;
              } else {
                return folderName + " (" + fileUp.toString() + ")";
              }
            }          
            var folder = document.createElement('span');
            folder.innerHTML = ['<div class="wimage-thumbnail-group"><div class="wimage-thumbnail-wrapper">' + folderIcon + '</div><p class="ellipsis" id="wimage-filename">' + fileName() + '</p></div>'];
            document.getElementById('list').insertBefore(folder, null); 
          });
        }
        createFolder();
        /*
        * -------------
        * select files 
        * -------------
        */
        function selectFile() {
          //key code for cmd/ctrl click, shift click
          var cmd = 91, ctrl = 17, shift = 16;
          // SVG Helper
          var setSVGAtts = function (el, atts) {
                if (atts !== undefined) {
                  for (var k in atts) {
                    el.setAttributeNS(null, k, atts[k]);
                  }
                }
              return el;
              },
              createSVG = function (tag, atts) {
                var el = document.createElementNS('http://www.w3.org/2000/svg', tag);
                // set SVG attributes
                setSVGAtts(el, atts);
                return el;
              },
              //selectables = document.querySelectorAll('[data-selectable]'),
              selectables = document.getElementById('list'),
              startX, startY, deltaX, deltaY, transX, transY, rafID;

          var content = document.querySelector('.wimage-content'),
              svg = createSVG('svg', { viewBox: '0 0 0 0', width: 0, height: 0 }),
              rect = createSVG('rect', { width: '100%', height: '100%' }),
              isDragging = false;

          // add rect to svg
          svg.appendChild(rect);
          // add svg to DOM
          content.appendChild(svg);

          // checks if anything is selected within set of x and y ranges
          function findSelectables() { 
            var a = svg.getBoundingClientRect();
            //delegate event 
            selectables.getBoundingClientRect(function(e) {
              if (e.target) {
                var b = target.getBoundingClientRect();
                if(isColliding(a, b)) {
                  target.classList.add('file-selected');
                } else {
                  target.classList.remove('file-selected');
                }
              }
            });
          }
          //checks if two elements are colliding
          function isColliding(a, b) {
            return (a.left < b.right && a.right > b.left && a.top < b.bottom && a.bottom > b.top);
          }
          // delegate event to listen for click. 
          selectables.addEventListener('click', function selectableClickHandler(e) {
            if (e.target) {
              var target = false;
              if (e.target.matches("div.wimage-thumbnail-wrapper")) {
                target = e.target;
              } else {
                target = find("div.wimage-thumbnail-wrapper", e.target);
                
                var file_seleced = document.getElementsByClassName("wimage-thumbnail-wrapper");
                for(var i = 0; i < file_seleced.length; i++){
                  file_seleced[i].classList.remove('file-selected');
                }
                
              }
              if (!target) {
                return;
              }
            }
            if (!isDragging) {
              //remove selected class from all selectables
              if (target.classList.contains('file-selected')) {
                target.classList.remove('file-selected');
              } else {
                target.classList.add('file-selected');
              }
            }       
          });

          function updateDragSelectBoxPos(e) {        
            var width = deltaX || 0,
                height = deltaY || 0;
            
            // set position of SVG
            svg.style.transform = 'translate('+ transX +'px, '+ transY +'px)';
            
            // svg width / height
            setSVGAtts(svg, {
                viewBox: '0 0 '+ width +' '+ height,
                width: width,
                height: height
            });
            
            // do we need to update
            if(isDragging) {
              rafID = requestAnimationFrame(updateDragSelectBoxPos);
            }
          }
          function dragStart(e) {      
            // get starting coords
            startX = e.pageX;
            startY = e.pageY;
            
            // add helper styling class
            content.classList.add('dragging');
            
            // listen for drag and release
            content.addEventListener('mousemove', dragMove);
            content.addEventListener('mouseup', dragUp);
            
            // start animating
            rafID = requestAnimationFrame(updateDragSelectBoxPos);
            
            // dragging
            isDragging = true;
          }
          function dragMove(e) {
              
             // get current relative to start coords
            deltaX = Math.abs(e.pageX - startX);
            deltaY = Math.abs(e.pageY - startY);
            
            // check if we need to move position
            transX = (startX > e.pageX) ? (startX - deltaX) : startX;
            transY = (startY > e.pageY) ? (startY - deltaY) : startY;
          }

          function dragUp(e) {
              
            // stopped dragging
            isDragging = false;
            
            // check if we selected anything
            findSelectables();
            
            // clear current animation
            cancelAnimationFrame(rafID);
            
            // reset atts on release
            deltaX =
            deltaY = 0;
            setSVGAtts(svg, { viewBox: '0 0 0 0', width: 0, height: 0 });
            
            // remove helper styling class
            content.classList.remove('dragging');
            
            content.removeEventListener('mousemove', dragMove);
            content.removeEventListener('mouseup', dragUp);
          }

          // listen for drag start
          content.addEventListener('mousedown', dragStart);
        }
        selectFile();
        /*
        * -------------
        * context menu 
        * -------------
        */
        function contextMenu() {
          var cMenuTitle = {
                             default: {
                             createFolder: "New album",
                             upload: "Upload"
                             },
                             folder: {
                               explore: "Explore image",
                               editName: "Edit name",
                               del: "Delete"
                             },
                             image: {
                             preview: "Preview",
                             editName: "Edit Name",
                             changeFolder: "Move",
                             del: "Delete"
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
          var cMenuClassName = "context-menu", 
              cMenuItemClassName = "context-menu-item", 
              cMenuButtonClassName = "context-menu-item-button",
              cMenuActive = "show-context-menu"; 

          var clickCoords,
              clickCoordsX,
              clickCoorsY;

          var menu = document.getElementById('contextMenu'),
              menuItems = menu.querySelector('.context-menu-item'),
              menuState = 0,
              menuWidth,
              menuHeight,
              menuPosition,
              menuPositionX,
              menuPositionY,
              windowWidth,
              windowHeight;

          var cMenuTemplate = {
                              general: '<menu class="context-menu dropdown-menu" id="contextMenu"<li class="context-menu-item"><button class="context-menu-item-button">' + cMenuIcons.default.createFolder + cMenuTitle.default.createFolder + '</button></li><li class="context-menu-item"><button class="context-menu-item-button">' 
                                       + cMenuIcons.default.upLoad + cMenuTitle.default.upload + '</button></li></menu>',
                              folder: '<menu class="context-menu dropdown-menu" id="contextMenu"><li class="context-menu-item"><button class="context-menu-item-button">'  + cMenuIcons.folder.explore + cMenuTitle.folder.explore +'</button></li><li><button class="context-menu-item-button">' 
                                      + cMenuIcons.folder.editName + cMenuTitle.folder.editName + '</button><li class="context-menu-item"><button class="context-menu-item-button"' 
                                      + cMenuIcons.folder.del + cMenuTitle.folder.del + '</button></li></li></menu>',
                              image: '<menu class="context-menu dropdown-menu" id="contextMenu"><li class="context-menu-item"><button class="context-menu-item-button"' + cMenuIcons.default.createFolder + cMenuTitle.default.createFolder + '</button></li><li class="context-menu-item"><button class="context-menu-item-button"' 
                                     + cMenuIcons.default.upLoad + cMenuTitle.default.upload + '</button></li></menu>'
          }; 
          // Type of menu
          function cMenuTemp() {

          }
          // Listens for context menu event
          function contextListener() {
            cMenuTemp();
            document.addEventListener('contextmenu', function(e) {
              var taskItemClassName,
                  taskItemInContext;
              taskItemInContext = clickInsideElement(e, taskItemClassName);
              if (taskItemInContext) {
                e.preventDefault();
                toggleMenuOn();
                positionMenu(e);
              } else {
                taskItemInContext = null;
                toggleMenuOff();
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
                  toggleMenuOff();
                }
              }
            });
          }
          // Listens for keyup event 
          // close menu with escape key
          function keyupListener() {
            window.onkeyup = function(e) {
              if (e.keyCode === 27) {
                toggleMenuOff();
              }
            }
          }
          // window resize event 
          // close menu when resize window 
          function resizeListener() {
            window.onresize = function(e) {
              toggleMenuOff();
            };
          }
          // Show menu 
          function toggleMenuOn() {
            if (menuState !== 1) {
              menuState = 0;
              menu.classList.add(cMenuActive);
            }
          }
          // Turn off menu 
          function toggleMenuOff() {
            if (menuState !== 0) {
              menuState = 0;
              menu.classList.remove(cMenuActive);
            }
          }
          // Menu position
          function positionMenu(e) {
            clickCoords = getPosition(e);
            clickCoordsX = clickCoords.x;
            clickCoordsY = clickCoords.y;

            menuWidth = menu.offsetWidth + 4;
            menuHeight = menu.offsetHeight + 4;

            windowWidth = window.innerWidth;
            windowHeight = window.innerHeight;

            if ((windowWidth - clickCoords) < menuWidth) {
              menu.style.left = windowWidth - menuWidth + "px";
            } else {
              menu.style.left = clickCoordsX + 'px';
            }

            if ((windowHeight - clickCoordsY) < menuHeight) {
              menu.style.top = windowHeight - menuHeight + "px";
            } else {
              menu.style.top = clickCoordsY + 'px';
            }
          }
          // Listen for item clicked
          // to do: apply function to context menu 
          // close menu after click 
          function menuItemListener(button) {
            toggleMenuOff();
          }

        }
        //contextMenu();

        /*
        * -------------
        * switch view 
        * -------------
        */
        function switchView() {

        }
        /*
        * -------------
        * edit file 
        * -------------
        */
        function editFile() {
          var fileRename,
              fileDelete,
              fileMove;
        }
        /*
        * --------------------
        * exploring the folder 
        * --------------------
        */
        function folderXplore() {

        }

    })();
    window.WimageFilemanager;

})();


