import { inject, observer } from "mobx-react";
import React, { useCallback, useEffect, useRef, useState } from "react";
import Main from "../../components/Main";
import CategoryStore from "../../stores/CategoryStore";
import PostStore from "../../stores/PostStore";
import UserStore from "../../stores/UserStore";
import AdminCategoryContainer from "../Admin/AdminCategoryContainer";
import { useHistory, useLocation } from "react-router-dom";
import { NotificationManager } from "react-notifications";
import Privacy from "../../components/Privacy";
import { Helmet } from "react-helmet-async";
import logo from "../../assets/images/op_img.png";

interface MainContainerProps {
  store?: StoreType;
}

interface StoreType {
  CategoryStore: CategoryStore;
  UserStore: UserStore;
  PostStore: PostStore;
}

const MainContainer = ({ store }: MainContainerProps) => {
  const {
    total_post,
    categoryList,
    handleCategoryList,
    modifyOrderCategory,
    modifyCategoryName,
    deleteCategory,
    createCategory
  } = store!.CategoryStore;
  const { admin } = store!.UserStore;
  const {
    posts,
    handlePosts,
    initPosts,
    getPostLength,
    handlePostSearch,
    handleTempPosts
  } = store!.PostStore;

  interface PostParmsType {
    page: number;
    limit: number;
    order?: string;
    category?: number;
  }

  const { search } = useLocation();
  const history = useHistory();

  const [categoryEdit, setCategoryEdit] = useState<boolean>(false);
  const [loading, setLoading] = useState<boolean>(true);
  const [notfound, setNotfound] = useState<boolean>(true);
  const [privacy, setPrivacy] = useState<boolean>(false);
  const [page, setPage] = useState<number>(1);
  const [total, setTotal] = useState<number>(0);

  const arrowToggleEl = useRef<HTMLElement>(null);
  const categoryRowEl = useRef<HTMLElement>(null);
  const lastCardEl = useRef<HTMLDivElement | null>(null);

  const intersectionObserver = new IntersectionObserver((entries, observer) => {
    const lastCard = entries[0];

    if (
      search.indexOf("search=") === -1 &&
      !loading &&
      getPostLength() < total
    ) {
      if (lastCard.intersectionRatio > 0 && lastCardEl.current) {
        observer.unobserve(lastCard.target);
        lastCardEl.current = null;
        setTimeout(() => {
          setPage(page + 1);
        }, 100);
      }
    }
  });

  const handleCategoryListCallback = useCallback(() => {
    if (categoryList.length === 0) {
      handleCategoryList().catch(() =>
        NotificationManager.error("오류가 발생하였습니다.", "Error")
      );
    }
  }, []);

  useEffect(() => {
    handleCategoryListCallback();
  }, [handleCategoryListCallback]);

  useEffect(() => {
    if (search.indexOf("temp") !== 1) {
      handlePostsCallback().catch(() => {
        NotificationManager.error("오류가 발생하였습니다.", "Error");
      });
    }
  }, [page]);

  useEffect(() => {
    if (lastCardEl.current) {
      intersectionObserver.observe(lastCardEl.current);
    }
  });

  const handlePostSearchCallback = useCallback(async () => {
    setLoading(true);
    setNotfound(true);
    const query = search.replace("?search=", "");

    await handlePostSearch(query)
      .then((res: any) => {
        setLoading(false);
        if (res.data.posts.length > 0) {
          setNotfound(false);
        }
      })
      .catch((error: Error) => {
        history.push("/");
      });
  }, [search]);

  const handlePostsCallback = useCallback(async () => {
    setLoading(true);
    const query: PostParmsType = {
      page: page,
      limit: 20
    };
    const tab = Number(search.replace("?tab=", ""));
    if (tab) {
      query.category = tab;
    } else {
      delete query.category;
    }
    await handlePosts(query)
      .then((res: any) => {
        setTotal(res.data.total);
        setLoading(false);
        if (res.data.posts.length > 0) {
          setNotfound(false);
        }
      })
      .catch((error: Error) => {
        history.push("/");
      });
  }, [search, page]);

  const createPost = () => {
    history.push("/handle/new");
  };

  const handleTempPostsCallback = useCallback(async () => {
    setLoading(true);
    await handleTempPosts()
      .then(() => {
        setLoading(false);
        if (getPostLength() > 0) {
          setNotfound(false);
        }
      })
      .catch((error: Error) => {
        console.log(error);
      });
  }, []);

  const handleQueryCallbacks = useCallback(() => {
    setPrivacy(false);
    initPosts();
    setNotfound(true);
    if (search.indexOf("tab=") !== -1 || search === "") {
      if (page === 1) {
        handlePostsCallback().catch(() => {
          NotificationManager.error("오류가 발생하였습니다.", "Error");
        });
      } else {
        setPage(1);
      }
    } else if (search.indexOf("temp") !== -1) {
      handleTempPostsCallback();
    } else if (search.indexOf("privacy") !== -1) {
      setPrivacy(true);
    } else if (search.indexOf("code=") !== -1) {
      history.push("/");
    } else {
      handlePostSearchCallback().catch(() => {
        NotificationManager.error("오류가 발생하였습니다.", "Error");
      });
    }
  }, [search, page]);

  useEffect(() => {
    handleQueryCallbacks();
  }, [search]);

  return (
    <>
      <Helmet>
        <title>{"Slog"}</title>
        <meta
          name="description"
          content="📖 My Blog that contains various articles such as my activities and thoughts."
          data-react-helmet="true"
        />
        <meta property="og:image" content={logo} data-react-helmet="true" />
      </Helmet>
      {privacy ? (
        <Privacy />
      ) : (
        <>
          <Main
            createPost={createPost}
            lastCardEl={lastCardEl}
            notfound={notfound}
            loading={loading}
            getPostLength={getPostLength}
            posts={posts}
            categoryRowEl={categoryRowEl}
            arrowToggleEl={arrowToggleEl}
            categoryList={categoryList}
            total_post={total_post}
            setCategoryEdit={setCategoryEdit}
            admin={admin}
          />
          {admin && categoryEdit && (
            <AdminCategoryContainer
              createCategory={createCategory}
              deleteCategory={deleteCategory}
              modifyCategoryName={modifyCategoryName}
              modifyOrderCategory={modifyOrderCategory}
              setCategoryEdit={setCategoryEdit}
              categoryList={categoryList}
              handleCategoryList={handleCategoryList}
              handlePosts={handlePosts}
            />
          )}
        </>
      )}
    </>
  );
};

export default inject("store")(observer(MainContainer));
