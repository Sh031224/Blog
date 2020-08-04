import { inject, observer } from "mobx-react";
import React, { useCallback, useEffect, useState, SetStateAction } from "react";
import { RouteComponentProps, useHistory, withRouter } from "react-router-dom";
import PostStore from "../../stores/PostStore";
import CommentStore from "../../stores/CommentStore";
import UserStore from "../../stores/UserStore";
import Post from "../../components/Post";
import { Helmet } from "react-helmet-async";
import { useCookies } from "react-cookie";
import CommentApi from "../../assets/api/Comment";
import axios from "axios";
import { NotificationManager } from "react-notifications";

interface PostContainerProps extends RouteComponentProps<MatchType> {
  store?: StoreType;
}

interface StoreType {
  PostStore: PostStore;
  CommentStore: CommentStore;
  UserStore: UserStore;
}

interface MatchType {
  idx: string;
}

interface PostParmsType {
  page: number;
  limit: number;
  order?: string;
  category?: number;
}

interface PostInfoType {
  idx: number;
  title: string;
  description: string;
  content: string;
  view: number;
  is_temp: boolean;
  fk_category_idx: number | null;
  thumbnail: string | null;
  created_at: Date;
  updated_at: Date;
  comment_count: number;
}

interface PostCommentResponse {
  status: number;
  message: string;
}

const PostContainer = ({ match, store }: PostContainerProps) => {
  const history = useHistory();
  const { idx } = match.params;

  const [cookies, setCookie, removeCookie] = useCookies(["access_token"]);

  const { getPostInfo, hit_posts, handleHitPosts } = store!.PostStore;
  const { getComments, comments, getReplies } = store!.CommentStore;
  const {
    handleUser,
    admin,
    login,
    userId,
    handleLoginChange
  } = store!.UserStore;

  const [loading, setLoading] = useState(false);
  const [post_info, setPostInfo] = useState<
    PostInfoType | SetStateAction<PostInfoType | any>
  >({});

  useEffect(() => {
    axios.defaults.headers.common["access_token"] = cookies.access_token;
    if (cookies.access_token !== undefined) {
      handleLoginChange(true);
      handleUser(cookies.access_token);
    } else {
      handleLoginChange(false);
      handleUser(cookies.access_token);
    }
    getAllContent();
  }, [idx, login]);

  const getPostInfoCallback = useCallback(
    async (idx: number) => {
      await getPostInfo(idx).then((response: any) => {
        setPostInfo(response.data.post);
      });
    },
    [idx]
  );

  const getCommentsCallback = useCallback(
    async (post_idx: number) => {
      await getComments(post_idx);
    },
    [idx, post_info]
  );

  const getHitPostsCallback = useCallback(async () => {
    const query: PostParmsType = {
      page: 1,
      limit: 5,
      order: "hit"
    };
    await handleHitPosts(query);
  }, [idx]);

  const getAllContent = async () => {
    setLoading(true);
    axios.defaults.headers.common["access_token"] = cookies.access_token;
    try {
      await getHitPostsCallback();
      await getPostInfoCallback(Number(idx));
      await getCommentsCallback(Number(idx));
      setLoading(false);
    } catch (err) {
      if (err.message === "Error: Request failed with status code 404") {
        NotificationManager.warning("해당 게시글이 없습니다.", "Error");
        history.push("/");
      } else {
        NotificationManager.error("오류가 발생하였습니다.", "Error");
      }
    }
  };

  const modifyComment = async (comment_idx: number, content: string) => {
    try {
      axios.defaults.headers.common["access_token"] = cookies.access_token;
      await CommentApi.ModifyComment(comment_idx, content).then(
        (res: PostCommentResponse) => {
          if (res.status === 200) {
            NotificationManager.success("댓글을 수정하였습니다.", "Success");
          }
        }
      );
      await getAllContent();
    } catch (err) {
      if (err.message === "Error: Request failed with status code 401") {
        NotificationManager.warning("권한이 없습니다.", "Error");
      } else if (err.message === "Error: Request failed with status code 410") {
        removeCookie("access_token", { path: "/" });
        NotificationManager.warning("로그인 시간이 만료되었습니다.", "Error");
      } else {
        NotificationManager.error("오류가 발생하였습니다.", "Error");
      }
    }
  };

  const deleteComment = async (comment_idx: number) => {
    try {
      axios.defaults.headers.common["access_token"] = cookies.access_token;
      await CommentApi.DeleteComment(comment_idx).then(
        (res: PostCommentResponse) => {
          if (res.status === 200) {
            NotificationManager.success("댓글을 삭제하였습니다.", "Success");
          }
        }
      );
      await getAllContent();
    } catch (err) {
      if (err.message === "Error: Request failed with status code 401") {
        NotificationManager.warning("권한이 없습니다.", "Error");
      } else if (err.message === "Error: Request failed with status code 410") {
        removeCookie("access_token", { path: "/" });
        NotificationManager.warning("로그인 시간이 만료되었습니다.", "Error");
      } else {
        NotificationManager.error("오류가 발생하였습니다.", "Error");
      }
    }
  };

  const createComment = async (
    post_idx: number,
    content: string,
    is_private?: boolean
  ) => {
    try {
      axios.defaults.headers.common["access_token"] = cookies.access_token;
      await CommentApi.CreateComment(post_idx, content, is_private);
      await getAllContent();
    } catch (err) {
      if (err.message === "Error: Request failed with status code 401") {
        NotificationManager.warning("로그인 후 작성가능합니다.", "Error");
      } else if (err.message === "Error: Request failed with status code 410") {
        removeCookie("access_token", { path: "/" });
        NotificationManager.warning("로그인 시간이 만료되었습니다.", "Error");
      } else {
        NotificationManager.error("오류가 발생하였습니다.", "Error");
      }
    }
  };

  return (
    <>
      <Helmet
        title={post_info.title}
        meta={[
          { property: "og:type", content: "article" },
          {
            property: "og:title",
            content: `${post_info.description}`
          },
          { property: "og:image", content: `${post_info.thumbnail}` },
          {
            property: "og:url",
            content: `http://example.com/post/${post_info.idx}`
          }
        ]}
      />
      <Post
        modifyComment={modifyComment}
        deleteComment={deleteComment}
        userId={userId}
        getReplies={getReplies}
        createComment={createComment}
        admin={admin}
        login={login}
        loading={loading}
        comments={comments}
        post={post_info}
        hit_posts={hit_posts}
      />
    </>
  );
};

export default inject("store")(observer(withRouter(PostContainer)));
