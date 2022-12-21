import React, {Component} from "react";
import "./App.css";
import Cheer from "./Components/Cheer";
import Sub from "./Components/Sub";
import Donation from "./Components/Donation";
import Elevated from "./Components/Elevated";
import Converter from "./model/Converter";
import AudioPlayer from "react-audio-player";
import SubSound from "./sound/sub.mp3";
import SubT3Sound from "./sound/sub_t3.mp3";
import SubSoundFast from "./sound/sub_fast.mp3";
import SubSoundRare from "./sound/sub_rare.mp3";
import SubSoundSSRare from "./sound/sub_super_rare.mp3";
import CheerSound from "./sound/cheer.mp3";
import CheerJackpotSound from "./sound/cheer_jackpot.mp3";
import tmi from "tmi.js";
import SoundList from "./SoundList";
const io = require("socket.io-client");

const gifCount = 40;
const bgifCount = 25;
const channelList = ["tetristhegrandmaster3", "tgm3backend"];
const cooldownNormal = [10000, 5000];
const elevatedTime = 30000;
const paramsHost = new URLSearchParams(window.location.search).get("host");
//TODO
const cooldownFast = [4000, 2000];
const updateTimeLog = "2022/10/07 ver4";
const ln = ["ch", "en", "tw", "jp", "fr", "ko"];
const lnCount = 6;
const SSR_LIST = [
  107, 144, 169, 188, 206, 235, 269, 297, 304, 337, 338, 363, 377, 421, 432,
  476, 498, 545, 589, 589, 594, 618, 626, 661, 683, 747, 765, 768, 776, 80,
];
const UR_LIST = [822, 838, 869, 872, 909];

var eleQueue = [];
var queue = [];
var current = null;

const getRamdomLn = (lang) => {
  if (lang === "random") {
    let a = 0,
      j;
    const ran = Math.random() * 1;
    for (j = 1; j <= lnCount; j++) {
      if (ran < j * (1 / lnCount)) {
        a = j - 1;
        break;
      }
    }
    console.log(a);
    return ln[a];
  } else {
    return lang;
  }
};

const getTTSUrl = (text, lang) => {
  return "https://m3ntru-api.vercel.app/api/TTS/one?text=".concat(
    encodeURIComponent(text).concat("&tl=" + getRamdomLn(lang))
  );
};

class App extends Component {
  state = {
    badge: null,
    running: false,
    sound: null,
    printState: false,
    playState: false,
    subState: false,
    cheerState: false,
    donationState: false,
    elevatedState: false,
    user: "門特魯",
    bits: 0,
    message: "👲🤸",
    emotes: null,
    cheerImg: 0,
    donationAmount: "",
    subGift: false,
    basilisk: false,
    giftBoost: false,
    kero: false,
    mao: false,
    soundEffect: null,
    tmiUser: false,
    recallType: "",
    recallUser: "",
    recallStatus: false,
    lnStatus: "ch",
    source: false,
    elevated: {
      emotes: {
        875630: ["3-8"],
        emotesv2_8528dee89a2f422a94827986d63d6aa2: ["10-18"],
        emotesv2_8d405d268fbc4830a62874c1d8ab0942: ["20-27"],
      },
      username: "zatd39",
      color: "#A51F24",
      badges: {
        vip: "1",
        subscriber: "36",
        "sub-gifter": "50",
      },
      message: "我就 leggyB tgm3BONK0 tgm3BONK 試試",
      price: "15000",
    },
    refresh: false,
    elevatedTimeout: null,
    elevatedCooldown: null,
  };

  componentDidMount = async () => {
    await this.getSetting();
    await this.initTmi();
    await this.badgeInit();
  };

