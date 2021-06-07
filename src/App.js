import React, { Component } from 'react';
import './App.css';
import Cheer from './Components/Cheer';
import Sub from './Components/Sub';
import Converter from './model/Converter'
import AudioPlayer from 'react-audio-player';
import SubSound from './sound/sub.mp3';
import CheerSound from './sound/cheer.mp3';
import tmi from 'tmi.js'

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
    user: '門特魯',
    bits: 0,
    message: '👲🤸',
    emotes: null,
    cheerImg: 0
  }

  componentDidMount() {
    this.initTmi()
  }

  getApiUrl = (t) => {
    var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
    return result;
  }

  getRamdom = () => {
    var j, ran = Math.random() * 1000;
    var randomCheerImg = 0;
    for (j = 1; j <= 40; j++) {
      if (ran < 1) {
        randomCheerImg = 40;
        break;
      }
      if (ran < j * 25) {
        randomCheerImg = j;
        break;
      }
    }
    return randomCheerImg;
  }

  initTmi = () => {
    const client = new tmi.Client({
      options: { debug: true, messagesLogLevel: "info" },
      connection: {
        reconnect: true,
        secure: true
      },
      identity: {
        username: 'justinfan123456 ',
        password: ''
      },
      channels: ['tetristhegrandmaster3']
    });
    client.connect().catch(console.error);
    client.on('subscription', (channel, username, method, message, userstate) => {
      var playList = [];
      var msg = "";
      playList.push(SubSound);
      if (message != null) {
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
        cheerImg: 0
      }
      queue.push(data);
      if (!this.state.running) {
        this.setState({
          running: true
        })
        this.alertExec();
      }
    });
    client.on('resub', (channel, username, months, message, userstate, methods) => {
      var playList = [];
      var msg = "";
      playList.push(SubSound);
      message = (message == null) ? "" : message;
      playList.push(this.getApiUrl(message));
      msg = Converter.formatTwitchEmotes(message, userstate.emotes);
      var data = {
        type: 's',
        user: username,
        messageAll: msg,
        message: [],
        soundUrl: playList,
        cheer: 0,
        emotes: userstate.emotes,
        cheerImg: 0
      }
      queue.push(data);
      if (!this.state.running) {
        this.setState({
          running: true
        })
        this.alertExec();
      }
    });
    client.on('cheer', (channel, userstate, message) => {
      var result = Converter.formatText(message, [".", "!", "?", ":", ";", ",", " "], 90, userstate.emotes);
      var bit = result.count;
      var playList = [];
      playList.push(CheerSound);
      result.message.forEach(function (t) {
        var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
        playList.push(result);
      })
      var data = {
        type: 'c',
        user: userstate['display-name'],
        messageAll: result.display,
        message: result.message,
        soundUrl: playList,
        cheer: userstate.bits,
        emotes: userstate.emotes,
        cheerImg: this.getRamdom()
      }
      queue.push(data);
      if (!this.state.running) {
        this.setState({
          running: true
        })
        this.alertExec();
      }
    });

    client.on('message', (target, context, msg, self) => {
      var playList = [];
      if (msg == "!戴口罩勤洗手要消毒" && (context.username == 'tetristhegrandmaster3' || context.username == 'zatd39' || context.mod)) {
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
          cheerImg: 0
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }
      if ((msg == "!彩學好帥" || msg == "!彩學很帥") && (context.username == 'tetristhegrandmaster3' || context.username == 'zatd39' || context.mod)) {
        playList.push(CheerSound);
        var i = "tgm3Cheer878787 不要瞎掰好嗎";
        playList.push(this.getApiUrl("不要瞎掰好嗎"));
        var result = Converter.formatText(i, [".", "!", "?", ":", ";", ",", " "], 90, context.emotes);
        var data = {
          type: 'c',
          user: 'Google',
          messageAll: result.display,
          message: result.message,
          soundUrl: playList,
          cheer: 878787,
          emotes: context.emotes,
          cheerImg: 41
        }
        queue.push(data);
        if (!this.state.running) {
          this.setState({
            running: true
          })
          this.alertExec();
        }
      }
    });
    client.on("subgift", (channel, username, streakMonths, recipient, methods, userstate) => {
      var playList = [];
      playList.push(SubSound);
      var data = {
        type: 's',
        user: recipient,
        messageAll: "",
        message: [],
        soundUrl: playList,
        cheer: 0,
        emotes: userstate.emotes,
        cheerImg: 0
      }
      queue.push(data);
      if (!this.state.running) {
        this.setState({
          running: true
        })
        this.alertExec();
      }
    });
  }

  alertExec = () => {
    current = queue.shift();
    console.log(current);
    var sound = current.soundUrl.shift();
    this.setState({
      sound: sound,
      subState: (current.type == 's') ? true : false,
      cheerState: (current.type == 'c') ? true : false,
      user: current.user,
      message: current.messageAll,
      bits: current.cheer,
      emotes: current.emotes,
      cheerImg: current.cheerImg
    })
    setTimeout(() => this.printEnd(), 10000);
  }

  printEnd = () => {
    this.setState({
      subState: false,
      cheerState: false
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

  render() {
    return (
      <div className="App">
        <header className="App-header">
          <div className={(this.state.subState) ? 'fadeIn' : 'fadeOut'}>
            <Sub username={this.state.user} message={this.state.message} />
          </div>
          <div className={(this.state.cheerState) ? 'fadeIn' : 'fadeOut'}>
            <Cheer username={this.state.user} message={this.state.message} bits={this.state.bits} cheerImg={this.state.cheerImg} />
          </div>
        </header>
        <AudioPlayer
          src={this.state.sound}
          title={""}
          autoPlay
          onEnded={this.soundEnd}
        />
      </div>
    );
  }
}

export default App;
