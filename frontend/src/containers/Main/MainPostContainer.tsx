import { inject, observer } from "mobx-react";
import React, { useCallback, useEffect, useState } from "react";
import { useLocation } from "react-router-dom";
import MainPosts from "../../components/Main/MainPosts";
import PostStore from "../../stores/PostStore";

interface MainPostContainerProps {
  store?: StoreType;
}

interface StoreType {
  PostStore: PostStore;
}

const MainPostContainer = ({ store }: MainPostContainerProps) => {
  interface PostParmsType {
    page: number;
    limit: number;
    order?: string;
    category?: number;
  }

  const { search } = useLocation();
  const [page, setPage] = useState(1);
  const [loading, setLoading] = useState(true);

  let total = 0;

  const { posts, handlePosts } = store!.PostStore;

  const query: PostParmsType = {
    page: page,
    limit: 20
  };

  const infiniteScroll = () => {
    const scrollHeight = Math.max(
      document.documentElement.scrollHeight,
      document.body.scrollHeight
    );
    const scrollTop = Math.max(
      document.documentElement.scrollTop,
      document.body.scrollTop
    );
    const clientHeight = document.documentElement.clientHeight;

    if (scrollTop + clientHeight === scrollHeight) {
      if (total) {
        if (total > posts.length) {
          setPage(page + 1);
        }
      }
    }
  };

  const handlePostsCallback = useCallback(async (query: PostParmsType) => {
    await handlePosts(query)
      .then((res: any) => {
        total = res.data.total;
        setLoading(false);
      })
      .catch((error: Error) => {
        return error;
      });
  }, []);

  useEffect(() => {
    window.addEventListener("scroll", infiniteScroll);
  }, []);

  useEffect(() => {
    setPage(1);
  }, [search]);

  useEffect(() => {
    setLoading(true);
    const tab = Number(search.replace("?tab=", ""));

    if (tab) {
      query.category = tab;
    } else {
      delete query.category;
    }

    handlePostsCallback(query).catch(() => alert("서버가 불안정합니다."));
  }, [page, search]);

  return (
    <>
      <MainPosts
        page={page}
        setPage={setPage}
        posts={posts}
        loading={loading}
      />
    </>
  );
};

export default inject("store")(observer(MainPostContainer));