  badgeInit = async () => {
    const app = this;
    const GetGlobalBadge = async () =>  {
      /** Fetch Global Badge **/
      const response = await fetch(
        "https://badges.twitch.tv/v1/badges/global/display"
      );
      const data = await response.json();
      return data.badge_sets;
    }

    const GetChannalBadge = async () =>  {
      /** Fetch Channal Badge **/
      const response = await fetch(
        `https://badges.twitch.tv/v1/badges/channels/47281189/display`
      );
      const data = await response.json();
      return data.badge_sets;
    }

    const twitchfetch = async () =>  {
      /** Fetch Global & Channel Badge **/
      let [TempGBdg, TempCBdg] = await Promise.all([
        GetGlobalBadge(),
        GetChannalBadge(),
      ]);
      /** Replace Global one with Channel's bits & sub Badge **/
      if (TempCBdg["bits"] !== undefined) {
        var obj = Object.assign(
          {},
          TempGBdg["bits"]["versions"],
          TempCBdg["bits"]["versions"]
        );
        TempGBdg["bits"]["versions"] = obj;
        delete TempCBdg["bits"];
      }
      if (TempCBdg["subscriber"] !== undefined) {
        delete TempGBdg["subscriber"];
      }
      Object.assign(TempGBdg, TempCBdg);
      console.log(TempGBdg);
      app.setState({
        badge: TempGBdg,
      });
    }
    await twitchfetch();
  };

  getImgRandom = (type) => {
    const i = type ? bgifCount : gifCount;
    const ran = Math.random() * 10000;
    let j;
    let randomCheerImg = 0;
    for (j = 1; j <= i; j++) {
      if (ran < j * (10000 / i)) {
        randomCheerImg = j - 1;
        break;
      }
    }
    if (type) randomCheerImg = "b" + randomCheerImg;
    const c = Math.floor(Math.random() * 8192) + 1;
    if (type && c === 8192) randomCheerImg = "mao";
    if (type && c === 8191) randomCheerImg = "kero";
    return randomCheerImg;
  };

  getSoundRandom = () => {
    const c = Math.floor(Math.random() * 1000) + 1;
    if (UR_LIST.includes(c)) return "ur";
    if (SSR_LIST.includes(c)) return "ssr";
    return "n";
  };

  streamlabsEmotesFormatter = (text) => {
    if (text == null) return;
    let result = {};
    text.split("/").forEach(function (t) {
      const temp = t.split(":");
      const emoteList = [];
      temp[1].split(",").forEach(function (t) {
        emoteList.push(t);
      });
      result[temp[0]] = emoteList;
    });
    return result;
  };

  getSetting = async () => {
    await fetch("https://m3ntru-api.vercel.app/api/alert/tetristhegrandmaster3")
      .then((response) => {
        return response.json();
      })
      .then((data) => {
        console.log(data);
        this.setState({
          basilisk: data.basilisk,
          giftBoost: data.gift,
          lnStatus: data.lang,
          source: data.source,
        });
      })
      .catch((error) => console.error(error));
  };

  getbadageurl = (bgd) => {
    if (this.state.badge && bgd) {
      return Object.entries(bgd).map((data, index) => (
        <img
          alt={index}
          key={index}
          src={this.state.badge[data[0]]["versions"][data[1]]["image_url_2x"]}
          className="badge"
          style={{
            marginRight: "2px",
            marginLeft: "2px",
            height: "28px",
            width: "28px",
            verticalAlign: "bottom",
          }}
        />
      ));
    } else return null;
  };

  saveElevated = async (data) =>  {
    const paramsElevated = new URLSearchParams(window.location.search).get("elevated");
    const response = await fetch(
      `https://m3ntru-api.vercel.app/api/elevated/`, {
        method: "POST",
        headers: {
          'Content-type': 'application/json',
          'Authorization': `Bearer ${paramsElevated}`, // notice the Bearer before your token
        },
        body: JSON.stringify(data)
      }
    );
    console.log(response);
  }

