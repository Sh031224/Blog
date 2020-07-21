import React from "react";
import "./PostHeader.scss";
import TimeCalc from "../../../util/lib/TimeCalc";

interface PostHeaderProps {
  title: string;
  created_at: Date;
  updated_at: Date;
}

const PostHeader = ({ title, created_at, updated_at }: PostHeaderProps) => {
  return (
    <div className="post-header">
      <h1 className="post-header-title">{title}</h1>
      <span className="post-header-date">
        <span
          title={TimeCalc.getTime(created_at)}
          className="post-header-date-time"
        >
          {TimeCalc.calc(created_at)}
        </span>
        {TimeCalc.checkModify(created_at, updated_at) && (
          <>
            <span className="post-header-comma">·</span>
            <span>수정됨</span>
          </>
        )}
      </span>
    </div>
  );
};

export default PostHeader;
