import React, { Component } from 'react';
import parse from 'html-react-parser';
import './Donation.css';

class Donation extends Component {

    render() {
        const { username, donationAmount, message} = this.props;
        return (
            <div>
                <div id="widget" className="widget-AlertBox" data-layout="banner">
                    <div id="alert-box">
                        <div id="particles" className="hidden" />
                        <div id="wrap">
                        <div id="alert-image-wrap">
                            <div id="alert-image" style={{backgroundImage: 'url("https://uploads.twitchalerts.com/000/047/281/189/250208.gif")'}}><img style={{height: '1px', opacity: 0, width: '1px'}} src="https://uploads.twitchalerts.com/000/047/281/189/250208.gif" /></div>
                        </div>
                        <div id="alert-text-wrap">
                            <div id="alert-text">
                            <div id="alert-message" style={{fontSize: '26px', color: 'rgb(255, 255, 255)', fontFamily: '"Josefin Sans"', fontWeight: 800}}>
                                <span data-token="name" style={{color: 'rgb(252, 255, 125)', position: 'relative'}}><span><span className="animated-letter">
                                    {username}
                                </span></span></span>
                                    [
                                <span data-token="amount" style={{color: 'rgb(252, 255, 125)', position: 'relative'}}><span><span className="animated-letter">
                                    {donationAmount}
                                </span></span></span>
                                    ] 
                                </div>
                                <div id="alert-user-message" style={{fontWeight: 700, fontSize: '28px', color: 'rgb(255, 255, 255)', fontFamily: '"Josefin Sans"'}}>
                                    {message}
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

export default Donation;