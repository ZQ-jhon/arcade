(function() {
    if (window.ksRunnerInit) return;

    // This line gets patched up by the cloud
    var pxtConfig = {
    "relprefix": "/arcade/",
    "verprefix": "",
    "workerjs": "/arcade/worker.js",
    "monacoworkerjs": "/arcade/monacoworker.js",
    "pxtVersion": "5.0.1",
    "pxtRelId": "",
    "pxtCdnUrl": "/arcade/",
    "commitCdnUrl": "/arcade/",
    "blobCdnUrl": "/arcade/",
    "cdnUrl": "/arcade/",
    "targetVersion": "0.0.0",
    "targetRelId": "",
    "targetUrl": "",
    "targetId": "arcade",
    "simUrl": "/arcade/simulator.html",
    "partsUrl": "/arcade/siminstructions.html",
    "runUrl": "/arcade/run.html",
    "docsUrl": "/arcade/docs.html",
    "isStatic": true
};

    var scripts = [
        "/arcade/highlight.js/highlight.pack.js",
        "/arcade/bluebird.min.js",
        "/arcade/semantic.js",
        "/arcade/marked/marked.min.js",
        "/arcade/target.js",
        "/arcade/pxtembed.js"
    ]

    if (typeof jQuery == "undefined")
        scripts.unshift("/arcade/jquery.js")

    var pxtCallbacks = []

    window.ksRunnerReady = function(f) {
        if (pxtCallbacks == null) f()
        else pxtCallbacks.push(f)
    }

    window.ksRunnerWhenLoaded = function() {
        pxt.docs.requireHighlightJs = function() { return hljs; }
        pxt.setupWebConfig(pxtConfig || window.pxtWebConfig)
        pxt.runner.initCallbacks = pxtCallbacks
        pxtCallbacks.push(function() {
            pxtCallbacks = null
        })
        pxt.runner.init();
    }

    scripts.forEach(function(src) {
        var script = document.createElement('script');
        script.src = src;
        script.async = false;
        document.head.appendChild(script);
    })

} ())
