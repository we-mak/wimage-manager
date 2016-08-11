function slideShow(defaultsValue,ClassOfContain,classImg,exceptClass){

    function dump(a){console.log(a)}

    function isExist(variable){
        return (variable !== undefined && variable !== null);
    }
    var defaults = {
        action: isExist(defaultsValue.action) ? defaultsValue.action : "dblclick",
        scroll: isExist(defaultsValue.scroll) ? defaultsValue.scroll : true,
        timeAuto: isExist(defaultsValue.timeAuto) ? defaultsValue.timeAuto : 3000,
        move: isExist(defaultsValue.move) ? defaultsValue.move : true,
        tab: isExist(defaultsValue.tab) ? defaultsValue.tab : true,
    }

    /**
     * create slide show('slow/400/fast', function() {
         
     });
     */

    function createDOMSlide(src,cmt){
        var item = document.createElement("div");
        item.classList.add("hp-slide-item");
        item.innerHTML = '<div class="hp-slide-box">' +
                            '<div class="hp-slide-main">'+
                                '<div class="hp-slide-main-img">'+
                                    '<div class="hp-slide-toolbar">' +
                                        '<div class="hp-slide-exitfull"><i class="fa fa-times" aria-hidden="true"></i></div>'+   
                                        '<div class="hp-slide-expand"><i class="fa fa-expand" aria-hidden="true"></i></div>'+ 
                                        '<div class="hp-slide-video"><i class="fa fa-play-circle-o" aria-hidden="true"></i></div>'+        
                                        '<div class="hp-slide-download"><i class="fa fa-download" aria-hidden="true"></i></div>'+  
                                    '</div>'+
                                    '<div class="hp-slide-bottombar"></div>'+
                                    '<div class="hp-slide-action">'+
                                        '<div class="hp-previous" title="Previous"><i class="fa fa-angle-left" aria-hidden="true"></i></div>'+
                                        '<div class="hp-next" title="Next"><i class="fa fa-angle-right" aria-hidden="true"></i></div>'+
                                    '</div>'+
                                    '<div class="hp-img">'+
                                        '<img src="' + src + '" />'+
                                    '</div>'+
                                '</div>'+
                                '<div class="hp-slide-main-cmt">' + cmt +
                                '</div>' + 
                            '</div>' +                     
                        '</div>'+
                        '<div class="hp-slide-close">'+
                            '<i class="fa fa-times" aria-hidden="true"></i>' +
                        '</div>'+
                        '<div class="hp-slide-progress"></div>';
        return item;
    }
    


    /**
     * append slide to body
     */
    var cmt = "<div id='test'></div>"
    const SLIDE_TEMPLATE = createDOMSlide("",cmt);
    document.body.appendChild(SLIDE_TEMPLATE);

    /**
    * get variable
    * --------------------------------------------------------------
    */
   
    function getVariable(){
        var hpImg = document.getElementsByClassName("hp-img");
        var img = hpImg[0].firstChild;
        var globalBody = document.body;
        var itemSlide = document.getElementsByClassName("hp-slide-item");
        var mainSlide = document.getElementsByClassName("hp-slide-main");
        mainSlide = mainSlide[0];
        itemSlide = itemSlide[0];
        var previousButton = document.getElementsByClassName("hp-previous");
        previousButton = previousButton[0];
        var nextButton = document.getElementsByClassName("hp-next");
        nextButton = nextButton[0];
        var mainImg = document.getElementsByClassName("hp-slide-main-img");
        mainImg = mainImg[0];

        var download = document.getElementsByClassName("hp-slide-download");
        download = download[0];
        var video = document.getElementsByClassName("hp-slide-video");
        video = video[0];
        var expand = document.getElementsByClassName("hp-slide-expand");
        expand = expand[0];
        var exFull = document.getElementsByClassName("hp-slide-exitfull");
        exFull = exFull[0];
        var progressBar = document.getElementsByClassName("hp-slide-progress");
        progressBar = progressBar[0];

        return {
            hpImg: hpImg,
            img: img,
            globalDocument: document.documentElement,
            globalBody: globalBody,
            itemSlide: itemSlide,
            mainSlide: mainSlide,
            previousButton: previousButton,
            nextButton: nextButton,
            currentPos: 0,
            images: [],
            download: download,
            video: video,
            expand: expand,
            mainImg: mainImg,
            exitFull: exFull,
            progressBar: progressBar,
        }
    }

    var globalVar = getVariable();
    var globalClassAndId = {
        activeSlide: "active-slide",
        classForBody: "hp-slide",
        classDisabledSelect: "hp-slide-main-active",
        classItem: "hp-slide-item",
        classImgOrigin: classImg,
        ClassOfContain: ClassOfContain,
        exceptClass: exceptClass,
        classClose: "hp-slide-close",
        activeVideo: "active-video",
    }


    /**
     * --------------------------------------------------------------
     */


    function changImgSrc(imgSrc){
        globalVar.img.src = imgSrc;
    }

    function sliding(currentPos,images,flag){
        var current = currentPos;
        var length = images.length;
        images[current].classList.remove(globalClassAndId.activeSlide);
        // go ahead
        if(flag){
            ++current;
            current = (current >= length) ? 0 : current;
        }else{
            --current;
            current = (current < 0) ? (length - 1) : current; 
        }
        var nextImg = images[current];
        changImgSrc(nextImg.getAttribute("src"));
        images[current].classList.add(globalClassAndId.activeSlide);
        return current;
    }

    

    /**
     * use global variable for 2 funtion
     */

     // active slider 
    function activeSlide(){
        if(defaults.scroll){
            globalVar.globalDocument.classList.add(globalClassAndId.classForBody);
        }
        globalVar.itemSlide.style.display = "block";
        globalVar.mainSlide.classList.add(globalClassAndId.classDisabledSelect);
    }

    // stop slider
    function disabledSlide(){
        globalVar.globalBody.classList.remove(globalClassAndId.classForBody);
        globalVar.itemSlide.style.display = "none";
        globalVar.mainSlide.classList.remove(globalClassAndId.classDisabledSelect);
    }

    function turnOnSlider(target,className){
        if(target && target.classList.contains(globalClassAndId.classImgOrigin)
            && !target.classList.contains(globalClassAndId.exceptClass)){
            var imgSrc = target.getAttribute("src");
            changImgSrc(imgSrc);
            activeSlide();
            target.classList.add(globalClassAndId.activeSlide);

            var images = document.getElementsByClassName(className);
            var length = images.length;
            var result = {};
            var reImg = [];
            var posCur;
            var j = 0;
            for(var i = 0 ; i < length ; i++){
                if(!images[i].classList.contains(globalClassAndId.exceptClass)){
                    reImg[j] = images[i];
                    if(reImg[j].classList.contains(globalClassAndId.activeSlide)){
                        posCur = j;
                    }
                    j++;
                }    
            }
            result.images = reImg;
            result.currentPos = posCur;
            return result;
        }
        return null;
    }

    function turnOffSlider(target){
        var tempTarget = getExacliTarget(target);
        if(tempTarget && (tempTarget.classList.contains(globalClassAndId.classItem) 
            || tempTarget.classList.contains(globalClassAndId.classClose))){
            globalVar.images = [];
            globalVar.currentPos = 0;
            changImgSrc("");
            disabledSlide();
            // turn off video
            turnOffAutoSlide();
            var temp = document.getElementsByClassName(globalClassAndId.activeSlide);
            temp = temp[0];
            temp.classList.remove(globalClassAndId.activeSlide);
        }
    }

    /**
     * get target if click to i
     */
    
    function getExacliTarget(target){
        var tagName = target.tagName;
        return (tagName === "I") ? target.parentNode : target;
    }

    function turnOffAutoSlide(){
        if(globalVar.video.classList.contains(globalClassAndId.activeVideo)){
           globalVar.video.click(); 
        }
    }
    
    /**
     * full screen
     * ----------------------------------------------------
     */
        
    function isFullScreen(){
        var isFull = document.fullscreenEnabled ||
                        document.webkitFullscreenEnabled ||
                        document.mozFullScreenEnabled || 
                        document.msFullscreenEnabled;
        return isFull;
    }

    function requestFullscreen(el){
        if (el.requestFullscreen) {
            el.requestFullscreen();
        } else if (el.webkitRequestFullscreen) {
            el.webkitRequestFullscreen();
        } else if (el.mozRequestFullScreen) {
            el.mozRequestFullScreen();
        } else if (el.msRequestFullscreen) {
           el.msRequestFullscreen();
        }
    }

    function exitFullScreen(){
        if (document.exitFullscreen) {
        document.exitFullscreen();
        } else if (document.webkitExitFullscreen) {
            document.webkitExitFullscreen();
        } else if (document.mozCancelFullScreen) {
            document.mozCancelFullScreen();
        } else if (document.msExitFullscreen) {
            document.msExitFullscreen();
        }
    }

    /**
     * ----------------------------------------------------
     */

    /**
     * create download
     * ------------------------------------------------------
     */
    
    function createDownloadImage(nameDownload,pathDownload){
        var a = document.createElement("a");
        a.href = pathDownload;
        a.download = nameDownload;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    }
    
    /**
     * --------------------------------------------------------
     */

    /**
     * action of button
     * --------------------------------------------------------
     */

    globalVar.previousButton.addEventListener("click",function(e){
        globalVar.currentPos = sliding(globalVar.currentPos,globalVar.images,false);
    });

    globalVar.nextButton.addEventListener("click",function(e){
        globalVar.currentPos = sliding(globalVar.currentPos,globalVar.images,true);
    });

    /**
     * --------------------------------------------------------
     */
    
    
    
    /**
    * full screen 
    * --------------------------------------------------------
    */
     
    globalVar.expand.addEventListener("click",function(e){
        if(isFullScreen()){
            requestFullscreen(globalVar.mainImg);
        }
    });

    globalVar.exitFull.addEventListener("click",function(e){
        exitFullScreen();
    });
    
    /**
     * --------------------------------------------------------
     */
    
    /**
     * video 
     *  --------------------------------------------------------
     */
    
    
    function moveProgressBar(elem,time) {
        var width = 1;
        var id = setInterval(frame, time);
        function frame() {
            if (width >= 100) {
            elem.style.width = '0%';
            clearInterval(id);
        } else {
            width = width + 0.5;
            elem.style.width = width + '%';
            }
        }
        return id;
    }

    var idTime;
    var idMove;

    globalVar.video.addEventListener("click",function(e){ 
        if(!globalVar.video.classList.contains(globalClassAndId.activeVideo)){
            var timeFroProgress = (defaults.timeAuto / 200);
            var btnClick = (defaults.move === true) ? globalVar.nextButton : globalVar.previousButton;
            globalVar.video.innerHTML = '<i class="fa fa-pause-circle-o" aria-hidden="true"></i>'; 
            globalVar.video.classList.add(globalClassAndId.activeVideo);
            idMove = moveProgressBar(globalVar.progressBar,timeFroProgress); 
            idTime = setInterval(function(){
                idMove = moveProgressBar(globalVar.progressBar,timeFroProgress); 
                btnClick.click();
            },defaults.timeAuto);        
        }else{
            globalVar.video.classList.remove(globalClassAndId.activeVideo);
            globalVar.video.innerHTML = '<i class="fa fa-play-circle-o" aria-hidden="true"></i>';
            clearInterval(idTime);
            clearInterval(idMove);
            globalVar.progressBar.style.width = "0%";
        }
    });

    /**
     * Download button
     */
    
    function getName(src){
        var temp = src.split("/");
        return temp.pop();
    }
    
    globalVar.download.addEventListener("click",function(e){
        var path = globalVar.img.src;
        var name = getName(path);
        createDownloadImage(name,path);
    });

    /**
     * --------------------------------------------------------
     */
    
     if(defaults.tab){
        // we turn off video slide when chang or hidden tab
        window.onfocus = function () { 
            turnOffAutoSlide();
        }; 

        window.onblur = function () { 
            turnOffAutoSlide();
        };
    }

    /**
     * event with slide
     * --------------------------------------------------------
     */
    var tag = document.getElementsByClassName(globalClassAndId.ClassOfContain);
    tag = tag[0];
    tag.addEventListener(defaults.action,function(e){
        var target = e.target;
        var resultClick = turnOnSlider(target,globalClassAndId.classImgOrigin);
        if(resultClick){
            tag.classList.add(globalClassAndId.classDisabledSelect);
            globalVar.currentPos = resultClick.currentPos;
            globalVar.images = resultClick.images;
        }       
    });

    globalVar.itemSlide.addEventListener("click",function(e){
        tag.classList.remove(globalClassAndId.classDisabledSelect);
        turnOffSlider(e.target);    
    });

    /**
     * --------------------------------------------------------
     */

}

slideShow({},"wimage-content","wimageThumbnail","wimage-thumbnail-back");