import React from "react";
import "./feed.css";
import thumbnail1 from "../../assets/thumbnail1.png";
import thumbnail2 from "../../assets/thumbnail2.png";
import thumbnail3 from "../../assets/thumbnail3.png";
import thumbnail4 from "../../assets/thumbnail4.png";
import thumbnail5 from "../../assets/thumbnail5.png";
import thumbnail6 from "../../assets/thumbnail6.png";
import thumbnail7 from "../../assets/thumbnail7.png";
import thumbnail8 from "../../assets/thumbnail8.png";
import { Link } from "react-router-dom";

const feed = () => {
  return (
    <div className="feed">
      <Link to="/Video/1/3434" className="card-link">
        <div className="card">
          <img src={thumbnail1} alt="Best channel to learn coding" />
          <h2>
            Best channel to learn coding that help you to be a web developer
          </h2>
          <p1>Greatstack</p1>
          <p>15k views &bull; 2 days ago</p>
        </div>
      </Link>
      <div className="card">
        <img src={thumbnail2} alt="thumbnail2" />
        <h2>
          Best channel to learn coding that help you to be a web developer
        </h2>
        <p1>Greatstack</p1>
        <p>15k views &bull; 2 days ago</p>
      </div>
      <div className="card">
        <img src={thumbnail3} alt="thumbnail3" />
        <h2>
          Best channel to learn coding that help you to be a web developer
        </h2>
        <p1>Greatstack</p1>
        <p>15k views &bull; 2 days ago</p>
      </div>
      <div className="card">
        <img src={thumbnail4} alt="thumbnail4" />
        <h2>
          Best channel to learn coding that help you to be a web developer
        </h2>
        <p1>Greatstack</p1>
        <p>15k views &bull; 2 days ago</p>
      </div>
      <div className="card">
        <img src={thumbnail5} alt="thumbnail5" />
        <h2>
          Best channel to learn coding that help you to be a web developer
        </h2>
        <p1>Greatstack</p1>
        <p>15k views &bull; 2 days ago</p>
      </div>
      <div className="card">
        <img src={thumbnail6} alt="thumbnail6" />
        <h2>
          Best channel to learn coding that help you to be a web developer
        </h2>
        <p1>Greatstack</p1>
        <p>15k views &bull; 2 days ago</p>
      </div>
      <div className="card">
        <img src={thumbnail7} alt="thumbnail7" />
        <h2>
          Best channel to learn coding that help you to be a web developer
        </h2>
        <p1>Greatstack</p1>
        <p>15k views &bull; 2 days ago</p>
      </div>
      <div className="card">
        <img src={thumbnail8} alt="thumbnail8" />
        <h2>
          Best channel to learn coding that help you to be a web developer
        </h2>
        <p1>Greatstack</p1>
        <p>15k views &bull; 2 days ago</p>
      </div>
    </div>
  );
};

export default feed;
