import React, { Dispatch, MutableRefObject, SetStateAction } from "react";
import { MdExpandMore } from "react-icons/md";
import MainCategoryItem from "./MainCategoryItem";
import MainCategoryRowItem from "./MainCategoryRowItem";
import { FiEdit3 } from "react-icons/fi";
import "./MainCategory.scss";

interface MainCategoryProps {
  categoryList: CategoryType[];
  total_post: number;
  arrowToggleEl: MutableRefObject<any>;
  categoryRowEl: MutableRefObject<any>;
  setCategoryEdit: Dispatch<SetStateAction<boolean>>;
  admin: boolean;
}

interface CategoryType {
  idx: number;
  name: string;
  post_count: number;
}

const MainCategory = ({
  categoryList,
  total_post,
  arrowToggleEl,
  categoryRowEl,
  setCategoryEdit,
  admin
}: MainCategoryProps) => {
  const total_view = {
    idx: 0,
    name: "전체 보기",
    post_count: total_post
  };

  const arrowToggle = () => {
    arrowToggleEl.current.classList.toggle("main-category-arrow-toggle");
    categoryRowEl.current.classList.toggle("main-category-row-view");
  };

  return (
    <>
      <div className="main-category">
        <div className="main-category-title">
          목록 보기
          {admin && (
            <span
              onClick={() => setCategoryEdit(true)}
              className="main-category-edit"
            >
              <FiEdit3 />
            </span>
          )}
        </div>
        <MainCategoryItem item={total_view} />
        {categoryList.map((category: CategoryType) => {
          return <MainCategoryItem key={category.idx} item={category} />;
        })}
      </div>
      <div
        onClick={arrowToggle}
        ref={arrowToggleEl}
        className="main-category-arrow"
      >
        <MdExpandMore />
      </div>

      <div ref={categoryRowEl} className="main-category-row">
        <MainCategoryRowItem item={total_view} />
        {categoryList.map((category: CategoryType) => {
          return <MainCategoryRowItem item={category} key={category.idx} />;
        })}
        {admin && (
          <div
            onClick={() => setCategoryEdit(true)}
            className="main-category-row-edit main-category-row-item"
          >
            <FiEdit3 />
          </div>
        )}
      </div>
    </>
  );
};

export default MainCategory;
