import React, { Component } from 'react';
import './App.css';
import Cheer from './Components/Cheer';
import Sub from './Components/Sub';
import Donation from './Components/Donation';
import Converter from './model/Converter'
import AudioPlayer from 'react-audio-player';
import SubSound from './sound/sub.mp3';
import SubT3Sound from './sound/sub_t3.mp3';
import CheerSound from './sound/cheer.mp3';
import BasiliskSound from './sound/basilisk.mp3';
import tmi from 'tmi.js'
const io = require("socket.io-client");

const gifCount = 40;
const bgifCount = 21;
const channelList = ['tetristhegrandmaster3','zatd93'];

var queue = [];
var current = null;

class App extends Component {
  state = {
    running: false,
    sound: null,
    printState: false,
    playState: false,
    subState: false,
    cheerState: false,
    donationState: false,
    user: '門特魯',
    bits: 0,
    message: '👲🤸',
    emotes: null,
    cheerImg: 0,
    donationAmount: "",
    basilisk: false,
    kero: false,
    mao: false,
    basiliskSound: null,
    tmiUser: false,
    recallType: "",
    recallUser: "",
    recallStatus: false,
    subType:false
  }

  componentDidMount() {
    this.initTmi()
  }

  getApiUrl = (t) => {
    var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
    return result;
  }

  getRamdom = (type) => {
    var i = (type) ? bgifCount : gifCount;
    var j, ran = Math.random() * 10000;
    var randomCheerImg = 0;
    for (j = 1; j <= i; j++) {
      if (ran < j * (10000 / i)) {
        randomCheerImg = j - 1;
        break;
      }
    }
    if (type) randomCheerImg = 'b' + randomCheerImg;
    var c = Math.floor(Math.random() * 8192) + 1;
    if (type && c == 8192) randomCheerImg = 'mao';
    if (type && c == 8191) randomCheerImg = 'kero';
    return randomCheerImg;
  }

  streamlabsEmotesFormatter = (text) => {
    if (text == null) return;
    var result = {};
    text.split('/').forEach(function (t) {
      var temp = t.split(':');
      var emoteList = [];
      temp[1].split(',').forEach(function (t) {
        emoteList.push(t);
      })
      result[temp[0]] = emoteList;
    })
    return result;
  }

