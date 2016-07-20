(function() {
    var gui = require('nw.gui');
    var win = gui.Window.get();

    var http = require('http');
    var async = require('async');
    var iconv = require('iconv-lite');
    var BufferHelper = require('bufferhelper');
    var rssparser2 = require('rssparser2');

    var Datastore = require('nedb');
    var path = require('path');

    var db = {};
    db.feed = new Datastore({
        filename: path.join(gui.App.dataPath, 'bedread.data/feed.db')
    });
    db.list = new Datastore({
        filename: path.join(gui.App.dataPath, 'bedread.data/list.db')
    });
    db.group = new Datastore({
        filename: path.join(gui.App.dataPath, 'bedread.data/group.db')
    });
    db.global = new Datastore({
        filename: path.join(gui.App.dataPath, 'bedread.data/global.db')
    });
    db.feed.loadDatabase();
    db.list.loadDatabase();
    db.group.loadDatabase();
    db.global.loadDatabase();

    bedread.base = {};
    bedread.base.db = {};
    bedread.base.db.feed = {
        insert: function(doc, callback) {
            db.feed.insert(doc, callback);
        },
        remove: function(id, callback) {
            db.feed.remove({
                _id: id
            }, {}, callback);
        },
        findByGroupId: function(id, callback) {
            db.feed.find({
                groupId: id
            }).sort({
                date: 1
            }).exec(callback);
        },
        findByAll: function(callback) {
            bedread.base.db.group.find(function(err, data) {
                if (err) {
                    callback(null);
                } else {
                    var d = [];
                    async.each(data, function(item, callback) {
                        bedread.base.db.feed.findByGroupId(item.groupId, function(err, doc) {
                            item.feed = err ? [] : doc;
                            d.push(item);
                            callback(null, null);
                        });
                    }, function(err) {
                        callback(d);
                    });
                }
            });
        }
    };
    bedread.base.db.global = {
        insert: function(doc, callback) {
            db.global.insert(doc, callback);
        },
        find: function(callback) {
            db.global.find({}).exec(callback);
        }
    };
    bedread.base.db.group = {
        insert: function(doc, callback) {
            db.group.insert(doc, callback);
        },
        find: function(callback) {
            db.group.find({}).sort({
                groupId: 1
            }).exec(callback);
        }
    };
    bedread.base.db.init = function(callback) {
        bedread.base.db.global.find(function(err, data) {
            if (!err) {
                if (data && data.length > 0 && data[0].version) {
                    callback();
                } else {
                    async.parallel([

                        function(callback) {
                            bedread.base.db.global.insert({
                                version: bedread.version
                            }, function(err, doc) {
                                callback(null, null);
                            });
                        },
                        function(callback) {
                            var initgroup = [];
                            initgroup.push({
                                groupId: '1',
                                name: "Feeds",
                                date: new Date()
                            });
                            initgroup.push({
                                groupId: '2',
                                name: "News",
                                date: new Date()
                            });
                            bedread.base.db.group.insert(initgroup, function(err, doc) {
                                var initrss = [{
                                    url: 'https://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=w&output=rss',
                                    name: 'World',
                                    groupId: '2',
                                    date: new Date()
                                }, {
                                    url: 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=el&output=rss',
                                    name: 'Elections',
                                    groupId: '2',
                                    date: new Date()
                                }, {
                                    url: 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=b&output=rss',
                                    name: 'Business',
                                    groupId: '2',
                                    date: new Date()
                                }, {
                                    url: 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=tc&output=rss',
                                    name: 'Technology',
                                    groupId: '2',
                                    date: new Date()
                                }, {
                                    url: 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=e&output=rss',
                                    name: 'Entertainment',
                                    groupId: '2',
                                    date: new Date()
                                }, {
                                    url: 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=s&output=rss',
                                    name: 'Sports',
                                    groupId: '2',
                                    date: new Date()
                                }, {
                                    url: 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=snc&output=rss',
                                    name: 'Science',
                                    groupId: '2',
                                    date: new Date()
                                }, {
                                    url: 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=m&output=rss',
                                    name: 'Health',
                                    groupId: '2',
                                    date: new Date()
                                }, {
                                    url: 'http://news.google.com/news?cf=all&hl=en&pz=1&ned=us&topic=ir&output=rss',
                                    name: 'Spotlight',
                                    groupId: '2',
                                    date: new Date()
                                }];
                                bedread.base.db.feed.insert(initrss, function(err, doc) {
                                    callback(null, null);
                                });
                            });
                        }
                    ], function(err, results) {
                        callback();
                    });
                }
            }
        });
    };
    bedread.base.rss = {
        get: function(url, callback) {
            // http.get(url, function(res) {
            //     var buffer = new BufferHelper();
            //     res.on('data', function(chunk) {
            //         buffer.concat(chunk);
            //     });
            //     res.on('end', function() {
            //         var xml = iconv.decode(buffer.toBuffer(), 'utf-8');
            //         digester.digest(xml, function(err, result) {
            //             callback(err, result);
            //         });
            //     });
            //     res.on('error', function(err) {
            //         callback(err, null);
            //     });
            // }).on('error', function(err) {
            //     callback(err, null);
            // }).setTimeout(30000, function(r) {
            //     console.log("timeout");
            //     this.abort();
            // });
            var options = {};
            rssparser2.parseURL(url, options, callback);
        }
    };
    bedread.base.open = function(url) {
        gui.Shell.openExternal(url);
    };
    var menuabout = new gui.Menu();
    bedread.base.menufeed = new gui.Menu();
    bedread.base.init = function() {
        menuabout.append(new gui.MenuItem({
            label: 'reload'
        }));
        menuabout.append(new gui.MenuItem({
            label: 'about'
        }));
        menuabout.append(new gui.MenuItem({
            label: 'exit'
        }));
        menuabout.items[0].click = function() {
            win.reload();
        };
        menuabout.items[1].click = function() {
            bedread.base.open('https://github.com/catcto/bedread');
        };
        menuabout.items[2].click = function() {
            win.close();
        };
        $('.titlebar .logo').click(function(ev) {
            menuabout.popup(10, 10);
            return false;
        });

        bedread.base.menufeed.append(new gui.MenuItem({
            label: 'delete'
        }));
        bedread.base.menufeed.items[0].click = function() {
            bedread.base.db.feed.remove(bedread.menufeedid, function(err, numRemoved) {
                bedread.initFeed();
            });
        };

        $('#close').click(function() {
            win.close();
        });
        
        //gui.Window.get().showDevTools();
    }
})();
