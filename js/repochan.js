const baseUrl = "https://riichi.moe/api/"

function uuidv4() {
	return "10000000-1000-4000-8000-100000000000".replace(/[018]/g, c =>
		(+c ^ crypto.getRandomValues(new Uint8Array(1))[0] & 15 >> +c / 4).toString(16)
	);
}

function getDeleteId() {
	const deleteId = localStorage.getItem('deleteId');

	if (deleteId) {
		return deleteId;
	}

	const newDeleteId = uuidv4();
	localStorage.setItem('deleteId', newDeleteId);
	return newDeleteId;
}

const deleteId = getDeleteId();
const authToken = localStorage.getItem('authToken');
const authHeaders = authToken ? {
	"Authorization": `Bearer ${authToken}`
} : {};

function toReadableFileSize(fileSize) {
	if (fileSize > 1000000) {
		return Math.round(fileSize / 100000) / 10 + "MB";
	}
	if (fileSize > 1000) {
		return Math.round(fileSize / 1000) + "KB";
	}
	return fileSize + "B";
}

function imageUrl(id, thumb) {
	return `${baseUrl}bulletin/images${thumb ? '/thumb' : '/full'}/${id}`;
}

function renderOP(entry) {
	const newThread = $('.thread.template').clone();
	newThread.removeClass('template');
	renderSharedData(newThread, entry);
	return newThread;
}

function loadIndex() {
	fetch(baseUrl + "bulletin", {
		headers: authHeaders
	})
	.then(body => body.json())
	.then(data => data.forEach((entry, i) => {
		if (i > 0) {
			const d = $('<div/>').addClass('divider').appendTo($('#main'));
			if (i === 20) {
				d.addClass('limit');
			}
		}
		const op = renderOP(entry.thread).appendTo($('#main'));
		entry.posts.forEach(post => renderPost(post).appendTo(op));
	}));
}

function showNotFound() {

}

function renderPost(post) {
	const newPost = $('.post.template').clone();
	newPost.removeClass('template');
	renderSharedData(newPost, post);
	return newPost;
}

const openTag = '<span class="reference">';
const closeTag = '</span>';
const insertionLength = openTag.length + closeTag.length;
function renderSharedData(container, data) {
	container.find('.body').html(data.body.split(/\r?\n/).map(line => {
		line = line.trim();
		const re = /&gt;&gt;(\d+)/g;
		const matches = [];
		while ((match = re.exec(line)) != null) {
			matches.push([match.index, re.lastIndex]);
		}
		let insertions = 0;
		for (const match of matches) {
			line = line.slice(0, match[0] + insertions)
				+ openTag
				+ line.slice(match[0] + insertions, match[1] + insertions)
				+ closeTag
				+ line.slice(match[1] + insertions);
			insertions += insertionLength;;
		}
		if (line.match(/^&gt;/)) {
			return `<span class="greentext">${line}</span>`;
		}
		return line;
	}).join("\r\n"));

	container.find('.body .reference').on('click', function () {
		const postNumber = $(this).text().slice(2);
		if (scrollToPost(postNumber)) {
			return;
		}
		window.location = "/" + postNumber;
	});
	container.find('.header .title').html(data.title);
	container.find('.header .name').text(data.name ?? "Jyanshi");
	container.find('.header .date').text(new Date(data.postTime).toLocaleString());
	container.find('.header .link').attr('href', data.postNumber);
	container.find('.header .link').attr('id', data.postNumber);
	container.find('.header .numbers').text(data.postNumber).on('click', (e) => {
		if (!getThreadId()) {
			window.location = '/' + data.postNumber;
			return;
		}
		$('.form.floating').removeClass('hidden').css('top', e.pageY).css('left', e.pageX);
		$('.form.floating textarea').append(">>" + data.postNumber + "\r\n").focus();
	});

	container.find('.header .reply a').attr('href', '/' + data.postNumber);

	container.find('.header .numbers').attr('data-post', data.postNumber);

	container.find('.header .id').text(data.posterIp);

	container.find('.menu').on('click', function () {
		$(this).find('.options').toggleClass('hidden');
	})

	if (data.banned) {
		$('<blockquote/>').addClass('banned').text('USER WAS BANNED FOR THIS POST').appendTo(container.find('.body'));
	}

	if (authToken) {
		container.find('.menu .delete')
			.clone()
			.removeClass('delete')
			.addClass('ban')
			.text('Ban')
			.on('click', () => fetch(baseUrl + "bulletin/ban/" + data.postNumber, {
				method: 'post',
				headers: {
					"Accept": "application/json",
					"Content-Type": "application/json",
					...authHeaders
				},
			}))
			.appendTo(container.find('.menu .options'));
	}

	container.find('.menu .delete').on('click', () => {
		fetch(baseUrl + "bulletin/" + data.postNumber, {
			method: 'delete',
			headers: {
				"Accept": "application/json",
				"Content-Type": "application/json",
				...authHeaders
			},
			body: JSON.stringify({
				deleteId
			})
		});
	});

	if (!data.imageData) {
		return
	}
	container.find('.meta').removeClass('hidden');
	container.find('.meta a').text(data.imageData.fileName);
	container.find('.meta a').attr('href', imageUrl(data._id));
	container.find('.meta .data').text(`(${toReadableFileSize(data.imageData.fileSize)}, ${data.imageData.dimensions[0]}x${data.imageData.dimensions[1]})`);
	const image = $('<img/>').attr('src', imageUrl(data._id, true)).prependTo(container.find('.body'));
	image[0].classList.add("postimage");
	image[0].classList.add("thumbnail");
	image.on('click', function () {
		const expand = !$(this).data('expanded');
		console.log(expand);
		$(this).data('expanded', expand);
		$(this).attr('src', imageUrl(data._id, !expand));
		this.classList.toggle('thumbnail');
	})

	container.find('.meta').after(image);
}

