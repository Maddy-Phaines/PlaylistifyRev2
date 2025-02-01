import React from "react";
import styles from "./Login.module.css";

const Login = ({ onHandleLogin }) => {
  return (
    <div className={styles.container}>
      <button onClick={onHandleLogin} className={styles.login}>
        Login to Spotify
      </button>
    </div>
  );
};

export default Login;
