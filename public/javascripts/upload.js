var flag = false;
$(function () {
    var timerId;
    var button=document.getElementById('userFileInput');

    function setDisbtn() {
        button.disabled = true;
        flag = true;
    }
    function setEnabtn(){
        button.disabled = false;
        if (flag){
            flag = false;
            location.reload(true);
        }
    }

    function setTimer() {
        timerId = setInterval(function () {
            if ($('#userFileInput').val() !== '') {
                clearInterval(timerId);
                $('#uploadForm').submit();
            }else{
                setEnabtn();
            }
        }, 500);
    }

    function setProgress(percent,el,et) {
        if (percent==0) {
            $('#percent').html(percent + '%');
            $('#bar').css('width', percent + '%');
        }else{
            var by='Bytes';
            var eby = 'Bytes';
            if (et>1000000000){
                by = 'GB';
                et = et/1000000000;
            }else if (et>1000000){
                by = 'MB';
                et = et/1000000;
            }else if (et>1000){
                by = 'KB';
                et = et/1000;
            }
            if (el>1000000000){
                eby = 'GB';
                el = el/1000000000;
            }else if (el>1000000){
                eby = 'MB';
                el = el/1000000;
            }else if (el>1000){
                eby = 'KB';
                el = el/1000;
            }
            el = Math.round(el*100)/100;
            et = Math.round(et*100)/100;
            $('#percent').html(percent + '%' + '  '+el+eby+'/'+et+by);
            $('#bar').css('width', percent + '%');
        }
    }
    setTimer();
    $('#uploadForm').submit(function () {
        setDisbtn();
        var formData = new FormData();
        var file = document.getElementById('userFileInput').files[0];
        formData.append('userFile',file);
        var spcp = currentPath.substr(5);
        var xhr = new XMLHttpRequest();
        xhr.overrideMimeType('application/json');
        xhr.open('post', '/file/api/upload/?currentPath='+spcp, true);
        xhr.upload.onprogress = function (e) {
            if (e.lengthComputable)
                setProgress(Math.round((e.loaded / e.total) * 100), e.loaded, e.total);
        };
        xhr.onload = function () {
            $('#userFileInput').val('');
            setProgress(0,0,0);
            var resJson = JSON.parse(xhr.responseText);
            setTimer();
            if (resJson.image)
                window.open('./uploads/' + resJson.savedAs, 'upload', 'status=1, height = 300, width = 300, resizable = 0');
            else
                console.log('not an image');

        };
    xhr.send(formData);
    return false; //no refresh
    });

    var menu1 = [
        {'새 폴더':function(menuItem,menu) {
            if (flag){
                $(this.menu).find('.context-menu-item').each(function() {
                    $(this).toggleClass("context-menu-item-disabled");
                });
            }
            var modal = prompt("폴더 이름","");
            if (modal.valueOf()==null){
                return false;
            }else{
                var xhr = new XMLHttpRequest();
                var spcp = currentPath.substr(5);
                xhr.overrideMimeType('application/json');
                xhr.open('post', '/file/api/mkdir/?currentPath='+spcp+'&folderName='+modal, true);
                xhr.send();
                location.reload(true);
            }
        } }
    ];

    $('.filemanager').contextMenu(menu1,{
        beforeShow: function() {
            $(this.menu).find('.context-menu-item').each(function() {
                console.log($(this).hasClass("context-menu-item-disabled"));
                if (flag && $(this).hasClass("context-menu-item-disabled")==false) {
                    $(this).toggleClass("context-menu-item-disabled");
                }
            });
        },
        theme:'vista'
    });

    var menu2 = [
        {'새 폴더': {onclick:function(menuItem,menu) {
            var modal = prompt("폴더 이름","");
            if (modal.valueOf()==null){
                return false;
            }else{
                var xhr = new XMLHttpRequest();
                var spcp = currentPath.substr(5);
                xhr.overrideMimeType('application/json');
                xhr.open('post', '/file/api/mkdir/?currentPath='+spcp+'&folderName='+modal, true);
                xhr.send();
                location.reload(true);
            }
        },
          disabled: flag == true ? true : false
        } },
        $.contextMenu.separator,
        {'이름 바꾸기': function(menuItem,menu) {
            var modal = prompt("새로운 이름","");
            if (modal.valueOf()==null){
                return false;
            }else{
                var xhr = new XMLHttpRequest();
                var spcp = currentPath.substr(5);
                var opcp = originaldir.substr(5);
                xhr.overrideMimeType('application/json');
                xhr.open('post', '/file/api/rndir/?currentPath='+spcp+'&folderName='+modal+'&originalName='+opcp, true);
                xhr.send();
                location.reload(true);
            }
        } },
        $.contextMenu.separator,
        {'삭제':function(menuItem,menu) {
            $(this).toggleClass("context-menu-item-disabled");
            var modal = confirm("정말 삭제하시겠습니까?");
            if (modal==true){
                var xhr = new XMLHttpRequest();
                var opcp = originaldir.substr(5);
                xhr.overrideMimeType('application/json');
                xhr.open('post', '/file/api/unlink/?originalName='+opcp, true);
                xhr.send();
                location.reload(true);
            }
        } }
    ];

    $('.data').contextMenu(menu2, {
        beforeShow: function() {
            $(this.menu).find('.context-menu-item').each(function() {
                console.log($(this).hasClass("context-menu-item-disabled"));
                if (flag && $(this).hasClass("context-menu-item-disabled")==false) {
                    $(this).toggleClass("context-menu-item-disabled");
                }
            });
        },
        theme: 'vista'
    });
});