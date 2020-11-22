import React, { useState } from "react";
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

export default function Chat(props) {
  const [lang, setLang] = useState("ru");
  const [message, setMessage] = useState("");
  const [password, setPassword] = useState("");
  const [username, setUsername] = useState("");
  const [chat, setChat] = useState(db.chat);
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [isError, setIsError] = useState(false);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message.trim() === "") {
      return;
    }

    let chatCopy = chat.slice();
    chatCopy.unshift({
      id: Date.now(),
      name: user,
      message
    });
    setChat(chatCopy); //здесь нужно очищать сообщения!!!!!!!!!!!!!
  };

  const clearMessage = () => {
    setMessage("");
  };

  const checkLogIn = () => {
    if (username.trim() === "" || password.trim() === "") {
      setIsError(true);
      return;
    }
    API.post("login", {
      username,
      password
    })
      .then((response) => {
        if (response.data.success) {
          setIsError(false);
          setIsLogged(true);
          setUser(response.data.user.username);
          setPassword("");
        } else {
          setIsError(true);
        }
      })
      .catch((error) => console.log(error));
  };

  const logout = () => {
    API.get("logout")
      .then((response) => {
        if (response.data.success) {
          setIsLogged(false);
        } else {
          setIsError(true);
        }
      })
      .catch((error) => console.log(error));
  };

  const changeLanguage = (event) => {
    setLang(event.target.value);
  };

  const changeMessage = (event) => {
    setMessage(event.target.value);
  };

  const changePassword = (event) => {
    setPassword(event.target.value);
  };

  const changeUsername = (event) => {
    setUsername(event.target.value);
  };

  return (
    <div className="center">
      <SelectLanguage lang={lang} onChange={changeLanguage} />
      {isLogged && <LogOutButton lang={lang} onClick={logout} />}
      <h1>{translations[lang].header}</h1>
      {isLogged ? (
        <ChatBlock
          lang={lang}
          onSubmit={sendMessage}
          onChange={changeMessage}
          chatHistory={chat}
          message={message}
          username={user}
        />
      ) : (
        <LoginBlock
          lang={lang}
          username={username}
          password={password}
          onSubmit={checkLogIn}
          changeUsername={changeUsername}
          changePassword={changePassword}
          error={isError}
        />
      )}
    </div>
  );
}

function LoginBlock(props) {
  return (
    <div className="login-block">
      <input
        value={props.username}
        type="text"
        onChange={(event) => props.changeUsername(event)}
        placeholder={translations[props.lang].nickPlaceholder}
      ></input>
      <input
        value={props.password}
        type="password"
        onChange={(event) => props.changePassword(event)}
        placeholder={translations[props.lang].passwordPlaceholder}
      ></input>
      <button onClick={() => props.onSubmit()}>
        {translations[props.lang].logInButton}
      </button>
      {props.error && (
        <p className="error">Возникла ошибка с ником или паролем</p>
      )}
    </div>
  );
}

function ChatBlock(props) {
  return (
    <div className="chat-block">
      <h3>
        {translations[props.lang].welcome}, {props.username}!
      </h3>
      <form onSubmit={(event) => props.onSubmit(event)}>
        <textarea
          value={props.message}
          onChange={(event) => props.onChange(event)}
          placeholder={translations[props.lang].messagePlaceholder}
        ></textarea>
        <button type="submit">{translations[props.lang].submitButton}</button>
      </form>
      <div className="chat">
        {props.chatHistory.map((item) => (
          <Message key={item.id} name={item.name} message={item.message} />
        ))}
      </div>
    </div>
  );
}

function LogOutButton(props) {
  return (
    <button onClick={() => props.onClick()}>
      {translations[props.lang].logoutbutton}
    </button>
  );
}

function SelectLanguage(props) {
  return (
    <select onChange={(event) => props.onChange(event)} value={props.lang}>
      <option value="ru">Руский</option>
      <option value="ua">Українська</option>
      <option value="en">English</option>
    </select>
  );
}

function Message(props) {
  return (
    <p>
      {props.name}: {props.message}
    </p>
  );
}

