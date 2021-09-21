import cheerJson from '../cheer.json'
class Converter {
    splitTextV1 = (t, e, n, c, v) => {
        var r = [];
        function text(o, i) {
            if (e[i] && o.trim().length)
                if (o.indexOf(e[i]) > -1) {
                    var a = 1
                        , s = o.split(e[i]);
                    s.forEach((function (o) {
                        if (o.length) {
                            var c = "";
                            a !== s.length && (c = e[i]);
                            o = (o + c).trim()
                        }
                        o.length && o.length <= n ? r.push(o) : text(o, i + 1);
                        a++
                    }
                    ))
                } else
                    text(o, i + 1);
            else if (o.length)
                for (var c = new RegExp(".{1,".concat(n, "}"), "g"), u = o.match(c); u.length > 0;)
                    r.push(u.shift().trim())
        };
        text(t, 0);

        var out = [];
        r.forEach(function (t) {
            out.length && out[out.length - 1].length + t.length + 1 <= n ? out[out.length - 1] += " ".concat(t) : out.push(t)
        })
        var cheerRegex = /([0-9])\d+/g;
        var cheerList = c.match(cheerRegex);
        var cheerTotal = 0;
        if (cheerList) {
            cheerList.forEach(function (t) {
                cheerTotal = cheerTotal + parseInt(t);
            })
        }
        var data = {
            count: cheerTotal,
            display: v,
            message: out
        }
        return data;
    }

    formatText = (t, e, n, z) => {
        var space = /\s+/g;
        //var comma = /,/g;
        var vv = t;
        t = t.replace(space, ' ');
        //t = t.replace(comma, '');
        var u = vv,
            l = t,
            f = ["cheer", "doodlecheer", "biblethump", "cheerwhal", "corgo", "scoops", "party", "seemsgood", "pride", "uni", "showlove", "kappa", "frankerz", "heyguys", "dansgame", "elegiggle", "trihard", "kreygasm", "4head", "swiftrage", "notlikethis", "failfish", "vohiyo", "pjsalt", "mrdestructoid", "bday", "ripcheer", "shamrock", "bitboss", "streamlabs", "muxy", "holidaycheer", "goal", "anon", "charity", "tgm3cheer"]
        u.length > 300 && (u = "".concat(u.substring(0, 296), "..."));
        l.length > 550 && (l = "".concat(l.substring(0, 446), "..."));
        var d = new RegExp("\\b(".concat(f.join("|"), ")([0-9]+)\\b"), "gi"),
            m = /(^|\s)([a-zA-Z0-9][a-zA-Z]+|[a-zA-Z0-9]+cheer)([0-9]+)(\s|$)/i,
            y = u.match(d),
            g = [];
        y && (g = y.map((function (t) {
            return m.exec(t)
        })));
        var c = "";
        var b = l;
        var v = u;
        v = this.formatTwitchEmotes(v,z);
        g.forEach((function (t) {
            var color, height;
            var i = parseInt(t[3]);
            if (parseInt(t[3]) >= 1e4) { color = "red"; height = 10000; }
            if (parseInt(t[3]) >= 5e3 && parseInt(t[3]) <= 9999) { color = "blue"; height = 5000; }
            if (parseInt(t[3]) >= 1e3 && parseInt(t[3]) <= 4999) { color = "#2dfdbe"; height = 1000; }
            if (parseInt(t[3]) >= 100 && parseInt(t[3]) <= 999) { color = "#be61ff"; height = 100; }
            if (parseInt(t[3]) >= 1 && parseInt(t[3]) <= 99) { color = "grey"; height = 1; }
            var temp1 = t[2].toLowerCase();
            var temp2 = cheerJson[temp1][height];
            v = v.replace(t[0], "<img src='" + temp2 + "' /><font color='" + color + "'>" + t[3] + "</font>");
            b = b.replace(t[0], "");
            c = c + t[0] + ' ';
        }))
        l = b;
        l = l.replace(/((?:https?|ftp):\/\/[\n\S]+)|(<([^>]+)>)+/gi, "").trim();
        return this.splitTextV1(l, e, n, c, v);
    }

    formatTwitchEmotes = (text, emotes) => {
        let link = 'http://static-cdn.jtvnw.net/emoticons/v2/';
        var splitText = Array.from(text);
        for (var i in emotes) {
            var e = emotes[i];
            for (var j in e) {
                var mote = e[j];
                if (typeof mote === 'string') {
                    mote = mote.split('-');
                    mote = [parseInt(mote[0]), parseInt(mote[1])];
                    var length = mote[1] - mote[0];
                    var empty = Array.apply(null, new Array(length + 1)).map(function () { return ''; });
                    splitText = splitText.slice(0, mote[0]).concat(empty).concat(splitText.slice(mote[1] + 1, splitText.length));
                    splitText.splice(mote[0], 1, `<img class="emoticon" src="${link}${i}/default/dark/3.0">`);
                };
            };
        }
        return splitText.join('');
    }
}

export default new Converter()