  initTmi = () => {
    const paramsToken = new URLSearchParams(window.location.search).get(
      "token"
    );
    const paramsUser = new URLSearchParams(window.location.search).get("user");
    const paramsKey = new URLSearchParams(window.location.search).get("key");
    console.log(paramsToken);
    console.log(paramsUser);
    console.log(paramsKey);
    console.log(updateTimeLog);
    if (paramsUser) {
      this.setState({
        tmiUser: true,
      });
    }
    const token = paramsToken;

    //Connect to socket
    const streamlabs = io(`https://sockets.streamlabs.com?token=${token}`, {
      transports: ["websocket"],
    });

    //Perform Action on event
    streamlabs.on("connect", () => {
      console.log("connected");
    });

    streamlabs.on("event", (eventData) => {
      console.log(eventData);
      var processEmotes = {};
      var data = {};
      var playList = [];
      var result;
      if (eventData.type === "donation") {
        playList.push(CheerSound);
        result = Converter.splitTextV1(
          eventData.message[0].message,
          [".", "!", "?", ":", ";", ",", " "],
          90,
          "",
          eventData.message[0].message
        );
        playList = [];
        playList.push(CheerSound);
        const lnResult = this.state.lnStatus;
        result.message.forEach(function (t) {
          const ttsResult = getTTSUrl(t, lnResult);
          playList.push(ttsResult);
        });
        data = {
          type: "d",
          user: eventData.message[0].name,
          messageAll: result.display,
          message: result.message,
          soundUrl: playList,
          cheer: eventData.message[0].amount,
          emotes: null,
          cheerImg: 0,
          donation: eventData.message[0].formattedAmount,
        };
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true,
          });
          this.alertExec();
        }
      }
      if (eventData.for === "twitch_account") {
        if (
          !this.state.source &&
          (eventData.type === "resub" || eventData.type === "subscription") &&
          eventData.message[0].sub_plan !== "3000"
        ) {
          playList = [];
          let msg = "";
          processEmotes = this.streamlabsEmotesFormatter(
            eventData.message[0].emotes
          );
          if (
            eventData.message[0].message !== null &&
            eventData.message[0].message !== ""
          ) {
            result = Converter.splitTextV1(
              eventData.message[0].message,
              [".", "!", "?", ":", ";", ",", " "],
              90,
              "",
              eventData.message[0].message
            );
            playList = [];
            playList.push(CheerSound);
            const lnResult = this.state.lnStatus;
            result.message.forEach(function (t) {
              const ttsResult = getTTSUrl(t, lnResult);
              playList.push(ttsResult);
            });

            msg = Converter.formatTwitchEmotes(
              eventData.message[0].message,
              processEmotes
            );
          }
          data = {
            type: "s",
            user: eventData.message[0].display_name,
            messageAll: msg,
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: processEmotes,
            cheerImg: 0,
            donation: "",
            subGift: eventData.message[0].sub_type === "subgift",
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        }
        if (!this.state.source && eventData.type === "bits") {
          processEmotes = this.streamlabsEmotesFormatter(
            eventData.message[0].emotes
          );
          result = Converter.formatText(
            eventData.message[0].message,
            [".", "!", "?", ":", ";", ",", " "],
            90,
            processEmotes
          );
          playList = [];
          playList.push(CheerSound);
          const lnResult = this.state.lnStatus;
          result.message.forEach(function (t) {
            let ttsResult = getTTSUrl(t, lnResult);
            playList.push(ttsResult);
          });
          data = {
            type: "c",
            name: eventData.message[0].name,
            user: eventData.message[0].display_name,
            messageAll: result.display,
            message: result.message,
            soundUrl: playList,
            cheer: eventData.message[0].amount,
            emotes: processEmotes,
            cheerImg: this.getImgRandom(false),
            donation: "",
            doodle: result.doodle,
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        }
      }
    });

