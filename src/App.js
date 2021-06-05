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
    emotes: null
  }

  componentDidMount() {
    this.initTmi()
  }

  getApiUrl = (t) => {
    var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
    return result;
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
      playList.push(SubSound);
      playList.push(this.getApiUrl(message));
      var data = {
        type: 's',
        user: username,
        messageAll: Converter.formatTwitchEmotes(message, userstate.emotes),
        message: [],
        soundUrl: playList,
        cheer: 0,
        emotes: userstate.emotes
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
      playList.push(SubSound);
      playList.push(this.getApiUrl(message));
      var data = {
        type: 's',
        user: username,
        messageAll: Converter.formatTwitchEmotes(message, userstate.emotes),
        message: [],
        soundUrl: playList,
        cheer: 0,
        emotes: userstate.emotes
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
        emotes: userstate.emotes
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
      if(msg == "!戴口罩勤洗手要消毒" && (context.username == 'tetristhegrandmaster3' || context.username == 'zatd39' || context.mod)){
        playList.push(SubSound);
        var i = (context.username == 'tetristhegrandmaster3')? "戴口罩，勤洗手，要消毒，要洗澡" : "戴口罩，勤洗手，要消毒";
        playList.push(this.getApiUrl(i));
        var data = {
          type: 's',
          user: (context.username == 'zatd39')? "技正" : context["display-name"],
          messageAll: Converter.formatTwitchEmotes(i, context.emotes),
          message: [],
          soundUrl: playList,
          cheer: 0,
          emotes: context.emotes
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
      playList.push(this.getApiUrl(''));
      var data = {
        type: 's',
        user: recipient,
        messageAll: null,
        message: [],
        soundUrl: playList,
        cheer: 0,
        emotes: userstate.emotes
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
      emotes: current.emotes
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
            <Sub username={this.state.user} message={this.state.message}/>
          </div>
          <div className={(this.state.cheerState) ? 'fadeIn' : 'fadeOut'}>
            <Cheer username={this.state.user} message={this.state.message} bits={this.state.bits}/>
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