  initTmi = () => {
    const paramsToken = new URLSearchParams(window.location.search).get('token');
    const paramsUser = new URLSearchParams(window.location.search).get('user');
    const paramsKey = new URLSearchParams(window.location.search).get('key');
    //const foo = params.get(''); 
    console.log(paramsToken);
    console.log(paramsUser);
    console.log(paramsKey);
    if(paramsUser){ 
      this.setState ({
        tmiUser: true
      })
    }
    var token = paramsToken;


    //Connect to socket
    const streamlabs = io(`https://sockets.streamlabs.com?token=${token}`, { transports: ['websocket'] });

    //Perform Action on event
    streamlabs.on('connect', () => { console.log('connected') })

    streamlabs.on('event', (eventData) => {
      console.log(eventData);
      var processEmotes = {};
      var data = {};
      var playList = [];
      var result;
      if (eventData.type === 'donation') {
        //code to handle donation events
        playList.push(CheerSound);
        result = Converter.splitTextV1(eventData.message[0].message, [".", "!", "?", ":", ";", ",", " "], 90, "", eventData.message[0].message);
        playList = [];
        playList.push(CheerSound);
        result.message.forEach(function (t) {
          var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
          playList.push(result);
        })
        data = {
          type: 'd',
          user: eventData.message[0].name,
          messageAll: result.display,
          message: result.message,
          soundUrl: playList,
          cheer: eventData.message[0].amount,
          emotes: null,
          cheerImg: 0,
          donation: eventData.message[0].formattedAmount
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }
      if (eventData.for === 'twitch_account') {
        if (eventData.type == 'resub' || eventData.type == 'subscription') {
          playList = [];
          var msg = "";
          processEmotes = this.streamlabsEmotesFormatter(eventData.message[0].emotes);
          playList.push(SubSound);
          if (eventData.message[0].message != null && eventData.message[0].message != "") {
            playList.push(this.getApiUrl(eventData.message[0].message));
            msg = Converter.formatTwitchEmotes(eventData.message[0].message, processEmotes);
          }
          data = {
            type: 's',
            user: eventData.message[0].display_name,
            messageAll: msg,
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: processEmotes,
            cheerImg: 0,
            donation: ""
          }
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true
            })
            this.alertExec();
          }
        }
        if (eventData.type == 'bits') {
          processEmotes = this.streamlabsEmotesFormatter(eventData.message[0].emotes);
          result = Converter.formatText(eventData.message[0].message, [".", "!", "?", ":", ";", ",", " "], 90, processEmotes);
          var bit = result.count;
          playList = [];
          playList.push(CheerSound);
          result.message.forEach(function (t) {
            var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
            playList.push(result);
          })
          data = {
            type: 'c',
            name: eventData.message[0].name,
            user: eventData.message[0].display_name,
            messageAll: result.display,
            message: result.message,
            soundUrl: playList,
            cheer: eventData.message[0].amount,
            emotes: processEmotes,
            cheerImg: this.getRamdom(false),
            donation: ""
          }
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true
            })
            this.alertExec();
          }
        }
      }
    });

    const client = new tmi.Client({
      options: { debug: true, messagesLogLevel: "info" },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: (paramsUser) ? paramsUser : 'justinfan123456',
        password: (paramsKey) ? paramsKey : ''
      },
      channels: channelList
    });
    client.connect().catch(console.error);
    client.on('subscription', (channel, username, method, message, userstate) => {
      // console.log(username);
      // console.log(method);
      // console.log(userstate);
      if(method.plan == "3000"){
        var playList = [];
        var msg = "";
        if (message != null && message != "") {
          playList.push(this.getApiUrl(message));
          msg = Converter.formatTwitchEmotes(message, userstate.emotes);
        }
        var data = {
          type: 's',
          user: username,
          messageAll: msg,
          message: [],
          soundUrl: playList,
          cheer: 0,
          emotes: userstate.emotes,
          cheerImg: 0,
          donation: "",
          subType: true
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }
      // var playList = [];
      // var msg = "";
      // playList.push(SubSound);
      // if (message != null) {
      //   playList.push(this.getApiUrl(message));
      //   msg = Converter.formatTwitchEmotes(message, userstate.emotes);
      // }
      // var data = {
      //   type: 's',
      //   user: username,
      //   messageAll: msg,
      //   message: [],
      //   soundUrl: playList,
      //   cheer: 0,
      //   emotes: userstate.emotes,
      //   cheerImg: 0
      // }
      // queue.push(data);
      // if (!this.state.running) {
      //   this.setState({
      //     running: true
      //   })
      //   this.alertExec();
      // }
    });
    client.on('resub', (channel, username, months, message, userstate, methods) => {
      // console.log(username);
      // console.log(methods);
      // console.log(userstate);
      if(methods.plan == "3000"){
        var playList = [];
        var msg = "";
        if (message != null && message != "") {
          playList.push(this.getApiUrl(message));
          msg = Converter.formatTwitchEmotes(message, userstate.emotes);
        }
        var data = {
          type: 's',
          user: username,
          messageAll: msg,
          message: [],
          soundUrl: playList,
          cheer: 0,
          emotes: userstate.emotes,
          cheerImg: 0,
          donation: "",
          subType: true
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }
      // var playList = [];
      // var msg = "";
      // playList.push(SubSound);
      // if (message != null && message != "") {
      //   playList.push(this.getApiUrl(message));
      //   msg = Converter.formatTwitchEmotes(message, userstate.emotes);
      // }
      // var data = {
      //   type: 's',
      //   user: username,
      //   messageAll: msg,
      //   message: [],
      //   soundUrl: playList,
      //   cheer: 0,
      //   emotes: userstate.emotes,
      //   cheerImg: 0
      // }
      // queue.push(data);
      // if (!this.state.running) {
      //   this.setState({
      //     running: true
      //   })
      //   this.alertExec();
      // }
    });
    // client.on('cheer', (channel, userstate, message) => {
    //   var result = Converter.formatText(message, [".", "!", "?", ":", ";", ",", " "], 90, userstate.emotes);
    //   var bit = result.count;
    //   var playList = [];
    //   playList.push(CheerSound);
    //   result.message.forEach(function (t) {
    //     var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
    //     playList.push(result);
    //   })
    //   var data = {
    //     type: 'c',
    //     user: userstate['display-name'],
    //     messageAll: result.display,
    //     message: result.message,
    //     soundUrl: playList,
    //     cheer: userstate.bits,
    //     emotes: userstate.emotes,
    //     cheerImg: this.getRamdom()
    //   }
    //   queue.push(data);
    //   if (!this.state.running) {
    //     this.setState({
    //       running: true
    //     })
    //     this.alertExec();
    //   }
    // });

    client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
    //   var playList = [];
    //   playList.push(SubSound);
    //   var data = {
    //     type: 's',
      if(methods.plan == "3000"){
        var playList = [];
        var data = {
          type: 's',
          user: recipient,
          messageAll: "",
          message: [],
          soundUrl: playList,
          cheer: 0,
          emotes: userstate.emotes,
          cheerImg: 0,
          donation: "",
          subType: true
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }
      // var playList = [];
      // playList.push(SubSound);
      // var data = {
      //   type: 's',
      //   user: recipient,
      //   messageAll: "",
      //   message: [],
      //   soundUrl: playList,
      //   cheer: 0,
      //   emotes: userstate.emotes,
      //   cheerImg: 0
      // }
      // queue.push(data);
      // if (!this.state.running) {
      //   this.setState({
      //     running: true
      //   })
      //   this.alertExec();
      // }
    });

    client.on('message', (target, context, msg, self) => {
      // console.log(target);
      // console.log(context);
      // console.log(msg);
      // console.log(self);
      var playList = [];
      var result;
      var isMod = (context.username == 'tetristhegrandmaster3' || context.username == 'zatd39' || context.mod);
      if (isMod && msg == "!戴口罩勤洗手要消毒") {
        playList.push(SubSound);
        var i = (context.username == 'tetristhegrandmaster3') ? "戴口罩，勤洗手，要消毒，要洗澡" : "戴口罩，勤洗手，要消毒";
        playList.push(this.getApiUrl(i));
        var data = {
          type: 's',
          user: (context.username == 'zatd39') ? "技正" : context["display-name"],
          messageAll: Converter.formatTwitchEmotes(i, context.emotes),
          message: [],
          soundUrl: playList,
          cheer: 0,
          emotes: context.emotes,
          cheerImg: 0,
          donation: ""
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }

      if (isMod && msg == "!尊爵不凡") {
        var i = "我郭";
        playList.push(this.getApiUrl(i));
        var data = {
          type: 's',
          user: (context.username == 'zatd39') ? "技正" : context["display-name"],
          messageAll: Converter.formatTwitchEmotes(i, context.emotes),
          message: [],
          soundUrl: playList,
          cheer: 0,
          emotes: context.emotes,
          cheerImg: 0,
          donation: "",
          subType: true
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }

      if (isMod && (msg == "!彩學好帥" || msg == "!彩學很帥")) {
        playList.push(CheerSound);
        i = "tgm3Cheer878787 笑死";
        playList.push(this.getApiUrl("笑死"));
        result = Converter.formatText(i, [".", "!", "?", ":", ";", ",", " "], 90, context.emotes);
        data = {
          type: 'c',
          user: '皮皮船',
          messageAll: result.display,
          message: result.message,
          soundUrl: playList,
          cheer: 878787,
          emotes: context.emotes,
          cheerImg: 's',
          donation: ""
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }
      if (isMod && (msg.split(' ')[0].toLowerCase() == "!basilisktime")) {
        this.setState({
          basilisk: (msg.split(' ')[1].toLowerCase() == 'on') ? true : false
        })
        console.log("Basilisk Time")
      }
      if (isMod && (msg == "!小狗><")) {
        playList.push(CheerSound);
        i = "冥白了";
        playList.push(this.getApiUrl(i));
        data = {
          type: 'd',
          user: 'beatmania IIDX ULTIMATE MOBILE',
          messageAll: i,
          message: i,
          soundUrl: playList,
          cheer: 0,
          emotes: context.emotes,
          cheerImg: 0,
          donation: "$87.8787"
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }

      if (isMod && this.state.tmiUser && (msg == "!2.0")) {
        var text = "!戴口罩勤洗手要消毒 [SubTest] | !彩學好帥/!彩學很帥 [BitsTest] | !小狗 [DonateTest] | !basilisktime on/off [Basilisk Time On/Off]  | !reload2.0 [Reload AlertBox 2.0]"
        client.say(target, text);
      }

      if ((msg.split(' ')[0].toLowerCase() == "!厄介mode") && (context.username == 'taikonokero')) {
        this.setState({
          kero: (msg.split(' ')[1].toLowerCase() == 'on') ? true : false
        })
      }

      if ((msg.split(' ')[0].toLowerCase() == "!厄介mode") && (context.username == 'feline_mao')) {
        this.setState({
          mao: (msg.split(' ')[1].toLowerCase() == 'on') ? true : false
        })
      }
      if (isMod && this.state.recallStatus) {       
        if(this.state.recallType == "c"){
          playList.push(CheerSound);
          result = Converter.formatText(msg, [".", "!", "?", ":", ";", ",", " "], 90, context.emotes);
          result.message.forEach(function (t) {
            var re = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
            playList.push(re);
          })
          data = {
            type: 'c',
            user: this.state.recallUser,
            messageAll: result.display,
            message: result.message,
            soundUrl: playList,
            cheer: result.count,
            emotes: context.emotes,
            cheerImg: this.getRamdom(false),
            donation: ""
          }
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true
            })
            this.alertExec();
          }
        }
        if(this.state.recallType == "s"){
          playList.push(SubSound);
          if (msg != "0") {
            playList.push(this.getApiUrl(msg));
          }
          data = {
            type: 's',
            user: this.state.recallUser,
            messageAll: (msg != "0") ? Converter.formatTwitchEmotes(msg, context.emotes) : "",
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: context.emotes,
            cheerImg: 0,
            donation: ""
          }
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true
            })
            this.alertExec();
          }
        }
        if(this.state.recallType == "st"){
          if (msg != "0") {
            playList.push(this.getApiUrl(msg));
          }
          data = {
            type: 's',
            user: this.state.recallUser,
            messageAll: (msg != "0") ? Converter.formatTwitchEmotes(msg, context.emotes) : "",
            message: [],
            soundUrl: playList,
            cheer: 0,
            emotes: context.emotes,
            cheerImg: 0,
            donation: "",
            subType: true
          }
          queue.push(data);
          if (!this.state.running) {
            this.setState({
              running: true
            })
            this.alertExec();
          }
        }
        this.setState({
          recallType: "",
          recallStatus: false,
          recallUser: ""
        })
      }

      if ((msg == "!reload2.0") && isMod) {
        window.location.reload();
      }
    
      if (isMod && (msg.split(' ')[0].toLowerCase() == "!cheer") && (msg.split(' ')[1])) {
        this.setState({
          recallType: "c",
          recallStatus: true,
          recallUser: msg.split(' ')[1]
        })
      }

      if (isMod && (msg.split(' ')[0].toLowerCase() == "!sub") && (msg.split(' ')[1])) {
        this.setState({
          recallType: "s",
          recallStatus: true,
          recallUser: msg.split(' ')[1]
        })
      }

      if (isMod && (msg.split(' ')[0].toLowerCase() == "!subt3") && (msg.split(' ')[1])) {
        this.setState({
          recallType: "st",
          recallStatus: true,
          recallUser: msg.split(' ')[1]
        })
      }

    });
  }

  alertExec = () => {
    current = queue.shift();
    console.log(current);
    if(current.subType){
      var sound = (this.state.basilisk)? SubSound : SubT3Sound;
      current.soundUrl.unshift(sound);
    }
    var sound = current.soundUrl.shift();
    var img = (this.state.basilisk) ? this.getRamdom(true) : current.cheerImg;
    var name = (current.name) ? current.name : '';
    if (this.state.kero && name.toLowerCase() == 'feline_mao') img = 'mao';
    if (this.state.mao && name.toLowerCase() == 'taikonokero') img = 'kero';
    this.setState({
      sound: sound,
      subState: (current.type == 's') ? true : false,
      cheerState: (current.type == 'c') ? true : false,
      donationState: (current.type == 'd') ? true : false,
      user: current.user,
      message: current.messageAll,
      bits: current.cheer,
      emotes: current.emotes,
      cheerImg: img,
      donationAmount: current.donation,
      subType: (current.subType)? true : false
    })
    setTimeout(() => this.printEnd(), 10000);
  }

  printEnd = () => {
    this.setState({
      subState: false,
      cheerState: false,
      donationState: false
    })
    setTimeout(() => this.printCooldown(), 5000);
  }

  printCooldown = () => {
    if (this.state.playState) {
      this.setState({
        playState: false,
        printState: false
      })
      if (queue.length) {
        this.alertExec();
      }
      else {
        this.setState({
          running: false
        })
      }
    }
    else {
      this.setState({
        printState: true
      })
    }
  }

  soundEnd = () => {
    this.setState({
      sound: null
    })
    if (current.soundUrl.length) {
      var data = current.soundUrl.shift();
      this.setState({
        sound: data
      })
    }
    else {
      if (this.state.printState) {
        this.setState({
          playState: false,
          printState: false
        })
        if (queue.length) {
          this.alertExec();
        }
        else {
          this.setState({
            running: false
          })
        }
      }
      else {
        this.setState({
          playState: true
        })
      }
    }
  }

  basiliskSoundSet = () => {
    this.setState({
      basiliskSound: BasiliskSound
    })
  }

  basiliskSoundEnd = () => {
    this.setState({
      basiliskSound: null
    })
  }

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className={(this.state.subState) ? 'fadeIn' : 'fadeOut'}>
            <Sub username={this.state.user} message={this.state.message} subType={this.state.subType}/>
          </div>
          <div className={(this.state.cheerState) ? 'fadeIn' : 'fadeOut'}>
            <Cheer username={this.state.user} message={this.state.message} bits={this.state.bits} cheerImg={this.state.cheerImg} />
          </div>
          <div className={(this.state.donationState) ? 'fadeIn' : 'fadeOut'}>
            <Donation username={this.state.user} message={this.state.message} donationAmount={this.state.donationAmount} />
          </div>
        </header>
        <AudioPlayer
          src={this.state.sound}
          title={""}
          autoPlay
          onEnded={this.soundEnd}
        />
        <AudioPlayer
          src={this.state.basiliskSound}
          title={""}
          autoPlay
          onEnded={this.basiliskSoundEnd}
        />
      </div>
    );
  }
}

export default App;