function updateCount(count) {
	$('.control.bottom .count').text(count);
	if (count > 450) {
		$('.control.bottom .notification').text("Thread is nearing post limit");
	} else if (count >= 500) {
		$('.control.bottom .notification').text("Post limit reached");
	}
}

function loadThread(threadId) {
	return fetch(baseUrl + "bulletin/" + threadId, {
		headers: authHeaders
	})
	.catch(() => showNotFound())
	.then(body => body.json())
	.then(data => {
		const op = renderOP(data.thread).appendTo($('#main'));
		data.posts.forEach(entry => {
			renderPost(entry).appendTo(op);
		});
		let url = data.thread.postNumber;
		if (threadId !== data.thread.postNumber) {
			url += "#" + threadId;
		}
		updateCount(data.thread.totalReplies);
		return {
			lastPostNumber: data.posts[data.posts.length - 1].postNumber,
			threadId: data.thread.postNumber,
			title: data.thread.title
		};
	});
}


function getThreadId() {
	const match = window.location.pathname.match(/(\d+)\/?/);
	if (!match) {
		return null;
	}
	return match[0];
}

function loadUpdate(threadId, lastPostId) {
	return fetch(baseUrl + "bulletin/" + threadId + "?lastPostId=" + lastPostId, {
		headers: authHeaders
	})
	.then(body => body.json())
	.then(data => {
		data.posts.forEach((post) => {
			renderPost(post).appendTo($('.thread'))
		});
		updateCount(data.thread.totalReplies);
		return {
			lastPostNumber: data.posts.length ? data.posts[data.posts.length - 1].postNumber : lastPostId,
			postsLoaded: data.posts.length
		};
	});
}

function startRefreshTimer(data, max = 10, current = max) {
	$('.timer').text(current);
	if (current === 0) {
		loadUpdate(data.threadId, data.lastPostNumber).then(n => {
			data.lastPostNumber = n.lastPostNumber;
			if (n.postsLoaded) {
				data.refreshTimer = setTimeout(() => {
					startRefreshTimer(data)
				}, 1000);
				return;
			}
			data.refreshTimer = setTimeout(() => {
				startRefreshTimer(data, max + 10)
			}, 1000);
		});
		return;
	}

	data.refreshTimer = setTimeout(() => {
		startRefreshTimer(data, max, current - 1)
	}, 1000);
}

function scrollToPost(postNumber) {
	const post = document.querySelectorAll(`[data-post="${postNumber}"]`)[0];
	if (post) {
		post.scrollIntoView({ behavior: "smooth" });
		return true;
	}
	return false;
}

