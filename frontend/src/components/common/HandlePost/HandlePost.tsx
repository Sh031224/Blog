import React from "react";
import PostLoading from "../../Post/PostLoading";
import "./HandlePost.scss";
import HandlePostCategory from "./HandlePostCategory";
import HandlePostContent from "./HandlePostContent";
import HandlePostHeader from "./HandlePostHeader";
import HandlePostThumbnail from "./HandlePostThumbnail";

interface HandlePostProps {
  categoryList: CategoryType[];
  edit: boolean;
  loading: boolean;
  title: string;
  setTitle: React.Dispatch<React.SetStateAction<string>>;
  description: string;
  setDescription: React.Dispatch<React.SetStateAction<string>>;
  content: string;
  setContent: React.Dispatch<React.SetStateAction<string>>;
  categoryIdx: number;
  setCategoryIdx: React.Dispatch<React.SetStateAction<number>>;
  thumbnail: string;
  setThumbnail: React.Dispatch<React.SetStateAction<string>>;
  isUpload: boolean;
  setIsUpload: React.Dispatch<React.SetStateAction<boolean>>;
  setFiles: React.Dispatch<React.SetStateAction<File[]>>;
  uploadFilesCallback: (files: File[]) => Promise<void>;
  textAreaRef: React.RefObject<HTMLTextAreaElement>;
}

interface CategoryType {
  idx: number;
  name: string;
  post_count: number;
}

const HandlePost = ({
  categoryList,
  edit,
  loading,
  title,
  setTitle,
  description,
  setDescription,
  content,
  setContent,
  categoryIdx,
  setCategoryIdx,
  thumbnail,
  setThumbnail,
  isUpload,
  setIsUpload,
  setFiles,
  uploadFilesCallback,
  textAreaRef
}: HandlePostProps) => {
  return (
    <div className="handle-post">
      <div className="handle-post-box">
        {loading ? (
          <PostLoading />
        ) : (
          <>
            <HandlePostHeader />
            <div className="handle-post-box-util">
              <HandlePostThumbnail
                thumbnail={thumbnail}
                setThumbnail={setThumbnail}
              />
              <HandlePostCategory
                categoryList={categoryList}
                categoryIdx={categoryIdx}
                setCategoryIdx={setCategoryIdx}
              />
            </div>
            <HandlePostContent
              textAreaRef={textAreaRef}
              content={content}
              setContent={setContent}
              setFiles={setFiles}
              isUpload={isUpload}
              setIsUpload={setIsUpload}
              uploadFilesCallback={uploadFilesCallback}
            />
          </>
        )}
      </div>
    </div>
  );
};

export default HandlePost;
