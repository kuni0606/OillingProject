var currentPath="";
var originaldir;
var od;
$(function(){


	var filemanager = $('.filemanager'),
		breadcrumbs = $('.breadcrumbs'),
	    fileList = filemanager.find('.data');

	// Start by fetching the file data from scan route with an AJAX request

	$.get('file/api/scan', function(data) {

		var response = [data],
			breadcrumbsUrls = [];
        currentPath='';

		var folders = [],
			files = [];

		// This event listener monitors changes on the URL. We use it to
		// capture back/forward navigation in the browser.

		$(window).on('hashchange', function(){

			goto(window.location.hash);

			// We are triggering the event. This will execute
			// this function on page load, so that we show the correct folder:

		}).trigger('hashchange');


		// Hiding and showing the search box

		filemanager.find('.search').click(function(){

			var search = $(this);

			search.find('span').hide();
			search.find('input[type=search]').show().focus();

		});


		// Listening for keyboard input on the search field.
		// We are using the "input" event which detects cut and paste
		// in addition to keyboard input.

		filemanager.find('input').on('input', function(e){

			folders = [];
			files = [];

			var value = this.value.trim();

			if(value.length) {

				filemanager.addClass('searching');

				// Update the hash on every key stroke
				window.location.hash = 'search=' + value.trim();

			}

			else {

				filemanager.removeClass('searching');
				window.location.hash = encodeURIComponent(currentPath);

			}

		}).on('keyup', function(e){

			// Clicking 'ESC' button triggers focusout and cancels the search

			var search = $(this);

			if(e.keyCode == 27) {

				search.trigger('focusout');

			}

		}).focusout(function(e){

			// Cancel the search

			var search = $(this);

			if(!search.val().trim().length) {

				window.location.hash = encodeURIComponent(currentPath);
				search.hide();
				search.parent().find('span').show();

			}

		});
		// Clicking on folders
        fileList.on('mouseup', 'li.folders' , function(e){
            e.preventDefault();
            originaldir = $(this).find('a.folders').attr('href');
            console.log(originaldir);
        });
        fileList.on('mouseup', 'li.files' , function(e){
            e.preventDefault();
            originaldir = $(this).find('a.files').attr('href');
            console.log(originaldir);
        });
        fileList.on('dragstart', 'li.files' , function( event ){
            event.preventDefault();
            //if ( !$(event.target).is('.handle') ) return false;
            od = $(this).find('a.files').attr('href');
            return $( this ).css('opacity',.2);
        });
        fileList.on('dragstart', 'li.folders' , function( event ){
            event.preventDefault();
            //if ( !$(event.target).is('.handle') ) return false;
            od = $(this).find('a.folders').attr('href');
            return $( this ).css('opacity',.2);
        });
        fileList.on('dragend', 'li.folders' , function( event ){
            event.preventDefault();
            $(this).remove();
            var td = $(this).find('a.folders').attr('href');
            var xhr = new XMLHttpRequest();
            var spcp = currentPath.substr(5);
            var modal = td.split('/');
            var opcp = od.substr(5);
            var tmp = opcp.split('/');
            console.log(modal +':'+ tmp);
            if (modal[modal.length-1]!=tmp[tmp.length-1]) {
                xhr.overrideMimeType('application/json');
                xhr.open('post', '/file/api/rndir/?currentPath=' + spcp + '&folderName=' + modal[modal.length - 1] + '/' + tmp[tmp.length - 1] + '&originalName=' + opcp, true);
                xhr.send();
                location.reload(true);
                console.log(td);
            }else{
                var nextDir = $(this).find('a.folders').attr('href');

                if(filemanager.hasClass('searching')) {

                    // Building the breadcrumbs

                    breadcrumbsUrls = generateBreadcrumbs(nextDir);

                    filemanager.removeClass('searching');
                    filemanager.find('input[type=search]').val('').hide();
                    filemanager.find('span').show();
                }
                else {
                    var t = nextDir.split("/");
                    var o='';
                    for (var i =1;i< t.length;i++){
                        o += t[i] + '/';
                    }
                    console.log(o);
                    breadcrumbsUrls.push(nextDir);
                }

                window.location.hash = encodeURIComponent(nextDir);
                currentPath = nextDir;
            }
        });
		fileList.on('click', 'li.folders', function(e){
			e.preventDefault();

			var nextDir = $(this).find('a.folders').attr('href');

			if(filemanager.hasClass('searching')) {

				// Building the breadcrumbs

				breadcrumbsUrls = generateBreadcrumbs(nextDir);

				filemanager.removeClass('searching');
				filemanager.find('input[type=search]').val('').hide();
				filemanager.find('span').show();
			}
			else {
                var t = nextDir.split("/");
                var o='';
                for (var i =1;i< t.length;i++){
                    o += t[i] + '/';
                }
                location.reload(true);
                console.log(o);
				breadcrumbsUrls.push(nextDir);
			}

			window.location.hash = encodeURIComponent(nextDir);
			currentPath = nextDir;
		});

		// Clicking on breadcrumbs

		breadcrumbs.on('click', 'a', function(e){
			e.preventDefault();

			var index = breadcrumbs.find('a').index($(this)),
				nextDir = breadcrumbsUrls[index];

			breadcrumbsUrls.length = Number(index);

			window.location.hash = encodeURIComponent(nextDir);
            location.reload(true);
		});


		// Navigates to the given hash (path)

		function goto(hash) {

			hash = decodeURIComponent(hash).slice(1).split('=');

			if (hash.length) {
				var rendered = '';

				// if hash has search in it

				if (hash[0] === 'search') {

					filemanager.addClass('searching');
					rendered = searchData(response, hash[1].toLowerCase());

					if (rendered.length) {
						currentPath = hash[0];
						render(rendered);
					}
					else {
						render(rendered);
					}

				}

				// if hash is some path

				else if (hash[0].trim().length) {

					rendered = searchByPath(hash[0]);

					if (rendered.length) {

						currentPath = hash[0];
						breadcrumbsUrls = generateBreadcrumbs(hash[0]);
						render(rendered);

					}
					else {
						currentPath = hash[0];
						breadcrumbsUrls = generateBreadcrumbs(hash[0]);
						render(rendered);
					}

				}

				// if there is no hash

				else {
					currentPath = data.path;
					breadcrumbsUrls.push(data.path);
					render(searchByPath(data.path));
				}
			}
		}

		// Splits a file path and turns it into clickable breadcrumbs

		function generateBreadcrumbs(nextDir){
			var path = nextDir.split('/').slice(0);
			for(var i=1;i<path.length;i++){
				path[i] = path[i-1]+ '/' +path[i];
			}
            var temp=[];
            temp[0] = path[0];
            for (var i=3;i<path.length;i++){
                temp[i-2] = path[i];
            }
			return temp;
		}


		// Locates a file by path

		function searchByPath(dir) {
			var path = dir.split('/'),
				demo = response,
				flag = 0;

			for(var i=0;i<path.length;i++){
				for(var j=0;j<demo.length;j++){
					if(demo[j].name === path[i]){
						flag = 1;
						demo = demo[j].items;
						break;
					}
				}
			}

			demo = flag ? demo : [];
			return demo;
		}


		// Recursively search through the file tree

		function searchData(data, searchTerms) {

			data.forEach(function(d){
				if(d.type === 'folder') {

					searchData(d.items,searchTerms);

					if(d.name.toLowerCase().match(searchTerms)) {
						folders.push(d);
					}
				}
				else if(d.type === 'file') {
					if(d.name.toLowerCase().match(searchTerms)) {
						files.push(d);
					}
				}
			});
			return {folders: folders, files: files};
		}


		// Render the HTML for the file manager

		function render(data) {

			var scannedFolders = [],
				scannedFiles = [];

			if(Array.isArray(data)) {

				data.forEach(function (d) {

					if (d.type === 'folder') {
						scannedFolders.push(d);
					}
					else if (d.type === 'file') {
						scannedFiles.push(d);
					}

				});

			}
			else if(typeof data === 'object') {

				scannedFolders = data.folders;
				scannedFiles = data.files;

			}


			// Empty the old result and make the new one

			fileList.empty().hide();

			if(!scannedFolders.length && !scannedFiles.length) {
				filemanager.find('.nothingfound').show();
			}
			else {
				filemanager.find('.nothingfound').hide();
			}

			if(scannedFolders.length) {

				scannedFolders.forEach(function(f) {

					var itemsLength = f.items.length,
						name = escapeHTML(f.name),
						icon = '<span class="icon folder"></span>';

					if(itemsLength) {
						icon = '<span class="icon folder full"></span>';
					}

					if(itemsLength == 1) {
						itemsLength += ' item';
					}
					else if(itemsLength > 1) {
						itemsLength += ' items';
					}
					else {
						itemsLength = 'Empty';
					}

					var folder = $('<li class="folders"><a href="'+ f.path +'" title="'+ f.path +'" class="folders">'+icon+'<span class="name">' + name + '</span> <span class="details">' + itemsLength + '</span></a></li>');
					folder.appendTo(fileList);
				});

			}

			if(scannedFiles.length) {

				scannedFiles.forEach(function(f) {

					var fileSize = bytesToSize(f.size),
						name = escapeHTML(f.name),
						fileType = name.split('.'),
						icon = '<span class="icon file"></span>';

					fileType = fileType.length > 1 ? fileType[fileType.length-1] : '';

					icon = '<span class="icon file f-' + fileType + '">' + fileType + '</span>';

					var file = $('<li class="files"><a href="'+ f.path+'" title="'+ f.path +'" class="files">'+icon+'<span class="name">'+ name +'</span> <span class="details">'+fileSize+'</span></a></li>');
					file.appendTo(fileList);
				});

			}


			// Generate the breadcrumbs

			var url = '';

			if(filemanager.hasClass('searching')){

				url = '<span>Search results: </span>';
				fileList.removeClass('animated');

			}
			else {

				fileList.addClass('animated');

				breadcrumbsUrls.forEach(function (u, i) {

					var name = u.split('/');

					if (i !== breadcrumbsUrls.length - 1) {
						url += '<a href="'+u+'"><span class="folderName">' + name[name.length-1] + '</span></a> <span class="arrow">→</span> ';
					}
					else {
						url += '<span class="folderName">' + name[name.length-1] + '</span>';
					}

				});

			}

			breadcrumbs.text('').append(url);


			// Show the generated elements

			fileList.animate({'display':'inline-block'});

		}


		// This function escapes special html characters in names

		function escapeHTML(text) {
			return text.replace(/\&/g,'&amp;').replace(/\</g,'&lt;').replace(/\>/g,'&gt;');
		}


		// Convert file sizes from bytes to human readable units

		function bytesToSize(bytes) {
			var sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB'];
			if (bytes == 0) return '0 Bytes';
			var i = parseInt(Math.floor(Math.log(bytes) / Math.log(1024)));
			return Math.round(bytes / Math.pow(1024, i), 2) + ' ' + sizes[i];
		}

	});
});