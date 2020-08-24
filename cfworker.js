const upstream = 'streamwire.net'
const upstream_mobile = 'streamwire.net'
const upstream_path = '/e/'
const blocked_region = ['CN', 'KP', 'SY', 'CU']
const blocked_ip_address = ['127.0.0.1']
const https = true
const disable_cache = false

const replace_dict = {
    '$upstream': 'streamwire.net',
	'/css/main.css' : '//streamwire.cf/swasset/main.css',
	'/favicon.ico' : '//streamwire.cf/swasset/favicon.ico',
	'/favicon.png' : '//streamwire.cf/swasset/favicon.png',
	'/js/jquery.min.js' : '//streamwire.cf/swasset/jquery.min.js',
	'/js/xupload.js' : '//streamwire.cf/swasset/xupload.js',
	'/js/jquery.cookie.js' : '//streamwire.cf/swasset/jquery.cookie.js',
	'/player_hola/hola_player.js' : '//streamwire.cf/swasset/hola_player.js',
	'/player_hola/videojs.hotkeys.min.js' : '//streamwire.cf/swasset/videojs.hotkeys.min.js',
    'bcloudhost.com' : '',
    '<div id="adbd" class="overdiv">' : '<div>',
    '<div>Disable ADBlock plugin and allow pop-ups in your browser to watch video</div>' : '',
    '<div id="play_limit_box">' : '<div>',
    'Upgrade you account' : '',
    'to watch videos with no limits!' : '',
    'position:absolute;top:1px;right:1px;' : 'visibility: hidden;',
    'riverhit.com' : '',
    'cloudfront.net' : '',
    'umekian.pw' : '',
    'pop.js' : '',
}

addEventListener('fetch', event => {
    event.respondWith(fetchAndApply(event.request));
})

async function fetchAndApply(request) {
    const region = request.headers.get('cf-ipcountry').toUpperCase();
    const ip_address = request.headers.get('cf-connecting-ip');
    const user_agent = request.headers.get('user-agent');

    let response = null;
    let url = new URL(request.url);
    let url_hostname = url.hostname;

    if (https == true) {
        url.protocol = 'https:';
    } else {
        url.protocol = 'http:';
    }

    if (await device_status(user_agent)) {
        var upstream_domain = upstream;
    } else {
        var upstream_domain = upstream_mobile;
    }

    url.host = upstream_domain;
    if (url.pathname == '/') {
        url.pathname = upstream_path;
    } else {
        url.pathname = upstream_path + url.pathname;
    }

    if (blocked_region.includes(region)) {
        response = new Response('Access denied: WorkersProxy is not available in your region yet.', {
            status: 403
        });
    } else if (blocked_ip_address.includes(ip_address)) {
        response = new Response('Access denied: Your IP address is blocked by WorkersProxy.', {
            status: 403
        });
    } else {
        let method = request.method;
        let request_headers = request.headers;
        let new_request_headers = new Headers(request_headers);

        new_request_headers.set('Host', upstream_domain);
        new_request_headers.set('Referer', url.protocol + '//' + url_hostname);

        let original_response = await fetch(url.href, {
            method: method,
            headers: new_request_headers,
            body: request.body
        })

        connection_upgrade = new_request_headers.get("Upgrade");
        if (connection_upgrade && connection_upgrade.toLowerCase() == "websocket") {
            return original_response;
        }

        let original_response_clone = original_response.clone();
        let original_text = null;
        let response_headers = original_response.headers;
        let new_response_headers = new Headers(response_headers);
        let status = original_response.status;
		
		if (disable_cache) {
			new_response_headers.set('Cache-Control', 'no-store');
	    }

        new_response_headers.set('access-control-allow-origin', '*');
        new_response_headers.set('access-control-allow-credentials', true);
        new_response_headers.delete('content-security-policy');
        new_response_headers.delete('content-security-policy-report-only');
        new_response_headers.delete('clear-site-data');
		
		if (new_response_headers.get("x-pjax-url")) {
            new_response_headers.set("x-pjax-url", response_headers.get("x-pjax-url").replace("//" + upstream_domain, "//" + url_hostname));
        }
		
        const content_type = new_response_headers.get('content-type');
        if (content_type != null && content_type.includes('text/html') && content_type.includes('UTF-8')) {
            original_text = await replace_response_text(original_response_clone, upstream_domain, url_hostname);
        } else {
            original_text = original_response_clone.body
        }
		
        response = new Response(original_text, {
            status,
            headers: new_response_headers
        })
    }
    return response;
}

async function replace_response_text(response, upstream_domain, host_name) {
    let text = await response.text()

    var i, j;
    for (i in replace_dict) {
        j = replace_dict[i]
        if (i == '$upstream') {
            i = upstream_domain
        } else if (i == 'streamwire.nocensor.ga') {
            i = host_name
        }

        if (j == '$upstream') {
            j = upstream_domain
        } else if (j == 'streamwire.nocensor.ga') {
            j = host_name
        }

        let re = new RegExp(i, 'g')
        text = text.replace(re, j);
    }
    return text;
}


async function device_status(user_agent_info) {
    var agents = ["Android", "iPhone", "SymbianOS", "Windows Phone", "iPad", "iPod"];
    var flag = true;
    for (var v = 0; v < agents.length; v++) {
        if (user_agent_info.indexOf(agents[v]) > 0) {
            flag = false;
            break;
        }
    }
    return flag;
}
