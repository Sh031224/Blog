import { Response } from "express";
import AuthRequest from "../../../../type/AuthRequest";
import { getRepository } from "typeorm";
import { validateCreate } from "../../../../lib/validation/reply";
import logger from "../../../../lib/logger";
import User from "../../../../entity/User";
import Comment from "../../../../entity/Comment";
import Reply from "../../../../entity/Reply";
import Post from "../../../../entity/Post";

export default async (req: AuthRequest, res: Response) => {
  if (!validateCreate(req, res)) return;

  const user: User = req.user;
  type RequestBody = {
    content: string;
    comment_idx: number;
    is_private: boolean;
  };

  const data: RequestBody = req.body;

  try {
    const commentRepo = getRepository(Comment);
    const comment: Comment = await commentRepo.findOne({
      where: {
        idx: data.comment_idx
      }
    });

    if (!comment) {
      logger.yellow("[POST] 댓글 없음.");
      res.status(404).json({
        status: 404,
        message: "댓글 없음."
      });
      return;
    }

    const replyRepo = getRepository(Reply);
    const reply = new Reply();

    if (comment.is_private) {
      if (comment.fk_user_idx !== user.idx && (!user || !user.is_admin)) {
        logger.yellow("[POST] 권한 없음.");
        res.status(403).json({
          status: 403,
          message: "권한 없음."
        });
        return;
      }
      reply.is_private = true;
    } else {
      reply.is_private = data.is_private;
    }

    reply.content = data.content;
    reply.user = user;
    reply.comment = comment;
    await replyRepo.save(reply);

    logger.green("[POST] 답글 생성 성공.");
    res.status(200).json({
      status: 200,
      message: "답글 생성 성공."
    });
  } catch (err) {
    logger.red("답글 생성 서버 오류.", err.message);
    res.status(500).json({
      status: 500,
      message: "서버 오류."
    });
  }
};
