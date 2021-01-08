import React, { useEffect, useState } from "react";
import axios from "axios";
import "./styles.css";
import * as translations from "./translations.json";
// import * as db from "./database.json";

const API = axios.create({
  baseURL: "https://665gz.sse.codesandbox.io/v1/",
  timeout: 10000
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
  const [chat, setChat] = useState(null);
  const [isLogged, setIsLogged] = useState(false);
  const [user, setUser] = useState(null);
  const [isError, setIsError] = useState(false);
  const [isNeedToClear, setIsNeedToClear] = useState(false);
  const [isAdmin, setIsAdmin] = useState(false);
  const [isSignUp, setIsSignUp] = useState(false);
  const [token, setToken] = useState(null);
  const [chatId, setChatId] = useState(null);
  const [isLockButtons, setIsLockButtons] = useState(false);

  useEffect(() => {
    if (isNeedToClear) {
      clearMessage();
    }
  }, [isNeedToClear]);

  const sendMessage = (event) => {
    event.preventDefault();

    if (message.trim() === "") {
      return;
    }

    setIsLockButtons(true);

    API.post(
      "chats/" + chatId,
      { data: { content: message } },
      {
        headers: { Authorization: `Bearer ${token}` }
      }
    )
      .then((response) => {
        if (response.data.success) {
          getAndSetMessages(chatId, token, (response) => {
            setChat(transformMessages(response.data.chat.messages));
            setIsNeedToClear(true);
          });
        } else {
          setIsError(true);
        }

        setIsLockButtons(false);
      })
      .catch((error) => {
        console.log(error);
        setIsLockButtons(false);
      });
  };

  const transformMessages = (messages) =>
    messages
      .map((message) => ({
        id: message._id,
        name: message.sender.username,
        message: message.content
      }))
      .reverse();

  const getAndSetMessages = (chatId, token, callback, args = []) => {
    API.get("chats/" + chatId, {
      headers: { Authorization: `Bearer ${token}` }
    })
      .then((response) => {
        if (response.data.success) {
          callback(response, ...args);
        } else {
          setIsError(true);
        }
      })
      .catch((error) => console.log(error));
  };

  const clearMessage = () => {
    setMessage("");
    setIsNeedToClear(false);
  };

  const checkLogIn = () => {
    if (username.trim() === "" || password.trim() === "") {
      setIsError(true);
      return;
    }

    setIsLockButtons(true);

    API.post("login", {
      username,
      password
    })
      .then((response) => {
        if (response.data.success) {
          const isAdmin = response.data.user.isAdmin;
          const username = response.data.user.username;
          const token = response.data.token;

          console.log(response.data);

          setToken(token);

          API.get("chats/my", {
            headers: { Authorization: `Bearer ${token}` }
          })
            .then((response) => {
              if (response.data.success) {
                const chaid = response.data.chats[0]._id;
                setChatId(chaid);

                getAndSetMessages(
                  chaid,
                  token,
                  (response, username, isAdmin) => {
                    setIsError(false);
                    setIsLogged(true);
                    setUser(username);
                    setPassword("");
                    setIsAdmin(isAdmin);
                    setChat(transformMessages(response.data.chat.messages));
                  },
                  [username, isAdmin]
                );
              } else {
                setIsError(true);
              }

              setIsLockButtons(false);
            })
            .catch((error) => {
              console.log(error);
              setIsLockButtons(false);
            });
        } else {
          setIsError(true);
          setIsLockButtons(false);
        }
      })
      .catch((error) => {
        console.log(error);
        setIsLockButtons(false);
      });
  };

  const logout = () => {
    API.get("logout")
      .then((response) => {
        if (response.data.success) {
          setIsLogged(false);
          setChat(null);
          setToken(null);
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

  const addUserForm = (event) => {
    setIsSignUp(true);
  };

  return (
    <div className="center">
      <div className="top-panel">
        <div className="top-panel-left">
          <SelectLanguage lang={lang} onChange={changeLanguage} />
          {isLogged && <LogOutButton lang={lang} onClick={logout} />}
        </div>
        <div className="top-panel-right">
          {isLogged && isAdmin && (
            <CreateUserButton lang={lang} onClick={addUserForm} />
          )}
        </div>
      </div>
      <h1>{translations[lang].header}</h1>
      <div>
        {isSignUp && (
          <AddUser
            setIsSignUp={setIsSignUp}
            lang={lang}
            createUser={createUser}
            chatId={chatId}
          />
        )}
      </div>
      {isLogged && chat !== null ? (
        <ChatBlock
          userNickname={username}
          lang={lang}
          onSubmit={sendMessage}
          onChange={changeMessage}
          chatHistory={chat}
          message={message}
          username={user}
          disabled={isLockButtons}
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
          disabled={isLockButtons}
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
      <button disabled={props.disabled} onClick={() => props.onSubmit()}>
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
        <button disabled={props.disabled} type="submit">
          {translations[props.lang].submitButton}
        </button>
      </form>
      <div className="chat">
        {props.chatHistory.map((item) => (
          <Message
            key={item.id}
            name={item.name}
            username={props.userNickname}
            message={item.message}
            lang={props.lang}
          />
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

function CreateUserButton(props) {
  return (
    <button onClick={() => props.onClick()}>
      {translations[props.lang].signUp}
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

function createUser(event, chatId, setIsSignUp) {
  event.preventDefault(event);

  const fields = event.target.querySelectorAll("input");
  const button = event.target.querySelector("button");
  const data = {};

  for (const input of fields) {
    let value = input.value;
    if (input.type === "checkbox") {
      value = input.checked;
    }
    data[input.name] = value;
  }

  button.disabled = true;

  API.post("signup", data)
    .then((response) => {
      button.disabled = false;
      if (response.data.success) {
        //сделать переводы для всех текстов которые показываются на сайте
        API.get(`chats/${chatId}/join/${response.data.user._id}`)
          .then((response) => {
            if (response.data.success) {
              alert("User created and added to chat");
            } else {
              alert("User doesn't added to chat, but he is created");
            }
          })
          .catch((error) => console.log(error));
      } else {
        alert("User doesn't created");
      }
      setIsSignUp(false);
    })
    .catch((error) => {
      button.disabled = true;
      console.log(error);
    });
}

function AddUser(props) {
  return (
    <>
      <hr />
      <h2>{translations[props.lang].adduser}</h2>
      <form
        onSubmit={(event) =>
          props.createUser(event, props.chatId, props.setIsSignUp)
        }
      >
        <div>
          <input
            placeholder={translations[props.lang].nickPlaceholder}
            name="username"
            type="text"
          />
        </div>
        <div>
          <input
            placeholder={translations[props.lang].passwordPlaceholder}
            name="password"
            type="text"
          />
        </div>
        <div>
          <label>
            {" "}
            <input name="isAdmin" type="checkbox" />
            {translations[props.lang].isadmin}
          </label>
        </div>
        <div>
          <button type="submit">{translations[props.lang].create}</button>
        </div>
      </form>
      <hr />
    </>
  );
}

function Message(props) {
  return (
    <p>
      {props.username === props.name
        ? translations[props.lang].your
        : props.name}
      : {props.message}
    </p>
  );
}