    const client = new tmi.Client({
      options: {debug: true, messagesLogLevel: "info"},
      connection: {
        reconnect: true,
        secure: true,
      },
      identity: {
        username: paramsUser ? paramsUser : "justinfan123456",
        password: paramsKey ? paramsKey : "",
      },
      channels: channelList,
    });
    client.connect().catch(console.error);
    client.on(
      "subscription",
      (channel, username, method, message, userstate) => {
        if (method.plan === "3000") {
          let playList = [];
          let msg = "";
          if (message != null && message !== "") {
            const result = Converter.formatText(
              message,
              [".", "!", "?", ":", ";", ",", " "],
              90,
              userstate["emotes"]
            );
            const lnResult = this.state.lnStatus;
            result.message.forEach(function (t) {
              const ttsResult = getTTSUrl(t, lnResult);
              playList.push(ttsResult);
            });
            msg = Converter.formatTwitchEmotes(message, userstate.emotes);
          }
          let data = {
            type: "s",
            user: username,
            messageAll: msg,
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: userstate.emotes,
            cheerImg: 0,
            donation: "",
            subTier: true,
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        } else if (this.state.source) {
          let playList = [];
          let msg = "";
          if (message != null && message !== "") {
            const result = Converter.formatText(
              message,
              [".", "!", "?", ":", ";", ",", " "],
              90,
              userstate["emotes"]
            );
            const lnResult = this.state.lnStatus;
            result.message.forEach(function (t) {
              const ttsResult = getTTSUrl(t, lnResult);
              playList.push(ttsResult);
            });
            msg = Converter.formatTwitchEmotes(message, userstate.emotes);
          }
          let data = {
            type: "s",
            user: username,
            messageAll: msg,
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: userstate.emotes,
            cheerImg: 0,
            donation: "",
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        }
      }
    );
    client.on(
      "resub",
      (channel, username, months, message, userstate, methods) => {
        console.log(methods);
        if (methods.plan === "3000") {
          let playList = [];
          let msg = "";
          if (message != null && message !== "") {
            const result = Converter.formatText(
              message,
              [".", "!", "?", ":", ";", ",", " "],
              90,
              userstate["emotes"]
            );
            const lnResult = this.state.lnStatus;
            result.message.forEach(function (t) {
              const ttsResult = getTTSUrl(t, lnResult);
              playList.push(ttsResult);
            });
            msg = Converter.formatTwitchEmotes(message, userstate.emotes);
          }
          let data = {
            type: "s",
            user: username,
            messageAll: msg,
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: userstate.emotes,
            cheerImg: 0,
            donation: "",
            subTier: true,
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        } else if (this.state.source) {
          let playList = [];
          let msg = "";
          if (message != null && message !== "") {
            const result = Converter.formatText(
              message,
              [".", "!", "?", ":", ";", ",", " "],
              90,
              userstate["emotes"]
            );
            const lnResult = this.state.lnStatus;
            result.message.forEach(function (t) {
              const ttsResult = getTTSUrl(t, lnResult);
              playList.push(ttsResult);
            });
            msg = Converter.formatTwitchEmotes(message, userstate.emotes);
          }
          let data = {
            type: "s",
            user: username,
            messageAll: msg,
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: userstate.emotes,
            cheerImg: 0,
            donation: "",
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        }
      }
    );
    client.on("cheer", (channel, userstate, message) => {
      if (this.state.source) {
        let data = {};
        let result;
        let playList = [];
        result = Converter.formatText(
          message,
          [".", "!", "?", ":", ";", ",", " "],
          90,
          userstate["emotes"]
        );
        // let bit = result.count;
        playList.push(CheerSound);
        const lnResult = this.state.lnStatus;
        result.message.forEach(function (t) {
          const ttsResult = getTTSUrl(t, lnResult);
          playList.push(ttsResult);
        });
        data = {
          type: "c",
          name: userstate["username"],
          user: userstate["display-name"],
          messageAll: result.display,
          message: result.message,
          soundUrl: playList,
          cheer: userstate["bits"],
          emotes: userstate["emotes"],
          cheerImg: this.getImgRandom(false),
          donation: "",
          doodle: result.doodle,
        };
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true,
          });
          this.alertExec();
        }
      }
    });

    client.on(
      "subgift",
      (channel, username, streakMonths, recipient, methods, userstate) => {
        if (methods.plan === "3000") {
          let playList = [];
          let data = {
            type: "s",
            user: recipient,
            messageAll: "",
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: userstate.emotes,
            cheerImg: 0,
            donation: "",
            subTier: true,
            //TODO
            subGift: true,
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        } else if (this.state.source) {
          let playList = [];
          let data = {
            type: "s",
            user: recipient,
            messageAll: "",
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: userstate.emotes,
            cheerImg: 0,
            donation: "",
            //TODO
            subGift: true,
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        }
      }
    );

    client.on("message", (target, context, msg, self) => {
      var playList = [];
      var result;
      var i = "";
      var gift = false;
      var data = {};
      const isMod =
        (context.username === "tetristhegrandmaster3" ||
          context.username === "zatd39" ||
          context.mod) &&
        context.username !== "nightbot";
      if (context["pinned-chat-paid-amount"]) {
        this.soundEffectSet("mgs");
        if(paramsHost === "1"){
          this.saveElevated({
            twitch: target,
            emotes: context.emotes,
            username: context.username,
            color: context.color,
            badges: context.badges,
            message: msg,
            price: context["pinned-chat-paid-amount"],
            priceRaw: {
              amount: context["pinned-chat-paid-amount"],
              canonical: context["pinned-chat-paid-canonical-amount"],
              currency: context["pinned-chat-paid-currency"],
              exponent: context["pinned-chat-paid-exponent"],
            }
          })
        }
      }
      if (isMod && msg.split(" ")[0].toLowerCase() === "!戴口罩勤洗手要消毒") {
        gift = msg.split(" ")[1] && msg.split(" ")[1].toLowerCase() === "g";
        if (!gift) {
          i =
            context.username === "tetristhegrandmaster3"
              ? "戴口罩，勤洗手，要消毒，要洗澡"
              : "戴口罩，勤洗手，要消毒";
          playList.push(getTTSUrl(i, this.state.lnStatus));
        }
        data = {
          type: "s",
          user:
            msg.split(" ")[1] && msg.split(" ")[1].toLowerCase() === "g"
              ? "我就送"
              : "技正",
          messageAll: Converter.formatTwitchEmotes(i, context.emotes),
          message: [],
          soundUrl: playList,
          cheer: 0,
          emotes: context.emotes,
          cheerImg: 0,
          donation: "",
          //TODO
          subGift: msg.split(" ")[1] && msg.split(" ")[1].toLowerCase() === "g",
        };
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true,
          });
          this.alertExec();
        }
      }

      if (isMod && msg.split(" ")[0].toLowerCase() === "!尊爵不凡") {
        gift = msg.split(" ")[1] && msg.split(" ")[1].toLowerCase() === "g";
        if (!gift) {
          i = "我郭";
          playList.push(getTTSUrl(i, this.state.lnStatus));
        }
        data = {
          type: "s",
          user: gift ? "我就送" : "技正",
          messageAll: i,
          message: [],
          soundUrl: playList,
          cheer: 0,
          emotes: context.emotes,
          cheerImg: 0,
          donation: "",
          subTier: true,
          //TODO
          subGift: gift,
        };
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true,
          });
          this.alertExec();
        }
      }

      if (isMod && (msg === "!彩學好帥" || msg === "!彩學很帥")) {
        playList.push(CheerSound);
        i = "doodleCheer8787 分からないよ doodleCheer8787";
        // playList.push(getApiUrl("笑死", this.state.lnStatus));
        result = Converter.formatText(
          i,
          [".", "!", "?", ":", ";", ",", " "],
          90,
          context.emotes
        );
        data = {
          type: "c",
          user: "大樹わかるマン",
          messageAll: result.display,
          message: result.message,
          soundUrl: playList,
          cheer: 878787,
          emotes: context.emotes,
          cheerImg: "s",
          donation: "",
        };
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true,
          });
          this.alertExec();
        }
      }
      if (isMod && msg.split(" ")[0].toLowerCase() === "!basilisktime") {
        this.setState({
          basilisk:
            msg.split(" ")[1] && msg.split(" ")[1].toLowerCase() === "on"
              ? true
              : false,
        });
        console.log("Basilisk Time");
      }
      if (isMod && msg.split(" ")[0].toLowerCase() === "!lang") {
        this.setState({
          lnStatus: msg.split(" ")[1] ? msg.split(" ")[1] : "ch",
        });
        console.log("change lang");
      }
      if (isMod && msg.split(" ")[0].toLowerCase() === "!giftboost") {
        this.setState({
          giftBoost:
            msg.split(" ")[1] && msg.split(" ")[1].toLowerCase() === "on"
              ? true
              : false,
        });
        console.log("Sub Gift Boost");
      }
      if (isMod && msg.split(" ")[0].toLowerCase() === "!source") {
        this.setState({
          source:
            msg.split(" ")[1] && msg.split(" ")[1].toLowerCase() === "on"
              ? true
              : false,
        });
        console.log("source change");
      }
      if (isMod && msg.split(" ")[0].toLowerCase() === "!sound") {
        this.setState({
          soundEffect: CheerSound,
        });
        if (msg.split(" ")[1]) {
          this.soundEffectSet(msg.split(" ")[1]);
        }
      }
      if (isMod && msg.split(" ")[0].toLowerCase() === "!stop") {
        this.setState({
          soundEffect: CheerSound,
        });
      }
      if (isMod && msg === "!小狗><") {
        playList.push(CheerSound);
        i = "冥白了";
        playList.push(getTTSUrl(i, this.state.lnStatus));
        data = {
          type: "d",
          user: "beatmania IIDX ULTIMATE MOBILE",
          messageAll: i,
          message: i,
          soundUrl: playList,
          cheer: 0,
          emotes: context.emotes,
          cheerImg: 0,
          donation: "$87.8787",
        };
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true,
          });
          this.alertExec();
        }
      }

      if (
        msg.split(" ")[0].toLowerCase() === "!厄介mode" &&
        context.username === "taikonokero"
      ) {
        this.setState({
          kero: msg.split(" ")[1].toLowerCase() === "on" ? true : false,
        });
      }

      if (
        msg.split(" ")[0].toLowerCase() === "!厄介mode" &&
        context.username === "feline_mao"
      ) {
        this.setState({
          mao: msg.split(" ")[1].toLowerCase() === "on" ? true : false,
        });
      }
      if (isMod && this.state.recallStatus) {
        if (this.state.recallType === "c") {
          playList.push(CheerSound);
          result = Converter.formatText(
            msg,
            [".", "!", "?", ":", ";", ",", " "],
            90,
            context.emotes
          );
          const lnResult = this.state.lnStatus;
          result.message.forEach(function (t) {
            const ttsResult = getTTSUrl(t, lnResult);
            playList.push(ttsResult);
          });
          data = {
            type: "c",
            user: this.state.recallUser,
            messageAll: result.display,
            message: result.message,
            soundUrl: playList,
            cheer: result.count,
            emotes: context.emotes,
            cheerImg: this.getImgRandom(false),
            donation: "",
            doodle: result.doodle,
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        }
        if (this.state.recallType === "s") {
          // playList.push(SubSound);
          if (msg !== "0") {
            const result = Converter.formatText(
              msg,
              [".", "!", "?", ":", ";", ",", " "],
              90,
              context.emotes
            );
            const lnResult = this.state.lnStatus;
            result.message.forEach(function (t) {
              const ttsResult = getTTSUrl(t, lnResult);
              playList.push(ttsResult);
            });
          }
          data = {
            type: "s",
            user: this.state.recallUser,
            messageAll:
              msg !== "0"
                ? Converter.formatTwitchEmotes(msg, context.emotes)
                : "",
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: context.emotes,
            cheerImg: 0,
            donation: "",
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        }
        if (this.state.recallType === "st") {
          if (msg !== "0") {
            const result = Converter.formatText(
              msg,
              [".", "!", "?", ":", ";", ",", " "],
              90,
              context.emotes
            );
            const lnResult = this.state.lnStatus;
            result.message.forEach(function (t) {
              const ttsResult = getTTSUrl(t, lnResult);
              playList.push(ttsResult);
            });
          }
          data = {
            type: "s",
            user: this.state.recallUser,
            messageAll:
              msg !== "0"
                ? Converter.formatTwitchEmotes(msg, context.emotes)
                : "",
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: context.emotes,
            cheerImg: 0,
            donation: "",
            subTier: true,
          };
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true,
            });
            this.alertExec();
          }
        }
        this.setState({
          recallType: "",
          recallStatus: false,
          recallUser: "",
        });
      }

      if (msg === "!reload2.0" && isMod) {
        window.location.reload();
      }

      if (
        isMod &&
        msg.split(" ")[0].toLowerCase() === "!cheer" &&
        msg.split(" ")[1]
      ) {
        this.setState({
          recallType: "c",
          recallStatus: true,
          recallUser: msg.split(" ")[1],
        });
      }

      if (
        isMod &&
        msg.split(" ")[0].toLowerCase() === "!sub" &&
        msg.split(" ")[1]
      ) {
        this.setState({
          recallType: "s",
          recallStatus: true,
          recallUser: msg.split(" ")[1],
        });
      }

      if (
        isMod &&
        msg.split(" ")[0].toLowerCase() === "!subt3" &&
        msg.split(" ")[1]
      ) {
        this.setState({
          recallType: "st",
          recallStatus: true,
          recallUser: msg.split(" ")[1],
        });
      }
      if (
        isMod &&
        msg.split(" ")[0].toLowerCase() === "!elestart" &&
        msg.split(" ")[1]
      ) {
        const paramsElevated = new URLSearchParams(window.location.search).get("elevated");
        fetch(`https://m3ntru-api.vercel.app/api/elevated/${msg.split(" ")[1]}`, {
          method: "GET",
          headers: {
            "Content-type": "application/json",
            Authorization: `Bearer ${paramsElevated}`, // notice the Bearer before your token
          },
        })
          .then((response) => {
            return response.json();
          })
          .then((data) => {
            // console.log({
            //   emotes: data.emotes,
            //   username: data.username,
            //   color: data.color,
            //   badges: data.badges,
            //   message: data.message,
            //   price: data.price,
            // })
            eleQueue.push({
              emotes: data.emotes,
              username: data.username,
              color: data.color,
              badges: data.badges,
              message: data.message,
              price: data.price,
            })
            // this.setState({
            //   elevated: {
            //     emotes: data.emotes,
            //     username: data.username,
            //     color: data.color,
            //     badges: data.badges,
            //     message: data.message,
            //     price: data.price,
            //   },
            //   refresh: !this.state.refresh,
            //   elevatedState: true,
            // })
            if (!this.state.running) {
              this.setState({
                running: true,
              });
              this.alertExec();
            }
          })
          .catch((error) => console.error(error));
      }
      if (
        isMod &&
        msg.split(" ")[0].toLowerCase() === "!elestop"
      ) {
        clearTimeout(this.state.elevatedTimeout);
        clearTimeout(this.state.elevatedCooldown);
        this.setState({
          subState: false,
          cheerState: false,
          donationState: false,
          elevatedState: false,
        });
        if (queue.length  || eleQueue.length) {
          this.alertExec();
        } else {
          this.setState({
            running: false,
          });
        }
      }
    });
  };

  alertExec = () => {
    if (eleQueue.length > 0) {
      current = eleQueue.shift();
      console.log(current);
      this.setState({
        elevated: {
          emotes: current.emotes,
          username: current.username,
          color: current.color,
          badges: current.badges,
          message: current.message,
          price: current.price,
        },
        refresh: !this.state.refresh,
        subState: false,
        cheerState: false,
        donationState: false,
        elevatedState: true,
        elevatedTimeout: setTimeout(() => this.elePrintEnd(), elevatedTime),
      }) 
    }
    else {
      current = queue.shift();
      console.log(current);
      let bsound = null;
      let displayTime =
        this.state.giftBoost && current.subGift
          ? cooldownFast[0]
          : cooldownNormal[0];
      if (current.type === "s") {
        if (current.subTier) {
          //TODO
          bsound = this.state.basilisk ? SubSound : SubT3Sound;
          if (this.state.giftBoost && current.subGift) bsound = SubSoundFast;
        } else {
          //TODO
          bsound =
            this.state.giftBoost && current.subGift ? SubSoundFast : SubSound;
        }
        const sResult = this.getSoundRandom();
        if (sResult === "ur") bsound = SubSoundSSRare;
        if (sResult === "ssr") bsound = SubSoundRare;
        current.soundUrl.unshift(bsound);
      }
      let img = this.state.basilisk ? this.getImgRandom(true) : current.cheerImg;
      if (current.doodle) {
        img = "d";
        displayTime = 18500;
      }
      if (img === "mao" || img === "kero") {
        current.soundUrl.unshift(CheerJackpotSound);
      }
      const name = current.name ? current.name : "";
      if (this.state.kero && name.toLowerCase() === "feline_mao") img = "mao";
      if (this.state.mao && name.toLowerCase() === "taikonokero") img = "kero";
      const sound = current.soundUrl.shift();
      this.setState({
        sound: sound,
        subState: current.type === "s" ? true : false,
        cheerState: current.type === "c" ? true : false,
        donationState: current.type === "d" ? true : false,
        elevatedState: false,
        user: current.user,
        message: current.messageAll,
        bits: current.cheer,
        emotes: current.emotes,
        cheerImg: img,
        donationAmount: current.donation,
        subTier: current.subTier ? true : false,
        subGift: current.subGift,
      });
      setTimeout(() => this.printEnd(), displayTime);
    }
  };

  printEnd = () => {
    const gift = this.state.subGift;
    this.setState({
      subState: false,
      cheerState: false,
      donationState: false,
      elevatedState: false,
    });
    setTimeout(
      () => this.printCooldown(),
      this.state.giftBoost && gift ? cooldownFast[1] : cooldownNormal[1]
    );
  };

  printCooldown = () => {
    if (this.state.playState) {
      this.setState({
        playState: false,
        printState: false,
      });
      if (queue.length || eleQueue.length) {
        this.alertExec();
      } else {
        this.setState({
          running: false,
        });
      }
    } else {
      this.setState({
        printState: true,
      });
    }
  };

  soundEnd = () => {
    this.setState({
      sound: null,
    });
    if (current.soundUrl.length) {
      const data = current.soundUrl.shift();
      this.setState({
        sound: data,
      });
    } else {
      if (this.state.printState) {
        this.setState({
          playState: false,
          printState: false,
        });
        if (queue.length  || eleQueue.length) {
          this.alertExec();
        } else {
          this.setState({
            running: false,
          });
        }
      } else {
        this.setState({
          playState: true,
        });
      }
    }
  };

  elePrintEnd  = () => {
    this.setState({
      subState: false,
      cheerState: false,
      donationState: false,
      elevatedState: false,
      elevatedCooldown: setTimeout(() => this.eleCooldown(), 2000),
    });
  }

  eleCooldown = () => {
    if (queue.length  || eleQueue.length) {
      this.alertExec();
    } else {
      this.setState({
        running: false,
      });
    }
  }

  soundEffectSet = (sound) => {
    this.setState({
      soundEffect: SoundList[sound],
    });
  };

  soundEffectEnd = () => {
    this.setState({
      soundEffect: null,
    });
  };

  render() {
    return (
      <div className="App">
        <div className="App-header">
          <div className={this.state.subState ? "fadeIn" : "fadeOut"}>
            <Sub
              username={this.state.user}
              message={this.state.message}
              subType={this.state.subTier}
            />
          </div>
          <div className={this.state.cheerState ? "fadeIn" : "fadeOut"}>
            <Cheer
              username={this.state.user}
              message={this.state.message}
              bits={this.state.bits}
              cheerImg={this.state.cheerImg}
            />
          </div>
          <div className={this.state.donationState ? "fadeIn" : "fadeOut"}>
            <Donation
              username={this.state.user}
              message={this.state.message}
              donationAmount={this.state.donationAmount}
            />
          </div>
          <div className={this.state.elevatedState ? "fadeIn" : "fadeOut"} style={{height: "100%" , width: "100%"}}>
            <Elevated
              badge={this.getbadageurl(this.state.elevated.badges)}
              username={this.state.elevated.username}
              color={this.state.elevated.color}
              message={Converter.formatTwitchEmotes(this.state.elevated.message, this.state.elevated.emotes)}
              price={this.state.elevated.price}
              length={this.state.elevated.message.length}
              refresh={this.state.refresh}
            />
          </div>
        </div>
        <AudioPlayer
          src={this.state.sound}
          title={""}
          autoPlay
          onEnded={this.soundEnd}
        />
        <AudioPlayer
          src={this.state.soundEffect}
          title={""}
          autoPlay
          onEnded={this.soundEffectEnd}
        />
      </div>
    );
  }
}

export default App;
