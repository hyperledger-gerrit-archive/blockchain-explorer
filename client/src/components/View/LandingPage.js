import React, { Component } from 'react';
import Slider from 'react-slick';
class LandingPage extends Component {
    constructor(props) {
        super(props);
        this.state = {
            settings :{
                dots: false,
                infinite: true,
                autoplay: true,
                autoplaySpeed:2000,
                pauseOnHover: false,
                accessibility: false,
                speed: 500,
                slidesToShow: 1,
                slidesToScroll: 1
            }
        }
    }
    render() {
        return (
            <div className="landing" >
                <h1>PREPARING EXPLORER</h1>
                <Slider {...this.state.settings}>
                    <div><h3>ACCESSING THE NETWORK</h3></div>
                    <div><h3>CONNECTING TO CHANNEL</h3></div>
                    <div><h3>LOADING BLOCKS</h3></div>
                </Slider>
            </div>
        );
    }
}

export default LandingPage;
