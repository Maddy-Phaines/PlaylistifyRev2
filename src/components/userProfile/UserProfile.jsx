import React, { useState, useEffect } from "react";
import { currentToken } from "../../services/auth";
import Panel from "../panel/Panel";
import styles from "./UserProfile.module.css";
import Avatar from "react-avatar";

const UserProfile = ({ userProfile }) => {
  if (!userProfile) return <p>Profile loading...</p>;
  return (
    <Panel className={`${styles.profilePanel} ${styles.flex}`}>
      <div className={styles.flex}>
        <Avatar
          name={userProfile.display_name || "User"}
          src={userProfile.images?.[0]?.url}
          size="100"
          round={true}
        />
      </div>
      <h2>{userProfile.display_name}</h2>
      <p>{userProfile.email}</p>
      <p>{userProfile.country}</p>
      <p>{userProfile.followers.total}</p>
    </Panel>
  );
};

export default UserProfile;
