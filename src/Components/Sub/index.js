import React, { Component } from 'react';
import Converter from '../../model/Converter';
import parse from 'html-react-parser';
import './Sub.css';
import subImg from '../../img/sub/sub.gif'

class Sub extends Component {

    render() {
        const { username, message} = this.props;
        return (
            <div>
                <div id="widget" className="widget-AlertBox" data-layout="side">
                    <div id="alert-box">
                        <div id="particles" />
                        <div id="wrap">
                            <div id="alert-image-wrap">
                                <div id="alert-image" style={{ backgroundImage: 'url("' + subImg + '")' }}><img style={{ height: '1px', opacity: 0, width: '1px' }} src={subImg} /></div>
                            </div>
                            <div id="alert-text-wrap">
                                <div id="alert-text">
                                    <div id="alert-message" style={{ fontSize: '26px', color: 'rgb(255, 255, 255)', fontFamily: '"Josefin Sans"', fontWeight: 800 }}>
                                        你 ♂&nbsp;
                            <span data-token="name" style={{ color: 'rgb(119, 207, 245)', position: 'relative' }}><span><span className="animated-letter">
                                            {username}
                                        </span></span></span>
                                &nbsp;♂ 爸
                                </div>
                                    <div id="alert-user-message" style={{ fontWeight: 800, fontSize: '26px', color: 'rgb(255, 255, 255)', fontFamily: '"Josefin Sans"' }}>
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

export default Sub;