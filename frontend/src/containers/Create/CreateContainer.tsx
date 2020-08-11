import React, { useCallback, useEffect, useRef, useState } from "react";
import axios from "axios";
import { useCookies } from "react-cookie";
import CategoryStore from "../../stores/CategoryStore";
import PostStore from "../../stores/PostStore";
import UserStore from "../../stores/UserStore";
import { NotificationManager } from "react-notifications";
import { inject, observer } from "mobx-react";
import { useHistory } from "react-router-dom";
import HandlePost from "../../components/common/HandlePost";

interface CreateContainerProps {
  store?: StoreType;
}

interface StoreType {
  CategoryStore: CategoryStore;
  UserStore: UserStore;
  PostStore: PostStore;
}

interface GetProfileResponse {
  status: number;
  message: string;
  data: {
    user: {
      idx: number;
      name: string;
      is_admin: boolean;
      created_at: Date;
    };
  };
}

interface UploadFilesResponse {
  status: number;
  message: string;
  data: {
    files: string[];
  };
}

const CreateContainer = ({ store }: CreateContainerProps) => {
  const { categoryList, handleCategoryList } = store!.CategoryStore;
  const { handleUser, login, handleLoginChange } = store!.UserStore;
  const { uploadFiles } = store!.PostStore;

  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);

  const textAreaRef = useRef<HTMLTextAreaElement>(null);

  const [title, setTitle] = useState<string>("");
  const [description, setDescription] = useState<string>("");
  const [content, setContent] = useState<string>("");
  const [categoryIdx, setCategoryIdx] = useState<number>(-1);
  const [thumbnail, setThumbnail] = useState<string>("");
  const [isUpload, setIsUpload] = useState<boolean>(false);
  const [files, setFiles] = useState<File[]>([]);

  const history = useHistory();

  const uploadFilesCallback = useCallback(
    async (files: File[]) => {
      await uploadFiles(files)
        .then((res: UploadFilesResponse) => {
          setContent(`${content}\n![image](${res.data.files[0]})`);
          setIsUpload(false);
          NotificationManager.success("사진이 업로드 되었습니다.", "Success");
        })
        .catch((err: Error) => {
          NotificationManager.error("오류가 발생하였습니다.", "Error");
        });
    },
    [files]
  );

  const validateAdmin = () => {
    try {
      axios.defaults.headers.common["access_token"] = cookies.access_token;
      if (cookies.access_token !== undefined) {
        handleLoginChange(true);
        handleUser(cookies.access_token)
          .then((res: GetProfileResponse) => {
            if (!res.data.user.is_admin) {
              history.push("/");
            }
          })
          .catch((err) => {
            if (err.message === "401") {
              removeCookie("access_token", { path: "/" });
              handleLoginChange(false);
              axios.defaults.headers.common["access_token"] = "";
            }
          });
      } else {
        history.push("/");
        handleLoginChange(false);
      }
    } catch (err) {
      NotificationManager.error("오류가 발생하였습니다.", "Error");
    }
  };

  useEffect(() => {
    validateAdmin();
  }, [login]);

  useEffect(() => {
    handleCategoryList().catch((err) => {
      NotificationManager.error("오류가 발생하였습니다.", "Error");
    });
  }, []);

  return (
    <>
      <HandlePost
        edit={false}
        loading={false}
        title={title}
        setTitle={setTitle}
        description={description}
        setDescription={setDescription}
        content={content}
        setContent={setContent}
        categoryIdx={categoryIdx}
        setCategoryIdx={setCategoryIdx}
        thumbnail={thumbnail}
        setThumbnail={setThumbnail}
        isUpload={isUpload}
        setIsUpload={setIsUpload}
        setFiles={setFiles}
        uploadFilesCallback={uploadFilesCallback}
        textAreaRef={textAreaRef}
      />
    </>
  );
};

export default inject("store")(observer(CreateContainer));
