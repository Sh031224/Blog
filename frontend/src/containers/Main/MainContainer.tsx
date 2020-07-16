import { inject, observer } from "mobx-react";
import React, { useEffect, useRef, useState } from "react";
import Main from "../../components/Main";
import CategoryStore from "../../stores/CategoryStore";
import UserStore from "../../stores/UserStore";
import AdminCategoryContainer from "../Admin/AdminCategoryContainer";

interface MainContainerProps {
  store?: StoreType;
}

interface StoreType {
  CategoryStore: CategoryStore;
  UserStore: UserStore;
}

const MainContainer = ({ store }: MainContainerProps) => {
  const { total_post, categoryList, handleCategoryList } = store!.CategoryStore;
  const { admin } = store!.UserStore;

  const [categoryEdit, setCategoryEdit] = useState(false);

  const arrowToggleEl = useRef<HTMLElement>(null);
  const categoryRowEl = useRef<HTMLElement>(null);

  useEffect(() => {
    handleCategoryList();
  }, []);

  return (
    <>
      <Main
        categoryRowEl={categoryRowEl}
        arrowToggleEl={arrowToggleEl}
        categoryList={categoryList}
        total_post={total_post}
        setCategoryEdit={setCategoryEdit}
        admin={admin}
      />
      {admin && categoryEdit && <AdminCategoryContainer />}
    </>
  );
};

export default inject("store")(observer(MainContainer));
