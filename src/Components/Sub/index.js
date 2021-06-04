import React, { Component } from 'react';
import './Sub.css';

class Sub extends Component {

    render() {
        const { username, message } = this.props;
        return (
            <div id="widget" className="widget-AlertBox" data-layout="side">
                <div id="alert-box">
                    <div id="particles" className="hidden" />
                        <div id="wrap">
                            <div id="alert-image-wrap">
                                <div id="alert-image" style={{backgroundImage: 'url("https://uploads.twitchalerts.com/000/031/541/432/giphy.gif")'}}><img style={{height: '1px', opacity: 0, width: '1px'}} src="https://uploads.twitchalerts.com/000/031/541/432/giphy.gif" />
                                </div>
                            </div>
                            <div id="alert-text-wrap">
                                <div id="alert-text">
                                    <div id="alert-message" style={{fontSize: '34px', color: 'rgb(255, 255, 255)', fontFamily: '"Noto Sans TC"', fontWeight: 500}}>
                                        你 ♂
                                        <span data-token="name" style={{color: 'rgb(129, 203, 238)', position: 'relative'}}><span><span className="animated-letter None">
                                            {username}
                                        </span></span></span>
                                        ♂ 爹
                                    </div>
                                    <div id="alert-user-message" style={{fontWeight: 400, fontSize: '30px', color: 'rgb(255, 255, 255)', fontFamily: '"Noto Sans TC"'}}>
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

export default Sub;