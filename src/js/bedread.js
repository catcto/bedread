var bedread = {};
bedread.version = "0.1.1";

bedread.form = {
	$: function(c) {
		return "string" == typeof c ? document.getElementById(c) : c
	},
	getForm: function(c) {
		c = this.$(c);
		var g = c.nodeName.toLowerCase();
		return g == "form" ? c.elements : g == "input" ? Array(c) : c.getElementsByTagName("input")
	},
	enter: function(c, g) {
		if (c)
			for (var n = this.getForm(c), l = 0; l < n.length; l++) {
				var p = n[l].getAttribute("enter");
				if (p && p == "true") n[l].onkeydown = function(a) {
					a = window.event || a;
					if (13 == a.keyCode) {
						a.returnValue = false;
						g && g()
					}
				}
			}
	},
	check: function(c, g) {
		c = c ? this.$(c) : document.forms[0];
		var n = {
			isFilled: function(a) {
				return function(b) {
					return b.replace(/\s/g,
						"").length > 0 && b != a
				}
			},
			filter: function(a) {
				return function(b) {
					a = a ? a.replace(/([\\,\^,\$,\*,\+,\?,\{,\},\.,\(,\),\[,\]])/g, "\\$1") : "(\\r\\n){1000}";
					return !RegExp("(?:" + a + ")", "i").test(b)
				}
			},
			isNaN: function() {
				return function(a) {
					return !a ? true : isNaN(a)
				}
			},
			isNumber: function() {
				return function(a) {
					return !a ? true : !isNaN(a)
				}
			},
			isInt: function() {
				return function(a) {
					return !a ? true : parseInt(a, 10) == a
				}
			},
			isEmail: function() {
				return function(a) {
					return !a ? true : /^(?:\w[\w\-]*\.?)*\w+@(?:\w[\w\-]*\.{1})+\w+$/i.test(a)
				}
			},
			isEmailList: function() {
				return function(a) {
					return !a ?
						true : /^(?!;)(?:(?:;|^)([^@.;])+@[^.@;]+(?:\.[^.@;]+)+)+$/i.test(a)
				}
			},
			fileType: function(a) {
				return function(b) {
					var e = RegExp(".(?:" + a + ")$", "i");
					return !b ? true : e.test(b)
				}
			},
			moreThan: function(a) {
				return function(b) {
					return !b ? true : b * 1 > a
				}
			},
			lessThan: function(a) {
				return function(b) {
					return !b ? true : b * 1 < a
				}
			},
			equalTo: function(a) {
				return function(b) {
					return !b ? true : b * 1 == a
				}
			},
			maxLength: function(a) {
				return function(b) {
					return !b ? true : !(b.length > a)
				}
			},
			maxLen: function(a) {
				return function(b) {
					return !b ? true : !(b.replace(/[^\x00-\xff]/g,
						"**").length > a)
				}
			},
			minLength: function(a) {
				return function(b) {
					return !b ? true : !(b.length < a)
				}
			},
			minLen: function(a) {
				return function(b) {
					return !b ? true : !(b.replace(/[^\x00-\xff]/g, "**").length < a)
				}
			},
			sameValue: function(a) {
				return function() {
					for (var b = a.split(","), e = b.length, h = null, d = null, i = true, f = 0; f < e; f++) {
						h = document.getElementById(b[f]);
						if (f == 0) d = h.value;
						else if (d != h.value) {
							i = false;
							break
						}
					}
					return i
				}
			},
			isAlpha: function() {
				return function(a) {
					return !a ? true : /^[0-9a-zA-Z\_]+$/.test(a)
				}
			},
			isAlphac: function() {
				return function(a) {
					return !a ? true : /^[\u4E00-\u9FA5\w\d]+$/.test(a)
				}
			},
			isUrl: function() {
				return function(a) {
					return !a ? true : /^(https?|ftp):\/\/[^\s\/$.?#].[^\s]*$/i.test(a);
				}
			},
			regex: function(a) {
				return function(b) {
					eval("var reg = " +
						a + "");
					return !b ? true : reg.test(b);
				}
			}
		}, l = function(a, b) {
				for (var e = 0, h = a.length; e < h; e++) {
					var d = a[e],
						i = d.getAttribute("v"),
						f = d.getAttribute("msg"),
						j = d.getAttribute("alert"),
						s = d.value;
					if (i) {
						i = i.split(";");
						var r = false;
						if (j) {
							r = true;
							f = j.split(";")
						} else if (f) f = f.split(";");
						for (j = 0; j < i.length; j++) {
							var k = i[j].match(/^(\w+)\(([^\)]*)\)$/i),
								q = k ? k[1] : i[j],
								m = k ? k[2] : null;
							k = f[j] ? f[j] : f[f.length - 1];
							q = n[q] ? n[q](m)(s) : false;
							m = d.parentNode.getElementsByTagName("span");
							for (var o = 0; o < m.length; o++) m[o].getAttribute("o_o") != null &&
								m[o].getAttribute("o_o") == "*" && m[o].parentNode.removeChild(m[o]);
							if (!q) {
								if (b && b.constructor == Function) b(d, k);
								else if (k != "")
									if (r) alert(k.replace(/ /g, ""));
									else {
										e = document.createElement("span");
										e.setAttribute("o_o", "*");
										e.innerHTML = k;
										e.className = "checkMes";
										h = d.parentNode;
										h.lastChild == d ? h.appendChild(e) : h.insertBefore(e, d.nextSibling)
									}
									//d.focus();
									//try {
									//    d.select()
									//} catch (t) { }
								return false
							}
						}
					}
				}
				return true
			}, p = c.nodeName.toLowerCase();
		if (p == "form") c = c.elements;
		else if (p == "input") c = Array(c);
		else {
			if (l(c.getElementsByTagName("input"),
				g) && l(c.getElementsByTagName("textarea"), g)) return true;
			return false
		}
		return l(c, g)
	}
};

