import logo from './logo.svg';
import React, { Component } from 'react';
import './App.css';
import Cheer from './Components/Cheer';
import Sub from './Components/Sub';
import Converter from './model/Converter'
import AudioPlayer from 'react-audio-player';
import SubSound from './sound/sub.mp3';
import CheerSound from './sound/cheer.mp3';
import SubSound2 from './sound/sub2.mp3';
import SubSound3 from './sound/sub3.mp3';
import tmi from 'tmi.js'

var queue = [];
var current = null;

/* 
{
  type: 'c',
  user: '',
  messageAll: '',
  message: [],
  cheer: 0,
  subPlayed: false;
 }
*/

class App extends Component {
  state = {
    running: false,
    sound: null,
    printState: false,
    playState: false,
    subState: false,
    subUser: '門特魯',
    subMessage: '👲🤸',
    cheerState: false,
    cheerUser: '門特魯',
    cheerBits: 0,
    cheerMessage: '👲🤸'
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
        username: 'ichinose',
        password: 'shiki'
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
        messageAll: message,
        message: [],
        soundUrl: playList,
        cheer: 0
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
        messageAll: message,
        message: [],
        soundUrl: playList,
        cheer: 0
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
      var result = Converter.formatText(message, [".", "!", "?", ":", ";", ",", " "], 90);
      var bit = result.shift();
      var playList = [];
      playList.push(CheerSound);
      result.forEach(function (t) {
        var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
        playList.push(result);
      })
      var data = {
        type: 'c',
        user: userstate['display-name'],
        messageAll: message,
        message: result,
        soundUrl: playList,
        cheer: bit
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
      // var result = Converter.formatText(msg, [".", "!", "?", ":", ";", ",", " "], 90);
      // var bit = result.shift();
      // var playList = [];
      // console.log(result);
      // // queue.push(msg);
      // console.log(msg);
      // console.log(bit);
      // if (bit == 0) {
      //   playList.push(SubSound);
      //   playList.push(this.getApiUrl(msg));
      //   var data = {
      //     type: 's',
      //     user: context.username,
      //     messageAll: msg,
      //     message: [],
      //     soundUrl: playList,
      //     cheer: 0
      //   }
      //   queue.push(data);
      // }
      // else {
      //   playList.push(CheerSound);
      //   result.forEach(function (t) {
      //     var result = "https://m3ntru-tts.herokuapp.com/api/TTS/one?text=".concat(encodeURIComponent(t).concat('&tl=cn'));
      //     playList.push(result);
      //   })
      //   var data = {
      //     type: 'c',
      //     user: context.username,
      //     messageAll: msg,
      //     message: result,
      //     soundUrl: playList,
      //     cheer: bit
      //   }
      //   queue.push(data);
      // }
    });
  }

  alertExec = () => {
    current = queue.shift();
    console.log(current);
    var sound = current.soundUrl.shift();
    this.setState({
      sound: sound,
      subState: (current.type == 's') ? true : false,
      subUser: current.user,
      subMessage: current.messageAll,
      cheerState: (current.type == 'c') ? true : false,
      cheerUser: current.user,
      cheerMessage: current.messageAll,
      cheerBits: current.cheer 
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
    if(this.state.playState){
      this.setState({
        playState: false,
        printState: false
      })
      if(queue.length){
        this.alertExec();
      }
      else{
        this.setState({
          running: false
        })
      }
    }
    else{
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
      if(this.state.printState){
        this.setState({
          playState: false,
          printState: false
        })
        if(queue.length){
          this.alertExec();
        }
        else{
          this.setState({
            running: false
          })
        }
      }
      else{
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
            <Sub username={this.state.subUser} message={this.state.subMessage} />
          </div>
          <div className={(this.state.cheerState) ? 'fadeIn' : 'fadeOut'}>
            <Cheer username={this.state.cheerUser} message={this.state.subMessage} bits={this.state.cheerBits} />
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
