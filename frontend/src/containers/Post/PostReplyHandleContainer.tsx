import React, { useCallback, useState } from "react";
import PostReplyItem from "../../components/Post/PostReply/PostReplyItem";

interface PostReplyHandleContainerProps {
  userId: number;
  admin: boolean;
  reply: ReplyType;
  login: boolean;
  modifyReply: (reply_idx: number, content: string) => Promise<void>;
  deleteReply: (reply_idx: number) => void;
}

interface ReplyType {
  idx: number;
  content: string;
  is_private: boolean;
  fk_user_idx: number | undefined;
  fk_user_name: string | undefined;
  fk_comment_idx: number;
  created_at: Date;
  updated_at: Date;
}

const PostReplyHandleContainer = ({
  userId,
  admin,
  reply,
  login,
  modifyReply,
  deleteReply
}: PostReplyHandleContainerProps) => {
  const [modify, setModify] = useState<boolean>(false);
  const [modifyInput, setModifyInput] = useState<string>(reply.content);

  const cancelModify = useCallback(() => {
    setModify(false);
    setModifyInput(reply.content);
  }, [reply]);

  return (
    <>
      <PostReplyItem
        setModifyInput={setModifyInput}
        modifyInput={modifyInput}
        modifyReply={modifyReply}
        deleteReply={deleteReply}
        modify={modify}
        setModify={setModify}
        cancelModify={cancelModify}
        reply={reply}
        admin={admin}
        userId={userId}
        login={login}
      />
    </>
  );
};

export default PostReplyHandleContainer;
