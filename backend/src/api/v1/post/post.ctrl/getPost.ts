import { Response, Request } from "express";
import * as moment from "moment";
import { getRepository } from "typeorm";
import logger from "../../../../lib/logger";
import Post from "../../../../entity/Post";
import generateURL from "../../../../lib/util/generateURL";
import PostView from "../../../../entity/PostView";
import encrypt from "../../../../lib/encrypt";

export default async (req: Request, res: Response) => {
  const idx: number = Number(req.params.idx);

  if (isNaN(idx)) {
    logger.yellow("[GET] 검증 오류.", "idx is NaN");
    res.status(400).json({
      message: "검증 오류."
    });
    return;
  }

  try {
    const postRepo = getRepository(Post);
    const post: Post = await postRepo.findOne({
      where: {
        idx
      }
    });

    if (!post) {
      logger.yellow("[GET] 글 없음");
      res.status(404).json({
        message: "글 없음."
      });
      return;
    }

    let ip = req.headers["x-forwarded-for"] || req.connection.remoteAddress;
    if (Array.isArray(ip)) {
      ip = ip[0];
    }

    const encryptedIp = encrypt(ip);
    const postViewRepo = getRepository(PostView);

    const viewed = await postViewRepo.findOne({
      where: {
        ip: encryptedIp,
        fk_post_idx: post.idx
      },
      order: {
        created_at: "DESC"
      }
    });

    const currentTime = moment();

    if (
      !viewed ||
      (viewed && currentTime.diff(moment(viewed.created_at), "minutes") > 90)
    ) {
      post.view += 1;
      await postRepo.save(post);

      const postView = new PostView();
      postView.ip = encryptedIp;
      postView.post = post;
      postViewRepo.save(postView);
    }

    if (post.thumbnail) {
      post.thumbnail = generateURL(req, post.idx, post.thumbnail);
    }

    logger.green("[GET] 글 조회 성공.");
    res.status(200).json({
      message: "글 조회 성공.",
      data: {
        post
      }
    });
    return;
  } catch (err) {
    logger.red("[GET] 글 조회 서버 오류.", err);
    res.status(500).json({
      message: "서버 오류."
    });
  }
};