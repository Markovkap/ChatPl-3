import React from "react";
import axios from "axios";
import "./styles.css";
import * as translations from "./translations.json";
import * as db from "./database.json";

const API = axios.create({
  baseURL: "https://665gz.sse.codesandbox.io/v1/",
  timeout: 3000
});

// const urlRegexp = /(([a-z]+:\/\/)?(([a-z0-9\-]+\.)+([a-z]{2}|aero|arpa|biz|com|coop|edu|gov|info|int|jobs|mil|museum|name|nato|net|org|pro|travel|local|internal))(:[0-9]{1,5})?(\/[a-z0-9_\-\.~]+)*(\/([a-z0-9_\-\.]*)(\?[a-z0-9+_\-\.%=&amp;]*)?)?(#[a-zA-Z0-9!$&'()*+.=-_~:@/?]*)?)(\s+|$)/gi.replace(
//   urlRegexp,
//   (match) => `<a href="${match}">${match}</a>`
// );

function Message(props) {
  return (
    <p>
      {props.name}: {props.message}
    </p>
  );
}

export default class Chat extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      lang: "ru",
      message: "",
      password: "",
      nick: "",
      chat: [],
      logIn: false,
      user: null,
      error: false
    };
  }
  sendMassage(event) {
    event.preventDefault();

    if (this.state.message.trim() === "") {
      return;
    }
    let chat = this.state.chat.slice();
    chat.unshift({
      id: Date.now(),
      name: this.state.user,
      message: this.state.message
    });
    this.setState(
      {
        chat
      },
      () => this.clearMessage()
    );
  }
  componentDidMount() {
    this.setState({
      chat: db.chat
    });
  }

  checkLogIn() {
    if (this.state.nick.trim() === "" || this.state.password.trim() === "") {
      this.setState({
        error: true
      });
      return;
    }

    API.post("login", {
      username: this.state.nick,
      password: this.state.password
    })
      .then((response) => {
        if (response.data.success) {
          this.setState({
            error: false,
            logIn: true,
            user: response.data.user.username
          });
        } else {
          this.setState({
            error: true
          });
        }
      })
      .catch((error) => console.log(error));
  }
  clearMessage() {
    this.setState({
      message: ""
    });
  }
  changeLanguage(event) {
    this.setState({
      lang: event.target.value
    });
  }
  chengeMessage(event) {
    this.setState({
      message: event.target.value
    });
  }
  chengePassword(event) {
    this.setState({
      password: event.target.value
    });
  }
  chengeNick(event) {
    this.setState({
      nick: event.target.value
    });
  }
  render() {
    return (
      <div className="center">
        <select
          onChange={(event) => this.changeLanguage(event)}
          value={this.state.lang}
        >
          <option value="ru">Руский</option>
          <option value="ua">Українська</option>
          <option value="en">English</option>
        </select>
        <h1>{translations[this.state.lang].header}</h1>
        {this.state.logIn ? (
          <>
            {" "}
            <h3>
              {translations[this.state.lang].welcome}, {this.state.user}!
            </h3>
            <form onSubmit={(event) => this.sendMassage(event)}>
              <textarea
                value={this.state.message}
                onChange={(event) => this.chengeMessage(event)}
                placeholder={translations[this.state.lang].messagePlaceholder}
              ></textarea>
              <button type="submit">
                {translations[this.state.lang].submitButton}
              </button>
            </form>
            <div class="chat">
              {this.state.chat.map((item) => (
                <Message
                  key={item.id}
                  name={item.name}
                  message={item.message}
                />
              ))}
            </div>
          </>
        ) : (
          <>
            <input
              value={this.state.nick}
              type="nick"
              onChange={(event) => this.chengeNick(event)}
              placeholder={translations[this.state.lang].nickPlaceholder}
            ></input>
            <input
              value={this.state.password}
              type="password"
              onChange={(event) => this.chengePassword(event)}
              placeholder={translations[this.state.lang].passwordPlaceholder}
            ></input>
            <button onClick={() => this.checkLogIn()}>
              {translations[this.state.lang].logInButton}
            </button>
            {this.state.error && (
              <p className="error">Возникла ошибка с ником или паролем</p>
            )}
          </>
        )}
        {/* <p>{translations[this.state.lang].desc}</p> */}
      </div>
    );
  }
}