// export default class Chat extends React.Component {
//   constructor(props) {
//     super(props);
//     this.state = {
//       lang: "ru",
//       message: "",
//       password: "",
//       nick: "",
//       chat: [],
//       logIn: false,
//       user: null,
//       error: false
//     };
//   }
//   sendMassage(event) {
//     event.preventDefault();

//     if (this.state.message.trim() === "") {
//       return;
//     }
//     let chat = this.state.chat.slice();
//     chat.unshift({
//       id: Date.now(),
//       name: this.state.user,
//       message: this.state.message
//     });
//     this.setState(
//       {
//         chat
//       },
//       () => this.clearMessage()
//     );
//   }

//   componentDidMount() {
//     this.setState({
//       chat: db.chat
//     });
//   }

//   checkLogIn() {
//     if (this.state.nick.trim() === "" || this.state.password.trim() === "") {
//       this.setState({
//         error: true
//       });
//       return;
//     }
//     API.post("login", {
//       username: this.state.nick,
//       password: this.state.password
//     })
//       .then((response) => {
//         if (response.data.success) {
//           this.setState({
//             error: false,
//             logIn: true,
//             user: response.data.user.username,
//             password: ""
//           });
//         } else {
//           this.setState({
//             error: true
//           });
//         }
//       })
//       .catch((error) => console.log(error));
//   }
//   logout() {
//     API.get("logout")
//       .then((response) => {
//         if (response.data.success) {
//           this.setState({
//             logIn: false
//           });
//         } else {
//           this.setState({
//             error: true
//           });
//         }
//       })
//       .catch((error) => console.log(error));
//   }
//   clearMessage() {
//     this.setState({
//       message: ""
//     });
//   }
//   renderLogOut() {
//     return this.state.logIn ? (
//       <>
//         <button onClick={() => this.logout()}>
//           {translations[this.state.lang].logoutbutton}
//         </button>
//       </>
//     ) : null;
//   }
//   changeLanguage(event) {
//     this.setState({
//       lang: event.target.value
//     });
//   }
//   chengeMessage(event) {
//     this.setState({
//       message: event.target.value
//     });
//   }
//   chengePassword(event) {
//     this.setState({
//       password: event.target.value
//     });
//   }
//   chengeNick(event) {
//     this.setState({
//       nick: event.target.value
//     });
//   }
//   render() {
//     return (
//       <div className="center">
//         <select
//           onChange={(event) => this.changeLanguage(event)}
//           value={this.state.lang}
//         >
//           <option value="ru">Руский</option>
//           <option value="ua">Українська</option>
//           <option value="en">English</option>
//         </select>
//         {this.renderLogOut()}
//         <h1>{translations[this.state.lang].header}</h1>
//         {this.state.logIn ? (
//           <>
//             {" "}
//             <h3>
//               {translations[this.state.lang].welcome}, {this.state.user}!
//             </h3>
//             <form onSubmit={(event) => this.sendMassage(event)}>
//               <textarea
//                 value={this.state.message}
//                 onChange={(event) => this.chengeMessage(event)}
//                 placeholder={translations[this.state.lang].messagePlaceholder}
//               ></textarea>
//               <button type="submit">
//                 {translations[this.state.lang].submitButton}
//               </button>
//             </form>
//             <div className="chat">
//               {this.state.chat.map((item) => (
//                 <Message
//                   key={item.id}
//                   name={item.name}
//                   message={item.message}
//                 />
//               ))}
//             </div>
//           </>
//         ) : (
//           <>
//             <input
//               value={this.state.nick}
//               type="nick"
//               onChange={(event) => this.chengeNick(event)}
//               placeholder={translations[this.state.lang].nickPlaceholder}
//             ></input>
//             <input
//               value={this.state.password}
//               type="password"
//               onChange={(event) => this.chengePassword(event)}
//               placeholder={translations[this.state.lang].passwordPlaceholder}
//             ></input>
//             <button onClick={() => this.checkLogIn()}>
//               {translations[this.state.lang].logInButton}
//             </button>
//             {this.state.error && (
//               <p className="error">Возникла ошибка с ником или паролем</p>
//             )}
//           </>
//         )}
//         {/* <p>{translations[this.state.lang].desc}</p> */}
//       </div>
//     );
//   }
// }
