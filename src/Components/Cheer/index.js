import React, { Component } from 'react';
import parse from 'html-react-parser';
import './Cheer.css';

class Cheer extends Component {

    render() {
        const { username, bits, message, cheerImg } = this.props;
        const imgList = require(`../../img/bit/bit (${cheerImg}).gif`)
        return (
            <div>
                <div id="widget" className="widget-AlertBox" data-layout="side">
                    <div id="alert-box">
                        <div id="particles" className="hidden" />
                        <div id="wrap">
                            <div id="alert-image-wrap">
                                <div id="alert-image" style={{ backgroundImage: 'url("' + imgList.default + '")' }}><img style={{ height: '1px', opacity: 0, width: '1px' }} src={imgList.default} /></div>
                            </div>
                            <div id="alert-text-wrap">
                                <div id="alert-text">
                                    <div id="alert-message" style={{ fontSize: '34px', color: 'rgb(255, 255, 255)', fontFamily: '"Open Sans"', fontWeight: 600 }}>
                                        <span data-token="name" style={{ color: 'rgb(250, 148, 90)', position: 'relative' }}><span><span className="animated-letter None">
                                            {username}
                                        </span></span></span>
                                            今日憤怒の屌扔
                                            <span data-token="amount" style={{ color: 'rgb(250, 148, 90)', position: 'relative' }}><span><span className="animated-letter None">
                                            {bits}
                                        </span></span></span>
                                                粒然後說：</div>
                                    <div id="alert-user-message" style={{ fontWeight: 700, fontSize: '34px', color: 'rgb(255, 255, 255)', fontFamily: '"Open Sans"' }}>
                                        {parse(message)}
                                    </div>
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