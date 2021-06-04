import React, { Component } from 'react';
import './Cheer.css';

class Cheer extends Component {

    render() {
        const { username, bits, message } = this.props;
        return (
            <div id="widget" className="widget-AlertBox" data-layout="side">
                <div id="alert-box">
                    <div id="particles" />
                    <div id="wrap">
                        <div id="alert-image-wrap">
                            <div id="alert-image" style={{ backgroundImage: 'url("https://uploads.twitchalerts.com/000/031/541/432/289.gif")' }}>
                                <img style={{ height: '1px', opacity: 0, width: '1px' }} src="https://uploads.twitchalerts.com/000/031/541/432/289.gif" />
                            </div>
                        </div>
                        <div id="alert-text-wrap">
                            <div id="alert-text">
                                <div id="alert-message" style={{ fontSize: '34px', color: 'rgb(255, 255, 255)', fontFamily: '"Noto Sans TC"', fontWeight: 400 }}>
                                    <span data-token="name" style={{ color: 'rgb(229, 143, 95)', position: 'relative' }}><span><span className="animated-letter None">
                                        {username}
                                    </span></span></span>
                                    今日憤怒の屌扔
                                <span data-token="amount" style={{ color: 'rgb(229, 143, 95)', position: 'relative' }}><span><span className="animated-letter None">
                                        {bits}
                                    </span></span></span>
                                    粒然後說：
                                </div>
                                <div id="alert-user-message" style={{ fontWeight: 400, fontSize: '36px', color: 'rgb(255, 255, 255)', fontFamily: 'Noto Sans TC' }}>
                                    {/* <img src="https://d3aqoihi2n8ty8.cloudfront.net/actions/cheer/dark/animated/100/2.gif" /><font color="#be61ff">100 </font>
                                    早骯ㄤ骯ㄤ骯ㄤ骯ㄤ骯ㄤ骯ㄤ骯ㄤ，骯ㄤ骯ㄤ骯ㄤ骯ㄤ骯ㄤ骯ㄤ骯ㄤ */}
                                    {message}
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        )
    }

}

export default Cheer;