bedread.feed = {
	modal: null,
	next: function() {
		if (bedread.form.check('add_feed1')) {
			$('#add_feed1').hide();
			$('#add_feed2').show();
		}
	},
	done: function() {
		if (bedread.form.check('add_feed2')) {
			var doc = {
				url: $('#add_feedurl').val(),
				name: $('#add_feedname').val(),
				groupId: $('#add_feedgroup').val(),
				date: new Date()
			}
			bedread.base.db.feed.insert(doc, function(err, doc) {
				if (bedread.feed.modal.isActive()) {
					bedread.feed.modal.hide();
				}
				bedread.initFeed();
			});
		}
	},
	show: function() {
		$('#add_feed1').show();
		$('#add_feed2').hide();
		$('#add_feedurl').val('');
		$('#add_feedauto').attr('checked', true);
		$('#add_feedname').val('');
		bedread.feed.modal.show();
	}
}
bedread.menufeedid = null;
bedread.initFeed = function() {
	$('.feed .loading').show();
	bedread.base.db.feed.findByAll(function(data) {
		if (data) {
			var html = template.render("template_myfeed", {
				data: data
			});
			$('.feedmain').html(html);
			$('.feedmenu').bind('contextmenu', function(e) {
				bedread.menufeedid = $(this).attr('dbid');
				bedread.base.menufeed.popup(e.pageX, e.pageY);
				return false;
			});
			$('.feed .loading').hide();
		}
	});
}
bedread.initGroup = function() {
	bedread.base.db.group.find(function(err, data) {
		if (!err) {
			if (data) {
				var html = template.render("template_group", {
					data: data
				});
				$('#add_feedgroup').html(html);
			}
		}
	});
}
bedread.rsslistitems = null;
bedread.getList = function(u) {
	$(".list .loading").show();
	bedread.base.rss.get(u, function(err, result) {
		if (!err) {
			if (result) {
				var html = template.render("template_rsslist", {
					data: result.items
				});
				bedread.rsslistitems = result.items;
				$('#rsslist').html(html);
				$('#rsslist').scrollTop(0);
				//console.log(result.items[2])
			}
		} else {
			console.log(err);
		}
		$(".list .loading").hide();
	});
}
bedread.getContent = function(index) {
	if (bedread.rsslistitems && bedread.rsslistitems[index]) {
		bedread.rsslistitems[index].published_at = moment(bedread.rsslistitems[index].published_at).format('YYYY-MM-DD HH:mm:ss');
		var html = template.render("template_rsscontent", {
			data: bedread.rsslistitems[index]
		});
		$('#maincontent').html(html);
		$('#maincontent a').click(function() {
			bedread.base.open($(this).attr('href'));
			return false;
		});
	}
}
bedread.init = function() {
	bedread.base.init();
	bedread.feed.modal = new $.UIkit.modal.Modal("#add_feed");

	$('.feed').resizable({
		handles: "e"
	});

	$('.list').resizable({
		handles: "e"
	});

	$('#btnaddfeed').click(function() {
		bedread.feed.show();
	});

	$('#add_feednext').click(function() {
		bedread.feed.next();
		return false;
	});

	$('#add_feeddone').click(function() {
		bedread.feed.done();
		return false;
	});

	bedread.base.db.init(function() {
		bedread.initFeed();
		bedread.initGroup();
		$('#fullmsg').hide();
	});
}