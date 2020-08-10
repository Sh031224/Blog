import React, { useEffect, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import CategoryStore from "../../stores/CategoryStore";
import PostStore from "../../stores/PostStore";
import UserStore from "../../stores/UserStore";
import { NotificationManager } from "react-notifications";
import { inject, observer } from "mobx-react";
import Create from "../../components/Create";

interface CreateContainerProps {
  store?: StoreType;
}

interface StoreType {
  CategoryStore: CategoryStore;
  UserStore: UserStore;
  PostStore: PostStore;
}

const CreateContainer = ({ store }: CreateContainerProps) => {
  const { categoryList, handleCategoryList } = store!.CategoryStore;
  const { handleUser, admin, login, handleLoginChange } = store!.UserStore;

  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);

  const [source, setSource] = useState<string>("");

  useEffect(() => {
    try {
      axios.defaults.headers.common["access_token"] = cookies.access_token;
      if (cookies.access_token !== undefined) {
        handleLoginChange(true);
        handleUser(cookies.access_token).catch((err) => {
          if (err.message === "401") {
            removeCookie("access_token", { path: "/" });
            handleLoginChange(false);
            axios.defaults.headers.common["access_token"] = "";
          }
        });
      } else {
        handleLoginChange(false);
      }
    } catch (err) {
      NotificationManager.error("오류가 발생하였습니다.", "Error");
    }
  }, [login]);

  useEffect(() => {
    handleCategoryList().catch((err) => {
      NotificationManager.error("오류가 발생하였습니다.", "Error");
    });
  }, []);

  return (
    <>
      <Create source={source} setSource={setSource} />
    </>
  );
};

export default inject("store")(observer(CreateContainer));
