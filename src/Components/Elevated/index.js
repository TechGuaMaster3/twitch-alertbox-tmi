import React, {Component} from "react";
import parse from "html-react-parser";
import "./Elevated.css";

class Elevated extends Component {
  render() {
    const colorlist = {
      15000: {price: "#00f593", bg: "#016b40"},
      30000: {price: "#a3c2ff", bg: "#1345aa"},
      75000: {price: "#ff8280", bg: "#6e0e0c"},
      150000: {price: "#ff75e6", bg: "#8a0f73"},
      300000: {
        price: "#ffd37a",
        bg: "linear-gradient(to bottom, #8a0f73, #6e0e0c)",
      },
    };
    let priceResult = 15000
    const {badge, username, color, price, message, length} = this.props;
    if (parseInt(price) >= 300000 ) { priceResult = 300000 }
    if (parseInt(price) >= 150000 && parseInt(price) < 300000) { priceResult = 150000 }
    if (parseInt(price) >= 75000 && parseInt(price) < 150000) { priceResult = 75000 }
    if (parseInt(price) >= 30000 && parseInt(price) < 75000) { priceResult = 30000 }
    if (parseInt(price) >= 1 && parseInt(price) < 30000) { priceResult = 15000 }
    return (
      <div
        className="bg"
        style={{
          background: colorlist[priceResult].bg,
          position: "relative",
          borderRadius: "5px",
        }}
      >
        <div
          className="name-block"
          style={{
            position: "absolute",
            top: "-2rem",
            left: "0.7rem",
            backgroundColor: "#fff",
            boxShadow: "-0.25rem 0.5rem 0 #848494",
            borderRadius: "8px",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
            }}
          >
            {badge}
            <span
              className="user"
              style={{color: color ? color : colorlist[priceResult].price}}
            >
              {username}
            </span>
            <span
              className="price"
              style={{backgroundColor: colorlist[priceResult].price}}
            >
              ${parseInt(price) / 100}
            </span>
          </div>
        </div>
        <div className={`msg ${length > 150 ? "msg-small" : "msg-big"}`}>
          {parse(message)}
        </div>
      </div>
    );
  }
}

export default Elevated;