function set_stylesheet(styletitle){
	localStorage.setItem('repochan_style', styletitle);

	var found = false;
	$('link[rel~=stylesheet][title]').each(function(){
		this.disabled = false;
		this.disabled = true; // TODO: kill when https://crbug.com/843887 die
		this.disabled = $(this).attr('title') !== styletitle;
		found = found || !this.disabled;
	});
	if( !found ) set_preferred_stylesheet();
}

function set_preferred_stylesheet(){
	$('link[rel~=stylesheet][title]:not([rel~=alternate])').each(function(){
		this.disabled = true; // TODO: kill when https://crbug.com/843887 dies
		this.disabled = false;
	});
	$('link[rel~=stylesheet][title][rel~=alternate]').each(function(){
		this.disabled = true;
	});
}

function setStylesheetFromLocalStorage(){
	var savedTitle, title;
	savedTitle = localStorage.getItem('repochan_style');
	title = savedTitle ? savedTitle : get_preferred_stylesheet();
	set_stylesheet(title);
	$('.topmenu select').val( get_active_stylesheet() );
}

function get_active_stylesheet(){
	return $('link[rel~=stylesheet][title]').filter(function(){
		return !this.disabled;
	}).attr('title') || null;
}

function get_preferred_stylesheet(){
  return $(
	  'link[rel~=stylesheet][title]:not([rel~=alternate])'
  ).attr('title') || null;
}

setStylesheetFromLocalStorage();
$(() => {
	setStylesheetFromLocalStorage();
	$('form').trigger('reset');
	$('input[type=checkbox]').prop('checked', false);
	$('.form.floating .x').on('click', () => $('.form.floating').addClass('hidden'));

	const data = {
		threadId: getThreadId()
	};

	$('html')
	.on("mousemove", function (e) {
		if (!data.isDragging) {
			return;
		}
		$('.form.floating').css('top', e.pageY - data.topPos);
		$('.form.floating').css('left', e.pageX - data.leftPos);
	})
	.mouseup(function () {
		data.isDragging = false;
	});
	$(".form.floating .drag")
	.mousedown(function (e) {
		data.isDragging = true;
		const offset = $(this).offset();
		data.leftPos = e.pageX - offset.left;
		data.topPos = e.pageY - offset.top;
	});

	$('.control .top').on('click', () => window.scrollTo({ top: 0, behavior: "smooth" }));
	$('.control .bottom').on('click', () => window.scrollTo({ top: document.body.scrollHeight, behavior: "smooth" }));

	$('.control .reply').on('click', (e) => {
		$('.form.top textarea').append(">>" + data.threadId + "\r\n").focus();
	});

	$('.update').on('click', () => {
		if (data.threadId) {
			loadUpdate(data.threadId, data.lastPostNumber).then(n => data.lastPostNumber = n.lastPostNumber);
			return;
		}
		window.location.reload();
	});

	$('form').on('submit', function (e) {
		e.preventDefault();
		const formData = new FormData(e.target);
		formData.append('deleteId', deleteId);
		let url = baseUrl + "bulletin";
		if (data.threadId) {
			url += '/' + data.threadId;
		}
		fetch(url, {
			method: "post",
			body: formData
		})
		.then(res => {
			if (res.status !== 200) {
				res.text().then(text => $('.error').text(text));
				return;
			}
			if (!data.threadId) {
				res.text().then(text => window.location = '/' + text);
				return;
			}
			$('.error').text("");
		})
		.catch(err => console.log(err));
	})

	$('#refresh').on('input', (e) => {
		if (!e.target.checked) {
			$('.timer').text("");
			if (data.refreshTimer) {
				clearTimeout(data.refreshTimer);
			}
			return;
		}
		startRefreshTimer(data, 0);
	});

	if (data.threadId) {
		loadThread(data.threadId).then((resp) => {
			data.lastPostNumber = resp.lastPostNumber;

			if (data.threadId !== resp.threadId) {
				scrollToPost(data.threadId);
			}
			data.threadId = resp.threadId;
		});
		$('.header .reply').addClass('hidden');
		return;
	}
	$('.control .reply').addClass('hidden');

	loadIndex();
})

