class Converter {
    splitTextV1 = (t, e, n, c) => {
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
        if(cheerList){
            cheerList.forEach(function(t){
                cheerTotal = cheerTotal + parseInt(t);
            })
        }
        out.unshift(cheerTotal);
        return out;
    }

    formatText = (t, e, n) => {
        var space = /\s+/g;
        //var comma = /,/g;
        t = t.replace(space, ' ');
        //t = t.replace(comma, '');
        var u = t,
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
        g.forEach((function (t) {
            b = b.replace(t[0], "");
            c = c + t[0] + ' ';
        }))
        l = b;
        l = l.replace(/((?:https?|ftp):\/\/[\n\S]+)|(<([^>]+)>)+/gi, "").trim();
        return this.splitTextV1(l, e, n, c);
    }
}

export default new Converter()



